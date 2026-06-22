import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section id="hero" className="w-full relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 px-6 md:px-12 items-center min-h-[80vh] md:min-h-[85vh] pt-24 md:pt-32 pb-16 max-w-[1280px] mx-auto">
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
          <div className="flex flex-row flex-wrap xl:flex-nowrap items-center gap-3 mt-4 w-full">
            <Link 
              to="/my-guiding-lights" 
              className="inline-block text-center bg-gold text-bg-dark px-5 py-4 text-[9px] sm:text-[10px] lg:text-xs font-semibold tracking-[0.15em] md:tracking-[0.2em] uppercase hover:bg-gold-lt transition-colors whitespace-nowrap flex-1 md:flex-none"
            >
              My Guiding Lights
            </Link>
            <a href="/#calculator" className="inline-block text-center border border-gold/30 text-gold px-5 py-4 text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-gold/10 transition-colors whitespace-nowrap flex-1 md:flex-none">Discover Your Number</a>
            <Link to="/pricing" className="inline-block text-center border border-gold/30 text-gold px-5 py-4 text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-gold/10 transition-colors whitespace-nowrap flex-1 md:flex-none">Book a Reading</Link>
          </div>
        </div>
        <div className="flex justify-center md:col-span-12 lg:col-span-5 reveal vis items-center order-first lg:order-none mb-12 lg:mb-0 lg:mt-0">
          <video src="/logo.mp4" autoPlay loop muted playsInline className="w-[70%] sm:w-[60%] md:w-[50%] lg:w-[90%] xl:w-full max-w-[400px] lg:max-w-[500px] object-contain" style={{ filter: 'drop-shadow(0px 0px 40px rgba(201,160,80,0.15))', borderRadius: '4px' }} />
        </div>
      </section>
    </>
  );
}
