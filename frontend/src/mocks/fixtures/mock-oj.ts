import type { ProblemDetail, WorkspaceCase } from "@/entities/problem/model"
import type { SubmissionSummary } from "@/entities/submission/model"

export const mockProblems: ProblemDetail[] = [
  {
    id: "176",
    title: "Second Highest Salary",
    difficulty: "Medium",
    category: "SQL",
    acceptance: "62%",
    solvedBy: "18.4K",
    time: "12 min",
    description:
      "Write a query to find the second highest distinct salary from the Employee table. If there is no second highest salary, return null.",
  },
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    acceptance: "73%",
    solvedBy: "2.1M",
    time: "8 min",
  },
  {
    id: "102",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Tree",
    acceptance: "58%",
    solvedBy: "912K",
    time: "18 min",
  },
  {
    id: "207",
    title: "Course Schedule",
    difficulty: "Medium",
    category: "Graph",
    acceptance: "47%",
    solvedBy: "744K",
    time: "24 min",
  },
  {
    id: "980",
    title: "Unique Paths III",
    difficulty: "Hard",
    category: "Backtracking",
    acceptance: "34%",
    solvedBy: "126K",
    time: "31 min",
  },
]

export const mockRecentSubmissions: SubmissionSummary[] = [
  {
    id: "#4513201",
    title: "Second Highest Salary",
    language: "MySQL",
    result: "Accepted",
    runtime: "92 ms",
    time: "2 min ago",
  },
  {
    id: "#4513190",
    title: "Course Schedule",
    language: "Python",
    result: "Wrong Answer",
    runtime: "-",
    time: "18 min ago",
  },
  {
    id: "#4513152",
    title: "Two Sum",
    language: "TypeScript",
    result: "Accepted",
    runtime: "4 ms",
    time: "41 min ago",
  },
]

export const mockWorkspaceCases: WorkspaceCase[] = [
  {
    label: "Case 1",
    status: "Accepted",
    input: "Employee = [[1,100],[2,200],[3,300]]",
    output: "200",
    expected: "200",
  },
  {
    label: "Case 2",
    status: "Accepted",
    input: "Employee = [[1,100]]",
    output: "null",
    expected: "null",
  },
  {
    label: "Case 3",
    status: "Accepted",
    input: "Employee = [[1,300],[2,300],[3,200],[4,100]]",
    output: "200",
    expected: "200",
  },
]

export const mockWorkspaceCode = `SELECT (
  SELECT DISTINCT salary
  FROM Employee
  ORDER BY salary DESC
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`
