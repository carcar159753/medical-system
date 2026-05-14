import jsPDF from "jspdf";

const vacinasFixas = [
  "BCG",
  "Hepatite B",
  "Poliomielite",
  "Pentavalente",
  "Pneumocócica",
  "Rotavírus",
  "Meningocócica",
  "Tríplice Viral",
  "Febre Amarela",
  "DTP",
  "Influenza",
  "COVID-19",
  "HPV"
];

const dataBR = (data) => {
  if (!data) return "-";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return data;
  return d.toLocaleDateString("pt-BR");
};

const encontrarVacina = (registro, nome) => {
  return (registro.carteiraVacinas || []).find((v) =>
    String(v.nome || "")
      .toLowerCase()
      .includes(nome.toLowerCase())
  );
};

const addFoto = (doc, foto, x, y, w, h) => {
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, 6, 6, "F");

  doc.setDrawColor(255, 170, 60);
  doc.setLineWidth(2);
  doc.roundedRect(x, y, w, h, 6, 6, "S");

  if (foto) {
    try {
      doc.addImage(foto, "JPEG", x + 3, y + 3, w - 6, h - 6);
    } catch {
      try {
        doc.addImage(foto, "PNG", x + 3, y + 3, w - 6, h - 6);
      } catch {}
    }
  } else {
    doc.setTextColor(130, 130, 130);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("FOTO DO BEBÊ", x + 14, y + h / 2);
  }
};

const animal = (doc, x, y, tipo) => {
  if (tipo === "urso") {
    doc.setFillColor(170, 105, 55);
    doc.circle(x, y, 16, "F");
    doc.circle(x - 12, y - 12, 7, "F");
    doc.circle(x + 12, y - 12, 7, "F");
    doc.setFillColor(255, 220, 180);
    doc.circle(x, y + 4, 8, "F");
  }

  if (tipo === "coelho") {
    doc.setFillColor(255, 255, 255);
    doc.ellipse(x - 7, y - 20, 5, 16, "F");
    doc.ellipse(x + 7, y - 20, 5, 16, "F");
    doc.circle(x, y, 15, "F");
  }

  if (tipo === "raposa") {
    doc.setFillColor(255, 120, 45);
    doc.circle(x, y, 15, "F");
    doc.setFillColor(255, 245, 235);
    doc.triangle(x - 12, y - 4, x, y + 12, x + 12, y - 4, "F");
  }

  doc.setFillColor(0, 0, 0);
  doc.circle(x - 5, y - 2, 1.6, "F");
  doc.circle(x + 5, y - 2, 1.6, "F");
};

