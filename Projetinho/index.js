import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [perguntas, setPerguntas] = useState([]);
  const [respostasSelecionadas, setRespostasSelecionadas] = useState({});
  const [resultado, setResultado] = useState({});
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4050/perguntas')
      .then(res => res.json())
      .then(data => setPerguntas(data))
      .catch(err => console.error('Erro ao carregar perguntas', err));
  }, []);

  const selecionarAlternativa = (perguntaId, alternativaId) => {
    if (enviado) return; // impede mudanças após envio
    setRespostasSelecionadas({ ...respostasSelecionadas, [perguntaId]: alternativaId });
  };

  const verificarRespostas = () => {
    const resultadoVerificado = {};
    perguntas.forEach(pergunta => {
      const corretaId = pergunta.alternativaCorreta?.id;
      const respondidaId = respostasSelecionadas[pergunta.id];
      resultadoVerificado[pergunta.id] = respondidaId === corretaId;
    });
    setResultado(resultadoVerificado);
    setEnviado(true);
  };

  function resetarRespostas() {
    respostas = [];
    acertos = 0;
    document.getElementById('validador').textContent = 'Verificar Respostas';
    carregarPerguntas(); // Recarrega as perguntas para limpar a seleção
}


  const getBotaoStyle = (pergunta, alt) => {
    const selecionada = respostasSelecionadas[pergunta.id] === alt.id;
    const correta = pergunta.alternativaCorreta?.id === alt.id;
    const foiEnviado = enviado;

    if (foiEnviado) {
      if (correta) {
        return { backgroundColor: 'green', color: 'white', fontWeight: 'bold' };
      } else if (selecionada && !correta) {
        return { backgroundColor: 'red', color: 'white' };
      }
    } else if (selecionada) {
      return { backgroundColor: '#007bff', color: 'white' };
    }

    return { backgroundColor: '#f0f0f0' };
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Formulário de Perguntas</h1>
      {perguntas.map(pergunta => (
        <div key={pergunta.id} style={{ marginBottom: 40 }}>
          <h2>{pergunta.titulo}</h2>
          <p class="enunciado">{pergunta.enunciado}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pergunta.alternativas.map(alt => (
              <button
                key={alt.id}
                onClick={() => selecionarAlternativa(pergunta.id, alt.id)}
                style={{
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 5,
                  textAlign: 'left',
                  cursor: 'pointer',
                  ...getBotaoStyle(pergunta, alt)
                }}
              >
                <strong>{alt.alternativa})</strong> {alt.enunciado}
              </button>
            ))}
          </div>
          {enviado && resultado[pergunta.id] !== undefined && (
            <p style={{ marginTop: 10, fontWeight: 'bold', color: resultado[pergunta.id] ? 'green' : 'red' }}>
              {resultado[pergunta.id] ? '✅ Resposta correta!' : '❌ Resposta incorreta.'}
            </p>
          )}
        </div>
      ))}
      {!enviado && (
        <button
          onClick={verificarRespostas}
          style={{
            marginTop: 20,
            padding: '12px 20px',
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
        >

<button id="resetar" onclick="resetarRespostas()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px;">
    Resetar Respostas
</button>




          Enviar Respostas
        </button>
      )}
      {enviado && (
        <button
          onClick={() => {
            setRespostasSelecionadas({});
            setResultado({});
            setEnviado(false);
          }}
          style={{
            marginTop: 20,
            padding: '12px 20px',
            fontSize: 16,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
        >
          Refazer
        </button>





      )}
    </div>
  );
};

const container = document.getElementById('root');
createRoot(container).render(<App />);
