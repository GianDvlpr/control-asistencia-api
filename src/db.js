import sql from "mssql";

const config = {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    port: 49681,      
    options: {
        encrypt: process.env.SQL_ENCRYPT === "true",
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let pool;
export async function getPool() {
    if (pool) return pool;
    pool = await sql.connect(config);
    return pool;
}

export { sql };
