import { PageTopbar } from "@/components/page-topbar";
import { ContinueSolvingCard } from "@/features/dashboard/components/continue-solving-card";
import { DashboardSearch } from "@/features/dashboard/components/dashboard-search";
import { JoinSessionCard } from "@/features/dashboard/components/join-session-card";
import { ProblemList } from "@/features/dashboard/components/problem-list";
import { RecentSubmissionsCard } from "@/features/dashboard/components/recent-submissions-card";
import { useDashboardData } from "@/features/dashboard/dashboard.hooks";

export function DashboardPage() {
  const {
    error,
    featuredQuestion,
    isLoading,
    questions,
    recentSubmissions,
    searchTerm,
    selectedDifficulty,
    setSearchTerm,
    setSelectedDifficulty,
  } = useDashboardData();

  if (error) {
    return (
      <main className="mx-auto max-w-[90rem] p-4 sm:p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          Failed to load dashboard data. {error.message}
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[90rem] p-4 sm:p-6">
        <div className="rounded-xl border border-black/8 bg-[#fcfcf8] px-4 py-3 text-sm text-muted-foreground dark:border-white/8 dark:bg-[#171d18]">
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (!featuredQuestion) {
    return null;
  }

  return (
    <>
      <PageTopbar
        title="Question listing"
        actions={
          <DashboardSearch value={searchTerm} onChange={setSearchTerm} />
        }
      />

      <main className="mx-auto grid w-full max-w-[90rem] min-w-0 gap-5 p-4 sm:p-6 xl:min-h-[calc(100svh-6.5rem)] xl:grid-cols-[minmax(0,1.6fr)_380px]">
        <div className="grid min-w-0 gap-5 xl:h-full xl:grid-rows-[auto_1fr]">
          <ContinueSolvingCard problem={featuredQuestion} />
          <ProblemList
            questions={questions}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
          />
        </div>

        <div className="grid gap-5 xl:h-full xl:grid-rows-[auto_1fr]">
          <JoinSessionCard />
          <RecentSubmissionsCard submissions={recentSubmissions} />
        </div>
      </main>
    </>
  );
}
