function toggleCalculator() {
  var sidebar = document.getElementById("calculator-sidebar");
  sidebar.classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", () => {
  nextButton.classList.add("hide");
});
const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const questionContainerElement = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const quizAppElement = document.getElementById("quiz-app");
const resultsElement = document.createElement("div");
const progressFull = document.getElementById("progressFull");
const progressText = document.getElementById("progressText");
const timerElement = document.getElementById("timer");
const searchInput = document.getElementById("search-input");
resultsElement.setAttribute("id", "results");
resultsElement.classList.add("results", "hide");
quizAppElement.appendChild(resultsElement);

let shuffledQuestions, currentQuestionIndex;
let score = 0;
let questionStartTime,
  totalQuizTime = 0;
const questionTimes = [];

startButton.addEventListener("click", function () {
  const textSearch = searchInput.value.trim().toLowerCase();
  const availableQuizzes = ["math", "logic"];
  if (availableQuizzes.includes(textSearch)) {
    startQuiz(textSearch);
  } else {
    startGame();
  }
});

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});

searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const textSearch = searchInput.value.trim().toLowerCase();
    if (textSearch) {
      handleSearch(textSearch);
    }
  }
});

function handleSearch(textSearch) {
  const availableQuizzes = ["math", "logic"];
  if (availableQuizzes.includes(textSearch)) {
    alert("Quiz found.");
  } else {
    alert("Quiz not found. Please check for typo");
  }
}

function voice() {
  var recognition = new webkitSpeechRecognition();
  recognition.lang = "en-GB";
  recognition.onresult = function (event) {
    console.log(event);
    document.getElementById("search-input").value =
      event.results[0][0].transcript;
  };
  recognition.start();
}

function startQuiz(quizType) {
  resultsElement.classList.add("hide");
  score = 0;
  currentQuestionIndex = 0;
  totalQuizTime = 0;
  questionTimes.length = 0;
  let filteredQuestions = questions.filter(
    (question) => question.quizType.toLowerCase() === quizType
  );
  startButton.classList.add("hide");
  shuffledQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
  currentQuestionIndex = 0;
  questionContainerElement.classList.remove("hide");
  setNextQuestion();
}

function startQuizDiff(quizType, difficulty) {
  resultsElement.classList.add("hide");
  score = 0;
  currentQuestionIndex = 0;
  totalQuizTime = 0;
  questionTimes.length = 0;
  let filteredQuestions;
  filteredQuestions = questions.filter(
    (question) =>
      question.quizType.toLowerCase() === quizType &&
      question.difficulty.toLowerCase() === difficulty
  );
  startButton.classList.add("hide");
  shuffledQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
  currentQuestionIndex = 0;
  questionContainerElement.classList.remove("hide");
  setNextQuestion();
}

function startGame() {
  startButton.classList.add("hide");
  shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  currentQuestionIndex = 0;
  questionContainerElement.classList.remove("hide");
  setNextQuestion();
}

function setNextQuestion() {
  resetState();
  startQuestionTimer();
  showQuestion(shuffledQuestions[currentQuestionIndex]);
  progressBar();
}

function progressBar() {
  progressFull.style.width = `${
    ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100
  }%`;
  progressText.innerHTML = `${currentQuestionIndex + 1} out of ${
    shuffledQuestions.length
  }`;
}

function resetState() {
  clearStatusClass(document.body);
  nextButton.classList.add("hide");
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild);
  }
}

function showQuestion(question) {
  questionElement.innerText = question.question;
  question.answers.forEach((answer) => {
    const button = document.createElement("button");

    button.innerText = answer.text;
    button.classList.add("btn");
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener("click", () => selectAnswer(button));
    answerButtonsElement.appendChild(button);
  });
}

function selectAnswer(selectedButton) {
  Array.from(answerButtonsElement.children).forEach((button) => {
    button.disabled = true;
  });

  const correct = selectedButton.dataset.correct;
  if (correct) {
    score++;
  }
  setStatusClass(selectedButton, correct);
  Array.from(answerButtonsElement.children).forEach((button) => {
    if (button.dataset.correct) {
      setStatusClass(button, true);
    }
  });

  stopQuestionTimer();
  totalQuizTime += questionTimes[questionTimes.length - 1];
  setTimeout(() => {
    if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide');
    } else {
        concludeQuiz();
    }
}, 100);
}

function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add("correct");
  } else {
    element.classList.add("wrong");
  }
}

function clearStatusClass(element) {
  element.classList.remove("correct");
  element.classList.remove("wrong");
}

function concludeQuiz() {
  questionContainerElement.classList.add("hide");
  nextButton.classList.add("hide");
  stopTotalQuizTimer();

  const totalTimeInSeconds = questionTimes
    .reduce((total, time) => total + time, 0)
    .toFixed(2);
  let questionTimeDetails = "";
  questionTimes.forEach((time, index) => {
    questionTimeDetails += `<p>Question ${index + 1}: ${time.toFixed(
      2
    )} seconds</p>`;
  });

  resultsElement.classList.remove("hide");
  timerElement.textContent = `Total Time: ${totalTimeInSeconds}s`;
  resultsElement.innerHTML = `
      <h2>Quiz Completed!</h2>
      <p>Your score: ${score} out of ${shuffledQuestions.length}</p>
      ${questionTimeDetails}
      <b>
      <button onclick="restartQuiz()" class="restart-btn">Restart Quiz</button>
  `;
  quizAppElement.appendChild(resultsElement);
}

