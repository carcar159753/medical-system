import jsPDF from "jspdf";

const dataBR = (data) => {
  if (!data) return "-";

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) {
    return data;
  }

  return d.toLocaleDateString("pt-BR");
};

export function baixarAlvaraPDF(comercio) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  doc.setFillColor(245, 250, 255);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(225, 242, 252);
  doc.circle(180, 40, 38, "F");
  doc.circle(28, 250, 45, "F");

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 12, 38, 38, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RISE", 21, 28);
  doc.setFontSize(10);
  doc.text("HPSUL", 19, 36);

  doc.setFillColor(56, 189, 248);
  doc.roundedRect(58, 12, 118, 16, 5, 5, "F");

  doc.setTextColor(5, 35, 70);
  doc.setFontSize(21);
  doc.text("VIGILÂNCIA SANITÁRIA", 64, 24);

  doc.setTextColor(20, 35, 50);
  doc.setFontSize(13);
  doc.text("ALVARÁ DE LICENÇA DE FUNCIONAMENTO", 58, 42);
  doc.text("CERTIFICADO DE APROVAÇÃO SANITÁRIA", 58, 50);

  let y = 70;

  const titulo = (texto) => {
    doc.setTextColor(0, 80, 180);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(texto, 14, y);
    y += 8;
  };

  const linha = (label, valor) => {
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${label}:`, 14, y);

    doc.setFont("helvetica", "normal");
    doc.text(String(valor || "-"), 52, y);
    y += 7;
  };

  titulo("DADOS DA EMPRESA");
  linha("Nome da empresa", comercio.comercio);
  linha("Data de abertura", dataBR(comercio.dataAbertura));
  linha("Validade", dataBR(comercio.validadeAlvara));
  linha("Endereço", comercio.endereco);
  linha("Telefone", comercio.telefone);

  y += 4;

  titulo("DADOS DO PROPRIETÁRIO");
  linha("Nome", comercio.proprietario || comercio.responsavel);
  linha("Documento", comercio.documento);
  linha("Telefone", comercio.telefone);

  y += 8;

  const textos = [
    `A Vigilância Sanitária certifica que ${comercio.comercio || "o comércio"} está REGULARIZADA E APTA, conforme as normas vigentes.`,
    "A inspeção confirmou condições adequadas de limpeza, organização do ambiente, armazenamento de materiais e descarte correto de resíduos, atendendo às exigências sanitárias e de segurança aplicáveis ao setor.",
    "Após avaliação criteriosa das condições de higiene, estrutura física, organização dos espaços de trabalho, acondicionamento de produtos e documentação, o estabelecimento demonstrou estar em conformidade com os padrões exigidos para funcionamento."
  ];

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  textos.forEach((texto) => {
    const linhas = doc.splitTextToSize(texto, 180);
    doc.text(linhas, 14, y);
    y += linhas.length * 5 + 6;
  });

  y += 6;

  doc.setTextColor(0, 80, 180);
  doc.setFontSize(14);
  doc.text("CONCLUSÃO", 91, y);
  y += 14;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const conclusao = `${comercio.comercio || "O comércio"} passou por inspeção sanitária e foi considerada APTA PARA FUNCIONAMENTO.`;
  const linhasConclusao = doc.splitTextToSize(conclusao, 120);
  doc.text(linhasConclusao, 14, y);

  y += linhasConclusao.length * 6 + 10;

  doc.setFont("helvetica", "bold");
  doc.text("APTA PARA FUNCIONAMENTO.", 14, y);

  doc.setDrawColor(0, 80, 180);
  doc.setLineWidth(1);
  doc.circle(158, 230, 23);
  doc.setTextColor(0, 80, 180);
  doc.setFontSize(8);
  doc.text("HOSPITAL RISE SUL", 136, 222);
  doc.text("INSPEÇÃO", 145, 231);
  doc.text("APROVADA", 144, 239);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("times", "italic");
  doc.text(comercio.fiscal || "Fiscal responsável", 128, 260);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(`CRM/Fiscal: ${comercio.crmFiscal || "-"}`, 152, 268);

  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("pt-BR"), 150, 278);

  doc.save(`${comercio.comercio || "alvara"}-sanitario.pdf`);
}
