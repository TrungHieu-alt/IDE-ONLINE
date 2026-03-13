import Editor from "@monaco-editor/react";
import React from 'react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

export default function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  return (
    <div style={{ height: "100%", width: "100%", border: "1px solid #444", borderRadius: "4px", overflow: "hidden" }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        theme="vs-dark"
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          wordWrap: "on",
          automaticLayout: true, // Tự động resize khi co kéo trình duyệt
        }}
      />
    </div>
  );
}