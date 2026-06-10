import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { LifePath } from '../Types';

function reduce(n: number): number {
  if (n <= 9) return n;
  return reduce([...String(n)].reduce((a, d) => a + +d, 0));
}

function reduceFinal(n: number): number {
  if ([11, 22, 33, 13, 14, 16, 19].includes(n)) return n;
  if (n <= 9) return n;
  return reduceFinal([...String(n)].reduce((a, d) => a + +d, 0));
}

function sumDigits(n: number) { return [...String(n)].reduce((a, d) => a + +d, 0); }

export default function Calculator() {
  const [calcMode, setCalcMode] = useState<'lifepath'|'personality'>('lifepath');
  const [calcDay, setCalcDay] = useState('');
  const [calcMon, setCalcMon] = useState('');
  const [calcYr, setCalcYr] = useState('');
  const [calcResult, setCalcResult] = useState<{ num: number, name: string, desc: string } | null>(null);
  
  const [lifePaths, setLifePaths] = useState<Record<number, {name: string, desc: string}>>({});

  useEffect(() => {
    apiFetch('/api/life_paths')
      .then(async res => {
          if (!res.ok) throw new Error("Fetch failed");
          const text = await res.text();
          if (!text) throw new Error("Empty response");
          return JSON.parse(text);
      })
      .then((data: LifePath[]) => {
         const lpMap: Record<number, {name: string, desc: string}> = {};
         data.forEach(lp => {
             lpMap[lp.id] = { name: lp.name, desc: lp.desc };
         });
         setLifePaths(lpMap);
      })
      .catch(err => {
         console.error("Could not fetch life paths, using defaults", err);
         const defaultPaths = [
          { id: 1, name: 'The Leader', desc: 'Born to lead, Life Path 1 individuals are independent, ambitious, and determined.' },
          { id: 2, name: 'The Peacemaker', desc: 'Gifted with sensitivity, intuition, and creativity, Life Path 2 individuals are natural harmonizers.' },
          { id: 3, name: 'The Creator', desc: 'Life Path 3 individuals are naturally creative, expressive, and charismatic.' },
          { id: 4, name: 'The Builder', desc: 'Life Path 4 individuals are practical, disciplined, and hardworking.' },
          { id: 5, name: 'The Explorer', desc: 'Life Path 5 individuals are adventurous, versatile, and freedom-loving.' },
          { id: 6, name: 'The Nurturer', desc: 'Life Path 6 individuals are compassionate, responsible, and deeply caring.' },
          { id: 7, name: 'The Seeker', desc: 'Life Path 7 individuals are analytical, intuitive, and deeply spiritual.' },
          { id: 8, name: 'The Achiever', desc: 'Life Path 8 individuals are ambitious, powerful, and naturally gifted in leadership.' },
          { id: 9, name: 'The Humanitarian', desc: 'Life Path 9 individuals are compassionate, idealistic, and driven by a desire to make a positive impact on the world.' },
          { id: 11, name: 'The Visionary', desc: 'Life Path 11 is a Master Number associated with intuition, inspiration, and spiritual insight.' },
          { id: 13, name: 'The Disciplined Builder', desc: 'Life Path 13/4 is a Karmic Debt number that emphasizes hard work, discipline, and perseverance.' },
          { id: 14, name: 'The Freedom Seeker', desc: 'Life Path 14/5 is a Karmic Debt number that emphasizes freedom, adaptability, and personal growth through experience.' },
          { id: 16, name: 'The Spiritual Seeker', desc: 'Life Path 16/7 is a Karmic Debt number associated with wisdom, introspection, and spiritual growth.' },
          { id: 19, name: 'The Independent Leader', desc: 'Life Path 19/1 is a Karmic Debt number associated with leadership, independence, and self-reliance.' },
          { id: 22, name: 'The Master Builder', desc: 'Life Path 22 is the most powerful Master Number, combining vision, leadership, and practicality.' },
          { id: 33, name: 'The Master Teacher', desc: 'Life Path 33 is the Master Teacher, representing unconditional love, compassion, and selfless service.' }
        ];
        const lpMap: Record<number, {name: string, desc: string}> = {};
        defaultPaths.forEach(lp => {
            lpMap[lp.id] = { name: lp.name, desc: lp.desc };
        });
        setLifePaths(lpMap);
      });
  }, []);

  const handleReset = () => {
    setCalcDay('');
    setCalcMon('');
    setCalcYr('');
    setCalcResult(null);
  };

  const getMaxDays = (mStr: string, yStr: string) => {
    const m = parseInt(mStr);
    const y = parseInt(yStr);
    if (m === 2) {
      return (!y || ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) ? 29 : 28;
    }
    if (m && [4, 6, 9, 11].includes(m)) return 30;
    return 31;
  };

  useEffect(() => {
    if (calcDay) {
      const maxDays = getMaxDays(calcMon, calcYr);
      if (parseInt(calcDay) > maxDays) {
        setCalcDay(maxDays.toString());
      }
    }
  }, [calcDay, calcMon, calcYr]);

  const handleCalculate = () => {
    const d = +calcDay;
    const m = +calcMon;
    const y = +calcYr;
    if (!d || !m || !y || d > 31 || m > 12 || y < 1900 || y > 2099) {
        alert('Please enter a valid birth date.'); return;
    }
    
    let resultNum: number;
    let title: string;
    
    if (calcMode === 'lifepath') {
        const lpSum = reduce(sumDigits(d)) + reduce(sumDigits(m)) + reduce(sumDigits(y));
        resultNum = reduceFinal(lpSum);
        title = `Life Path ${resultNum}`;
    } else {
        resultNum = reduceFinal(d);
        title = `Personality ${resultNum}`;
    }
    
    const data = lifePaths[resultNum] || lifePaths[((resultNum - 1) % 9) + 1] || { name: 'Unknown', desc: 'Data not available.' };
    
    setCalcResult({
        num: resultNum,
        name: `${title} — ${data.name}`,
        desc: data.desc
    });

    setTimeout(() => {
        const r = document.getElementById('calc-result-box');
        if (r) {
            r.classList.remove('opacity-0');
            void r.offsetWidth; // trigger reflow
            r.classList.add('opacity-100');
            r.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 50);
  };

  return (
    <section id="calculator" className="w-full relative z-10 py-32 px-8 md:px-16 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
      <div className="lg:col-span-7 flex flex-col reveal vis max-w-[1280px] w-full mx-auto">
        <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Free Tool</p>
        <h2 className="text-4xl md:text-5xl font-light font-serif leading-[1.2] mb-6">
            Free Numerology Calculator:<br className="hidden md:block" />
            <span className="text-3xl md:text-4xl text-text-main/80 mt-2 block">
                {calcMode === 'lifepath' ? 'Find Your Life Path Number' : 'Find Your Personality Number'}
            </span>
        </h2>
        <p className="text-muted text-lg font-light max-w-[500px]">
            {calcMode === 'lifepath' 
                ? "Enter your date of birth to reveal the number that governs your life's purpose and deepest calling."
                : "Enter your date of birth to reveal the number that reflects your outer personality and psychic energy."}
        </p>
      </div>

      <div className="lg:col-span-5 reveal vis w-full max-w-[500px] mx-auto lg:mx-0">
        <div className="bg-bg-card border border-gold/20 p-6 sm:p-10 relative overflow-hidden shadow-[0_0_40px_rgba(201,160,80,0.1)] rounded-sm text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gold"></div>
          
          <div className="flex justify-center gap-2 mb-6 border-b border-gold/10 pb-4">
            <button 
              onClick={() => { setCalcMode('lifepath'); handleReset(); }}
              className={`text-[9px] sm:text-[10px] uppercase tracking-[0.15em] px-3 sm:px-4 py-2 transition-colors ${calcMode === 'lifepath' ? 'text-gold border-b-2 border-gold' : 'text-dim hover:text-muted'}`}
            >
              Life Path
            </button>
            <button 
              onClick={() => { setCalcMode('personality'); handleReset(); }}
              className={`text-[9px] sm:text-[10px] uppercase tracking-[0.15em] px-3 sm:px-4 py-2 transition-colors ${calcMode === 'personality' ? 'text-gold border-b-2 border-gold' : 'text-dim hover:text-muted'}`}
            >
              Personality
            </button>
          </div>

          <h3 className="text-2xl font-serif text-center mb-2">
            {calcMode === 'lifepath' ? 'Life Path Calculator' : 'Personality Calculator'}
          </h3>
          <p className="text-muted text-[10px] sm:text-xs text-center mb-8 uppercase tracking-[0.2em] font-light">
            {calcMode === 'lifepath' ? 'Your cosmic signature' : 'Your psychic energy'}
          </p>

          <div className="flex flex-col gap-6 mb-8 max-w-[320px] mx-auto">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="flex flex-col gap-1 sm:gap-2">
                <label className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted text-center">Year</label>
                <input type="text" inputMode="numeric" placeholder="YYYY" value={calcYr} onChange={e=>setCalcYr(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full bg-bg-input border border-gold/20 px-1 py-3 sm:p-3 text-center text-base sm:text-lg outline-none focus:border-gold transition-colors font-sans" />
              </div>
              <div className="flex flex-col gap-1 sm:gap-2">
                <label className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted text-center">Month</label>
                <input type="text" inputMode="numeric" placeholder="MM" value={calcMon} onChange={e=>{ let val = e.target.value.replace(/\D/g, '').slice(0, 2); if (parseInt(val) > 12) val = '12'; setCalcMon(val); }} className="w-full bg-bg-input border border-gold/20 px-1 py-3 sm:p-3 text-center text-base sm:text-lg outline-none focus:border-gold transition-colors font-sans" />
              </div>
              <div className="flex flex-col gap-1 sm:gap-2">
                <label className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted text-center">Day</label>
                <input type="text" inputMode="numeric" placeholder="DD" value={calcDay} onChange={e=>{ let val = e.target.value.replace(/\D/g, '').slice(0, 2); if (val) { const maxDays = getMaxDays(calcMon, calcYr); if (parseInt(val) > maxDays) val = maxDays.toString(); } setCalcDay(val); }} className="w-full bg-bg-input border border-gold/20 px-1 py-3 sm:p-3 text-center text-base sm:text-lg outline-none focus:border-gold transition-colors font-sans" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button onClick={handleCalculate} className="flex-1 bg-gold text-bg-dark py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors">Reveal</button>
              <button onClick={handleReset} className="px-6 border border-gold/20 text-gold py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors">Reset</button>
          </div>
          
          <div className={`pt-6 border-t border-gold/10 text-center transition-opacity duration-500 ${calcResult ? 'opacity-100 block' : 'opacity-0 hidden'}`} id="calc-result-box">
            {calcResult && (
                <>
                    <div className="text-5xl sm:text-7xl font-serif font-light text-gold leading-none mb-2 mt-4">{calcResult.num}</div>
                    <div className="text-xl sm:text-2xl font-serif mb-4">{calcResult.name}</div>
                    <p className="text-xs sm:text-sm font-light leading-relaxed text-muted max-w-[500px] mx-auto mb-6">{calcResult.desc}</p>
                </>
            )}
            <div className="text-dim text-[10px] tracking-[0.2em] uppercase mb-2 italic">Seeking Deeper Wisdom?</div>
            <div className="mb-2"><a href="/#booking" className="text-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] hover:text-gold-lt transition-colors underline decoration-gold/30 underline-offset-4">Book a Session</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}
