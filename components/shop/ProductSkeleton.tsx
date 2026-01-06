export function ProductSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full" />
            <div className="space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
            </div>
        </div>
    );
}
