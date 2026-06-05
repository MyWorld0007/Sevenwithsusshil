import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <section id="services" className="w-full relative z-10 py-32 px-6 md:px-12 max-w-[1280px] mx-auto min-h-screen flex flex-col justify-center">
      <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">What I Offer</p>
      <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
      <h2 className="text-4xl md:text-5xl font-light font-serif text-center leading-[1.2] mb-4">Pathways to Clarity</h2>
      <p className="text-muted text-lg font-light text-center max-w-[500px] mx-auto mb-16">Each reading is a deeply personal journey tailored to your unique numerical blueprint and life circumstances.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[
          { n: '01', title: 'Life Path Reading', slug: 'life-path-reading', desc: 'A comprehensive exploration of your core numbers — life path, destiny, soul urge, and personality — revealing who you are at your deepest level.' },
          { n: '02', title: 'Name Analysis', slug: 'name-analysis', desc: 'Your name is not a coincidence. Uncover the hidden frequencies encoded in your full birth name and how they shape your destiny and opportunities.' },
          { n: '03', title: 'Relationship Compatibility', slug: 'relationship-compatibility', desc: 'Explore the numerological dynamics between you and a partner, friend, or colleague for deeper understanding and harmonious connection.' },
          { n: '04', title: 'Career & Purpose Mapping', slug: 'career-purpose-mapping', desc: 'Align your professional path with your soul\'s calling. Use numerology as a compass when facing pivotal decisions and transitions.' }
        ].map((srv, i) => (
          <div key={i} className="bg-bg-card border border-gold/20 p-8 relative overflow-hidden transition-all duration-300 hover:border-gold/45 group reveal vis shadow-[0_0_20px_rgba(201,160,80,0.03)] rounded-sm flex flex-col justify-between">
            <div>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold transition-all duration-500 group-hover:w-full"></div>
              <div className="font-serif text-4xl font-normal text-gold/60 leading-none mb-6">{srv.n}</div>
              <h3 className="font-serif text-lg font-medium mb-3">{srv.title}</h3>
              <p className="text-[13px] font-light leading-[1.85] text-muted mb-6">{srv.desc}</p>
            </div>
            <Link to={`/service/${srv.slug}`} className="text-[10px] font-medium tracking-[0.14em] uppercase text-gold hover:text-gold-lt transition-colors mt-auto block w-fit">Explore →</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
