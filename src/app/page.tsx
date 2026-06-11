'use client';

import React, { useState, useEffect } from 'react';
import IdentityForm, { EvaluatorIdentity } from '@/components/IdentityForm';
import AudioPlayer from '@/components/AudioPlayer';
import RatingRubric from '@/components/RatingRubric';

const MOS_PA_OPTIONS = [
  { value: 5, label: 'Sangat Akurat', desc: 'Pelafalan /dh/, /th/, dan vokal miring sangat tepat seperti penutur asli Jawa (no accent leakage).' },
  { value: 4, label: 'Akurat', desc: 'Pelafalan baik, hampir mendekati penutur asli.' },
  { value: 3, label: 'Cukup', desc: 'Kata-kata dapat dipahami, tetapi pelafalan hurufnya masih agak kaku atau masih berlogat Indonesia standar.' },
  { value: 2, label: 'Buruk', desc: 'Terdapat beberapa kesalahan pelafalan fonem yang cukup mengganggu pemahaman.' },
  { value: 1, label: 'Sangat Buruk', desc: 'Banyak fonem yang salah lafal secara fatal (misal: "thuthuk" terdengar mati menjadi "tutuk" biasa).' },
];

const MOS_N_OPTIONS = [
  { value: 5, label: 'Sangat Natural', desc: 'Naik-turun nada sangat luwes, jeda antar-kata pas, memiliki "ruh" cara bicara orang Jawa asli.' },
  { value: 4, label: 'Natural', desc: 'Intonasi mengalir cukup baik, penempatan jeda umumnya tepat.' },
  { value: 3, label: 'Cukup Natural', desc: 'Intonasi agak datar seperti robot membaca teks formal, atau ada riak (glitch) kecil pada cengkoknya.' },
  { value: 2, label: 'Kaku', desc: 'Intonasi sering kali terdengar kaku dan tidak wajar pada banyak bagian.' },
  { value: 1, label: 'Sangat Kaku', desc: 'Ritme monoton, kaku, tanpa ekspresi, atau iramanya melompat tidak beraturan.' },
];

interface EvaluationResult {
  fileName: string;
  mos_pa: number;
  mos_n: number;
}

export default function QuestionnairePage() {
  const [identity, setIdentity] = useState<EvaluatorIdentity | null>(null);
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  
  const [currentMosPA, setCurrentMosPA] = useState<number | null>(null);
  const [currentMosN, setCurrentMosN] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetch('/api/audio')
      .then(res => res.json())
      .then(data => {
        if (data.files && data.files.length > 0) {
          setAudioFiles(data.files);
        }
      })
      .catch(err => console.error('Failed to load audio files', err));
  }, []);

  // Scroll to top whenever the sample changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  const handleNext = () => {
    if (currentMosPA === null || currentMosN === null) return;

    const currentFile = audioFiles[currentIndex];
    const newResults = [
      ...results,
      { fileName: currentFile, mos_pa: currentMosPA, mos_n: currentMosN }
    ];
    setResults(newResults);

    if (currentIndex < audioFiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentMosPA(null);
      setCurrentMosN(null);
    } else {
      submitAllResults(newResults);
    }
  };

  const submitAllResults = async (finalResults: EvaluationResult[]) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity,
          results: finalResults,
        })
      });
      setIsCompleted(true);
    } catch (err) {
      console.error('Submission failed', err);
      alert('Gagal mengirim data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!identity) {
    return <IdentityForm onSubmit={setIdentity} />;
  }

  if (audioFiles.length === 0) {
    return (
      <div className="glass-panel" style={cardStyle}>
        <h2 style={titleStyle}>Tidak Ada File Audio</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Belum ada file audio yang tersedia di folder public/audio.</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="glass-panel" style={{...cardStyle, textAlign: 'center'}}>
        <div style={successIconStyle}>✓</div>
        <h2 style={titleStyle} className="text-gradient">Evaluasi Selesai!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Terima kasih atas partisipasi Anda dalam evaluasi MOS ini.</p>
      </div>
    );
  }

  const isNextDisabled = currentMosPA === null || currentMosN === null || isSubmitting;

  return (
    <div style={containerStyle}>
      <div style={progressTextStyle}>
        Sampel {currentIndex + 1} dari {audioFiles.length}
      </div>
      
      <div className="glass-panel" style={cardStyle}>
        <h2 style={titleStyle} className="text-gradient">Evaluasi Audio</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          File: {audioFiles[currentIndex]}
        </p>

        <AudioPlayer src={`/audio/${audioFiles[currentIndex]}`} />

        <div style={dividerStyle} />

        <RatingRubric
          title="1. Akurasi Pelafalan"
          question="Apakah pelafalan huruf-huruf khas Jawa pada audio terdengar akurat?"
          options={MOS_PA_OPTIONS}
          selectedValue={currentMosPA}
          onChange={setCurrentMosPA}
        />

        <div style={dividerStyle} />

        <RatingRubric
          title="2. Keluwesan Intonasi (Prosodi)"
          question="Apakah alunan nada, ritme, dan cengkok pada kalimat terdengar mengalir alami?"
          options={MOS_N_OPTIONS}
          selectedValue={currentMosN}
          onChange={setCurrentMosN}
        />

        <div style={actionContainerStyle}>
          <button 
            onClick={handleNext} 
            disabled={isNextDisabled}
            style={{
              ...buttonStyle,
              opacity: isNextDisabled ? 0.5 : 1,
              cursor: isNextDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Mengirim...' : (currentIndex === audioFiles.length - 1 ? 'Selesai & Kirim' : 'Selanjutnya')}
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  width: '100%',
  padding: '0 1rem 4rem 1rem',
};

const cardStyle: React.CSSProperties = {
  padding: '2.5rem',
};

const progressTextStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: '0.9rem',
  fontWeight: 600,
  marginBottom: '1rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  marginBottom: '0.5rem',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: 'var(--border-glass)',
  margin: '2rem 0',
};

const actionContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '2rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '1rem 2.5rem',
  borderRadius: 'var(--radius-lg)',
  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
  color: 'white',
  fontWeight: 600,
  fontSize: '1rem',
  border: 'none',
  transition: 'all var(--transition-fast)',
  boxShadow: 'var(--shadow-md)',
};

const successIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  color: 'var(--success)',
  marginBottom: '1rem',
};
