import jsPDF from "jspdf";
import QRCode from "qrcode";

const normalizar = (valor) => String(valor || "Não informado");

export async function gerarPDF({ titulo, hospital, dados, assinatura }) {
  const doc = new jsPDF();

  doc.setFillColor(7, 17, 31);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 12, 186, 273, 5, 5, "F");

  doc.setTextColor(0, 255, 170);
  doc.setFontSize(22);
  doc.text(hospital?.nome || "Hospital SUL", 20, 25);

  doc.setTextColor(220, 235, 245);
  doc.setFontSize(10);
  doc.text(hospital?.subtitulo || "Sistema Médico Hospitalar", 20, 32);

  doc.setDrawColor(0, 255, 170);
  doc.line(20, 38, 190, 38);

  const qr = await QRCode.toDataURL(
    JSON.stringify({
      titulo,
      hospital: hospital?.nome || "Hospital SUL",
      data: new Date().toLocaleString()
    })
  );

  doc.addImage(qr, "PNG", 158, 17, 30, 30);

  doc.setTextColor(0, 255, 170);
  doc.setFontSize(16);
  doc.text(titulo, 20, 52);

  let y = 66;
  doc.setFontSize(11);

  dados.forEach((item) => {
    if (y > 245) {
      doc.addPage();
      doc.setFillColor(7, 17, 31);
      doc.rect(0, 0, 210, 297, "F");
      y = 25;
    }

    doc.setTextColor(0, 255, 170);
    doc.text(`${item.label}:`, 20, y);

    doc.setTextColor(255, 255, 255);

    const linhas = doc.splitTextToSize(normalizar(item.valor), 120);

    doc.text(linhas, 70, y);

    y += Math.max(8, linhas.length * 6);
  });

  if (assinatura) {
    doc.addImage(assinatura, "PNG", 25, 225, 55, 25);
    doc.setTextColor(255, 255, 255);
    doc.text("Assinatura digital", 25, 258);
  }

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);

  doc.text(
    `${hospital?.rodape || "Hospital SUL / desenvolvido por Marcos / Rise"} • ${new Date().toLocaleString()}`,
    20,
    276
  );

  doc.save(`${titulo.replaceAll(" ", "-")}.pdf`);
}

export function imprimirRelatorio(titulo, dados, hospital) {
  const linhas = dados
    .map((d) => `<p><strong>${d.label}:</strong> ${normalizar(d.valor)}</p>`)
    .join("");

  const html = `
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #111827;
          }
          h1 {
            color: #047857;
          }
          h2 {
            border-bottom: 2px solid #047857;
            padding-bottom: 10px;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
          }
          footer {
            margin-top: 40px;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${hospital?.nome || "Hospital SUL"}</h1>
        <h2>${titulo}</h2>
        ${linhas}
        <footer>${hospital?.rodape || "Hospital SUL / desenvolvido por Marcos / Rise"}</footer>
        <script>window.print();</script>
      </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}