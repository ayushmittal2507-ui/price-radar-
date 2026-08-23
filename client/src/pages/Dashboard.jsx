import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AllTracks from '../components/AllTracks';
import AddTracker from '../components/AddTracker';
import api from '../api/axios';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/track');
      setTracks(data);
    } catch (err) {
      console.error('Error loading tracks:', err);
      setError('Unable to retrieve watchlist from server. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handleTrackerAdded = (newTrack) => {
    setTracks((prev) => [newTrack, ...prev]);
    setShowAddPanel(false);
  };

  const handleTrackDeleted = (deletedId) => {
    setTracks((prev) => prev.filter((t) => t._id !== deletedId));
  };

  // Stats
  const totalCount = tracks.length;
  const targetMetCount = tracks.filter((t) => {
    const latest = t.history?.length ? t.history[t.history.length - 1].price : null;
    return latest !== null && latest <= t.demandPrice;
  }).length;
  const activeAlerts = tracks.filter((t) => !t.informed).length;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Top Header Row */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <p className="text-xs text-muted" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              PRICE MONITORING CONTROL PANEL
            </p>
            <h1 className={styles.pageTitle}>Dashboard & Watchlist</h1>
            <p className="text-muted text-sm">
              Signed in as <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={showAddPanel ? 'btn btn-amber' : 'btn btn-primary'}
              onClick={() => setShowAddPanel((prev) => !prev)}
            >
              {showAddPanel ? '✕ Close Form' : '+ Add New Tracker'}
            </button>
          </div>
        </div>

        {/* Quick Ledger Stats Strip */}
        <div className={styles.statsStrip}>
          <div className={`card ${styles.statCard}`}>
            <span className={styles.statLabel}>Total Monitored</span>
            <span className={`price-figure ${styles.statVal}`}>{totalCount}</span>
            <span className="text-xs text-muted">Active items & stocks</span>
          </div>

          <div className={`card ${styles.statCard}`}>
            <span className={styles.statLabel}>Targets Met</span>
            <span className={`price-figure price-green ${styles.statVal}`}>{targetMetCount}</span>
            <span className="text-xs text-muted">Price ≤ demand goal</span>
          </div>

          <div className={`card ${styles.statCard}`}>
            <span className={styles.statLabel}>Pending Checks</span>
            <span className={`price-figure price-amber ${styles.statVal}`}>{activeAlerts}</span>
            <span className="text-xs text-muted">Scheduled for next cron</span>
          </div>
        </div>

        {/* Expandable Add Tracker Section */}
        {showAddPanel && (
          <div className={styles.addSection}>
            <AddTracker
              onTrackerAdded={handleTrackerAdded}
              onCancel={() => setShowAddPanel(false)}
            />
          </div>
        )}

        {/* Main Watchlist Grid Component */}
        <div className={styles.watchlistSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Tracked Entries</h2>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={fetchTracks}
              disabled={loading}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              title="Refresh watchlist data from server"
            >
              {loading ? 'Refreshing…' : '↻ Refresh Ledger'}
            </button>
          </div>

          <AllTracks
            tracks={tracks}
            loading={loading}
            error={error}
            onTrackDeleted={handleTrackDeleted}
            onAddNewClick={() => setShowAddPanel(true)}
          />
        </div>
      </div>
    </div>
  );
}
