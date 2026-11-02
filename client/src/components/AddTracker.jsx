import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import styles from './AddTracker.module.css';

export default function AddTracker({ onTrackerAdded, onCancel }) {
  const toast = useToast();
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);

  const [form, setForm] = useState({
    url: '',
    site: '',
    name: '',
    type: 'product',
    demandPrice: '',
    telegramChatId: '',
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch available sites on mount
  useEffect(() => {
    const FALLBACK_SITES = [
      { _id: '60d5ecb8b5c0c24d88e40001', name: 'Amazon', type: 'product' },
      { _id: '60d5ecb8b5c0c24d88e40002', name: 'Flipkart', type: 'product' },
      { _id: '60d5ecb8b5c0c24d88e40003', name: 'Demo Books Store (books.toscrape.com)', type: 'product' },
      { _id: '60d5ecb8b5c0c24d88e40004', name: 'Yahoo Finance (Stock)', type: 'stock' },
    ];

    api.get('/sites')
      .then(({ data }) => {
        setSites(Array.isArray(data) && data.length > 0 ? data : FALLBACK_SITES);
      })
      .catch((err) => {
        console.warn('Using fallback site configs:', err.message);
        setSites(FALLBACK_SITES);
      })
      .finally(() => setLoadingSites(false));
  }, []);

  // Auto-detect site when URL changes
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setForm((prev) => {
      let detectedSite = prev.site;
      if (url && sites.length > 0) {
        const lowerUrl = url.toLowerCase();
        const matched = sites.find((s) => {
          const sName = s.name.toLowerCase();
          if (lowerUrl.includes('amazon') && sName.includes('amazon')) return true;
          if (lowerUrl.includes('flipkart') && sName.includes('flipkart')) return true;
          if (lowerUrl.includes('toscrape') && sName.includes('toscrape')) return true;
          if (lowerUrl.includes('finance.yahoo') && sName.includes('yahoo')) return true;
          return false;
        });
        if (matched) {
          detectedSite = matched._id;
        }
      }
      return { ...prev, url, site: detectedSite };
    });
    setTestResult(null);
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Preview / Test scraper
  const handleTestScraper = async () => {
    if (!form.url) {
      setError('Please provide a URL to test.');
      return;
    }
    if (!form.site) {
      setError('Please select the site associated with this URL.');
      return;
    }

    setError('');
    setTesting(true);
    setTestResult(null);

    try {
      const { data } = await api.post('/test', {
        url: form.url,
        siteId: form.site,
      });

      setTestResult(data.data);
      toast.success('Successfully scraped item data!');

      // Auto-fill name if not already filled
      if (!form.name && data.data.name) {
        setForm((prev) => ({ ...prev, name: data.data.name }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to scrape target. The page layout may have changed.';
      setError(msg);
      toast.error(msg, 'Scraper Failed');
    } finally {
      setTesting(false);
    }
  };

  // Save new track
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.url || !form.site || !form.demandPrice) {
      setError('Please fill in all required fields.');
      return;
    }

    const numericPrice = parseFloat(form.demandPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Target price must be a positive number.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        url: form.url.trim(),
        site: form.site,
        type: form.type,
        demandPrice: numericPrice,
        telegramChatId: form.telegramChatId.trim() || undefined,
        image: testResult?.image || undefined,
      };

      const { data } = await api.post('/track', payload);
      toast.success(`Started tracking "${data.name}"!`);

      // Reset form
      setForm({
        url: '',
        site: '',
        name: '',
        type: 'product',
        demandPrice: '',
        telegramChatId: '',
      });
      setTestResult(null);

      if (onTrackerAdded) {
        onTrackerAdded(data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save this tracker. Please verify all fields.';
      setError(msg);
      toast.error(msg, 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.trackerContainer}>
      <div className={styles.receiptHeaderTab}>
        <span className={styles.receiptLabel}>NEW TRACKER DISPATCH</span>
      </div>

      <div className={styles.panelCard}>
        <div className={styles.cardHeading}>
          <h2 className={styles.title}>Track a New Product or Stock</h2>
          <p className="text-muted text-sm">
            Enter a URL and your target price. We will watch it and alert you when it drops.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* URL & Site Selector */}
          <div className={styles.formRow}>
            <div className="input-group" style={{ flex: 2 }}>
              <label className="input-label" htmlFor="tracker-url">
                Target URL <span className={styles.req}>*</span>
              </label>
              <input
                id="tracker-url"
                name="url"
                type="url"
                className="input"
                placeholder="https://www.amazon.com/dp/... or https://finance.yahoo.com/quote/..."
                value={form.url}
                onChange={handleUrlChange}
                required
              />
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" htmlFor="tracker-site">
                Store / Source <span className={styles.req}>*</span>
              </label>
              <select
                id="tracker-site"
                name="site"
                className="input"
                value={form.site}
                onChange={handleChange}
                disabled={loadingSites}
                required
              >
                <option value="">{loadingSites ? 'Loading sites…' : '— Select Site —'}</option>
                {sites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Test & Preview Button */}
          <div className={styles.testActionRow}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleTestScraper}
              disabled={testing || !form.url || !form.site}
              style={{ fontSize: '0.85rem' }}
            >
              {testing ? '⏳ Inspecting URL…' : '🔍 Preview & Validate Scraper'}
            </button>
            <span className="text-xs text-muted">
              Live checks verify selectors before saving
            </span>
          </div>

          {/* Live Preview Stub */}
          {testResult && (
            <div className={styles.previewBox}>
              <div className={styles.previewBadge}>Scraper Verified ✓</div>
              <div className={styles.previewContent}>
                {testResult.image && (
                  <img
                    src={testResult.image}
                    alt="Preview"
                    className={styles.previewImg}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className={styles.previewInfo}>
                  <strong className={styles.previewName}>{testResult.name}</strong>
                  <div className={styles.previewPriceRow}>
                    <span className="text-muted text-xs">Current Live Price:</span>
                    <span className="price-figure price-green" style={{ fontSize: '1.2rem' }}>
                      ${testResult.price?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Item Name */}
          <div className="input-group">
            <label className="input-label" htmlFor="tracker-name">
              Item Display Name <span className={styles.req}>*</span>
            </label>
            <input
              id="tracker-name"
              name="name"
              type="text"
              className="input"
              placeholder="e.g. Sony WH-1000XM5 Noise-Canceling Headphones"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Type & Demand Price */}
          <div className={styles.formRow}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" htmlFor="tracker-type">Category</label>
              <select
                id="tracker-type"
                name="type"
                className="input"
                value={form.type}
                onChange={handleChange}
              >
                <option value="product">Retail Product</option>
                <option value="stock">Financial Stock</option>
              </select>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label" htmlFor="tracker-demandPrice">
                Target Demand Price ($ USD) <span className={styles.req}>*</span>
              </label>
              <input
                id="tracker-demandPrice"
                name="demandPrice"
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                placeholder="e.g. 249.99"
                value={form.demandPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Telegram Chat ID */}
          <div className="input-group">
            <label className="input-label" htmlFor="tracker-telegram">
              Telegram Chat ID <span className="text-muted">(optional mobile alert)</span>
            </label>
            <input
              id="tracker-telegram"
              name="telegramChatId"
              type="text"
              className="input"
              placeholder="Send /start to @PriceRadarBot on Telegram to get your ID"
              value={form.telegramChatId}
              onChange={handleChange}
            />
          </div>

          {/* Action Buttons */}
          <div className={styles.btnRow}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ flex: 2 }}
            >
              {saving ? 'Registering Tracker…' : 'Stamp & Save Tracker'}
            </button>
            {onCancel && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.receiptTear} />
    </div>
  );
}
