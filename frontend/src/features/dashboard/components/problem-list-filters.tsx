import { dashboardDifficultyOptions } from "@/features/dashboard/dashboard.constants"

type ProblemListFiltersProps = {
  value: string
  onChange: (value: string) => void
}

export function ProblemListFilters({ value, onChange }: ProblemListFiltersProps) {
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-1.5">
      {dashboardDifficultyOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            option === value
              ? "rounded-lg bg-[#1d2a1f] px-3 py-1 text-white shadow-none hover:bg-[#1d2a1f] dark:bg-[#8bd450] dark:text-[#13200f] dark:hover:bg-[#8bd450]"
              : "rounded-lg border border-black/10 px-3 py-1 text-muted-foreground shadow-none dark:border-white/10"
          }
        >
          {option}
        </button>
      ))}
    </div>
  )
}
