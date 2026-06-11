import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { apiFetch } from '../lib/api';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Calendar, Clock, User, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';

// Custom Cylindrical 3D Scroll Wheel Column element
interface TimeWheelColumnProps {
  options: (string | number)[];
  value: string | number;
  onChange: (val: any) => void;
  itemHeight?: number;
}

function TimeWheelColumn({ options, value, onChange, itemHeight = 36 }: TimeWheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.indexOf(value);
  const isScrollingRef = useRef(false);

  // Sync scroll position whenever selectedIndex changes externally
  useEffect(() => {
    const container = containerRef.current;
    if (container && !isScrollingRef.current) {
      container.scrollTop = selectedIndex * itemHeight;
    }
  }, [selectedIndex, itemHeight]);

  // Read scroll state to detect snapping manually
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    
    isScrollingRef.current = true;
    const scrollTop = container.scrollTop;
    const computedIndex = Math.round(scrollTop / itemHeight);
    
    if (computedIndex >= 0 && computedIndex < options.length) {
      const activeVal = options[computedIndex];
      if (activeVal !== value) {
        onChange(activeVal);
      }
    }
    
    // Clear scroll flag after transition
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };

  // Direct mousewheel scroll event behavior (simulate cylinder rotations)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const currentIndex = options.indexOf(value);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < options.length) {
      onChange(options[nextIndex]);
    }
  };

  return (
    <div className="relative flex flex-col items-center flex-1 select-none">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="w-full h-[180px] overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Top Spacer representing 2 empty padding rows to center the first list item */}
        <div style={{ height: `${itemHeight * 2}px` }} />

        {options.map((opt, i) => {
          const isSelected = opt === value;
          const offsetDiff = Math.abs(i - selectedIndex);
          
          // Mimic circular cylindrical coordinates with opacity & scale scaling
          let opacity = 0.1;
          let scale = 0.8;
          let rotateX = 0;
          
          if (isSelected) {
            opacity = 1.0;
            scale = 1.15;
            rotateX = 0;
          } else if (offsetDiff === 1) {
            opacity = 0.55;
            scale = 0.95;
            rotateX = (i > selectedIndex) ? 35 : -35;
          } else if (offsetDiff === 2) {
            opacity = 0.2;
            scale = 0.8;
            rotateX = (i > selectedIndex) ? 60 : -60;
          }

          const displayLabel = typeof opt === 'number' ? opt.toString().padStart(2, '0') : opt;

          return (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                if (containerRef.current) {
                  containerRef.current.scrollTop = i * itemHeight;
                }
              }}
              className="snap-center flex items-center justify-center cursor-pointer transition-all duration-300 origin-center text-center"
              style={{
                height: `${itemHeight}px`,
                opacity,
                transform: `scale(${scale}) rotateX(${rotateX}deg)`,
                perspective: '800px',
              }}
            >
              <span className={`font-serif text-lg tracking-wide ${isSelected ? 'text-gold font-medium' : 'text-text-main/80 font-light'}`}>
                {displayLabel}
              </span>
            </div>
          );
        })}

        {/* Bottom Spacer representing 2 empty padding rows to center the last list item */}
        <div style={{ height: `${itemHeight * 2}px` }} />
      </div>
    </div>
  );
}

