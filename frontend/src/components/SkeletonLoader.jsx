import React from 'react';

// Reusable skeleton block
const Sk = ({ className = '' }) => (
  <div className={`bg-outline-variant/30 rounded-xl animate-pulse ${className}`} />
);

export function PageSkeleton({ type = 'default' }) {
  if (type === 'events') return (
    <div className="animate-pulse">
      <div className="py-16 bg-surface-container-lowest flex flex-col items-center gap-4">
        <Sk className="h-4 w-24" /><Sk className="h-10 w-64" /><Sk className="h-4 w-80" />
      </div>
      <div className="py-16 bg-surface container-max mx-auto">
        <div className="flex gap-3 mb-10"><Sk className="h-10 w-28" /><Sk className="h-10 w-24" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Sk key={i} className="h-52" />)}
        </div>
      </div>
    </div>
  );

  if (type === 'team') return (
    <div className="animate-pulse">
      <div className="py-16 bg-surface-container-lowest flex flex-col items-center gap-4">
        <Sk className="h-4 w-24" /><Sk className="h-10 w-56" /><Sk className="h-4 w-80" />
      </div>
      <div className="py-16 bg-surface">
        <div className="container-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card overflow-hidden">
              <div className="h-72 bg-outline-variant/30 animate-pulse flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-outline-variant/50" />
              </div>
              <div className="p-6 space-y-3">
                <Sk className="h-6 w-3/4" /><Sk className="h-4 w-1/2" /><Sk className="h-4 w-full" /><Sk className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (type === 'booking') return (
    <div className="animate-pulse">
      <div className="py-16 bg-surface-container-lowest flex flex-col items-center gap-4">
        <Sk className="h-4 w-24" /><Sk className="h-10 w-64" /><Sk className="h-4 w-80" />
      </div>
      <div className="py-12 bg-surface">
        <div className="container-max">
          <Sk className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <Sk key={i} className="h-44" />)}
          </div>
        </div>
      </div>
    </div>
  );

  // default
  return (
    <div className="animate-pulse container-max py-16 space-y-6">
      <Sk className="h-8 w-48" />
      <Sk className="h-4 w-full" />
      <Sk className="h-4 w-5/6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1,2,3].map(i => <Sk key={i} className="h-40" />)}
      </div>
    </div>
  );
}
