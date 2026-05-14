import jsPDF from "jspdf";
import QRCode from "qrcode";

const formatarResultado = (resultado) =>
  Object.entries(resultado || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

export async function gerarPDFPaciente({
  paciente,
  exames,
  medico,
  assinatura,
  vereditoFeminino
}) {
  const doc = new jsPDF();

  doc.setFillColor(7, 17, 31);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 12, 186, 273, 5, 5, "F");

  doc.setTextColor(0, 255, 170);
  doc.setFontSize(22);
  doc.text("HOSPITAL SUL", 20, 25);

  doc.setTextColor(220, 235, 245);
  doc.setFontSize(10);
  doc.text("Relatório médico integrado • EMS RP", 20, 32);

  const qr = await QRCode.toDataURL(
    JSON.stringify({
      paciente: paciente.nome,
      id: paciente.id,
      exames: exames.length,
      data: new Date().toLocaleString()
    })
  );

  doc.addImage(qr, "PNG", 158, 17, 30, 30);

  doc.setDrawColor(0, 255, 170);
  doc.line(20, 40, 190, 40);

  let y = 55;

  const linha = (label, valor) => {
    if (y > 260) {
      doc.addPage();
      doc.setFillColor(7, 17, 31);
      doc.rect(0, 0, 210, 297, "F");
      y = 25;
    }

    doc.setTextColor(0, 255, 170);
    doc.setFontSize(10);
    doc.text(`${label}:`, 20, y);

    doc.setTextColor(255, 255, 255);
    const linhas = doc.splitTextToSize(String(valor || "Não informado"), 115);
    doc.text(linhas, 70, y);

    y += Math.max(8, linhas.length * 6);
  };

  linha("Paciente", paciente.nome);
  linha("ID", paciente.id);
  linha("Sexo", paciente.sexo);
  linha("Idade", paciente.idade);
  linha("Telefone", paciente.telefone);
  linha("Motivo", paciente.motivo);
  linha("Médico", medico.nome);
  linha("CRM", medico.crm);
  linha("Data", new Date().toLocaleString());

  if (vereditoFeminino) {
    y += 5;
    linha("Veredito RP", vereditoFeminino.veredito);
    linha("Conduta", vereditoFeminino.conduta);
    linha("Base do veredito", vereditoFeminino.resumo);
  }

  y += 8;

  exames.forEach((exame, index) => {
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(13);
    doc.text(`${index + 1}. ${exame.tipo}`, 20, y);
    y += 8;

    linha("Resultado", formatarResultado(exame.resultado));
    y += 4;
  });

  if (assinatura) {
    if (y > 220) {
      doc.addPage();
      doc.setFillColor(7, 17, 31);
      doc.rect(0, 0, 210, 297, "F");
      y = 35;
    }

    doc.addImage(assinatura, "PNG", 25, y + 5, 60, 28);
    y += 40;
    doc.setTextColor(255, 255, 255);
    doc.text("Assinatura digital do responsável", 25, y);
  }

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text(
    "Hospital SUL / desenvolvido por: Marcos / Rise • Documento RP",
    20,
    282
  );

  doc.save(`${paciente.nome || "paciente"}-exames.pdf`);
}