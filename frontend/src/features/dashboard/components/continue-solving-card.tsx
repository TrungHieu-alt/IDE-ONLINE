import { Link } from "react-router-dom";

import { appRoutes } from "@/app/routes";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProblemSummary } from "@/entities/problem/model";
import { difficultyClass } from "@/features/dashboard/dashboard.utils";

type ContinueSolvingCardProps = {
  problem: ProblemSummary;
};

export function ContinueSolvingCard({ problem }: ContinueSolvingCardProps) {
  return (
    <Card className="rounded-xl border border-black/8 bg-[#1a241c] text-white shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)] dark:border-white/8 dark:bg-[#101510] dark:shadow-none">
      <CardHeader>
        <CardTitle className="text-white">Continue solving</CardTitle>
        <CardDescription className="text-white/60">
          Resume where you left off.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <div className="text-xl font-semibold">
            {problem.id}. {problem.title}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyClass(problem.difficulty)}`}
          >
            {problem.difficulty}
          </Badge>
          <div className="text-sm text-white/60">{problem.time}</div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-white/70">
          {problem.description}
        </p>
        <Link
          to={appRoutes.problemDetail(problem.id)}
          className="inline-flex h-10 items-center rounded-xl bg-[#8bd450] px-4 text-sm font-medium text-[#162012] transition hover:bg-[#9be45f]"
        >
          Open workspace
        </Link>
      </CardContent>
    </Card>
  );
}
