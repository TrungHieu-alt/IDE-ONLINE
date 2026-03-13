import React from 'react';

interface OutputPanelProps {
  output: string;
  isError?: boolean; // Tùy chọn để đổi màu đỏ nếu code có lỗi
}

export default function OutputPanel({ output, isError = false }: OutputPanelProps) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ margin: "0 0 10px 0", color: "white", fontSize: "16px" }}>Kết quả (Output):</h3>
      <div style={{ 
        flex: 1, 
        backgroundColor: "#000", 
        padding: "15px", 
        borderRadius: "4px", 
        fontFamily: "monospace", 
        whiteSpace: "pre-wrap", 
        border: "1px solid #444", 
        color: isError ? "#ff5555" : "#4af626",
        overflowY: "auto"
      }}>
        {output || "Kết quả chạy code sẽ hiển thị ở đây..."}
      </div>
    </div>
  );
}