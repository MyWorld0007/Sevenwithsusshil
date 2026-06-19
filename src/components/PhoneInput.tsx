import React, { useState, useRef, useEffect } from 'react';
import { Phone, ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRIES } from '../lib/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  className?: string; // used for outer border/style classes
}

export function PhoneInput({ value, onChange, onBlur, label = "Partner WhatsApp Number *", className }: PhoneInputProps) {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  // Parse initial value to find country
  const cleanValue = value ? value.replace(/[^0-9]/g, '') : '';
  const [selectedCountry, setSelectedCountry] = useState(() => {
    if (!cleanValue) return COUNTRIES[0];
    const match = COUNTRIES.find(c => cleanValue.startsWith(c.dial.replace('+', '')));
    return match || COUNTRIES[0];
  });
  
  const phoneBody = cleanValue ? (cleanValue.startsWith(selectedCountry.dial.replace('+', '')) ? cleanValue.substring(selectedCountry.dial.replace('+', '').length).trim() : cleanValue) : '';

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dial.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Sync external value to internal country state if it changes from outside
  useEffect(() => {
    if (cleanValue) {
      const match = COUNTRIES.find(c => cleanValue.startsWith(c.dial.replace('+', '')));
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match);
      }
    }
  }, [cleanValue]);

  const handlePhoneBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9\- ]/g, '');
    if (val.trim()) {
      onChange(`${selectedCountry.dial.replace('+', '')}${val.trim()}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className={`space-y-1.5 text-left relative ${className || ''}`}>
      <label className="text-[10px] uppercase tracking-[0.18em] text-muted flex items-center gap-1.5 font-medium mb-1">
        <Phone className="w-3.5 h-3.5 text-gold" />
        {label}
      </label>
      
      <div className="relative">
        <div className="w-full bg-bg-input border border-gold/20 rounded-sm flex items-stretch focus-within:border-gold transition-all duration-300 min-h-[46px]">
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
                onChange={handlePhoneBodyChange}
                onBlur={onBlur}
                className="w-full bg-transparent border-none outline-none p-0 text-xs text-text-main font-semibold tracking-wider font-sans placeholder:text-muted/30 focus:ring-0 focus:outline-none leading-none h-4"
              />
            </div>
          </div>
        </div>

        {/* Dropdown containing live flag select, search tool, tick-alignment and scroll box */}
        {isCountryDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-[160] bg-transparent" 
              onClick={() => setIsCountryDropdownOpen(false)} 
            />
            
            <div className="absolute left-0 right-0 mt-2 bg-bg-card border border-gold/25 rounded-sm shadow-[0_15px_30px_rgba(0,0,0,0.85)] z-[170] p-3 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md">
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
                        if (phoneBody.trim()) {
                          onChange(`${c.dial.replace('+', '')}${phoneBody.trim()}`);
                        } else {
                          onChange('');
                        }
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
  );
}
