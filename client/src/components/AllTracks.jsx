import { useState } from 'react';
import TrackCard from './TrackCard';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import styles from './AllTracks.module.css';

export default function AllTracks({ tracks, loading, error, onTrackDeleted, onAddNewClick }) {
  const toast = useToast();
  const [deletingId, setDeletingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to stop tracking "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/track/${id}`);
      toast.success(`Removed "${name}" from your watchlist.`);
      if (onTrackDeleted) {
        onTrackDeleted(id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete track.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Search Logic
  const filteredTracks = tracks.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = searchQuery.trim() === '' || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.site?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className={styles.container}>
      {/* Search & Filter Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <input
            type="text"
            className={`input ${styles.searchInput}`}
            placeholder="Search tracked items or stores…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterPills}>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterType === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({tracks.length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterType === 'product' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterType('product')}
          >
            Products ({tracks.filter((t) => t.type === 'product').length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterType === 'stock' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterType('stock')}
          >
            Stocks ({tracks.filter((t) => t.type === 'stock').length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingBox}>
          <span className={styles.spinnerIcon}>⚙️</span>
          <p className="price-figure text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            Retrieving ledger entries from server…
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-error" style={{ margin: 'var(--space-6) 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tracks.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏷️</div>
          <h3 className={styles.emptyHeading}>Your Watchlist is Empty</h3>
          <p className="text-muted text-sm" style={{ maxWidth: '420px', margin: '0 auto' }}>
            You haven't registered any price targets yet. Paste an Amazon, Flipkart, or Yahoo Finance link to start tracking.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddNewClick}
            style={{ marginTop: 'var(--space-4)' }}
          >
            + Create Your First Tracker
          </button>
        </div>
      )}

      {/* Filtered Out State */}
      {!loading && !error && tracks.length > 0 && filteredTracks.length === 0 && (
        <div className={styles.emptyState}>
          <p className="text-muted text-sm">No tracked items matched your filter or search query.</p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setFilterType('all'); setSearchQuery(''); }}
            style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Track Grid */}
      {!loading && filteredTracks.length > 0 && (
        <div className={styles.grid}>
          {filteredTracks.map((track) => (
            <TrackCard
              key={track._id}
              track={track}
              onDelete={handleDelete}
              isDeleting={deletingId === track._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
