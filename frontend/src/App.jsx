import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

import UploadArquivos from "./components/UploadArquivos";
import DashboardGraficos from "./components/DashboardGraficos";
import { gerarPDFPaciente } from "./utils/pdfHospital";
import { baixarCarteirinhaPDF } from "./utils/carteirinhaPDF";
import { baixarAlvaraPDF } from "./utils/alvaraPDF";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const examesMasculinos = [
  "Hemograma Completo",
  "Série Vermelha",
  "Série Branca",
  "Hemoglobina Glicada",
  "ECG",
  "Tipagem Sanguínea",
  "Função Renal",
  "Função Hepática"
];

const examesFemininos = [
  ...examesMasculinos,
  "Beta HCG",
  "Avaliação Ginecológica"
];

const pacienteVazio = {
  id: "",
  nome: "",
  idade: "",
  telefone: "",
  sexo: "",
  sangue: "",
  altura: "",
  peso: "",
  motivo: "",
  observacoes: "",
  status: "Em Atendimento"
};

const questionarioFemininoVazio = {
  relacaoRecente: "",
  usouPreservativo: "",
  menstruacaoAtrasou: "",
  diasAtraso: "",
  enjoo: "",
  tontura: "",
  dorAbdominal: "",
  sangramento: "",
  usaAnticoncepcional: "",
  observacoes: ""
};

const vigilanciaVazia = {
  comercio: "",
  responsavel: "",
  proprietario: "",
  documento: "",
  telefone: "",
  endereco: "",
  dataAbertura: "",
  validadeAlvara: "",
  higiene: "",
  alvara: "",
  validadeProdutos: "",
  manipulacao: "",
  situacao: "",
  observacoes: "",
  statusAlvara: "Regular"
};

const pediatriaVazia = {
  crianca: "",
  idade: "",
  responsavel: "",
  cpfResponsavel: "",
  nascimento: "",
  peso: "",
  altura: "",
  temperatura: "",
  alergias: "",
  sintomas: "",
  conduta: "",
  observacoes: "",
  carteiraVacinas: []
};

const vacinaVazia = {
  nome: "",
  dose: "",
  lote: "",
  aplicadaEm: "",
  retornoDias: "",
  observacoes: ""
};

const vacinasPadrao = [
  "BCG",
  "Hepatite B",
  "Pentavalente",
  "Poliomielite",
  "Rotavírus",
  "Pneumocócica",
  "Meningocócica",
  "Febre Amarela",
  "Tríplice Viral",
  "Tetraviral",
  "DTP",
  "Influenza",
  "COVID-19",
  "HPV",
  "Outra"
];

const obstetriciaVazia = {
  paciente: "",
  idadeGestacional: "",
  pressao: "",
  batimentosBebe: "",
  movimentosFetais: "",
  contracoes: "",
  riscoGestacional: "",
  tipoParto: "",
  observacoes: ""
};

