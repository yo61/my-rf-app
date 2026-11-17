import { RELEASE } from '@/ui/release'

/** A pill on every page naming the release, so a deployed environment shows what it runs. */
export function ReleaseBanner() {
  return (
    <div
      role="status"
      data-release={RELEASE.version}
      className={`pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold shadow-lg ${RELEASE.className}`}
    >
      Release {RELEASE.version} · {RELEASE.name}
    </div>
  )
}
