import "../css/Header.css";
import carrot from "../assets/carrot-before-hovers.png"

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <a className="help-carrot">
          <img src={carrot} title="help" alt="help-carrot" />
        </a>
      </nav>
    </header>
  );
}

export default Header;
