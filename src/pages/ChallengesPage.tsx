import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Surface } from "@/components/ui/Surface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetChallengesQuery, useGetTagsQuery } from "@/store/challengesApi";
import BrandLogo from "@/components/BrandLogo";

export default function ChallengesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const { data, isLoading, isFetching, isError } = useGetChallengesQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    tags: selectedTag || undefined,
  });
  const { data: tagsData, isLoading: tagsLoading } = useGetTagsQuery();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, difficulty, category, selectedTag, limit]);

  const challenges = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const allTags = tagsData?.data ?? [];
  const visibleTags = showAllTags ? allTags : allTags.slice(0, 10);

  const difficultyClass = (difficulty: string) => {
    if (difficulty === "Easy") return "text-success";
    if (difficulty === "Medium") return "text-yellow-400";
    if (difficulty === "Hard") return "text-destructive";
    return "text-foreground";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo compact textClassName="text-foreground" />
        </Link>
        <span className="text-xs font-mono text-muted-foreground">
          CHALLENGES
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Surface className="p-4 sm:p-6">
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              {tagsLoading ? (
                <>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-24" />
                  ))}
                </>
              ) : (
                visibleTags.map((tag) => {
                  const active = selectedTag === tag.name;
                  return (
                    <button
                      key={tag._id}
                      onClick={() => setSelectedTag(active ? "" : tag.name)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono ring-1 transition-colors ${
                        active
                          ? "bg-primary/10 text-primary ring-primary/30"
                          : "bg-secondary text-muted-foreground ring-border hover:text-foreground"
                      }`}
                    >
                      {tag.name} ({tag.count})
                    </button>
                  );
                })
              )}

              {allTags.length > 10 && (
                <button
                  onClick={() => setShowAllTags((prev) => !prev)}
                  className="px-3 py-1.5 rounded-md text-xs font-mono ring-1 ring-border text-muted-foreground hover:text-foreground"
                >
                  {showAllTags ? "Collapse" : "Expand"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground font-mono">
              {isFetching ? "" : `Total: ${data?.total ?? 0}`}
            </p>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground">Per page</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-8 rounded-md bg-secondary px-2 ring-1 ring-border"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-md:mt-2">
            <div className="relative lg:col-span-2">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title"
                className="pl-9"
              />
            </div>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="h-10 rounded-md bg-secondary px-3 text-sm text-foreground ring-1 ring-border"
            >
              <option value="">All difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
            /> */}
          </div>
        </Surface>

        <Surface className="overflow-hidden">
          {selectedTag && (
            <div className="px-4 sm:px-6 py-3 border-b border-border/50 flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                Filtered by tag:
              </span>
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono ring-1 ring-primary/20">
                {selectedTag}
              </span>
              <button
                onClick={() => setSelectedTag("")}
                className="text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-mono text-muted-foreground border-b border-border/50 uppercase tracking-widest">
                  <th className="p-4 sm:p-6 font-medium">Title</th>
                  <th className="p-4 sm:p-6 font-medium text-left">
                    Difficulty
                  </th>
                  <th className="p-4 sm:p-6 font-medium hidden md:table-cell text-left">
                    Category
                  </th>
                  <th className="p-4 sm:p-6 font-medium hidden lg:table-cell text-left">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr
                        key={i}
                        className="hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4 sm:p-6">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </td>
                        <td className="p-4 sm:p-6">
                          <Skeleton className="h-5 w-16" />
                        </td>
                        <td className="p-4 sm:p-6 hidden md:table-cell">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="p-4 sm:p-6 hidden lg:table-cell">
                          <Skeleton className="h-5 w-40" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : isError ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-sm text-destructive">
                      Failed to fetch challenges.
                    </td>
                  </tr>
                ) : challenges.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-sm text-muted-foreground"
                    >
                      No challenges found.
                    </td>
                  </tr>
                ) : (
                  challenges.map((challenge) => (
                    <tr
                      key={challenge._id}
                      className="hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/workspace/${challenge._id}`)}
                    >
                      <td className="p-4 sm:p-6">
                        <div className="font-medium text-foreground">
                          {challenge.title}
                        </div>
                        {/* <div className="text-xs text-muted-foreground font-mono">
                          {challenge.slug}
                        </div> */}
                      </td>
                      <td
                        className={`p-4 sm:p-6 text-sm text-left font-medium ${difficultyClass(challenge.difficulty)}`}
                      >
                        {challenge.difficulty}
                      </td>
                      <td className="p-4 sm:p-6 text-sm hidden md:table-cell text-left">
                        {challenge.category}
                      </td>
                      <td className="p-4 sm:p-6 text-xs hidden lg:table-cell text-muted-foreground text-left">
                        {challenge.tags.join(", ")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Surface>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="gap-2"
          >
            <ChevronLeft size={14} />
            Prev
          </Button>
          <span className="text-xs font-mono text-muted-foreground px-2">
            Page {page} / {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="gap-2"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      </main>
    </div>
  );
}
