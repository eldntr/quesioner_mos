'use client';

import React, { useRef, useState, useEffect } from 'react';

interface Props {
  src: string;
}

export default function AudioPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset state when src changes
    setIsPlaying(false);
    setProgress(0);
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((curr / total) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div style={playerContainerStyle} className="glass-panel">
      <button onClick={togglePlay} style={playButtonStyle}>
        {isPlaying ? (
          <span style={iconStyle}>⏸</span>
        ) : (
          <span style={iconStyle}>▶</span>
        )}
      </button>
      
      <div style={progressContainerStyle}>
        <div style={{ ...progressBarFillStyle, width: `${progress}%` }} />
      </div>

      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
}

const playerContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  gap: '1rem',
  width: '100%',
  borderRadius: 'var(--radius-lg)',
  marginBottom: '2rem',
};

const playButtonStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: 'var(--radius-full)',
  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const iconStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '1.2rem',
  marginLeft: '2px', // optical alignment for play button
};

const progressContainerStyle: React.CSSProperties = {
  flexGrow: 1,
  height: '6px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 'var(--radius-full)',
  overflow: 'hidden',
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
  transition: 'width 0.1s linear',
};
