import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { Link } from 'react-router-dom';

export default function Booking() {
  const settings = useSettings();

  return (
    <section id="booking" className="w-full relative z-10 py-16 md:py-24 px-6 md:px-12 text-center overflow-hidden flex flex-col items-center justify-center">
      <div className="font-serif text-[18vw] font-light text-gold/[0.045] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none z-0">✦</div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[70px] bg-gradient-to-b from-transparent to-gold"></div>
      
      <div className="relative z-10 max-w-[1280px] mx-auto reveal vis mt-8">
        <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Begin Your Journey</p>
        <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
        <h2 className="text-4xl md:text-6xl font-light font-serif leading-[1.16] mb-6">Your numbers are<br /><em className="italic text-gold not-italic">waiting to speak</em></h2>
        <p className="text-muted text-[15px] font-light leading-[1.9] max-w-[450px] mx-auto mb-10">Book a personal session and step into a conversation with your own cosmic blueprint. Sessions available online, worldwide.</p>

        {settings && (
        <div className="mt-16 flex flex-col items-center">
          <Link 
            to="/pricing"
            className="bg-gold text-bg-dark px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors inline-block"
          >
            Book Now
          </Link>
        </div>
        )}
      </div>
    </section>
  );
}
