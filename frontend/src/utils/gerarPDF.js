import jsPDF from "jspdf";

import QRCode from "qrcode";

const gerarPDF = async (

  paciente,
  exame,
  assinatura

) => {

  const doc = new jsPDF();

  /* FUNDO */

  doc.setFillColor(
    11,
    17,
    32
  );

  doc.rect(
    0,
    0,
    220,
    300,
    "F"
  );

  /* TÍTULO */

  doc.setTextColor(
    0,
    255,
    170
  );

  doc.setFontSize(24);

  doc.text(
    "HOSPITAL SUL",
    20,
    20
  );

  /* SUBTÍTULO */

  doc.setFontSize(12);

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.text(
    "Sistema Médico Hospitalar",
    20,
    30
  );

  /* LINHA */

  doc.setDrawColor(
    0,
    255,
    170
  );

  doc.line(
    20,
    35,
    190,
    35
  );

  /* DADOS */

  doc.setFontSize(14);

  doc.text(
    `Paciente: ${paciente.nome}`,
    20,
    55
  );

  doc.text(
    `ID: ${paciente.id}`,
    20,
    65
  );

  doc.text(
    `Idade: ${paciente.idade}`,
    20,
    75
  );

  doc.text(
    `Tipo Sanguíneo: ${paciente.sangue}`,
    20,
    85
  );

  doc.text(
    `Motivo: ${paciente.motivo}`,
    20,
    95
  );

  doc.text(
    `Exame: ${exame.tipo}`,
    20,
    105
  );

  doc.text(
    `Médico: ${exame.medico}`,
    20,
    115
  );

  doc.text(
    `Data: ${exame.data}`,
    20,
    125
  );

  /* RESULTADO */

  doc.setTextColor(
    0,
    255,
    170
  );

  doc.text(
    "RESULTADOS",
    20,
    150
  );z

  doc.setTextColor(
    255,
    255,
    255
  );

  let y = 165;

  Object.entries(
    exame.resultado
  ).forEach(([key, value]) => {

    doc.text(
      `${key}: ${value}`,
      20,
      y
    );

    y += 10;
  });

  /* ASSINATURA */

  if (assinatura) {

    doc.addImage(

      assinatura,

      "PNG",

      20,

      220,

      60,

      30
    );

    doc.text(
      "Assinatura Médica",
      20,
      260
    );
  }

  /* QR CODE */

  const qrCode =
    await QRCode.toDataURL(

      JSON.stringify({
        paciente:
          paciente.nome,
        exame:
          exame.tipo
      })

    );

  doc.addImage(

    qrCode,

    "PNG",

    145,

    210,

    40,

    40
  );

  /* DOWNLOAD */

  doc.save(

    `${paciente.nome}-${exame.tipo}.pdf`

  );
};

export default gerarPDF;