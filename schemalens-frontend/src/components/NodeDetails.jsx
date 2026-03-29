import React from "react";
import "./NodeDetails.css";

const NodeDetails = ({ node }) => {
  if (!node) {
    return (
      <div className="node-details-container">
        <p className="node-details-placeholder">
          Select a node to view its details.
        </p>
      </div>
    );
  }

  // Check if it's a table node with columns
  const isTable = node.type === "table" && node.columns;

  return (
    <div className="node-details-container">
      <div className="node-details-content">
        <h2 className="node-details-header">{node.label}</h2>
        <p className="node-details-id">ID: {node.id}</p>

        {isTable && (
          <>
            <h3 className="node-details-columns-header">Columns</h3>
            <ul className="node-details-columns-list">
              {node.columns.map((col, idx) => {
                let name = col;
                let isPK = false;
                let isFK = false;

                // 🔥 Handle string columns
                if (typeof col === "string") {
                  name = col;

                  if (col.toLowerCase() === "id") isPK = true; // PK
                  if (col.toLowerCase().endsWith("_id")) isFK = true; // FK
                }

                // 🔥 Handle object columns (future-safe)
                else if (typeof col === "object") {
                  name = col.name;
                  isPK = col.primary_key;
                  isFK = col.foreign_key;
                }

                return (
                  <li key={idx} className="column-row">
                    <span>{name}</span>

                    <span className="column-tags">
                      {isPK && <span className="pk">PK</span>}
                      {isFK && <span className="fk">FK</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {!isTable && node.type === "attribute" && (
          <p className="node-details-placeholder">
            This is an attribute node. Select its parent table to see more
            details.
          </p>
        )}
      </div>
    </div>
  );
};

export default NodeDetails;
