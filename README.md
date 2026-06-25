<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px;">

    <div style="text-align: center; padding: 40px 0; border-bottom: 1px solid #eaeaea;">
        <h1 style="font-size: 2.5em; margin-bottom: 10px; color: #1a1a1a;">QueryEcho</h1>
        <h2 style="font-size: 1.5em; font-weight: 300; color: #666; margin-top: 0;">Natural Language to SQL AI Assistant</h2>
    </div>

    <div style="padding: 30px 0;">
        <h3 style="color: #0366d6; border-bottom: 2px solid #0366d6; display: inline-block; padding-bottom: 5px;">Project Overview</h3>
        <p style="font-size: 1.1em; color: #444;">
            QueryEcho is a secure, interactive web application that allows users to query relational databases using natural language[cite: 1]. The system seamlessly translates English inputs into optimized SQL queries utilizing a pre-trained Large Language Model (LLM) accessed via a free API[cite: 2]. Designed with enterprise-grade security at its core, it features strict role-based access control, hardcoded security validations, and a critical human-in-the-loop review system before executing any query safely on the connected database[cite: 3].
        </p>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 30px 0;">
        
        <div style="flex: 1 1 calc(50% - 20px); background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e1e4e8;">
            <h4 style="margin-top: 0; color: #24292e;">Dynamic Database Routing</h4>
            <p style="font-size: 0.9em; color: #586069;">Dynamically routes connections and explicitly supports PostgreSQL, MySQL, and Oracle database engines right out of the box[cite: 7, 112].</p>
        </div>

        <div style="flex: 1 1 calc(50% - 20px); background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e1e4e8;">
            <h4 style="margin-top: 0; color: #24292e;">Data Privacy & Schema Filtering</h4>
            <p style="font-size: 0.9em; color: #586069;">The backend dynamically fetches the schema but strictly excludes sensitive columns (e.g., passwords, SSNs) and massive tables to save API tokens[cite: 9, 10]. Actual database rows are never exposed to the AI[cite: 11].</p>
        </div>

        <div style="flex: 1 1 calc(50% - 20px); background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e1e4e8;">
            <h4 style="margin-top: 0; color: #24292e;">Human-In-The-Loop (HITL)</h4>
            <p style="font-size: 0.9em; color: #586069;">Generated SQL is not executed automatically; it is presented to the user on the UI to review, modify manually, or approve for safe execution[cite: 15, 16].</p>
        </div>

        <div style="flex: 1 1 calc(50% - 20px); background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e1e4e8;">
            <h4 style="margin-top: 0; color: #24292e;">Hardcoded Security Guardrails</h4>
            <p style="font-size: 0.9em; color: #586069;">Utilizes regex/string matching on the final SQL before execution[cite: 22]. Read-Only users are forcefully blocked from running destructive commands like DROP, TRUNCATE, DELETE, or UPDATE[cite: 23].</p>
        </div>
        
        <div style="flex: 1 1 100%; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e1e4e8;">
            <h4 style="margin-top: 0; color: #24292e;">AI Query Explanation</h4>
            <p style="font-size: 0.9em; color: #586069;">The AI brain automatically provides a plain-English explanation of what the generated query does, separated safely from the executable code via strict JSON formatting[cite: 312, 316].</p>
        </div>

    </div>

    <div style="padding: 30px 0;">
        <h3 style="color: #0366d6; border-bottom: 2px solid #0366d6; display: inline-block; padding-bottom: 5px;">Core Architecture & Technology Stack</h3>
        <ul style="list-style-type: square; color: #444; font-size: 1.05em;">
            <li><strong>Frontend:</strong> React.js built with Vite[cite: 98, 99].</li>
            <li><strong>Backend:</strong> Node.js utilizing Express 5 for native asynchronous promise rejection handling[cite: 5, 82].</li>
            <li><strong>AI Integration:</strong> Llama 3.1 8B / 3.3 70B models accessed via the Groq API[cite: 5]. This ensures rapid generation speeds, zero local hardware processing, and zero costs on the developer tier[cite: 6].</li>
            <li><strong>Database Drivers:</strong> <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px;">pg</code> (PostgreSQL), <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px;">mysql2</code> (MySQL), and <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px;">oracledb</code> (Oracle)[cite: 116, 117, 118].</li>
        </ul>
    </div>

    <div style="background: #24292e; color: #ffffff; padding: 30px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #61dafb; margin-top: 0;">Step-by-Step Execution Workflow</h3>
        <ol style="color: #e1e4e8; font-size: 1.05em; line-height: 1.8;">
            <li><strong>Connection:</strong> User selects target engine and establishes secure backend connection[cite: 7, 8].</li>
            <li><strong>Extraction:</strong> Backend dynamically fetches schema and scrubs sensitive metadata[cite: 9, 10].</li>
            <li><strong>Prompting:</strong> User inputs natural language request; UI displays a loading state[cite: 12, 13].</li>
            <li><strong>Generation:</strong> Llama model returns formatted SQL and an English explanation[cite: 14, 316].</li>
            <li><strong>Review:</strong> SQL is held in the UI editor for human-in-the-loop review and modification[cite: 15, 16].</li>
            <li><strong>Validation:</strong> Upon approval, backend regex validates the query against hardcoded blacklists[cite: 17, 21].</li>
            <li><strong>Execution:</strong> Query runs against the database and results populate in a readable data grid[cite: 19].</li>
        </ol>
    </div>

</div>
