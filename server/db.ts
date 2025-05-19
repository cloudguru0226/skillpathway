import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add error handling for database connection
let pool: Pool;
try {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000, // 5 second timeout
    max: 20, // Maximum number of clients in the pool
  });
  
  // Add event listener for errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    // Don't exit the process, just log the error
    // process.exit(-1);
  });

  console.log("Database connection pool initialized successfully");
} catch (error) {
  console.error("Failed to initialize database connection pool:", error);
  // Create a minimal working pool for fallback
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });
  console.warn("Using fallback database connection configuration");
}

export { pool };
export const db = drizzle({ client: pool, schema });
