'use client';

import React from 'react';

interface RubricOption {
  value: number;
  label: string;
  desc?: string;
}

interface Props {
  title: string;
  question: string;
  options: RubricOption[];
  selectedValue: number | null;
  onChange: (value: number) => void;
}

export default function RatingRubric({ title, question, options, selectedValue, onChange }: Props) {
  const selectedOption = options.find(o => o.value === selectedValue);
  
  // Sort options just in case
  const sortedOptions = [...options].sort((a, b) => a.value - b.value);
  const minVal = sortedOptions[0]?.value || 1;
  const maxVal = sortedOptions[sortedOptions.length - 1]?.value || 5;

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle} className="text-gradient">{title}</h3>
      <p style={questionStyle}>{question}</p>
      
      <div style={sliderContainerStyle}>
        <div style={{ position: 'relative', width: '100%', padding: '0.5rem 0' }}>
          <input 
            type="range" 
            min={minVal} 
            max={maxVal} 
            step={0.5}
            value={selectedValue === null ? minVal : selectedValue}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            onClick={(e) => onChange(parseFloat(e.currentTarget.value))}
            onTouchEnd={(e) => onChange(parseFloat(e.currentTarget.value))}
            style={rangeInputStyle}
            className={`custom-slider ${selectedValue === null ? 'thumb-hidden' : ''}`}
          />
          <div style={ticksContainerStyle}>
            {[1, 2, 3, 4, 5].map(tick => (
              <span key={tick} style={tickStyle}>{tick}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={descBoxStyle}>
        {selectedOption ? (
          <>
            <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '0.25rem' }}>
              {selectedOption.label}
            </strong>
            {selectedOption.desc ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                {selectedOption.desc}
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                (Nilai pertengahan)
              </p>
            )}
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Klik pada area garis slider (rentang) di atas untuk memberikan nilai 1.0 hingga 5.0...
          </span>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          transition: background 0.2s;
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent-primary);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          transition: transform 0.1s;
        }
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .custom-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent-primary);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          border: none;
        }
        .custom-slider.thumb-hidden::-webkit-slider-thumb {
          background: transparent !important;
          box-shadow: none !important;
        }
        .custom-slider.thumb-hidden::-moz-range-thumb {
          background: transparent !important;
          box-shadow: none !important;
        }
      `}} />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  marginBottom: '2.5rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  marginBottom: '0.5rem',
};

const questionStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
  marginBottom: '1.25rem',
  fontWeight: 500,
};

const sliderContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  marginBottom: '1rem',
  padding: '0 1rem',
};

const sliderValueDisplay: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--accent-primary)',
  minWidth: '3rem',
  textAlign: 'center',
};

const rangeInputStyle: React.CSSProperties = {
  width: '100%',
  margin: '0',
  cursor: 'pointer',
};

const ticksContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 10px',
  marginTop: '0.5rem',
};

const tickStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: '0.8rem',
  fontWeight: 600,
};

const descBoxStyle: React.CSSProperties = {
  padding: '1rem',
  minHeight: '80px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.02)'
};
