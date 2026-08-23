import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>⬡</span>
          <span className={styles.logoText}>PriceRadar</span>
        </Link>

        <nav className={styles.nav}>
          {user ? (
            <>
              <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
              <Link to="/add" className={styles.navLink}>+ Track</Link>
              <button onClick={handleLogout} className={`btn btn-ghost ${styles.logoutBtn}`}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className={styles.navLink}>Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
