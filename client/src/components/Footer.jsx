import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.copy}>
          &copy; {new Date().getFullYear()} PriceRadar — Track Every Drop.
        </p>
        <p className={styles.credit}>
          Built as a B.Tech CS mini project.
        </p>
      </div>
    </footer>
  );
}
