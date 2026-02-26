import TopMenuBar from "@/components/TopMenuBar";
import BrandProductsPage from "@/components/marcas/BrandProductsPage";

type MarcaProductsRoutePageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function MarcaProductsRoutePage({
  params,
}: MarcaProductsRoutePageProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <BrandProductsPage slug={resolvedParams.slug} />
      </main>
    </div>
  );
}
