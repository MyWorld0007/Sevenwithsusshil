import React from 'react';
import { useSettings } from '../hooks/useSettings';

export default function Booking() {
  const settings = useSettings();

  return (
    <section id="booking" className="w-full relative z-10 py-32 px-6 md:px-12 text-center overflow-hidden min-h-screen flex items-center justify-center">
      <div className="font-serif text-[18vw] font-light text-gold/[0.045] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none z-0">✦</div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[70px] bg-gradient-to-b from-transparent to-gold"></div>
      
      <div className="relative z-10 max-w-[1280px] mx-auto reveal vis mt-8">
        <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Begin Your Journey</p>
        <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
        <h2 className="text-4xl md:text-6xl font-light font-serif leading-[1.16] mb-6">Your numbers are<br /><em className="italic text-gold not-italic">waiting to speak</em></h2>
        <p className="text-muted text-[15px] font-light leading-[1.9] max-w-[450px] mx-auto mb-10">Book a personal session and step into a conversation with your own cosmic blueprint. Sessions available online, worldwide.</p>

        {settings && (
        <div className="mt-16 flex flex-col items-center">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-dim mb-6">Connect directly</p>
          <div className="flex flex-row items-center justify-center gap-6">
            <a 
              href={`mailto:${settings.email}?subject=${encodeURIComponent(settings.email_subject)}&body=${encodeURIComponent(settings.email_body)}`} 
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
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(settings.whatsapp_message)}`} 
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
        )}
      </div>
    </section>
  );
}
