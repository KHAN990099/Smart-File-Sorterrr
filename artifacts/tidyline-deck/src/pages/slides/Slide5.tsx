export default function Slide5() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-glow absolute right-[-14vw] top-[8vh] h-[68vw] w-[68vw] rounded-full opacity-60" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-10 flex h-full w-full flex-col px-[8vw] py-[9vh]">
        <div className="flex items-end justify-between">
          <h1 className="slide-title max-w-[66vw]">Duplicate cleanup with guardrails</h1>
          <div className="slide-number pb-[.8vh]">05</div>
        </div>
        <div className="line-accent mt-[4vh] w-[28vw]" />

        <div className="mt-[8vh] grid grid-cols-[.85fr_1.15fr] gap-[7vw]">
          <div className="relative flex min-h-[48vh] items-center justify-center">
            <div className="absolute h-[24vw] w-[24vw] rounded-full border border-[#4f46e5] opacity-60" />
            <div className="absolute h-[16vw] w-[16vw] rounded-full border border-[#b9f227] opacity-70" />
            <div className="relative flex h-[9vw] w-[9vw] items-center justify-center rounded-[1.4vw] bg-[#b9f227] text-[4vw] font-light text-[#050505] shadow-[0_0_4vw_rgba(185,242,39,.35)]">#</div>
          </div>

          <div className="space-y-[3.1vh] pt-[2vh]">
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body max-w-[46vw]">SHA-256 hashes identify byte-for-byte matches</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body max-w-[46vw]">Files are grouped by size before hashing</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body max-w-[46vw]">One deterministic original is kept per match group</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body max-w-[46vw]">Preview mode never changes files</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body max-w-[46vw]">Cleanup removes exact duplicates after a clear confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}