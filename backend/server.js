const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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

    CREATE TABLE IF NOT EXISTS arquivos (
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
  `);

  const medicos = await pool.query("SELECT * FROM medicos");

  if (medicos.rows.length === 0) {
    const admin = {
      id: "123456",
      crm: "123456",
      senha: "admin",
      nome: "Administrador",
      cargo: "Diretor Médico",
      admin: true
    };

    await pool.query(
      "INSERT INTO medicos (id, dados) VALUES ($1, $2)",
      [admin.id, admin]
    );
  }

  console.log("Tabelas Supabase verificadas/criadas");
}

pool.connect()
  .then(() => {
    console.log("Supabase conectado");
    criarTabelas();
  })
  .catch((err) => {
    console.log("Erro ao conectar no Supabase:", err.message);
  });

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

    const baseName = file.originalname
      .replace(ext, "")
      .replace(/[^\w\d-]/g, "_");

    cb(null, `${Date.now()}-${baseName}${ext}`);
  }
});

const upload = multer({ storage });

const colecoes = [
  "pacientes",
  "historico",
  "arquivos",
  "medicos",
  "vigilancias",
  "pediatrias",
  "obstetricias"
];

function validarColecao(colecao) {
  return colecoes.includes(colecao);
}

app.get("/", (req, res) => {
  res.json({
    status: "Backend Supabase online",
    port: PORT
  });
});

/* LISTAR COLEÇÃO */

app.get("/api/:colecao", async (req, res) => {
  try {
    const { colecao } = req.params;

    if (!validarColecao(colecao)) {
      return res.status(404).json({
        erro: "Coleção não existe"
      });
    }

    const resultado = await pool.query(
      `SELECT dados FROM ${colecao} ORDER BY criado_em DESC`
    );

    res.json(resultado.rows.map((r) => r.dados));
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao buscar dados",
      detalhe: erro.message
    });
  }
});

/* ADICIONAR ITEM */

app.post("/api/:colecao", async (req, res) => {
  try {
    const { colecao } = req.params;

    if (!validarColecao(colecao)) {
      return res.status(404).json({
        erro: "Coleção não existe"
      });
    }

    const novo = {
      id: req.body.id || Date.now().toString(),
      ...req.body
    };

    await pool.query(
      `INSERT INTO ${colecao} (id, dados)
       VALUES ($1, $2)
       ON CONFLICT (id)
       DO UPDATE SET dados = EXCLUDED.dados`,
      [novo.id, novo]
    );

    res.json(novo);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao salvar dados",
      detalhe: erro.message
    });
  }
});

/* SUBSTITUIR COLEÇÃO INTEIRA */

app.put("/api/:colecao", async (req, res) => {
  try {
    const { colecao } = req.params;

    if (!validarColecao(colecao)) {
      return res.status(404).json({
        erro: "Coleção não existe"
      });
    }

    const lista = Array.isArray(req.body) ? req.body : [];

    await pool.query(`DELETE FROM ${colecao}`);

    for (const item of lista) {
      const id = item.id || Date.now().toString();

      await pool.query(
        `INSERT INTO ${colecao} (id, dados)
         VALUES ($1, $2)
         ON CONFLICT (id)
         DO UPDATE SET dados = EXCLUDED.dados`,
        [id, { ...item, id }]
      );
    }

    res.json({
      ok: true,
      colecao,
      total: lista.length
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao atualizar coleção",
      detalhe: erro.message
    });
  }
});

/* DELETAR ITEM */

app.delete("/api/:colecao/:id", async (req, res) => {
  try {
    const { colecao, id } = req.params;

    if (!validarColecao(colecao)) {
      return res.status(404).json({
        erro: "Coleção não existe"
      });
    }

    await pool.query(
      `DELETE FROM ${colecao} WHERE id = $1`,
      [id]
    );

    res.json({
      ok: true,
      colecao,
      id
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao deletar item",
      detalhe: erro.message
    });
  }
});

/* UPLOAD */

app.post("/api/upload", upload.single("arquivo"), async (req, res) => {
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
      `INSERT INTO arquivos (id, dados)
       VALUES ($1, $2)`,
      [novo.id, novo]
    );

    res.json(novo);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao enviar arquivo",
      detalhe: erro.message
    });
  }
});

/* DASHBOARD */

app.get("/api/dashboard/resumo", async (req, res) => {
  try {
    const [
      pacientes,
      historico,
      arquivos,
      medicos,
      vigilancias,
      pediatrias,
      obstetricias
    ] = await Promise.all([
      pool.query("SELECT dados FROM pacientes"),
      pool.query("SELECT dados FROM historico"),
      pool.query("SELECT dados FROM arquivos"),
      pool.query("SELECT dados FROM medicos"),
      pool.query("SELECT dados FROM vigilancias"),
      pool.query("SELECT dados FROM pediatrias"),
      pool.query("SELECT dados FROM obstetricias")
    ]);

    const mapDados = (resultado) =>
      resultado.rows.map((r) => r.dados);

    const contar = (lista, campo) => {
      const obj = {};

      lista.forEach((item) => {
        const chave = item[campo] || "Não informado";
        obj[chave] = (obj[chave] || 0) + 1;
      });

      return Object.entries(obj).map(([nome, total]) => ({
        nome,
        total
      }));
    };

    const listaPacientes = mapDados(pacientes);
    const listaHistorico = mapDados(historico);
    const listaArquivos = mapDados(arquivos);

    res.json({
      totalPacientes: listaPacientes.length,
      totalExames: listaHistorico.length,
      totalArquivos: listaArquivos.length,
      totalMedicos: medicos.rows.length,
      totalVigilancias: vigilancias.rows.length,
      totalPediatrias: pediatrias.rows.length,
      totalObstetricias: obstetricias.rows.length,
      pacientesPorMotivo: contar(listaPacientes, "motivo"),
      pacientesPorStatus: contar(listaPacientes, "status"),
      examesPorTipo: contar(listaHistorico, "tipo"),
      arquivosPorTipo: contar(listaArquivos, "tipo")
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro no dashboard",
      detalhe: erro.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});