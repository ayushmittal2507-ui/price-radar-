import { Link } from 'react-router-dom';
import styles from './TrackCard.module.css';

export default function TrackCard({ track, onDelete, isDeleting }) {
  // Calculate price stats
  const history = track.history || [];
  const latestPrice = history.length > 0 ? history[history.length - 1].price : null;
  const prevPrice = history.length > 1 ? history[history.length - 2].price : null;

  // Trend calculation
  let trend = null;
  if (latestPrice !== null && prevPrice !== null) {
    const diff = latestPrice - prevPrice;
    if (diff < 0) {
      trend = {
        direction: 'down',
        symbol: '▼',
        label: `-₹${Math.abs(diff).toFixed(2)}`,
        className: styles.trendDown,
      };
    } else if (diff > 0) {
      trend = {
        direction: 'up',
        symbol: '▲',
        label: `+₹${diff.toFixed(2)}`,
        className: styles.trendUp,
      };
    } else {
      trend = {
        direction: 'same',
        symbol: '=',
        label: 'No change',
        className: styles.trendSame,
      };
    }
  }

  const isTargetHit = latestPrice !== null && latestPrice <= track.demandPrice;
  const isAllTimeLow = latestPrice !== null && track.lowestPriceEver !== null && latestPrice <= track.lowestPriceEver;

  return (
    <article className={`price-tag ${styles.card}`}>
      {/* Product Image or Source Fallback */}
      <div className={styles.imageWrap}>
        {track.image ? (
          <img
            src={track.image}
            alt={track.name}
            className={styles.image}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>{track.type === 'stock' ? '📈' : '🏷️'}</span>
          </div>
        )}

        {/* Status Badge */}
        {isTargetHit && (
          <div className={styles.targetHitBadge}>
            🎯 TARGET REACHED
          </div>
        )}
      </div>

      {/* Meta & Title */}
      <div className={styles.header}>
        <div className={styles.storePill}>
          {track.site?.name || 'External'} · {track.type}
        </div>
        <h3 className={styles.name} title={track.name}>
          <Link to={`/track/${track._id}`} className={styles.nameLink}>
            {track.name}
          </Link>
        </h3>
      </div>

      <div className="divider" style={{ margin: 'var(--space-2) 0' }} />

      {/* Pricing Details */}
      <div className={styles.pricingGrid}>
        <div className={styles.priceCol}>
          <span className={styles.priceLabel}>Current</span>
          <div className={styles.currentPriceRow}>
            <span className={`price-figure ${isTargetHit ? 'price-green' : styles.priceNormal} ${styles.currentPrice}`}>
              {latestPrice !== null ? `₹${latestPrice.toFixed(2)}` : 'Scanning…'}
            </span>
            {trend && (
              <span className={`${styles.trendPill} ${trend.className}`} title={`Compared to previous check: ${trend.label}`}>
                {trend.symbol} {trend.label}
              </span>
            )}
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Target</span>
            <span className="price-figure">₹{track.demandPrice.toFixed(2)}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>Lowest Ever</span>
            <span className={`price-figure ${isAllTimeLow ? 'price-green' : ''}`}>
              {track.lowestPriceEver !== null ? `₹${track.lowestPriceEver.toFixed(2)}` : '—'}
              {isAllTimeLow && ' ★'}
            </span>
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: 'var(--space-2) 0' }} />

      {/* Card Actions */}
      <div className={styles.actions}>
        <Link
          to={`/track/${track._id}`}
          className="btn btn-ghost"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', flex: 1 }}
        >
          View Chart
        </Link>
        <button
          type="button"
          onClick={() => onDelete(track._id, track.name)}
          disabled={isDeleting}
          className="btn btn-amber"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
          title="Remove from tracking"
        >
          {isDeleting ? '…' : 'Remove'}
        </button>
      </div>
    </article>
  );
}
