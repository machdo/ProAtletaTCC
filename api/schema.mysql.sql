-- Tabelas da área de instituições e peneiras do ProAtleta (MySQL / MariaDB da Hostinger).
CREATE TABLE IF NOT EXISTS instituicoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo VARCHAR(40) NOT NULL DEFAULT 'escolinha',
  telefone VARCHAR(30),
  cidade VARCHAR(80),
  estado CHAR(2) DEFAULT 'SP',
  site VARCHAR(255),
  verificada TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tokens (
  token_hash CHAR(64) PRIMARY KEY,
  instituicao_id INT NOT NULL,
  expira_em DATETIME NOT NULL,
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS peneiras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instituicao_id INT NOT NULL,
  titulo VARCHAR(140) NOT NULL,
  esporte VARCHAR(40) NOT NULL DEFAULT 'Futebol',
  categorias VARCHAR(140),
  posicoes VARCHAR(200),
  data_peneira DATE NOT NULL,
  hora TIME NULL,
  endereco VARCHAR(255) NOT NULL,
  cidade VARCHAR(80) NOT NULL,
  estado CHAR(2) NOT NULL DEFAULT 'SP',
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  vagas INT NULL,
  gratuita TINYINT(1) NOT NULL DEFAULT 1,
  link_inscricao VARCHAR(255),
  descricao TEXT,
  destaque TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'publicada',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_peneiras_data (data_peneira),
  INDEX idx_peneiras_cidade (cidade),
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4;
