import React, { useEffect, useState } from "react";
import "./ConnectionsPage.css";
import { useNavigate } from "react-router-dom";

export default function ConnectionsPage() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [dbType, setDbType] = useState("mysql");
  const [mode, setMode] = useState("local");
  const [config, setConfig] = useState({});
  const [editingId, setEditingId] = useState(null); // ✅ NEW
  const [loadingId, setLoadingId] = useState(null);

  const BACKEND = "http://localhost:8000";

  useEffect(() => {
    fetchConnections();
  }, []);

  async function fetchConnections() {
    try {
      const res = await fetch(`${BACKEND}/api/connections/`);
      const data = await res.json();
      setConnections(data);
    } catch {
      setError("Failed to load connections");
    }
  }

  function handleChange(e) {
    setConfig({ ...config, [e.target.name]: e.target.value });
  }

  async function testConnection() {
    const res = await fetch(`${BACKEND}/api/test-connection/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db_type: dbType, config }),
    });

    const data = await res.json();
    alert(data.status === "success" ? "✅ Connected" : data.message);
  }

  // ✅ SAVE / UPDATE
  async function saveConnection() {
    const payload = {
      name,
      db_type: dbType,
      mode,
      config,
    };

    if (editingId) {
      // UPDATE
      await fetch(`${BACKEND}/api/connections/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // CREATE
      await fetch(`${BACKEND}/api/connections/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchConnections();
  }

  // ✅ DELETE
  async function deleteConnection(id) {
    if (!window.confirm("Delete this connection?")) return;

    await fetch(`${BACKEND}/api/connections/${id}`, {
      method: "DELETE",
    });

    fetchConnections();
  }

  // ✅ EDIT (LOAD INTO FORM)
  function editConnection(conn) {
    setEditingId(conn.id);
    setName(conn.name);
    setDbType(conn.db_type);
    setMode(conn.mode);
    setConfig(conn.config);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setConfig({});
  }

  // ✅ DISCOVER
  async function discover(conn) {
  try {
    setLoadingId(conn.id); // ✅ FIX

    const res = await fetch(`${BACKEND}/api/schema/discover/${conn.id}`, {
      method: "POST",
    });
    console.log("conn.id:", conn.id, typeof conn.id);

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    navigate("/visualization", {
      state: {
        schema: data,
        dbType: conn.db_type,   // ✅ FIX
        connectionId: conn.id,  // ✅ FIX
      },
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingId(null);
  }
}

  return (
    <div className="connections-page">
      <h2 className="connections-title">
        {editingId ? "Edit Connection" : "Connection Profiles"}
      </h2>

      {/* ===== FORM ===== */}
      <div className="add-connection-container">
        <div className="add-connection-top">
          <select value={dbType} onChange={(e) => setDbType(e.target.value)}>
            <option value="mysql">MySQL</option>
            <option value="mongodb">MongoDB</option>
          </select>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="local">Local</option>
            <option value="cloud">Cloud</option>
          </select>
        </div>

        <div className="add-connection-form">
          <input
            placeholder="Connection Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* MYSQL */}
          {dbType === "mysql" && mode === "local" && (
            <div className="form-row">
              <input
                name="host"
                placeholder="Host"
                onChange={handleChange}
                value={config.host || ""}
              />
              <input
                name="port"
                placeholder="Port"
                onChange={handleChange}
                value={config.port || ""}
              />
              <input
                name="username"
                placeholder="Username"
                onChange={handleChange}
                value={config.username || ""}
              />
              <input
                name="password"
                placeholder="Password"
                onChange={handleChange}
                value={config.password || ""}
              />
              <input
                name="database"
                placeholder="Database"
                onChange={handleChange}
                value={config.database || ""}
              />
            </div>
          )}

          {/* MONGO LOCAL */}
          {dbType === "mongodb" && mode === "local" && (
            <div className="form-row">
              <input
                name="host"
                placeholder="Host"
                onChange={handleChange}
                value={config.host || ""}
              />
              <input
                name="port"
                placeholder="Port"
                onChange={handleChange}
                value={config.port || ""}
              />
              <input
                name="database"
                placeholder="Database"
                onChange={handleChange}
                value={config.database || ""}
              />
            </div>
          )}

          {/* MONGO CLOUD */}
          {dbType === "mongodb" && mode === "cloud" && (
            <div className="form-row">
              <input
                name="uri"
                placeholder="Mongo URI"
                onChange={handleChange}
                value={config.uri || ""}
              />
              <input
                name="database"
                placeholder="Database Name"
                onChange={handleChange}
                value={config.database || ""}
              />
            </div>
          )}

          <div className="add-connection-actions">
            <button className="btn btn-test" onClick={testConnection}>
              Test
            </button>

            <button className="btn btn-green" onClick={saveConnection}>
              {editingId ? "Update" : "Save"}
            </button>

            {editingId && (
              <button className="btn btn-gray" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== LIST ===== */}
      <div className="space-y-3">
        {connections.map((c) => (
          <div key={c.id} className="connection-card">
            <div className="connection-info">
              <div className="connection-name">
                {c.name} <span className="connection-type">({c.db_type})</span>
              </div>
              <div className="connection-string">
                {JSON.stringify(c.config)}
              </div>
            </div>

            <div className="connection-actions">
              <button
                className={`btn btn-discover ${loadingId === c.id ? "loading" : ""}`}
                onClick={() => discover(c)}
                disabled={loadingId === c.id}
              >
                {loadingId === c.id ? (
                  <span className="spinner"></span>
                ) : (
                  "Discover"
                )}
              </button>
              <button
                className="btn btn-gray"
                onClick={() => editConnection(c)}
              >
                Edit
              </button>

              <button
                className="btn btn-red-sm"
                onClick={() => deleteConnection(c.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
