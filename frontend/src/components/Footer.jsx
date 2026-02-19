import '../css/Footer.css';
import ico from '../assets/favicon.ico';

function Footer() {
  return (
    <footer className='footer'>
      <div className='logo-text'>
        <div className='block-logo-footer'>
          <img src={ico} alt='logo-footer' className='logo-footer'/>
        </div>

        <div className='text'>Text</div>
      </div>
    </footer>
  );
}

export default Footer;
