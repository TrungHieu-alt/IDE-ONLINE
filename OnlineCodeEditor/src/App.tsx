import { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import Topbar from "./components/Topbar";
import OutputPanel from "./components/OutputPanel";
import { CODE_SNIPPETS } from "./constants/language";


export default function App() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(CODE_SNIPPETS["python"]);
  const [output, setOutput] = useState("");

  const onSelectLanguage = (lang: string) => {
    setLanguage(lang);
    setCode(CODE_SNIPPETS[lang]);
  };

  const handleRunCode = () => {
    // Vì bạn làm Frontend, tạm thời chúng ta mock data (giả lập kết quả)
    // Sau này đội Backend cung cấp API thì bạn thay chỗ này bằng fetch/axios
    setOutput("Đang chờ Backend xử lý...\n\nHello, World! (Fake data)");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#1e1e1e", color: "#ccc" }}>
      {/* Thanh công cụ phía trên */}
      <Topbar language={language} onSelectLanguage={onSelectLanguage} onRunCode={handleRunCode} />
      
      {/* Khu vực chính chia làm 2 cột */}
      <div style={{ display: "flex", flex: 1, padding: "20px", gap: "20px", overflow: "hidden" }}>
        
        {/* Cột trái: Editor */}
        <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
          <CodeEditor language={language} value={code} onChange={(val) => setCode(val || "")} />
        </div>

        {/* Cột phải: Kết quả */}
        <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
          <OutputPanel output={output} />
        </div>

      </div>
    </div>
  );
}