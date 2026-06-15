import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ALL_SERVICES = [
  { n: '01', title: 'Child Birth Date & Name Alignment Analysis', slug: 'child-name-alignment', desc: 'Discover the optimal name vibration and cosmic alignment for your child\'s birth energy.' },
  { n: '02', title: 'Career Path & Success Guidance', slug: 'career-success-guidance', desc: 'Explore your professional potential, ideal sectors, and key timing for career breakthroughs or transitions.' },
  { n: '03', title: 'Relationship Compatibility Analysis', slug: 'relationship-compatibility', desc: 'Decipher the numerical resonance between partners to nourish harmony and conscious relationship growth.' },
  { n: '04', title: 'Birth Date, Name Analysis & Name Correction', slug: 'birth-name-analysis', desc: 'A comprehensive analysis of your birth energy and full name correction for lifetime cosmic harmony.' },
  { n: '05', title: 'Business Numerology & Prosperity Blueprint', slug: 'business-numerology', desc: 'Optimize corporate/brand alignment, choose lucky launch dates, and blueprint your business success.' },
  { n: '06', title: 'Lucky Numbers, Alphabets & Colour Alignment', slug: 'lucky-alignment', desc: 'Elevate your daily frequency by aligning with your supportive numbers, letters, and visual energies.' },
  { n: '07', title: 'Focused Insight Session', slug: 'focused-insight', desc: 'Directly target a single query or burning question for swift, clear metaphysical clarity (Single Question).' },
  { n: '08', title: 'Gemstone, Crystal, Rudraksha & Yantra Recommendation', slug: 'gemstone-crystal-rudraksha-recommendation', desc: 'Receive personalized astronomical cosmic prescription of specific crystals, powerful Rudrakshas, and precious gemstones to amplify protective fields and lucky energy bands.' },
  { n: '09', title: 'Mobile Number Numerology', slug: 'mobile-number-numerology', desc: 'Analyze and optimize your mobile number vibrations to enhance communication, opportunities, prosperity, and overall life harmony.' },
  { n: '10', title: 'Partnered Expert Reiki Healings', slug: 'reiki-healings', desc: 'Experience energy healing through our Expert Reiki Healers to promote emotional balance, stress relief, inner peace, and overall well-being.' },
  { n: '11', title: 'Partnered Expert Tarot Card Readings', slug: 'tarot-readings', desc: 'Gain intuitive guidance and deeper insights into life\'s questions, challenges, opportunities, and future possibilities through Tarot.' },
  { n: '12', title: 'Partnered Expert Guided Meditation', slug: 'guided-meditation', desc: 'Experience guided meditation sessions designed to reduce stress, improve focus, enhance self-awareness, and foster inner harmony.' },
  { n: '13', title: 'Partnered Expert Chakra Healings', slug: 'chakra-healings', desc: 'Restore balance and harmony to your energy centers through chakra healing for improved emotional, mental, physical, and spiritual well-being.' }
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
