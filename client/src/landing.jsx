import React, { useState } from 'react';
import './App.css';

function Landing({ onLoginSuccess }) {
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  
  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Read-Only'); // <-- ADDED: State to track the selected role

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowModal(true);
  };

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    // <-- ADDED: Now sends the actually selected role to the backend instead of hardcoding it!
    const payload = authMode === 'login' ? { username, password } : { username, password, role };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (authMode === 'login') {
          onLoginSuccess(data.token, data.role);
        } else {
          alert('Registration successful! Please sign in.');
          setAuthMode('login'); 
          setPassword(''); 
        }
      } else {
        alert(data.message || 'Authentication failed.');
      }
    } catch (error) {
      alert('Cannot connect to authentication server. Is the backend running?');
    }
  };

  return (
    <div className="landing-wrapper">
      
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">QUERY ECHO</h2>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
        
        <div className="nav-right">
          <button onClick={() => openAuth('login')}>Login</button>
          <button className="primary-btn" onClick={() => openAuth('register')}>Register</button>
        </div>
      </nav>

      <main className="main-content">
        <section id="about">
          <h1>Talk to Your Database</h1>
          <p>QueryEcho translates your natural language English into optimized SQL queries instantly. Secure, fast, and human-in-the-loop.</p>
        </section>

        <section id="features">
          <h1>Enterprise Features</h1>
          <p>Strict Role-Based Access Control, robust data privacy filtering, and support for PostgreSQL, MySQL, and Oracle architectures.</p>
        </section>
        
        <section id="contact">
          <h1>Get in Touch</h1>
          <p>Have questions about integrating QueryEcho into your stack? We'd love to hear from you.</p>
        </section>
      </main>

      <footer className="footer">
        <div>&copy; 2026 QueryEcho. All rights reserved.</div>
        <div className="footer-links">
          <a href="#contact">Contact Us</a>
          <a href="https://github.com/RJ-Raja/QueryEcho" target="_blank" rel="noreferrer">Contribute on GitHub</a>
        </div>
      </footer>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            
            <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Username or Email" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              {/* <-- The Role Dropdown (Only visible during Registration) --> */}
              {/* <-- ANIMATED ROLE DROPDOWN --> */}
              {authMode === 'register' && (
                <div className="input-group">
                  <div className="custom-select-menu">
                    <div className="item">
                      
                      {/* The Main Visible Box */}
                      <div className="link">
                        <span style={{ color: role === 'Read-Only' ? 'inherit' : '#33b8b8', fontWeight: role !== 'Read-Only' ? 'bold' : 'normal' }}>
                          Role: {role}
                        </span>
                        <svg viewBox="0 0 360 360" xmlSpace="preserve">
                          <g id="SVGRepo_iconCarrier">
                            <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z" />
                          </g>
                        </svg>
                      </div>

                      {/* The Dropdown Options */}
                      <div className="submenu">
                        <div className="submenu-item" onClick={() => setRole('Read-Only')}>
                          <span className="submenu-link">Read-Only</span>
                        </div>
                        <div className="submenu-item" onClick={() => setRole('Power User')}>
                          <span className="submenu-link">Power User</span>
                        </div>
                        <div className="submenu-item" onClick={() => setRole('Super Admin')}>
                          <span className="submenu-link">Super Admin</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
              
              <button type="submit" className="cta-submit">
                <span className="span-text">{authMode === 'login' ? 'LOGIN' : 'SIGN UP'}</span>
                <span className="second">
                  <svg width="40px" height="16px" viewBox="0 0 66 43" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <g id="arrow" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                      <path className="one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" />
                      <path className="two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" />
                      <path className="three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" />
                    </g>
                  </svg>
                </span>
              </button>
              
              <button type="button" className="google-btn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width="16" />
                Login with Google
              </button>
              
              <div className="toggle-link">
                {authMode === 'login' ? (
                  <>Don't have an account yet? <span onClick={toggleMode}>Register</span></>
                ) : (
                  <>Already have an account? <span onClick={toggleMode}>Login</span></>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;