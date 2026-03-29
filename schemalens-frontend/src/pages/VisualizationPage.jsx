// src/pages/VisualizationPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import * as d3 from "d3";
import NodeDetails from "../components/NodeDetails";
import SettingsModal from "../components/SettingsModal.jsx";
import mockSchema from "../data/mockSchema.json";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  CubeIcon,
  TableCellsIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import "./VisualizationPage.css";

// D3 Style Constants are now managed in state
const INITIAL_SETTINGS = {
  TABLE_STROKE: "#c0c0c0",
  ATTRIBUTE_COLOR: "#00CC99",
  ATTRIBUTE_STROKE: "#008866",
  LINK_COLOR: "#94a3b8",
  TEXT_COLOR: "#dbdbdbff",
  ATTRIBUTE_RADIUS: 120,
  MAX_ACTIVE_TABLES: 10,
  Tnode: 30,
  ANode: 15,
  TRANSITION_DURATION: 350,
};

export default function VisualizationPage() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [searchTerm, setSearchTerm] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [graphKey, setGraphKey] = useState(0);
  const location = useLocation();
  const [history, setHistory] = useState([]);

  // --- State for Settings ---
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ... (Refs remain the same) ...
  const graphDataRef = useRef({ nodes: [], links: [] });
  const simRef = useRef(null);
  const selectionsRef = useRef({ g: null, nodeGroup: null, linkGroup: null });
  const zoomRef = useRef(null);
  const activeTablesRef = useRef([]);

  // Fetch schema from backend once on mount
  const incomingSchema = location.state?.schema;
  const dbType = location.state?.dbType;

  const [schema, setSchema] = useState(incomingSchema || mockSchema);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [riskMap, setRiskMap] = useState({});

  useEffect(() => {
    console.log("📦 location.state:", location.state);
  }, []);
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const connectionId = location.state?.connectionId;

        if (!connectionId) {
          console.warn("⚠ No connectionId found");
          return;
        }

        console.log("✅ Fetching analysis for:", connectionId);

        const res = await fetch(
          `http://localhost:8000/api/analyze/${connectionId}`,
        );
        const data = await res.json();

        console.log("📊 analysis:", data);

        setAnalysis(data);

        const map = {};
        data.analysis?.forEach((item) => {
          map[item.table] = item;
        });

        setRiskMap(map);
      } catch (err) {
        console.error("❌ Analysis fetch failed", err);
      }
    };

    fetchAnalysis();
  }, [location.state]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const connectionId = location.state?.connectionId;
        if (!connectionId) return;

        const res = await fetch(
          `http://localhost:8000/api/analyze/${connectionId}`,
        );

        const text = await res.text();

        try {
          const data = JSON.parse(text);

          console.log("📊 analysis:", data);

          setAnalysis(data);

          const map = {};
          data.analysis?.forEach((item) => {
            map[item.table] = item;
          });

          setRiskMap(map);
        } catch (err) {
          console.error("❌ Not JSON response:", text);
        }
      } catch (err) {
        console.error("Analysis fetch failed", err);
      }
    };

    fetchAnalysis();
  }, [location.state]);

  useEffect(() => {
    if (Object.keys(riskMap).length > 0) {
      setGraphKey((k) => k + 1);
    }
  }, [riskMap]);
  // ✅ Update when navigation changes
  useEffect(() => {
    if (incomingSchema && incomingSchema.nodes) {
      setSchema(incomingSchema);
      setGraphKey((k) => k + 1);
    } else {
      console.warn("No schema passed, using mock");
    }
  }, [incomingSchema]);

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

  const exportPDF = async () => {
    if (!containerRef.current) return;

    const canvas = await html2canvas(containerRef.current, {
      backgroundColor: "#05080f", // match your bg
      scale: 2, // high quality
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("schema-graph.pdf");
  };

  // 3. Main D3 Initialization Effect
  // *** NOW DEPENDS ON 'settings' and 'schema' ***
  useEffect(() => {
    if (!svgRef.current) return;

    // --- Destructure settings from state ---
    const {
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
    const safeNodes = schema && schema.nodes ? schema.nodes : [];
    const safeEdges = schema && schema.edges ? schema.edges : [];

    const sortedNodes = [...safeNodes].sort((a, b) => {
      const riskA = riskMap[a.id]?.risk_score || 0;
      const riskB = riskMap[b.id]?.risk_score || 0;
      return riskB - riskA; // high risk first
    });

    graphDataRef.current.nodes = sortedNodes.map((n, i) => ({
      ...n,
      label: n.label || n.id,
      type: "table",
      expanded: n.expanded || false,
      x: width / 2 + Math.cos(i) * 100,
      y: height / 2 + Math.sin(i) * 100,
    }));

    // graphDataRef.current.nodes = safeNodes.map((n) => ({
    //   ...n,
    //   label: n.label || n.id,
    //   type: "table",
    //   expanded: n.expanded || false,
    // }));
    graphDataRef.current.links = safeEdges
      .map((e) => ({
        source: graphDataRef.current.nodes.find((n) => n.id === e.source),
        target: graphDataRef.current.nodes.find((n) => n.id === e.target),
      }))
      .filter((l) => l.source && l.target);

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
      .attr("refX", 10)
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
      .distance((d) => {
        // 🔥 Attribute edges (short)
        if (d.target.type === "attribute") return 100;

        // 🔥 Table-to-table edges (long)
        return 250;
      })
      .strength((d) => {
        // Attributes tightly connected
        if (d.target.type === "attribute") return 1;

        // Tables looser
        return 0.5;
      });

    // --- Simulation Setup ---
    const sim = d3
      .forceSimulation(nodes)
      .force("link", linkForce) // ✅ only once
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => (d.type === "table" ? Tnode + 10 : ANode + 5)),
      );

    simRef.current = sim;

    const linkGroup = g
      .append("g")
      .attr("class", "links")
      .attr("stroke", "url(#link-gradient)")
      .attr("stroke-width", 1.8)
      .attr("stroke-opacity", 0.8)
      .style("filter", "drop-shadow(0 0 6px #00e0ff44)");
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
          (exit) => exit.remove(),
        )
        .attr("stroke", (d) => {
          if (d.target.type === "attribute") return ATTRIBUTE_COLOR;

          const sourceRisk = riskMap[d.source.id]?.risk_score || 0;
          const targetRisk = riskMap[d.target.id]?.risk_score || 0;

          if (sourceRisk > 70 || targetRisk > 70) {
            return "#ff4d4f"; // 🔴 risky edge
          }

          return LINK_COLOR;
        })
        .attr("stroke-width", (d) => {
          const sourceRisk = riskMap[d.source.id]?.risk_score || 0;
          const targetRisk = riskMap[d.target.id]?.risk_score || 0;

          return sourceRisk > 70 || targetRisk > 70 ? 3 : 1.8;
        });

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
                d.type === "table" ? "table-node" : "attribute-node",
              );

            gEnter
              .append("circle")
              .attr("r", (d) => (d.type === "table" ? Tnode : ANode))
              .attr("fill", (d) => {
                if (d.type !== "table") return ATTRIBUTE_COLOR;

                const risk = riskMap[d.id]?.risk_score || 0;

                if (risk >= 50) return "#ff4d4f"; // 🔴 high risk
                if (risk >= 30) return "#faad14"; // 🟡 medium
                return "#52c41a"; // 🟢 safe
              })
              .attr("stroke", (d) =>
                d.type === "table" ? TABLE_STROKE : ATTRIBUTE_STROKE,
              )
              .attr("stroke-width", 2);

            gEnter
              .append("text")
              .text((d) => d.label || d.id)
              .attr("text-anchor", "start")
              .attr("x", (d) => (d.type === "table" ? Tnode + 5 : ANode + 5))
              .attr("y", 6)
              .attr("dy", (d) => (d.type === "table" ? 5 : 4))
              .attr("pointer-events", "none")
              .attr("fill", TEXT_COLOR)
              .style("font-size", (d) => (d.type === "table" ? "14px" : "10px"))
              .style("font-weight", 600)
              .style("letter-spacing", "0.5px")
              .style("text-shadow", "0 0 6px #000");

            // Attributes are created starting at parent location and opacity 0
            gEnter.filter((d) => d.type === "attribute").attr("opacity", 0);

            gEnter.on("click", (event, d) => {
              event.stopPropagation();
              setHistory((prev) => [...prev, selectedNode]);
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
          (exit) => exit.remove(),
        );
      // 🔥 UPDATE COLORS FOR ALL NODES (IMPORTANT)
      nodeGroup
        .selectAll("circle")
        .transition()
        .duration(300)
        .attr("fill", (d) => {
          if (d.type !== "table") return ATTRIBUTE_COLOR;

          const risk = riskMap[d.id]?.risk_score || 0;

          if (risk >= 70) return "#ff4d4f"; // 🔴 high
          if (risk >= 40) return "#faad14"; // 🟡 medium
          return "#52c41a"; // 🟢 low
        })
        .style("filter", (d) => {
          const risk = riskMap[d.id]?.risk_score || 0;
          return risk > 70 ? "drop-shadow(0 0 5px #ff4d4f)" : "none";
        });

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
        (n) => n.type === "attribute" && n.parentTableId === tableNode.id,
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
      .scaleExtent([0.3, 4])
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
        .attr("x2", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const radius = d.target.type === "table" ? Tnode : ANode;

          return d.target.x - (dx / dist) * radius;
        })
        .attr("y2", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const radius = d.target.type === "table" ? Tnode : ANode;

          return d.target.y - (dy / dist) * radius;
        })
        .attr("marker-end", (d) =>
          d.target.type === "attribute" ? "url(#attr-arrow)" : "url(#arrow)",
        );

      nodeGroup
        .selectAll("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [dimensions, graphKey, settings, schema, riskMap]);
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
          : 1,
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

  const undo = () => {
    if (history.length > 0) {
      const lastNode = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setSelectedNode(lastNode);
    }
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
            <Link to="/connections" className="button">
              <WrenchScrewdriverIcon className="button-icon" />
              Connections
            </Link>
            <button onClick={() => setSelectedNode(null)} className="button">
              <XCircleIcon className="button-icon" />
              Clear
            </button>
            <button onClick={undo} className="button">
              <ArrowUturnLeftIcon className="button-icon" />
              Undo
            </button>
            <button onClick={exportPDF} className="button">
              📄 Export PDF
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
              {dbType
                ? dbType.toUpperCase()
                : schema.nodes?.length
                  ? "Detected DB"
                  : "Unknown"}
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

      <aside className="risk-panel">
        <h4 className="risk-title">⚠ Risk Analysis</h4>

        <div className="risk-content">
          {" "}
          {/* 🔥 NEW WRAPPER */}
          {!analysis && <p className="risk-loading">Loading...</p>}
          {analysis?.analysis
            ?.sort((a, b) => b.risk_score - a.risk_score)
            .slice(0, 10)
            .map((item) => (
              <div key={item.table} className="risk-card">
                <div className="risk-header">
                  <strong>{item.table}</strong>
                  <span className="risk-score">{item.risk_score}</span>
                </div>

                <div className="risk-issues">
                  {item.issues?.length ? (
                    item.issues.map((i, idx) => (
                      <div key={idx} className="risk-issue">
                        ⚠ {i}
                      </div>
                    ))
                  ) : (
                    <div className="risk-safe">No issues</div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </aside>

      <div
        className="main-content"
        ref={containerRef}
        style={{ position: "relative" }}
      >
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
