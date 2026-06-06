import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function ContentPage() {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/pages/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Page not found');
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load the page.');
        setLoading(false);
      });
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
