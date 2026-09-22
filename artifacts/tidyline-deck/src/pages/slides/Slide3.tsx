export default function Slide3() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-glow-soft absolute right-[-19vw] top-[-12vh] h-[70vw] w-[70vw] rounded-full" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-10 flex h-full w-full flex-col px-[8vw] py-[9vh]">
        <div className="flex items-end justify-between">
          <h1 className="slide-title max-w-[65vw]">Scan. Understand. Preview. Organize.</h1>
          <div className="slide-number pb-[.8vh]">03</div>
        </div>
        <div className="line-accent mt-[4vh] w-[32vw]" />

        <div className="mt-[8vh] grid grid-cols-4 gap-[1.3vw]">
          <div className="dark-surface min-h-[35vh] p-[2vw]">
            <div className="slide-caption !text-[1vw] text-[#b9f227]">01</div>
            <div className="mt-[14vh] h-[2.2vw] w-[2.2vw] rounded-[.5vw] border border-[#b9f227]">
              <div className="ml-[.55vw] mt-[.55vw] h-[.75vw] w-[.75vw] rounded-[.16vw] bg-[#b9f227]" />
            </div>
            <p className="slide-body mt-[3vh]">Choose a server-visible folder</p>
          </div>
          <div className="dark-surface min-h-[35vh] p-[2vw]">
            <div className="slide-caption !text-[1vw] text-[#b9f227]">02</div>
            <div className="mt-[14vh] flex h-[2.2vw] w-[2.2vw] items-center justify-center rounded-full border border-[#b9f227] text-[1vw] text-[#b9f227]">#</div>
            <p className="slide-body mt-[3vh]">Scan by extension, name pattern, and hash</p>
          </div>
          <div className="dark-surface min-h-[35vh] p-[2vw]">
            <div className="slide-caption !text-[1vw] text-[#b9f227]">03</div>
            <div className="mt-[14vh] h-[2.2vw] w-[2.2vw] border-b border-l border-[#b9f227]">
              <div className="ml-[.85vw] mt-[.55vw] h-[.7vw] w-[1vw] rotate-[-45deg] border-b-[.14vw] border-[#b9f227]" />
            </div>
            <p className="slide-body mt-[3vh]">Review planned folders and duplicate groups</p>
          </div>
          <div className="accent-surface min-h-[35vh] p-[2vw]">
            <div className="slide-caption !text-[1vw] text-[#b9f227]">04</div>
            <div className="mt-[14vh] h-[2.2vw] w-[2.2vw] rounded-[.5vw] bg-[#b9f227]">
              <div className="ml-[.65vw] mt-[.65vw] h-[.9vw] w-[.9vw] rotate-45 border-r-[.12vw] border-t-[.12vw] border-[#050505]" />
            </div>
            <p className="slide-body mt-[3vh] text-white">Organize files and remove exact duplicates after confirmation</p>
          </div>
        </div>
      </div>
    </div>
  );
}