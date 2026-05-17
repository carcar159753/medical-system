const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());

app.use(express.json({
  limit: "50mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "50mb"
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const tabelas = [
  "pacientes",
  "historico",
  "medicos",
  "vigilancias",
  "pediatrias",
  "obstetricias",
  "psicologias",
  "cirurgias"
];

async function iniciarBanco() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS historico (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS medicos (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vigilancias (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pediatrias (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS obstetricias (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS psicologias (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cirurgias (
        id TEXT PRIMARY KEY,
        dados JSONB NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Banco iniciado com sucesso");
  } catch (erro) {
    console.error("Erro ao iniciar banco:", erro);
  }
}

iniciarBanco();

app.get("/", (req, res) => {
  res.send("Backend hospitalar funcionando");
});

tabelas.forEach((tabela) => {

  app.get(`/api/${tabela}`, async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT *
        FROM ${tabela}
        ORDER BY criado_em DESC
      `);

      const dados = resultado.rows.map((r) => r.dados);

      res.json(dados);

    } catch (erro) {
      console.error(erro);
      res.status(500).json({
        erro: "Erro ao buscar dados"
      });
    }
  });

  app.post(`/api/${tabela}`, async (req, res) => {
    try {
      const dados = req.body;

      const id =
        dados.id ||
        Date.now().toString();

      await pool.query(
        `
          INSERT INTO ${tabela} (id, dados)
          VALUES ($1, $2)
        `,
        [
          id,
          dados
        ]
      );

      res.json({
        ...dados,
        id
      });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({
        erro: "Erro ao salvar"
      });
    }
  });

  app.put(`/api/${tabela}`, async (req, res) => {
    try {
      const lista = req.body;

      await pool.query(`DELETE FROM ${tabela}`);

      for (const item of lista) {
        await pool.query(
          `
            INSERT INTO ${tabela} (id, dados)
            VALUES ($1, $2)
          `,
          [
            item.id || Date.now().toString(),
            item
          ]
        );
      }

      res.json({
        sucesso: true
      });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({
        erro: "Erro ao atualizar"
      });
    }
  });

  app.delete(`/api/${tabela}/:id`, async (req, res) => {
    try {

      await pool.query(
        `
          DELETE FROM ${tabela}
          WHERE id = $1
        `,
        [
          req.params.id
        ]
      );

      res.json({
        sucesso: true
      });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({
        erro: "Erro ao apagar"
      });
    }
  });

});

app.get("/api/dashboard", async (req, res) => {
  try {

    const [
      pacientes,
      medicos,
      vigilancias,
      pediatrias,
      obstetricias,
      psicologias,
      cirurgias
    ] = await Promise.all([

      pool.query("SELECT dados FROM pacientes"),
      pool.query("SELECT dados FROM medicos"),
      pool.query("SELECT dados FROM vigilancias"),
      pool.query("SELECT dados FROM pediatrias"),
      pool.query("SELECT dados FROM obstetricias"),
      pool.query("SELECT dados FROM psicologias"),
      pool.query("SELECT dados FROM cirurgias")

    ]);

    res.json({
      totalPacientes: pacientes.rows.length,
      totalMedicos: medicos.rows.length,
      totalVigilancias: vigilancias.rows.length,
      totalPediatrias: pediatrias.rows.length,
      totalObstetricias: obstetricias.rows.length,
      totalPsicologias: psicologias.rows.length,
      totalCirurgias: cirurgias.rows.length
    });

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro dashboard"
    });
  }
});

const PORT =
  process.env.PORT ||
  10000;

app.listen(PORT, () => {
  console.log(`
========================================
 BACKEND HOSPITALAR ONLINE
 PORTA: ${PORT}
========================================
  `);
});