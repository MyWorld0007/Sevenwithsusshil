import React, { useEffect, useRef, useState } from 'react';

// LP calculation data
const LPInfo: Record<number, { name: string, desc: string }> = {
  1:  { name:'The Leader',       desc:'You are a natural-born pioneer with fierce independence and originality. You are here to forge new trails, trust your instincts, and inspire others through your courageous individuality. Your challenge is to lead without dominating.' },
  2:  { name:'The Peacemaker',   desc:'Sensitivity, diplomacy, and deep empathy are your greatest gifts. You thrive in partnership and have an extraordinary ability to hold space for all perspectives. Your path is one of harmony, cooperation, and bringing balance into the world.' },
  3:  { name:'The Creator',      desc:'Creative expression, joy, and communication are your life force. You are magnetic, expressive, and naturally uplifting. Your purpose is to inspire the world through authentic self-expression — in art, words, music, or the way you simply light up a room.' },
  4:  { name:'The Builder',      desc:'Discipline, practicality, and unwavering reliability are your foundation. You are here to create lasting structures — in career, family, or community. Your methodical, patient nature turns the grandest visions into concrete reality.' },
  5:  { name:'The Adventurer',   desc:'Freedom, change, and direct experience are your greatest teachers. You are magnetic, adaptable, and deeply curious. Your life is a rich journey of discovery — learning through movement, connection, variety, and embracing the wonderfully unexpected.' },
  6:  { name:'The Nurturer',     desc:'Love, responsibility, and devoted service define your highest calling. You are a natural healer and protector with a profound sense of duty. Your greatest fulfillment arrives through creating harmony and beautifully caring for those you love.' },
  7:  { name:'The Seeker',       desc:'Wisdom, introspection, and spiritual depth are your very essence. You are drawn to the mysteries of life and possess a penetrating analytical mind. Your path is one of inner mastery, profound scholarship, and courageously illuminating truth.' },
  8:  { name:'The Achiever',     desc:'Power, abundance, and material mastery are your natural domain. You are a born executive with an extraordinary capacity for success. Your path teaches the wise and ethical use of power and the balance between the spiritual and material worlds.' },
  9:  { name:'The Humanitarian', desc:'Compassion, wisdom, and universal love are your highest vibration. You carry the frequencies of all numbers and are here to serve humanity with grace. Your path is one of completion, release, and inspiring others through selfless, luminous example.' },
  11: { name:'The Illuminator',  desc:'You carry a Master Number — a rare vibration of heightened spiritual sensitivity and prophetic intuition. You are here to inspire and uplift humanity through visionary insight. Your path holds extraordinary power, and even greater responsibility.' },
  22: { name:'The Master Builder',desc:'You carry the most powerful Master Number — the capacity to turn the grandest dreams into lasting reality. You are a visionary with the practical genius to manifest sweeping, positive change in the world. Your potential is genuinely boundless.' },
  33: { name:'The Master Teacher',desc:'The rarest and most sacred Master Number — pure compassionate service and spiritual mastery. You are here to guide others with unconditional love and wisdom. Your very life becomes a living teaching, quietly touching countless souls.' }
};

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n <= 9) return n;
  return reduce([...String(n)].reduce((a, d) => a + +d, 0));
}

