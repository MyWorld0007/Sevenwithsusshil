import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { PathwayCard } from '../Types';

export default function Services({ isFullPage = false }: { isFullPage?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [services, setServices] = useState<PathwayCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/pathway_cards")
      .then(res => res.json())
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  
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
      <p className="text-muted text-lg font-light text-center max-w-[500px] mx-auto mb-12">Each reading is a deeply personal journey tailored to your unique numerical blueprint, holistic healing path, and life circumstances.</p>

      {loading ? (
        <div className="flex justify-center p-12 text-gold">Loading pathways...</div>
      ) : (
        <>
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
          {services.map((srv, i) => (
            <ServiceCard key={srv.id || i} srv={srv} />
          ))}
        </div>
      ) : (
        <>
            <div ref={scrollRef} className="flex gap-6 w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
            {services.map((srv, i) => (
                <div key={srv.id || i} className="min-w-[320px] md:min-w-[350px] w-[320px] md:w-[350px] flex-shrink-0 snap-start">
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
      </>
      )}
    </section>
  );
}

function ServiceCard({ srv }: { srv: PathwayCard; key?: React.Key }) {
    return (
        <div className="h-full bg-bg-card border border-gold/20 p-8 relative overflow-hidden transition-all duration-300 hover:border-gold/45 group reveal vis shadow-[0_0_20px_rgba(201,160,80,0.03)] rounded-sm flex flex-col justify-between">
            <div>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold transition-all duration-500 group-hover:w-full"></div>
              <div className="font-serif text-4xl font-normal text-gold/60 leading-none mb-6">{srv.card_number}</div>
              <h3 className="font-serif text-lg font-medium mb-3">{srv.title}</h3>
              <p className="text-[13px] font-light leading-[1.85] text-muted mb-6">{srv.short_desc}</p>
            </div>
            <Link to={`/service/${srv.slug}`} className="text-[10px] font-medium tracking-[0.14em] uppercase text-gold hover:text-gold-lt transition-colors mt-auto block w-fit">Explore →</Link>
        </div>
    );
}
