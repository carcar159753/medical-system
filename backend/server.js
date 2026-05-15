const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
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
  "psicologias"
];

async function criarTabelas() {
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
  `);

  console.log("Tabelas Supabase verificadas/criadas");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const nome = file.originalname
      .replace(ext, "")
      .replace(/[^\w\d-]/g, "_");

    cb(null, `${Date.now()}-${nome}${ext}`);
  }
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.json({
    status: "Backend Supabase online",
    port: PORT
  });
});

app.post(
  "/api/upload",
  upload.single("arquivo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          erro: "Nenhum arquivo enviado"
        });
      }

      const novo = {
        id: Date.now().toString(),
        pacienteId: req.body.pacienteId || "",
        pacienteNome: req.body.pacienteNome || "",
        tipo: req.body.tipo || "Arquivo",
        descricao: req.body.descricao || "",
        medico: req.body.medico || "",
        nomeOriginal: req.file.originalname,
        nomeArquivo: req.file.filename,
        caminho: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        tamanho: req.file.size,
        data: new Date().toLocaleString("pt-BR")
      };

      await pool.query(
        `
        INSERT INTO historico (id, dados)
        VALUES ($1, $2)
      `,
        [novo.id, novo]
      );

      res.json(novo);
    } catch (erro) {
      console.error(erro);

      res.status(500).json({
        erro: "Erro no upload"
      });
    }
  }
);

tabelas.forEach((tabela) => {
  app.get(`/api/${tabela}`, async (req, res) => {
    try {
      const resultado = await pool.query(
        `SELECT dados FROM ${tabela}`
      );

      res.json(resultado.rows.map((r) => r.dados));
    } catch (erro) {
      console.error(erro);

      res.status(500).json({
        erro: `Erro ao buscar ${tabela}`
      });
    }
  });

  app.post(`/api/${tabela}`, async (req, res) => {
    try {
      const dados = req.body;

      const id =
        dados.id ||
        dados.crm ||
        Date.now().toString();

      await pool.query(
        `
        INSERT INTO ${tabela} (id, dados)
        VALUES ($1, $2)
      `,
        [id, dados]
      );

      res.json(dados);
    } catch (erro) {
      console.error(erro);

      res.status(500).json({
        erro: `Erro ao salvar ${tabela}`
      });
    }
  });

  app.put(`/api/${tabela}`, async (req, res) => {
    try {
      const lista = req.body;

      await pool.query(`DELETE FROM ${tabela}`);

      for (const item of lista) {
        const id =
          item.id ||
          item.crm ||
          Date.now().toString();

        await pool.query(
          `
          INSERT INTO ${tabela} (id, dados)
          VALUES ($1, $2)
        `,
          [id, item]
        );
      }

      res.json({
        ok: true
      });
    } catch (erro) {
      console.error(erro);

      res.status(500).json({
        erro: `Erro ao atualizar ${tabela}`
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
        [req.params.id]
      );

      res.json({
        ok: true
      });
    } catch (erro) {
      console.error(erro);

      res.status(500).json({
        erro: `Erro ao apagar ${tabela}`
      });
    }
  });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const [
      pacientes,
      historico,
      medicos,
      vigilancias,
      pediatrias,
      obstetricias,
      psicologias
    ] = await Promise.all([
      pool.query("SELECT dados FROM pacientes"),
      pool.query("SELECT dados FROM historico"),
      pool.query("SELECT dados FROM medicos"),
      pool.query("SELECT dados FROM vigilancias"),
      pool.query("SELECT dados FROM pediatrias"),
      pool.query("SELECT dados FROM obstetricias"),
      pool.query("SELECT dados FROM psicologias")
    ]);

    res.json({
      totalPacientes: pacientes.rows.length,
      totalExames: historico.rows.length,
      totalMedicos: medicos.rows.length,
      totalVigilancias: vigilancias.rows.length,
      totalPediatrias: pediatrias.rows.length,
      totalObstetricias: obstetricias.rows.length,
      totalPsicologias: psicologias.rows.length
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro dashboard"
    });
  }
});

pool.connect()
  .then(async () => {
    console.log("Supabase conectado");

    await criarTabelas();

    app.listen(PORT, () => {
      console.log(
        `Backend rodando em http://localhost:${PORT}`
      );
    });
  })
  .catch((erro) => {
    console.error(
      "Erro ao conectar no Supabase:",
      erro
    );
  });