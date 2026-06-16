'use client';

import React, { useState } from 'react';

export interface EvaluatorIdentity {
  name: string;
  age: number;
  gender: string;
  javaneseFluency: string;
  region: string;
}

interface Props {
  onSubmit: (identity: EvaluatorIdentity) => void;
}

export default function IdentityForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [javaneseFluency, setJavaneseFluency] = useState('');
  const [region, setRegion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && gender && javaneseFluency && region) {
      onSubmit({ name, age: parseInt(age, 10), gender, javaneseFluency, region });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', width: '100%', margin: '2rem auto' }}>
      
      {/* Form Identitas */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={titleStyle}>Data Evaluator</h2>
        <p style={subtitleStyle}>Silakan isi data demografi Anda untuk melanjutkan.</p>
        
        <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Nama / Inisial</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={inputStyle}
            placeholder="Masukkan nama atau inisial"
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

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Jenis Kelamin</label>
          <select required value={gender} onChange={e => setGender(e.target.value)} style={inputStyle}>
            <option value="" disabled>Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Tingkat Kefasihan Bahasa Jawa</label>
          <select required value={javaneseFluency} onChange={e => setJavaneseFluency(e.target.value)} style={inputStyle}>
            <option value="" disabled>Pilih Kefasihan</option>
            <option value="Sangat Fasih (Native)">Sangat Fasih (Native / Bahasa Ibu)</option>
            <option value="Fasih">Fasih (Sering menggunakan sehari-hari)</option>
            <option value="Cukup Fasih">Cukup Fasih (Paham tapi jarang berbicara)</option>
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Asal Daerah di Jawa</label>
          <input 
            type="text" 
            value={region}
            onChange={e => setRegion(e.target.value)}
            required
            style={inputStyle}
            placeholder="Contoh: Solo, Semarang, Surabaya..."
          />
        </div>

        <button type="submit" style={buttonStyle}>Lanjut ke Kuesioner</button>
      </form>
      </div>
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
  fontSize: '1.5rem',
  marginBottom: '0.5rem',
  textAlign: 'center',
};

const subtitleStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  marginBottom: '2rem',
  textAlign: 'center',
  fontSize: '0.9rem',
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  borderRadius: 'var(--radius-md)',
  padding: '1.25rem',
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
