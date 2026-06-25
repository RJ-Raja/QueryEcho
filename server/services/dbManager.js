import pg from 'pg';
import mysql from 'mysql2/promise';
import oracledb from 'oracledb';

const { Pool } = pg;

// A regex-based blacklist for sensitive column names
const SENSITIVE_COLUMNS = /password|hash|salt|token|ssn|social_security|credit_card|cvv|secret/i;

// THE FIX: Normalizes all object keys to lowercase to handle MySQL (TABLE_NAME) vs Postgres (table_name)
const normalizeRow = (row) => {
    const normalized = {};
    for (const key in row) {
        normalized[key.toLowerCase()] = row[key];
    }
    return normalized;
};

const filterSensitiveData = (columns) => {
    return columns
        .map(normalizeRow) // Force all keys to lowercase before filtering
        .filter(col => !SENSITIVE_COLUMNS.test(col.column_name));
};

const formatSchemaForAI = (filteredColumns) => {
    const schema = {};
    filteredColumns.forEach(col => {
        // Now we can safely rely on lowercase keys for any database engine
        if (!schema[col.table_name]) {
            schema[col.table_name] = [];
        }
        schema[col.table_name].push(`${col.column_name} (${col.data_type})`);
    });
    return schema;
};

export const connectAndFetchSchema = async (dbConfig) => {
    const { engine, host, port, user, password, database } = dbConfig;

    if (engine === 'postgres') {
        const pool = new Pool({ host, port, user, password, database });
        
        // THE FIX: Exclude system schemas instead of strictly looking for 'public'
        const query = `
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        `;
        const { rows } = await pool.query(query);
        
        const safeColumns = filterSensitiveData(rows);
        const finalSchema = formatSchemaForAI(safeColumns);
        
        await pool.end();
        return { engine: 'postgres', schema: finalSchema };
    } 
    
    else if (engine === 'mysql') {
        const connection = await mysql.createConnection({ host, port, user, password, database });
        
        const query = `
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = ?
        `;
        const [rows] = await connection.execute(query, [database]);
        
        const safeColumns = filterSensitiveData(rows);
        const finalSchema = formatSchemaForAI(safeColumns);
        
        await connection.end();
        return { engine: 'mysql', schema: finalSchema };
    } 
    
    else if (engine === 'oracle') {
        return { message: "Oracle schema extraction pending implementation." };
    } 
    
    else {
        throw new Error("Unsupported database engine selected.");
    }
};

// --- Execute a safe query and return the rows ---
export const executeSafeQuery = async (query, dbConfig) => {
    const { engine, host, port, user, password, database } = dbConfig;

    if (engine === 'postgres') {
        // Create a temporary pool for this single execution
        const pool = new Pool({ host, port, user, password, database });
        try {
            const { rows } = await pool.query(query);
            return rows;
        } finally {
            await pool.end(); // Always close the connection!
        }
    } 
    
    else if (engine === 'mysql') {
        const connection = await mysql.createConnection({ host, port, user, password, database });
        try {
            // MySQL driver requires standard query() instead of execute() for arbitrary dynamic SQL
            const [rows] = await connection.query(query); 
            return rows;
        } finally {
            await connection.end();
        }
    } 
    
    else {
        throw new Error(`Engine ${engine} execution is not fully implemented yet.`);
    }
};