import "../css/Header.css";
import carrot from "../assets/carrot-before-hovers.png"


function Header() {
  return (
    <div>
      <header className="header">
        <div className="logo-block">
          <nav className="nav">
            <a className="help-carrot">
              <img src = {carrot} alt="help-carrot"/>
            </a>
          </nav>
        </div>
      </header>
    </div>
  );
}

export default Header;
