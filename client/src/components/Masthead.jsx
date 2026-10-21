import logo from '../assets/baseerah-logo.png';

export function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <a className="brand" href="/">
          <img src={logo} alt="Baseerah (بصيرة) home" width="198" height="49" />
        </a>
      </div>
    </header>
  );
}
