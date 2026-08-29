import { MorphingSpinner } from './ui/morphing-spinner';

export function Loading({ label = 'Loading...', fullScreen }: { label?: string; fullScreen?: boolean }) {
  if (label === 'Restoring session...') {
    return (
      <div className={`min-h-[100vh] bg-[#f4f7fb] flex flex-col items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <MorphingSpinner size="md" />
          <p className="text-[12px] text-[#718096] flex gap-1 font-medium">
            {label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`loading ${fullScreen ? 'full-screen' : ''}`}>
      <span className="spinner"/>
      {label}
    </div>
  );
}
