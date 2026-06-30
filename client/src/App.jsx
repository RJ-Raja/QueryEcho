import { useState } from 'react';
import Landing from './landing'; // Adjust to './landing' if your file is lowercase
import './App.css';

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  const [dbConfig, setDbConfig] = useState({
    engine: 'postgres', host: 'localhost', port: '5432', user: 'postgres', password: '', database: ''
  });

  const [status, setStatus] = useState('Awaiting connection...');
  const [isConnected, setIsConnected] = useState(false);
  const [schemaData, setSchemaData] = useState(null);

  const [prompt, setPrompt] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [queryExplanation, setQueryExplanation] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const [results, setResults] = useState([]);

  const handleLoginSuccess = (userToken, assignedRole) => {
    setToken(userToken);
    setUserRole(assignedRole);
    localStorage.setItem('token', userToken);
    localStorage.setItem('userRole', assignedRole);
  };

  const handleLogout = () => {
    setToken('');
    setUserRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    handleDisconnect();
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSchemaData(null);
    setResults([]);
    setGeneratedSql('');
    setQueryExplanation('');
    setPrompt('');
    setStatus('Awaiting connection...');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'engine') {
      const defaultPort = value === 'postgres' ? '5432' : value === 'mysql' ? '3306' : '1521';
      setDbConfig({ ...dbConfig, engine: value, port: defaultPort });
    } else {
      setDbConfig({ ...dbConfig, [name]: value });
    }
  };

  const testConnection = async (e) => {
    e.preventDefault();
    setStatus('Connecting and extracting schema...');
    setSchemaData(null);
    setGeneratedSql('');
    setQueryExplanation('');
    setResults([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dbConfig)
      });
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setStatus(`Success! Extracted schema from ${result.data.engine}.`);
        setSchemaData(result.data.schema);
        setIsConnected(true);
      } else {
        setStatus('Failed to connect. Check credentials.');
      }
    } catch (error) {
      setStatus('Server error. Is the Express backend running?');
    }
  };

  const handleGenerateSQL = async () => {
    if (!prompt || !schemaData) return;

    setAiStatus('🧠 AI is thinking...');
    setGeneratedSql('');
    setQueryExplanation('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: prompt,
          engine: dbConfig.engine,
          schema: schemaData
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setGeneratedSql(result.data.query);
        setQueryExplanation(result.data.explanation);
        setAiStatus('✅ Query Generated. Please review below.');
      } else {
        setAiStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      setAiStatus('Failed to reach AI server.');
    }
  };

  const handleExecuteSQL = async () => {
    setAiStatus('⚡ Executing query on database...');
    setResults([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: generatedSql,
          engine: dbConfig.engine,
          dbConfig: dbConfig
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setResults(result.data);
        setAiStatus(`🎉 Success! Returned ${result.data.length} rows.`);
      } else {
        setAiStatus(`❌ Execution Failed: ${result.message}`);
      }
    } catch (error) {
      setAiStatus('Failed to connect to execution server.');
    }
  };

  return (
    <>
      {!token ? (
        <Landing onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', color: '#fff' }}>

          {/* Header & Logout banner bar */}
          <div style={{ borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '20px', marginBottom: '25px' }}>

            {/* Top Row: Centered Workspace Title */}
            <h2 style={{ margin: '0 0 20px 0', color: '#30cfd0', textAlign: 'center', fontSize: '28px', letterSpacing: '1px' }}>
              QueryEcho Workspace
            </h2>

            {/* Bottom Row: Role on Left, Logout on Right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#330867', color: '#fff', padding: '6px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', border: '1px solid #30cfd0' }}>
                Role: {userRole}
              </span>
              <button onClick={handleLogout} style={{ padding: '8px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                Logout
              </button>
            </div>

          </div>

          {/* 1. SECURED DATABASE CONNECTION SECTION */}
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '20px', marginBottom: '20px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
            <h3 style={{ marginTop: 0 }}>1. Connect Database</h3>

            {!isConnected ? (
              <form onSubmit={testConnection} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select name="engine" value={dbConfig.engine} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: 'none' }}>
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="oracle">Oracle</option>
                </select>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" name="host" placeholder="Host" value={dbConfig.host} onChange={handleInputChange} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none' }} />
                  <input type="text" name="port" placeholder="Port" value={dbConfig.port} onChange={handleInputChange} style={{ width: '80px', padding: '10px', borderRadius: '6px', border: 'none' }} />
                </div>
                <input type="text" name="database" placeholder="Database Name" value={dbConfig.database} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: 'none' }} required />
                <input type="text" name="user" placeholder="Username" value={dbConfig.user} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: 'none' }} required />
                <input type="password" name="password" placeholder="Password" value={dbConfig.password} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: 'none' }} />
                <button type="submit" style={{ padding: '12px', backgroundColor: '#30cfd0', color: '#1a1a1a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
                  Connect & Fetch Schema
                </button>
              </form>
            ) : (
              <div style={{ padding: '15px', backgroundColor: 'rgba(48, 207, 208, 0.2)', border: '1px solid #30cfd0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#30cfd0' }}>✅ Connected to {dbConfig.engine.toUpperCase()}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#e0e0e0' }}>Targeting Database: <strong>{dbConfig.database}</strong></p>
                </div>
                <button onClick={handleDisconnect} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Disconnect
                </button>
              </div>
            )}

            {!isConnected && <p style={{ marginTop: '15px', fontSize: '14px', color: status.includes('Success') ? '#30cfd0' : '#ff6b6b' }}><strong>{status}</strong></p>}
          </div>

          {/* 2. AI GENERATION SECTION */}
          {schemaData && (
            <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '20px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <h3 style={{ marginTop: 0 }}>2. Ask the AI</h3>
              <textarea
                placeholder="E.g., Show me all active users who signed up last month..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ width: '100%', height: '80px', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: 'none', boxSizing: 'border-box' }}
              />
              <button onClick={handleGenerateSQL} disabled={!prompt} style={{ padding: '12px', backgroundColor: '#330867', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
                Generate SQL
              </button>

              <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#30cfd0' }}>{aiStatus}</p>

              {generatedSql && (
                <div style={{ marginTop: '25px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#ff6b6b' }}>Review & Modify Query (HITL)</h4>

                  {queryExplanation && (
                    <div style={{ padding: '15px', backgroundColor: 'rgba(48, 207, 208, 0.1)', color: '#e0e0e0', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(48, 207, 208, 0.3)', fontSize: '14px', lineHeight: '1.6' }}>
                      <strong style={{ color: '#30cfd0' }}>🤖 AI Explanation:</strong> {queryExplanation}
                    </div>
                  )}

                  <textarea
                    value={generatedSql}
                    onChange={(e) => setGeneratedSql(e.target.value)}
                    style={{ width: '100%', height: '120px', fontFamily: 'monospace', padding: '15px', backgroundColor: '#1e1e1e', color: '#30cfd0', border: 'none', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <button onClick={handleExecuteSQL} style={{ width: '100%', marginTop: '15px', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                    Approve & Execute Query
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. EXECUTION RESULTS TABLE */}
          {results.length > 0 && (
            <div style={{ marginTop: '30px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '20px', background: 'rgba(255,255,255,0.05)' }}>
              <h3 style={{ marginTop: 0 }}>3. Query Results</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} style={{ padding: '12px', borderBottom: '2px solid #30cfd0', color: '#30cfd0' }}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} style={{ padding: '12px' }}>{val?.toString() ?? 'NULL'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;