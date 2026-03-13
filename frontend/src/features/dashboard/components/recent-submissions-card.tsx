import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubmissionSummary } from "@/entities/submission/model";
import { submissionResultClass } from "@/features/dashboard/dashboard.utils";

type RecentSubmissionsCardProps = {
  submissions: SubmissionSummary[];
};

export function RecentSubmissionsCard({
  submissions,
}: RecentSubmissionsCardProps) {
  return (
    <Card className="h-full min-h-[22rem] rounded-xl border border-black/8 bg-[#fcfcf8] shadow-[0_18px_50px_-30px_rgba(0,0,0,0.22)] dark:border-white/8 dark:bg-[#171d18] dark:shadow-none">
      <CardHeader>
        <CardTitle>Recent submissions</CardTitle>
        <CardDescription>Quick access to latest run results.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="rounded-lg border border-black/8 bg-white p-4 dark:border-white/8 dark:bg-white/4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{submission.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {submission.id} · {submission.language}
                </div>
              </div>
              <Badge className={submissionResultClass(submission.result)}>
                {submission.result}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {submission.time} · Runtime {submission.runtime}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
