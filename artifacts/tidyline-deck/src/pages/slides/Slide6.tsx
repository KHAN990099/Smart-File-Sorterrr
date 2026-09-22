export default function Slide6() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-glow-soft absolute left-[-17vw] top-[18vh] h-[64vw] w-[64vw] rounded-full" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-10 flex h-full w-full flex-col px-[8vw] py-[9vh]">
        <div className="flex items-end justify-between">
          <h1 className="slide-title max-w-[66vw]">A schedule that stays out of the way</h1>
          <div className="slide-number pb-[.8vh]">06</div>
        </div>
        <div className="line-accent mt-[4vh] w-[25vw]" />

        <div className="mt-[8vh] grid grid-cols-[.9fr_1.1fr] gap-[8vw]">
          <div className="accent-surface relative min-h-[44vh] overflow-hidden p-[3vw]">
            <div className="slide-caption text-[#b9f227]">Automation</div>
            <div className="mt-[8vh] flex items-center gap-[1.5vw]">
              <div className="h-[2.2vw] w-[4vw] rounded-full bg-[#b9f227] p-[.25vw]">
                <div className="ml-[1.8vw] h-[1.7vw] w-[1.7vw] rounded-full bg-[#050505]" />
              </div>
              <div className="slide-body !text-[2vw]">On</div>
            </div>
            <div className="mt-[12vh] text-[7vw] font-light tracking-[-.08em] text-white">24/7</div>
            <div className="mt-[1vh] slide-caption !text-[1vw] text-[#9ca3af]">quiet background work</div>
          </div>

          <div className="space-y-[2.8vh] pt-[1vh]">
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body">Turn automation on or off with one toggle</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body">Run cleanup daily or weekly</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body">Choose a time and weekly day</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body">See the last run and next run</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="bullet-mark" />
              <p className="slide-body">Trigger a manual run anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}