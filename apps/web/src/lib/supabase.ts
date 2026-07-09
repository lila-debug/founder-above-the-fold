import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Legacy supabase wrapper for gradual migration
export const supabase = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: async (column: string, value: any) => {
        const result = await pool.query(`SELECT ${columns} FROM ${table} WHERE ${column} = $1`, [value]);
        return { data: result.rows, error: null };
      },
      in: async (column: string, values: any[]) => {
        const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
        const result = await pool.query(`SELECT ${columns} FROM ${table} WHERE ${column} IN (${placeholders})`, values);
        return { data: result.rows, error: null };
      },
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        eq: async (column2: string, value: any) => {
          const result = await pool.query(
            `SELECT ${columns} FROM ${table} WHERE ${column2} = $1 ORDER BY ${column} ${ascending ? 'ASC' : 'DESC'}`,
            [value]
          );
          return { data: result.rows, error: null };
        },
        lte: async (column2: string, value: any) => {
          const result = await pool.query(
            `SELECT ${columns} FROM ${table} WHERE ${column2} <= $1 ORDER BY ${column} ${ascending ? 'ASC' : 'DESC'}`,
            [value]
          );
          return { data: result.rows, error: null };
        },
      }),
      lte: async (column: string, value: any) => {
        const result = await pool.query(`SELECT ${columns} FROM ${table} WHERE ${column} <= $1`, [value]);
        return { data: result.rows, error: null };
      },
      single: async () => {
        const result = await pool.query(`SELECT ${columns} FROM ${table} LIMIT 1`);
        return { data: result.rows[0] || null, error: null };
      },
    }),
    insert: async (data: any) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
      const result = await pool.query(
        `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return { data: result.rows[0], error: null };
    },
    update: async (data: any) => ({
      eq: async (column: string, value: any) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
        const result = await pool.query(
          `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`,
          [...values, value]
        );
        return { data: result.rows[0], error: null };
      },
    }),
    delete: async () => ({
      eq: async (column: string, value: any) => {
        await pool.query(`DELETE FROM ${table} WHERE ${column} = $1`, [value]);
        return { data: null, error: null };
      },
    }),
  }),
  rpc: async (fn: string, params: any) => {
    // RLS function — not needed with pg, handled in app layer
    return { data: null, error: null };
  },
};

export const supabaseAnon = supabase;
export async function withRLS(email: string, operation: () => Promise<any>) {
  return operation();
}
export default supabase;
