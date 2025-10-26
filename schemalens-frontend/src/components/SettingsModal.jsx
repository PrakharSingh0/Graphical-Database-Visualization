import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Helper component for form rows
function SettingsInput({
  label,
  type,
  value,
  onChange,
  min,
  step,
  name,
}) {
  return (
    <div className="settings-form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
      />
    </div>
  );
}

export default function SettingsModal({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}) {
  const [modalSettings, setModalSettings] = useState(initialSettings);

  // Reset local state when modal is opened or settings change
  useEffect(() => {
    if (isOpen) {
      setModalSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setModalSettings((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    onSave(modalSettings);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Graph Settings</h3>
          <button onClick={onClose} className="modal-close-btn">
            <XMarkIcon style={{ width: 24, height: 24 }} />
          </button>
        </div>
        <div className="modal-body">
          <h4>Colors</h4>
          <SettingsInput
            label="Table Color"
            type="color"
            name="TABLE_COLOR"
            value={modalSettings.TABLE_COLOR}
            onChange={handleChange}
          />
          <SettingsInput
            label="Table Stroke"
            type="color"
            name="TABLE_STROKE"
            value={modalSettings.TABLE_STROKE}
            onChange={handleChange}
          />
          <SettingsInput
            label="Attribute Color"
            type="color"
            name="ATTRIBUTE_COLOR"
            value={modalSettings.ATTRIBUTE_COLOR}
            onChange={handleChange}
          />
          <SettingsInput
            label="Attribute Stroke"
            type="color"
            name="ATTRIBUTE_STROKE"
            value={modalSettings.ATTRIBUTE_STROKE}
            onChange={handleChange}
          />
          <SettingsInput
            label="Link Color"
            type="color"
            name="LINK_COLOR"
            value={modalSettings.LINK_COLOR}
            onChange={handleChange}
          />
          <SettingsInput
            label="Text Color"
            type="color"
            name="TEXT_COLOR"
            value={modalSettings.TEXT_COLOR}
            onChange={handleChange}
          />
          
          <hr className="modal-divider" />
          
          <h4>Behavior & Sizing</h4>
          <SettingsInput
            label="Table Node Radius (Tnode)"
            type="number"
            name="Tnode"
            min="10"
            value={modalSettings.Tnode}
            onChange={handleChange}
          />
          <SettingsInput
            label="Attribute Node Radius (ANode)"
            type="number"
            name="ANode"
            min="5"
            value={modalSettings.ANode}
            onChange={handleChange}
          />
          <SettingsInput
            label="Attribute Spawn Radius"
            type="number"
            name="ATTRIBUTE_RADIUS"
            min="50"
            step="10"
            value={modalSettings.ATTRIBUTE_RADIUS}
            onChange={handleChange}
          />
          <SettingsInput
            label="Max Active Tables"
            type="number"
            name="MAX_ACTIVE_TABLES"
            min="1"
            step="1"
            value={modalSettings.MAX_ACTIVE_TABLES}
            onChange={handleChange}
          />
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="button button-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="button">
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}