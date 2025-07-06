import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [perguntas, setPerguntas] = useState([]);

  useEffect(() => {
    async function fetchPerguntas() {
      try {
        const resposta = await fetch('http://localhost:4050/perguntas');
        const dados = await resposta.json();
        setPerguntas(dados);
      } catch (erro) {
        console.error('Erro ao buscar perguntas:', erro);
      }
    }

    fetchPerguntas();
  }, []);

  return (
    <div className="App">
      <h1>Formulário de Perguntas</h1>
      {perguntas.map((pergunta) => (
        <div key={pergunta.id} className="pergunta">
          <h2>{pergunta.titulo}</h2>
          <p>{pergunta.enunciado}</p>
          <ul>
            {pergunta.alternativas.map((alt) => (
              <li
                key={alt.id}
                className={
                  alt.id === pergunta.alternativaCorretaId
                    ? 'correta'
                    : 'alternativa'
                }
              >
                {alt.alternativa}) {alt.enunciado}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
