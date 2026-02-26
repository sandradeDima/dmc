import TopMenuBar from "@/components/TopMenuBar";
import SoportePageContent from "@/components/soporte/SoportePageContent";

export default function SoportePage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <SoportePageContent />
      </main>
    </div>
  );
}
