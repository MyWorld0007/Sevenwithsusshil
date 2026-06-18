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
          <h1 className="text-4xl md:text-6xl font-light font-serif mb-6">My Guiding lights</h1>
          <p className="text-sm md:text-base font-light text-muted uppercase tracking-[0.2em]">Our Healers</p>
          <div className="w-px h-16 bg-gold/30 mx-auto mt-12"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center text-gold/60 py-20 uppercase tracking-widest text-xs">Loading guides...</div>
        ) : partners.length === 0 ? (
          <div className="text-center text-muted font-light">No guides currently listed.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            {partners.map((partner, i) => (
              <motion.div 
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-8"
              >
                <div className="w-full aspect-[3/4] bg-bg-card border border-gold/20 rounded-sm relative overflow-hidden group shadow-[0_0_30px_rgba(201,160,80,0.05)]">
                  {partner.profile_photo ? (
                     <img src={partner.profile_photo} alt={partner.name} className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                     <div className="w-full h-full bg-bg-input flex items-center justify-center text-gold/30 font-serif relative z-10">
                        {partner.name?.charAt(0) || '?'}
                     </div>
                  )}
                  <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/30 transition-colors z-20 pointer-events-none mix-blend-overlay"></div>
                </div>
                
                <div className="text-center md:text-left px-4 md:px-0">
                  <h3 className="text-3xl font-serif text-gold mb-2">{partner.gratitude ? `${partner.gratitude} ` : ''}{partner.name}</h3>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-text-main mb-6">{partner.title}</h4>
                  <p className="text-[14px] font-light leading-[1.85] text-muted whitespace-pre-wrap">{partner.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
