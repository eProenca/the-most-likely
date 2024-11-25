import { db, collection, addDoc, getDocs, deleteDoc } from "../utils/config/firebase";

// Lista de perguntas
const questions = [
  "Quem é mais provável de esquecer o aniversário de alguém?",
  "Quem é mais provável de se perder em uma cidade desconhecida?",
  "Quem é mais provável de ganhar um prêmio em um sorteio?",
  // "Quem é mais provável de cantar em um karaokê?",
  // "Quem é mais provável de fazer uma surpresa para alguém?",
  // "Quem é mais provável de chorar assistindo um filme?",
  // "Quem é mais provável de se atrasar para um compromisso?",
  // "Quem é mais provável de ser eleito o mais preguiçoso?",
  // "Quem é mais provável de viajar para o exterior sem avisar ninguém?",
  // "Quem é mais provável de esquecer a chave em casa?",
  // "Quem é mais provável de ganhar um concurso de dança?",
  // "Quem é mais provável de comer o último pedaço de pizza?",
  // "Quem é mais provável de rir em um momento sério?",
  // "Quem é mais provável de salvar o mundo de um desastre?",
  // "Quem é mais provável de esquecer o que ia falar no meio de uma conversa?",
  // "Quem é mais provável de passar horas navegando na internet?",
  // "Quem é mais provável de entrar em uma competição sem querer ganhar?",
  // "Quem é mais provável de ter uma grande ideia em um momento inesperado?",
  // "Quem é mais provável de dar um presente super criativo?",
  // "Quem é mais provável de ganhar em um jogo de tabuleiro?",
  // "Quem é mais provável de ficar sem bateria no celular durante o dia?",
  // "Quem é mais provável de se vestir mal em uma festa?",
  // "Quem é mais provável de comer algo muito picante e não aguentar?",
  // "Quem é mais provável de fazer amigos onde quer que vá?",
  // "Quem é mais provável de aparecer em um reality show?",
  // "Quem é mais provável de cantar no chuveiro?",
  // "Quem é mais provável de passar o dia inteiro assistindo a séries?",
  // "Quem é mais provável de fazer uma piada sem graça?",
  // "Quem é mais provável de arranjar desculpas para não sair de casa?",
  // "Quem é mais provável de ter uma ideia louca e levar adiante?",
];

// Embaralha as perguntas
const shuffleQuestions = (questions) => {
  return questions
    .map((question) => ({ question, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
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
