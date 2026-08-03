import Skeleton from './Skeleton.jsx';

export default function BootSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="w-full max-w-xs space-y-3">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
