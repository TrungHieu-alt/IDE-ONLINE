import { Link } from "react-router-dom";

import { appRoutes } from "@/app/routes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProblemSummary } from "@/entities/problem/model";
import { ProblemListFilters } from "@/features/dashboard/components/problem-list-filters";
import { difficultyClass } from "@/features/dashboard/dashboard.utils";

type ProblemListProps = {
  questions: ProblemSummary[];
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
};

export function ProblemList({
  questions,
  selectedDifficulty,
  onDifficultyChange,
}: ProblemListProps) {
  return (
    <Card className="h-full overflow-hidden rounded-xl border border-black/8 bg-[#fcfcf8] shadow-[0_18px_50px_-30px_rgba(0,0,0,0.22)] dark:border-white/8 dark:bg-[#171d18] dark:shadow-none">
      <CardHeader className="border-b border-black/8 px-5 py-0 dark:border-white/8 sm:px-6">
        <ProblemListFilters
          value={selectedDifficulty}
          onChange={onDifficultyChange}
        />
      </CardHeader>

      <CardContent className="px-0 py-0">
        <div className="hidden grid-cols-[minmax(0,1.8fr)_120px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground xl:grid">
          <div>Problem</div>
          <div>Difficulty</div>
        </div>

        {questions.map((question, index) => (
          <div key={question.id}>
            <Link
              to={appRoutes.problemDetail(question.id)}
              className="grid gap-3 px-5 py-4 transition hover:bg-[#f2f4ec] dark:hover:bg-white/4 xl:grid-cols-[minmax(0,1.8fr)_120px] xl:px-6"
            >
              <div className="min-w-0">
                <div className="font-medium tracking-tight">
                  {question.id}. {question.title}
                </div>
              </div>
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${difficultyClass(question.difficulty)}`}
                >
                  {question.difficulty}
                </span>
              </div>
            </Link>
            {index < questions.length - 1 ? (
              <Separator className="bg-black/8 dark:bg-white/8" />
            ) : null}
          </div>
        ))}

        {questions.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            No problems match the current search and difficulty filters.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
