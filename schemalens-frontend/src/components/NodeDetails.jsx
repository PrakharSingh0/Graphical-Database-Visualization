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
              {node.columns.map((col, idx) => (
                <li key={idx}>{col}</li>
              ))}
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
