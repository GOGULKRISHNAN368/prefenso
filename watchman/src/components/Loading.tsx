export function Loading({ label = 'Loading...', fullScreen }: { label?: string; fullScreen?: boolean }) {
  return (
    <div className={`loading ${fullScreen ? 'full-screen' : ''}`}>
      <span className="spinner"/>
      {label}
    </div>
  );
}
