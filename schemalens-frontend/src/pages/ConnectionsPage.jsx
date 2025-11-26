// src/pages/ConnectionsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConnectionsPage.css";

import DBNameModal from "../components/DBNameModal";

/**
 * ConnectionsPage.jsx
 * - Lists saved connection profiles
 * - Create new profiles
 * - Trigger schema discovery using saved profiles
 *
 * Works with Vite (import.meta.env.VITE_BACKEND_URL) and CRA (process.env.REACT_APP_BACKEND_URL)
 * Falls back to http://localhost:8000
 */

/* Helper: normalize backend export path -> ensure forward slashes and leading slash */
function normalizeExportPath(p) {
  if (!p) return null;
  // replace backslashes with forward slashes
  let path = p.replace(/\\/g, "/");
  // remove duplicate leading slashes then add single leading slash
  path = "/" + path.replace(/^\/+/, "");
  return path;
}

// Map db_type -> backend discovery endpoint
function getDiscoveryEndpoint(dbType) {
  switch (dbType) {
    case "mysql":
      return "/api/schema/mysql";
    case "mongodb":
      return "/api/schema/mongo";
    case "postgres":
      return "/api/schema/postgres";
    case "sqlite":
      return "/api/schema/sqlite";
    default:
      // fallback
      return "/api/schema/mysql";
  }
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // modal state for MongoDB db_name
  const [mongoModalOpen, setMongoModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);

  // form state
  const [name, setName] = useState("");
  const [dbType, setDbType] = useState("mysql");
  const [connString, setConnString] = useState("");

  // discovery status map (connectionId -> { loading, lastSchema, error, export_path })
  const [discoverStatus, setDiscoverStatus] = useState({});

  // SAFE universal environment variable loader (no runtime errors)
  const BACKEND_BASE =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_BACKEND_URL) ||
    (typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_BACKEND_URL) ||
    "http://localhost:8000";

  useEffect(() => {
    fetchConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConnections() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/connections/`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchConnections error:", err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    if (!name || !dbType || !connString) {
      setError("Please fill all fields");
      return;
    }
    try {
      const payload = { name, db_type: dbType, connection_string: connString };
      console.log("Creating connection:", payload);
      const res = await fetch(`${BACKEND_BASE}/api/connections/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text}`);
      }
      const saved = await res.json();
      // prepend to list
      setConnections((c) => [saved, ...c]);
      setName("");
      setConnString("");
      setDbType("mysql");
    } catch (err) {
      console.error("handleCreate error:", err);
      setError(String(err.message || err));
    }
  }

  // 🔥 Delete a saved connection
  async function handleDelete(conn) {
    if (!conn?.id) return;
    const yes = window.confirm(
      `Delete connection "${conn.name}" (${conn.db_type})?`
    );
    if (!yes) return;

    try {
      const res = await fetch(`${BACKEND_BASE}/api/connections/${conn.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed (${res.status}): ${txt}`);
      }
      // Remove from local state
      setConnections((prev) => prev.filter((c) => c.id !== conn.id));
      // Clean any discovery status
      setDiscoverStatus((prev) => {
        const copy = { ...prev };
        delete copy[conn.id];
        return copy;
      });
    } catch (err) {
      console.error("handleDelete error:", err);
      setError(`Delete failed: ${err.message || err}`);
    }
  }

  // runDiscovery handles the actual POST to backend for all DB types
  async function runDiscovery(body, conn) {
    const id = conn.id;
    setDiscoverStatus((s) => ({
      ...s,
      [id]: { loading: true, lastSchema: null, error: null },
    }));
    try {
      const endpoint = getDiscoveryEndpoint(conn.db_type);
      console.log("Running discovery", endpoint, body);
      const res = await fetch(`${BACKEND_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // try parse JSON safely
      let payload = null;
      try {
        payload = await res.json();
      } catch (e) {
        // If response is not JSON, preserve text for debugging
        const txt = await res.text();
        console.warn("Non-JSON discovery response:", txt);
        throw new Error(txt || `Status ${res.status}`);
      }

      if (!res.ok) {
        const detail =
          payload?.detail || payload?.error || `Status ${res.status}`;
        throw new Error(detail);
      }

      // normalize export_path before saving
      const normalizedPath = normalizeExportPath(payload?.export_path);

      setDiscoverStatus((s) => ({
        ...s,
        [id]: {
          loading: false,
          lastSchema: payload?.schema ?? null,
          error: null,
          export_path: normalizedPath ?? null,
        },
      }));

      // If backend returned export_path, navigate to visualization and pass URL in state
      if (normalizedPath) {
        navigate("/", {
          state: { schemaUrl: `${BACKEND_BASE}${normalizedPath}` },
        });
      }
    } catch (err) {
      console.error("runDiscovery error:", err);
      setDiscoverStatus((s) => ({
        ...s,
        [id]: {
          loading: false,
          lastSchema: null,
          error: String(err.message || err),
        },
      }));
    }
  }

  // handleDiscover opens Mongo modal if needed, otherwise runs discovery immediately
  function handleDiscover(conn) {
    if (conn.db_type === "mongodb") {
      setPendingConnection(conn);
      setMongoModalOpen(true);
      return;
    }
    // mysql, postgres, sqlite
    runDiscovery({ connection_id: conn.id }, conn);
  }

  // called when modal submits db_name
  function handleMongoSubmit(dbName) {
    const conn = pendingConnection;
    if (!conn) return;
    setMongoModalOpen(false);
    setPendingConnection(null);
    runDiscovery({ connection_id: conn.id, db_name: dbName }, conn);
  }

  function renderConnRow(conn) {
    const status = discoverStatus[conn.id] || {};
    const exportPath = status?.export_path ? status.export_path : null; // already normalized in state
    return (
      <div key={conn.id} className="connection-card">
        <div className="connection-info">
          <div className="connection-name">
            {conn.name}{" "}
            <span className="connection-type">({conn.db_type})</span>
          </div>
          <div className="connection-string">{conn.connection_string}</div>
        </div>

        <div className="connection-actions">
          <button
            className="btn btn-blue-sm"
            onClick={() => handleDiscover(conn)}
            disabled={status?.loading}
          >
            {status?.loading ? "Discovering..." : "Discover"}
          </button>

          <button
            className="btn btn-red-sm"
            onClick={() => handleDelete(conn)}
            style={{ marginLeft: "8px" }}
          >
            Delete
          </button>

          {status?.error && (
            <div className="error-text" style={{ fontSize: "12px" }}>
              {status.error}
            </div>
          )}

          {exportPath && (
            <a
              className="json-link"
              href={`${BACKEND_BASE}${exportPath}`}
              target="_blank"
              rel="noreferrer"
            >
              Open exported JSON
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="connections-page">
      <h2 className="connections-title">Connection Profiles</h2>

      {/* Create form */}
      <form onSubmit={handleCreate} className="connections-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Profile name (eg. local mysql)"
          className="connections-input"
        />

        <select
          value={dbType}
          onChange={(e) => setDbType(e.target.value)}
          className="connections-select"
        >
          <option value="mysql">MySQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="postgres">Postgres</option>
          <option value="sqlite">SQLite</option>
        </select>

        <input
          value={connString}
          onChange={(e) => setConnString(e.target.value)}
          placeholder="Connection string"
          className="connections-input"
        />

        <div style={{ gridColumn: "1 / span 3", display: "flex", gap: "10px" }}>
          <button type="submit" className="btn btn-green">
            Save profile
          </button>
          <button
            type="button"
            onClick={fetchConnections}
            className="btn btn-gray"
          >
            Refresh
          </button>
        </div>
      </form>

      {error && <div className="error-text">{error}</div>}
      {loading && <div className="loading-text">Loading connections...</div>}

      <div className="space-y-3">
        {connections.length === 0 && (
          <div className="loading-text">No connections saved yet.</div>
        )}
        {connections.map(renderConnRow)}
      </div>

      <div className="tip-text">
        Tip: For MongoDB discovery you may need to provide <code>db_name</code>{" "}
        when triggering discovery — this UI will ask you for it in a modal.
      </div>

      {/* DB Name Modal for MongoDB discovery */}
      <DBNameModal
        isOpen={mongoModalOpen}
        onClose={() => {
          setMongoModalOpen(false);
          setPendingConnection(null);
        }}
        onSubmit={handleMongoSubmit}
      />
    </div>
  );
}
