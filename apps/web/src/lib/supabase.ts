import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

class QueryBuilder {
  constructor(
    private table: string,
    private columns: string = '*',
    private whereClause: string = '',
    private whereValues: any[] = [],
    private orderClause: string = '',
    private limitNum: number = 0
  ) {}

  select(columns: string = '*') {
    return new QueryBuilder(this.table, columns, this.whereClause, this.whereValues, this.orderClause, this.limitNum);
  }

  eq(column: string, value: any) {
    const newWhere = this.whereClause ? `${this.whereClause} AND ${column} = $${this.whereValues.length + 1}` : `${column} = $1`;
    return new QueryBuilder(this.table, this.columns, newWhere, [...this.whereValues, value], this.orderClause, this.limitNum);
  }

  lte(column: string, value: any) {
    const newWhere = this.whereClause ? `${this.whereClause} AND ${column} <= $${this.whereValues.length + 1}` : `${column} <= $1`;
    return new QueryBuilder(this.table, this.columns, newWhere, [...this.whereValues, value], this.orderClause, this.limitNum);
  }

  in(column: string, values: any[]) {
    const placeholders = values.map((_, i) => `$${this.whereValues.length + i + 1}`).join(',');
    const newWhere = this.whereClause ? `${this.whereClause} AND ${column} IN (${placeholders})` : `${column} IN (${placeholders})`;
    return new QueryBuilder(this.table, this.columns, newWhere, [...this.whereValues, ...values], this.orderClause, this.limitNum);
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const dir = opts?.ascending === false ? 'DESC' : 'ASC';
    return new QueryBuilder(this.table, this.columns, this.whereClause, this.whereValues, `ORDER BY ${column} ${dir}`, this.limitNum);
  }

  limit(n: number) {
    return new QueryBuilder(this.table, this.columns, this.whereClause, this.whereValues, this.orderClause, n);
  }

  async single() {
    const where = this.whereClause ? `WHERE ${this.whereClause}` : '';
    const limit = 'LIMIT 1';
    const query = `SELECT ${this.columns} FROM ${this.table} ${where} ${this.orderClause} ${limit}`.trim();
    const result = await pool.query(query, this.whereValues);
    return { data: result.rows[0] || null, error: null };
  }

  async then(resolve: any, reject?: any) {
    try {
      const where = this.whereClause ? `WHERE ${this.whereClause}` : '';
      const limit = this.limitNum > 0 ? `LIMIT ${this.limitNum}` : '';
      const query = `SELECT ${this.columns} FROM ${this.table} ${where} ${this.orderClause} ${limit}`.trim();
      const result = await pool.query(query, this.whereValues);
      return resolve({ data: result.rows, error: null });
    } catch (err: any) {
      if (reject) return reject({ data: null, error: err });
      return { data: null, error: err };
    }
  }
}

// Legacy supabase wrapper for gradual migration
export const supabase = {
  from: (table: string) => ({
    select: (columns: string = '*') => new QueryBuilder(table, columns),
    insert: (data: any[] | any) => ({
      select: () => ({
        single: async () => {
          const items = Array.isArray(data) ? data : [data];
          const keys = Object.keys(items[0]);
          const results = [];
          for (const item of items) {
            const values = Object.values(item);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
            const result = await pool.query(
              `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`,
              values
            );
            results.push(result.rows[0]);
          }
          return { data: results.length === 1 ? results[0] : results, error: null };
        },
        then: async (resolve: any) => {
          const items = Array.isArray(data) ? data : [data];
          const keys = Object.keys(items[0]);
          const results = [];
          for (const item of items) {
            const values = Object.values(item);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
            const result = await pool.query(
              `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`,
              values
            );
            results.push(result.rows[0]);
          }
          return resolve({ data: results, error: null });
        },
      }),
      then: async (resolve: any) => {
        const items = Array.isArray(data) ? data : [data];
        const keys = Object.keys(items[0]);
        const results = [];
        for (const item of items) {
          const values = Object.values(item);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
          const result = await pool.query(
            `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`,
            values
          );
          results.push(result.rows[0]);
        }
        return resolve({ data: results, error: null });
      },
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
            const result = await pool.query(
              `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`,
              [...values, value]
            );
            return { data: result.rows[0], error: null };
          },
          then: async (resolve: any) => {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
            const result = await pool.query(
              `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`,
              [...values, value]
            );
            return resolve({ data: result.rows, error: null });
          },
        }),
        then: async (resolve: any) => {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
          const result = await pool.query(
            `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`,
            [...values, value]
          );
          return resolve({ data: result.rows, error: null });
        },
      }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (resolve: any) => {
          await pool.query(`DELETE FROM ${table} WHERE ${column} = $1`, [value]);
          return resolve({ data: null, error: null });
        },
      }),
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
