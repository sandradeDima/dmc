import TopMenuBar from "@/components/TopMenuBar";
import BlogDetailPage from "@/components/blog/BlogDetailPage";

type BlogDetailRoutePageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function BlogDetailRoutePage({
  params,
}: BlogDetailRoutePageProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-white">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <BlogDetailPage slug={resolvedParams.slug} />
      </main>
    </div>
  );
}
