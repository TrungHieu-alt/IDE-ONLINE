import Editor from "@monaco-editor/react"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  languageOptions,
  workspacePaneHeaderClassName,
  type WorkspaceLanguage,
} from "@/features/workspace/workspace.constants"

type EditorPanelProps = {
  language: WorkspaceLanguage
  editorCode: string
  theme: string
  onLanguageChange: (language: WorkspaceLanguage) => void
  onEditorCodeChange: (value: string) => void
}

export function EditorPanel({
  language,
  editorCode,
  theme,
  onLanguageChange,
  onEditorCodeChange,
}: EditorPanelProps) {
  return (
    <Card className="h-full min-h-0 min-w-0 gap-0 overflow-hidden rounded-xl border border-black/8 bg-[#f9faf5] py-0 ring-0 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.22)] dark:border-white/8 dark:bg-[#171d18] dark:shadow-none">
      <div className={workspacePaneHeaderClassName}>
        <CardTitle className="text-sm">Editor</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(value) => onLanguageChange(value as WorkspaceLanguage)}>
            <SelectTrigger
              size="sm"
              className="h-7 rounded-lg border-black/8 bg-white text-xs dark:border-white/10 dark:bg-[#131814]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option} value={option} className="text-xs">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardContent className="h-[calc(100%-36px)] min-h-0 p-0">
        <Editor
          height="100%"
          language={language === "MySQL" || language === "PostgreSQL" ? "sql" : language.toLowerCase()}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          value={editorCode}
          onChange={(value) => onEditorCodeChange(value ?? "")}
          options={{
            automaticLayout: true,
            fontSize: 14,
            lineHeight: 22,
            minimap: { enabled: false },
            overviewRulerBorder: false,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </CardContent>
    </Card>
  )
}
