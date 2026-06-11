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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', width: '100%', margin: '2rem auto' }}>
      
      {/* Pengumuman / Instruksi */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }} className="text-gradient">
          Selamat Datang di Evaluasi MOS
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Kuesioner ini bertujuan untuk mengevaluasi kualitas <strong>pelafalan fonem</strong> dan <strong>keluwesan prosodi/intonasi</strong> Bahasa Jawa dari sampel audio yang telah kami sediakan.
        </p>

        <div style={infoBoxStyle}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>📌 Panduan Penting:</h3>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.5' }}>
            <li><strong>Kencangkan Volume:</strong> Harap pastikan volume perangkat Anda cukup keras. Sangat disarankan untuk menggunakan <strong>Earphone atau Headphone</strong> agar detail suara terdengar jelas.</li>
            <li><strong>Format Kuesioner:</strong> Terdapat <strong>5 sampel audio</strong>. Setiap sampel memiliki <strong>2 pertanyaan</strong> (mengenai akurasi pelafalan dan keluwesan nada/intonasi).</li>
            <li><strong>Fokus:</strong> Dengarkan dengan saksama huruf-huruf khas Jawa (seperti /dh/, /th/) serta alunan cengkok dan ritme kalimatnya.</li>
          </ul>
        </div>

        <p style={{ marginTop: '1.5rem', color: 'var(--accent-primary)', fontWeight: 600, textAlign: 'center' }}>
          Terima kasih banyak atas waktu dan partisipasi Anda!
        </p>
      </div>

      {/* Form Identitas */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={titleStyle}>Data Evaluator</h2>
        <p style={subtitleStyle}>Silakan isi data diri Anda untuk melanjutkan.</p>
        
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
