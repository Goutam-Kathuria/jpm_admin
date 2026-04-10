import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  const headerCols = Array.from({ length: columns }, (_, n) => `hc${n}`);
  const rowItems = Array.from({ length: rows }, (_, n) => `r${n}`);
  const colItems = Array.from({ length: columns }, (_, n) => `c${n}`);

  return (
    <div className="space-y-3">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {headerCols.map((k) => (
          <Skeleton key={k} className="h-4 rounded" />
        ))}
      </div>
      {rowItems.map((rowKey) => (
        <div
          key={rowKey}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {colItems.map((colKey) => (
            <Skeleton key={`${rowKey}-${colKey}`} className="h-9 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  const cards = Array.from({ length: count }, (_, n) => `card${n}`);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((k) => (
        <div
          key={k}
          className="bg-card border border-border rounded-lg p-5 space-y-3"
        >
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      ))}
    </div>
  );
}
