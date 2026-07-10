import mysql from 'mysql2/promise';

// Configurações do seu banco de dados local
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',         // Altere se o seu usuário do MySQL for diferente
  password: '',         // Coloque a senha do seu MySQL aqui
  database: 'sistema_ruah',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
