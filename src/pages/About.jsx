import React from "react"
// NavBar is now rendered globally from App
import { motion } from "framer-motion"

const slideVariant = (direction = "left", delay = 0) => ({
  hidden: {
    opacity: 0,
    x: direction === "left" ? -32 : 32,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: "easeOut",
    },
  },
})

export default function About() {
  return (
    <div className="page about">

      <main
        style={{
          maxWidth: "880px",
          margin: "0 auto",
        }}
      >
        <motion.section
          className="hero"
          style={{ textAlign: "center", marginBottom: 28 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="title">About Graph Neural DB-Lens</h1>
          <p className="subtitle">
            A focused workspace that turns relational and document databases into an
            intelligent graph layer for analysis, optimization, and clear visibility.
          </p>
        </motion.section>
        <motion.section
          className="about-card"
          style={{ marginBottom: 16 }}
          variants={slideVariant("left", 0.05)}
          initial="hidden"
          animate="visible"
        >
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>What the platform is</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
            The DB-Lens sits on top of your existing databases and models them as a graph:
            tables or collections become nodes; keys, joins, and relationships become
            edges; and query traffic is treated as signal. On top of this representation,
            a Graph Neural Network (GNN) learns structural and behavioral patterns so you
            can see how your data really flows, where it slows down, and where it is at
            risk.
          </p>
        </motion.section>
        <motion.section
          className="about-card"
          style={{ marginBottom: 16 }}
          variants={slideVariant("right", 0.12)}
          initial="hidden"
          animate="visible"
        >
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>What it helps you do</h2>
          <ul
            style={{
              paddingLeft: 18,
              margin: 0,
              color: "var(--muted)",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            <li>
              Convert complex schemas into a single, navigable graph that is easier to
              reason about than raw tables or ER diagrams.
            </li>
            <li>
              Detect risky joins, deep query paths, and unusual access patterns before they
              turn into production incidents.
            </li>
            <li>
              Identify missing or ineffective indexes with context on which workloads they
              impact the most.
            </li>
            <li>
              Plan schema changes with a clear view of how they affect upstream and
              downstream components.
            </li>
            <li>
              Give backend, data, and infrastructure teams a shared visual source of truth
              for how the database is actually being used.
            </li>
          </ul>
        </motion.section>
        <motion.section
          className="about-card"
          style={{ marginBottom: 16 }}
          variants={slideVariant("left", 0.18)}
          initial="hidden"
          animate="visible"
        >
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Who it is for</h2>
          <ul
            style={{
              paddingLeft: 18,
              margin: 0,
              color: "var(--muted)",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            <li>
              <strong>Backend engineers</strong> who need to understand how queries and
              joins affect API latency and user-facing performance.
            </li>
            <li>
              <strong>Database administrators</strong> who are responsible for indexes,
              capacity, and long-term database health.
            </li>
            <li>
              <strong>Data engineers and analytics teams</strong> who depend on stable,
              well-structured schemas and predictable data flows.
            </li>
            <li>
              <strong>Architects</strong> who design systems that must scale across teams,
              services, and environments.
            </li>
          </ul>
        </motion.section>
        <motion.section
          className="about-card"
          style={{ marginTop: 20, textAlign: "center" }}
          variants={slideVariant("right", 0.24)}
          initial="hidden"
          animate="visible"
        >
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>
            How the DB-Lens thinks about your data
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            At its core, the DB-Lens treats your environment as a graph of entities and
            flows. The simplified sketch below shows how user entry tables, session data,
            transactional data, and event streams connect and where risk can concentrate.
          </p>

          <div
            style={{
              margin: "0 auto 14px",
              maxWidth: 360,
              background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
              borderRadius: 12,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <small
              style={{
                display: "block",
                textAlign: "left",
                fontSize: 11,
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              Example graph: schema + traffic + risk focus
            </small>

            <div
              style={{
                borderRadius: 10,
                background:
                  "radial-gradient(circle at 0% 0%, rgba(127,90,240,0.2), transparent 55%), radial-gradient(circle at 100% 100%, rgba(90,208,255,0.16), transparent 55%)",
                border: "1px solid rgba(255,255,255,0.04)",
                padding: 8,
              }}
            >
              <svg
                viewBox="0 0 260 180"
                style={{ width: "100%", height: "180px", display: "block" }}
              >
                <line
                  x1="50"
                  y1="60"
                  x2="130"
                  y2="40"
                  stroke="#7f5af0"
                  strokeWidth="1.4"
                  strokeOpacity="0.8"
                />
                <line
                  x1="130"
                  y1="40"
                  x2="210"
                  y2="70"
                  stroke="#5ad0ff"
                  strokeWidth="1.4"
                  strokeOpacity="0.8"
                />
                <line
                  x1="50"
                  y1="60"
                  x2="80"
                  y2="130"
                  stroke="#22c55e"
                  strokeWidth="1.4"
                  strokeOpacity="0.8"
                />
                <line
                  x1="80"
                  y1="130"
                  x2="160"
                  y2="140"
                  stroke="#f97316"
                  strokeWidth="1.4"
                  strokeOpacity="0.85"
                />
                <line
                  x1="160"
                  y1="140"
                  x2="210"
                  y2="70"
                  stroke="#fb7185"
                  strokeWidth="1.4"
                  strokeOpacity="0.9"
                />
                {renderNode(50, 60, "users", "entry", "#5ad0ff")}
                {renderNode(130, 40, "sessions", "auth", "#7f5af0")}
                {renderNode(210, 70, "orders", "hot path", "#fb7185", true)}
                {renderNode(80, 130, "events", "activity", "#22c55e")}
                {renderNode(160, 140, "payments", "risk zone", "#f97316")}
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#5ad0ff",
                    marginRight: 4,
                  }}
                />
                structure
              </span>
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    marginRight: 4,
                  }}
                />
                traffic
              </span>
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#fb7185",
                    marginRight: 4,
                  }}
                />
                risk focus
              </span>
            </div>
          </div>

          <p
            style={{
              color: "var(--muted)",
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            In the real product, this view is interactive: you can zoom, filter by source,
            highlight specific paths, and see GNN-driven scores on top of each node and
            edge.
          </p>
        </motion.section>

        <footer
          className="footer"
          style={{ fontSize: 12, marginTop: 32 }}
        >
          <small>
            © {new Date().getFullYear()} Graph Neural Database Studio. Built to make
            complex databases easier to understand, evolve, and trust.
          </small>
        </footer>
      </main>
    </div>
  )
}
function renderNode(x, y, label, sub, color, highlighted = false) {
  return (
    <g key={label}>
      <circle
        cx={x}
        cy={y}
        r={highlighted ? 11 : 9}
        fill={color}
        stroke="#041014"
        strokeWidth="1.6"
      />
      <text
        x={x}
        y={y + (highlighted ? 20 : 18)}
        textAnchor="middle"
        style={{ fill: "#e6eef3", fontSize: 9, fontWeight: 600 }}
      >
        {label}
      </text>
      <text
        x={x}
        y={y + (highlighted ? 32 : 30)}
        textAnchor="middle"
        style={{ fill: "#98a8b3", fontSize: 8 }}
      >
        {sub}
      </text>
    </g>
  )
}
