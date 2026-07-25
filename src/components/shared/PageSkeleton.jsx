export default function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-1">
      <div className="h-8 w-48 bg-muted rounded-lg" />
      <div className="h-4 w-72 bg-muted rounded" />
      <div className="h-64 w-full bg-muted rounded-2xl" />
    </div>
  )
}
