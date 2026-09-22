export default function Slide4() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-grid pointer-events-none absolute inset-0" />
      <div className="slide-glow-soft absolute left-[33vw] top-[28vh] h-[60vw] w-[60vw] rounded-full" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-10 flex h-full w-full flex-col px-[8vw] py-[9vh]">
        <div className="flex items-end justify-between">
          <h1 className="slide-title max-w-[65vw]">Rules that make sorting predictable</h1>
          <div className="slide-number pb-[.8vh]">04</div>
        </div>
        <div className="line-accent mt-[4vh] w-[30vw]" />

        <div className="mt-[8vh] grid grid-cols-[1fr_1.25fr] gap-[6vw]">
          <div>
            <div className="slide-caption text-[#b9f227]">Type folders</div>
            <div className="mt-[3vh] space-y-[2.2vh]">
              <div className="dark-surface flex items-center gap-[1.2vw] px-[1.5vw] py-[1.6vh]">
                <span className="h-[1vw] w-[1vw] rounded-[.25vw] bg-[#b9f227]" />
                <p className="slide-body !text-[1.9vw]">Type folders: Images, PDFs, Documents, and more</p>
              </div>
              <div className="dark-surface flex items-center gap-[1.2vw] px-[1.5vw] py-[1.6vh]">
                <span className="h-[1vw] w-[1vw] rounded-[.25vw] bg-[#4f46e5]" />
                <p className="slide-body !text-[1.9vw]">Name patterns take precedence over file type</p>
              </div>
            </div>
          </div>

          <div>
            <div className="slide-caption text-[#b9f227]">Name patterns</div>
            <div className="mt-[3vh] grid grid-cols-2 gap-[1.2vw]">
              <div className="dark-surface p-[1.5vw]">
                <div className="font-mono text-[1.2vw] text-[#b9f227]">01</div>
                <p className="slide-body mt-[3vh] !text-[1.85vw]">Screenshots go to Screenshots</p>
              </div>
              <div className="dark-surface p-[1.5vw]">
                <div className="font-mono text-[1.2vw] text-[#b9f227]">02</div>
                <p className="slide-body mt-[3vh] !text-[1.85vw]">Invoices go to Invoices</p>
              </div>
              <div className="dark-surface col-span-2 p-[1.5vw]">
                <div className="font-mono text-[1.2vw] text-[#b9f227]">03</div>
                <p className="slide-body mt-[2vh] !text-[1.85vw]">Resumes, contracts, and meeting notes get their own folders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}