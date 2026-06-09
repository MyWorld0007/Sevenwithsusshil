import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Faq } from '../Types';

export default function ContentPage() {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    
    const fetchPageData = async () => {
      try {
        const res = await apiFetch(`/api/pages/${slug}`);
        if (!res.ok) throw new Error('Page not found');
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);

        if (slug === 'faq') {
          const faqsRes = await apiFetch('/api/faqs');
          if (faqsRes.ok) {
            setFaqs(await faqsRes.json());
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Could not load the page.');
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [slug]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gold">Loading...</div>;
  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 mb-20 w-full flex-grow">
      <h1 className="text-4xl md:text-5xl font-display text-gold mb-12 text-center md:text-left">{title || (slug === 'faq' ? 'FAQs' : '')}</h1>
      <div 
        className="ql-editor p-0 max-w-none text-text-main leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {slug === 'faq' && faqs.length > 0 && (
        <div className="mt-12 space-y-4">
          <script 
            type="application/ld+json" 
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer.replace(/<[^>]*>?/gm, '')
                  }
                }))
              })
            }}
          />
          {faqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
            <div key={faq.id} className="bg-bg-card border border-gold/20 p-6 rounded-sm shadow-sm group cursor-pointer" onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}>
              <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif text-gold pr-4 group-hover:text-gold-lt transition-colors">{faq.question}</h3>
                  <ChevronDown className={`w-5 h-5 text-gold transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden mt-0'}`}>
                <div className="ql-editor p-0 text-text-main/90 font-light leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
