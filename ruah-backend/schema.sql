CREATE DATABASE IF NOT EXISTS sistema_ruah;
USE sistema_ruah;

-- 1. Tabela de Setores
CREATE TABLE IF NOT EXISTS setores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    idade_min INT NOT NULL,
    idade_max INT NOT NULL
);

-- 2. Tabela de Usuários (Líderes e Admins)
-- Obs: a coluna "senha" guarda "salt:hash" (scrypt), nunca texto puro.
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('Admin', 'Lider de Setor') NOT NULL DEFAULT 'Lider de Setor',
    setor_id INT NULL,
    FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL
);

-- 3. Tabela de Membros (Jovens)
CREATE TABLE IF NOT EXISTS membros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE NOT NULL,
    setor_id INT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL
);

-- 4. Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    data_evento DATE NOT NULL,
    descricao TEXT
);

-- 5. Tabela de Presença (Chamada)
CREATE TABLE IF NOT EXISTS presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membro_id INT NOT NULL,
    evento_id INT NOT NULL,
    status ENUM('Presente', 'Ausente') NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_membro_evento (membro_id, evento_id),
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

    -- Inserções de teste unificadas
    INSERT INTO setores (nome, descricao, idade_min, idade_max) VALUES
    ('Distrito Central', 'Setor da Região Central', 12, 18),
    ('Setor Norte', 'Bairro Zona Norte', 12, 18);

    -- Senhas de teste (texto puro -> hash):
    --   admin@ruah.com  / admin123
    --   joao@ruah.com   / lider123
    --   mago@gmail.com  / mago123
    INSERT INTO usuarios (nome, email, senha, perfil, setor_id) VALUES
    ('Coordenador Geral', 'admin@ruah.com', '43b530ffd429c1f24f6a7530723fb4ad:81a5d855e8532d5663a01a22b47e5cd6137e3d967369b9dc4a76baa3c20cd0628f59bf0c5211053234a4f6c079f33b84fc210aba09d259bae385d0c52807e0ab', 'Admin', NULL),
    ('Líder João', 'joao@ruah.com', 'cea223a652c2740b5e0035057c59e9fc:0e570cb587d264117490f60364f7b330d3541a0694e84d96ba956e06db2eda2c804491b0e7ca33d6d1d6667a5dd9ebd893f32d903a8882ba055c0101008ad353', 'Lider de Setor', 1),
    ('caike, o mago', 'mago@gmail.com', '250bfb0465cc49fa1fedea4c076fa7b4:e61c0a189949b16f0202a547be814afbf8d5b38a03bbd0433af8330c798bea2735419b2b52f9c237391f210a30944e0f24d84c00fff487cd7d87bab5405224be', 'Lider de Setor', NULL);
