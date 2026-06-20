CREATE DATABASE IF NOT EXISTS sistema_ruah;
USE sistema_ruah;

-- 1. Tabela de Setores / Bairros (Configurações)
CREATE TABLE IF NOT EXISTS setores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    idade_min INT NOT NULL,
    idade_max INT NOT NULL
);

-- 2. Tabela de Usuários (Líderes e Admins para Autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('Admin', 'Lider de Setor') NOT NULL,
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

-- 5. Tabela Intermediária de Presença (Chamada)
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

-- Inserções básicas para teste inicial
INSERT INTO setores (nome, descricao, idade_min, idade_max) VALUES 
('Distrito Central', 'Setor da Região Central', 12, 18),
('Setor Norte', 'Bairro Zona Norte', 12, 18);

INSERT INTO usuarios (nome, email, senha, perfil, setor_id) VALUES 
('Coordenador Geral', 'admin@ruah.com', 'admin123', 'Admin', NULL),
('Líder João', 'joao@ruah.com', 'lider123', 'Lider de Setor', 1);

INSERT INTO membros (nome, email, telefone, data_nascimento, setor_id) VALUES 
('Jovem Lucas Silva', 'lucas@gmail.com', '21999999999', '2010-05-14', 1),
('Jovem Mariana Costa', 'mariana@gmail.com', '21988888888', '2009-11-22', 1),
('Jovem Pedro Sousa', 'pedro@gmail.com', '21977777777', '2011-02-10', 2);

INSERT INTO eventos (titulo, data_evento, descricao) VALUES 
('Encontro de Jovens RUAH', '2026-06-20', 'Reunião geral de sábado'),
('Ação Social Bairro', '2026-06-27', 'Distribuição de cestas');