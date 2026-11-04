"use client";

import dynamic from "next/dynamic";

import type { DashboardSnapshot } from "@/modules/dashboard/stats";
import type { Profile } from "@/shared/types/database";

function DashboardSkeleton() {
  return (
    <div
      aria-hidden
      className="grid min-h-[40rem] flex-1 grid-cols-1 gap-2 md:grid-cols-6 xl:grid-cols-12 xl:grid-rows-[auto_minmax(0,1.4fr)_minmax(0,1fr)]"
    >
      <div className="h-24 animate-pulse rounded-[1.6rem] bg-muted/50 md:col-span-6 xl:col-span-12 xl:h-auto" />
      <div className="h-72 animate-pulse rounded-[1.6rem] bg-muted/40 md:col-span-3 xl:col-span-3 xl:h-auto" />
      <div className="h-80 animate-pulse rounded-[1.6rem] bg-muted/40 md:col-span-6 xl:col-span-6 xl:col-start-4 xl:row-start-2 xl:h-auto" />
      <div className="h-72 animate-pulse rounded-[1.6rem] bg-muted/40 md:col-span-3 xl:col-span-3 xl:h-auto" />
      <div className="h-64 animate-pulse rounded-[1.6rem] bg-muted/40 md:col-span-3 xl:col-span-6 xl:h-auto" />
      <div className="h-48 animate-pulse rounded-[1.6rem] bg-muted/40 md:col-span-3 xl:col-span-6 xl:h-auto" />
    </div>
  );
}

const DashboardBoard = dynamic(
  () =>
    import("@/modules/dashboard/components/dashboard-board").then(
      (mod) => mod.DashboardBoard,
    ),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  },
);

export function StudyDashboard({
  snapshot,
}: {
  profile?: Profile;
  snapshot: DashboardSnapshot;
}) {
  return <DashboardBoard snapshot={snapshot} />;
}
