import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../Types';
import { ChevronLeft, ChevronRight, Search, X, Quote, Star, ThumbsUp, CornerDownLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface StoriesProps {
  isFullPage?: boolean;
}

// Helper to truncate text to display a brief start line
const getTruncatedText = (text: string, limit: number = 130) => {
  let cleanText = text;
  if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
    cleanText = cleanText.substring(1, cleanText.length - 1);
  }
  if (cleanText.length <= limit) return cleanText;
  return cleanText.slice(0, limit).trim() + '...';
};

// Generates dynamic, elegant background for review avatars
const getAvatarBg = (name: string) => {
  const colors = [
    'bg-[#5a7f78]', // Teal/Sage
    'bg-[#806f96]', // Amethyst/Lavender
    'bg-[#a38a5c]', // Brand Gold/Sand
    'bg-[#526f8d]', // Celestial Steel Blue
    'bg-[#996a6a]', // Jasper Rose
    'bg-[#697a66]', // Forest Sage
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Component 1: BriefStoryCard (defined outside to avoid nested component recreation)
interface BriefStoryCardProps {
  key?: React.Key;
  tst: Testimonial;
  onSelect: () => void;
}

const BriefStoryCard = ({ tst, onSelect }: BriefStoryCardProps) => {
  const isTruncated = tst.text.replace(/^"|"$/g, '').length > 130;
  return (
    <motion.div 
      layoutId={`story-card-${tst.id}`}
      onClick={onSelect}
      className="bg-bg-card border border-gold/15 p-8 rounded-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-gold/40 transition-all duration-300 flex flex-col justify-between cursor-pointer group h-[320px] relative overflow-hidden"
      whileHover={{ y: -6, boxShadow: "0 12px 30px rgba(201,160,80,0.06)" }}
    >
      <div className="absolute top-1 right-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <Quote className="w-24 h-24 text-gold transform rotate-180" />
      </div>

      <div className="relative z-10 flex-grow">
        {/* Header Ratings */}
        <div className="flex items-center gap-1 text-gold mb-4 text-xs">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star 
              key={idx} 
              className={`w-3.5 h-3.5 fill-current ${idx < (tst.rating || 5) ? 'text-gold' : 'text-gold/25'}`} 
            />
          ))}
        </div>

        {/* Snippet / Brief text showing start lines */}
        <p className="font-serif text-[15px] md:text-[16px] font-light leading-[1.75] text-muted mb-6 italic">
          "{getTruncatedText(tst.text)}"
        </p>
      </div>

      {/* Action Link & Footer */}
      <div className="relative z-10 mt-auto">
        {isTruncated && (
          <span className="text-[10px] tracking-[0.2em] text-gold/75 group-hover:text-gold uppercase font-medium transition-colors flex items-center gap-1.5 mb-5">
            Read Full Journey <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
          </span>
        )}

        <div className="flex items-center justify-between border-t border-gold/10 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-serif text-sm text-gold flex-shrink-0">
              {tst.initial}
            </div>
            <div>
              <h4 className="text-[13px] font-medium text-text-main tracking-wide">{tst.name}</h4>
              <p className="text-[10px] text-dim">{tst.loc}</p>
            </div>
          </div>
          {tst.date && (
            <p className="text-[9px] text-dim uppercase tracking-wider">{tst.date}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Component 2: TestimonialCard (defined outside with self-contained Read More / Less toggle)
const TestimonialCard = ({ tst }: { tst: Testimonial; key?: React.Key }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let cleanText = tst.text;
  if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
    cleanText = cleanText.substring(1, cleanText.length - 1);
  }

  const isLong = cleanText.length > 150;
  const displayText = isLong && !isExpanded ? cleanText.slice(0, 150).trim() + '...' : cleanText;

  return (
    <div className="bg-bg-card border border-gold/20 p-8 rounded-sm shadow-[0_0_20px_rgba(201,160,80,0.03)] h-full flex flex-col justify-between transition-all duration-300 min-h-[290px]">
      <div>
        <div className="text-gold text-[10px] tracking-[0.12em] mb-4">
          {'★'.repeat(tst.rating || 5)}{'☆'.repeat(5 - (tst.rating || 5))}
        </div>
        <p className="font-serif text-[15px] font-light italic leading-[1.8] text-muted mb-6 text-left">
          "{displayText}"
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gold hover:text-gold-lt text-[11px] tracking-wider font-semibold ml-2 inline-block focus:outline-none transition-colors border-b border-gold/25 cursor-pointer pb-0.5"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto border-t border-gold/10 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-serif text-lg text-gold flex-shrink-0">
            {tst.initial}
          </div>
          <div className="text-left">
            <div className="text-[14px] font-medium text-text-main">{tst.name}</div>
            <div className="text-[11px] text-dim mt-1">{tst.loc}</div>
          </div>
        </div>
        {tst.date && (
          <div className="text-[10px] text-dim uppercase tracking-widest text-right max-w-[80px]">{tst.date}</div>
        )}
      </div>
    </div>
  );
};

interface GoogleReviewItemProps {
  tst: Testimonial;
  key?: React.Key;
  isVoted: boolean;
  votes: number;
  onHelpfulToggle: () => void;
}

const GoogleReviewItem = ({ tst, isVoted, votes, onHelpfulToggle }: GoogleReviewItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Clean narrative text
  let cleanText = tst.text;
  if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
    cleanText = cleanText.substring(1, cleanText.length - 1);
  }
  // Unescape any HTML entities if it was double-escaped
  cleanText = cleanText.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const isLongText = cleanText.length > 280;

  return (
    <div className="border-b border-gold/10 pb-8 pt-8 flex items-start gap-4 md:gap-6 last:border-b-0">
      {/* Left Side Avatar */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-serif font-semibold flex-shrink-0 shadow-sm ${getAvatarBg(tst.name)}`}>
        {tst.initial || tst.name.charAt(0)}
      </div>

      {/* Right Side Column Contents */}
      <div className="flex-grow">
        {/* Reviewer Name */}
        <h3 className="font-sans font-medium text-[15px] md:text-[16px] text-text-main flex items-center gap-2">
          <span>{tst.name}</span>
        </h3>

        {/* User Review Stats Info */}
        <p className="text-dim text-[11px] font-light mt-0.5 tracking-wide">
          Verified Client • {tst.loc}
        </p>

        {/* Stars Array & Time Indicator */}
        <div className="flex items-center gap-1.5 mt-2 mb-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star 
                key={idx} 
                className={`w-3.5 h-3.5 fill-current ${idx < (tst.rating || 5) ? 'text-[#c9a050]' : 'text-gold/20'}`} 
              />
            ))}
          </div>
          <span className="text-[11px] text-dim font-light ml-2">
            {tst.date || '3 months ago'}
          </span>
        </div>

        {/* Testimonial Core Message */}
        <div 
          className={`font-serif text-[15px] md:text-[16.5px] font-light leading-relaxed text-text-main/90 italic ql-editor-render ${!isExpanded && isLongText ? 'line-clamp-4' : ''}`}
          dangerouslySetInnerHTML={{ __html: cleanText }}
        />
        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gold hover:text-gold-lt text-xs tracking-wider font-semibold mt-2 inline-block focus:outline-none transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Read Full Narrative'}
          </button>
        )}

        {/* Client Feedback Action Buttons */}
        <div className="flex items-center gap-6 mt-4">
          {/* Helpful Interaction Button */}
          <button 
            onClick={onHelpfulToggle}
            className={`flex items-center gap-2 text-xs font-light transition-all focus:outline-none cursor-pointer ${isVoted ? 'text-gold font-medium' : 'text-dim hover:text-gold'}`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-current text-gold' : ''}`} />
            <span>Helpful{votes > 0 ? ` (${votes})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Stories({ isFullPage = false }: StoriesProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<Testimonial | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Google Reviews inspired interactive state managers
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating-desc' | 'rating-asc'>('recent');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, number>>({});
  const [userVoted, setUserVoted] = useState<Record<number, boolean>>({});

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (selectedStory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStory]);

  useEffect(() => {
    apiFetch('/api/testimonials')
      .then(async res => {
          if (!res.ok) throw new Error("Fetch failed");
          const text = await res.text();
          if (!text) throw new Error("Empty response");
          return JSON.parse(text);
      })
      .then(data => {
          if (data.error) throw new Error(data.error);
          if (!Array.isArray(data) || data.length === 0) {
              throw new Error("No testimonials found, using defaults");
          }
          setTestimonials(data);
          const initialVotes: Record<number, number> = {};
          data.forEach((t: Testimonial) => {
              initialVotes[t.id] = t.helpful_count || 0;
          });
          setHelpfulVotes(initialVotes);
      })
      .catch(err => {
          console.error("Could not fetch testimonials, using defaults", err);
          setTestimonials([
            { id: 1, text: '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', initial: 'P', name: 'Priya Malhotra', loc: 'Mumbai, India', date: 'October 2023', rating: 5, helpful_count: 5 },
            { id: 2, text: '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', initial: 'R', name: 'Rohan Kapoor', loc: 'Bangalore, India', date: 'November 2023', rating: 5, helpful_count: 2 },
            { id: 3, text: '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', initial: 'A', name: 'Anjali Singh', loc: 'Delhi, India', date: 'January 2024', rating: 5, helpful_count: 8 },
            { id: 4, text: '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', initial: 'S', name: 'Sarah T.', loc: 'London, UK', date: 'March 2024', rating: 5, helpful_count: 0 }
          ]);
      });
  }, []);

  const nextSlide = () => {
    if (testimonials.length <= 3) return;
    setCurrentIndex(prev => (prev + 1) % (testimonials.length - 2)); 
  };

  const prevSlide = () => {
    if (testimonials.length <= 3) return;
    setCurrentIndex(prev => (prev - 1 < 0 ? testimonials.length - 3 : prev - 1));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

  const handleHelpfulToggle = async (id: number) => {
    const wasVoted = !!userVoted[id];
    const nextVoted = !wasVoted;
      
    setUserVoted(prevVoted => ({
        ...prevVoted,
        [id]: nextVoted
    }));
      
    setHelpfulVotes(prevVotes => {
        const current = prevVotes[id] || 0;
        return {
          ...prevVotes,
          [id]: nextVoted ? current + 1 : Math.max(0, current - 1)
        };
    });

    try {
      await apiFetch(`/api/testimonials/${id}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: nextVoted })
      });
    } catch(e) {
      // Revert optimistic update
      setUserVoted(prevVoted => ({
          ...prevVoted,
          [id]: wasVoted
      }));
      setHelpfulVotes(prevVotes => {
          const current = prevVotes[id] || 0;
          return {
            ...prevVotes,
            [id]: !nextVoted ? current + 1 : Math.max(0, current - 1)
          };
      });
      console.error(e);
    }
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.loc && t.loc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedTestimonials = [...filteredTestimonials].sort((a, b) => {
    if (sortBy === 'rating-desc') {
      return (b.rating || 5) - (a.rating || 5);
    }
    if (sortBy === 'rating-asc') {
      return (a.rating || 5) - (b.rating || 5);
    }
    if (sortBy === 'helpful') {
      const votesA = helpfulVotes[a.id] || 0;
      const votesB = helpfulVotes[b.id] || 0;
      return votesB - votesA;
    }
    
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    
    if (dateA !== dateB && !isNaN(dateA) && !isNaN(dateB)) {
      return dateB - dateA;
    }

    return b.id - a.id; // fallback
  });

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await apiFetch('/api/user-testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.get('text'),
          initial: formData.get('initial'),
          name: formData.get('name'),
          loc: formData.get('loc'),
          rating: formData.get('rating')
        })
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccess(false);
        form.reset();
      }, 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to submit review. Please try again.');
    }
  };

  const totalReviewsCount = testimonials.length;
  const averageRating = totalReviewsCount > 0 
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / totalReviewsCount).toFixed(1) 
    : "5.0";

  const SubmitModal = isSubmitModalOpen ? (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 z-0" 

        onClick={() => setIsSubmitModalOpen(false)} 
      />
      <div className="bg-bg-dark border border-gold/20 p-8 w-full max-w-lg shadow-2xl relative z-10">
        <button
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSubmitModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 text-muted hover:text-gold transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>
        {submitSuccess ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-serif text-gold mb-4">Thank You</h3>
            <p className="text-muted">Your story has been submitted and is pending approval.</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-serif text-gold mb-6">Share Your Story</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Name</label>
                  <input type="text" name="name" required className="w-full bg-bg-card border border-gold/20 p-3 text-sm focus:outline-none focus:border-gold transition-colors text-text-main" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Initial</label>
                  <input type="text" name="initial" required maxLength={1} className="w-full bg-bg-card border border-gold/20 p-3 text-sm focus:outline-none focus:border-gold transition-colors text-text-main" placeholder="e.g. A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Location</label>
                  <input type="text" name="loc" required className="w-full bg-bg-card border border-gold/20 p-3 text-sm focus:outline-none focus:border-gold transition-colors text-text-main" placeholder="e.g. London, UK" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Rating</label>
                  <select name="rating" required className="w-full bg-bg-card border border-gold/20 p-3 text-sm focus:outline-none focus:border-gold transition-colors text-gold uppercase tracking-widest cursor-pointer">
                    <option value="5">★★★★★</option>
                    <option value="4">★★★★☆</option>
                    <option value="3">★★★☆☆</option>
                    <option value="2">★★☆☆☆</option>
                    <option value="1">★☆☆☆☆</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-2">Story / Review</label>
                <textarea name="text" required rows={4} className="w-full bg-bg-card border border-gold/20 p-3 text-sm focus:outline-none focus:border-gold transition-colors text-text-main resize-none" placeholder="Share your experience..."></textarea>
              </div>
              <button className="w-full bg-gold text-bg-dark px-6 py-4 mt-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold-lt transition-colors">
                Submit Story
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  ) : null;

  if (isFullPage) {
    return (
      <div className="w-full relative min-h-screen py-16 px-6 md:px-12 max-w-[1000px] mx-auto flex flex-col">
        {/* Breadcrumb or Back Button */}
        <div className="mb-12 self-start">
          <Link to="/" className="text-[10px] tracking-[0.25em] text-gold/70 hover:text-gold uppercase transition flex items-center gap-2">
            <span>&larr;</span> Back to Sanctuary
          </Link>
        </div>

        {/* Heading Header with Fixed Font Color for Contrast */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold mb-4">Metaphysical Journeys</p>
          <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
          {/* UPDATED TITLE FONT COLOR TO text-text-main (#1a1a24) FOR HIGH READABILITY CONTRAST */}
          <h1 className="text-4xl md:text-6xl font-light font-serif mb-4 text-text-main tracking-tight leading-[1.12]">
            Voices of Transformation
          </h1>
          <p className="text-dim text-base md:text-lg font-light max-w-[620px] mx-auto leading-relaxed">
            A dynamic catalog of live spiritual transitions, brand breakthroughs, name alignments, and numerical revelations.
          </p>
        </div>

        {/* Google-Style Aggregate Rating Header Block */}
        <div className="bg-bg-card border border-gold/15 p-6 md:p-8 rounded-sm mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-[0_4px_24px_rgba(201,160,80,0.03)]">
          <div className="flex items-center gap-4">
            <span className="text-5xl md:text-6xl font-semibold font-sans text-text-main tracking-tight">
              {averageRating}
            </span>
            <div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className="w-5 h-5 fill-current text-[#c9a050]" 
                  />
                ))}
              </div>
              <p className="text-xs text-dim tracking-wide mt-1 font-light">
                {totalReviewsCount} cumulative reviews
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t sm:border-t-0 border-gold/10 pt-4 sm:pt-0">
            <button 
                onClick={() => setIsSubmitModalOpen(true)}
                className="bg-gold text-bg-dark px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-gold-lt transition-colors rounded-sm"
            >
              Share Your Story
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dim font-light">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-gold hover:text-gold-lt text-xs uppercase tracking-wider font-semibold cursor-pointer outline-none focus:ring-0"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Filtration Bar */}
        <div className="max-w-[480px] w-full mx-auto mb-12 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gold/50">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search journeys, names, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-bg-card border border-gold/25 rounded-full text-text-main text-sm font-light placeholder:text-muted/60 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-muted/60 hover:text-text-main"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Google Style Testimonials Grid/List Layout */}
        {sortedTestimonials.length > 0 ? (
          <div className="space-y-6 mb-24">
            {sortedTestimonials.map((tst) => (
              <GoogleReviewItem 
                key={tst.id} 
                tst={tst} 
                isVoted={!!userVoted[tst.id]}
                votes={helpfulVotes[tst.id] || 0}
                onHelpfulToggle={() => handleHelpfulToggle(tst.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gold/15 rounded-sm mb-24 bg-bg-card/30">
            <p className="text-muted font-light">No corresponding reviews match your query.</p>
            <button 
              onClick={() => setSearchQuery('')} 
              className="mt-4 px-6 py-2 border border-gold/20 text-gold text-xs uppercase tracking-widest hover:bg-gold/10 transition-colors"
            >
              Clear Search Filter
            </button>
          </div>
        )}
        {SubmitModal}
      </div>
    );
  }

  // Fallback Inline Homepage Component
  return (
    <section id="testimonials" className="w-full relative z-10 py-16 md:py-24 px-6 md:px-12 max-w-[1280px] mx-auto flex flex-col justify-center">
      <p className="text-[10px] font-medium tracking-[0.38em] uppercase text-gold text-center mb-4">Success Stories</p>
      <div className="w-[48px] h-[1px] bg-gold mx-auto mb-6"></div>
      <h2 className="text-4xl md:text-5xl font-light font-serif text-center mb-4">Voices of Transformation</h2>
      <p className="text-muted text-lg font-light text-center max-w-[500px] mx-auto mb-8">Real journeys from people who discovered clarity through the language of numbers.</p>
      
      <div className="flex justify-center mb-16">
        <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-gold text-bg-dark px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-gold-lt transition-colors rounded-sm"
        >
          Share Your Story
        </button>
      </div>

      {testimonials.length > 0 ? (
        <>
          {/* MOBILE VIEW */}
          <div className="md:hidden">
            <div className="flex justify-end gap-2 mb-6 max-w-full">
                <button onClick={() => scroll('left')} className="p-2 border border-gold/20 hover:bg-gold/10 text-gold rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => scroll('right')} className="p-2 border border-gold/20 hover:bg-gold/10 text-gold rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            <div ref={scrollRef} className="flex gap-4 w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8">
              {testimonials.map((tst, i) => (
                  <div key={i} className="min-w-[85vw] w-[85vw] flex-shrink-0 snap-center">
                      <TestimonialCard tst={tst} />
                  </div>
              ))}
            </div>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block relative">
            {testimonials.length > 3 && (
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between z-20 pointer-events-none px-2 sm:px-0">
                 <button onClick={prevSlide} className="pointer-events-auto -ml-3 sm:-ml-12 p-2 bg-bg-card border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition">
                    <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button onClick={nextSlide} className="pointer-events-auto -mr-3 sm:-mr-12 p-2 bg-bg-card border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition">
                    <ChevronRight className="w-6 h-6" />
                 </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleTestimonials.map((tst, i) => (
                <TestimonialCard key={i} tst={tst} />
              ))}
            </div>
          </div>

          {/* LINK TO FULL stories MPA WITH PREVIEW ON HOVER */}
          <div className="text-center mt-16">
            <Link 
              to="/stories" 
              className="inline-flex items-center gap-2 px-8 py-3 border border-gold/30 text-[11px] uppercase tracking-[0.25em] text-gold hover:bg-gold/10 hover:border-gold transition-all duration-300 font-medium"
            >
              Explore All Transformation Journeys &rarr;
            </Link>
          </div>
        </>
      ) : (
         <p className="text-center text-muted">No stories available.</p>
      )}
      {SubmitModal}
    </section>
  );
}
