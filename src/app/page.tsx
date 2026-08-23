'use client';

import React, { useState, useEffect, useRef } from 'react';
import IdentityForm, { EvaluatorIdentity } from '@/components/IdentityForm';
import RatingRubric from '@/components/RatingRubric';

const MOS_PA_OPTIONS = [
  { value: 5, label: 'Sangat Akurat (5.0)', desc: 'Pelafalan fonem /dh/, /th/, dan vokal (/è/, /ò/, /ì/, /ù/) sangat tepat seperti penutur asli Jawa. Artikulasi kata sangat jelas tanpa ada suku kata yang hilang atau terseret.' },
  { value: 4.5, label: '4.5' },
  { value: 4, label: 'Akurat (4.0)', desc: 'Pelafalan baik dan jelas, hanya ada sedikit bagian kecil yang kurang mantap namun hampir mendekati penutur asli.' },
  { value: 3.5, label: '3.5' },
  { value: 3, label: 'Cukup (3.0)', desc: 'Kata-kata masih dapat dipahami, tetapi pelafalan fonemnya masih agak kaku, atau artikulasinya mulai agak terseret/tidak konsisten.' },
  { value: 2.5, label: '2.5' },
  { value: 2, label: 'Buruk (2.0)', desc: 'Terdapat beberapa kesalahan pelafalan fonem yang fatal (misal: "bedhidhing" terdengar rata menjadi "bediding" biasa) atau ada kata yang terpotong akibat glitch.' },
  { value: 1.5, label: '1.5' },
  { value: 1, label: 'Sangat Buruk (1.0)', desc: 'Banyak fonem yang salah lafal secara fatal dan kata-kata saling bertumpukan sehingga isi kalimat sulit dipahami.' },
];

const MOS_N_OPTIONS = [
  { value: 5, label: 'Sangat Natural (5.0)', desc: 'Naik-turun nada sangat luwes, jeda antar-kata pas, memiliki "ruh/nyawa" cara bicara orang Jawa asli secara spontan.' },
  { value: 4.5, label: '4.5' },
  { value: 4, label: 'Natural (4.0)', desc: 'Intonasi mengalir dengan baik, penempatan jeda umumnya tepat, dan tidak terdengar dipaksakan.' },
  { value: 3.5, label: '3.5' },
  { value: 3, label: 'Cukup Natural (3.0)', desc: 'Intonasi agak datar seperti robot yang sedang membaca teks formal, atau ada riak (glitch) sintetis kecil pada cengkok nadanya.' },
  { value: 2.5, label: '2.5' },
  { value: 2, label: 'Kaku (2.0)', desc: 'Irama suara terdengar kaku, monoton, dan tidak wajar seperti pembacaan mesin pada mayoritas bagian kalimat.' },
  { value: 1.5, label: '1.5' },
  { value: 1, label: 'Sangat Kaku (1.0)', desc: 'Ritme sepenuhnya monoton tanpa ekspresi, atau iramanya melompat-lompat tidak beraturan secara ekstrem.' },
];

interface Sample {
  id: string;
  text: string;
  audioGt: string;
  audioLpep: string;
  audioFt: string;
  audioMms: string;
  audioOmnivoice: string;
  audioId: string;
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function QuestionnairePage() {
  const [identity, setIdentity] = useState<EvaluatorIdentity | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'intro' | 'mos' | 'done'>('intro');
  
  // States for MOS
  const [mosOrder, setMosOrder] = useState<{type: string, url: string}[]>([]);
  const [mosScores, setMosScores] = useState<Record<string, {mos_n: number|null, mos_pa: number|null, comment: string}>>({});
  const [currentMosSlide, setCurrentMosSlide] = useState(0);
  
  // Final comments
  const [finalComment, setFinalComment] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allResults, setAllResults] = useState<{
    mos: any[]
  }>({ mos: [] });

  useEffect(() => {
    fetch('/api/audio')
      .then(res => res.json())
      .then(data => {
        if (data.samples && data.samples.length > 0) {
          setSamples(data.samples);
        }
      })
      .catch(err => console.error('Failed to load samples', err));
  }, []);

  // Initialize random orders when sample changes
  useEffect(() => {
    if (samples.length > 0 && currentIndex < samples.length) {
      const current = samples[currentIndex];
      // Randomize MOS (6 audios)
      const options = [
        { type: 'GT', url: current.audioGt },
        { type: 'LPEP_PPIM', url: current.audioLpep },
        { type: 'FT', url: current.audioFt },
        { type: 'MMS', url: current.audioMms },
        { type: 'OMNIVOICE', url: current.audioOmnivoice },
        { type: 'ID', url: current.audioId }
      ];
      setMosOrder(shuffle(options));
      setMosScores({
        'GT': {mos_n: null, mos_pa: null, comment: ''},
        'LPEP_PPIM': {mos_n: null, mos_pa: null, comment: ''},
        'FT': {mos_n: null, mos_pa: null, comment: ''},
        'MMS': {mos_n: null, mos_pa: null, comment: ''},
        'OMNIVOICE': {mos_n: null, mos_pa: null, comment: ''},
        'ID': {mos_n: null, mos_pa: null, comment: ''},
      });
      setCurrentMosSlide(0);
    }
  }, [currentIndex, samples]);

