import express from 'express';
import cors from 'cors';
import { connectAndFetchSchema, executeSafeQuery } from './services/dbManager.js';
import { generateSQL } from './services/aiManager.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function validateSqlQuery(sqlString) {
  // Regex to match destructive SQL keywords as isolated words (case-insensitive)
  // We block DDL and data-modification statements to ensure read-only safety
  const destructivePatterns = /\b(DROP|DELETE|TRUNCATE|ALTER|UPDATE|INSERT|GRANT|REVOKE)\b/i;
  
  if (destructivePatterns.test(sqlString)) {
    return {
      isValid: false,
      reason: "Security Guardrail Blocked Execution: Destructive or structural modification statements (DROP, DELETE, TRUNCATE, ALTER, UPDATE, INSERT, etc.) are strictly forbidden."
    };
  }
  
  return { isValid: true };
}


// --- 4. LIVE QUERY EXECUTION ENDPOINT WITH SECURITY GUARDRAILS ---
app.post('/api/execute', async (req, res) => {
  const { query, engine, dbConfig } = req.body;

  if (!query) {
    return res.status(400).json({ status: 'error', message: 'No query provided for execution.' });
  }

  // 1. Run Security Validation Check
  const securityCheck = validateSqlQuery(query);
  if (!securityCheck.isValid) {
    return res.status(403).json({ status: 'security_violation', message: securityCheck.reason });
  }

  // 2. Execute Safely using dbManager
  try {
    const rows = await executeSafeQuery(query, dbConfig);
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    // Catch database-level errors (like syntax errors) and send them back to the UI
    res.status(500).json({ status: 'database_error', message: error.message });
  }
});


// Middleware
// We restrict CORS to your Vite frontend's default port (5173) for security
app.use(cors({
    origin: 'http://localhost:5173' 
}));

// Allows our server to accept JSON data in request bodies
app.use(express.json());

// Basic Health Check Route to verify connectivity
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'QueryEcho Backend is live and ready on Express 5!' 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is securely running on http://localhost:${PORT}`);
});

// DAtabase  Work  //

app.post('/api/connect', async (req, res) => {
    // req.body will contain the engine choice from the React UI
    const dbConfig = req.body; 
    
    // Express 5 handles any connection errors thrown by this function natively
    const schemaData = await connectAndFetchSchema(dbConfig);
    
    res.status(200).json({ status: 'success', data: schemaData });
});

// AI Query Generation Route

app.post('/api/generate', async (req, res) => {
    const { prompt, engine, schema } = req.body;

    if (!prompt || !engine || !schema) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

    try {
        // aiResponse is now an object: { query: "...", explanation: "..." }
        const aiResponse = await generateSQL(prompt, engine, schema);
        
        res.status(200).json({ 
            status: 'success', 
            data: aiResponse // Sending the whole object to the React frontend
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});