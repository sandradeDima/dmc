import TopMenuBar from "@/components/TopMenuBar";
import CotizarPageContent from "@/components/cotizar/CotizarPageContent";

export default function CotizarPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <CotizarPageContent />
      </main>
    </div>
  );
}
