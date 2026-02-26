import TopMenuBar from "@/components/TopMenuBar";
import AcademiaListPage from "@/components/academia/AcademiaListPage";

export default function AcademiaPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <AcademiaListPage />
      </main>
    </div>
  );
}
