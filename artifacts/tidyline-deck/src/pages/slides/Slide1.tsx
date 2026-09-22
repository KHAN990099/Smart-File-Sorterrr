const base = import.meta.env.BASE_URL;

export default function Slide1() {
  return (
    <div className="slide-root relative h-screen w-screen overflow-hidden">
      <div className="slide-glow absolute left-[18vw] top-[23vh] h-[68vw] w-[68vw] rounded-full" />
      <div className="slide-vignette pointer-events-none absolute inset-0 z-10" />
      <div className="slide-edge pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-30 flex h-full w-full flex-col items-center pt-[18vh] text-center">
        <h1 className="slide-hero-title max-w-[88vw] text-white">Tidyline</h1>
        <p className="slide-caption mt-[3vh] max-w-[70vw] text-[#6b7280]">
          A quieter way to organize files.
        </p>
        <p className="slide-caption mt-[1.5vh] max-w-[70vw] text-[#9ca3af]">
          Python-powered file organization for local folders
        </p>
      </div>

      <div className="absolute bottom-[-7vh] left-[26vw] z-20 h-[66vh] w-[56vw]">
        <img
          src={base + 'tidyline-orbit.png'}
          alt="Abstract glowing file organizer orbit"
          crossOrigin="anonymous"
          className="h-full w-full object-contain drop-shadow-[0_3vw_5vw_rgba(0,0,0,.9)]"
        />
      </div>
    </div>
  );
}