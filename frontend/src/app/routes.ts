export const appRoutes = {
  home: "/",
  problems: "/problems",
  problemDetail: (problemId: string) => `/problems/${problemId}`,
} as const
