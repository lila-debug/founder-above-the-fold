import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Legacy supabase wrapper for gradual migration.
// Chainable query builder that executes a single SELECT on await.
export interface QueryResult<T = any> {
  data: T[] | null;
  error: any;
}

export const supabase: any = {
  from: <T = any>(table: string) => {
    let selectColumns = '*';
    const conditions: string[] = [];
    const params: any[] = [];
    let orderClause = '';
    let limitClause = '';
    const buildWhere = () => (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '');

    const builder: any = {
      select: (columns: string = '*') => {
        selectColumns = columns;
        return builder;
      },
      eq: (column: string, value: any) => {
        params.push(value);
        conditions.push(`${column} = $${params.length}`);
        return builder;
      },
      in: (column: string, values: any[]) => {
        const placeholders = values.map((v) => { params.push(v); return `$${params.length}`; }).join(', ');
        conditions.push(`${column} IN (${placeholders})`);
        return builder;
      },
      lte: (column: string, value: any) => {
        params.push(value);
        conditions.push(`${column} <= $${params.length}`);
        return builder;
      },
      order: (column: string, { ascending }: { ascending: boolean }) => {
        orderClause = ` ORDER BY ${column} ${ascending ? 'ASC' : 'DESC'}`;
        return builder;
      },
      limit: (n: number) => {
        limitClause = ` LIMIT ${n}`;
        return builder;
      },
      single: () => {
        limitClause = ' LIMIT 1';
        return builder;
      },
      insert: async (data: any) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const result = await pool.query(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        return { data: result.rows[0], error: null };
      },
      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
          const result = await pool.query(
            `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`,
            [...values, value]
          );
          return { data: result.rows[0], error: null };
        },
      }),
      delete: () => ({
        eq: async (column: string, value: any) => {
          await pool.query(`DELETE FROM ${table} WHERE ${column} = $1`, [value]);
          return { data: null, error: null };
        },
      }),
      then: async (resolve: any, reject: any) => {
        try {
          const result = await pool.query(
            `SELECT ${selectColumns} FROM ${table}${buildWhere()}${orderClause}${limitClause}`,
            params
          );
          limitClause === ' LIMIT 1'
            ? resolve({ data: result.rows[0] || null, error: null })
            : resolve({ data: result.rows, error: null });
        } catch (e: any) {
          reject({ data: null, error: e });
        }
      },
    };
    return builder;
  },
};

export const supabaseAnon = supabase;
export async function withRLS(email: string, operation: () => Promise<any>) {
  return operation();
}
export default supabase;
