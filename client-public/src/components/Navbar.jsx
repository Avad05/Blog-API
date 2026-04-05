import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          dev<span>.</span>blog
        </Link>
        <span className="navbar__tag">// thoughts &amp; code</span>
      </div>
    </nav>
  );
}
