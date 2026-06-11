'use client';

import React from 'react';

interface RubricOption {
  value: number;
  label: string;
  desc: string;
}

interface Props {
  title: string;
  question: string;
  options: RubricOption[];
  selectedValue: number | null;
  onChange: (value: number) => void;
}

export default function RatingRubric({ title, question, options, selectedValue, onChange }: Props) {
  return (
    <div style={containerStyle}>
      <h3 style={titleStyle} className="text-gradient">{title}</h3>
      <p style={questionStyle}>{question}</p>
      
      <div style={optionsContainerStyle}>
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                ...optionButtonStyle,
                ...(isSelected ? optionSelectedStyle : {}),
              }}
              className="glass-panel"
            >
              <div style={scoreBadgeStyle(isSelected)}>{opt.value}</div>
              <div style={textContainerStyle}>
                <div style={{...labelStyle, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'}}>
                  {opt.label}
                </div>
                <div style={descStyle}>{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
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
  marginBottom: '1rem',
  fontWeight: 500,
};

const optionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const optionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  gap: '1.25rem',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all var(--transition-fast)',
};

const optionSelectedStyle: React.CSSProperties = {
  background: 'rgba(99, 102, 241, 0.15)',
  borderColor: 'var(--accent-primary)',
  boxShadow: '0 0 0 1px var(--accent-primary)',
};

const scoreBadgeStyle = (isSelected: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: 'var(--radius-full)',
  background: isSelected 
    ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' 
    : 'rgba(255, 255, 255, 0.1)',
  color: isSelected ? '#fff' : 'var(--text-secondary)',
  fontWeight: 700,
  flexShrink: 0,
});

const textContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '1rem',
};

const descStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  lineHeight: 1.4,
};
