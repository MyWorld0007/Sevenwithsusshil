import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ALL_SERVICES = [
  { n: '01', title: 'Life Path Reading', slug: 'life-path-reading', desc: 'A comprehensive exploration of your core numbers — life path, destiny, soul urge, and personality — revealing who you are at your deepest level.' },
  { n: '02', title: 'Birth Date, Name Analysis & Name Correction', slug: 'birth-name-analysis', desc: 'Your name is not a coincidence. Uncover hidden frequencies in your name and birth date, with guidance on name correction to shape your destiny.' },
  { n: '03', title: 'Relationship Compatibility Analysis', slug: 'relationship-compatibility', desc: 'Explore the numerological dynamics between you and a partner, friend, or colleague for deeper understanding and harmonious connection.' },
  { n: '04', title: 'Career Path & Success Guidance', slug: 'career-success-guidance', desc: 'Align your professional path with your soul\'s calling. Use numerology as a compass when facing pivotal decisions and transitions.' },
  { n: '05', title: 'Child Birth Date & Name Alignment Analysis', slug: 'child-name-alignment', desc: 'Ensure your child\'s name aligns perfectly with their birth date frequencies, giving them a harmonious start to their life journey.' },
  { n: '06', title: 'Business Numerology & Prosperity Blueprint', slug: 'business-numerology', desc: 'Optimize your business name, launch dates, and brand frequencies to attract abundance, success, and long-term prosperity.' },
  { n: '07', title: 'Lucky Numbers, Alphabets & Colour Alignment Guidance', slug: 'lucky-alignment', desc: 'Discover your most auspicious numbers, letters, and colors. Learn how to integrate them into your daily life for enhanced luck and flow.' },
  { n: '08', title: 'Focused Insight Session (Single Question Guidance)', slug: 'focused-insight', desc: 'Have a specific, burning question? Receive targeted, clear numerological guidance on a single pressing issue or decision.' },
  { n: '09', title: 'Gemstone, Crystal, Rudraksha & Yantra Recommendation', slug: 'gemstone-crystal-rudraksha-recommendation', desc: 'Identify which gemstone, crystal, or Rudraksha is naturally aligned with your energy to create greater balance, inner stability, and support your journey toward success.' }
];

export default function Services({ isFullPage = false }: { isFullPage?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className={`w-full relative z-10 py-16 md:py-24 px-6 md:px-12 max-w-[1280px] mx-auto ${!isFullPage ? 'flex flex-col justify-center' : ''}`}>
      <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">What I Offer</p>
      <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
      <h2 className="text-4xl md:text-5xl font-light font-serif text-center leading-[1.2] mb-4">Pathways to Clarity</h2>
      <p className="text-muted text-lg font-light text-center max-w-[500px] mx-auto mb-12">Each reading is a deeply personal journey tailored to your unique numerical blueprint and life circumstances.</p>

      {!isFullPage && (
        <div className="flex justify-end gap-2 mb-6 max-w-full">
            <button onClick={() => scroll('left')} className="p-2 border border-gold/20 hover:bg-gold/10 text-gold rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="p-2 border border-gold/20 hover:bg-gold/10 text-gold rounded-full transition-colors">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      )}

      {isFullPage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {ALL_SERVICES.map((srv, i) => (
            <ServiceCard key={i} srv={srv} />
          ))}
        </div>
      ) : (
        <>
            <div ref={scrollRef} className="flex gap-6 w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
            {ALL_SERVICES.map((srv, i) => (
                <div key={i} className="min-w-[320px] md:min-w-[350px] w-[320px] md:w-[350px] flex-shrink-0 snap-start">
                    <ServiceCard srv={srv} />
                </div>
            ))}
            </div>
            <div className="mt-12 flex justify-center">
                <Link to="/services" className="bg-gold text-bg-dark px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors inline-block">
                    Explore All Services
                </Link>
            </div>
        </>
      )}
    </section>
  );
}

function ServiceCard({ srv }: { srv: typeof ALL_SERVICES[0]; key?: React.Key }) {
    return (
        <div className="h-full bg-bg-card border border-gold/20 p-8 relative overflow-hidden transition-all duration-300 hover:border-gold/45 group reveal vis shadow-[0_0_20px_rgba(201,160,80,0.03)] rounded-sm flex flex-col justify-between">
            <div>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold transition-all duration-500 group-hover:w-full"></div>
              <div className="font-serif text-4xl font-normal text-gold/60 leading-none mb-6">{srv.n}</div>
              <h3 className="font-serif text-lg font-medium mb-3">{srv.title}</h3>
              <p className="text-[13px] font-light leading-[1.85] text-muted mb-6">{srv.desc}</p>
            </div>
            <Link to={`/service/${srv.slug}`} className="text-[10px] font-medium tracking-[0.14em] uppercase text-gold hover:text-gold-lt transition-colors mt-auto block w-fit">Explore →</Link>
        </div>
    );
}
