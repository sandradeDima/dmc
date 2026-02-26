import TopMenuBar from "@/components/TopMenuBar";
import CatalogoPageContent from "@/components/catalogo/CatalogoPageContent";

export default function CatalogoPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <CatalogoPageContent />
      </main>
    </div>
  );
}