export default function App() {
  const assinaturaRef = useRef(null);

  const [assinatura, setAssinatura] = useState("");
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  const [crm, setCrm] = useState("");
  const [senha, setSenha] = useState("");

  const [pagina, setPagina] = useState("dashboard");
  const [pesquisaPaciente, setPesquisaPaciente] = useState("");

  const [medicos, setMedicos] = useState([
    {
      crm: "123456",
      senha: "admin",
      nome: "Administrador",
      cargo: "Diretor Médico",
      admin: true
    }
  ]);

  const [novoMedico, setNovoMedico] = useState({
    nome: "",
    crm: "",
    senha: "",
    cargo: "Médico",
    admin: false
  });

  const [pacientes, setPacientes] = useState([]);
  const [pacienteAtual, setPacienteAtual] = useState(pacienteVazio);
  const [historico, setHistorico] = useState([]);

  const [questionarioFeminino, setQuestionarioFeminino] =
    useState(questionarioFemininoVazio);

  const [vigilancias, setVigilancias] = useState([]);
  const [vigilanciaAtual, setVigilanciaAtual] =
    useState(vigilanciaVazia);

  const [pediatrias, setPediatrias] = useState([]);
  const [pediatriaAtual, setPediatriaAtual] =
    useState(pediatriaVazia);

  const [vacinaAtual, setVacinaAtual] =
    useState(vacinaVazia);

  const [obstetricias, setObstetricias] = useState([]);
  const [obstetriciaAtual, setObstetriciaAtual] =
    useState(obstetriciaVazia);

  const apiGet = async (colecao) => {
    const resposta = await fetch(`${API_URL}/api/${colecao}`);

    if (!resposta.ok) {
      throw new Error(`Erro ao carregar ${colecao}`);
    }

    return resposta.json();
  };

  const apiPost = async (colecao, dados) => {
    const resposta = await fetch(`${API_URL}/api/${colecao}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao salvar ${colecao}`);
    }

    return resposta.json();
  };

  const apiPut = async (colecao, dados) => {
    const resposta = await fetch(`${API_URL}/api/${colecao}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao atualizar ${colecao}`);
    }

    return resposta.json();
  };

  const apiDelete = async (colecao, id) => {
    const resposta = await fetch(`${API_URL}/api/${colecao}/${id}`, {
      method: "DELETE"
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao apagar ${colecao}`);
    }

    return resposta.json();
  };

  const carregarTudo = async () => {
    try {
      const [
        pacientesDB,
        historicoDB,
        medicosDB,
        vigilanciasDB,
        pediatriasDB,
        obstetriciasDB
      ] = await Promise.all([
        apiGet("pacientes"),
        apiGet("historico"),
        apiGet("medicos"),
        apiGet("vigilancias"),
        apiGet("pediatrias"),
        apiGet("obstetricias")
      ]);

      setPacientes(pacientesDB || []);
      setHistorico(historicoDB || []);
      setMedicos(
        medicosDB && medicosDB.length > 0
          ? medicosDB
          : [
              {
                crm: "123456",
                senha: "admin",
                nome: "Administrador",
                cargo: "Diretor Médico",
                admin: true
              }
            ]
      );
      setVigilancias(vigilanciasDB || []);
      setPediatrias(pediatriasDB || []);
      setObstetricias(obstetriciasDB || []);
    } catch (erro) {
      console.error(erro);
      alert("Erro ao conectar com o backend/Supabase. Verifique se o backend está ligado.");
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const login = () => {
    const medico = medicos.find(
      (m) => m.crm === crm && m.senha === senha
    );

    if (!medico) {
      return alert("CRM ou senha inválidos");
    }

    setUsuarioAtual(medico);
  };

  const salvarAssinatura = () => {
    if (!assinaturaRef.current || assinaturaRef.current.isEmpty()) {
      return alert("Desenhe a assinatura primeiro");
    }

    const assinaturaBase64 = assinaturaRef.current.toDataURL("image/png");
    setAssinatura(assinaturaBase64);
    alert("Assinatura salva");
  };

  const limparAssinatura = () => {
    if (assinaturaRef.current) {
      assinaturaRef.current.clear();
    }

    setAssinatura("");
  };

  const salvarPaciente = async () => {
    if (!pacienteAtual.nome || !pacienteAtual.id || !pacienteAtual.sexo) {
      return alert("Preencha nome, ID e sexo do paciente");
    }

    if (pacientes.some((p) => p.id === pacienteAtual.id)) {
      return alert("Já existe um paciente com esse ID");
    }

    const novoPaciente = {
      ...pacienteAtual,
      medicoResponsavel: usuarioAtual.nome,
      crmResponsavel: usuarioAtual.crm,
      assinatura,
      criadoEm: new Date().toLocaleString()
    };

    try {
      const salvo = await apiPost("pacientes", novoPaciente);

      setPacientes([salvo, ...pacientes]);
      setPacienteAtual(pacienteVazio);
      setQuestionarioFeminino(questionarioFemininoVazio);
      limparAssinatura();

      alert("Paciente salvo com sucesso");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar paciente no banco");
    }
  };

const apagarPaciente = (id) => {
    if (!window.confirm("Deseja apagar este paciente?")) return;
    setPacientes(pacientes.filter((p) => p.id !== id));
  };

  const apagarHistorico = async (id) => {
    if (!window.confirm("Deseja apagar este exame?")) return;

    try {
      await apiDelete("historico", id);
      setHistorico(historico.filter((h) => String(h.id) !== String(id)));
    } catch (erro) {
      console.error(erro);
      alert("Erro ao apagar exame");
    }
  };

const criarMedico = () => {
    if (!novoMedico.nome || !novoMedico.crm || !novoMedico.senha) {
      return alert("Preencha todos os campos");
    }

    if (medicos.some((m) => m.crm === novoMedico.crm)) {
      return alert("Já existe médico com esse CRM");
    }

    setMedicos([...medicos, novoMedico]);

    setNovoMedico({
      nome: "",
      crm: "",
      senha: "",
      cargo: "Médico",
      admin: false
    });

    alert("Médico criado");
  };

  const apagarMedico = async (crmMedico) => {
    if (crmMedico === "123456") {
      return alert("O administrador padrão não pode ser apagado");
    }

    if (!window.confirm("Deseja apagar este médico?")) return;

    try {
      await apiDelete("medicos", crmMedico);
      setMedicos(medicos.filter((m) => m.crm !== crmMedico));
    } catch (erro) {
      console.error(erro);
      alert("Erro ao apagar médico");
    }
  };

const gerarNumero = (min, max, casas = 1) => {
    return (Math.random() * (max - min) + min).toFixed(casas);
  };

  const calcularVereditoFeminino = () => {
    let pontos = 0;
    const motivos = [];

    if (questionarioFeminino.relacaoRecente === "Sim") {
      pontos += 2;
      motivos.push("relação recente");
    }

    if (questionarioFeminino.usouPreservativo === "Não") {
      pontos += 2;
      motivos.push("não usou preservativo");
    }

    if (questionarioFeminino.menstruacaoAtrasou === "Sim") {
      pontos += 3;
      motivos.push("menstruação atrasada");
    }

    if (Number(questionarioFeminino.diasAtraso) >= 7) {
      pontos += 2;
      motivos.push("atraso maior ou igual a 7 dias");
    }

    if (questionarioFeminino.enjoo === "Sim") {
      pontos += 1;
      motivos.push("enjoo");
    }

    if (questionarioFeminino.tontura === "Sim") {
      pontos += 1;
      motivos.push("tontura");
    }

    if (questionarioFeminino.dorAbdominal === "Sim") {
      pontos += 1;
      motivos.push("dor abdominal");
    }

    if (questionarioFeminino.sangramento === "Sim") {
      pontos += 2;
      motivos.push("sangramento");
    }

    let veredito = "Baixa suspeita gestacional no RP";
    let conduta = "Orientar acompanhamento se os sintomas continuarem.";

    if (pontos >= 5 && pontos < 8) {
      veredito = "Suspeita moderada de gravidez no RP";
      conduta = "Recomendar Beta HCG e avaliação obstétrica.";
    }

    if (pontos >= 8) {
      veredito = "Alta suspeita de gravidez no RP";
      conduta = "Encaminhar para obstetrícia e confirmar com exame.";
    }

    return {
      pontos,
      veredito,
      conduta,
      resumo: motivos.length ? motivos.join(", ") : "sem sinais relevantes"
    };
  };

  const gerarResultadoExame = (tipo, paciente, vereditoFeminino) => {
    if (tipo === "Hemograma Completo") {
      return {
        hemacias: `${gerarNumero(4, 6)} milhões/mm³`,
        hemoglobina: `${gerarNumero(12, 18)} g/dL`,
        hematocrito: `${gerarNumero(35, 55)}%`,
        leucocitos: `${gerarNumero(4000, 11000, 0)} /mm³`,
        plaquetas: `${gerarNumero(150000, 450000, 0)} /mm³`
      };
    }

    if (tipo === "Série Vermelha") {
      return {
        hemacias: `${gerarNumero(4, 6)} milhões/mm³`,
        hemoglobina: `${gerarNumero(12, 18)} g/dL`,
        vcm: `${gerarNumero(80, 100)} fL`,
        hcm: `${gerarNumero(27, 33)} pg`
      };
    }

    if (tipo === "Série Branca") {
      return {
        leucocitos: `${gerarNumero(4000, 11000, 0)} /mm³`,
        neutrofilos: `${gerarNumero(40, 75)}%`,
        linfocitos: `${gerarNumero(20, 45)}%`
      };
    }

    if (tipo === "Hemoglobina Glicada") {
      return {
        hba1c: `${gerarNumero(4.5, 7.8)}%`,
        observacao: "Resultado gerado automaticamente para RP"
      };
    }

    if (tipo === "ECG") {
      const ecg = [
        "ECG Normal",
        "Taquicardia Sinusal",
        "Bradicardia Leve",
        "Ritmo Estável"
      ];

      return {
        resultado: ecg[Math.floor(Math.random() * ecg.length)],
        bpm: `${gerarNumero(55, 130, 0)} bpm`
      };
    }

    if (tipo === "Tipagem Sanguínea") {
      const tipos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

      return {
        tipoSanguineoInformado: paciente.sangue || "Não informado",
        tipagemGerada: tipos[Math.floor(Math.random() * tipos.length)]
      };
    }

    if (tipo === "Função Renal") {
      return {
        ureia: `${gerarNumero(15, 50)} mg/dL`,
        creatinina: `${gerarNumero(0.6, 1.4)} mg/dL`
      };
    }

    if (tipo === "Função Hepática") {
      return {
        tgo: `${gerarNumero(10, 45)} U/L`,
        tgp: `${gerarNumero(10, 55)} U/L`,
        bilirrubina: `${gerarNumero(0.2, 1.2)} mg/dL`
      };
    }

    if (tipo === "Beta HCG") {
      return {
        resultadoRP:
          vereditoFeminino?.veredito || "Questionário não preenchido",
        nivelSimulado: `${gerarNumero(1, 2500, 0)} mUI/mL`,
        observacao: "Veredito RP baseado no questionário."
      };
    }

    if (tipo === "Avaliação Ginecológica") {
      return {
        relacaoRecente: questionarioFeminino.relacaoRecente,
        preservativo: questionarioFeminino.usouPreservativo,
        menstruacaoAtrasou: questionarioFeminino.menstruacaoAtrasou,
        diasAtraso: questionarioFeminino.diasAtraso,
        sintomas: vereditoFeminino?.resumo || "Sem avaliação"
      };
    }

    return {
      observacao: "Exame automático registrado"
    };
  };

  const gerarTodosExamesPaciente = async (paciente) => {
    const vereditoFeminino =
      paciente.sexo === "Feminino" ? calcularVereditoFeminino() : null;

    const listaExames =
      paciente.sexo === "Feminino" ? examesFemininos : examesMasculinos;

    const examesGerados = listaExames.map((tipo, index) => {
      const resultado = gerarResultadoExame(tipo, paciente, vereditoFeminino);

      return {
        id: String(Date.now() + index),
        paciente: paciente.nome,
        pacienteId: paciente.id,
        sexo: paciente.sexo,
        tipo,
        medico: usuarioAtual.nome,
        crmMedico: usuarioAtual.crm,
        medicoResponsavel: paciente.medicoResponsavel,
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        resultado,
        questionarioFeminino:
          paciente.sexo === "Feminino" ? questionarioFeminino : null,
        vereditoFeminino
      };
    });

    try {
      for (const exame of examesGerados) {
        await apiPost("historico", exame);
      }

      setHistorico([...examesGerados, ...historico]);

      await gerarPDFPaciente({
        paciente,
        exames: examesGerados,
        medico: usuarioAtual,
        assinatura: paciente.assinatura,
        vereditoFeminino
      });

      alert("Todos os exames foram gerados, salvos no banco e o PDF foi baixado");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar exames no banco");
    }
  };

const baixarPDFGrupo = async (grupo) => {
    const paciente = pacientes.find((p) => p.id === grupo.pacienteId) || {
      id: grupo.pacienteId,
      nome: grupo.paciente
    };

    await gerarPDFPaciente({
      paciente,
      exames: grupo.exames,
      medico: usuarioAtual,
      assinatura: paciente.assinatura,
      vereditoFeminino:
        grupo.exames.find((e) => e.vereditoFeminino)?.vereditoFeminino
    });
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    JSON.stringify(p).toLowerCase().includes(pesquisaPaciente.toLowerCase())
  );

  const examesPorPaciente = historico.reduce((grupos, exame) => {
    const id = exame.pacienteId || "sem-id";

    if (!grupos[id]) {
      grupos[id] = {
        pacienteId: id,
        paciente: exame.paciente,
        exames: []
      };
    }

    grupos[id].exames.push(exame);

    return grupos;
  }, {});

  const salvarVigilancia = async () => {
    if (!vigilanciaAtual.comercio) {
      return alert("Digite o comércio");
    }

    const registro = {
      id: Date.now().toString(),
      ...vigilanciaAtual,
      statusAlvara: "Regular",
      aprovadoEm: "",
      fiscal: usuarioAtual.nome,
      crmFiscal: usuarioAtual.crm,
      data: new Date().toLocaleDateString()
    };

    try {
      const salvo = await apiPost("vigilancias", registro);

      setVigilancias([
        salvo,
        ...vigilancias
      ]);

      setVigilanciaAtual(vigilanciaVazia);
      alert("Comércio cadastrado como Regular");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar vigilância no banco");
    }
  };

const salvarPediatria = () => {
    if (!pediatriaAtual.crianca) {
      return alert("Digite o nome da criança");
    }

    const novoAtendimento = {
      ...pediatriaAtual,
      medico: usuarioAtual.nome,
      crmMedico: usuarioAtual.crm,
      data: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString()
    };

    setPediatrias([
      novoAtendimento,
      ...pediatrias
    ]);

    setPediatriaAtual(pediatriaVazia);
    setVacinaAtual(vacinaVazia);

    alert("Atendimento pediátrico salvo");
  };

  const salvarObstetricia = async () => {
    if (!obstetriciaAtual.paciente) return alert("Digite a paciente");

    const registro = {
      id: Date.now().toString(),
      ...obstetriciaAtual,
      medico: usuarioAtual.nome,
      data: new Date().toLocaleDateString()
    };

    try {
      const salvo = await apiPost("obstetricias", registro);

      setObstetricias([
        salvo,
        ...obstetricias
      ]);

      setObstetriciaAtual(obstetriciaVazia);
      alert("Atendimento obstétrico salvo");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar obstetrícia no banco");
    }
  };

const calcularDataRetorno = (data, dias) => {
    if (!data || !dias) return "";

    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + Number(dias));

    return novaData.toLocaleDateString("pt-BR");
  };

  const adicionarVacinaCarteira = () => {
    if (!vacinaAtual.nome || !vacinaAtual.aplicadaEm) {
      return alert("Escolha a vacina e a data aplicada");
    }

    const novaVacina = {
      id: Date.now(),
      ...vacinaAtual,
      retornoEm: calcularDataRetorno(
        vacinaAtual.aplicadaEm,
        vacinaAtual.retornoDias
      )
    };

    setPediatriaAtual({
      ...pediatriaAtual,
      carteiraVacinas: [
        ...(pediatriaAtual.carteiraVacinas || []),
        novaVacina
      ]
    });

    setVacinaAtual(vacinaVazia);
  };

  const removerVacinaCarteira = (id) => {
    setPediatriaAtual({
      ...pediatriaAtual,
      carteiraVacinas: (pediatriaAtual.carteiraVacinas || []).filter(
        (v) => v.id !== id
      )
    });
  };

  const imprimirCarteirinha = (registro) => {
    const vacinasHTML =
      registro.carteiraVacinas?.map((v) => `
        <tr>
          <td>${v.nome}</td>
          <td>${v.dose || "-"}</td>
          <td>${v.lote || "-"}</td>
          <td>${v.aplicadaEm || "-"}</td>
          <td>${v.retornoDias ? `${v.retornoDias} dias` : "-"}</td>
          <td>${v.retornoEm || "-"}</td>
          <td>${v.observacoes || "-"}</td>
        </tr>
      `).join("") || "";

    const html = `
      <html>
        <head>
          <title>Carteirinha de Vacina</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 25px;
              color: #111827;
            }

            h1 {
              color: #047857;
              margin-bottom: 5px;
            }

            h2 {
              margin-top: 0;
              color: #111827;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #cbd5e1;
              padding: 8px;
              font-size: 12px;
            }

            th {
              background: #047857;
              color: white;
            }

            .box {
              border: 2px solid #047857;
              padding: 15px;
              border-radius: 12px;
              margin-bottom: 20px;
            }

            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #475569;
            }
          </style>
        </head>

        <body>
          <h1>Hospital SUL</h1>
          <h2>Carteirinha de Vacinação Pediátrica</h2>

          <div class="box">
            <p><strong>Criança:</strong> ${registro.crianca || "-"}</p>
            <p><strong>Data de nascimento:</strong> ${registro.nascimento || "-"}</p>
            <p><strong>Responsável:</strong> ${registro.responsavel || "-"}</p>
            <p><strong>CPF do responsável:</strong> ${registro.cpfResponsavel || "-"}</p>
            <p><strong>Médico:</strong> ${registro.medico || "-"}</p>
            <p><strong>CRM:</strong> ${registro.crmMedico || "-"}</p>
            <p><strong>Data:</strong> ${registro.data || "-"}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Vacina</th>
                <th>Dose</th>
                <th>Lote</th>
                <th>Aplicada em</th>
                <th>Retorno</th>
                <th>Próxima data</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${vacinasHTML}
            </tbody>
          </table>

          <div class="footer">
            Hospital SUL / desenvolvido por: Marcos / Rise
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");

    if (!win) {
      return alert("Permita pop-ups para imprimir a carteirinha");
    }

    win.document.write(html);
    win.document.close();
  };
  const apagarCarteirinha = async (indexCarteira) => {
    const confirmar = window.confirm(
      "Deseja apagar esta carteirinha?"
    );

    if (!confirmar) return;

    const item = pediatrias[indexCarteira];

    try {
      if (item?.id) {
        await apiDelete("pediatrias", item.id);
      }

      const novasCarteirinhas = pediatrias.filter(
        (_, index) => index !== indexCarteira
      );

      setPediatrias(novasCarteirinhas);

      alert("Carteirinha apagada");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao apagar carteirinha");
    }
  };

