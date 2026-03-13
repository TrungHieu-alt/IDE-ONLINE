import { useEffect, useMemo, useState } from "react"

import { useProblemWorkspace } from "@/entities/problem/hooks"

import {
  defaultStarterCode,
  type WorkspaceLanguage,
} from "./workspace.constants"

export function useWorkspaceState(problemId: string) {
  const workspace = useProblemWorkspace(problemId)
  const [language, setLanguage] = useState<WorkspaceLanguage>("MySQL")
  const [editorCode, setEditorCode] = useState("")
  const [caseInputs, setCaseInputs] = useState<string[]>([])
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0)

  const starterCode = useMemo(
    () => ({
      ...defaultStarterCode,
      MySQL: workspace.data?.starterCode ?? "",
    }),
    [workspace.data?.starterCode]
  )

  const testcaseResults = useMemo(
    () =>
      caseInputs.map((input, index) => {
        const baseCase = workspace.data?.cases[index]

        return {
          label: `Test ${index + 1}`,
          input,
          output: baseCase?.output ?? "-",
          expected: baseCase?.expected ?? "-",
          status: baseCase?.status ?? "Pending",
        }
      }),
    [caseInputs, workspace.data?.cases]
  )

  useEffect(() => {
    if (!workspace.data) {
      return
    }

    setCaseInputs(workspace.data.cases.map((item) => item.input))
    setSelectedCaseIndex(0)
  }, [workspace.data])

  useEffect(() => {
    if (!workspace.data) {
      return
    }

    setEditorCode(starterCode[language])
  }, [language, starterCode, workspace.data])

  return {
    error: workspace.error,
    isLoading: workspace.isLoading,
    question: workspace.data?.problem ?? null,
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
  }
}
