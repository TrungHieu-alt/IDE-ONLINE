export function difficultyClass(level: string) {
  if (level === "Easy") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
  if (level === "Hard") return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
  return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
}

export function submissionResultClass(result: string) {
  if (result === "Accepted") {
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
  }

  return "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
}
