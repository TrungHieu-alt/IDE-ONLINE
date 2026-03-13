export const languageOptions = ["MySQL", "PostgreSQL", "TypeScript", "Python"] as const

export type WorkspaceLanguage = (typeof languageOptions)[number]

export const defaultStarterCode: Record<WorkspaceLanguage, string> = {
  MySQL: "",
  PostgreSQL: `SELECT (
  SELECT DISTINCT salary
  FROM Employee
  ORDER BY salary DESC
  OFFSET 1 LIMIT 1
) AS "SecondHighestSalary";`,
  TypeScript: `function secondHighestSalary(employee: number[][]): number | null {
  const salaries = [...new Set(employee.map(([, salary]) => salary))]
    .sort((a, b) => b - a)

  return salaries[1] ?? null
}`,
  Python: `def second_highest_salary(employee: list[list[int]]) -> int | None:
    salaries = sorted({salary for _, salary in employee}, reverse=True)
    return salaries[1] if len(salaries) > 1 else None`,
}

export const workspacePaneHeaderClassName = "flex h-9 items-center justify-between gap-3 border-b border-black/8 bg-[#eef1e8] px-4 dark:border-white/8 dark:bg-[#202820]"
