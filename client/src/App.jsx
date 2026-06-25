import { useState } from 'react';
import './App.css';

function App() {
  // --- STATE ---
  const [dbConfig, setDbConfig] = useState({
    engine: 'postgres', host: 'localhost', port: '5432', user: 'postgres', password: '', database: ''
  });
  
  const [status, setStatus] = useState('Awaiting connection...');
  const [schemaData, setSchemaData] = useState(null);
  
  // New State for AI, HITL Review, and Results
  const [prompt, setPrompt] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [queryExplanation, setQueryExplanation] = useState(''); // Moved INSIDE the function!
  const [aiStatus, setAiStatus] = useState('');
  const [results, setResults] = useState([]);

  // --- FUNCTIONS ---
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
    setQueryExplanation(''); // Reset explanation on new connection
    setResults([]); 

    try {
      const response = await fetch('http://localhost:5000/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig)
      });
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setStatus(`Success! Extracted schema from ${result.data.engine}.`);
        setSchemaData(result.data.schema);
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
    setQueryExplanation(''); // Clear previous explanation

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          engine: dbConfig.engine,
          schema: schemaData
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        // AI returns an object with BOTH query and explanation
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
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // --- UI RENDER ---
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>QueryEcho</h2>
      
      {/* 1. DATABASE CONNECTION SECTION */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>1. Connect Database</h3>
        <form onSubmit={testConnection} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select name="engine" value={dbConfig.engine} onChange={handleInputChange} style={{ padding: '8px' }}>
            <option value="postgres">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="oracle">Oracle</option>
          </select>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" name="host" placeholder="Host" value={dbConfig.host} onChange={handleInputChange} style={{ flex: 1, padding: '8px' }} />
            <input type="text" name="port" placeholder="Port" value={dbConfig.port} onChange={handleInputChange} style={{ width: '80px', padding: '8px' }} />
          </div>
          <input type="text" name="database" placeholder="Database Name" value={dbConfig.database} onChange={handleInputChange} style={{ padding: '8px' }} required />
          <input type="text" name="user" placeholder="Username" value={dbConfig.user} onChange={handleInputChange} style={{ padding: '8px' }} required />
          <input type="password" name="password" placeholder="Password" value={dbConfig.password} onChange={handleInputChange} style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#333', color: '#FFF', cursor: 'pointer' }}>Connect & Fetch Schema</button>
        </form>
        <p style={{ marginTop: '10px', fontSize: '14px', color: status.includes('Success') ? 'green' : 'red' }}><strong>{status}</strong></p>
      </div>

      {/* 2. AI GENERATION SECTION */}
      {schemaData && (
        <div style={{ border: '1px solid #007BFF', padding: '15px', borderRadius: '5px' }}>
          <h3>2. Ask the AI</h3>
          <textarea 
            placeholder="E.g., Show me all active users who signed up last month..." 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            style={{ width: '100%', height: '80px', padding: '10px', marginBottom: '10px' }}
          />
          <button onClick={handleGenerateSQL} disabled={!prompt} style={{ padding: '10px', backgroundColor: '#007BFF', color: '#FFF', border: 'none', cursor: 'pointer', width: '100%' }}>
            Generate SQL
          </button>
          
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{aiStatus}</p>

          {/* HUMAN IN THE LOOP REVIEW */}
          {generatedSql && (
            <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#d9534f' }}>Review & Modify Query (HITL)</h4>
              
              {/* THE NEW AI EXPLANATION UI BLOCK */}
              {queryExplanation && (
                <div style={{ padding: '12px', backgroundColor: '#eef2ff', color: '#3730a3', borderRadius: '4px', marginBottom: '15px', border: '1px solid #c7d2fe', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>🤖 AI Explanation:</strong> {queryExplanation}
                </div>
              )}

              <textarea 
                value={generatedSql}
                onChange={(e) => setGeneratedSql(e.target.value)}
                style={{ width: '100%', height: '120px', fontFamily: 'monospace', padding: '10px', backgroundColor: '#282c34', color: '#61dafb' }}
              />
              <button onClick={handleExecuteSQL} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                Approve & Execute Query
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. EXECUTION RESULTS TABLE */}
      {results.length > 0 && (
        <div style={{ marginTop: '30px', overflowX: 'auto', border: '1px solid #aaa', borderRadius: '5px', padding: '15px' }}>
          <h3>3. Query Results</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#eee' }}>
                {Object.keys(results[0]).map((key) => (
                  <th key={key} style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} style={{ padding: '10px' }}>{val?.toString() ?? 'NULL'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default App;