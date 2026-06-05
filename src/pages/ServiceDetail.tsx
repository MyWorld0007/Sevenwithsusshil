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
  'name-analysis': {
    title: 'Name Analysis',
    subtitle: 'The Hidden Power in Your Name',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Your parents may have chosen your name instinctively or after great deliberation — but numerology suggests that the name you were given at birth is no accident. Each letter of the alphabet corresponds to a specific number, and those numbers combine to create a unique vibrational signature that influences your personality, your desires, and the energy you project into the world.</p>
        <p>A Name Analysis examines several key elements of your name to produce a multi-layered picture of who you are:</p>
        
        <ul className="list-none space-y-6 mt-8 mb-10">
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Expression Number (Destiny Number)</strong>
            Derived from all the letters in your full birth name, this number reveals your natural abilities, your inherent talents, and the role you are destined to play in the world. It shows what you are capable of achieving.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Soul Urge Number (Heart's Desire)</strong>
            Calculated from only the vowels in your name, this number uncovers your innermost motivations — what you truly want at the deepest level of your being, often beneath what you consciously acknowledge. It answers the question: what does your soul crave?
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Personality Number</strong>
            Drawn from the consonants in your name, this number reveals the face you present to the outside world — how others perceive you before they truly get to know you. It is your social mask, your first impression.
          </li>
        </ul>
        
        <h3 className="text-2xl font-serif text-gold mt-10 mb-6">Name Analysis is also invaluable when:</h3>
        <ul className="list-disc pl-6 space-y-3 mb-8">
          <li>Choosing a name for a newborn child</li>
          <li>Deciding on a business or brand name</li>
          <li>Considering a legal name change</li>
          <li>Understanding why certain names feel more "right" than others</li>
        </ul>
        <p className="mt-8">A comprehensive Name Analysis brings all these layers together to give you a rich, nuanced portrait of your identity — one that goes far deeper than any personality quiz or test.</p>
      </div>
    ),
  },
  'relationship-compatibility': {
    title: 'Relationship Compatibility',
    subtitle: 'Understanding the Numbers Between You',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>Every relationship has its own energetic signature. When two people come together — romantically, professionally, or as lifelong friends — their individual numbers interact in ways that can create harmony, tension, growth, or challenge. Relationship Compatibility reading in numerology is the art of understanding that interaction.</p>
        <p>This reading compares the core numerological profiles of two individuals — their Life Path numbers, Expression numbers, Soul Urge numbers, and often their Personal Year cycles — to create a detailed picture of the dynamic between them.</p>

        <h3 className="text-2xl font-serif text-gold mt-10 mb-6">What a Relationship Compatibility Reading explores:</h3>
        <ul className="list-none space-y-6 mt-8 mb-10">
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Natural Strengths</strong>
            Where your numbers align and complement each other, creating effortless understanding, shared values, or natural chemistry.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Areas of Tension</strong>
            Where your numbers may clash, creating recurring misunderstandings or areas where you push each other's buttons — not out of fault, but out of fundamental difference in approach or desire.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Growth Opportunities</strong>
            Sometimes the most powerful relationships are those where numbers challenge us to grow. This reading identifies where friction is actually an invitation to evolve.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Soul-Level Purpose</strong>
            In numerology, many relationships carry a deeper purpose. Some partnerships are karmic — designed to teach a specific lesson. Others are soulmate connections built for long-term growth and support.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Communication Styles</strong>
            Understanding how each person naturally expresses and receives love, feedback, and connection can transform even the most difficult relationship.
          </li>
        </ul>
        <p className="mt-8">This reading is not about deciding whether a relationship is "good" or "bad." It is about understanding it — so you can navigate it with more compassion, patience, and wisdom. Whether you are in a new romance, a long-term marriage, or a challenging business partnership, this reading gives you the tools to relate more consciously and lovingly.</p>
      </div>
    ),
  },
  'career-purpose-mapping': {
    title: 'Career & Purpose Mapping',
    subtitle: 'Aligning Your Work With Your Soul',
    content: (
      <div className="space-y-6 text-muted font-light leading-relaxed text-base md:text-lg">
        <p>One of the most common sources of unhappiness in modern life is the feeling that your work doesn't truly reflect who you are. You may be successful by external measures — a good salary, a respected title — and yet feel a nagging sense that something is missing, that you are not doing what you were truly meant to do.</p>
        <p>Career & Purpose Mapping uses numerology to help bridge that gap. By examining a combination of your most important numbers — particularly your Life Path, Expression Number, and current Personal Year cycle — we create a personalized map of the vocational landscape most suited to your soul's design.</p>

        <h3 className="text-2xl font-serif text-gold mt-10 mb-6">What Career & Purpose Mapping covers:</h3>
        <ul className="list-none space-y-6 mt-8 mb-10">
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Natural Vocational Gifts</strong>
            Every Life Path number is associated with certain types of work, roles, and environments where that individual is most likely to feel energized and effective. This section identifies those areas clearly.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Work Style & Environment</strong>
            Some people thrive in collaborative, social environments. Others are most productive in solitude. Some are natural leaders; others are the essential support behind the scenes. Your numbers reveal your optimal working style.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Purpose Beyond Profession</strong>
            Career mapping in numerology goes beyond job titles. It helps you understand the type of contribution you are here to make in the world — whether that's healing, building, teaching, creating, leading, or something else entirely.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Timing & Transition Guidance</strong>
            Your Personal Year number reveals the current chapter of your nine-year life cycle. Understanding where you are in that cycle helps you make smarter decisions about when to launch, when to consolidate, when to rest, and when to leap.
          </li>
          <li className="pl-6 border-l border-gold/30">
            <strong className="text-gold block mb-2 text-xl font-serif">Overcoming Self-Sabotage</strong>
            Each number also carries shadow tendencies — habitual patterns that can unconsciously derail your professional success. This reading helps you recognize and gently address those patterns.
          </li>
        </ul>
        <p className="mt-8">Career & Purpose Mapping is ideal for anyone at a professional crossroads, considering a career change, launching a business, returning to work after a break, or simply searching for more meaning and fulfillment in what they do every day.</p>
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
