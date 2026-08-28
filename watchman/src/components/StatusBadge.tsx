export function StatusBadge({ status }: { status: 'INSIDE' | 'EXITED' }) { return <span className={`badge ${status === 'INSIDE' ? 'amber' : 'green'}`}><i/> {status}</span>; }
