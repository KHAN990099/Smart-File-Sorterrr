export default function Slide8() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-glow absolute left-[18vw] top-[18vh] h-[68vw] w-[68vw] rounded-full opacity-70" />
      <div className="slide-vignette pointer-events-none absolute inset-0 z-10" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-30 flex h-full w-full flex-col px-[8vw] py-[9vh]">
        <div className="flex items-end justify-between">
          <h1 className="slide-title max-w-[68vw]">From tidy folder to dependable service</h1>
          <div className="slide-number pb-[.8vh]">08</div>
        </div>
        <div className="line-accent mt-[4vh] w-[35vw]" />

        <div className="mt-[11vh] grid grid-cols-2 gap-x-[8vw] gap-y-[4vh]">
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[35vw]">Publish the working dashboard and FastAPI service</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[35vw]">Mount the intended file storage in AWS</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[35vw]">Add durable schedule storage</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[35vw]">Use a managed scheduler before scaling past one service instance</p>
          </div>
        </div>

        <div className="absolute bottom-[9vh] left-[8vw] right-[8vw] flex items-end justify-between border-t border-white/15 pt-[2.5vh]">
          <div className="slide-caption text-[#b9f227]">Tidyline</div>
          <div className="slide-caption !text-[1vw] text-[#6b7280]">A quieter way to organize files.</div>
        </div>
      </div>
    </div>
  );
}