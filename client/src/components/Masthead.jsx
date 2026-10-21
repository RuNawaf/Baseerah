import logo from '../assets/baseerah-logo.png';

/** Top bar: the logo, a few plain links and one action. */
export function Masthead({ onHome, onScanClick }) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#/"
        onClick={(event) => {
          if (onHome) {
            event.preventDefault();
            onHome();
          }
        }}
      >
        <img src={logo} alt="Baseerah (بصيرة) home" width="198" height="49" />
      </a>
      <nav className="topnav" aria-label="Main">
        <a href="#how">How it works</a>
        <a href="https://github.com/RuNawaf/Baseerah">GitHub</a>
        <button type="button" className="pill pill-dark" onClick={onScanClick}>
          Scan a website
        </button>
      </nav>
    </header>
  );
}
