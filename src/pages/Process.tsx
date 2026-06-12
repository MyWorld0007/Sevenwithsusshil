import React from 'react';

export default function Process() {
  return (
    <section id="process" className="w-full relative z-10 py-16 md:py-24 px-6 md:px-12 max-w-[1280px] mx-auto">
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
  );
}
