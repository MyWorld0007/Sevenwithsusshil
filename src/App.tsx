import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Calculator from './pages/Calculator';
import Stories from './pages/Stories';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ContentPage from './pages/ContentPage';

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    if (location.hash) {
      setTimeout(() => {
        const el = document.getElementById(location.hash.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash, isAdmin]);

  useEffect(() => {
    let canonical = document.getElementById('canonical-meta') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.id = 'canonical-meta';
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const cleanPath = location.pathname === '/' ? '' : location.pathname;
    canonical.setAttribute('href', `https://sevenastro.com${cleanPath}`);
  }, [location.pathname]);

  useEffect(() => {
    if (isAdmin) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: .12 });
    
    // observe after a slight delay to allow dom updates
    setTimeout(() => {
       document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }, 100);
    
    return () => obs.disconnect();
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
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
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-dark text-text-main font-sans overflow-x-hidden flex flex-col pb-0">
      <div className="fixed inset-0 border-8 border-bg-card pointer-events-none z-[100]"></div>
      <canvas id="bg-canvas" ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"></canvas>

      {/* Animated Elements */}
      <div className="font-serif fixed text-gold pointer-events-none float-anim text-6xl top-[25%] right-20 z-0" style={{ animationDelay: '2s' }}>3</div>
      <div className="font-serif fixed text-gold pointer-events-none float-anim text-8xl bottom-20 left-[33%] z-0" style={{ animationDelay: '4s' }}>11</div>
      <div className="font-serif fixed text-gold pointer-events-none float-anim text-5xl top-[60%] right-[25%] z-0" style={{ animationDelay: '1s' }}>9</div>

      {/* ═══ NAV ═══ */}
      <nav id="nav" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navScrolled ? 'bg-bg-dark/95 border-b border-gold-bd backdrop-blur-xl' : 'border-b border-transparent'}`}>
        <div className="flex items-center justify-between px-6 md:px-12 py-4 md:py-6">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="SEVEN 7" className="h-14 md:h-20 w-auto object-contain" />
          </Link>
          <ul className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] text-muted items-center">
            <li><a href="/#services" className="hover:text-gold transition-colors">Services</a></li>
            <li><a href="/#about" className="hover:text-gold transition-colors">About</a></li>
            <li><a href="/#calculator" className="hover:text-gold transition-colors">Calculator</a></li>
            <li><a href="/#testimonials" className="hover:text-gold transition-colors">Stories</a></li>
          </ul>
          <div className="flex items-center gap-4">
            <a href="/#booking" className="hidden md:inline-block px-6 py-2 border border-gold/30 text-[11px] uppercase tracking-[0.2em] hover:bg-gold/10 transition-colors text-gold">
              Book a Session
            </a>
            <button 
              className="md:hidden text-gold p-3 cursor-pointer focus:outline-none"
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
          <ul className="flex flex-col text-[11px] uppercase tracking-[0.2em] text-muted p-6 gap-2">
            <li><a href="/#services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block py-3 px-2">Services</a></li>
            <li><a href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block py-3 px-2">About</a></li>
            <li><a href="/#calculator" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block py-3 px-2">Calculator</a></li>
            <li><a href="/#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors block py-3 px-2">Stories</a></li>
            <li className="pt-4 mt-2 border-t border-gold/10">
              <a href="/#booking" onClick={() => setIsMobileMenuOpen(false)} className="inline-block px-6 py-3.5 border border-gold/30 text-gold w-full text-center uppercase tracking-[0.2em]">
                Book a Session
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main className="relative z-10 flex-grow flex flex-col items-center pt-24 min-h-screen">
         <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service/:slug" element={<ServiceDetail />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pages/:slug" element={<ContentPage />} />
           <Route path="*" element={<NotFound />} />
         </Routes>
      </main>

      {/* ═══ FOOTER LINKS ═══ */}
      <div className="relative z-10 border-t border-gold/10 bg-bg-dark px-6 md:px-12 py-8 flex justify-center mt-auto">
        <ul className="flex flex-wrap justify-center gap-8 md:gap-16 text-[10px] md:text-[11px] uppercase tracking-[0.2em]">
          <li><Link to="/pages/terms" className="text-dim hover:text-gold transition-colors">Terms & Conditions</Link></li>
          <li><Link to="/pages/privacy" className="text-dim hover:text-gold transition-colors">Privacy Policy</Link></li>
          <li><Link to="/pages/faq" className="text-dim hover:text-gold transition-colors">FAQ</Link></li>
        </ul>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="relative z-10 border-t border-gold/10 bg-bg-card/50 px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
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
        <div className="text-dim text-[10px] tracking-[0.2em] uppercase text-center md:text-right flex flex-col items-end gap-1">
          <span>© {new Date().getFullYear()} SEVEN ASTRO • India & WORLDWIDE</span>
        </div>
      </div>
    </div>
  );
}
