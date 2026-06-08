import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { Faq } from '../Types';

export default function ContentPage() {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [faqs, setFaqs] = useState<Faq[]>([]);
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
    <div className="max-w-4xl mx-auto px-6 py-24 mb-20 w-full flex-grow">
      <h1 className="text-4xl md:text-5xl font-display text-gold mb-12 text-center md:text-left">{title}</h1>
      <div 
        className="content-html max-w-none text-text-main leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {slug === 'faq' && faqs.length > 0 && (
        <div className="mt-12 space-y-6">
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
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-bg-card border border-gold/20 p-6 rounded-sm shadow-sm group">
              <h3 className="text-xl font-serif text-gold mb-4 group-hover:text-gold-lt transition-colors">{faq.question}</h3>
              <div 
                 className="text-text-main/90 font-light leading-relaxed text-sm content-html"
                 dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .content-html h1, .content-html h2, .content-html h3 { color: #D4AF37; margin-top: 2rem; margin-bottom: 1rem; font-family: Playfair Display, serif; }
        .content-html h1 { font-size: 2.25rem; }
        .content-html h2 { font-size: 1.875rem; }
        .content-html h3 { font-size: 1.5rem; }
        .content-html p { margin-bottom: 1.25rem; }
        .content-html ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.25rem; }
        .content-html ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.25rem; }
        .content-html a { color: #D4AF37; text-decoration: underline; }
      `}</style>
    </div>
  );
}
