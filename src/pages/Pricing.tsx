import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { apiFetch } from '../lib/api';
import { PricingService } from '../Types';
import { CheckCircle, MessageSquare, Mail, X, Calendar, Clock, MapPin, Phone, User, ChevronDown, Search, Check, Sparkles, CheckCircle2 } from 'lucide-react';

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
              <span className={`font-serif text-lg tracking-wide ${isSelected ? 'text-gold' : 'text-text-main/80 font-light'}`}>
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

const COUNTRIES = [
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
];

const DEFAULT_SERVICES: PricingService[] = [
  {
    id: 1,
    title: "Child Birth Date & Name Alignment Analysis",
    price: "₹51,000",
    rawPrice: "₹51k",
    description: "Discover the optimal name vibration and cosmic alignment for your child's birth energy.",
    iconText: "👶",
    features: [
      "Astro-Numerological Compatibility",
      "Name Vibration & Alignment Solutions",
      "Fortunate Starting Letters",
      "Personalized Child Character Insights"
    ],
    display_order: 0
  },
  {
    id: 2,
    title: "Career Path & Success Guidance",
    price: "₹15,000",
    rawPrice: "₹15k",
    description: "Explore your professional potential, ideal sectors, and key timing for career breakthroughs or transitions.",
    iconText: "💼",
    features: [
      "Career Aptitude Blueprint",
      "Upcoming Opportunities Analysis",
      "Obstacle Mitigation Strategy",
      "Optimal Transition Timelines"
    ],
    display_order: 1
  },
  {
    id: 3,
    title: "Relationship Compatibility Analysis",
    price: "₹51,000",
    rawPrice: "₹51k",
    description: "Decipher the numerical resonance between partners to nourish harmony and conscious relationship growth.",
    iconText: "💑",
    features: [
      "Vibrational Synergy Mapping",
      "Core Conflict Point Assessment",
      "Communication Bridge Remedies",
      "Auspicious Timeline Tendencies"
    ],
    display_order: 2
  },
  {
    id: 4,
    title: "Birth Date, Name Analysis & Name Correction",
    price: "₹51,000",
    rawPrice: "₹51k",
    description: "A comprehensive analysis of your birth energy and full name correction for lifetime cosmic harmony.",
    iconText: "✨",
    features: [
      "Lagna & Planetary Signature Review",
      "Full Name Vibration Correction",
      "Spelling Optimization Remedies",
      "Signature Design Formatting"
    ],
    display_order: 3
  },
  {
    id: 5,
    title: "Business Numerology & Prosperity Blueprint",
    price: "₹1,00,005",
    rawPrice: "₹1,00,005",
    description: "Optimize corporate/brand alignment, choose lucky launch dates, and blueprint your business success.",
    iconText: "🏢",
    features: [
      "Brand Name Spelling Harmonizer",
      "Official Launch / Registration Timing",
      "Key Shareholder Compatibility",
      "Prosperity & Branding Colors Grid"
    ],
    display_order: 4
  },
  {
    id: 6,
    title: "Lucky Numbers, Alphabets & Colour Alignment",
    price: "₹37,000",
    rawPrice: "₹37k",
    description: "Elevate your daily frequency by aligning with your supportive numbers, letters, and visual energies.",
    iconText: "🎨",
    features: [
      "Fortunate Personal Numbers Selection",
      "Vibrational Color Wardrobe Selection",
      "Daily Routine Harmonizing",
      "Alphabetic Signature Alignment"
    ],
    display_order: 5
  },
  {
    id: 7,
    title: "Focused Insight Session",
    price: "₹1,005",
    rawPrice: "₹1005",
    description: "Directly target a single query or burning question for swift, clear metaphysical clarity (Single Question).",
    iconText: "🎯",
    features: [
      "Single Question Guidance",
      "Precision Astral Calculations",
      "Actionable Advice Blueprint",
      "Swift Metaphysical Answers"
    ],
    display_order: 6
  },
  {
    id: 8,
    title: "Gemstone, Crystal & Rudraksha Recommendation",
    price: "₹5,001",
    rawPrice: "₹5001",
    description: "Receive personalized astronomical cosmic prescription of specific crystals, powerful Rudrakshas, and precious gemstones to amplify protective fields and lucky energy bands.",
    iconText: "💎",
    features: [
      "Aura Strengthening Analysis",
      "Planetary Energy Balancers",
      "Gemstone Grade & Weight Advice",
      "Rudraksha Mukhi Recommendations"
    ],
    display_order: 7
  }
];

