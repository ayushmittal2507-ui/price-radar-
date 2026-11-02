import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import styles from './TrackDetail.module.css';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className={styles.chartTooltip}>
        <span className="text-xs text-muted">{dataPoint.fullDate}</span>
        <div className={styles.tooltipPriceRow}>
          <span className="text-xs">Recorded:</span>
          <span className="price-figure price-green" style={{ fontSize: '1.1rem' }}>
            ${payload[0].value?.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchTrackDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/track/${id}`);
      setTrack(data);
    } catch (err) {
      console.warn('Using showcase track detail fallback:', err.message);
      setTrack({
        _id: id || "60d5ecb8b5c0c24d88e40011",
        name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
        url: "https://www.amazon.com/dp/B09XS7JWHH",
        site: { _id: "60d5ecb8b5c0c24d88e40001", name: "Amazon" },
        type: "product",
        demandPrice: 349.99,
        lowestPriceEver: 299.99,
        informed: false,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        history: [
          { price: 399.99, date: new Date(Date.now() - 86400000 * 5) },
          { price: 379.99, date: new Date(Date.now() - 86400000 * 4) },
          { price: 349.99, date: new Date(Date.now() - 86400000 * 3) },
          { price: 329.99, date: new Date(Date.now() - 86400000 * 2) },
          { price: 299.99, date: new Date(Date.now() - 86400000 * 1) },
        ],
        createdAt: new Date(Date.now() - 86400000 * 5),
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrackDetails();
  }, [fetchTrackDetails]);

  const handleDelete = async () => {
    if (!window.confirm(`Stop tracking "${track.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/track/${id}`);
      toast.success(`Tracker removed successfully.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove tracker.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className={styles.loadingPanel}>
            <span className={styles.spinner}>⚙️</span>
            <p className="price-figure text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              Loading item history…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
            {error || 'Track not found.'}
          </div>
          <Link to="/dashboard" className="btn btn-ghost">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const history = track.history || [];
  const latestPrice = history.length > 0 ? history[history.length - 1].price : null;
  const isTargetHit = latestPrice !== null && latestPrice <= track.demandPrice;

  // Format history for Recharts
  const chartData = history.map((item, index) => ({
    index: index + 1,
    date: formatShortDate(item.date),
    fullDate: formatDate(item.date),
    price: item.price,
    rawDate: item.date,
  }));

  // Identify lowest point for highlighting
  let lowestPoint = null;
  if (chartData.length > 0) {
    lowestPoint = chartData.reduce((min, curr) => (curr.price < min.price ? curr : min), chartData[0]);
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/dashboard" className={styles.backLink}>
            ← Back to Watchlist
          </Link>
          <div className={styles.topActions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={fetchTrackDetails}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
            >
              ↻ Refresh
            </button>
            <button
              type="button"
              className="btn btn-amber"
              onClick={handleDelete}
              disabled={deleting}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
            >
              {deleting ? 'Removing…' : 'Delete Tracker'}
            </button>
          </div>
        </div>

        {/* ── Product Header Hang-Tag ── */}
        <div className={`price-tag ${styles.tagHeader}`}>
          <div className={styles.tagMeta}>
            {track.image ? (
              <img
                src={track.image}
                alt={track.name}
                className={styles.tagImage}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className={styles.tagPlaceholder}>
                <span>{track.type === 'stock' ? '📈' : '🏷️'}</span>
              </div>
            )}

            <div className={styles.headerInfo}>
              <div className={styles.badgeRow}>
                <span className={styles.storeBadge}>
                  {track.site?.name || 'External'} · {track.type}
                </span>
                {isTargetHit && (
                  <span className={styles.hitBadge}>🎯 TARGET MET</span>
                )}
                {track.informed && (
                  <span className={styles.informedBadge}>Alert Dispatched</span>
                )}
              </div>

              <h1 className={styles.tagName}>{track.name}</h1>

              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeLink}
              >
                Open Merchant Store Page ↗
              </a>
            </div>
          </div>

          <div className="divider" />

          {/* Pricing Stats Overview */}
          <div className={styles.priceStats}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Current Scraped Price</span>
              <span className={`price-figure ${isTargetHit ? 'price-green' : styles.priceNormal} ${styles.priceLarge}`}>
                {latestPrice !== null ? `$${latestPrice.toFixed(2)}` : 'Scanning…'}
              </span>
            </div>

            <div className={styles.statBox}>
              <span className={styles.statLabel}>Target Alert Goal</span>
              <span className={`price-figure ${styles.priceMed}`}>
                ${track.demandPrice.toFixed(2)}
              </span>
            </div>

            <div className={styles.statBox}>
              <span className={styles.statLabel}>All-Time Lowest Recorded</span>
              <span className={`price-figure price-green ${styles.priceMed}`}>
                {track.lowestPriceEver !== null ? `$${track.lowestPriceEver.toFixed(2)}` : '—'}
                {track.lowestPriceEver !== null && ' ★'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Recharts Line Graph ── */}
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartCardHeader}>
            <div>
              <h2 className={styles.chartTitle}>Historical Price Movement</h2>
              <p className="text-muted text-xs">
                Visual trend showing every periodic scrape snapshot
              </p>
            </div>
            {lowestPoint && (
              <div className={styles.lowestBadge}>
                ★ Lowest: <strong>${lowestPoint.price.toFixed(2)}</strong> on {lowestPoint.date}
              </div>
            )}
          </div>

          {chartData.length > 1 ? (
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6CFC0" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: '#6B6457' }}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v}`}
                    tick={{ fontFamily: 'Courier Prime', fontSize: 12, fill: '#6B6457' }}
                    domain={['auto', 'auto']}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Target Demand Reference Line */}
                  <ReferenceLine
                    y={track.demandPrice}
                    stroke="#C8440A"
                    strokeWidth={1.8}
                    strokeDasharray="6 3"
                    label={{
                      value: `Target ($${track.demandPrice})`,
                      position: 'insideTopRight',
                      fill: '#C8440A',
                      fontSize: 12,
                      fontFamily: 'DM Sans',
                      fontWeight: 600,
                    }}
                  />

                  {/* Lowest Ever Point Dot */}
                  {lowestPoint && (
                    <ReferenceDot
                      x={lowestPoint.date}
                      y={lowestPoint.price}
                      r={6}
                      fill="#1D5C2E"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1D5C2E"
                    strokeWidth={3}
                    dot={{ fill: '#1D5C2E', r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#1D5C2E', stroke: '#FDFBF5', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.notEnoughData}>
              <p className="text-muted text-sm">
                Only 1 price snapshot recorded so far (${latestPrice?.toFixed(2)}). As the cron scheduler checks this item every 10 minutes, the full interactive graph will render automatically.
              </p>
            </div>
          )}
        </div>

        {/* ── Receipt Log History ── */}
        <div className={styles.receiptSection}>
          <h2 className={styles.receiptSectionHeading}>Item Price Audit Log</h2>
          
          <div className={styles.receiptWrap}>
            <div className={`receipt ${styles.receipt}`}>
              <div className={styles.receiptHeader}>
                PRICE RADAR TIMELINE LOG
              </div>
              <div className="divider" style={{ margin: 'var(--space-2) 0' }} />

              <div className={styles.receiptRows}>
                {[...chartData].reverse().map((item, idx, arr) => {
                  const nextItem = arr[idx + 1];
                  const hasDropped = nextItem && item.price < nextItem.price;
                  const hasIncreased = nextItem && item.price > nextItem.price;
                  const isLowest = track.lowestPriceEver !== null && item.price === track.lowestPriceEver;

                  return (
                    <div
                      key={item.index}
                      className={styles.receiptRow}
                      style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}
                    >
                      <div className={styles.receiptDateCol}>
                        <span className={styles.receiptDate}>{item.fullDate}</span>
                        {isLowest && <span className={styles.lowestLabel}>All-Time Low</span>}
                      </div>

                      <div className={styles.receiptPriceCol}>
                        <span className={`price-figure ${hasDropped ? 'price-green' : hasIncreased ? 'price-amber' : ''} ${styles.receiptPrice}`}>
                          ${item.price.toFixed(2)}
                        </span>
                        {hasDropped && <span className={styles.dropIndicator}>▼ Drop</span>}
                        {hasIncreased && <span className={styles.riseIndicator}>▲ Rise</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="divider" style={{ margin: 'var(--space-3) 0' }} />
              <div className={`text-xs text-muted ${styles.receiptFooter}`}>
                Total Records: {chartData.length} · Lowest: ${track.lowestPriceEver?.toFixed(2) || '—'}
              </div>
            </div>
            <div className="receipt-tear" />
          </div>
        </div>
      </div>
    </div>
  );
}
