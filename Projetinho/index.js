const quizContainer = document.getElementById('quiz');
const resultContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');

const myQuestion = [
    {
        question:"Oque fazer caso o termo de serviços aparecer em um site que você acessou." ,
        answer:{
            a:"Clicar em aceitar e não ler.",
            b:"Ler o termo de serviços e assim fazer a decisão de aceitar ou não.",
            c:"Ler só o começo e decidir só com isso."
        },
        correctAnswer:"b"
    },

//Escrever mais, pelo menos 4+

]

function buildQuiz(){
    const output =[];

    myQuestions.forEach(
        (currentQuestion, questionNumber) => {

            const answer =[];

            for(letter in currentQuestion.answer){
                
                answers.push(
                    `<label>
                    <input type="radio" name="question${questionNumber}" value="${letter}">
                    ${letter} :
                    ${currentQuestion.answer[letter]}
                    </labels>`
                );
            }

            output.push(
                `<div class="question"> ${currentQuestion.question} </div>`
                `<div class="answer"> ${answer.join(")} </div>
            );
        }
    );

    quizContainer.innerHTML = output.join(");
    }