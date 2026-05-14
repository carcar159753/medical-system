import { useEffect, useState } from "react";
import api from "../services/api";

function Barra({ nome, total, max }) {
  const largura = max > 0 ? (total / max) * 100 : 0;

  return (
    <div className="chart-row">
      <div className="chart-label">
        <span>{nome}</span>
        <strong>{total}</strong>
      </div>

      <div className="chart-bar-bg">
        <div
          className="chart-bar-fill"
          style={{
            width: `${largura}%`
          }}
        />
      </div>
    </div>
  );
}

function GraficoBarras({ titulo, dados }) {
  const max = Math.max(...dados.map((d) => d.total), 0);

  return (
    <div className="chart-card">
      <h3>{titulo}</h3>

      {dados.length === 0 ? (
        <p className="chart-empty">
          Sem dados ainda
        </p>
      ) : (
        dados.map((item) => (
          <Barra
            key={item.nome}
            nome={item.nome}
            total={item.total}
            max={max}
          />
        ))
      )}
    </div>
  );
}

export default function DashboardGraficos() {
  const [dados, setDados] = useState({
    totalPacientes: 0,
    totalExames: 0,
    totalArquivos: 0,
    pacientesPorMotivo: [],
    pacientesPorStatus: [],
    examesPorTipo: [],
    arquivosPorTipo: []
  });

  const carregarDashboard = async () => {
    const response = await api.get("/api/dashboard");
    setDados(response.data);
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  return (
    <div>
      <h2>Dashboard com Gráficos</h2>

      <button
        className="exam-btn"
        onClick={carregarDashboard}
      >
        Atualizar Gráficos
      </button>

      <div className="cards">
        <div className="card">
          <h3>Pacientes</h3>
          <span>{dados.totalPacientes}</span>
        </div>

        <div className="card">
          <h3>Exames</h3>
          <span>{dados.totalExames}</span>
        </div>

        <div className="card">
          <h3>Arquivos</h3>
          <span>{dados.totalArquivos}</span>
        </div>
      </div>

      <div className="charts-grid">
        <GraficoBarras
          titulo="Pacientes por Motivo"
          dados={dados.pacientesPorMotivo}
        />

        <GraficoBarras
          titulo="Pacientes por Status"
          dados={dados.pacientesPorStatus}
        />

        <GraficoBarras
          titulo="Exames por Tipo"
          dados={dados.examesPorTipo}
        />

        <GraficoBarras
          titulo="Arquivos por Tipo"
          dados={dados.arquivosPorTipo}
        />
      </div>
    </div>
  );
}