function sumDigits(n: number) { return [...String(n)].reduce((a, d) => a + +d, 0); }

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculator state
  const [calcMode, setCalcMode] = useState<'lifepath'|'personality'>('lifepath');
  const [calcDay, setCalcDay] = useState('');
  const [calcMon, setCalcMon] = useState('');
  const [calcYr, setCalcYr] = useState('');
  const [calcResult, setCalcResult] = useState<{ num: number, name: string, desc: string } | null>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    const CHARS = '1 2 3 4 5 6 7 8 9 ✦ ∞ △ ◇'.split(' ').filter(Boolean);
    let pts: any[] = [];
    let animationFrameId: number;

    const initCanvas = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    }
    initCanvas();
    window.addEventListener('resize', initCanvas);

    for (let i = 0; i < 55; i++) {
        pts.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            c: CHARS[Math.floor(Math.random() * CHARS.length)],
            sz: 11 + Math.random() * 25,
            op: .1 + Math.random() * .10,
            vx: (Math.random() - .5) * .25,
            vy: -.15 - Math.random() * .35
        });
    }

    const draw = () => {
        cx.clearRect(0, 0, cv.width, cv.height);
        pts.forEach(p => {
            cx.save();
            cx.globalAlpha = p.op;
            cx.fillStyle = '#c9a050';
            cx.font = `300 ${p.sz}px "Georgia", serif`;
            cx.fillText(p.c, p.x, p.y);
            cx.restore();
            p.x += p.vx; p.y += p.vy;
            if (p.y < -40) { p.y = cv.height + 40; p.x = Math.random() * cv.width; }
            if (p.x < -40) p.x = cv.width + 40;
            if (p.x > cv.width + 40) p.x = -40;
        });
        animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
        window.removeEventListener('resize', initCanvas);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        resultNum = reduce(reduce(sumDigits(d)) + reduce(sumDigits(m)) + reduce(sumDigits(y)));
        title = `Life Path ${resultNum}`;
    } else {
        // Personality number based on Date of Birth (Psychic/Driver number)
        resultNum = reduce(d);
        title = `Personality ${resultNum}`;
    }
    
    const data = LPInfo[resultNum] || LPInfo[((resultNum - 1) % 9) + 1];
    
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
            r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 50);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const input = target.querySelector('input');
    const em = input?.value;
    if (em) {
        alert('Thank you! We will reach out to ' + em + ' within 24 hours to confirm your session.');
        if (input) input.value = '';
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-dark text-text-main font-sans overflow-x-hidden flex flex-col pb-0">
      <div className="fixed inset-0 border-8 border-bg-card pointer-events-none z-[100]"></div>
      <canvas id="bg-canvas" ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"></canvas>

      {/* Animated Elements from Immersive UI */}
      <div className="font-serif absolute text-gold pointer-events-none float-anim text-6xl top-[25%] right-20" style={{ animationDelay: '2s' }}>3</div>
      <div className="font-serif absolute text-gold pointer-events-none float-anim text-8xl bottom-20 left-[33%]" style={{ animationDelay: '4s' }}>11</div>
      <div className="font-serif absolute text-gold pointer-events-none float-anim text-5xl top-[60%] right-[25%]" style={{ animationDelay: '1s' }}>9</div>
      <div className="font-serif absolute text-gold pointer-events-none float-anim text-7xl top-1/2 left-20" style={{ animationDelay: '3s' }}>∞</div>
      <div className="font-serif absolute text-gold pointer-events-none float-anim text-4xl top-1/3 right-1/2" style={{ animationDelay: '5s' }}>✦</div>

      {/* ═══ NAV ═══ */}
      <nav id="nav" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navScrolled ? 'bg-bg-dark/95 border-b border-gold-bd backdrop-blur-xl' : 'border-b border-transparent'}`}>
        <div className="flex items-center justify-between px-6 md:px-12 py-4 md:py-6">
          <a href="#" className="flex items-center" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); setIsMobileMenuOpen(false); }}>
            <img src="/logo.png" alt="SEVEN 7" className="h-14 md:h-20 w-auto object-contain" />
          </a>
          <ul className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] text-muted items-center">
            <li><a href="#services" className="hover:text-gold transition-colors">Services</a></li>
            <li><a href="#about" className="hover:text-gold transition-colors">About</a></li>
            <li><a href="#calculator" className="hover:text-gold transition-colors">Calculator</a></li>
            <li><a href="#testimonials" className="hover:text-gold transition-colors">Stories</a></li>
          </ul>
          <div className="flex items-center gap-4">
            <a href="#booking" className="hidden md:inline-block px-6 py-2 border border-gold/30 text-[11px] uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors text-gold">
              Book a Session
            </a>
            <button 
              className="md:hidden text-gold p-2 cursor-pointer focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-bg-dark border-b border-gold-bd transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <ul className="flex flex-col text-[11px] uppercase tracking-[0.2em] text-muted p-6 gap-6">
            <li><a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block">Services</a></li>
            <li><a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block">About</a></li>
            <li><a href="#calculator" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block">Calculator</a></li>
            <li><a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block">Stories</a></li>
            <li className="pt-4 border-t border-gold/10">
              <a href="#booking" onClick={() => setIsMobileMenuOpen(false)} className="inline-block px-6 py-3 border border-gold/30 text-gold w-fit text-center uppercase tracking-[0.2em]">
                Book a Session
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main className="relative z-10 flex-grow flex flex-col items-center">
        {/* ═══ HERO ═══ */}
        <section id="hero" className="w-full relative z-10 grid grid-cols-1 md:grid-cols-12 gap-2 lg:gap-8 px-8 md:px-16 items-center min-h-[90vh] pt-32 max-w-[1280px] mx-auto">
          <div className="md:col-span-12 lg:col-span-7 flex flex-col reveal vis">
            <div className="flex items-center gap-4 text-[11px] tracking-[0.35em] uppercase text-gold mb-6">
              <span className="opacity-50">—</span> MASTER NUMEROLOGIST <span className="opacity-50">—</span>
            </div>
            <h1 className="text-5xl md:text-[5.5rem] font-light font-serif leading-[1.05] mb-8">
              Decode the <em className="bg-gradient-to-r from-gold to-gold-lt bg-clip-text text-transparent italic pe-2">Language</em><br />of the Universe
            </h1>
            <p className="text-text-main/90 text-lg md:text-xl font-light leading-relaxed max-w-lg mb-12">
              Every number carries a vibration. Your birth date, your name — they hold the blueprint of your soul. Let the ancient science illuminate your path.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#calculator" className="bg-gold text-bg-dark px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors inline-block">Discover Your Number</a>
              <a href="#booking" className="border border-gold/30 text-gold px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors inline-block">Book a Reading</a>
            </div>
          </div>
          <div className="flex md:col-span-12 lg:col-span-5 reveal vis justify-center items-center order-first lg:order-none mb-0 lg:mb-0 lg:mt-0 -mb-4">
            <img src="/logo.png" alt="SEVEN 7 Logo" className="w-[60%] sm:w-[50%] md:w-[40%] lg:w-[80%] max-w-[450px] object-contain float-anim-solid" style={{ filter: 'drop-shadow(0px 0px 40px rgba(201,160,80,0.15))' }} />
          </div>
        </section>

        {/* ═══ ABOUT ═══ */}
        <section id="about" className="w-full relative z-10 py-24 px-6 md:px-12 bg-bg-card/30">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 relative reveal">
              <div className="w-full aspect-[3/4] bg-bg-input border border-gold/20 rounded-sm flex items-center justify-center relative shadow-[0_0_40px_rgba(201,160,80,0.1)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(201,160,80,0.1)_0%,transparent_65%)]"></div>
                <div className="font-serif text-[120px] font-light text-gold/25 select-none relative z-10">✦</div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-gold text-bg-dark flex flex-col items-center justify-center font-serif shadow-xl hidden md:flex">
                <span className="text-4xl font-medium leading-none">15+</span>
                <span className="text-[9px] tracking-[0.1em] uppercase font-sans mt-1">Years</span>
              </div>
            </div>
            <div className="md:col-span-7 reveal">
              <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">About</p>
              <h2 className="text-3xl md:text-5xl font-light font-serif leading-[1.18] mb-6">Bridging ancient wisdom with modern life guidance</h2>
              <p className="text-[15px] font-light leading-[1.95] text-muted mb-6">I am a Seeker, Intuitive, Healer, and Mentor with 15 years of dedicated experience guiding individuals through life’s most complex challenges. Drawing from my personal life experiences and challenges, I have transformed lessons into wisdom — and now help others navigate their paths with clarity, confidence, and purpose.</p>
              <p className="text-[15px] font-light leading-[1.95] text-muted mb-8">By combining astro-numerology, spirituality, and Divine’s wisdom, I evaluate, identify, inspire, encourage, and empower individuals to overcome obstacles and discover their true potential. My approach is holistic: I help people balance emotions, embrace their uniqueness, and live authentically.</p>
            </div>
          </div>
        </section>

        {/* ═══ CALCULATOR ═══ */}
        <section id="calculator" className="w-full relative z-10 py-32 px-8 md:px-16 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col reveal">
            <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Free Tool</p>
            <h2 className="text-4xl md:text-5xl font-light font-serif leading-[1.2] mb-6">
                {calcMode === 'lifepath' ? 'Find Your Life Path Number' : 'Find Your Personality Number'}
            </h2>
            <p className="text-muted text-lg font-light max-w-[500px]">
                {calcMode === 'lifepath' 
                    ? "Enter your date of birth to reveal the number that governs your life's purpose and deepest calling."
                    : "Enter your date of birth to reveal the number that reflects your outer personality and psychic energy."}
            </p>
          </div>

          <div className="lg:col-span-5 reveal">
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
                    <label className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted text-left">Year</label>
                    <input type="text" inputMode="numeric" placeholder="YYYY" value={calcYr} onChange={e=>setCalcYr(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full bg-bg-input border border-gold/20 px-1 py-3 sm:p-3 text-center text-base sm:text-lg outline-none focus:border-gold transition-colors font-sans" />
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <label className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted text-left">Month</label>
                    <input type="text" inputMode="numeric" placeholder="MM" value={calcMon} onChange={e=>{ let val = e.target.value.replace(/\D/g, '').slice(0, 2); if (parseInt(val) > 12) val = '12'; setCalcMon(val); }} className="w-full bg-bg-input border border-gold/20 px-1 py-3 sm:p-3 text-center text-base sm:text-lg outline-none focus:border-gold transition-colors font-sans" />
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <label className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted text-left">Day</label>
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
                <div className="mb-2"><a href="#booking" className="text-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] hover:text-gold-lt transition-colors underline decoration-gold/30 underline-offset-4">Book a Session</a></div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SERVICES ═══ */}
        <section id="services" className="w-full relative z-10 py-24 px-6 md:px-12 max-w-[1280px] mx-auto">
          <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">What I Offer</p>
          <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
          <h2 className="text-4xl md:text-5xl font-light font-serif text-center leading-[1.2] mb-4">Pathways to Clarity</h2>
          <p className="text-muted text-lg font-light text-center max-w-[500px] mx-auto mb-16">Each reading is a deeply personal journey tailored to your unique numerical blueprint and life circumstances.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { n: '01', title: 'Life Path Reading', desc: 'A comprehensive exploration of your core numbers — life path, destiny, soul urge, and personality — revealing who you are at your deepest level.' },
              { n: '02', title: 'Name Analysis', desc: 'Your name is not a coincidence. Uncover the hidden frequencies encoded in your full birth name and how they shape your destiny and opportunities.' },
              { n: '03', title: 'Relationship Compatibility', desc: 'Explore the numerological dynamics between you and a partner, friend, or colleague for deeper understanding and harmonious connection.' },
              { n: '04', title: 'Career & Purpose Mapping', desc: 'Align your professional path with your soul\'s calling. Use numerology as a compass when facing pivotal decisions and transitions.' }
            ].map((srv, i) => (
              <div key={i} className="bg-bg-card border border-gold/20 p-8 relative overflow-hidden transition-all duration-300 hover:border-gold/45 group reveal shadow-[0_0_20px_rgba(201,160,80,0.03)] rounded-sm">
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold transition-all duration-500 group-hover:w-full"></div>
                <div className="font-serif text-4xl font-normal text-gold/60 leading-none mb-6">{srv.n}</div>
                <h3 className="font-serif text-lg font-medium mb-3">{srv.title}</h3>
                <p className="text-[13px] font-light leading-[1.85] text-muted mb-6">{srv.desc}</p>
                <a href="#booking" className="text-[10px] font-medium tracking-[0.14em] uppercase text-gold hover:text-gold-lt transition-colors">Explore →</a>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ PROCESS ═══ */}
        <section id="process" className="w-full relative z-10 py-24 px-6 md:px-12 max-w-[1280px] mx-auto">
          <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">How It Works</p>
          <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
          <h2 className="text-4xl md:text-5xl font-light font-serif text-center mb-16">Your Journey in Three Steps</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 reveal">
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

        {/* ═══ TESTIMONIALS ═══ */}
        <section id="testimonials" className="w-full relative z-10 py-24 px-6 md:px-12 max-w-[1280px] mx-auto">
          <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">Client Stories</p>
          <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
          <h2 className="text-4xl md:text-5xl font-light font-serif text-center mb-4">Voices of Transformation</h2>
          <p className="text-muted text-lg font-light text-center max-w-[500px] mx-auto mb-16">Real journeys from people who discovered clarity through the language of numbers.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: `"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life's patterns left me speechless. I finally understand why certain things kept repeating."`, initial: 'P', name: 'Priya Malhotra', loc: 'Mumbai, India' },
              { text: `"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I'd been avoiding for two years. Genuinely life-changing."`, initial: 'R', name: 'Rohan Kapoor', loc: 'Bangalore, India' },
              { text: `"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."`, initial: 'A', name: 'Anjali Singh', loc: 'Delhi, India' }
            ].map((tst, i) => (
              <div key={i} className="bg-bg-card border border-gold/20 p-8 rounded-sm reveal shadow-[0_0_20px_rgba(201,160,80,0.03)]">
                <div className="text-gold text-[10px] tracking-[0.12em] mb-4">★★★★★</div>
                <p className="font-serif text-lg font-light italic leading-[1.85] text-muted mb-6">{tst.text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-serif text-lg text-gold flex-shrink-0">{tst.initial}</div>
                  <div>
                    <div className="text-[14px] font-medium">{tst.name}</div>
                    <div className="text-[11px] text-dim mt-1">{tst.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ BOOKING CTA ═══ */}
        <section id="booking" className="w-full relative z-10 py-32 px-6 md:px-12 text-center overflow-hidden">
          <div className="font-serif text-[18vw] font-light text-gold/[0.045] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none z-0">✦</div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[70px] bg-gradient-to-b from-transparent to-gold"></div>
          
          <div className="relative z-10 max-w-[1280px] mx-auto reveal mt-8">
            <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Begin Your Journey</p>
            <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
            <h2 className="text-4xl md:text-6xl font-light font-serif leading-[1.16] mb-6">Your numbers are<br /><em className="italic text-gold not-italic">waiting to speak</em></h2>
            <p className="text-muted text-[15px] font-light leading-[1.9] max-w-[450px] mx-auto mb-10">Book a personal session and step into a conversation with your own cosmic blueprint. Sessions available online, worldwide.</p>


            <div className="mt-16 flex flex-col items-center">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-dim mb-6">Connect directly</p>
              <div className="flex flex-row items-center justify-center gap-6">
                <a 
                  href="mailto:7s.evolve@gmail.com?subject=Book%20a%20Session&body=Hi%20Team%20Seven%2C%0D%0A%0D%0AI%20want%20to%20book%20a%20session." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gold text-[#fcfbf8] p-4 rounded-full shadow-[0_4px_20px_rgba(201,160,80,0.15)] hover:bg-gold-lt hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                  aria-label="Contact via Email"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </a>
        
                <a 
                  href="https://wa.me/917039516551?text=Hello%21%20I%20would%20like%20to%20book%20a%20session." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gold text-[#fcfbf8] p-4 rounded-full shadow-[0_4px_20px_rgba(201,160,80,0.15)] hover:bg-gold-lt hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                  aria-label="Contact on WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ═══ FOOTER STATS ═══ */}
      <div className="relative z-10 border-t border-gold/10 bg-bg-card/50 px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
        <div className="flex gap-8 md:gap-12">
          <div className="flex flex-col text-center md:text-left">
            <span className="text-2xl font-serif text-gold">555+</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-dim">Readings Given</span>
          </div>
          <div className="flex flex-col text-center md:text-left">
            <span className="text-2xl font-serif text-gold">91%</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-dim">Accuracy Rate</span>
          </div>
          <div className="flex flex-col text-center md:text-left">
            <span className="text-2xl font-serif text-gold">5</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-dim">Countries Served</span>
          </div>
        </div>
        <div className="text-dim text-[10px] tracking-[0.2em] uppercase text-center md:text-right">
          © {new Date().getFullYear()} SEVEN ASTRO MYSTICS • India & WORLDWIDE
        </div>
      </div>


    </div>
  );
}
