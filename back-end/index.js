const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_ruah'
});

// Rota de Cadastro
app.post('/cadastro', (req, res) => {
    const { nome, email, numero } = req.body;
    const query = 'INSERT INTO jovens (nome, email, numero) VALUES (?, ?, ?)';
    
    db.query(query, [nome, email, numero], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao cadastrar jovem' });
        }
        res.status(201).json({ mensagem: 'Jovem cadastrado com sucesso!' });
    });
});

// Rota de Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    
    db.query(query, [email, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor' });
        }
        if (results.length > 0) {
            res.status(200).json({ mensagem: 'Login bem-sucedido', usuario: results[0] });
        } else {
            res.status(401).json({ erro: 'Email ou senha incorretos' });
        }
    });
});

// Rota de Redefinir Senha
app.post('/redefinir-senha', (req, res) => {
    const { email, novaSenha } = req.body;
    const query = 'UPDATE usuarios SET senha = ? WHERE email = ?';
    
    db.query(query, [novaSenha, email], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor' });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ mensagem: 'Senha alterada com sucesso' });
        } else {
            res.status(404).json({ erro: 'Email não encontrado' });
        }
    });
});

// Rota para Listar Jovens
app.get('/jovens', (req, res) => {
    const query = 'SELECT * FROM jovens';

    db.query(query, (err, results) => {
        if (err) {
            console.error('ERRO AO LISTAR JOVENS:', err);
            return res.status(500).json({ erro: 'Erro ao buscar jovens' });
        }
        res.status(200).json(results);
    });
});

app.listen(3001, () => {
    console.log('Servidor RUAH rodando na porta 3001');
});