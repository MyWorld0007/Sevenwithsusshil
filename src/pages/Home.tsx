import React from 'react';

export default function Home() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section id="hero" className="w-full relative z-10 grid grid-cols-1 md:grid-cols-12 gap-2 lg:gap-8 px-8 md:px-16 items-center min-h-[90vh] pt-32 max-w-[1280px] mx-auto">
        <div className="md:col-span-12 lg:col-span-7 flex flex-col reveal vis">
          <div className="flex items-center gap-4 text-[11px] tracking-[0.35em] uppercase text-gold mb-6">
            <span className="opacity-50">—</span> MASTER NUMEROLOGIST <span className="opacity-50">—</span>
          </div>
          <h1 className="text-5xl md:text-[5.5rem] font-light font-serif leading-[1.05] mb-8">
            Decode the <em className="bg-gradient-to-r from-gold to-gold-lt bg-clip-text text-transparent italic pe-2">Language</em><br />of the Universe
          </h1>
          <p className="text-text-main/90 text-lg md:text-xl font-light leading-relaxed max-w-lg mb-12">
            Every number carries a vibration. Your birth date, your name — they hold the blueprint of your soul. Let the ancient science illuminate your path.
          </p>
          <div className="flex flex-wrap gap-6 mt-4">
            <a href="/#calculator" className="bg-gold text-bg-dark px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors inline-block">Discover Your Number</a>
            <a href="/#booking" className="border border-gold/30 text-gold px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors inline-block">Book a Reading</a>
          </div>
        </div>
        <div className="flex justify-center md:col-span-12 lg:col-span-5 reveal vis items-center order-first lg:order-none mb-4 md:-mb-8 lg:mb-0 lg:mt-0">
          <video src="/logo.mp4" autoPlay loop muted playsInline className="w-[70%] sm:w-[60%] md:w-[50%] lg:w-[90%] xl:w-full max-w-[400px] lg:max-w-[500px] object-contain" style={{ filter: 'drop-shadow(0px 0px 40px rgba(201,160,80,0.15))', borderRadius: '4px' }} />
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section id="process" className="w-full relative z-10 py-24 px-6 md:px-12 max-w-[1280px] mx-auto">
        <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">How It Works</p>
        <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
        <h2 className="text-4xl md:text-5xl font-light font-serif text-center mb-16">Your Journey in Three Steps</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 reveal vis">
          {[
            { num: '1', title: 'Book Your Session', desc: 'Share your birth details and intentions. Choose the type of reading that resonates with your current moment in life.' },
            { num: '2', title: 'Receive Your Reading', desc: 'In a 60-minute online session, we explore your complete numerical blueprint with depth, clarity, and compassion.' },
            { num: '3', title: 'Walk Your Path', desc: 'Receive a written summary of your reading and practical guidance you can return to as you navigate your journey.' }
          ].map((step, i) => (
            <div key={i} className="p-10 border border-gold/20 -ml-[1px] -mt-[1px] relative transition-colors duration-300 hover:bg-bg-card/50">
              <div className="font-serif text-5xl font-light text-gold leading-none mb-4">{step.num}</div>
              <h3 className="text-lg font-medium tracking-[0.04em] mb-2">{step.title}</h3>
              <p className="text-[13px] font-light leading-[1.85] text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
