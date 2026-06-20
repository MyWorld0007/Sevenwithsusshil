import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Settings } from '../Types';

export default function Process() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    apiFetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const steps = [
    { 
      num: '1', 
      title: settings?.journey_step1_title || 'Book Your Session', 
      desc: settings?.journey_step1_desc || 'Share your details, concerns, and intentions, then choose the healing or guidance session that best resonates with your current life journey.' 
    },
    { 
      num: '2', 
      title: settings?.journey_step2_title || 'Receive Your Session', 
      desc: settings?.journey_step2_desc || 'In a personalized one-on-one session, experience intuitive guidance, energy alignment, emotional healing, and spiritual insights designed to bring clarity, balance, and deeper self-awareness.' 
    },
    { 
      num: '3', 
      title: settings?.journey_step3_title || 'Continue Your Healing Path', 
      desc: settings?.journey_step3_desc || 'Receive a personalized reflection of your session along with practical guidance, healing practices, and mindful recommendations to support your ongoing growth, transformation, and well-being.' 
    }
  ];

  return (
    <section id="process" className="w-full relative z-10 py-16 md:py-24 px-6 md:px-12 max-w-[1280px] mx-auto">
      <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">How It Works</p>
      <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
      <h2 className="text-4xl md:text-5xl font-light font-serif text-center mb-16">Your Journey in Three Steps</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 reveal vis">
        {steps.map((step, i) => (
          <div key={i} className="p-10 border border-gold/20 -ml-[1px] -mt-[1px] relative transition-colors duration-300 hover:bg-bg-card/50">
            <div className="font-serif text-5xl font-light text-gold leading-none mb-4">{step.num}</div>
            <h3 className="text-lg font-medium tracking-[0.04em] mb-2">{step.title}</h3>
            <div className="text-[13px] font-light leading-[1.85] text-muted ql-editor-render" dangerouslySetInnerHTML={{ __html: step.desc }}></div>
          </div>
        ))}
      </div>
    </section>
  );
}
