import { useState } from "react";
import axios from "axios";
import "./AddConnection.css";

export default function AddConnection({ backendUrl, onSave }) {
  const [dbType, setDbType] = useState("mysql");
  const [mode, setMode] = useState("local");
  const [form, setForm] = useState({});
  const [name, setName] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const testConnection = async () => {
    const res = await axios.post(`${backendUrl}/api/test-connection`, {
      db_type: dbType,
      config: form,
    });
    alert(res.data.status);
  };

  const saveConnection = async () => {
    await axios.post(`${backendUrl}/api/connections`, {
      name,
      db_type: dbType,
      mode,
      config: form,
    });
    onSave();
  };

  return (
    <div className="add-connection-container">

  <div className="add-connection-header">
    <h2>Add Connection</h2>
    <span className="mode-badge">{mode}</span>
  </div>

  <div className="add-connection-top">
    <select onChange={(e) => setDbType(e.target.value)}>
      <option value="mysql">MySQL</option>
      <option value="mongodb">MongoDB</option>
    </select>

    <select onChange={(e) => setMode(e.target.value)}>
      <option value="local">Local</option>
      <option value="cloud">Cloud</option>
    </select>
  </div>

  <div className="add-connection-form">

    <div className="form-row">
      <input
        placeholder="Connection Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>

    {/* MySQL Local */}
    {dbType === "mysql" && mode === "local" && (
      <>
        <input name="host" placeholder="Host" onChange={handleChange} />
        <input name="port" placeholder="Port" onChange={handleChange} />
        <input name="username" placeholder="Username" onChange={handleChange} />
        <input name="password" placeholder="Password" onChange={handleChange} />
        <input name="database" placeholder="Database" onChange={handleChange} />
      </>
    )}

    {/* Mongo Local */}
    {dbType === "mongodb" && mode === "local" && (
      <>
        <input name="host" placeholder="Host" onChange={handleChange} />
        <input name="port" placeholder="Port" onChange={handleChange} />
        <input name="database" placeholder="Database" onChange={handleChange} />
      </>
    )}

    {/* Cloud */}
    {mode === "cloud" && (
      <input name="uri" placeholder="Connection URI" onChange={handleChange} />
    )}

    <div className="add-connection-actions">
      <button className="btn btn-test" onClick={testConnection}>
        Test
      </button>
      <button className="btn btn-green" onClick={saveConnection}>
        Save
      </button>
    </div>

  </div>
</div>
  );
}