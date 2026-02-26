import TopMenuBar from "@/components/TopMenuBar";
import BlogListPage from "@/components/blog/BlogListPage";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <TopMenuBar />
      <main className="-mt-[85px]">
        <BlogListPage />
      </main>
    </div>
  );
}
