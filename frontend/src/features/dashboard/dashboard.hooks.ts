import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { useProblems } from "@/entities/problem/hooks"
import { useRecentSubmissions } from "@/entities/submission/hooks"

export function useDashboardData() {
  const [searchParams, setSearchParams] = useSearchParams()
  const problemsQuery = useProblems()
  const recentSubmissionsQuery = useRecentSubmissions()

  const searchTerm = searchParams.get("q") ?? ""
  const selectedDifficulty = searchParams.get("difficulty") ?? "All"

  const questions = useMemo(() => {
    return (problemsQuery.data ?? []).filter((question) => {
      const matchesDifficulty = selectedDifficulty === "All" || question.difficulty === selectedDifficulty
      const normalizedSearchTerm = searchTerm.trim().toLowerCase()
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        question.title.toLowerCase().includes(normalizedSearchTerm) ||
        question.id.includes(normalizedSearchTerm)

      return matchesDifficulty && matchesSearch
    })
  }, [problemsQuery.data, searchTerm, selectedDifficulty])

  function updateSearchTerm(value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (value.trim()) {
      nextParams.set("q", value)
    } else {
      nextParams.delete("q")
    }

    setSearchParams(nextParams, { replace: true })
  }

  function updateDifficulty(value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (value !== "All") {
      nextParams.set("difficulty", value)
    } else {
      nextParams.delete("difficulty")
    }

    setSearchParams(nextParams, { replace: true })
  }

  return {
    searchTerm,
    selectedDifficulty,
    setSearchTerm: updateSearchTerm,
    setSelectedDifficulty: updateDifficulty,
    isLoading: problemsQuery.isLoading || recentSubmissionsQuery.isLoading,
    error: problemsQuery.error ?? recentSubmissionsQuery.error,
    questions,
    recentSubmissions: recentSubmissionsQuery.data ?? [],
    featuredQuestion: questions[0] ?? problemsQuery.data?.[0] ?? null,
  }
}
