import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center px-4">
        <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-primary text-5xl">music_off</span>
        </div>
        <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-primary mb-4">404</h1>
        <h2 className="text-headline-sm font-bold text-on-surface mb-4">Page Not Found</h2>
        <p className="text-body-lg text-on-surface-variant mb-10 max-w-md mx-auto">
          The rhythm stopped here. This page doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary rounded-full">
          <span className="material-symbols-outlined">home</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
