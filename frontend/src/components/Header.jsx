import "../css/Header.css";
import carrot from "../assets/carrot-before-hovers.png"


function Header() {
  return (
    <div>
      <header className="header">
          <nav className="nav">
            <a className="help-carrot">
              <img src = {carrot} title="help" alt="help-carrot"/>
            </a>
          </nav>
      </header>
    </div>
  );
}

export default Header;
