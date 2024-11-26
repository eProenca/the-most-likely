import { db, collection, addDoc, getDocs, deleteDoc } from "../utils/config/firebase";

// Lista de perguntas
const questions = [
  "Quem é o mais provável de ser pego cantando no carro?",
  "Quem é o mais provável de virar vegetariano do nada?",
  "Quem é o mais provável de ser o mestre de piadas ruins?",
  "Quem é o mais provável de dar o melhor conselho em uma situação difícil?",
  "Quem é o mais provável de sair de casa e esquecer algo importante?",
  "Quem é o mais provável de perder o busão ou o metrô?",
  "Quem é o mais provável de fazer amigos em uma fila de supermercado?",
  "Quem é o mais provável de ser o primeiro a falar o que pensa, sem filtro?",
  "Quem é o mais provável de arrumar confusão em um evento?",
  "Quem é o mais provável de fazer um investimento muito arriscado e perder dinheiro?",
  "Quem é o mais provável de mandar uma mensagem errada para a pessoa errada?",
  "Quem é o mais provável de contar um segredo sem querer?",
  "Quem é o mais provável de mentir por uma boa causa?",
  "Quem é o mais provável de cantar alto e desafinado em público?",
  "Quem é o mais provável de fazer uma história absurda e convencer todo mundo de que é verdade?",
  "Quem é o mais provável de tentar uma dieta e falhar miseravelmente?",
  "Quem é o mais provável de fazer uma compra de impulso totalmente desnecessária?",
  "Quem é mais provável de passar horas debugando um erro causado por um parênteses faltando?",
  "Quem é mais provável de quebrar o sistema com uma única linha de código?",
  "Quem é mais provável de corrigir um bug que ninguém mais consegue resolver?",
  "Quem é mais provável de automatizar tarefas do dia a dia só para evitar trabalho manual?",
  "Quem é mais provável de iniciar um projeto paralelo durante o expediente?",
  "Quem é mais provável de se voluntariar para revisar o código dos colegas?",
  "Quem é mais provável de se atrasar para uma reunião?",
  "Quem é mais provável de trabalhar o dia inteiro de pijama?",
  "Quem é mais provável de levar lanches para o escritório e compartilhar com a equipe?",
  "Quem é mais provável de responder mensagens de trabalho no final de semana?",
  "Quem é mais provável de esquecer de atualizar o status no Jira?",
  "Quem é mais provável de pedir uma pausa na reunião para pegar café?",
  "Quem é mais provável de ter a mesa mais bagunçada no escritório?",
  "Quem é mais provável de dizer “vocês estão me ouvindo?” em toda reunião online?",
  "Quem é mais provável de ser o primeiro a se inscrever como voluntário em tarefas difíceis?",
  "Quem é mais provável de ser escolhido(a) para representar a squad em uma reunião geral?",
  "Quem é mais provável de encontrar bugs nos testes de outra squad?",
  "Quem é mais provável de responder “funciona na minha máquina” para tudo?",
  "Quem é mais provável de ser o pacificador quando há conflitos na equipe?",
  "Quem é mais provável de estar comendo durante a reunião sem perceber que está no vídeo?",
  "Quem é mais provável de confundir a agenda e entrar na reunião errada?",
  "Quem é mais provável de começar a falar com o microfone desligado?",
  "Quem é mais provável de dar “Alt+F4” no meio de uma call achando que ia fechar só a aba?",
  "Quem é mais provável de virar referência na squad por quebrar o ambiente de desenvolvimento?",
  "Quem é mais provável de apagar a base de dados de desenvolvimento sem querer?",
  "Quem é mais provável de se oferecer para revisar o código e passar um bom tempo reclamando do estilo?",
  "Quem é mais provável de esquecer o aniversário de alguém?",
  "Quem é mais provável de ganhar um prêmio em um sorteio?",
  "Quem é mais provável de fazer uma surpresa para alguém?",
  "Quem é mais provável de chorar assistindo um filme?",
  "Quem é mais provável de viajar para o exterior sem avisar ninguém?",
  "Quem é mais provável de comer o último pedaço de pizza?",
  "Quem é mais provável de rir em um momento sério?",
  "Quem é mais provável de salvar o mundo de um desastre?",
  "Quem é mais provável de esquecer o que ia falar no meio de uma conversa?",
  "Quem é mais provável de passar horas navegando na internet?",
  "Quem é mais provável de ter uma grande ideia em um momento inesperado?",
  "Quem é mais provável de dar um presente super criativo?",
  "Quem é mais provável de se vestir mal em uma festa?",
  "Quem é mais provável de comer algo muito picante e não aguentar?",
  "Quem é mais provável de fazer amigos onde quer que vá?",
  "Quem é mais provável de aparecer em um reality show?",
  "Quem é mais provável de passar o dia inteiro assistindo a séries?",
  "Quem é mais provável de arranjar desculpas para não sair de casa?",
  "Quem é mais provável de ter uma ideia louca e levar adiante?"
];

// Embaralha as perguntas
const shuffleQuestions = (questions) => {
  return questions
    .map((question) => ({ question, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 30)
    .map((item, index) => ({
      number: index + 1,
      question: item.question,
      votes: 0, // Inicializa os votos como 0
      status: 1, // Status inicial como "waiting"
    }));
};

// Limpa a coleção de perguntas no Firestore
const clearQuestionsInFirestore = async () => {
  const questionsRef = collection(db, "questions");
  const snapshot = await getDocs(questionsRef);

  // Deleta todos os documentos existentes na coleção
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Adiciona as perguntas embaralhadas ao Firestore
const saveQuestionsToFirestore = async (shuffledQuestions) => {
  const questionsRef = collection(db, "questions");

  // Adiciona cada pergunta na coleção Firestore
  const savePromises = shuffledQuestions.map((question) =>
    addDoc(questionsRef, question)
  );
  await Promise.all(savePromises);
};

// Função principal para gerenciar as perguntas
const initializeQuestions = async () => {
  try {
    // Sempre limpa a coleção antes de adicionar as novas perguntas
    console.log("Limpando coleção 'questions'...");
    await clearQuestionsInFirestore();

    // Embaralha e salva as perguntas
    const shuffledQuestions = shuffleQuestions(questions);
    await saveQuestionsToFirestore(shuffledQuestions);

    console.log("Perguntas inicializadas no Firestore com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar perguntas:", error);
  }
};

export default initializeQuestions;
