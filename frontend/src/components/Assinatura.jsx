import { useRef } from "react";

import SignatureCanvas
from "react-signature-canvas";

export default function Assinatura({

  setAssinatura

}) {

  const assinaturaRef = useRef();

  const salvarAssinatura = () => {

    const assinaturaBase64 =

      assinaturaRef.current
      .toDataURL();

    setAssinatura(
      assinaturaBase64
    );

    alert(
      "Assinatura salva"
    );
  };

  const limparAssinatura = () => {

    assinaturaRef.current.clear();
  };

  return (

    <div className="assinatura-box">

      <h3>
        Assinatura Digital
      </h3>

      <SignatureCanvas

        ref={assinaturaRef}

        penColor="#00ffaa"

        canvasProps={{

          width: 500,

          height: 200,

          className:
            "assinatura-canvas"

        }}
      />

      <div className="assinatura-buttons">

        <button
          onClick={
            salvarAssinatura
          }
        >
          Salvar
        </button>

        <button
          onClick={
            limparAssinatura
          }
        >
          Limpar
        </button>

      </div>

    </div>
  );
}