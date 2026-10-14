CREATE TABLE usuario (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(120) NOT NULL,
  email     VARCHAR(150) UNIQUE NOT NULL,
  tipo      VARCHAR(20)  NOT NULL CHECK (tipo IN ('doador', 'familia', 'ong')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE oferta (
  id         SERIAL PRIMARY KEY,
  doador_id  INT NOT NULL REFERENCES usuario(id),
  alimento   VARCHAR(120) NOT NULL,
  quantidade VARCHAR(50)  NOT NULL,
  validade   DATE NOT NULL,
  status     VARCHAR(20)  NOT NULL DEFAULT 'disponivel'
);

CREATE TABLE reserva (
  id            SERIAL PRIMARY KEY,
  oferta_id     INT NOT NULL REFERENCES oferta(id),
  receptor_id   INT NOT NULL REFERENCES usuario(id),
  data_retirada TIMESTAMP,
  status        VARCHAR(20) NOT NULL DEFAULT 'pendente'
);