import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import db from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

// ==========================================
// 0. SENHAS (hash com scrypt, nativo do Node)
// ==========================================

function hashPassword(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verificarSenha(senha, senhaSalva) {
  const [salt, hashSalvo] = senhaSalva.split(':');
  if (!salt || !hashSalvo) return false; // formato inesperado (ex: senha antiga em texto puro)
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  // timingSafeEqual evita vazar informação por tempo de resposta
  const bufA = Buffer.from(hash, 'hex');
  const bufB = Buffer.from(hashSalvo, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// ==========================================
// 1. AUTENTICAÇÃO & USUÁRIOS
// ==========================================

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0 || !verificarSenha(senha, rows[0].senha)) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const { senha: _omitida, ...usuarioSemSenha } = rows[0];
    res.status(200).json({ mensagem: 'Login bem-sucedido', usuario: usuarioSemSenha });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno no servidor ao tentar logar.' });
  }
});

// Rota de Redefinir Senha
app.post('/api/redefinir-senha', async (req, res) => {
  const { email, novaSenha } = req.body;

  if (!email || !novaSenha) {
    return res.status(400).json({ erro: 'Email e nova senha são obrigatórios.' });
  }

  try {
    const senhaComHash = hashPassword(novaSenha);
    const [result] = await db.query('UPDATE usuarios SET senha = ? WHERE email = ?', [senhaComHash, email]);

    if (result.affectedRows > 0) {
      res.status(200).json({ mensagem: 'Senha alterada com sucesso' });
    } else {
      res.status(404).json({ erro: 'Email não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno no servidor ao redefinir senha.' });
  }
});

// ==========================================
// 2. MEMBROS (JOVENS)
// ==========================================


// 1. Rota para LISTAR todos os jovens
app.get('/api/jovens', async (req, res) => {
    try {
        const query = 'SELECT * FROM membros ORDER BY id DESC';
        const [results] = await db.query(query); // <-- Usando await em vez de callback
        
        res.status(200).json(results);
    } catch (error) {
        console.error("Erro na rota GET /api/jovens:", error);
        res.status(500).json({ erro: 'Erro ao buscar a lista de jovens' });
    }
});
//ROTA: Buscar jovem específico por email
app.get('/api/busca-jovem', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ erro: 'Email não fornecido.' });

    try {
        const [rows] = await db.query('SELECT * FROM membros WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Nenhum jovem encontrado com este email.' });
        }
        res.status(200).json(rows[0]); // Retorna os dados do jovem
    } catch (error) {
        console.error("Erro na busca:", error);
        res.status(500).json({ erro: 'Erro interno ao buscar jovem.' });
    }
});

// 2. Rota para DELETAR um jovem específico pelo ID
app.delete('/api/jovens/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = 'DELETE FROM membros WHERE id = ?';
        await db.query(query, [id]); // <-- Usando await
        
        res.status(200).json({ mensagem: 'Jovem removido com sucesso!' });
      } catch (error) {
        console.error("Erro na rota DELETE /api/jovens:", error);
        res.status(500).json({ erro: 'Erro ao deletar o jovem' });
    }
});

// 3. Rota para EDITAR os dados de um jovem pelo ID
app.put('/api/jovens/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, numero } = req.body;
    
    try {
        const query = 'UPDATE membros SET nome = ?, email = ?, telefone = ? WHERE id = ?';
        await db.query(query, [nome, email, numero, id]); // <-- Usando await
        
        res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
    } catch (error) {
        console.error("Erro na rota PUT /api/jovens:", error);
        res.status(500).json({ erro: 'Erro ao atualizar os dados' });
    }
});
// 4. Rota para CADASTRAR um novo jovem
app.post('/api/jovens', async (req, res) => {
    // Recebe as variáveis exatas que o frontend está enviando
    const { nome, email, numero } = req.body;
    
    if (!nome || !email || !numero) {
        return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        // Insere na tabela membros. 
        // O "numero" do frontend é salvo na coluna "telefone" do banco.
        // Adicionei CURDATE() para preencher a data_nascimento, caso seja obrigatória no seu banco
        const query = 'INSERT INTO membros (nome, email, telefone, data_nascimento) VALUES (?, ?, ?, CURDATE())';
        
        await db.query(query, [nome, email, numero]); 
        
        res.status(201).json({ mensagem: 'Cadastrado com sucesso!' });
    } catch (error) {
        console.error("Erro na rota POST /api/jovens:", error);
        
        // Verifica se o e-mail já existe no banco
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
        }
        res.status(500).json({ erro: 'Erro interno ao tentar cadastrar.' });
    }
});
// ==========================================
// 3. EVENTOS, CHAMADAS & RELATÓRIOS
// ==========================================

// Listar eventos para a chamada
app.get('/api/eventos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, titulo FROM eventos ORDER BY data_evento DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar eventos.' });
  }
});

// Registrar a Chamada (Presença)
app.post('/api/chamada', async (req, res) => {
  const { evento_id, listaPresenca } = req.body;

  if (!evento_id || !Array.isArray(listaPresenca)) {
    return res.status(400).json({ error: 'Dados da chamada inválidos.' });
  }

  try {
    const query = 'INSERT INTO presencas (membro_id, evento_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?';

    for (const item of listaPresenca) {
      await db.query(query, [item.membro_id, evento_id, item.status, item.status]);
    }

    res.json({ message: 'Chamada registrada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar a lista de chamada.' });
  }
});

// Relatório de frequência com alertas
app.get('/api/relatorios/frequencia', async (req, res) => {
  try {
    const sql = `
      SELECT m.id, m.nome,
             COUNT(CASE WHEN p.status = 'Presente' THEN 1 END) as presencas,
             COUNT(p.id) as total_eventos
      FROM membros m
      LEFT JOIN presencas p ON m.id = p.membro_id
      GROUP BY m.id;
    `;

    const [rows] = await db.query(sql);

    const dadosProcessados = rows.map(jovem => {
      const taxaFrequencia = jovem.total_eventos > 0 ? (jovem.presencas / jovem.total_eventos) * 100 : 100;
      return {
        id: jovem.id,
        nome: jovem.nome,
        frequencia: `${taxaFrequencia.toFixed(0)}%`,
        alerta: taxaFrequencia < 50
      };
    });

    res.json(dadosProcessados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
});

// ==========================================
// 4. CONFIGURAÇÕES DE SETORES
// ==========================================

app.get('/api/config/setores', async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT id, nome, idade_min, idade_max FROM setores';
    let params = [];

    if (search) {
      query += ' WHERE nome LIKE ?';
      params.push(`%${search}%`);
    }

    const [setores] = await db.query(query, params);
    res.json(setores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar setores.' });
  }
});

app.post('/api/config/setores', async (req, res) => {
  const { nome, descricao, idade_min, idade_max } = req.body;

  if (!nome || idade_min === undefined || idade_max === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    await db.query(
      'INSERT INTO setores (nome, descricao, idade_min, idade_max) VALUES (?, ?, ?, ?)',
      [nome, descricao || '', idade_min, idade_max]
    );
    res.status(201).json({ message: 'Setor configurado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar novo setor.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Unificado do Projeto RUAH rodando em http://localhost:${PORT}`);
});