export function baixarCarteirinhaPDF(registro) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const W = 297;
  const H = 210;

  // FUNDO
  doc.setFillColor(235, 250, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFillColor(185, 240, 150);
  doc.rect(0, 120, W, 90, "F");

  // NUVENS
  doc.setFillColor(255, 255, 255);
  doc.circle(40, 35, 15, "F");
  doc.circle(55, 32, 20, "F");
  doc.circle(75, 36, 15, "F");

  doc.circle(190, 38, 18, "F");
  doc.circle(210, 32, 24, "F");
  doc.circle(235, 38, 18, "F");

  // SOL
  doc.setFillColor(255, 205, 65);
  doc.circle(260, 32, 24, "F");

  // MONTES
  doc.setFillColor(130, 210, 95);
  doc.ellipse(75, 130, 80, 45, "F");
  doc.ellipse(180, 132, 85, 48, "F");
  doc.ellipse(260, 128, 70, 40, "F");

  // CABEÇALHO
  doc.setFillColor(255, 150, 60);
  doc.roundedRect(14, 14, 120, 25, 7, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Carteirinha Infantil", 25, 31);

  doc.setFillColor(255, 235, 130);
  doc.roundedRect(150, 15, 62, 20, 6, 6, "F");

  doc.setTextColor(255, 120, 45);
  doc.setFontSize(15);
  doc.text("VACINAÇÃO", 163, 28);

  // FOTO
  addFoto(doc, registro.fotoBebe, 18, 52, 65, 65);

  // DADOS CRIANÇA
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(92, 52, 83, 65, 7, 7, "F");

  doc.setFillColor(100, 200, 255);
  doc.roundedRect(92, 52, 83, 13, 7, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("DADOS DA CRIANÇA", 111, 61);

  doc.setTextColor(30, 45, 70);
  doc.setFontSize(9);
  doc.text(`Nome: ${registro.crianca || "-"}`, 98, 75);
  doc.text(`Idade: ${registro.idade || "-"}`, 98, 84);
  doc.text(`Nascimento: ${dataBR(registro.nascimento)}`, 98, 93);
  doc.text(`Peso: ${registro.peso || "-"}`, 98, 102);
  doc.text(`Altura: ${registro.altura || "-"}`, 98, 111);

  // RESPONSÁVEL
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(18, 130, 157, 45, 7, 7, "F");

  doc.setFillColor(255, 190, 80);
  doc.roundedRect(18, 130, 157, 13, 7, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("RESPONSÁVEL / MÉDICO", 65, 139);

  doc.setTextColor(30, 45, 70);
  doc.setFontSize(9);
  doc.text(`Responsável: ${registro.responsavel || "-"}`, 25, 154);
  doc.text(`CPF: ${registro.cpfResponsavel || "-"}`, 25, 163);
  doc.text(`Médico: ${registro.medico || "-"}`, 95, 154);
  doc.text(`CRM: ${registro.crmMedico || "-"}`, 95, 163);

  // BICHINHOS
  animal(doc, 55, 188, "urso");
  animal(doc, 100, 190, "raposa");
  animal(doc, 145, 188, "coelho");

  // TABELA VACINAS
  const x = 186;
  const y = 52;
  const col1 = 39;
  const col2 = 32;
  const col3 = 35;
  const row = 9.6;

  doc.setFillColor(80, 180, 120);
  doc.roundedRect(x, 43, col1 + col2 + col3 + 4, 11, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("REGISTRO DE VACINAS", x + 27, 51);

  doc.setFillColor(255, 150, 60);
  doc.rect(x, y, col1, row, "F");
  doc.rect(x + col1 + 1, y, col2, row, "F");
  doc.rect(x + col1 + col2 + 2, y, col3, row, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text("VACINA", x + 11, y + 6);
  doc.text("DATA", x + col1 + 11, y + 6);
  doc.text("RETORNO", x + col1 + col2 + 10, y + 6);

  vacinasFixas.forEach((nome, i) => {
    const yy = y + row + 2 + i * row;
    const vacina = encontrarVacina(registro, nome);

    doc.setFillColor(255, 255, 255);
    doc.rect(x, yy, col1, row - 1, "F");

    doc.setFillColor(255, 240, 245);
    doc.rect(x + col1 + 1, yy, col2, row - 1, "F");
    doc.rect(x + col1 + col2 + 2, yy, col3, row - 1, "F");

    doc.setDrawColor(210, 210, 210);
    doc.rect(x, yy, col1, row - 1);
    doc.rect(x + col1 + 1, yy, col2, row - 1);
    doc.rect(x + col1 + col2 + 2, yy, col3, row - 1);

    doc.setTextColor(30, 45, 70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.text(nome, x + 2, yy + 6);

    if (vacina) {
      doc.setFontSize(6);
      doc.text(dataBR(vacina.aplicadaEm), x + col1 + 3, yy + 6);
      doc.text(vacina.retornoEm || "-", x + col1 + col2 + 5, yy + 6);
    }
  });

  // RODAPÉ
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 184, 165, 15, 5, 5, "F");

  doc.setTextColor(80, 180, 120);
  doc.setFontSize(10);
  doc.text("Hospital SUL • Cuidando com carinho", 35, 194);

  doc.setTextColor(255, 150, 60);
  doc.setFontSize(8);
  doc.text("Desenvolvido por Marcos / Rise", 215, 198);

  doc.save(`${registro.crianca || "carteirinha"}-vacinas.pdf`);
}