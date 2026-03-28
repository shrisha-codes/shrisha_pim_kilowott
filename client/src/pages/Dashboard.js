import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productApi, syncApi } from '../services/api';

const StatCard = ({ label, value, color, sub }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    <div style={{ color: 'var(--text)', fontWeight: 500, marginTop: 8, fontSize: 14 }}>{label}</div>
    {sub && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [stats,   setStats]   = useState({ total: 0, published: 0, draft: 0, outofstock: 0, unsynced: 0 });
  const [syncing, setSyncing] = useState(false);
  const [log,     setLog]     = useState([]);
  const navigate = useNavigate();

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [{ msg, type, time }, ...prev].slice(0, 8));
  };

  const loadStats = useCallback(async () => {
    try {
      const [all, published, draft, oos] = await Promise.all([
        productApi.getAll({ limit: 1 }),
        productApi.getAll({ limit: 1, status: 'published' }),
        productApi.getAll({ limit: 1, status: 'draft' }),
        productApi.getAll({ limit: 1, stockStatus: 'outofstock' }),
      ]);
      setStats({
        total:      all.total,
        published:  published.total,
        draft:      draft.total,
        outofstock: oos.total,
      });
    } catch {}
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handlePull = async () => {
    setSyncing(true);
    addLog('Pulling products from WooCommerce...', 'info');
    try {
      const res = await syncApi.pull();
      const { created, failed } = res.results;
      addLog(`Pull complete — ${created} products imported${failed ? `, ${failed} failed` : ''}`, 'success');
      toast.success(`Pulled ${created} products`);
      loadStats();
    } catch (e) {
      addLog(`Pull failed: ${e.message}`, 'error');
      toast.error(e.message);
    } finally { setSyncing(false); }
  };

  const handlePushAll = async () => {
    setSyncing(true);
    addLog('Pushing unsynced products to WooCommerce...', 'info');
    try {
      const res = await syncApi.pushAll();
      const { success, failed } = res.results;
      addLog(`Push complete — ${success} synced${failed ? `, ${failed} failed` : ''}`, 'success');
      toast.success(`Pushed ${success} products`);
      loadStats();
    } catch (e) {
      addLog(`Push failed: ${e.message}`, 'error');
      toast.error(e.message);
    } finally { setSyncing(false); }
  };

  const logColor = { info: 'var(--muted)', success: 'var(--accent2)', error: 'var(--danger)' };
  const logDot   = { info: '○', success: '●', error: '●' };

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>Dashboard</div>
          <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: 13 }}>PIM · WooCommerce Integration</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={handlePull} disabled={syncing}>
            {syncing ? '...' : '↓ Pull from WooCommerce'}
          </button>
          <button className="btn-success" onClick={handlePushAll} disabled={syncing}>
            {syncing ? '...' : '↑ Push Unsynced'}
          </button>
          <button className="btn-primary" onClick={() => navigate('/products/new')}>
            + New Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Products"  value={stats.total}      color="var(--accent)"  sub="in catalog" />
        <StatCard label="Published"       value={stats.published}  color="var(--accent2)" sub="live on store" />
        <StatCard label="Drafts"          value={stats.draft}      color="var(--warning)" sub="not published" />
        <StatCard label="Out of Stock"    value={stats.outofstock} color="var(--danger)"  sub="need restocking" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Quick Actions */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '+ Add new product',          action: () => navigate('/products/new'),  color: 'var(--accent)' },
              { label: '▦ View all products',        action: () => navigate('/products'),      color: 'var(--text)' },
              { label: '↓ Pull from WooCommerce',    action: handlePull,                       color: 'var(--accent2)' },
              { label: '↑ Push all unsynced',        action: handlePushAll,                    color: 'var(--accent2)' },
            ].map(({ label, action, color }) => (
              <button key={label} className="btn-ghost" onClick={action} disabled={syncing}
                style={{ textAlign: 'left', padding: '10px 14px', color, justifyContent: 'flex-start' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Sync Activity</div>
          {log.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              No activity yet — try pulling from WooCommerce
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {log.map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: logColor[entry.type], fontSize: 10, marginTop: 3, flexShrink: 0 }}>{logDot[entry.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: logColor[entry.type] }}>{entry.msg}</div>
                    <div style={{ fontSize: 11, color: 'var(--border)', marginTop: 1 }}>{entry.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state hint */}
      {stats.total === 0 && (
        <div style={{ marginTop: 24, background: 'rgba(79,127,255,0.06)', border: '1px solid rgba(79,127,255,0.2)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 28 }}>💡</div>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Get started</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Click <strong style={{ color: 'var(--text)' }}>Pull from WooCommerce</strong> to import mock products, or add one manually.</div>
          </div>
        </div>
      )}
    </div>
  );
}
