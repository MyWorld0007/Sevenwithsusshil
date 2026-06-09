import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { apiFetch } from '../lib/api';
import { PricingService } from '../Types';
import { CheckCircle, MessageSquare, Mail, X } from 'lucide-react';

export default function Pricing() {
  const settings = useSettings();
  const [selectedService, setSelectedService] = useState<PricingService | null>(null);
  const [services, setServices] = useState<PricingService[]>([]);
  const [loading, setLoading] = useState(true);

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
        setServices(parsed);
      }
    } catch (e) {
      console.error("Error fetching pricing services:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (service: PricingService) => {
    setSelectedService(service);
  };

  const closeDialog = () => {
    setSelectedService(null);
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
            onClick={closeDialog}
          ></div>
          
          {/* Modal Container */}
          <div className="relative bg-bg-card border-2 border-gold/40 w-full max-w-lg p-6 md:p-8 rounded-sm shadow-2xl z-10 animate-[fadeIn_0.25s_ease-out] text-left">
            
            {/* Close Button */}
            <button 
              onClick={closeDialog}
              className="absolute top-4 right-4 p-2 text-dim hover:text-gold hover:bg-gold/5 transition-all duration-200 border border-transparent hover:border-gold/10 rounded-full cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

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
              <a 
                href={getEmailLink(selectedService)}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gold hover:bg-gold-lt text-[#ffffff] py-3.5 px-5 rounded-sm transition-all duration-300 font-medium text-[12px] uppercase tracking-[0.15em] shadow-md hover:shadow-lg active:scale-95 border border-gold"
              >
                <Mail className="w-4 h-4" />
                Book via Email
              </a>
            </div>

            <p className="text-[11px] text-zinc-400 text-center mt-6">
              Typically responds within 2-4 business hours. Thank you.
            </p>

          </div>
        </div>
      )}
    </section>
  );
}
