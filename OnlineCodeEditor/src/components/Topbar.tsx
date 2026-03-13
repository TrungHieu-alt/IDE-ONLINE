import React from 'react';

interface TopbarProps {
  language: string;
  onSelectLanguage: (lang: string) => void;
  onRunCode: () => void;
}

export default function Topbar({ language, onSelectLanguage, onRunCode }: TopbarProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: "#2d2d2d", borderBottom: "1px solid #444" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <label style={{ color: "white", fontWeight: "bold" }}>Ngôn ngữ:</label>
        <select 
          value={language} 
          onChange={(e) => onSelectLanguage(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "4px", backgroundColor: "#1e1e1e", color: "white", border: "1px solid #555", cursor: "pointer" }}
        >
          <option value="python">Python</option>
          <option value="typescript">TypeScript</option>
        </select>
      </div>
      
      <button 
        onClick={onRunCode}
        style={{ padding: "8px 24px", backgroundColor: "#10a37f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
      >
        ▶ Run Code
      </button>
    </div>
  );
}