import { useEffect, useMemo, useState } from "react";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Position } from "@/store/positionsApi";
import { Button } from "@/components/ui/button";

type PositionListProps = {
  positions: Position[];
  submissionsCountByPosition: Record<string, number>;
};

export default function PositionList({
  positions,
  submissionsCountByPosition,
}: PositionListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const perPage = 6;

  const totalPages = Math.max(1, Math.ceil(positions.length / perPage));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedPositions = useMemo(() => {
    const start = (page - 1) * perPage;
    return positions.slice(start, start + perPage);
  }, [page, positions]);

  if (positions.length === 0) {
    return (
      <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
        No positions yet. Create your first position to start inviting
        candidates.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {paginatedPositions.map((position) => {
          const submissionsCount =
            submissionsCountByPosition[position._id] ?? 0;
          return (
            <button
              key={position._id}
              onClick={() => navigate(`/positions/${position._id}`)}
              className="text-left rounded-lg border border-border p-4 transition-all hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground line-clamp-1">
                    {position.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                    <Briefcase size={12} />
                    {position.challenges.length} challenges
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {submissionsCount} submissions
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded bg-secondary text-muted-foreground ring-1 ring-border">
                  {position.isActive === false ? "Inactive" : "Active"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {positions.length > perPage && (
        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground font-mono">
            Showing {(page - 1) * perPage + 1}-
            {Math.min(page * perPage, positions.length)} of {positions.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft size={14} />
              Prev
            </Button>
            <span className="text-xs font-mono text-muted-foreground px-2">
              {page}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