export default function Pricing() {
  const settings = useSettings();
  const [selectedService, setSelectedService] = useState<PricingService | null>(null);
  const [services, setServices] = useState<PricingService[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [pob, setPob] = useState('');
  const [phoneBody, setPhoneBody] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Custom Cylinder State representing iOS scroll wheels for Time of Birth
  const [hourWheel, setHourWheel] = useState(9);
  const [minuteWheel, setMinuteWheel] = useState(0);
  const [periodWheel, setPeriodWheel] = useState<'AM' | 'PM'>('AM');
  const [tob, setTob] = useState('09:00');
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);

  // Country Picker State
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Submit states
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrorMsg, setFormErrorMsg] = useState('');

  // Auto-sync hourWheel, minuteWheel, and periodWheel with the string 'tob'
  useEffect(() => {
    const conversionHours = periodWheel === 'PM' 
      ? (hourWheel === 12 ? 12 : hourWheel + 12) 
      : (hourWheel === 12 ? 0 : hourWheel);
    const formattedHourStr = conversionHours.toString().padStart(2, '0');
    const formattedMinStr = minuteWheel.toString().padStart(2, '0');
    setTob(`${formattedHourStr}:${formattedMinStr}`);
  }, [hourWheel, minuteWheel, periodWheel]);

  // Sync mobile country code with phone body input
  useEffect(() => {
    if (phoneBody.trim()) {
      setMobile(`${selectedCountry.dial} ${phoneBody.trim()}`);
    } else {
      setMobile('');
    }
  }, [selectedCountry, phoneBody]);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dial.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await apiFetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        const parsed: PricingService[] = data.map((s: any) => {
          let parsedFeatures: string[] = [];
          if (typeof s.features === 'string') {
            try {
              parsedFeatures = JSON.parse(s.features);
            } catch (e) {
              parsedFeatures = s.features.split(',').map((f: string) => f.trim());
            }
          } else if (Array.isArray(s.features)) {
            parsedFeatures = s.features;
          }
          return {
            ...s,
            features: parsedFeatures
          };
        });
        if (parsed.length > 0) {
          setServices(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Error fetching pricing services:", e);
    }
    // Use fallback services in case of error or empty database response
    setServices(DEFAULT_SERVICES);
    setLoading(false);
  };

  const handleBookNow = (service: PricingService) => {
    setSelectedService(service);
  };

  const closeDialog = () => {
    setSelectedService(null);
    setShowEmailForm(false);
    setFormSubmitted(false);
    setFormErrorMsg('');
    setFullName('');
    setDob('');
    setPob('');
    setPhoneBody('');
    setEmail('');
    setHourWheel(9);
    setMinuteWheel(0);
    setPeriodWheel('AM');
    setIsTimePopoverOpen(false);
    setIsCountryDropdownOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg('');

    if (!fullName || !dob || !tob || !pob || !phoneBody || !email) {
      setFormErrorMsg('Please fill in all required birth details to request alignment booking.');
      return;
    }

    if (!selectedService) return;

    setFormLoading(true);
    try {
      const timeOfBirthStr = `${hourWheel.toString().padStart(2, '0')}:${minuteWheel.toString().padStart(2, '0')} ${periodWheel}`;
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          dob,
          tob: timeOfBirthStr,
          pob,
          mobile: `${selectedCountry.dial} ${phoneBody}`,
          email,
          serviceTitle: selectedService.title,
          servicePrice: selectedService.price
        })
      });

      if (!res.ok) {
        throw new Error('Celestial connection error. Please try again.');
      }

      setFormSubmitted(true);
    } catch (err: any) {
      setFormErrorMsg(err.message || 'An error occurred during booking. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const getWhatsAppLink = (service: PricingService) => {
    if (!settings) return '#';
    const msg = `Hello! I would like to book the following service:\n\n*Service:* ${service.title}\n*Price:* ${service.price}\n\nPlease let me know the next steps for scheduling my session.`;
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`;
  };

  const getEmailLink = (service: PricingService) => {
    if (!settings) return '#';
    const subject = `Booking Request: ${service.title}`;
    const body = `Hi Team Seven,\n\nI want to book a session for the following service:\n\nService: ${service.title}\nPrice: ${service.price}\n\nMy Details:\n- Full Name:\n- Date of Birth:\n- Preferred Date/Time:\n- Phone Number:\n\nPlease guide me through the scheduling and payment steps.\n\nThank you!`;
    return `mailto:${settings.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="w-full relative z-10 py-24 px-6 md:px-12 bg-bg-dark flex flex-col items-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[80px] bg-gradient-to-b from-transparent to-gold"></div>
      
      <div className="max-w-[1280px] mx-auto w-full text-center mb-16 mt-8">
        <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Investment Blueprint</p>
        <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
        <h2 className="text-4xl md:text-6xl font-light font-serif leading-[1.16] mb-6">
          Our Services &amp; <br />
          <em className="italic text-gold not-italic">Offerings Exchange</em>
        </h2>
        <p className="text-muted text-[15px] font-light leading-[1.9] max-w-[550px] mx-auto">
          Honoring the divine exchange of energy. Choose from our specialized Astro-Numerology and healing modalities, curated to illuminate your soul path.
        </p>
      </div>

      {/* Grid of pricing cards */}
      <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch font-sans">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex flex-col bg-bg-card/40 border border-gold/10 p-6 md:p-8 rounded-sm animate-pulse relative h-[420px]">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gold/10 rounded-sm"></div>
                <div className="w-20 h-5 bg-gold/5 rounded-sm"></div>
              </div>
              <div className="w-3/4 h-6 bg-gold/15 mb-3 rounded"></div>
              <div className="w-full h-12 bg-gold/5 mb-6 rounded"></div>
              <div className="w-full h-[1px] bg-gold/10 my-4"></div>
              <div className="w-1/2 h-8 bg-gold/15 mb-6 rounded"></div>
              <div className="space-y-2 mb-8">
                <div className="w-full h-4 bg-gold/5 rounded"></div>
                <div className="w-5/6 h-4 bg-gold/5 rounded"></div>
                <div className="w-4/5 h-4 bg-gold/5 rounded"></div>
              </div>
              <div className="w-full h-11 bg-gold/10 rounded-sm mt-auto"></div>
            </div>
          ))
        ) : services.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20">
            <p className="text-muted text-sm tracking-widest uppercase">No services configured yet</p>
          </div>
        ) : (
          services.map((service, idx) => (
            <div 
              key={service.id || idx} 
              className="flex flex-col bg-bg-card border border-gold/15 p-6 md:p-8 rounded-sm hover:border-gold/45 hover:shadow-[0_8px_30px_rgba(201,130,50,0.06)] transition-all duration-300 relative group overflow-hidden"
            >
              {/* Corner Decorative Asset */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-gold/10 group-hover:border-gold/30 transition-all duration-300 rounded-tr-sm"></div>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl p-2.5 bg-bg-input border border-gold/10 rounded-sm flex items-center justify-center shadow-sm">
                  {service.iconText}
                </span>
                <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-muted py-1 px-2 border border-muted/10 bg-muted/5 rounded-sm">
                  Premium
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-light font-serif text-text-main mb-3 leading-snug min-h-[56px] group-hover:text-gold transition-colors duration-300">
                {service.title}
              </h3>

              <p className="text-[13px] text-dim font-light leading-relaxed mb-6 flex-grow">
                {service.description}
              </p>

              <div className="w-full bg-gold/10 h-[1px] my-4"></div>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-serif font-semibold text-gold tracking-tight">
                  {service.price}
                </span>
                <span className="text-[10px] uppercase text-dim tracking-wider font-light">
                  / session
                </span>
              </div>

              <ul className="space-y-2.5 mb-8 text-left">
                {(Array.isArray(service.features) ? service.features : []).map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-[12px] text-text-main/80 font-light leading-tight">
                    <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleBookNow(service)}
                className="w-full mt-auto py-3 px-6 border border-gold/45 text-[11px] uppercase tracking-[0.2em] font-medium text-gold hover:bg-gold hover:text-white transition-all duration-300 rounded-sm cursor-pointer shadow-sm active:scale-98"
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>

      {/* Decorative Floating Astro Symbols */}
      <div className="max-w-[1280px] w-full text-center mt-20">
        <p className="text-[11px] tracking-[0.3em] uppercase text-dim text-center">
          ✨ Distance sessions conducted securely worldwide over Zoom or Voice Call ✨
        </p>
      </div>

      {/* Elegant Real-Integration Booking Selection Dialog */}
      {selectedService && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={closeDialog}
          ></div>
          
          {/* Modal Container */}
          <div className={`relative bg-bg-card border-2 border-gold/40 w-full ${showEmailForm && !formSubmitted ? 'max-w-xl' : 'max-w-lg'} p-6 md:p-8 rounded-sm shadow-2xl z-10 animate-[fadeIn_0.25s_ease-out] text-left my-8`}>
            
            {/* Close Button */}
            <button 
              onClick={closeDialog}
              className="absolute top-4 right-4 p-2 text-dim hover:text-gold hover:bg-gold/5 transition-all duration-200 border border-transparent hover:border-gold/10 rounded-full cursor-pointer z-20"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {formSubmitted ? (
              // STEP 3: SUCCESS CONFIRMATION
              <div className="text-center py-8 px-4 font-sans">
                <div className="w-16 h-16 bg-gold/10 border border-gold/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-gold animate-[scaleIn_0.3s_ease-out]" />
                </div>
                <h4 className="text-2xl font-serif text-gold font-light mb-3">Booking Requested Successfully</h4>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto mb-6">
                  Thank you. Your natal details and booking request for <strong className="text-gold font-medium">"{selectedService.title}"</strong> have been securely registered and channeled to our Master Numerologist.
                </p>
                <div className="bg-bg-dark/40 border border-gold/15 p-4 rounded-sm text-xs text-dim text-left max-w-sm mx-auto mb-6 space-y-1">
                  <div>• <strong>Seeker Name:</strong> {fullName}</div>
                  <div>• <strong>Birth Date:</strong> {dob}</div>
                  <div>• <strong>Time of Birth:</strong> {hourWheel.toString().padStart(2, '0')}:{minuteWheel.toString().padStart(2, '0')} {periodWheel}</div>
                  <div>• <strong>Exchange Value:</strong> {selectedService.price}</div>
                </div>
                <button
                  onClick={closeDialog}
                  className="px-8 py-3 bg-gold hover:bg-gold-lt text-[#ffffff] font-medium text-[11px] uppercase tracking-[0.2em] transition-all rounded-sm cursor-pointer shadow-md"
                >
                  Back to Exchange
                </button>
              </div>
            ) : showEmailForm ? (
              // STEP 2: EMAIL FORM (IMAGE 2)
              <form onSubmit={handleFormSubmit} className="space-y-5 font-sans">
                <div className="border-b border-gold/15 pb-4 mb-4">
                  <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-gold block mb-1">
                    Divine Seeker Registration
                  </span>
                  <h3 className="text-lg md:text-xl font-light font-serif text-text-main leading-snug">
                    Book: {selectedService.title}
                  </h3>
                  <p className="text-xs text-gold/80 font-mono mt-1">
                    Energy Exchange: {selectedService.price}
                  </p>
                </div>

                {formErrorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-xs">
                    {formErrorMsg}
                  </div>
                )}

                {/* 1. Full Legal Name input */}
                <div className="space-y-1.5 text-left">
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
                    className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm"
                  />
                </div>

                {/* 2 & 3: Calendar date of birth + Time of birth side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      Correct Date of Birth <span className="text-gold/80">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm h-[46px]"
                    />
                  </div>

                  <div className="space-y-1.5 text-left relative">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      Correct Time of Birth <span className="text-gold/80">*</span>
                    </label>
                    
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsTimePopoverOpen(!isTimePopoverOpen)}
                        className={`w-full bg-bg-dark/60 border ${
                          isTimePopoverOpen ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.15)]' : 'border-gold/20'
                        } px-4 py-2 rounded-sm text-left transition-all duration-300 flex flex-col justify-center min-h-[46px] hover:border-gold/50 cursor-pointer active:scale-[0.99]`}
                      >
                        <span className="text-[8px] uppercase tracking-[0.2em] text-gold/60 font-medium block leading-none mb-1">Time of Birth</span>
                        <span className="text-sm font-serif text-text-main font-semibold tracking-wider flex items-center gap-1.5">
                          {hourWheel.toString().padStart(2, '0')}:{minuteWheel.toString().padStart(2, '0')} <span className="text-gold text-xs font-sans tracking-widest">{periodWheel}</span>
                        </span>
                      </button>

                      {isTimePopoverOpen && (
                        <>
                          {/* Close overlay */}
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setIsTimePopoverOpen(false)} 
                          />
                          
                          {/* Time Picker popover containing scroll-based cylindrical helper */}
                          <div className="absolute left-0 right-0 mt-2 bg-bg-card border border-gold/30 p-3 rounded-md shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-40 animate-in fade-in slide-in-from-top-3 duration-250 backdrop-blur-md">
                            <div className="absolute -top-[6px] left-[15%] w-3 h-3 bg-bg-card border-t border-l border-gold/30 transform rotate-45"></div>
                            
                            <div className="w-full bg-bg-dark/80 p-2 rounded-sm flex flex-col items-center relative overflow-hidden">
                              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[92%] h-10 bg-white/5 border-y border-gold/15 rounded-md pointer-events-none"></div>
                              
                              <div className="grid grid-cols-3 gap-1 w-full max-w-[220px] z-10">
                                <TimeWheelColumn
                                  options={Array.from({ length: 12 }, (_, i) => i + 1)}
                                  value={hourWheel}
                                  onChange={setHourWheel}
                                />
                                <TimeWheelColumn
                                  options={Array.from({ length: 60 }, (_, i) => i)}
                                  value={minuteWheel}
                                  onChange={setMinuteWheel}
                                />
                                <TimeWheelColumn
                                  options={['AM', 'PM']}
                                  value={periodWheel}
                                  onChange={setPeriodWheel}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gold/10">
                              <span className="text-[9px] uppercase font-mono tracking-widest text-muted">
                                Selected: {hourWheel.toString().padStart(2, '0')}:{minuteWheel.toString().padStart(2, '0')} {periodWheel}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsTimePopoverOpen(false)}
                                className="px-4 py-1.5 bg-gold text-bg-dark hover:bg-gold-lt text-[9px] uppercase font-bold tracking-[0.15em] rounded-sm transition-all cursor-pointer shadow-md"
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

                {/* 4 & 5: Place of birth and flag-aligned mobile code picker side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
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
                      className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm"
                    />
                  </div>

                  <div className="space-y-1.5 text-left relative">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-gold" />
                      Mobile Number <span className="text-gold/80">*</span>
                    </label>
                    
                    <div className="relative">
                      <div className="w-full bg-bg-dark/60 border border-gold/20 rounded-sm flex items-stretch focus-within:border-gold transition-all duration-300 min-h-[46px]">
                        {/* Selector Trigger */}
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="flex items-center gap-1 px-3 bg-white/[2%] border-r border-gold/15 hover:bg-gold/5 transition-all outline-none rounded-l-sm shrink-0 cursor-pointer"
                        >
                          <span className="text-base select-none">{selectedCountry.flag}</span>
                          <ChevronDown className={`w-3 h-3 text-muted transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Phone Number input */}
                        <div className="flex-1 px-3 py-1 flex flex-col justify-center text-left">
                          <label className="text-[8px] uppercase tracking-[0.2em] text-gold/60 font-medium block leading-none mb-0.5">Phone number *</label>
                          <div className="flex items-center leading-none">
                            <span className="text-xs font-mono text-gold mr-1 select-none font-medium leading-none">{selectedCountry.dial}</span>
                            <input
                              type="tel"
                              required
                              placeholder="Phone number"
                              value={phoneBody}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9\- ]/g, '');
                                setPhoneBody(val);
                              }}
                              className="w-full bg-transparent border-none outline-none p-0 text-xs text-text-main font-semibold tracking-wider font-sans placeholder:text-muted/30 focus:ring-0 focus:outline-none leading-none h-4"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dropdown containing live flag select, search tool, tick-alignment and scroll box */}
                      {isCountryDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40 bg-transparent" 
                            onClick={() => setIsCountryDropdownOpen(false)} 
                          />
                          
                          <div className="absolute left-0 right-0 mt-2 bg-bg-card border border-gold/25 rounded-sm shadow-[0_15px_30px_rgba(0,0,0,0.85)] z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md">
                            <div className="relative mb-2">
                              <Search className="w-3.5 h-3.5 text-gold/65 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full bg-bg-dark/75 border border-gold/15 pl-8 pr-3 py-1.5 text-xs text-text-main placeholder:text-muted/40 outline-none focus:border-gold/50 rounded-xs transition-all"
                              />
                            </div>
                            
                            <div className="max-h-[140px] overflow-y-auto space-y-1 custom-scrollbar text-left font-sans">
                              {filteredCountries.map((c) => {
                                const isSelected = c.code === selectedCountry.code;
                                return (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(c);
                                      setIsCountryDropdownOpen(false);
                                      setCountrySearch('');
                                    }}
                                    className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-sm transition-all cursor-pointer border ${
                                      isSelected ? 'bg-gold/10 border-gold/30' : 'hover:bg-gold/5 border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base select-none leading-none">{c.flag}</span>
                                      <span className="text-xs text-text-main font-medium leading-none">{c.name}</span>
                                      <span className="text-[10px] text-gold/70 font-mono font-light leading-none">({c.dial})</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-gold shrink-0" />}
                                  </button>
                                );
                              })}
                              {filteredCountries.length === 0 && (
                                <div className="text-center py-2 text-[10px] text-muted font-light">
                                  No matches
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 6. Response email ID */}
                <div className="space-y-1.5 text-left">
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
                    className="w-full bg-bg-dark/60 border border-gold/20 px-4 py-3 text-sm text-text-main outline-none focus:border-gold transition-all duration-300 rounded-sm"
                  />
                </div>

                {/* Action button bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="flex-1 order-2 sm:order-1 py-3 px-6 border border-gold/20 text-[11px] uppercase tracking-[0.2em] text-muted hover:text-gold hover:border-gold/60 hover:bg-gold/5 transition-all rounded-sm cursor-pointer"
                  >
                    Back to choices
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 order-1 sm:order-2 bg-gold hover:bg-gold-lt text-[#ffffff] font-medium text-[11px] uppercase tracking-[0.2em] py-3 px-6 rounded-sm shadow-md transition-all cursor-pointer font-bold duration-300 disabled:opacity-50"
                  >
                    {formLoading ? 'Transmitting Details...' : 'Book'}
                  </button>
                </div>
              </form>
            ) : (
              // STEP 1: CHOICE SELECTION (IMAGE 1)
              <>
                <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-gold mb-2 block">
                  Confirm Direct Reservation
                </span>

                <h3 className="text-2xl md:text-3xl font-light font-serif text-text-main mb-2 leading-tight pr-6">
                  {selectedService.title}
                </h3>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-serif text-gold font-semibold">
                    {selectedService.price}
                  </span>
                  <span className="text-xs uppercase text-dim tracking-wider font-light">
                    Energy Exchange
                  </span>
                </div>

                <p className="text-[14px] text-muted font-light leading-relaxed mb-6 bg-white/50 border border-gold/10 p-4 rounded-sm">
                  ✨ <strong>Select your preferred booking platform below.</strong> Your inquiry message will be drafted with the service title and price automatically to speed up your booking process.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp Option */}
                  <a 
                    href={getWhatsAppLink(selectedService)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-5 rounded-sm transition-all duration-300 font-medium text-[12px] uppercase tracking-[0.15em] shadow-md hover:shadow-lg active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Book via WhatsApp
                  </a>

                  {/* Email Option */}
                  <button 
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="flex items-center justify-center gap-3 bg-gold hover:bg-gold-lt text-[#ffffff] py-3.5 px-5 rounded-sm transition-all duration-300 font-medium text-[12px] uppercase tracking-[0.15em] shadow-md hover:shadow-lg active:scale-95 border border-gold cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    Book via Email
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 text-center mt-6">
                  Typically responds within 2-4 business hours. Thank you.
                </p>
              </>
            )}

          </div>
        </div>
      )}
    </section>
  );
}
