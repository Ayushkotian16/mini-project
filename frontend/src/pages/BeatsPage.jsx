import React, { useEffect, useRef, useState } from 'react';
import { beatAPI, contentAPI } from '../services/api';

// ── Skeleton ──────────────────────────────────────────
function BeatCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-surface-container-low" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-surface-container-low rounded w-3/4" />
        <div className="h-4 bg-surface-container-low rounded w-full" />
        <div className="h-4 bg-surface-container-low rounded w-2/3" />
        <div className="h-12 bg-surface-container-low rounded-xl mt-2" />
      </div>
    </div>
  );
}

// ── Audio Player ──────────────────────────────────────
function AudioPlayer({ audioUrl, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      setLoading(true);
      audio.play().catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => { setPlaying(true); setLoading(false); };
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [audioUrl]);

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <div className="mt-3 bg-surface-container-low rounded-xl p-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {playing ? 'pause' : 'play_arrow'}
            </span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Progress bar */}
          <div
            className="w-full h-2 bg-outline-variant rounded-full cursor-pointer relative overflow-hidden"
            onClick={seek}
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Time */}
          <div className="flex justify-between text-label-sm text-on-surface-variant mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Beat Card ─────────────────────────────────────────
function BeatCard({ beat }) {
  return (
    <div className="card overflow-hidden hover:-translate-y-1 transition-transform group flex flex-col">
      {/* Cover image */}
      <div className="w-full aspect-square bg-surface-container-low overflow-hidden flex items-center justify-center">
        {beat.imageUrl ? (
          <img
            src={beat.imageUrl}
            alt={beat.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary/30">
            <span className="material-symbols-outlined text-7xl">music_note</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {beat.category && beat.category !== 'General' && (
          <span className="inline-block bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-label-sm mb-2 self-start">
            {beat.category}
          </span>
        )}
        <h3 className="text-headline-sm font-bold text-on-surface mb-1 leading-tight">{beat.title}</h3>
        {beat.description && (
          <p className="text-body-sm text-on-surface-variant mb-2 line-clamp-2">{beat.description}</p>
        )}
        {beat.duration && (
          <div className="flex items-center gap-1 text-label-sm text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
            {beat.duration}
          </div>
        )}
        <div className="mt-auto">
          <AudioPlayer audioUrl={beat.audioUrl} title={beat.title} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function BeatsPage() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [beatsEnabled, setBeatsEnabled] = useState(true);

  useEffect(() => {
    // Check if beats section is enabled
    contentAPI.getSection('general')
      .then((r) => {
        const enabled = r.data?.data?.beatsEnabled;
        // undefined means not set yet — treat as enabled
        setBeatsEnabled(enabled !== false);
      })
      .catch(() => setBeatsEnabled(true));

    // Fetch beats
    beatAPI.getAll()
      .then((r) => setBeats(r.data.beats || []))
      .catch(() => setBeats([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !beatsEnabled) {
    return (
      <section className="py-32 bg-surface">
        <div className="container-max text-center">
          <span className="material-symbols-outlined text-7xl text-primary/30 mb-4 block">music_note</span>
          <h2 className="text-headline-md font-bold text-on-surface mb-3">Beats — Coming Soon</h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
            We're preparing something special. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  const recent = beats.slice(0, 3);
  const all = beats;

  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-surface-container-lowest">
        <div className="container-max text-center">
          <span className="section-label">Listen</span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-4">
            Our Beats
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Experience the raw energy of the Chende through our recordings — the pulse of tradition, captured.
          </p>
        </div>
      </section>

      {/* Recent Beats */}
      {!loading && recent.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="container-max">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="section-label">Latest</span>
                <h2 className="text-headline-md font-bold text-on-surface">Recent Beats</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? [1, 2, 3].map((i) => <BeatCardSkeleton key={i} />)
                : recent.map((beat) => <BeatCard key={beat._id} beat={beat} />)}
            </div>
          </div>
        </section>
      )}

      {/* All Beats */}
      <section className="py-16 bg-surface-container-low">
        <div className="container-max">
          <div className="mb-8">
            <span className="section-label">Collection</span>
            <h2 className="text-headline-md font-bold text-on-surface">All Beats</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <BeatCardSkeleton key={i} />)}
            </div>
          ) : all.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-7xl mb-4 block">music_off</span>
              <p className="text-body-lg">No beats yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {all.map((beat) => <BeatCard key={beat._id} beat={beat} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
