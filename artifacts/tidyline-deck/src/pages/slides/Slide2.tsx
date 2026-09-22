export default function Slide2() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-glow-soft absolute left-[-20vw] top-[18vh] h-[68vw] w-[68vw] rounded-full" />
      <div className="slide-grid pointer-events-none absolute inset-0" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-10 flex h-full w-full flex-col px-[8vw] py-[9vh]">
        <div className="flex items-end justify-between">
          <h1 className="slide-title max-w-[62vw]">Manual file cleanup creates clutter and risk</h1>
          <div className="slide-number pb-[.8vh]">02</div>
        </div>
        <div className="line-accent mt-[4vh] w-[26vw]" />

        <div className="mt-[9vh] grid grid-cols-2 gap-x-[8vw] gap-y-[5vh]">
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[32vw]">Downloads fill with mixed file types</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[32vw]">Screenshots and invoices disappear into generic folders</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[32vw]">Duplicate copies consume space</p>
          </div>
          <div className="flex gap-[1.5vw]">
            <span className="bullet-mark" />
            <p className="slide-body max-w-[32vw]">One-off scripts rarely explain what they changed</p>
          </div>
        </div>

        <div className="absolute bottom-[9vh] right-[8vw] flex items-center gap-[1vw] text-[#6b7280]">
          <span className="h-[.7vw] w-[.7vw] rounded-full bg-[#b9f227]" />
          <span className="slide-caption !text-[1vw]">A visible plan before a file moves</span>
        </div>
      </div>
    </div>
  );
}