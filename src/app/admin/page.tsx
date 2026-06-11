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

    // Flatten data for CSV
    const rows: any[] = [];
    scores.forEach(entry => {
      const { name, age } = entry.identity;
      entry.results.forEach((res: any) => {
        rows.push({
          Timestamp: entry.timestamp,
          Name: name,
          Age: age,
          AudioFile: res.fileName,
          MOS_PA: res.mos_pa,
          MOS_N: res.mos_n
        });
      });
    });

    const headers = ['Timestamp', 'Name', 'Age', 'AudioFile', 'MOS_PA', 'MOS_N'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${r[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mos_scores.csv');
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

  return (
    <div className="glass-panel" style={dashboardStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle} className="text-gradient">Data Evaluasi MOS</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadCSV} style={buttonStyle}>
            Unduh CSV
          </button>
          <button onClick={() => setIsResetModalOpen(true)} style={resetButtonStyle}>
            Reset Data
          </button>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {scores.map((score, idx) => (
                <tr key={idx} style={trStyle}>
                  <td style={tdStyle}>{new Date(score.timestamp).toLocaleString('id-ID')}</td>
                  <td style={tdStyle}>{score.identity.name}</td>
                  <td style={tdStyle}>{score.identity.age}</td>
                  <td style={tdStyle}>{score.results.length} file</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const loginContainerStyle: React.CSSProperties = {
  maxWidth: '400px',
  width: '100%',
  padding: '2rem',
  margin: '4rem auto',
};

const dashboardStyle: React.CSSProperties = {
  maxWidth: '1000px',
  width: '100%',
  padding: '2rem',
  margin: '2rem auto',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  margin: 0,
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  borderRadius: 'var(--radius-md)',
  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
  color: 'white',
  fontWeight: 600,
  fontSize: '1rem',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity var(--transition-fast)',
};

const errorStyle: React.CSSProperties = {
  color: 'var(--error)',
  fontSize: '0.875rem',
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: 'auto',
  border: '1px solid var(--border-glass)',
  borderRadius: 'var(--radius-md)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const thStyle: React.CSSProperties = {
  padding: '1rem',
  borderBottom: '1px solid var(--border-glass)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
};

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  borderBottom: '1px solid var(--border-glass)',
  color: 'var(--text-primary)',
};

const trStyle: React.CSSProperties = {
  transition: 'background-color var(--transition-fast)',
};

const resetButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: 'rgba(239, 68, 68, 0.1)',
  color: 'var(--error)',
  border: '1px solid var(--error)',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  padding: '2rem',
  maxWidth: '400px',
  width: '90%',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  borderRadius: 'var(--radius-md)',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'var(--text-primary)',
  border: 'none',
  cursor: 'pointer',
};

const confirmResetButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: 'var(--error)',
};
