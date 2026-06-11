import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'MOS Questionnaire - Javanese',
  description: 'Evaluasi MOS untuk Pelafalan dan Prosodi Bahasa Jawa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <nav style={navStyle} className="glass-panel">
          <div style={navContainerStyle}>
            <Link href="/" style={logoStyle}>
              <span className="text-gradient">MOS</span> Evaluator
            </Link>
            <div style={navLinksStyle}>
              <Link href="/" style={linkStyle}>Kuesioner</Link>
              <Link href="/admin" style={linkStyle}>Admin</Link>
            </div>
          </div>
        </nav>
        <main style={mainStyle}>
          {children}
        </main>
      </body>
    </html>
  );
}

const navStyle = {
  position: 'fixed' as const,
  top: '0',
  left: '0',
  width: '100%',
  zIndex: 100,
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderRadius: '0',
};

const navContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  letterSpacing: '-0.025em',
  color: 'var(--text-primary)',
};

const navLinksStyle = {
  display: 'flex',
  gap: '1.5rem',
};

const linkStyle = {
  fontWeight: 500,
  color: 'var(--text-secondary)',
};

const mainStyle = {
  paddingTop: '80px',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
};