export default function Contact() {
  const settings = useSettings();
  
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  
  // Custom Cylinder State representing iOS scroll wheels
  const [hourWheel, setHourWheel] = useState(9);
  const [minuteWheel, setMinuteWheel] = useState(0);
  const [periodWheel, setPeriodWheel] = useState<'AM' | 'PM'>('AM');
  const [tob, setTob] = useState('09:00');
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);

  const [pob, setPob] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-sync hourWheel, minuteWheel, and periodWheel with the string 'tob'
  useEffect(() => {
    const conversionHours = periodWheel === 'PM' 
      ? (hourWheel === 12 ? 12 : hourWheel + 12) 
      : (hourWheel === 12 ? 0 : hourWheel);
    const formattedHourStr = conversionHours.toString().padStart(2, '0');
    const formattedMinStr = minuteWheel.toString().padStart(2, '0');
    setTob(`${formattedHourStr}:${formattedMinStr}`);
  }, [hourWheel, minuteWheel, periodWheel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!fullName || !dob || !tob || !pob || !mobile || !email) {
      setErrorMsg('Please unlock your path by entering all required birth details.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          dob,
          tob,
          pob,
          mobile,
          email,
          comments
        })
      });

      if (!res.ok) {
        throw new Error('Connection to celestial servers failed. Please try again.');
      }

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setEmailSent(data.emailSent);
        setEmailError(data.emailError);
      } else {
        throw new Error(data.error || 'Celestials returned an unexpected error.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full relative z-10 py-16 md:py-24 px-6 md:px-12 bg-bg-dark flex flex-col items-center min-h-[85vh]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[80px] bg-gradient-to-b from-transparent to-gold"></div>
      
      <div className="max-w-[1280px] mx-auto w-full flex flex-col items-center">
        <div className="text-center mb-12 mt-8 max-w-[650px]">
          <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Divine Inquiry</p>
          <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
          <h1 className="text-4xl md:text-5xl font-light font-serif leading-[1.2] mb-6 text-text-main">
            Contact <em className="italic text-gold not-italic">Our Sanctuary</em>
          </h1>
          <p className="text-muted text-[15px] font-light leading-[1.8] max-w-[550px] mx-auto">
            Submit your precise natal details below. Your information will be encrypted, stored securely, and sent immediately to the Master Numerologist for divine alignment calculations.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          {/* RIGHT: Contact input form container */}
          <div className="w-full bg-bg-card/35 border border-gold/15 p-6 md:p-10 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-gold animate-pulse" />
                </div>
                <h3 className="text-2xl font-serif text-gold mb-3">Submission Complete</h3>
                <p className="text-text-main/90 text-sm font-light leading-relaxed mb-6 max-w-[450px]">
                  Thank you, <strong className="text-gold font-medium">{fullName}</strong>. Your precise birth coordinates have been registered successfully!
                </p>

                {emailSent ? (
                  <div className="bg-emerald-950/25 border border-emerald-500/20 p-5 rounded-sm text-emerald-100 text-xs tracking-wide leading-relaxed max-w-[480px] mb-6 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <p className="font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Live Email Dispatched Successfully!
                    </p>
                    A real confirmation email has been dispatched via SMTP mail servers immediately to <strong className="text-gold font-mono block sm:inline">{email}</strong> and the Master Numerologist address. Please check your inbox (and spam/promotions folder)!
                  </div>
                ) : emailError ? (
                  <div className="bg-red-950/25 border border-red-500/20 p-5 rounded-sm text-red-100 text-xs tracking-wide leading-relaxed max-w-[480px] mb-6 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <p className="font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                      ⚠️ Outbound Email Connection Failure
                    </p>
                    <p className="mb-2 text-text-main/80 text-[11px]">
                      Your details were saved securely in our database, but the outbound mailer failed to connect to the SMTP server.
                    </p>
                    <div className="bg-black/45 p-3 rounded-sm font-mono text-[10px] text-red-300 border border-red-500/10 mb-2 overflow-x-auto select-all">
                      {emailError}
                    </div>
                    {(emailError.toLowerCase().includes("auth") || 
                      emailError.toLowerCase().includes("login") || 
                      emailError.toLowerCase().includes("username") || 
                      emailError.toLowerCase().includes("password") || 
                      emailError.toLowerCase().includes("accepted")) && (
                      <p className="text-[11px] text-text-main/90 mt-2 bg-gold/5 p-2.5 border border-gold/10 rounded-sm leading-relaxed">
                        💡 <strong className="text-gold">Gmail App Password Required:</strong> Personal Google Account passwords (like standard account login passwords) are blocked from direct SMTP use by Google. To fix this:
                        <br />1. Turn on <strong className="text-gold">2-Step Verification</strong> on your Gmail settings.
                        <br />2. Generate a 16-character <strong className="text-gold">App Password</strong>.
                        <br />3. Add that 16-character spacing-free App Password into the <strong className="text-gold">SMTP Password</strong> field in your Admin tab or env file.
                      </p>
                    )}
                  </div>
                ) : null}

                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setFullName('');
                    setDob('');
                    setPob('');
                    setMobile('');
                    setEmail('');
                    setComments('');
                    setEmailSent(null);
                    setEmailError(null);
                  }}
                  className="mt-4 px-6 py-2.5 border border-gold/30 text-gold text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-gold hover:text-bg-dark transition-all rounded-sm cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                {errorMsg && (
                  <div className="bg-red-950/40 border border-red-500/30 p-4 text-xs text-red-200 uppercase tracking-wider text-center">
                    {errorMsg}
                  </div>
                )}

                {/* 1. Full Legal Name */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-gold" />
                    Full Legal Name <span className="text-gold/80">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name exactly as per birth record"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3.5 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 2. Correct date of birth */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      Correct Date of Birth <span className="text-gold/80">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3.5 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm font-sans"
                    />
                  </div>

                  {/* 3. Correct time of birth */}
                  <div className="space-y-2 relative">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      Correct Time of Birth <span className="text-gold/80">*</span>
                    </label>

                    <div className="relative">
                      {/* Compact Trigger Box that looks exactly like the image trigger */}
                      <button
                        type="button"
                        onClick={() => setIsTimePopoverOpen(!isTimePopoverOpen)}
                        className={`w-full bg-bg-dark/60 border ${
                          isTimePopoverOpen ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.15)]' : 'border-gold/20'
                        } px-5 py-3.5 rounded-sm text-left transition-all duration-300 flex flex-col justify-center min-h-[58px] hover:border-gold/50 cursor-pointer active:scale-[0.99]`}
                      >
                        <span className="text-[9px] uppercase tracking-[0.25em] text-muted font-bold block mb-1">Time of Birth</span>
                        <span className="text-lg font-serif text-text-main font-semibold tracking-wider flex items-center gap-1.5">
                          {hourWheel.toString().padStart(2, '0')}:{minuteWheel.toString().padStart(2, '0')} <span className="text-gold text-sm font-sans tracking-widest">{periodWheel}</span>
                        </span>
                      </button>

                      {isTimePopoverOpen && (
                        <>
                          {/* Close overlay */}
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setIsTimePopoverOpen(false)} 
                          />
                          
                          {/* Interactive popover containing the cylinder 3D wheels, styled exactly like the requested mockup */}
                          <div className="absolute left-0 right-0 mt-3 bg-bg-card border border-gold/30 p-4 rounded-md shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-40 animate-in fade-in slide-in-from-top-3 duration-250 backdrop-blur-md">
                            {/* Speech bubble arrow pointer */}
                            <div className="absolute -top-[6px] left-[15%] w-3 h-3 bg-bg-card border-t border-l border-gold/30 transform rotate-45"></div>
                            
                            <div className="w-full bg-bg-dark/80 p-3 rounded-sm flex flex-col items-center relative overflow-hidden">
                              {/* Highlight Selection Bar Background overlay */}
                              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[92%] h-10 bg-white/5 border-y border-gold/15 rounded-md pointer-events-none"></div>
                              
                              <div className="grid grid-cols-3 gap-1 w-full max-w-[240px] z-10">
                                {/* Hour Wheel Column: 1 to 12 */}
                                <TimeWheelColumn
                                  options={Array.from({ length: 12 }, (_, i) => i + 1)}
                                  value={hourWheel}
                                  onChange={setHourWheel}
                                />
                                {/* Minute Wheel Column: 0 to 59 */}
                                <TimeWheelColumn
                                  options={Array.from({ length: 60 }, (_, i) => i)}
                                  value={minuteWheel}
                                  onChange={setMinuteWheel}
                                />
                                {/* Period Wheel Column: AM, PM */}
                                <TimeWheelColumn
                                  options={['AM', 'PM']}
                                  value={periodWheel}
                                  onChange={setPeriodWheel}
                                />
                              </div>
                            </div>

                            {/* Done button to close selector */}
                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gold/10">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-muted">
                                Selected: {hourWheel.toString().padStart(2, '0')}:{minuteWheel.toString().padStart(2, '0')} {periodWheel}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsTimePopoverOpen(false)}
                                className="px-5 py-1.5 bg-gold text-bg-dark hover:bg-gold-lt text-[10px] uppercase font-bold tracking-[0.15em] rounded-sm transition-all cursor-pointer shadow-md"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 4. Place of birth */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      Place of Birth <span className="text-gold/80">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City, State, Country"
                      value={pob}
                      onChange={(e) => setPob(e.target.value)}
                      className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3.5 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm font-sans"
                    />
                  </div>

                  {/* 5. Mobile number */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-gold" />
                      Mobile Number <span className="text-gold/80">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3.5 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm font-sans"
                    />
                  </div>
                </div>

                {/* 6. Email id for receiving response */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-gold" />
                    Response Email ID <span className="text-gold/80">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter Email to receive response"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3.5 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm font-sans"
                  />
                </div>

                {/* 7. Comment box */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-gold" />
                    Comment / Custom Inquiries
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Please type your spiritual questions or details here..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3.5 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm font-sans resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-bg-dark py-4 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-gold-lt transition-all duration-300 hover:shadow-lg disabled:opacity-55 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin"></div>
                        Vibrational Syncing...
                      </>
                    ) : (
                      <>
                        Submit to Master Numerologist
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
