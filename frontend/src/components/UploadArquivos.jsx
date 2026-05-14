// frontend/src/components/UploadArquivos.jsx

import { useEffect, useState } from "react";

import api from "../services/api";

export default function UploadArquivos({
  usuarioAtual
}) {

  const [arquivos, setArquivos] =
    useState([]);

  const [busca, setBusca] =
    useState("");

  const [form, setForm] =
    useState({
      pacienteId: "",
      pacienteNome: "",
      tipo: "Exame",
      descricao: "",
      arquivo: null
    });

  const carregarArquivos = async () => {

    try {

      const response =
        await api.get("/api/arquivos");

      setArquivos(response.data);

    } catch (error) {

      console.log(error);

      alert(
        "Erro ao carregar arquivos"
      );
    }
  };

  useEffect(() => {

    carregarArquivos();

  }, []);

  const enviarArquivo = async () => {

    if (!form.arquivo) {

      return alert(
        "Escolha um arquivo"
      );
    }

    try {

      const data = new FormData();

      data.append(
        "arquivo",
        form.arquivo
      );

      data.append(
        "pacienteId",
        form.pacienteId
      );

      data.append(
        "pacienteNome",
        form.pacienteNome
      );

      data.append(
        "tipo",
        form.tipo
      );

      data.append(
        "descricao",
        form.descricao
      );

      data.append(
        "medico",
        usuarioAtual?.nome ||
        "Não informado"
      );

      await api.post(
        "/api/upload",
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      alert(
        "Arquivo enviado"
      );

      setForm({
        pacienteId: "",
        pacienteNome: "",
        tipo: "Exame",
        descricao: "",
        arquivo: null
      });

      document.getElementById(
        "arquivo-upload"
      ).value = "";

      carregarArquivos();

    } catch (error) {

      console.log(error);

      alert(
        "Erro ao enviar arquivo"
      );
    }
  };

  const apagarArquivo = async (id) => {

    const confirmar =
      window.confirm(
        "Deseja apagar?"
      );

    if (!confirmar) return;

    try {

      await api.delete(
        `/api/arquivos/${id}`
      );

      carregarArquivos();

    } catch (error) {

      console.log(error);

      alert(
        "Erro ao apagar"
      );
    }
  };

  const arquivosFiltrados =
    arquivos.filter((a) =>
      JSON.stringify(a)
      .toLowerCase()
      .includes(
        busca.toLowerCase()
      )
    );

  return (

    <div>

      <h2>
        Upload de Arquivos
      </h2>

      <div className="form">

        <input
          placeholder="ID do Paciente"
          value={form.pacienteId}
          onChange={(e) =>
            setForm({
              ...form,
              pacienteId:
                e.target.value
            })
          }
        />

        <input
          placeholder="Nome do Paciente"
          value={form.pacienteNome}
          onChange={(e) =>
            setForm({
              ...form,
              pacienteNome:
                e.target.value
            })
          }
        />

        <select
          value={form.tipo}
          onChange={(e) =>
            setForm({
              ...form,
              tipo:
                e.target.value
            })
          }
        >

          <option value="Exame">
            Exame
          </option>

          <option value="Raio-X">
            Raio-X
          </option>

          <option value="Imagem">
            Imagem
          </option>

          <option value="Receita">
            Receita
          </option>

          <option value="Documento">
            Documento
          </option>

          <option value="Pediatria">
            Pediatria
          </option>

          <option value="Obstetrícia">
            Obstetrícia
          </option>

          <option value="Vigilância Sanitária">
            Vigilância Sanitária
          </option>

        </select>

        <textarea
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) =>
            setForm({
              ...form,
              descricao:
                e.target.value
            })
          }
        />

        <input
          id="arquivo-upload"
          type="file"
          accept="
          image/*,
          .pdf,
          .txt,
          .doc,
          .docx
          "
          onChange={(e) =>
            setForm({
              ...form,
              arquivo:
                e.target.files[0]
            })
          }
        />

        <button
          onClick={enviarArquivo}
        >
          Enviar Arquivo
        </button>

      </div>

      <input
        className="search-input"
        placeholder="Pesquisar arquivo"
        value={busca}
        onChange={(e) =>
          setBusca(
            e.target.value
          )
        }
      />

      <div className="patients-list">

        {
          arquivosFiltrados.length === 0 ? (

            <div className="history-card">

              Nenhum arquivo encontrado

            </div>

          ) : (

            arquivosFiltrados.map((a) => (

              <div
                className="history-card"
                key={a.id}
              >

                <h3>
                  {a.tipo}
                </h3>

                <p>
                  Paciente:
                  {" "}
                  {a.pacienteNome}
                </p>

                <p>
                  ID:
                  {" "}
                  {a.pacienteId}
                </p>

                <p>
                  Médico:
                  {" "}
                  {a.medico}
                </p>

                <p>
                  Arquivo:
                  {" "}
                  {a.nomeOriginal}
                </p>

                <p>
                  Data:
                  {" "}
                  {a.data}
                </p>

                <p>
                  Descrição:
                  {" "}
                  {a.descricao}
                </p>

                {
                  a.mimetype?.startsWith(
                    "image/"
                  ) && (

                    <img
                      src={
                        `http://localhost:5000${a.caminho}`
                      }
                      alt="preview"
                      className="
                      upload-preview
                      "
                    />

                  )
                }

                <a
                  href={
                    `http://localhost:5000${a.caminho}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                  exam-btn
                  file-link
                  "
                >
                  Abrir / Baixar
                </a>

                <button
                  className="
                  delete-btn
                  "
                  onClick={() =>
                    apagarArquivo(
                      a.id
                    )
                  }
                >
                  Apagar Arquivo
                </button>

              </div>

            ))

          )
        }

      </div>

    </div>

  );
}