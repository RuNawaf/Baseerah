import logo from '../assets/baseerah-logo.png';

/** The tinted frame's top bar: the product's mark and name. */
export function Masthead({ onHome }) {
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
    </header>
  );
}
