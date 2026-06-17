import React from 'react';
import { ShieldCheck, Star, Briefcase, Heart, Baby, Sparkles, CheckCircle, Gem } from 'lucide-react';
import { motion } from 'motion/react';

const reasons = [
  { icon: ShieldCheck, text: "Personalized & Confidential Guidance", desc: "Your personal details and session insights are kept strictly confidential." },
  { icon: Star, text: "Deep-Dive Numerology Analysis", desc: "Comprehensive numerological evaluation aligned with astrological influences." },
  { icon: Briefcase, text: "Business & Brand Alignment Expertise", desc: "Optimize your corporate identity for growth, leadership, and prosperity." },
  { icon: Heart, text: "Relationship & Career Insights", desc: "Navigate your professional trajectory and romantic compatibility with clarity." },
  { icon: Baby, text: "Child Naming & Life Path Guidance", desc: "Empower your child's future with harmonious name vibrations." },
  { icon: Sparkles, text: "Reiki Grand Master", desc: <>Transform your mind, body, and spirit with <strong>Reiki, Tarot Insights, Guided Meditation, and Aura & Chakra Healing.</strong></> },
  { icon: CheckCircle, text: "Practical, Ethical & Professional Approach", desc: "Actionable advice grounded in deep metaphysical study." },
  { icon: Gem, text: "Thousands of Hours of Study, Research & Experience", desc: "Expert guidance from a seasoned practitioner of divine sciences." },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-bg-dark border-t border-gold/10 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display mb-6"><span className="text-muted">Why Clients Choose</span> <span className="text-gold">SEVEN</span></h2>
          <p className="text-text-muted max-w-2xl mx-auto text-lg">
            Experience profound transformation through authentic metaphysical sciences. We blend ancient wisdom with practical alignment to elevate your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {reasons.map((reason, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-bg-input/50 border border-gold/20 p-8 rounded-xl hover:border-gold/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                <reason.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-serif text-gold mb-3 group-hover:text-gold-lt transition-colors">{reason.text}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* SEO Features & Philosophy */}
        <div className="grid md:grid-cols-2 gap-12 items-center bg-bg-input/30 p-8 md:p-12 rounded-2xl border border-gold/10">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif text-gold">Astro-Numerology & Holistic Healing Space</h3>
            <p className="text-text-main/80 text-sm leading-relaxed">
              We provide expert <strong className="text-gold font-normal">Astro-Numerology consultations</strong>, advanced <strong className="text-gold font-normal">name vibration analysis</strong>, and professional <strong className="text-gold font-normal">business numerology</strong> services. Whether you're seeking clarity on your life path, optimized branding for business growth, or balance through Holistic approaches like <strong className="text-gold font-normal">Reiki/ Tarot/ Aura & Chakra Healing</strong>, our services are structured to align your personal vibrations with universal harmony.
            </p>
            <p className="text-text-main/80 text-sm leading-relaxed">
              At SEVEN, we combine mystical traditions with highly practical applications to deliver <strong className="text-gold font-normal">spiritual guidance</strong> designed for modern challenges.
            </p>
          </div>
          
          <div className="text-center p-8 bg-bg-dark rounded-xl border border-gold/20 relative">
            <Sparkles className="w-8 h-8 text-gold/30 absolute top-4 left-4" />
            <Sparkles className="w-8 h-8 text-gold/30 absolute bottom-4 right-4" />
            <blockquote className="text-2xl font-serif text-gold italic leading-relaxed mb-6">
              "Numbers reveal patterns. <br className="hidden md:block"/>
              Awareness creates possibilities. <br className="hidden md:block"/>
              Action transforms destiny."
            </blockquote>
            <div className="space-y-1">
              <p className="text-gold-lt font-display tracking-widest uppercase text-sm">SEVEN – Evolve with Divine Secrets</p>
              <p className="text-text-muted text-xs uppercase tracking-widest">Decode Your Numbers. Align Your Energy. Elevate Your Life.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