const calcularDiasParaVencer = (dataValidade) => {
    if (!dataValidade) return null;

    const hoje = new Date();
    const validade = new Date(dataValidade);

    hoje.setHours(0, 0, 0, 0);
    validade.setHours(0, 0, 0, 0);

    const diferenca = validade - hoje;

    return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
  };

  const calcularStatusAutomatico = (dataValidade, statusManual) => {
    if (statusManual === "Recusado") {
      return "Recusado";
    }

    if (statusManual === "Aprovado") {
      return "Aprovado";
    }

    const dias = calcularDiasParaVencer(dataValidade);

    if (dias !== null && dias < 0) {
      return "Atrasado";
    }

    return "Regular";
  };

  const aprovarAlvara = async (index) => {
    const novaLista = [...vigilancias];

    novaLista[index] = {
      ...novaLista[index],
      statusAlvara: "Aprovado",
      aprovadoEm: new Date().toLocaleDateString(),
      fiscal: usuarioAtual.nome,
      crmFiscal: usuarioAtual.crm
    };

    try {
      await apiPut("vigilancias", novaLista);
      setVigilancias(novaLista);

      alert("Alvará aprovado");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao aprovar alvará");
    }
  };

const atualizarStatusAlvara = (index, status) => {
    const novaLista = [...vigilancias];

    novaLista[index] = {
      ...novaLista[index],
      statusAlvara: status
    };

    setVigilancias(novaLista);
  };

  const comerciosComAlerta = vigilancias.filter((v) => {
    const dias = calcularDiasParaVencer(v.validadeAlvara);
    const status = calcularStatusAutomatico(
      v.validadeAlvara,
      v.statusAlvara
    );

    return (
      status === "Atrasado" ||
      (status === "Regular" && dias !== null && dias <= 5)
    );
  });

  const apagarComercioVigilancia = async (indexComercio) => {
    const confirmar = window.confirm(
      "Deseja apagar este comércio da vigilância?"
    );

    if (!confirmar) return;

    const item = vigilancias[indexComercio];

    try {
      if (item?.id) {
        await apiDelete("vigilancias", item.id);
      }

      const novaLista = vigilancias.filter(
        (_, index) => index !== indexComercio
      );

      setVigilancias(novaLista);
    } catch (erro) {
      console.error(erro);
      alert("Erro ao apagar comércio");
    }
  };

