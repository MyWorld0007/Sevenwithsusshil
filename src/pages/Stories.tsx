import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../Types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Stories() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch('/api/testimonials')
      .then(async res => {
          if (!res.ok) throw new Error("Fetch failed");
          const text = await res.text();
          if (!text) throw new Error("Empty response");
          return JSON.parse(text);
      })
      .then(data => setTestimonials(data))
      .catch(err => {
          console.error("Could not fetch testimonials, using defaults", err);
          setTestimonials([
            { id: 1, text: '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', initial: 'P', name: 'Priya Malhotra', loc: 'Mumbai, India', date: 'October 2023', rating: 5 },
            { id: 2, text: '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', initial: 'R', name: 'Rohan Kapoor', loc: 'Bangalore, India', date: 'November 2023', rating: 5 },
            { id: 3, text: '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', initial: 'A', name: 'Anjali Singh', loc: 'Delhi, India', date: 'January 2024', rating: 5 },
            { id: 4, text: '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', initial: 'S', name: 'Sarah T.', loc: 'London, UK', date: 'March 2024', rating: 5 }
          ]);
      });
  }, []);

  const nextSlide = () => {
    if (testimonials.length <= 3) return;
    setCurrentIndex(prev => (prev + 1) % (testimonials.length - 2)); 
  };

  const prevSlide = () => {
    if (testimonials.length <= 3) return;
    setCurrentIndex(prev => (prev - 1 < 0 ? testimonials.length - 3 : prev - 1));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

  const TestimonialCard = ({ tst }: { tst: Testimonial; key?: React.Key }) => (
    <div className="bg-bg-card border border-gold/20 p-8 rounded-sm reveal vis shadow-[0_0_20px_rgba(201,160,80,0.03)] h-full flex flex-col justify-between">
      <div>
        <div className="text-gold text-[10px] tracking-[0.12em] mb-4">
          {'★'.repeat(tst.rating || 5)}{'☆'.repeat(5 - (tst.rating || 5))}
        </div>
        <p className="font-serif text-lg font-light italic leading-[1.85] text-muted mb-6">{tst.text}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-serif text-lg text-gold flex-shrink-0">{tst.initial}</div>
          <div>
            <div className="text-[14px] font-medium">{tst.name}</div>
            <div className="text-[11px] text-dim mt-1">{tst.loc}</div>
          </div>
        </div>
        {tst.date && (
           <div className="text-[10px] text-dim uppercase tracking-widest text-right max-w-[80px]">{tst.date}</div>
        )}
      </div>
    </div>
  );

  return (
    <section id="testimonials" className="w-full relative z-10 py-32 px-6 md:px-12 max-w-[1280px] mx-auto min-h-screen flex flex-col justify-center">
      <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">Client Stories</p>
      <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
      <h2 className="text-4xl md:text-5xl font-light font-serif text-center mb-4">Voices of Transformation</h2>
      <p className="text-muted text-lg font-light text-center max-w-[500px] mx-auto mb-16">Real journeys from people who discovered clarity through the language of numbers.</p>

      {testimonials.length > 0 ? (
        <>
          {/* MOBILE VIEW */}
          <div className="md:hidden">
            <div className="flex justify-end gap-2 mb-6 max-w-full">
                <button onClick={() => scroll('left')} className="p-2 border border-gold/20 hover:bg-gold/10 text-gold rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => scroll('right')} className="p-2 border border-gold/20 hover:bg-gold/10 text-gold rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            <div ref={scrollRef} className="flex gap-4 w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
              {testimonials.map((tst, i) => (
                  <div key={i} className="min-w-[85vw] w-[85vw] flex-shrink-0 snap-center">
                      <TestimonialCard tst={tst} />
                  </div>
              ))}
            </div>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block relative">
            {testimonials.length > 3 && (
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between z-20 pointer-events-none px-2 sm:px-0">
                 <button onClick={prevSlide} className="pointer-events-auto -ml-3 sm:-ml-12 p-2 bg-bg-card border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition">
                    <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button onClick={nextSlide} className="pointer-events-auto -mr-3 sm:-mr-12 p-2 bg-bg-card border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition">
                    <ChevronRight className="w-6 h-6" />
                 </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleTestimonials.map((tst, i) => (
                <TestimonialCard key={i} tst={tst} />
              ))}
            </div>
          </div>
        </>
      ) : (
         <p className="text-center text-muted">No stories available.</p>
      )}
    </section>
  );
}
