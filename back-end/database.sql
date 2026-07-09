CREATE DATABASE IF NOT EXISTS sistema_ruah;
USE sistema_ruah;

CREATE TABLE jovens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    numero VARCHAR(255) NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

INSERT INTO usuarios (nome, email, senha)
VALUES ('caike, o mago', 'mago@gmail.com', 'mago123');