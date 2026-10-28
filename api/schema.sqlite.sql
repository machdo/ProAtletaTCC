-- Versão SQLite do schema, usada só no servidor local de desenvolvimento.
CREATE TABLE IF NOT EXISTS instituicoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'escolinha',
  telefone TEXT, cidade TEXT, estado TEXT DEFAULT 'SP', site TEXT,
  verificada INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tokens (
  token_hash TEXT PRIMARY KEY,
  instituicao_id INTEGER NOT NULL REFERENCES instituicoes(id) ON DELETE CASCADE,
  expira_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS peneiras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instituicao_id INTEGER NOT NULL REFERENCES instituicoes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  esporte TEXT NOT NULL DEFAULT 'Futebol',
  categorias TEXT, posicoes TEXT,
  data_peneira TEXT NOT NULL, hora TEXT,
  endereco TEXT NOT NULL, cidade TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'SP',
  latitude REAL, longitude REAL, vagas INTEGER,
  gratuita INTEGER NOT NULL DEFAULT 1,
  link_inscricao TEXT, descricao TEXT,
  destaque INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'publicada',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
