import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import HubLogo from '../../../shared/HubLogo';

const linkClass = ({ isActive }) =>
  `fh-nav__link${isActive ? ' is-active' : ''}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 720) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const close = () => setOpen(false);

  return (
    <nav className={`fh-nav${open ? ' is-open' : ''}`} aria-label="Primary">
      <Link to="/" className="fh-nav__brand" onClick={close}>
        <span className="hub-logo-wrap">
          <HubLogo size="md" />
        </span>
        <span className="fh-nav__wordmark">
          <strong>Freelance Hub</strong>
          <span>Marketplace</span>
        </span>
      </Link>

      <div className="fh-nav__links">
        <NavLink className={linkClass} to="/about" title="About">
          About
        </NavLink>
        <NavLink className={linkClass} to="/login" title="Login">
          Login
        </NavLink>
        <NavLink className={linkClass} to="/register" title="Sign up">
          Sign up
        </NavLink>
      </div>

      <button
        type="button"
        className="fh-nav__menu-btn"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
      </button>

      <div className="fh-nav__drawer">
        <NavLink className={linkClass} to="/about" onClick={close}>
          About
        </NavLink>
        <NavLink className={linkClass} to="/login" onClick={close}>
          Login
        </NavLink>
        <NavLink className={linkClass} to="/register" onClick={close}>
          Sign up
        </NavLink>
      </div>
    </nav>
  );
}