if (!usuarioAtual) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="medical-logo">✚</div>

          <h1>Sistema Médico</h1>

          <p>Hospital SUL / desenvolvido por: Marcos / Rise</p>

          <input
            placeholder="CRM"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button onClick={login}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="system">
      <aside className="sidebar">
        <h1>MEDICAL</h1>

        <button onClick={() => setPagina("dashboard")}>Dashboard</button>
        <button onClick={() => setPagina("pacientes")}>Pacientes</button>
        <button onClick={() => setPagina("historico")}>Histórico</button>
        <button onClick={() => setPagina("vigilancia")}>Vigilância</button>
        <button
          className={comerciosComAlerta.length > 0 ? "menu-alerta" : ""}
          onClick={() => setPagina("alvara")}
        >
          Alvará
          {comerciosComAlerta.length > 0 && (
            <span className="notificacao-alvara">
              {comerciosComAlerta.length}
            </span>
          )}
        </button>
        <button onClick={() => setPagina("pediatria")}>Pediatria</button>
        <button onClick={() => setPagina("obstetricia")}>Obstetrícia</button>
        <button onClick={() => setPagina("uploads")}>Uploads</button>
        <button onClick={() => setPagina("graficos")}>Gráficos</button>

        {usuarioAtual?.admin === true && (
          <button onClick={() => setPagina("config")}>Administração</button>
        )}
      </aside>

      <main className="content">
        <div className="topbar">
          <div>
            Médico: {usuarioAtual.nome} | CRM {usuarioAtual.crm}
          </div>

          <button className="logout-btn" onClick={() => setUsuarioAtual(null)}>
            Sair
          </button>
        </div>

        {pagina === "dashboard" && (
          <div>
            <h2>Dashboard Hospitalar</h2>

            <div className="cards">
              <div className="card">
                <h3>Pacientes</h3>
                <span>{pacientes.length}</span>
              </div>

              <div className="card">
                <h3>Exames</h3>
                <span>{historico.length}</span>
              </div>

              <div className="card">
                <h3>Médicos</h3>
                <span>{medicos.length}</span>
              </div>

              <div className="card">
                <h3>Vigilância</h3>
                <span>{vigilancias.length}</span>
              </div>

              <div className={comerciosComAlerta.length > 0 ? "card card-alerta" : "card"}>
                <h3>Alvarás em alerta</h3>
                <span>{comerciosComAlerta.length}</span>
              </div>

              <div className="card">
                <h3>Pediatria</h3>
                <span>{pediatrias.length}</span>
              </div>

              <div className="card">
                <h3>Obstetrícia</h3>
                <span>{obstetricias.length}</span>
              </div>
            </div>
          </div>
        )}

        {pagina === "pacientes" && (
          <div>
            <h2>Cadastro de Pacientes</h2>

            <div className="form">
              <input
                placeholder="ID"
                value={pacienteAtual.id}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    id: e.target.value
                  })
                }
              />

              <input
                placeholder="Nome"
                value={pacienteAtual.nome}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    nome: e.target.value
                  })
                }
              />

              <select
                value={pacienteAtual.sexo}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    sexo: e.target.value
                  })
                }
              >
                <option value="">Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>

              <input
                placeholder="Idade"
                value={pacienteAtual.idade}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    idade: e.target.value
                  })
                }
              />

              <input
                placeholder="Telefone"
                value={pacienteAtual.telefone}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    telefone: e.target.value
                  })
                }
              />

              <input
                placeholder="Tipo sanguíneo"
                value={pacienteAtual.sangue}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    sangue: e.target.value
                  })
                }
              />

              <input
                placeholder="Altura"
                value={pacienteAtual.altura}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    altura: e.target.value
                  })
                }
              />

              <input
                placeholder="Peso"
                value={pacienteAtual.peso}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    peso: e.target.value
                  })
                }
              />

              <select
                value={pacienteAtual.motivo}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    motivo: e.target.value
                  })
                }
              >
                <option value="">O que veio fazer?</option>
                <option>Exame</option>
                <option>Cirurgia</option>
                <option>Obstetrícia</option>
                <option>Pediatria</option>
                <option>Vigilância Sanitária</option>
                <option>Consulta</option>
                <option>Emergência</option>
              </select>

              <textarea
                placeholder="Observações"
                value={pacienteAtual.observacoes}
                onChange={(e) =>
                  setPacienteAtual({
                    ...pacienteAtual,
                    observacoes: e.target.value
                  })
                }
              />

              <div className="signature-panel">
                <h3>Assinatura Digital</h3>
                <p>Use mouse ou toque como uma caneta para assinar.</p>

                <div className="signature-canvas-wrap">
                  <SignatureCanvas
                    ref={assinaturaRef}
                    penColor="#00b388"
                    backgroundColor="#ffffff"
                    canvasProps={{
                      className: "assinatura-canvas"
                    }}
                  />
                </div>

                <div className="assinatura-buttons">
                  <button type="button" onClick={salvarAssinatura}>
                    Salvar Assinatura
                  </button>

                  <button type="button" onClick={limparAssinatura}>
                    Limpar Assinatura
                  </button>
                </div>

                {assinatura && (
                  <img
                    src={assinatura}
                    alt="assinatura"
                    className="preview-assinatura"
                  />
                )}
              </div>

              <button onClick={salvarPaciente}>Salvar Paciente</button>
            </div>

            <input
              className="search-input"
              placeholder="Pesquisar paciente"
              value={pesquisaPaciente}
              onChange={(e) => setPesquisaPaciente(e.target.value)}
            />

            <div className="patients-list">
              {pacientesFiltrados.map((p) => (
                <div className="history-card" key={p.id}>
                  <h3>{p.nome}</h3>

                  <p>ID: {p.id}</p>
                  <p>Sexo: {p.sexo}</p>
                  <p>Idade: {p.idade}</p>
                  <p>Telefone: {p.telefone}</p>
                  <p>Sangue: {p.sangue}</p>
                  <p>Motivo: {p.motivo}</p>
                  <p>Médico: {p.medicoResponsavel}</p>
                  <p>CRM responsável: {p.crmResponsavel}</p>

                  {p.assinatura && (
                    <img
                      src={p.assinatura}
                      alt="assinatura"
                      className="assinatura-paciente"
                    />
                  )}

                  {p.sexo === "Feminino" && (
                    <div className="female-form">
                      <h4>Questionário Feminino / Gestacional</h4>

                      <select
                        value={questionarioFeminino.relacaoRecente}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            relacaoRecente: e.target.value
                          })
                        }
                      >
                        <option value="">Teve relação recente?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <select
                        value={questionarioFeminino.usouPreservativo}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            usouPreservativo: e.target.value
                          })
                        }
                      >
                        <option value="">Usou preservativo?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <select
                        value={questionarioFeminino.menstruacaoAtrasou}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            menstruacaoAtrasou: e.target.value
                          })
                        }
                      >
                        <option value="">Menstruação atrasou?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <input
                        placeholder="Dias de atraso"
                        value={questionarioFeminino.diasAtraso}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            diasAtraso: e.target.value
                          })
                        }
                      />

                      <select
                        value={questionarioFeminino.enjoo}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            enjoo: e.target.value
                          })
                        }
                      >
                        <option value="">Enjoo?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <select
                        value={questionarioFeminino.tontura}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            tontura: e.target.value
                          })
                        }
                      >
                        <option value="">Tontura?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <select
                        value={questionarioFeminino.dorAbdominal}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            dorAbdominal: e.target.value
                          })
                        }
                      >
                        <option value="">Dor abdominal?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <select
                        value={questionarioFeminino.sangramento}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            sangramento: e.target.value
                          })
                        }
                      >
                        <option value="">Sangramento?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <select
                        value={questionarioFeminino.usaAnticoncepcional}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            usaAnticoncepcional: e.target.value
                          })
                        }
                      >
                        <option value="">Usa anticoncepcional?</option>
                        <option>Sim</option>
                        <option>Não</option>
                      </select>

                      <textarea
                        placeholder="Observações do questionário"
                        value={questionarioFeminino.observacoes}
                        onChange={(e) =>
                          setQuestionarioFeminino({
                            ...questionarioFeminino,
                            observacoes: e.target.value
                          })
                        }
                      />
                    </div>
                  )}

                  <button
                    className="exam-btn"
                    onClick={() => gerarTodosExamesPaciente(p)}
                  >
                    Gerar Todos os Exames + PDF
                  </button>

                  <button className="delete-btn" onClick={() => apagarPaciente(p.id)}>
                    Apagar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pagina === "historico" && (
          <div>
            <h2>Histórico de Exames por Paciente</h2>

            {historico.length === 0 ? (
              <div className="history-card">Nenhum exame gerado</div>
            ) : (
              Object.values(examesPorPaciente).map((grupo) => (
                <div className="history-card" key={grupo.pacienteId}>
                  <h3>{grupo.paciente}</h3>

                  <p>ID: {grupo.pacienteId}</p>
                  <p>Total de exames: {grupo.exames.length}</p>

                  <button className="exam-btn" onClick={() => baixarPDFGrupo(grupo)}>
                    Baixar PDF do Paciente
                  </button>

                  {grupo.exames.map((exame) => (
                    <div className="exam-group" key={exame.id}>
                      <h4>{exame.tipo}</h4>

                      <p>Médico: {exame.medico}</p>
                      <p>CRM: {exame.crmMedico}</p>
                      <p>Data: {exame.data}</p>
                      <p>Hora: {exame.hora}</p>

                      {exame.vereditoFeminino && (
                        <div className="veredito-box">
                          <strong>Veredito RP:</strong>
                          <p>{exame.vereditoFeminino.veredito}</p>
                          <p>{exame.vereditoFeminino.conduta}</p>
                        </div>
                      )}

                      <pre>
                        {JSON.stringify(exame.resultado, null, 2)}
                      </pre>

                      <button
                        className="delete-btn"
                        onClick={() => apagarHistorico(exame.id)}
                      >
                        Apagar Exame
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {pagina === "vigilancia" && (
          <AreaEspecial
            titulo="Vigilância Sanitária"
            dados={vigilanciaAtual}
            setDados={setVigilanciaAtual}
            lista={vigilancias}
            salvar={salvarVigilancia}
            campos={[
              ["comercio", "Nome do comércio"],
              ["responsavel", "Responsável pelo comércio"],
              ["proprietario", "Proprietário da empresa"],
              ["documento", "Documento / Passaporte / CNPJ"],
              ["telefone", "Telefone"],
              ["endereco", "Endereço"],
              ["dataAbertura", "Data de abertura"],
              ["validadeAlvara", "Validade do alvará"],
              ["higiene", "Condições de higiene"],
              ["alvara", "Alvará anterior"],
              ["validadeProdutos", "Validade dos produtos"],
              ["manipulacao", "Manipulação"],
              ["situacao", "Situação final"],
              ["observacoes", "Observações"]
            ]}
          />
        )}


        {pagina === "alvara" && (
          <div>
            <h2>Alvarás Sanitários</h2>

            {comerciosComAlerta.length > 0 && (
              <div className="admin-alert alerta-piscando">
                Existem {comerciosComAlerta.length} comércio(s) com alvará vencido
                ou faltando até 5 dias para vencer.
              </div>
            )}

            {vigilancias.length === 0 ? (
              <div className="history-card">
                Nenhum comércio cadastrado na Vigilância Sanitária.
              </div>
            ) : (
              <div className="patients-list">
                {vigilancias.map((v, index) => {
                  const dias = calcularDiasParaVencer(v.validadeAlvara);

                  const statusAuto = calcularStatusAutomatico(
                    v.validadeAlvara,
                    v.statusAlvara
                  );

                  const estaEmAlerta =
                    statusAuto === "Atrasado" ||
                    (statusAuto === "Regular" && dias !== null && dias <= 5);

                  return (
                    <div
                      className={
                        estaEmAlerta
                          ? "history-card alvara-card alvara-vencendo"
                          : "history-card alvara-card"
                      }
                      key={index}
                    >
                      <h3>{v.comercio || "Comércio sem nome"}</h3>

                      <p>Responsável: {v.responsavel || "-"}</p>
                      <p>Proprietário: {v.proprietario || "-"}</p>
                      <p>Documento: {v.documento || "-"}</p>
                      <p>Telefone: {v.telefone || "-"}</p>
                      <p>Endereço: {v.endereco || "-"}</p>
                      <p>Data de abertura: {v.dataAbertura || "-"}</p>
                      <p>Validade do alvará: {v.validadeAlvara || "-"}</p>

                      <p>
                        Dias para vencer:
                        {" "}
                        {dias === null ? "Não informado" : dias}
                      </p>

                      <p>
                        Status:
                        {" "}
                        <strong
                          style={{
                            color:
                              statusAuto === "Aprovado" ||
                              statusAuto === "Regular"
                                ? "#00b388"
                                : "#ef4444"
                          }}
                        >
                          {statusAuto}
                        </strong>
                      </p>

                      {estaEmAlerta && (
                        <div className="alvara-alerta-texto">
                          Atenção: este alvará está vencido ou vence em até 5 dias.
                        </div>
                      )}

                      <div className="alvara-botoes">
                        <button
                          className="exam-btn"
                          onClick={() => aprovarAlvara(index)}
                        >
                          Aprovado
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => atualizarStatusAlvara(index, "Recusado")}
                        >
                          Recusar Alvará
                        </button>

                        <button
                          className="pdf-btn"
                          onClick={() =>
                            baixarAlvaraPDF({
                              ...v,
                              fiscal: usuarioAtual.nome,
                              crmFiscal: usuarioAtual.crm
                            })
                          }
                        >
                          Baixar PDF
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => apagarComercioVigilancia(index)}
                        >
                          Apagar Comércio
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {pagina === "pediatria" && (
          <div>
            <h2>Pediatria</h2>

            <div className="pediatria-layout">
              <div className="form pediatria-form">
                <input
                  placeholder="Nome da criança"
                  value={pediatriaAtual.crianca}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      crianca: e.target.value
                    })
                  }
                />

                <input
                  type="date"
                  value={pediatriaAtual.nascimento}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      nascimento: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Idade"
                  value={pediatriaAtual.idade}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      idade: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Responsável"
                  value={pediatriaAtual.responsavel}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      responsavel: e.target.value
                    })
                  }
                />

                <input
                  placeholder="CPF do responsável"
                  value={pediatriaAtual.cpfResponsavel}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      cpfResponsavel: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Peso"
                  value={pediatriaAtual.peso}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      peso: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Altura"
                  value={pediatriaAtual.altura}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      altura: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Temperatura"
                  value={pediatriaAtual.temperatura}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      temperatura: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Alergias"
                  value={pediatriaAtual.alergias}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      alergias: e.target.value
                    })
                  }
                />

                <textarea
                  placeholder="Sintomas"
                  value={pediatriaAtual.sintomas}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      sintomas: e.target.value
                    })
                  }
                />

                <textarea
                  placeholder="Conduta médica"
                  value={pediatriaAtual.conduta}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      conduta: e.target.value
                    })
                  }
                />

                <textarea
                  placeholder="Observações"
                  value={pediatriaAtual.observacoes}
                  onChange={(e) =>
                    setPediatriaAtual({
                      ...pediatriaAtual,
                      observacoes: e.target.value
                    })
                  }
                />
              </div>

              <div className="vaccine-card-editor">
                <div className="vaccine-header">
                  <h3>Carteirinha de Vacinação</h3>
                  <span>Hospital SUL</span>
                </div>

                <div className="vaccine-form">
                  <select
                    value={vacinaAtual.nome}
                    onChange={(e) =>
                      setVacinaAtual({
                        ...vacinaAtual,
                        nome: e.target.value
                      })
                    }
                  >
                    <option value="">Selecionar vacina</option>

                    {vacinasPadrao.map((vacina) => (
                      <option key={vacina} value={vacina}>
                        {vacina}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Dose"
                    value={vacinaAtual.dose}
                    onChange={(e) =>
                      setVacinaAtual({
                        ...vacinaAtual,
                        dose: e.target.value
                      })
                    }
                  />

                  <input
                    placeholder="Lote"
                    value={vacinaAtual.lote}
                    onChange={(e) =>
                      setVacinaAtual({
                        ...vacinaAtual,
                        lote: e.target.value
                      })
                    }
                  />

                  <input
                    type="date"
                    value={vacinaAtual.aplicadaEm}
                    onChange={(e) =>
                      setVacinaAtual({
                        ...vacinaAtual,
                        aplicadaEm: e.target.value
                      })
                    }
                  />

                  <input
                    placeholder="Voltar em quantos dias?"
                    value={vacinaAtual.retornoDias}
                    onChange={(e) =>
                      setVacinaAtual({
                        ...vacinaAtual,
                        retornoDias: e.target.value
                      })
                    }
                  />

                  <textarea
                    placeholder="Observações da vacina"
                    value={vacinaAtual.observacoes}
                    onChange={(e) =>
                      setVacinaAtual({
                        ...vacinaAtual,
                        observacoes: e.target.value
                      })
                    }
                  />

                  <button type="button" onClick={adicionarVacinaCarteira}>
                    Adicionar Vacina
                  </button>
                </div>

                <div className="vaccine-card">
                  <div className="vaccine-card-top">
                    <div>
                      <h3>Carteira de Vacinação</h3>
                      <p>{pediatriaAtual.crianca || "Nome da criança"}</p>
                    </div>

                    <div className="vaccine-cross">✚</div>
                  </div>

                  <div className="vaccine-info-grid">
                    <p>
                      <strong>Nascimento:</strong>{" "}
                      {pediatriaAtual.nascimento || "-"}
                    </p>

                    <p>
                      <strong>Responsável:</strong>{" "}
                      {pediatriaAtual.responsavel || "-"}
                    </p>

                    <p>
                      <strong>Médico:</strong>{" "}
                      {usuarioAtual.nome}
                    </p>

                    <p>
                      <strong>CRM:</strong>{" "}
                      {usuarioAtual.crm}
                    </p>
                  </div>

                  <div className="vaccine-table">
                    <div className="vaccine-table-head">
                      <span>Vacina</span>
                      <span>Dose</span>
                      <span>Aplicada</span>
                      <span>Retorno</span>
                      <span>Ação</span>
                    </div>

                    {(pediatriaAtual.carteiraVacinas || []).length === 0 ? (
                      <div className="vaccine-empty">
                        Nenhuma vacina adicionada
                      </div>
                    ) : (
                      pediatriaAtual.carteiraVacinas.map((v) => (
                        <div className="vaccine-table-row" key={v.id}>
                          <span>{v.nome}</span>
                          <span>{v.dose || "-"}</span>
                          <span>{v.aplicadaEm}</span>
                          <span>{v.retornoEm || "-"}</span>

                          <button
                            type="button"
                            className="mini-delete"
                            onClick={() => removerVacinaCarteira(v.id)}
                          >
                            X
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button onClick={salvarPediatria}>
                  Salvar Atendimento Pediátrico
                </button>
              </div>
            </div>

            <div className="patients-list">
              {pediatrias.map((p, index) => (
                <div className="history-card" key={index}>
                  <h3>{p.crianca}</h3>

                  <p>Responsável: {p.responsavel}</p>
                  <p>CPF do responsável: {p.cpfResponsavel}</p>
                  <p>Nascimento: {p.nascimento}</p>
                  <p>Peso: {p.peso}</p>
                  <p>Altura: {p.altura}</p>
                  <p>Temperatura: {p.temperatura}</p>
                  <p>Alergias: {p.alergias}</p>
                  <p>Médico: {p.medico}</p>
                  <p>CRM: {p.crmMedico}</p>
                  <p>Data: {p.data}</p>

                  <div className="vaccine-card saved-vaccine-card">
                    <div className="vaccine-card-top">
                      <div>
                        <h3>Carteirinha de Vacinação</h3>
                        <p>{p.crianca}</p>
                      </div>

                      <div className="vaccine-cross">✚</div>
                    </div>

                    <div className="vaccine-table">
                      <div className="vaccine-table-head saved-vaccine-head">
                        <span>Vacina</span>
                        <span>Dose</span>
                        <span>Aplicada</span>
                        <span>Retorno</span>
                      </div>

                      {(p.carteiraVacinas || []).length === 0 ? (
                        <div className="vaccine-empty">
                          Nenhuma vacina cadastrada
                        </div>
                      ) : (
                        p.carteiraVacinas.map((v) => (
                          <div className="vaccine-table-row saved-vaccine-row" key={v.id}>
                            <span>{v.nome}</span>
                            <span>{v.dose || "-"}</span>
                            <span>{v.aplicadaEm}</span>
                            <span>{v.retornoEm || "-"}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pagina === "obstetricia" && (
          <AreaEspecial
            titulo="Obstetrícia"
            dados={obstetriciaAtual}
            setDados={setObstetriciaAtual}
            lista={obstetricias}
            salvar={salvarObstetricia}
            campos={[
              ["paciente", "Nome da paciente"],
              ["idadeGestacional", "Idade gestacional"],
              ["pressao", "Pressão"],
              ["batimentosBebe", "Batimentos do bebê"],
              ["movimentosFetais", "Movimentos fetais"],
              ["contracoes", "Contrações"],
              ["riscoGestacional", "Risco gestacional"],
              ["tipoParto", "Tipo de parto"],
              ["observacoes", "Observações"]
            ]}
          />
        )}

        {pagina === "uploads" && <UploadArquivos usuarioAtual={usuarioAtual} />}

        {pagina === "graficos" && <DashboardGraficos />}

        {pagina === "config" && usuarioAtual?.admin === true && (
          <div>
            <h2>Administração Médica</h2>

            <div className="admin-alert">
              Área restrita para médicos administradores.
            </div>

            <div className="form admin-form">
              <input
                placeholder="Nome do Médico"
                value={novoMedico.nome}
                onChange={(e) =>
                  setNovoMedico({
                    ...novoMedico,
                    nome: e.target.value
                  })
                }
              />

              <input
                placeholder="CRM"
                value={novoMedico.crm}
                onChange={(e) =>
                  setNovoMedico({
                    ...novoMedico,
                    crm: e.target.value
                  })
                }
              />

              <input
                placeholder="Senha"
                value={novoMedico.senha}
                onChange={(e) =>
                  setNovoMedico({
                    ...novoMedico,
                    senha: e.target.value
                  })
                }
              />

              <input
                placeholder="Cargo"
                value={novoMedico.cargo}
                onChange={(e) =>
                  setNovoMedico({
                    ...novoMedico,
                    cargo: e.target.value
                  })
                }
              />

              <select
                value={novoMedico.admin ? "sim" : "nao"}
                onChange={(e) =>
                  setNovoMedico({
                    ...novoMedico,
                    admin: e.target.value === "sim"
                  })
                }
              >
                <option value="nao">Médico comum</option>
                <option value="sim">Administrador</option>
              </select>

              <button onClick={criarMedico}>Criar Médico</button>
            </div>

            <div className="patients-list">
              {medicos.map((m) => (
                <div className="history-card medico-card" key={m.crm}>
                  <h3>{m.nome}</h3>
                  <p>CRM: {m.crm}</p>
                  <p>Cargo: {m.cargo || "Médico"}</p>
                  <p>Tipo: {m.admin ? "Administrador" : "Médico comum"}</p>

                  {m.crm !== "123456" && (
                    <button
                      className="delete-btn"
                      onClick={() => apagarMedico(m.crm)}
                    >
                      Apagar Médico
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pagina === "config" && usuarioAtual?.admin !== true && (
          <div className="history-card">
            <h3>Acesso negado</h3>
            <p>Somente médicos administradores podem acessar esta área.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function AreaEspecial({
  titulo,
  dados,
  setDados,
  lista,
  salvar,
  campos
}) {
  const camposTextarea = [
    "observacoes",
    "higiene",
    "validadeProdutos",
    "manipulacao",
    "situacao",
    "sintomas",
    "conduta"
  ];

  const camposData = [
    "validadeAlvara",
    "dataAbertura"
  ];

  return (
    <div>
      <h2>{titulo}</h2>

      <div className="form special-form labeled-form">
        {campos.map(([campo, label]) => (
          <div className="field-box" key={campo}>
            <label className="field-label">
              {label}
            </label>

            {camposTextarea.includes(campo) ? (
              <textarea
                placeholder={label}
                value={dados[campo] || ""}
                onChange={(e) =>
                  setDados({
                    ...dados,
                    [campo]: e.target.value
                  })
                }
              />
            ) : (
              <input
                placeholder={label}
                type={
                  camposData.includes(campo)
                    ? "date"
                    : "text"
                }
                value={dados[campo] || ""}
                onChange={(e) =>
                  setDados({
                    ...dados,
                    [campo]: e.target.value
                  })
                }
              />
            )}
          </div>
        ))}

        <button onClick={salvar}>
          Salvar Registro
        </button>
      </div>

      <div className="patients-list">
        {lista.length === 0 ? (
          <div className="history-card">
            Nenhum registro encontrado.
          </div>
        ) : (
          lista.map((item, index) => (
            <div className="history-card" key={index}>
              <h3>
                {item.comercio ||
                  item.crianca ||
                  item.paciente ||
                  "Registro"}
              </h3>

              {Object.entries(item).map(([chave, valor]) =>
                typeof valor !== "object" ? (
                  <p key={chave}>
                    <strong>{chave}:</strong>{" "}
                    {String(valor || "-")}
                  </p>
                ) : null
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
