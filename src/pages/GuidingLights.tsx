import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';
import { Partner } from '../Types';

export default function GuidingLights() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await apiFetch('/api/partners');
        if (res.ok) {
          const data = await res.json();
          setPartners(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark pt-32 pb-24 text-text-main flex flex-col items-center">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-light font-serif mb-6">My Guiding Lights</h1>
          <p className="text-sm md:text-base font-light text-muted uppercase tracking-[0.2em]">Our Healers</p>
          <div className="w-px h-16 bg-gold/30 mx-auto mt-12"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center text-gold/60 py-20 uppercase tracking-widest text-xs">Loading guides...</div>
        ) : partners.filter(p => p.status !== 'pause').length === 0 ? (
          <div className="text-center text-muted font-light">No guides currently listed.</div>
        ) : (
          <div className="flex flex-col gap-24">
            {partners.filter(p => p.status !== 'pause').map((partner, i) => (
              <motion.div 
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start"
              >
                <div className={`md:col-span-5 relative min-w-0 max-w-[320px] md:max-w-none mx-auto w-full ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="w-full aspect-[3/4] bg-bg-input border border-gold/20 rounded-sm flex items-center justify-center relative shadow-[0_0_40px_rgba(201,160,80,0.1)] overflow-hidden">
                    {partner.profile_photo ? (
                       <img src={partner.profile_photo} alt={partner.name} className="w-full h-full object-cover relative z-10 transition-transform duration-700 hover:scale-105" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gold/30 font-serif relative z-10 text-4xl">
                          {partner.name?.charAt(0) || '?'}
                       </div>
                    )}
                  </div>
                </div>
                
                <div className={`md:col-span-7 min-w-0 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                  {partner.gratitude && (
                    <div 
                      className="text-[18px] md:text-[22px] font-light font-serif leading-[1.6] text-gold/90 mb-6 ql-editor-render" 
                      dangerouslySetInnerHTML={{ __html: partner.gratitude }} 
                    />
                  )}
                  <h2 className="text-3xl md:text-5xl font-light font-serif leading-[1.18] mb-4 text-gold">
                    {partner.name}
                  </h2>
                  <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-text-main mb-6">
                    {partner.title}
                  </p>
                  <div 
                    className="text-[15px] font-light leading-[1.95] text-muted ql-editor-render"
                    dangerouslySetInnerHTML={{ __html: partner.description }} 
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
