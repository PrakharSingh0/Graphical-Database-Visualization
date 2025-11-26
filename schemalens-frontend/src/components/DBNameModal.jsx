import React, { useState } from "react";
import "./DBNameModal.css";

export default function DBNameModal({ isOpen, onClose, onSubmit }) {
  const [dbName, setDbName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dbName.trim()) {
      alert("Database name is required!");
      return;
    }
    onSubmit(dbName);
    setDbName("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3 className="modal-title">MongoDB Database Name</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="modal-input"
            type="text"
            placeholder="Enter database name (ex: sample_mflix)"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-btn modal-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-confirm">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