  // Scroll to top on stage/index change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, stage]);


  const handleStart = () => {
    setStage('mos');
  };

  const handleMosNext = async () => {
    // Validate
    const isComplete = Object.values(mosScores).every(s => s.mos_n !== null && s.mos_pa !== null);
    if (!isComplete) {
      alert("Mohon lengkapi semua penilaian MOS.");
      return;
    }
    
    // Save
    const currentSample = samples[currentIndex];
    const newMos = Object.entries(mosScores).map(([type, scores]) => ({
      sampleId: currentSample.id,
      modelType: type,
      mos_n_score: scores.mos_n,
      mos_pa_score: scores.mos_pa,
      comment: scores.comment
    }));
    
    const updatedMosList = [...allResults.mos, ...newMos];
    setAllResults(prev => ({
      ...prev,
      mos: updatedMosList
    }));
    
    if (currentIndex < samples.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Auto-submit on the last sample
      setIsSubmitting(true);
      try {
        const payload = {
          identity: {
            ...identity,
            finalComment: ''
          },
          mos: updatedMosList
        };

        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Submission failed');
        setStage('done');
      } catch (e) {
        alert('Maaf, terjadi kesalahan saat menyimpan data. Pastikan koneksi internet Anda stabil lalu coba klik Selesai lagi.');
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!identity) {
    return <IdentityForm onSubmit={setIdentity} />;
  }

  if (samples.length === 0) {
    return (
      <div className="glass-panel" style={cardStyle}>
        <h2 style={titleStyle}>Tidak Ada Data Sampel</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Belum ada file audio di public/random_samples.</p>
      </div>
    );
  }

  if (stage === 'intro') {
    return (
      <div style={containerStyle}>
        <div className="glass-panel" style={{...cardStyle, textAlign: 'center'}}>
          <h2 style={titleStyle} className="text-gradient">Selamat Datang di Evaluasi Suara Jawa</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Kuesioner ini bertujuan untuk mengevaluasi kualitas <strong>pelafalan fonem</strong> dan <strong>keluwesan prosodi/intonasi</strong> Bahasa Jawa dari sampel audio yang telah kami sediakan.
          </p>

          <div style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>📌 Panduan Singkat:</h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.5' }}>
              <li>Sangat disarankan menggunakan <strong>Earphone atau Headphone</strong> serta <strong>mengkencangkan volume perangkat Anda</strong> jika suara kurang terdengar maksimal.</li>
              <li>Terdapat {samples.length} sampel kalimat. Pengujian setiap kalimat dibagi menjadi dua tahap: <strong>Tahap Pertama</strong> (penilaian individu) dan <strong>Tahap Kedua</strong> (perbandingan).</li>
            </ul>
          </div>

          <p style={{ color: 'var(--accent-primary)', fontWeight: 600, textAlign: 'center', marginBottom: '2rem' }}>
            Terima kasih banyak atas waktu dan partisipasi Anda!
          </p>

          <div style={actionContainerStyle}>
            <button onClick={handleStart} style={buttonStyle}>Mulai Evaluasi</button>
          </div>
        </div>
      </div>
    );
  }

  const currentSample = samples[currentIndex];

  if (stage === 'mos') {
    const isNextDisabled = !Object.values(mosScores).every(s => s.mos_n !== null && s.mos_pa !== null);
    
    return (
      <div style={containerStyle}>
        <div style={progressTextStyle}>Sampel {currentIndex + 1} dari {samples.length} - Bagian 1: Evaluasi Individu</div>
        
        <div className="glass-panel" style={cardStyle}>
          <h2 style={titleStyle} className="text-gradient">Evaluasi Audio</h2>



          {/* Explicit Reference (MUSHRA Standard) */}
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>Audio Acuan (Rekaman Asli)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Dengarkan audio di bawah ini sebagai standar kualitas tertinggi (Ground Truth) sebelum Anda menilai sampel lainnya.
            </p>
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              "{currentSample.text}"
            </p>
            <audio controls src={currentSample.audioGt} style={{width: '100%'}} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
              * Jika suara terdengar kurang jelas, mohon kencangkan volume perangkat (speaker/headphone) Anda.
            </p>
          </div>

          <div style={{marginBottom: '2rem', display: 'flex', justifyContent: 'center'}}>
            <span style={{background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
              Audio {currentMosSlide + 1} dari {mosOrder.length}
            </span>
          </div>

          {(() => {
            const opt = mosOrder[currentMosSlide];
            if (!opt) return null;
            const label = String.fromCharCode(65 + currentMosSlide); // A, B, C, D
            const currentScore = mosScores[opt.type];
            return (
              <div id="active-audio" key={opt.type} style={{marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '8px'}}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', textAlign: 'center', fontWeight: 700 }}>
                  Audio {label}
                </h3>
                <p style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Bandingkan Audio {label} ini dengan audio acuan di atas.
                </p>
                <audio controls src={opt.url} style={{width: '100%', marginBottom: '1rem'}} />
                
                <RatingRubric
                  title="1. Ketepatan Pengucapan & Ritme"
                  question="Apakah pelafalan terdengar akurat dan artikulasinya jelas?"
                  options={MOS_PA_OPTIONS}
                  selectedValue={currentScore.mos_pa}
                  onChange={(val) => setMosScores(prev => ({...prev, [opt.type]: {...prev[opt.type], mos_pa: val}}))}
                />

                <RatingRubric
                  title="2. Kealamian Intonasi & Kualitas Suara"
                  question="Apakah alunan nada, ritme, dan cengkok pada kalimat terdengar mengalir alami seperti manusia asli?"
                  options={MOS_N_OPTIONS}
                  selectedValue={currentScore.mos_n}
                  onChange={(val) => setMosScores(prev => ({...prev, [opt.type]: {...prev[opt.type], mos_n: val}}))}
                />

                <div style={{marginTop: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Komentar (Opsional):</label>
                  <input 
                    type="text" 
                    value={currentScore.comment}
                    onChange={(e) => setMosScores(prev => ({...prev, [opt.type]: {...prev[opt.type], comment: e.target.value}}))}
                    style={{width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white'}}
                    placeholder={`Komentar untuk Audio ${label}...`}
                  />
                </div>
              </div>
            );
          })()}

          <div style={{...actionContainerStyle, justifyContent: currentMosSlide > 0 ? 'space-between' : 'flex-end'}}>
            {currentMosSlide > 0 && (
              <button 
                onClick={() => {
                  setCurrentMosSlide(prev => prev - 1);
                  setTimeout(() => {
                    const el = document.getElementById('active-audio');
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 20;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 50);
                }} 
                style={{...buttonStyle, background: 'var(--surface)'}}
              >
                Kembali
              </button>
            )}
            
            {currentMosSlide < mosOrder.length - 1 ? (
              <button 
                onClick={() => {
                  setCurrentMosSlide(prev => prev + 1);
                  setTimeout(() => {
                    const el = document.getElementById('active-audio');
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 20;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 50);
                }} 
                style={{
                  ...buttonStyle, 
                  opacity: (mosScores[mosOrder[currentMosSlide]?.type]?.mos_pa === null || mosScores[mosOrder[currentMosSlide]?.type]?.mos_n === null) ? 0.5 : 1,
                  cursor: (mosScores[mosOrder[currentMosSlide]?.type]?.mos_pa === null || mosScores[mosOrder[currentMosSlide]?.type]?.mos_n === null) ? 'not-allowed' : 'pointer'
                }} 
                disabled={mosOrder[currentMosSlide] ? (mosScores[mosOrder[currentMosSlide].type].mos_pa === null || mosScores[mosOrder[currentMosSlide].type].mos_n === null) : true}
              >
                Selanjutnya (Ke Audio {String.fromCharCode(65 + currentMosSlide + 1)})
              </button>
            ) : (
              <button 
                onClick={handleMosNext} 
                style={{
                  ...buttonStyle, 
                  opacity: isNextDisabled ? 0.5 : 1,
                  cursor: isNextDisabled ? 'not-allowed' : 'pointer'
                }} 
                disabled={isNextDisabled || isSubmitting}
              >
                {isSubmitting ? 'Mengirim Data...' : (currentIndex < samples.length - 1 ? 'Sampel Selanjutnya' : 'Selesai & Kirim')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }



  if (stage === 'done') {
    return (
      <div style={containerStyle}>
        <div className="glass-panel" style={{...cardStyle, textAlign: 'center', padding: '3rem 2rem'}}>
          <div style={successIconStyle}>✓</div>
          <h2 style={titleStyle} className="text-gradient">Evaluasi Selesai!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Data Anda berhasil terkirim. Terima kasih banyak atas waktu dan partisipasi Anda dalam survei ini!</p>
        </div>
      </div>
    );
  }

  return null;
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
  cursor: 'pointer'
};

const successIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  color: 'var(--success)',
  marginBottom: '1rem',
};

const transcriptBoxStyle: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderLeft: '4px solid var(--accent-primary)',
  borderRadius: '0 8px 8px 0',
  marginBottom: '1.5rem',
  color: 'var(--text-primary)',
};
