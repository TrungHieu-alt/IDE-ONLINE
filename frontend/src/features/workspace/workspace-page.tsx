import { useParams } from "react-router-dom"

import { useTheme } from "@/components/theme-provider"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { EditorPanel } from "@/features/workspace/components/editor-panel"
import { ProblemDescriptionPanel } from "@/features/workspace/components/problem-description-panel"
import { TestResultsPanel } from "@/features/workspace/components/test-results-panel"
import { WorkspaceTopbar } from "@/features/workspace/components/workspace-topbar"
import { useWorkspaceState } from "@/features/workspace/workspace.hooks"

export function WorkspacePage() {
  const { problemId = "176" } = useParams()
  const { theme } = useTheme()
  const {
    error,
    isLoading,
    question,
    language,
    setLanguage,
    editorCode,
    setEditorCode,
    caseInputs,
    setCaseInputs,
    selectedCaseIndex,
    setSelectedCaseIndex,
    starterCode,
    testcaseResults,
  } = useWorkspaceState(problemId)

  if (error) {
    return (
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          Failed to load workspace data. {error.message}
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="rounded-xl border border-black/8 bg-[#fcfcf8] px-4 py-3 text-sm text-muted-foreground dark:border-white/8 dark:bg-[#171d18]">
          Loading workspace...
        </div>
      </main>
    )
  }

  if (!question) {
    return null
  }

  return (
    <>
      <WorkspaceTopbar question={question} />

      <main className="h-[calc(100svh-80px)] min-w-0 overflow-hidden p-3 sm:p-4">
        <ResizablePanelGroup orientation="horizontal" className="h-full min-w-0 gap-0">
          <ResizablePanel defaultSize={38} minSize={24} className="min-h-0 min-w-0 overflow-hidden">
            <ProblemDescriptionPanel question={question} />
          </ResizablePanel>

          <ResizableHandle withHandle className="mx-1 bg-transparent" />

          <ResizablePanel defaultSize={62} minSize={24} className="min-h-0 min-w-0 overflow-hidden">
            <ResizablePanelGroup orientation="vertical" className="h-full min-h-0 min-w-0">
              <ResizablePanel defaultSize={56} minSize={28} className="min-h-0 min-w-0 overflow-hidden">
                <EditorPanel
                  language={language}
                  editorCode={editorCode}
                  theme={theme}
                  onLanguageChange={(nextLanguage) => {
                    setLanguage(nextLanguage)
                    setEditorCode(starterCode[nextLanguage])
                  }}
                  onEditorCodeChange={setEditorCode}
                />
              </ResizablePanel>

              <ResizableHandle withHandle className="my-1 bg-transparent" />

              <ResizablePanel defaultSize={44} minSize={24} className="min-h-0 min-w-0 overflow-hidden">
                <TestResultsPanel
                  testcaseResults={testcaseResults}
                  caseInputs={caseInputs}
                  selectedCaseIndex={selectedCaseIndex}
                  setSelectedCaseIndex={setSelectedCaseIndex}
                  setCaseInputs={setCaseInputs}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  )
}
