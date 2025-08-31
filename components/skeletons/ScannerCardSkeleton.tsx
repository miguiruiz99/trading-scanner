export function ScannerCardSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className="h-24 w-full bg-muted animate-pulse rounded-xl"
        />
      ))}
    </div>
  );
}
