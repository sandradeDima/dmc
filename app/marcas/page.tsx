import TopMenuBar from "@/components/TopMenuBar";
import MarcasListPage from "@/components/marcas/MarcasListPage";

export default function MarcasPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <MarcasListPage />
      </main>
    </div>
  );
}
