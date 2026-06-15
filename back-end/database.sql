CREATE DATABASE sistema_ruah;
USE sistema_ruah;

CREATE TABLE jovens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    numero VARCHAR(255) NOT NULL
);

CREATE TABLE `sistema_ruah`.`jovens` (
    `id` INT NOT NULL AUTO_INCREMENT , 
    `nome` VARCHAR(255) NOT NULL , 
    `email` VARCHAR(255) NOT NULL , 
    `numero` VARCHAR(255) NOT NULL , 
    PRIMARY KEY (`id`), 
    UNIQUE (`email`)) ENGINE = InnoDB;

    INSERT INTO `usuarios` 
    (`id`, `nome`, `email`, `senha`) 
    VALUES (NULL, 'caike, o mago', 'mago@gmail.com', 'mago123');