function restartQuiz() {
  resultsElement.classList.add("hide");
  score = 0;
  currentQuestionIndex = 0;
  totalQuizTime = 0;
  questionTimes.length = 0;
  startGame();
}

function startQuestionTimer() {
  questionStartTime = new Date();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000); // Update timer every second
}

function updateTimer() {
  const currentTime = new Date();
  const elapsedTime = Math.floor((currentTime - questionStartTime) / 1000);
  timerElement.textContent = `Time: ${elapsedTime}s`;
}

function stopQuestionTimer() {
  clearInterval(timerInterval);
  const questionEndTime = new Date();
  const timeTaken = (questionEndTime - questionStartTime) / 1000;
  questionTimes.push(timeTaken);
  totalQuizTime += timeTaken;
}

function stopTotalQuizTimer() {
  clearInterval(timerInterval);
}

const questions = [
  {
    quizType: "math",
    difficulty: "easy",
    question: "What is 2+2",
    answers: [
      { text: "3", correct: false },
      { text: "4", correct: true },
      { text: "22", correct: false },
      { text: "2", correct: false },
    ],
  },
  {
    quizType: "math",
    difficulty: "easy",
    question: "What is 5 X 3",
    answers: [
      { text: "53", correct: false },
      { text: "35", correct: false },
      { text: "10", correct: false },
      { text: "15", correct: true },
    ],
  },
  {
    quizType: "math",
    difficulty: "medium",
    question: "Square of 12 is?",
    answers: [
      { text: "1212", correct: false },
      { text: "122", correct: false },
      { text: "144", correct: true },
      { text: "1221", correct: false },
    ],
  },
  {
    quizType: "math",
    difficulty: "medium",
    question: "If X = 3 and Y = 5 what is Z if X + Y + Z = 0",
    answers: [
      { text: "3", correct: false },
      { text: "-8", correct: true },
      { text: "-5", correct: false },
      { text: "0", correct: false },
    ],
  },
  {
    quizType: "math",
    difficulty: "hard",
    question: "Sum of first 10 positive integers",
    answers: [
      { text: "50", correct: false },
      { text: "45", correct: true },
      { text: "54", correct: false },
      { text: "55", correct: false },
    ],
  },
  {
    quizType: "math",
    difficulty: "hard",
    question: "What is the value of 'x' in the equation 2x^2 + 5x - 3 = 0?",
    answers: [
      { text: "1", correct: false },
      { text: "2", correct: true },
      { text: "-3", correct: false },
      { text: "3", correct: false },
    ],
  },
  {
    quizType: "logic",
    difficulty: "easy",
    question:
      "Which number should come next in the series? 2, 4, 6, 8, 10, ___",
    answers: [
      { text: "11", correct: false },
      { text: "12", correct: true },
      { text: "13", correct: false },
      { text: "14", correct: false },
    ],
  },
  {
    quizType: "logic",
    difficulty: "easy",
    question: " Find the missing number in the sequence: 1, 4, 9, 16, 25, ___",
    answers: [
      { text: "30", correct: false },
      { text: "35", correct: false },
      { text: "49", correct: false },
      { text: "36", correct: true },
    ],
  },
  {
    quizType: "logic",
    difficulty: "medium",
    question:
      "In a certain code, MONKEY is written as XDJMNL. How is TIGER written in that code?",
    answers: [
      { text: "QDFHQ", correct: false },
      { text: "SDFHS", correct: false },
      { text: "QDFHS", correct: true },
      { text: "SFDSS", correct: false },
    ],
  },
  {
    quizType: "logic",
    difficulty: "medium",
    question:
      " A man is looking at a picture of someone. His friend asks, 'Who is it you are looking at?' The man replies, 'Brothers and sisters, I have none. But that man's father is my father's son.' Who is in the picture?",
    answers: [
      { text: "His uncle", correct: false },
      { text: "His son", correct: true },
      { text: "His brother", correct: false },
      { text: "Himself", correct: false },
    ],
  },
  {
    quizType: "logic",
    difficulty: "hard",
    question:
      "A clock shows the time as 3:15. What is the angle between the hour and the minute hands?",
    answers: [
      { text: "7.5", correct: true },
      { text: "22.5", correct: false },
      { text: "30", correct: false },
      { text: "37.5", correct: false },
    ],
  },
  {
    quizType: "logic",
    difficulty: "hard",
    question:
      "There are four houses painted different colors: red, green, blue and white. A clue is hidden behind each house, stating which houses are NOT red. No house has a clue mentioning its own color. If you can only read one clue, which house should you visit to determine all the house colors?",
    answers: [
      {
        text: "The red house.",
        correct: false,
      },
      {
        text: "The green house.",
        correct: false,
      },
      {
        text: "The blue house.",
        correct: true,
      },
      {
        text: "The white house.",
        correct: false,
      },
    ],
  },
];
