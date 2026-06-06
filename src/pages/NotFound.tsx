import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-8xl md:text-9xl font-display font-light text-gold/20 mb-4 tracking-tighter">404</h1>
      <h2 className="text-3xl md:text-4xl font-display font-light text-gold mb-6">Page Not Found</h2>
      <p className="text-text-muted max-w-md mx-auto mb-10 text-lg">
        The cosmic path you are searching for does not seem to exist in our current alignment.
      </p>
      
      <Link 
        to="/" 
        className="px-8 py-3 bg-gold/10 border border-gold/40 text-gold rounded-full hover:bg-gold/20 transition-all font-medium tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]"
      >
        Return to Safety
      </Link>
    </div>
  );
}
