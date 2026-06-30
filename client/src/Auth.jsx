import { useState } from 'react';

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Read-Only'); // Default role for registration
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { username, password } : { username, password, role };

    try {
      // Assuming your React app is proxied to your backend or hits http://localhost:5000
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setMessage({ text: 'Login successful! Redirecting...', isError: false });
          // Pass the secure JWT token and assigned user role back up to App.jsx
          onLoginSuccess(data.token, data.role);
        } else {
          setMessage({ text: 'Registration successful! Please switch to login.', isError: false });
          setIsLogin(true);
        }
      } else {
        setMessage({ text: data.message || 'An error occurred.', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Cannot connect to authentication server.', isError: true });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>
        {isLogin ? 'Login to QueryEcho' : 'Create QueryEcho Account'}
      </h2>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button 
          onClick={() => { setIsLogin(true); setMessage({ text: '', isError: false }); }}
          style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: isLogin ? '3px solid #007bff' : 'none', fontWeight: isLogin ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          Login
        </button>
        <button 
          onClick={() => { setIsLogin(false); setMessage({ text: '', isError: false }); }}
          style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: !isLogin ? '3px solid #007bff' : 'none', fontWeight: !isLogin ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          Register
        </button>
      </div>

      {/* Auth Status Banner */}
      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.isError ? '#f8d7da' : '#d4edda', color: message.isError ? '#721c24' : '#155724', fontSize: '14px', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Username</label>
          <input 
            type="text" 
            required 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* Show Role selector drop-down ONLY during registration */}
        {!isLogin && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Account Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
            >
              <option value="Read-Only">Read-Only</option>
              <option value="Power User">Power User</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
        )}

        <button 
          type="submit" 
          style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default Auth;