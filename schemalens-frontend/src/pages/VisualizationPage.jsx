// src/pages/VisualizationPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import NodeDetails from "../components/NodeDetails";
import SettingsModal from "../components/SettingsModal.jsx"; // <-- Import new component
import mockSchema from "../data/mockSchema.json"; // keep as fallback
import {
  CubeIcon,
  TableCellsIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon, // <-- Import settings icon
} from "@heroicons/react/24/outline";
import "./VisualizationPage.css";

// D3 Style Constants are now managed in state
const INITIAL_SETTINGS = {
  TABLE_COLOR: "#00B4FF",
  TABLE_STROKE: "#0088C0",
  ATTRIBUTE_COLOR: "#00CC99",
  ATTRIBUTE_STROKE: "#008866",
  LINK_COLOR: "#94a3b8",
  TEXT_COLOR: "#dbdbdbff",
  ATTRIBUTE_RADIUS: 120,
  MAX_ACTIVE_TABLES: 3,
  Tnode: 30,
  ANode: 15,
  TRANSITION_DURATION: 350,
};

const BACKEND_SCHEMA_URL = "http://localhost:8000/api/schema/sample"; // change if different

export default function VisualizationPage() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [searchTerm, setSearchTerm] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [graphKey, setGraphKey] = useState(0);

  // --- State for Settings ---
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Schema state (start with local mock as fallback)
  const [schema, setSchema] = useState(mockSchema);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState(null);

  // ... (Refs remain the same) ...
  const graphDataRef = useRef({ nodes: [], links: [] });
  const simRef = useRef(null);
  const selectionsRef = useRef({ g: null, nodeGroup: null, linkGroup: null });
  const zoomRef = useRef(null);
  const activeTablesRef = useRef([]);

  // Fetch schema from backend once on mount
  useEffect(() => {
    let cancelled = false;

    const fetchSchema = async () => {
      setLoadingSchema(true);
      setSchemaError(null);
      try {
        const res = await fetch(BACKEND_SCHEMA_URL, { method: "GET" });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const payload = await res.json();
        // backend returns { status: "ok", schema: {...} }
        const fetched = payload?.schema ?? payload;
        if (!cancelled && fetched && fetched.nodes) {
          setSchema(fetched);
          // bump graphKey to force full re-init of D3 with new data
          setGraphKey((k) => k + 1);
        } else if (!cancelled) {
          throw new Error("Invalid schema structure returned");
        }
      } catch (err) {
        console.error("Failed to fetch schema:", err);
        if (!cancelled) {
          setSchemaError(String(err.message ?? err));
          // keep using local mockSchema (already set by initial state)
        }
      } finally {
        if (!cancelled) setLoadingSchema(false);
      }
    };

    fetchSchema();

    return () => {
      cancelled = true;
    };
  }, []);

  // 1. Resizing Effect (remains the same)
  useEffect(() => {
    const updateDim = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDim();
    window.addEventListener("resize", updateDim);
    return () => window.removeEventListener("resize", updateDim);
  }, []);

  // 2. Simulation Force Update Effect (remains the same)
  useEffect(() => {
    if (simRef.current) {
      const width = Math.max(dimensions.width, 800);
      const height = Math.max(dimensions.height, 600);
      simRef.current.force("center", d3.forceCenter(width / 2, height / 2));
      simRef.current.alpha(0.1).restart();
    }
  }, [dimensions]);

  // 3. Main D3 Initialization Effect
  // *** NOW DEPENDS ON 'settings' and 'schema' ***
  useEffect(() => {
    if (!svgRef.current) return;

    // --- Destructure settings from state ---
    const {
      TABLE_COLOR,
      TABLE_STROKE,
      ATTRIBUTE_COLOR,
      ATTRIBUTE_STROKE,
      LINK_COLOR,
      TEXT_COLOR,
      ATTRIBUTE_RADIUS,
      MAX_ACTIVE_TABLES,
      Tnode,
      ANode,
      TRANSITION_DURATION,
    } = settings;

    const width = Math.max(dimensions.width, 800);
    const height = Math.max(dimensions.height, 600);

    // Initial Data Setup: Use 'expanded' for internal logic consistency
    // Ensure schema exists and has nodes/edges
    const safeNodes = (schema && schema.nodes) ? schema.nodes : [];
    const safeEdges = (schema && schema.edges) ? schema.edges : [];

    graphDataRef.current.nodes = safeNodes.map((n) => ({
      ...n,
      type: "table",
      expanded: n.expanded || false,
    }));
    graphDataRef.current.links = safeEdges.map((e) => ({
      source: graphDataRef.current.nodes.find((n) => n.id === e.source),
      target: graphDataRef.current.nodes.find((n) => n.id === e.target),
    })).filter(l => l.source && l.target);

    let nodes = graphDataRef.current.nodes;
    let links = graphDataRef.current.links;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const g = svg.append("g").attr("class", "viewport");
    selectionsRef.current.g = g;

    // --- Arrowheads (Unified to a single, consistent marker) ---
    const defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", LINK_COLOR); // Use generic link color

    // --- Link Force Definition ---
    const linkForce = d3
      .forceLink(links)
      .id((d) => d.id)
      .distance((d) => (d.target.type === "attribute" ? 40 : Tnode + 150)) // Use Tnode
      .strength(0.5);

    // --- Simulation Setup ---
    const sim = d3
      .forceSimulation(nodes)
      .force("link", linkForce)
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => (d.type === "table" ? Tnode : ANode)) // Use Tnode/ANode
      );

    simRef.current = sim;

    const linkGroup = g
      .append("g")
      .attr("class", "links")
      .attr("stroke", LINK_COLOR)
      .attr("stroke-opacity", 0.6);
    const nodeGroup = g.append("g").attr("class", "nodes");
    selectionsRef.current.linkGroup = linkGroup;
    selectionsRef.current.nodeGroup = nodeGroup;

    // --- drag behavior ---
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // --- Core Graph Update Function (Refactored to handle generic node properties) ---
    function updateGraph(simRestart = false) {
      nodes = graphDataRef.current.nodes;
      links = graphDataRef.current.links;

      // 1. Update Links
      linkGroup
        .selectAll("line")
        .data(links, (d) => d.source.id + "-" + d.target.id)
        .join(
          (enter) => enter.append("line").attr("marker-end", "url(#arrow)"),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr("stroke", (d) =>
          d.target.type === "attribute" ? ATTRIBUTE_COLOR : LINK_COLOR
        );

      // 2. Update Nodes
      nodeGroup
        .selectAll("g")
        .data(nodes, (d) => d.id)
        .join(
          (enter) => {
            const gEnter = enter
              .append("g")
              .call(drag(sim))
              .attr("opacity", 1) // Default visible
              .attr("class", (d) =>
                d.type === "table" ? "table-node" : "attribute-node"
              );

            gEnter
              .append("circle")
              .attr("r", (d) => (d.type === "table" ? Tnode : ANode))
              .attr("fill", (d) =>
                d.type === "table" ? TABLE_COLOR : ATTRIBUTE_COLOR
              )
              .attr("stroke", (d) =>
                d.type === "table" ? TABLE_STROKE : ATTRIBUTE_STROKE
              )
              .attr("stroke-width", 2);

            gEnter
              .append("text")
              .text((d) => d.label)
              .attr("text-anchor", "start")
              .attr("x", (d) => (d.type === "table" ? Tnode + 5 : ANode + 5))
              .attr("y", 6)
              .attr("dy", (d) => (d.type === "table" ? 5 : 4))
              .attr("pointer-events", "none")
              .attr("fill", TEXT_COLOR)
              .style("font-size", (d) => (d.type === "table" ? "14px" : "10px"))
              .style("font-weight", 700);

            // Attributes are created starting at parent location and opacity 0
            gEnter.filter((d) => d.type === "attribute").attr("opacity", 0);

            gEnter.on("click", (event, d) => {
              event.stopPropagation();
              setSelectedNode(d);
            });

            gEnter.on("dblclick", (event, d) => {
              event.stopPropagation();
              if (d.type === "table") {
                d.expanded ? removeAttributes(d) : spawnAttributes(d);
              }
            });

            return gEnter;
          },
          (update) => update,
          (exit) => exit.remove()
        );

      if (simRestart) {
        sim.nodes(nodes);
        sim.force("link").links(links);
        sim.alpha(0.1).restart();
      }
    }

    // --- spawnAttributes() (Integrated and fixed) ---
    function spawnAttributes(tableNode) {
      if (tableNode.expanded) return;
      tableNode.expanded = true;

      // Max active tables logic
      if (!activeTablesRef.current.includes(tableNode)) {
        if (activeTablesRef.current.length >= MAX_ACTIVE_TABLES) {
          const oldest = activeTablesRef.current.shift();
          if (oldest) removeAttributes(oldest);
        }
        activeTablesRef.current.push(tableNode);
      }

      if (!tableNode.columns || tableNode.columns.length === 0) return;
      const angleStep = (2 * Math.PI) / tableNode.columns.length;

      const newAttrs = tableNode.columns.map((col, i) => {
        const angle = i * angleStep;
        const spawnX = tableNode.x || width / 2;
        const spawnY = tableNode.y || height / 2;
        const targetX = spawnX + ATTRIBUTE_RADIUS * Math.cos(angle);
        const targetY = spawnY + ATTRIBUTE_RADIUS * Math.sin(angle);

        return {
          id: `${tableNode.id}_attr_${i}`,
          label: col,
          type: "attribute",
          parentTableId: tableNode.id,
          x: spawnX,
          y: spawnY,
          fx: targetX,
          fy: targetY,
        };
      });

      // Update data and sim
      graphDataRef.current.nodes.push(...newAttrs);
      newAttrs.forEach((attr) => {
        graphDataRef.current.links.push({ source: tableNode, target: attr });
      });

      sim.nodes(graphDataRef.current.nodes);
      sim.force("link").links(graphDataRef.current.links);
      updateGraph(false); // Draw the new nodes at opacity 0

      sim.alpha(0.05).restart();

      // Animate new nodes (attributes)
      nodeGroup
        .selectAll("g.attribute-node")
        .filter((d) => newAttrs.includes(d)) // Select only the newly added attributes
        .transition()
        .duration(TRANSITION_DURATION)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1) // FADE IN
        .attrTween("transform", function (d) {
          const i = d3.interpolate([d.x, d.y], [d.fx, d.fy]);
          return function (t) {
            const [cx, cy] = i(t);
            d.x = cx;
            d.y = cy;
            return `translate(${cx},${cy})`;
          };
        })
        .on("end", function (d) {
          // Release fixed position after animation
          d.fx = null;
          d.fy = null;
          sim.alpha(0.1).restart();
        });
    }

    // --- removeAttributes() (Integrated and fixed) ---
    function removeAttributes(tableNode) {
      if (!tableNode.expanded) return;
      tableNode.expanded = false;

      let nodes = graphDataRef.current.nodes;
      let links = graphDataRef.current.links;

      const attrsToRemove = nodes.filter(
        (n) => n.type === "attribute" && n.parentTableId === tableNode.id
      );

      if (attrsToRemove.length === 0) return;

      tableNode.fx = tableNode.x;
      tableNode.fy = tableNode.y;

      const newLinks = links.filter((l) => !attrsToRemove.includes(l.target));
      graphDataRef.current.links = newLinks;

      // 1. Animate removal of attributes (FADE OUT)
      nodeGroup
        .selectAll("g.attribute-node")
        .filter((d) => attrsToRemove.includes(d))
        .transition()
        .duration(TRANSITION_DURATION)
        .ease(d3.easeCubicIn)
        .attr("opacity", 0) // FADE OUT
        .attrTween("transform", function (d) {
          const i = d3.interpolate([d.x, d.y], [tableNode.x, tableNode.y]);
          return function (t) {
            const [cx, cy] = i(t);
            return `translate(${cx},${cy})`;
          };
        })
        .remove()
        .on("end", (d) => {
          // 2. Remove from data model
          nodes.splice(nodes.indexOf(d), 1);

          // Final cleanup and simulation restart once all attributes are gone
          if (!nodes.some((n) => n.parentTableId === tableNode.id)) {
            const index = activeTablesRef.current.indexOf(tableNode);
            if (index > -1) activeTablesRef.current.splice(index, 1);

            tableNode.fx = null;
            tableNode.fy = null;

            graphDataRef.current.nodes = nodes; // Final node list update
            sim.nodes(nodes);
            sim.force("link").links(newLinks);
            sim.alpha(0.1).restart();
          }
        });

      // 3. Fade out and remove links
      linkGroup
        .selectAll("line")
        .data(newLinks, (d) => d.source.id + "-" + d.target.id)
        .exit()
        .transition()
        .duration(200)
        .attr("stroke-opacity", 0)
        .remove();
    }
    // --- End of D3 Functions ---

    // Initial draw
    updateGraph(true);

    // --- zoom behavior ---
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom).on("dblclick.zoom", null);
    zoomRef.current = zoom;
    svg.on("click", () => setSelectedNode(null));

    sim.on("tick", () => {
      linkGroup
        .selectAll("line")
        .data(graphDataRef.current.links)
        .join("line")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)
        .attr("marker-end", (d) =>
          d.target.type === "attribute" ? "url(#attr-arrow)" : "url(#arrow)"
        );

      nodeGroup
        .selectAll("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [dimensions, graphKey, settings, schema]); // <-- ADD schema HERE

  // 4. Search Filter Effect (remains the same)
  useEffect(() => {
    if (!selectionsRef.current.nodeGroup) return;

    const searchTermLower = searchTerm.toLowerCase();
    selectionsRef.current.nodeGroup
      .selectAll("g")
      .attr("opacity", (d) =>
        searchTermLower
          ? d.label.toLowerCase().includes(searchTermLower)
            ? 1
            : 0.2
          : 1
      );
  }, [searchTerm]);

  const resetView = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
    setSearchTerm("");
    setSelectedNode(null);
    setGraphKey((prevKey) => prevKey + 1);
  };

  // --- Handler for saving settings from modal ---
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };

  // --- React UI Structure (Maintained Original Structure and Classes) ---
  return (
    <div className="page-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-icon-container">
            <CubeIcon className="sidebar-header-icon" />
          </div>
          <div>
            <h1 className="sidebar-header-title">SchemaLens</h1>
            <p className="sidebar-header-subtitle">Database Visualizer</p>
          </div>
        </div>

        <div className="controls-container">
          <div className="search-input-container">
            <MagnifyingGlassIcon className="search-input-icon" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="buttons-container">
            <button onClick={resetView} className="button">
              <ArrowPathIcon className="button-icon" />
              Reset View
            </button>
            {/* --- NEW SETTINGS BUTTON --- */}
            <button onClick={() => setIsSettingsOpen(true)} className="button">
              <Cog6ToothIcon className="button-icon" />
              Settings
            </button>
            <button onClick={() => setSelectedNode(null)} className="button">
              Clear
            </button>
          </div>
        </div>

        <div className="schema-info-container">
          <h4 className="schema-info-header">
            <TableCellsIcon className="schema-info-header-icon" />
            Schema Overview
          </h4>
          <div className="schema-info-row">
            <span className="schema-info-row-label">DB Type</span>
            <strong className="schema-info-row-value-db">
              {schema.db_type}
            </strong>
          </div>
          <div className="schema-info-row">
            <span className="schema-info-row-label">Tables</span>
            <strong className="schema-info-row-value">
              {schema.nodes.length}
            </strong>
          </div>
          <div className="schema-info-row">
            <span className="schema-info-row-label">Relationships</span>
            <strong className="schema-info-row-value">
              {schema.edges.length}
            </strong>
          </div>

          {/* Schema fetch status */}
          <div style={{ marginTop: 8 }}>
            {loadingSchema ? (
              <div className="schema-status">Loading schema...</div>
            ) : schemaError ? (
              <div className="schema-status error">
                Schema load error: {schemaError}
              </div>
            ) : (
              <div className="schema-status ok">Schema loaded</div>
            )}
          </div>
        </div>

        <div className="node-details-section">
          <h4 className="node-details-header-sticky">Selection Details</h4>
          <NodeDetails node={selectedNode} />
        </div>

        <div className="zoom-level">Zoom: {Math.round(zoomLevel * 100)}%</div>
      </aside>

      <div className="main-content" ref={containerRef}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
        <div className="pan-zoom-hint">Scroll to zoom, Drag to pan</div>
      </div>

      {/* --- RENDER THE MODAL --- */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSettings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
