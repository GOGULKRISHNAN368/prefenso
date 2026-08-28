export function Loading({ label = 'Loading...' }: { label?: string }) { return <div className="loading-state"><span className="spinner" aria-hidden="true"/>{label}</div>; }
export function SkeletonCards() { return <div className="stats-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton-card" key={item}/>)}</div>; }
