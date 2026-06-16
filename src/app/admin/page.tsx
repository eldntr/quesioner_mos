'use client';

import React, { useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scores, setScores] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/scores?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const data = await res.json();
        setScores(data.scores || []);
        setIsAuthenticated(true);
      } else {
        setError('Password salah atau konfigurasi server belum diset (ADMIN_PASSWORD).');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (scores.length === 0) return;

    const rows: any[] = [];
    scores.forEach(entry => {
      const { name, age, region, javaneseFluency } = entry.identity;
      
      if (entry.mosResults) {
        entry.mosResults.forEach((res: any) => {
          rows.push({
            Timestamp: entry.timestamp,
            Name: name,
            Age: age,
            Region: region,
            Fluency: javaneseFluency,
            Type: 'MOS',
            SampleId: res.sampleId,
            Model: res.modelType,
            Score_PA: res.mos_pa,
            Score_N: res.mos_n,
            Score_CMOS: '',
            Comment: res.comment || ''
          });
        });
      }
      
      if (entry.cmosResults) {
        entry.cmosResults.forEach((res: any) => {
          rows.push({
            Timestamp: entry.timestamp,
            Name: name,
            Age: age,
            Region: region,
            Fluency: javaneseFluency,
            Type: 'CMOS',
            SampleId: res.sampleId,
            Model: '',
            Score_PA: '',
            Score_N: '',
            Score_CMOS: res.score,
            Comment: res.comment || ''
          });
        });
      }
    });

    const headers = ['Timestamp', 'Name', 'Age', 'Region', 'Fluency', 'Type', 'SampleId', 'Model', 'Score_PA', 'Score_N', 'Score_CMOS', 'Comment'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'evaluasi_audio.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`/api/scores?password=${encodeURIComponent(password)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setScores([]);
        setIsResetModalOpen(false);
      } else {
        alert('Gagal mereset data. Unauthorized.');
      }
    } catch (err) {
      alert('Terjadi kesalahan pada server saat mereset.');
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="glass-panel" style={loginContainerStyle}>
        <h2 style={titleStyle} className="text-gradient">Admin Panel</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Masukkan password admin untuk melihat dan mengunduh data.
        </p>
        <form onSubmit={handleLogin} style={formStyle}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button type="submit" disabled={isLoading} style={buttonStyle}>
            {isLoading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </div>
    );
  }

  const allMosResults = scores.flatMap(s => s.mosResults || []);
  const allCmosResults = scores.flatMap(s => s.cmosResults || []);

  const overallAvgPA = allMosResults.length 
    ? (allMosResults.reduce((sum, r) => sum + r.mos_pa, 0) / allMosResults.length).toFixed(2) 
    : '0.00';
  const overallAvgN = allMosResults.length 
    ? (allMosResults.reduce((sum, r) => sum + r.mos_n, 0) / allMosResults.length).toFixed(2) 
    : '0.00';
  const overallAvgCMOS = allCmosResults.length
    ? (allCmosResults.reduce((sum, r) => sum + r.score, 0) / allCmosResults.length).toFixed(2)
    : '0.00';

  const models = ['GT', 'FT', 'LPEP', 'OMNI'];
  const averagesPerModel = models.map(model => {
    const modelResults = allMosResults.filter(r => r.modelType === model);
    const avgPA = modelResults.length 
      ? (modelResults.reduce((sum, r) => sum + r.mos_pa, 0) / modelResults.length).toFixed(2) 
      : '0.00';
    const avgN = modelResults.length 
      ? (modelResults.reduce((sum, r) => sum + r.mos_n, 0) / modelResults.length).toFixed(2) 
      : '0.00';
    return { model, avgPA, avgN };
  });


  return (
    <div className="glass-panel" style={dashboardStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle} className="text-gradient">Data Evaluasi MOS</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadCSV} style={buttonStyle}>Unduh CSV</button>
          <button onClick={() => setIsResetModalOpen(true)} style={resetButtonStyle}>Reset Data</button>
        </div>
      </div>

      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Rata-rata Keseluruhan MOS-PA</h3>
          <p style={statValueStyle} className="text-gradient">{overallAvgPA}</p>
        </div>
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Rata-rata Keseluruhan MOS-N</h3>
          <p style={statValueStyle} className="text-gradient">{overallAvgN}</p>
        </div>
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Rata-rata Keseluruhan CMOS</h3>
          <p style={statValueStyle} className="text-gradient">{parseFloat(overallAvgCMOS) > 0 ? `+${overallAvgCMOS}` : overallAvgCMOS}</p>
        </div>
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Total Responden</h3>
          <p style={statValueStyle}>{scores.length}</p>
        </div>
      </div>

      <h3 style={{marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem'}}>Rata-rata per Model</h3>
      <div style={statsContainerStyle}>
        {averagesPerModel.map(stats => {
          const modelNames: Record<string, string> = {
            'GT': 'Ground Truth',
            'FT': 'Finetuning',
            'LPEP': 'LPEP PPIM',
            'OMNI': 'Omnivoice'
          };
          return (
            <div key={stats.model} style={{...statCardStyle, background: 'rgba(255,255,255,0.03)'}}>
              <h4 style={{fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700}}>
                {modelNames[stats.model]}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <div style={{textAlign: 'center'}}>
                  <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>MOS-PA</span>
                  <p style={{...statValueStyle, fontSize: '1.75rem', marginTop: '0.5rem'}}>{stats.avgPA}</p>
                </div>
                <div style={{ width: '1px', height: '3rem', background: 'var(--border-glass)' }}></div>
                <div style={{textAlign: 'center'}}>
                  <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>MOS-N</span>
                  <p style={{...statValueStyle, fontSize: '1.75rem', marginTop: '0.5rem'}}>{stats.avgN}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {isResetModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={modalContentStyle}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--error)' }}>Konfirmasi Reset</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Apakah Anda yakin ingin menghapus semua data evaluasi? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsResetModalOpen(false)} style={cancelButtonStyle}>Batal</button>
              <button onClick={handleReset} disabled={isResetting} style={confirmResetButtonStyle}>
                {isResetting ? 'Menghapus...' : 'Ya, Hapus Semua'}
              </button>
            </div>
          </div>
        </div>
      )}

      {scores.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Belum ada data evaluasi yang masuk.</p>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Waktu</th>
                <th style={thStyle}>Nama</th>
                <th style={thStyle}>Usia</th>
                <th style={thStyle}>Total Sampel</th>
                <th style={thStyle}>Rata-rata MOS-PA</th>
                <th style={thStyle}>Rata-rata MOS-N</th>
                <th style={thStyle}>Rata-rata CMOS</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, idx) => {
                const resCount = score.mosResults?.length || 0;
                const cmosCount = score.cmosResults?.length || 0;
                const totalSampel = resCount + cmosCount;
                const avgPA = resCount 
                  ? (score.mosResults.reduce((sum: number, r: any) => sum + r.mos_pa, 0) / resCount).toFixed(2) 
                  : '0.00';
                const avgN = resCount 
                  ? (score.mosResults.reduce((sum: number, r: any) => sum + r.mos_n, 0) / resCount).toFixed(2) 
                  : '0.00';
                const avgCMOS = cmosCount
                  ? (score.cmosResults.reduce((sum: number, r: any) => sum + r.score, 0) / cmosCount).toFixed(2)
                  : '-';

                return (
                  <tr key={idx} style={trStyle}>
                    <td style={tdStyle}>{new Date(score.timestamp).toLocaleString('id-ID')}</td>
                    <td style={tdStyle}>{score.identity?.name || '-'}</td>
                    <td style={tdStyle}>{score.identity?.age || '-'}</td>
                    <td style={tdStyle}>{totalSampel} file</td>
                    <td style={tdStyle}>
                      <span style={scoreBadgeStyle(parseFloat(avgPA))}>{avgPA}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={scoreBadgeStyle(parseFloat(avgN))}>{avgN}</span>
                    </td>
                    <td style={tdStyle}>
                      {avgCMOS !== '-' ? <span style={scoreBadgeStyle(avgCMOS === '0.00' ? 3 : parseFloat(avgCMOS) > 0 ? 5 : 1)}>{parseFloat(avgCMOS) > 0 ? `+${avgCMOS}` : avgCMOS}</span> : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const loginContainerStyle: React.CSSProperties = { maxWidth: '400px', width: '100%', padding: '2rem', margin: '4rem auto' };
const dashboardStyle: React.CSSProperties = { maxWidth: '1200px', width: '100%', padding: '2rem', margin: '2rem auto' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' };
const titleStyle: React.CSSProperties = { fontSize: '1.75rem', margin: 0 };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const inputStyle: React.CSSProperties = { padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: '1rem' };
const buttonStyle: React.CSSProperties = { padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer', transition: 'opacity var(--transition-fast)' };
const errorStyle: React.CSSProperties = { color: 'var(--error)', fontSize: '0.875rem' };
const tableWrapperStyle: React.CSSProperties = { overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle: React.CSSProperties = { padding: '1rem', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.02)' };
const tdStyle: React.CSSProperties = { padding: '1rem', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-primary)' };
const trStyle: React.CSSProperties = { transition: 'background-color var(--transition-fast)' };
const resetButtonStyle: React.CSSProperties = { ...buttonStyle, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid var(--error)' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { padding: '2rem', maxWidth: '400px', width: '90%' };
const cancelButtonStyle: React.CSSProperties = { padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' };
const confirmResetButtonStyle: React.CSSProperties = { ...buttonStyle, background: 'var(--error)' };
const statsContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const statCardStyle: React.CSSProperties = { padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
const statTitleStyle: React.CSSProperties = { fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500, textAlign: 'center' };
const statValueStyle: React.CSSProperties = { fontSize: '2rem', fontWeight: 700, margin: 0 };

const scoreBadgeStyle = (score: number): React.CSSProperties => {
  let color = 'var(--text-primary)';
  let bg = 'transparent';
  if (score >= 4) { color = '#10B981'; bg = 'rgba(16, 185, 129, 0.1)'; }
  else if (score >= 3) { color = '#F59E0B'; bg = 'rgba(245, 158, 11, 0.1)'; }
  else if (score > 0) { color = '#EF4444'; bg = 'rgba(239, 68, 68, 0.1)'; }

  return { display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: bg, color, fontWeight: 600, fontSize: '0.875rem', border: `1px solid ${color}40` };
};
