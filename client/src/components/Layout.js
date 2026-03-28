import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/products',  label: 'Products',  icon: '▦' },
];

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>PIM System</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>WooCommerce Integration</div>
        </div>
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderRadius: 8, color: isActive ? 'var(--accent)' : 'var(--muted)',
              background: isActive ? 'rgba(79,127,255,0.08)' : 'transparent',
              fontWeight: isActive ? 500 : 400, transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Mock Mode Active</div>
          <div style={{ fontSize: 10, color: 'var(--border)', marginTop: 2 }}>Add WC keys to go live</div>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
