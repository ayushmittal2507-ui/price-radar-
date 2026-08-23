import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

const FEATURES = [
  {
    icon: '📡',
    title: 'Live Price Scraping',
    body: 'Our bot checks your tracked URLs every 10 minutes across Amazon, Flipkart and more.',
  },
  {
    icon: '🎯',
    title: 'Set Your Target',
    body: 'Tell us your price. We watch. When the number drops, you hear about it instantly.',
  },
  {
    icon: '📬',
    title: 'Email + Telegram Alerts',
    body: 'Get notified the moment a price hits your target — in your inbox and on your phone.',
  },
  {
    icon: '📈',
    title: 'Full Price History',
    body: 'See every price this item has ever been. Know when you\'re looking at a real deal.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={`text-sm ${styles.eyebrow}`}>Price Intelligence for Smart Shoppers</p>
          <h1 className={`display-heading ${styles.headline}`}>
            Never overpay<br />for anything, again.
          </h1>
          <p className={styles.subheadline}>
            PriceRadar tracks products across the web, logs every price change,
            and alerts you the moment your target is hit.
          </p>
          <div className={styles.heroCtas}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">Start Tracking Free</Link>
                <Link to="/login"  className="btn btn-ghost">Log in</Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative receipt stub */}
        <div className={styles.heroReceipt} aria-hidden="true">
          <div className={styles.receiptStub}>
            <div className={styles.receiptHeader}>PRICE CHECK</div>
            <div className={styles.divider} />
            <div className={styles.receiptRow}>
              <span>Sony WH-1000XM5</span>
            </div>
            <div className={styles.receiptRow}>
              <span className="text-muted text-sm">Was</span>
              <span className={`price-figure ${styles.priceCrossed}`}>₹349.00</span>
            </div>
            <div className={styles.receiptRow}>
              <span className="text-muted text-sm">Now</span>
              <span className={`price-figure price-green ${styles.priceBig}`}>₹249.99</span>
            </div>
            <div className={styles.divider} />
            <div className={`text-xs text-muted ${styles.receiptFooter}`}>
              ★ NEW LOWEST PRICE EVER
            </div>
          </div>
          <div className={styles.receiptTearBottom} />
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={`text-muted ${styles.featureBody}`}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      {!user && (
        <section className={styles.ctaStrip}>
          <div className="container">
            <h2 className={`display-heading ${styles.ctaHeadline}`}>Ready to save?</h2>
            <Link to="/signup" className="btn btn-primary">Create a free account</Link>
          </div>
        </section>
      )}
    </div>
  );
}
