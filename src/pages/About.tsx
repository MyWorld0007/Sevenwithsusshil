import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';

export default function About() {
  const [aboutTitle, setAboutTitle] = useState('Bridging ancient wisdom with modern life guidance');
  const [aboutPara1, setAboutPara1] = useState('I am a Seeker, Intuitive, Healer, and Mentor with 15 years of dedicated experience guiding individuals through life’s most complex challenges. Drawing from my personal life experiences and challenges, I have transformed lessons into wisdom — and now help others navigate their paths with clarity, confidence, and purpose.');
  const [aboutPara2, setAboutPara2] = useState('By combining astro-numerology, spirituality, and Divine’s wisdom, I evaluate, identify, inspire, encourage, and empower individuals to overcome obstacles and discover their true potential. My approach is holistic: I help people balance emotions, embrace their uniqueness, and live authentically.');
  const [profilePhoto, setProfilePhoto] = useState('/profile.jpeg');

  const decodeHtml = (html: string) => {
    if (!html) return '';
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.about_title) setAboutTitle(data.about_title);
          if (data.about_para1) setAboutPara1(data.about_para1);
          if (data.about_para2) setAboutPara2(data.about_para2);
          if (data.profile_photo) setProfilePhoto(data.profile_photo);
        }
      } catch (err) {
        console.error('[About dynamic fetch failed]', err);
      }
    };
    fetchAboutData();
  }, []);

  return (
    <section id="about" className="w-full relative z-10 py-16 md:py-24 px-6 md:px-12 bg-bg-card/30 flex items-center">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-5 relative reveal vis max-w-[320px] md:max-w-none mx-auto w-full">
          <div className="w-full aspect-[3/4] bg-bg-input border border-gold/20 rounded-sm flex items-center justify-center relative shadow-[0_0_40px_rgba(201,160,80,0.1)] overflow-hidden">
            <img 
              src={profilePhoto} 
              alt="Profile" 
              className="w-full h-full object-cover relative z-10" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/profile.jpeg';
              }}
            />
          </div>
          <div className="absolute -bottom-6 -right-5 md:-right-6 w-24 h-24 md:w-28 md:h-28 rounded-full bg-gold text-bg-dark flex flex-col items-center justify-center font-serif shadow-xl z-20">
            <span className="text-3xl md:text-4xl font-medium leading-none">15+</span>
            <span className="text-[8px] md:text-[9px] tracking-[0.1em] uppercase font-sans mt-1">Years</span>
          </div>
        </div>
        <div className="md:col-span-7 reveal vis">
          <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">About SEVEN</p>
          <h2 className="text-3xl md:text-5xl font-light font-serif leading-[1.18] mb-6">{aboutTitle}</h2>
          <div className="text-[15px] font-light leading-[1.95] text-muted mb-6 ql-editor-render" dangerouslySetInnerHTML={{ __html: decodeHtml(aboutPara1) }}></div>
          <div className="text-[15px] font-light leading-[1.95] text-muted mb-8 ql-editor-render" dangerouslySetInnerHTML={{ __html: decodeHtml(aboutPara2) }}></div>
          <Link 
            to="/my-guiding-lights" 
            className="inline-block bg-gold text-bg-dark px-8 py-4 text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-gold-lt transition-colors"
          >
            My Guiding Lights
          </Link>
        </div>
      </div>
    </section>
  );
}
