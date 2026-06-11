'use client';

import React, { useState } from 'react';

export interface EvaluatorIdentity {
  name: string;
  age: string;
}

interface Props {
  onSubmit: (identity: EvaluatorIdentity) => void;
}

export default function IdentityForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age) {
      onSubmit({ name, age });
    }
  };

  return (
    <div className="glass-panel" style={containerStyle}>
      <h2 style={titleStyle} className="text-gradient">Data Evaluator</h2>
      <p style={subtitleStyle}>Silakan isi data diri Anda sebelum memulai evaluasi MOS.</p>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Nama / Inisial</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={inputStyle}
            placeholder="Masukkan nama Anda"
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Usia</label>
          <input 
            type="number" 
            value={age}
            onChange={e => setAge(e.target.value)}
            required
            min="10"
            max="100"
            style={inputStyle}
            placeholder="Contoh: 25"
          />
        </div>

        <button type="submit" style={buttonStyle}>Mulai Kuesioner</button>
      </form>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: '500px',
  width: '100%',
  padding: '2rem',
  margin: '2rem auto',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  marginBottom: '0.5rem',
  textAlign: 'center',
};

const subtitleStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  marginBottom: '2rem',
  textAlign: 'center',
  fontSize: '0.9rem',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  transition: 'border-color var(--transition-fast)',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.875rem',
  borderRadius: 'var(--radius-md)',
  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
  color: 'white',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  border: 'none',
  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
};
