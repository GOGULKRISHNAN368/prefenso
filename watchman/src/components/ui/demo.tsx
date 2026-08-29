import { MorphingSpinner } from "./morphing-spinner";

export default function Demo() {
  return (
    <main className="min-h-[260px] bg-[#f4f7fb] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <MorphingSpinner size="lg" />
        <p className="text-[12px] text-[#718096] flex gap-1 font-medium">
          Restoring session...
        </p>
      </div>
    </main>
  )
}
