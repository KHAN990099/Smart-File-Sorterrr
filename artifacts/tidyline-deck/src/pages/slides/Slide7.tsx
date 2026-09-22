export default function Slide7() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-grid pointer-events-none absolute inset-0" />
      <div className="slide-glow-soft absolute right-[-18vw] top-[12vh] h-[64vw] w-[64vw] rounded-full" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-10 flex h-full w-full flex-col px-[8vw] py-[9vh]">
        <div className="flex items-end justify-between">
          <h1 className="slide-title max-w-[67vw]">Simple architecture, ready to extend</h1>
          <div className="slide-number pb-[.8vh]">07</div>
        </div>
        <div className="line-accent mt-[4vh] w-[29vw]" />

        <div className="mt-[6vh] flex items-center gap-[1.4vw]">
          <div className="dark-surface flex h-[13vh] w-[20vw] flex-col justify-center px-[2vw]">
            <div className="slide-caption !text-[1vw] text-[#b9f227]">Frontend</div>
            <div className="mt-[1.5vh] text-[2.1vw] font-medium">React dashboard</div>
          </div>
          <div className="text-[2.3vw] text-[#b9f227]">→</div>
          <div className="accent-surface flex h-[13vh] w-[20vw] flex-col justify-center px-[2vw]">
            <div className="slide-caption !text-[1vw] text-[#b9f227]">API</div>
            <div className="mt-[1.5vh] text-[2.1vw] font-medium">FastAPI service</div>
          </div>
          <div className="text-[2.3vw] text-[#b9f227]">→</div>
          <div className="dark-surface flex h-[13vh] w-[20vw] flex-col justify-center px-[2vw]">
            <div className="slide-caption !text-[1vw] text-[#b9f227]">Storage</div>
            <div className="mt-[1.5vh] text-[2.1vw] font-medium">Service host</div>
          </div>
        </div>

        <div className="mt-[7vh] grid grid-cols-2 gap-x-[7vw] gap-y-[2.4vh]">
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body">React dashboard for folder selection and review</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body">FastAPI service at /organizer-api</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body">File operations stay on the service host</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body">Schedule settings persist in JSON</p>
          </div>
          <div className="accent-surface col-span-2 flex gap-[1.5vw] px-[1.6vw] py-[1.8vh]">
            <span className="bullet-mark" />
            <p className="slide-body">AWS path: mount storage and move scheduling to a managed job runner for multi-instance deployments</p>
          </div>
        </div>
      </div>
    </div>
  );
}