import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const serviceData = {
  'life-path-reading': {
    title: 'Life Path Reading',
    subtitle: 'The Blueprint of Your Soul\'s Journey',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Your Life Path number is the single most important number in numerology. Calculated from your full date of birth, it acts as a blueprint — a cosmic map that outlines the major themes, lessons, opportunities, and challenges you are destined to encounter throughout your lifetime.</p>
        <p>Think of it as the "script" your soul chose before you arrived in this world. It doesn't predict a fixed fate, but rather illuminates the terrain you are most likely to travel. Some people feel an immediate and deep recognition when they hear their Life Path reading — a sense of "yes, this is exactly what my life has been about."</p>
        
        <h3 className="text-2xl font-serif text-gold mt-10 mb-6">What a Life Path Reading reveals:</h3>
        <ul className="list-disc pl-6 space-y-3 mb-8">
          <li><strong>Your core strengths</strong> and natural talents</li>
          <li><strong>The recurring life lessons</strong> you are here to master</li>
          <li><strong>The types of experiences</strong> and environments that will help you grow</li>
          <li><strong>The shadow side</strong> of your personality — patterns that may hold you back</li>
          <li><strong>The broader spiritual purpose</strong> behind your earthly journey</li>
        </ul>
        <p className="mt-8">Whether you are in your twenties just starting out, in your forties navigating a major transition, or in your sixties reflecting on a life well-lived, a Life Path Reading offers timeless wisdom that remains relevant at every stage.</p>
      </div>
    ),
  },
  'birth-name-analysis': {
    title: 'Birth Date, Name Analysis & Name Correction',
    subtitle: 'Shaping Your Destiny',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Names carry a lasting influence because they become part of our identity, communication, and personal energy throughout life. Birth date and name analysis focuses on understanding whether a person’s name is aligned with their natural strengths and life path.</p>
        <p>Sometimes individuals experience repeated obstacles, lack of confidence, emotional imbalance, career delays, or relationship challenges despite genuine effort. In many cases, small energetic imbalances in the name may contribute to these patterns. Name correction aims to create a more supportive and balanced alignment.</p>
        <p>The process involves analyzing the birth date alongside the numerical value and vibration of the current name. Based on this analysis, suitable modifications may be suggested while preserving the individuality and identity of the original name whenever possible.</p>
        <p>Name correction does not change a person’s destiny overnight, but it can help improve confidence, clarity, opportunities, communication, and overall personal flow over time. Many people choose this guidance during important life phases such as career changes, business launches, marriage, or personal transformation.</p>
        <p>A balanced and aligned name can act as a supportive force that strengthens self-expression, personal growth, and long-term progress.</p>
      </div>
    ),
  },
  'relationship-compatibility': {
    title: 'Relationship Compatibility Analysis',
    subtitle: 'Understanding Emotional Dynamics',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Relationships are built on emotional understanding, communication, trust, and compatibility. Relationship compatibility analysis helps individuals understand the natural dynamics between two people and identify areas of harmony as well as possible challenges.</p>
        <p>Every person carries a unique emotional and behavioral pattern that affects how they communicate, express love, handle conflicts, and build connections. Compatibility analysis studies these patterns to provide deeper insight into emotional bonding, mutual understanding, and long-term relationship balance.</p>
        <p>This guidance is useful for couples, married partners, business partnerships, friendships, and even family relationships. It can help reveal emotional strengths, communication styles, decision-making compatibility, and areas where patience or understanding may be needed.</p>
        <p>Rather than creating fear or rigid predictions, compatibility analysis is meant to improve awareness and strengthen relationships through better understanding. It often helps people recognize each other’s emotional needs and create healthier communication patterns.</p>
        <p>Strong relationships grow when both individuals understand and respect each other’s nature. Compatibility insights can support emotional harmony, trust, stability, and a more balanced connection in personal and professional relationships alike.</p>
      </div>
    ),
  },
  'career-success-guidance': {
    title: 'Career Path & Success Guidance',
    subtitle: 'Aligning With Your Strengths',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Every individual has unique strengths, ambitions, and natural abilities that influence their career journey. Career path and success guidance helps identify suitable professional directions based on personal energy patterns, decision-making style, leadership qualities, and growth potential.</p>
        <p>Many people struggle not because they lack talent, but because they are working in environments that do not match their natural abilities. Understanding your personal strengths can help you make clearer career decisions and avoid unnecessary confusion or repeated setbacks.</p>
        <p>This guidance explores areas such as career compatibility, business potential, leadership capabilities, communication skills, creativity, and financial growth patterns. It can also provide clarity during career transitions, job changes, startup planning, or professional uncertainty.</p>
        <p>Whether someone is pursuing corporate success, entrepreneurship, creative professions, or independent ventures, personalized guidance can help identify opportunities that align with their strengths and long-term goals.</p>
        <p>Success is not only about hard work; it is also about direction, timing, confidence, and making decisions with clarity. Career guidance helps individuals move forward with better focus, improved confidence, and a stronger understanding of their personal path toward achievement.</p>
      </div>
    ),
  },
  'child-name-alignment': {
    title: 'Child Birth Date & Name Alignment Analysis',
    subtitle: 'Harmonizing Early Potential',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>A child’s birth date carries a unique energetic pattern that can influence personality, learning style, emotional nature, strengths, and future opportunities. When combined with name alignment analysis, it becomes a powerful way to understand how a child may naturally grow and respond to life experiences.</p>
        <p>Birth date and name alignment analysis focuses on balancing the vibration of the child’s date of birth with the numerical value of their name. Sometimes a name may naturally support confidence, creativity, intelligence, and emotional stability. In other situations, minor imbalances can create unnecessary obstacles in communication, focus, health, or self-expression.</p>
        <p>This guidance is often helpful for parents who want to select a meaningful name for a newborn or understand their child’s behavioral patterns more deeply. The analysis can highlight personality traits, educational strengths, emotional sensitivity, leadership qualities, and natural talents.</p>
        <p>Rather than predicting life in a rigid way, this approach provides insight into the child’s natural energy and potential path. It can also help parents make supportive decisions regarding education, confidence building, and emotional development.</p>
        <p>A properly aligned name can create a positive energetic foundation that supports growth, harmony, and future success throughout different stages of life.</p>
      </div>
    ),
  },
  'business-numerology': {
    title: 'Business Numerology & Prosperity Blueprint',
    subtitle: 'Structuring For Growth',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Every successful business is built on strategy, timing, vision, and strong decision-making. Business numerology and prosperity guidance focuses on understanding the energetic foundation of a business and aligning it for growth, stability, and long-term success.</p>
        <p>A business name, launch date, brand identity, and leadership energy can all influence how the business connects with clients, opportunities, and financial growth. Proper alignment helps create stronger business visibility, better decision-making flow, and improved market confidence.</p>
        <p>This guidance can support entrepreneurs, startups, professionals, and established business owners who want deeper clarity about branding, partnerships, expansion, and financial direction. It may also help in selecting business names, launch dates, office numbers, or strategic timing for important decisions.</p>
        <p>Business prosperity is not only about profits; it also involves stability, reputation, client relationships, and consistent growth. Understanding the energetic strengths and challenges within a business structure can help owners make more balanced and informed choices.</p>
        <p>A well-aligned business foundation can support stronger momentum, positive opportunities, and a clearer path toward sustainable success and prosperity.</p>
      </div>
    ),
  },
  'lucky-alignment': {
    title: 'Lucky Numbers, Alphabets & Colour Alignment Guidance',
    subtitle: 'Daily Resonances',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Numbers, alphabets, and colors often carry symbolic energy that can influence confidence, communication, and personal alignment. Lucky alignment guidance helps individuals identify combinations that naturally resonate with their personality and life path.</p>
        <p>This analysis may include favorable numbers, supportive alphabets, beneficial colors, important dates, and personalized alignment suggestions based on an individual’s birth details and name patterns. These insights are often used in daily life, branding, personal decisions, business identity, and important occasions.</p>
        <p>For some people, certain colors may increase confidence and positivity, while specific numbers or alphabets may strengthen communication, creativity, leadership, or financial energy. The purpose of this guidance is to create greater harmony between personal energy and external choices.</p>
        <p>Many individuals use these insights while selecting business names, mobile numbers, vehicle numbers, branding themes, signatures, or important dates for major decisions.</p>
        <p>Rather than depending entirely on luck, alignment guidance encourages individuals to make choices that feel naturally supportive and balanced for their personal and professional growth.</p>
      </div>
    ),
  },
  'focused-insight': {
    title: 'Focused Insight Session (Single Question Guidance)',
    subtitle: 'Targeted Clarity',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Sometimes a person does not need a complete life reading but simply wants clarity regarding one important question. A focused insight session is designed to provide direct guidance and deeper understanding about a specific concern or situation.</p>
        <p>This session can cover areas such as career decisions, business opportunities, relationships, finances, emotional confusion, personal growth, partnerships, timing, or future direction. The goal is to provide clarity, practical understanding, and a balanced perspective.</p>
        <p>Many people seek focused guidance during moments of uncertainty when they feel mentally stuck or emotionally overwhelmed. A single-question session helps simplify complex thoughts and bring attention to the most important factors influencing the situation.</p>
        <p>Rather than giving unrealistic promises, the session aims to offer supportive insights that help individuals make clearer and more confident decisions. It encourages self-awareness, emotional balance, and practical understanding of possible outcomes and opportunities.</p>
        <p>A focused insight session can often provide the clarity needed to move forward with confidence, peace of mind, and better direction.</p>
      </div>
    ),
  },
  'gemstone-crystal-rudraksha-recommendation': {
    title: 'Gemstone, Crystal & Rudraksha Recommendation',
    subtitle: 'Energetic Harmonization & Balance',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Gemstones, crystals, and Rudraksha beads have been valued for centuries for their symbolic, spiritual, and energetic significance. Personalized recommendations are based on an individual’s birth details, name alignment, personality patterns, emotional needs, and life goals to help create greater balance and positivity.</p>
        <p>Every gemstone and crystal is believed to carry a unique vibration that may support different aspects of life such as confidence, emotional healing, focus, prosperity, communication, protection, or spiritual growth. Similarly, Rudraksha beads are traditionally associated with inner stability, peace of mind, strength, and spiritual awareness.</p>
        <p>A personalized recommendation process helps identify which gemstone, crystal, or Rudraksha is naturally aligned with a person’s energy rather than selecting one randomly. This guidance can be especially useful for individuals facing challenges related to career growth, emotional stress, decision-making, financial instability, relationships, or lack of focus.</p>
        <p>The recommendation may also include guidance on suitable metals, wearing methods, activation practices, and supportive combinations to maximize alignment and comfort. The goal is not superstition or dependency, but creating a positive and supportive influence in daily life.</p>
        <p>When selected thoughtfully and worn correctly, gemstones, crystals, and Rudraksha can act as meaningful tools for confidence, emotional balance, clarity, and personal growth while supporting an individual’s journey toward harmony and success.</p>
      </div>
    ),
  }
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? serviceData[slug as keyof typeof serviceData] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!data) {
    return (
      <div className="w-full flex-grow flex flex-col items-center justify-center pt-32 pb-20">
        <h2 className="text-2xl font-serif text-gold mb-4">Service Not Found</h2>
        <Link to="/" className="text-xs uppercase tracking-widest text-muted hover:text-gold transition-colors">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-32 px-6 md:px-12 max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">{data.subtitle}</div>
        <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
        <h1 className="text-4xl md:text-5xl font-light font-serif text-gold leading-[1.2]">{data.title}</h1>
      </div>

      <div className="bg-bg-card border border-gold/20 p-8 md:p-12 shadow-[0_0_30px_rgba(201,160,80,0.03)] w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
        <div className="w-full">
          {data.content}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center pt-10 border-t border-gold/10">
          <Link to="/" className="text-xs uppercase tracking-widest text-muted hover:text-gold transition-colors border border-transparent hover:border-gold/30 px-6 py-3 rounded">
            ← Explore Other Offerings
          </Link>
          <a href="/#booking" className="bg-gold text-bg-dark px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors rounded shadow-lg shadow-gold/10">
            Book This Reading
          </a>
        </div>
      </div>
    </div>
  );
}
