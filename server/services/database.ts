import sql from 'mssql';

interface DatabaseConfig {
  server: string;
  user: string;
  password: string;
  database: string;
  schema: string;
  trustServerCertificate: boolean;
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
  options: {
    encrypt: boolean;
    enableArithAbort: boolean;
  };
}

class DatabaseService {
  private pool: sql.ConnectionPool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      server: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWD || 'password',
      database: process.env.DB || 'dashboard',
      schema: process.env.SCHEMA || 'dbo',
      trustServerCertificate: true,
      pool: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: false,
        enableArithAbort: true,
      },
    };
  }

  async getConnection(): Promise<sql.Request> {
    if (!this.pool) {
      this.pool = new sql.ConnectionPool(this.config);
      await this.pool.connect();
      
      this.pool.on('error', (err: any) => {
        console.error('Database pool error:', err);
      });
    }

    return this.pool.request();
  }

  async executeQuery<T>(query: string, parameters?: Record<string, any>): Promise<T[]> {
    try {
      const request = await this.getConnection();
      
      // Add parameters if provided
      if (parameters) {
        Object.entries(parameters).forEach(([key, value]) => {
          if (typeof value === 'number') {
            request.input(key, sql.Int, value);
          } else {
            request.input(key, sql.NVarChar, value);
          }
        });
      }

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

export const databaseService = new DatabaseService();
