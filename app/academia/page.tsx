import { Suspense } from "react";
import TopMenuBar from "@/components/TopMenuBar";
import AcademiaListPage from "@/components/academia/AcademiaListPage";

export default function AcademiaPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <Suspense
          fallback={
            <div className="mx-auto max-w-[1240px] px-4 pt-24 pb-16 sm:px-6 lg:px-8">
              <div className="h-12 w-64 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 h-64 animate-pulse rounded-3xl bg-slate-200" />
            </div>
          }
        >
          <AcademiaListPage />
        </Suspense>
      </main>
    </div>
  );
}
