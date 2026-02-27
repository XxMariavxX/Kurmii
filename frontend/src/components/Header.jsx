import "../css/Header.css";
import ico from "../assets/favicon.ico";

function Header() {
  return (
    <div>
      <header className="header">
        <div className="logo-block">
          <a>
            <img src={ico} alt="logo" className="logo-header" />
          </a>
        </div>
      </header>
    </div>
  );
}

export default Header;
