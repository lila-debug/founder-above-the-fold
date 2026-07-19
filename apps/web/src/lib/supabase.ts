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

// Handles UPDATE and DELETE with an arbitrary number of chained .eq() filters
// (e.g. .eq('id', x).eq('owner_id', y)) and an optional trailing .select().single().
class MutationBuilder {
  constructor(
    private table: string,
    private operation: 'update' | 'delete',
    private data: Record<string, any>,
    private whereClause: string = '',
    private whereValues: any[] = [],
    private returning: boolean = false
  ) {}

  eq(column: string, value: any) {
    const newWhere = this.whereClause ? `${this.whereClause} AND ${column} = $${this.whereValues.length + 1}` : `${column} = $1`;
    return new MutationBuilder(this.table, this.operation, this.data, newWhere, [...this.whereValues, value], this.returning);
  }

  select() {
    return new MutationBuilder(this.table, this.operation, this.data, this.whereClause, this.whereValues, true);
  }

  private buildQuery() {
    if (this.operation === 'delete') {
      const where = this.whereClause ? `WHERE ${this.whereClause}` : '';
      return { text: `DELETE FROM ${this.table} ${where}`.trim(), values: this.whereValues };
    }

    const keys = Object.keys(this.data);
    const values = Object.values(this.data);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
    // Where-clause placeholders were numbered from $1 assuming no SET values ahead of them — shift them.
    const shiftedWhere = this.whereClause.replace(/\$(\d+)/g, (_match, n) => `$${Number(n) + values.length}`);
    const where = shiftedWhere ? `WHERE ${shiftedWhere}` : '';
    const returning = this.returning ? 'RETURNING *' : '';
    return {
      text: `UPDATE ${this.table} SET ${setClause} ${where} ${returning}`.trim(),
      values: [...values, ...this.whereValues],
    };
  }

  async single() {
    const { text, values } = this.buildQuery();
    const result = await pool.query(text, values);
    return { data: result.rows[0] || null, error: null };
  }

  async then(resolve: any, reject?: any) {
    try {
      const { text, values } = this.buildQuery();
      const result = await pool.query(text, values);
      return resolve({ data: this.returning ? result.rows : null, error: null });
    } catch (err: any) {
      if (reject) return reject({ data: null, error: err });
      return resolve({ data: null, error: err });
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
    update: (data: any) => new MutationBuilder(table, 'update', data),
    delete: () => new MutationBuilder(table, 'delete', {}),
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
