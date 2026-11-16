const games = [
  {
    id: "snake",
    title: "Змейка",
    icon: "🐍",
    description: "Собирай яблоки и не врезайся в стену или свой хвост.",
    instructions: "Управляй змейкой стрелками, клавишами WASD или кнопками на экране."
  },
  {
    id: "tic-tac-toe",
    title: "Крестики-нолики",
    icon: "⭕",
    description: "Классическая игра для двух игроков на одном устройстве.",
    instructions: "Игроки по очереди ставят крестики и нолики. Собери три символа в ряд."
  },
  {
    id: "memory",
    title: "Память",
    icon: "🧠",
    description: "Находи одинаковые пары, запоминая расположение карточек.",
    instructions: "Открывай по две карточки и ищи пары одинаковых картинок."
  }
];

const profileScreen = document.querySelector("#profile-screen");
const profileForm = document.querySelector("#profile-form");
const profileNameInput = document.querySelector("#profile-name");
const profileAvatarInput = document.querySelector("#profile-avatar");
const profileError = document.querySelector("#profile-error");
const headerProfile = document.querySelector("#header-profile");
const changeProfileButton = document.querySelector("#change-profile-button");

const progressAvatar = document.querySelector("#progress-avatar");
const progressName = document.querySelector("#progress-name");
const gamesPlayedElement = document.querySelector("#games-played");
const snakeBestElement = document.querySelector("#snake-best");
const winsCountElement = document.querySelector("#wins-count");

const PROFILES_STORAGE_KEY = "igrogorod-profiles";
const ACTIVE_PROFILE_KEY = "igrogorod-active-profile";

let profiles = readProfiles();
let activeProfile = loadActiveProfile();

function readProfiles() {
  try {
    const savedProfiles = JSON.parse(
      localStorage.getItem(PROFILES_STORAGE_KEY) || "[]"
    );

    return Array.isArray(savedProfiles) ? savedProfiles : [];
  } catch {
    return [];
  }
}

function saveProfiles() {
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}

function loadActiveProfile() {
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);

  return profiles.find((profile) => profile.id === activeId) || null;
}

function showProfileForm() {
  profileScreen.hidden = false;
  catalogScreen.hidden = true;
  gameScreen.hidden = true;

  if (activeProfile) {
    profileNameInput.value = activeProfile.name;
    profileAvatarInput.value = activeProfile.avatar;
  } else {
    profileNameInput.value = "";
    profileAvatarInput.value = "🦊";
  }

  profileError.textContent = "";
  profileNameInput.focus();
}

function showCatalogForPlayer() {
  profileScreen.hidden = true;
  catalogScreen.hidden = false;
  gameScreen.hidden = true;

  headerProfile.textContent =
    `${activeProfile.avatar} ${activeProfile.name}`;

  changeProfileButton.hidden = false;

  progressAvatar.textContent = activeProfile.avatar;
  progressName.textContent = activeProfile.name;
  gamesPlayedElement.textContent = activeProfile.progress.gamesPlayed;
  snakeBestElement.textContent = activeProfile.progress.snakeBest;

  const totalWins =
    activeProfile.progress.ticTacToeWins +
    activeProfile.progress.memoryWins;

  winsCountElement.textContent = totalWins;
}

function saveActiveProfile() {
  saveProfiles();
  localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfile.id);
  showCatalogForPlayer();
}

function updateProgress(changeProgress) {
  if (!activeProfile) return;

  changeProgress(activeProfile.progress);
  saveActiveProfile();
}

function recordGamePlayed() {
  updateProgress((progress) => {
    progress.gamesPlayed += 1;
  });
}

function recordWin(gameId) {
  updateProgress((progress) => {
    if (gameId === "tic-tac-toe") {
      progress.ticTacToeWins += 1;
    }

    if (gameId === "memory") {
      progress.memoryWins += 1;
    }
  });
}

function saveSnakeRecord(score) {
  updateProgress((progress) => {
    progress.snakeBest = Math.max(progress.snakeBest, score);
  });
}profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = profileNameInput.value.trim();
  const avatar = profileAvatarInput.value;

  if (name.length < 2) {
    profileError.textContent = "Имя должно содержать хотя бы 2 символа.";
    return;
  }

  const normalizedName = name.toLocaleLowerCase("ru");
  let profile = profiles.find(
    (item) => item.name.toLocaleLowerCase("ru") === normalizedName
  );

  if (profile) {
    // Если такое имя уже есть в этом браузере, продолжаем этот профиль.
    profile.name = name;
    profile.avatar = avatar;
  } else {
    // Для нового игрока создаём отдельный профиль.
    profile = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
      name,
      avatar,
      progress: {
        gamesPlayed: 0,
        snakeBest: 0,
        ticTacToeWins: 0,
        memoryWins: 0
      }
    };

    profiles.push(profile);
  }

  activeProfile = profile;
  saveActiveProfile();
});

changeProfileButton.addEventListener("click", showProfileForm);
const catalogScreen = document.querySelector("#catalog-screen");
const gameScreen = document.querySelector("#game-screen");
const gameList = document.querySelector("#game-list");
const gameSearch = document.querySelector("#game-search");
const noGamesMessage = document.querySelector("#no-games-message");
const backButton = document.querySelector("#back-button");
const gameTitle = document.querySelector("#game-title");
const gameDescription = document.querySelector("#game-description");
const gameContent = document.querySelector("#game-content");

let cleanupCurrentGame = null;

function renderCatalog(searchText = "") {
  const query = searchText.trim().toLocaleLowerCase("ru");
  const visibleGames = games.filter((game) => {
    const searchableText = `${game.title} ${game.description}`
      .toLocaleLowerCase("ru");

    return searchableText.includes(query);
  });

  gameList.replaceChildren();
  noGamesMessage.hidden = visibleGames.length > 0;

  visibleGames.forEach((game) => {
    const card = document.createElement("article");
    card.className = "game-card";

    const icon = document.createElement("div");
    icon.className = "game-card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = game.icon;

    const title = document.createElement("h3");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.description;

    const button = document.createElement("button");
    button.className = "primary-button";
    button.type = "button";
    button.textContent = "Играть";
    button.addEventListener("click", () => openGame(game.id));

    card.append(icon, title, description, button);
    gameList.append(card);
  });
}

function openGame(gameId) {
  const game = games.find((item) => item.id === gameId);
  if (!game) return;

  stopCurrentGame();
  recordGamePlayed();

  catalogScreen.hidden = true;
  gameScreen.hidden = false;
  gameTitle.textContent = game.title;
  gameDescription.textContent = game.instructions;
  gameContent.replaceChildren();

  if (game.id === "snake") {
    cleanupCurrentGame = mountSnake();
  } else if (game.id === "tic-tac-toe") {
    cleanupCurrentGame = mountTicTacToe();
  } else if (game.id === "memory") {
    cleanupCurrentGame = mountMemory();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopCurrentGame() {
  if (typeof cleanupCurrentGame === "function") {
    cleanupCurrentGame();
  }

  cleanupCurrentGame = null;
}

function returnToCatalog() {
  stopCurrentGame();
  gameContent.replaceChildren();
  gameScreen.hidden = true;
  catalogScreen.hidden = false;
  gameSearch.focus();
}

backButton.addEventListener("click", returnToCatalog);
gameSearch.addEventListener("input", () => renderCatalog(gameSearch.value));

/* Крестики-нолики */

function mountTicTacToe() {
  const panel = document.createElement("div");
  panel.className = "game-panel";

  const status = document.createElement("p");
  status.className = "game-status";
  status.setAttribute("aria-live", "polite");

  const boardElement = document.createElement("div");
  boardElement.className = "board";
  boardElement.setAttribute("role", "group");
  boardElement.setAttribute("aria-label", "Поле крестиков-ноликов");
  const restartButton = document.createElement("button");
  restartButton.className = "secondary-button";restartButton.type = "button";
  restartButton.textContent = "Начать заново";

  panel.append(status, boardElement, restartButton);
  gameContent.append(panel);

  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  let board = Array(9).fill("");
  let currentPlayer = "X";
  let gameFinished = false;

  function findWinner() {
    return winningLines.find(([a, b, c]) => (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ));
  }

  function drawBoard() {
    boardElement.replaceChildren();

    board.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.className = "board-cell";
      cell.type = "button";
      cell.textContent = value;
      cell.disabled = Boolean(value) || gameFinished;
      cell.setAttribute("aria-label", `Клетка ${index + 1}: ${value || "пусто"}`);

      if (value) {
        cell.classList.add(value.toLowerCase());
      }

      cell.addEventListener("click", () => {
        if (board[index] || gameFinished) return;

        board[index] = currentPlayer;

        const winningLine = findWinner();

       if (winningLine) {
  gameFinished = true;
  status.textContent = `Победили ${currentPlayer}!`;

  if (currentPlayer === "X") {
    recordWin("tic-tac-toe");
  }

        } else if (board.every(Boolean)) {
          gameFinished = true;
          status.textContent = "Ничья! Попробуйте ещё раз.";
        } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          status.textContent = `Ход игрока ${currentPlayer}`;
        }

        drawBoard();
      });

      boardElement.append(cell);
    });
  }

  function restart() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameFinished = false;
    status.textContent = "Ход игрока X";
    drawBoard();
  }

  restartButton.addEventListener("click", restart);
  restart();

  return () => {};
}

/* Игра «Память» */

function mountMemory() {
  const panel = document.createElement("div");
  panel.className = "game-panel";

  const status = document.createElement("p");
  status.className = "game-status";
  status.setAttribute("aria-live", "polite");

  const boardElement = document.createElement("div");
  boardElement.className = "memory-board";
  boardElement.setAttribute("aria-label", "Карточки игры «Память»");

  const restartButton = document.createElement("button");
  restartButton.className = "secondary-button";
  restartButton.type = "button";
  restartButton.textContent = "Начать заново";

  panel.append(status, boardElement, restartButton);
  gameContent.append(panel);

  const symbols = ["🍓", "🚀", "🐱", "🌈", "⚽", "🎸"];
  let deck = [];
  let openedCards = [];
  let matchedPairs = 0;
  let locked = false;
  let mismatchTimeout = null;

  function shuffle(items) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] =
        [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  function renderBoard() {
    boardElement.replaceChildren();

    deck.forEach((card, index) => {
      const button = document.createElement("button");
      button.className = "memory-card";
      button.type = "button";

      const isVisible = card.flipped || card.matched;

      if (card.flipped) button.classList.add("flipped");
      if (card.matched) button.classList.add("matched");

      button.textContent = isVisible ? card.symbol : "?";
      button.setAttribute(
        "aria-label",
        isVisible ? `Карточка: ${card.symbol}` : "Закрытая карточка"
      );
      button.disabled = card.matched || locked || card.flipped;

      button.addEventListener("click", () => {
        if (locked || card.flipped || card.matched) return;

        card.flipped = true;
        openedCards.push(index);
        renderBoard();if (openedCards.length === 2) {
          const [firstIndex, secondIndex] = openedCards;const firstCard = deck[firstIndex];
          const secondCard = deck[secondIndex];

          if (firstCard.symbol === secondCard.symbol) {
            firstCard.matched = true;
            secondCard.matched = true;
            openedCards = [];
            matchedPairs += 1;
            status.textContent = `Найдено пар: ${matchedPairs} из ${symbols.length}`;

           if (matchedPairs === symbols.length) {
  status.textContent = "Ура, все пары найдены!";
  recordWin("memory");
}

            renderBoard();
          } else {
            locked = true;
            status.textContent = "Не совпало — попробуй запомнить картинки";

            mismatchTimeout = setTimeout(() => {
              firstCard.flipped = false;
              secondCard.flipped = false;
              openedCards = [];
              locked = false;
              mismatchTimeout = null;
              status.textContent = `Найдено пар: ${matchedPairs} из ${symbols.length}`;
              renderBoard();
            }, 750);
          }
        }
      });

      boardElement.append(button);
    });
  }

  function restart() {
    if (mismatchTimeout !== null) {
      clearTimeout(mismatchTimeout);
      mismatchTimeout = null;
    }

    deck = shuffle([...symbols, ...symbols]).map((symbol) => ({
      symbol,
      flipped: false,
      matched: false
    }));

    openedCards = [];
    matchedPairs = 0;
    locked = false;
    status.textContent = `Найдено пар: 0 из ${symbols.length}`;
    renderBoard();
  }

  restartButton.addEventListener("click", restart);
  restart();

  return () => {
    if (mismatchTimeout !== null) {
      clearTimeout(mismatchTimeout);
    }
  };
}

/* Игра «Змейка» */

function mountSnake() {
  const panel = document.createElement("div");
  panel.className = "game-panel";

  const status = document.createElement("p");
  status.className = "game-status";
  status.setAttribute("aria-live", "polite");

  const canvas = document.createElement("canvas");
  canvas.className = "snake-canvas";
  canvas.width = 400;
  canvas.height = 400;
  canvas.setAttribute("aria-label", "Игровое поле змейки");

  const actions = document.createElement("div");
  actions.className = "game-actions";

  const startButton = document.createElement("button");
  startButton.className = "primary-button";
  startButton.type = "button";

  const restartButton = document.createElement("button");
  restartButton.className = "secondary-button";
  restartButton.type = "button";
  restartButton.textContent = "Начать заново";

  actions.append(startButton, restartButton);

  const controls = document.createElement("div");
  controls.className = "snake-controls";
  controls.setAttribute("aria-label", "Кнопки управления змейкой");

  const controlLayout = [
    null,
    ["up", "↑", "Вверх"],
    null,
    ["left", "←", "Влево"],
    ["down", "↓", "Вниз"],
    ["right", "→", "Вправо"]
  ];

  controlLayout.forEach((control) => {
    const button = document.createElement("button");

    if (!control) {
      button.className = "empty-control";
      button.type = "button";
      button.tabIndex = -1;
      button.setAttribute("aria-hidden", "true");
    } else {
      const [direction, symbol, label] = control;
      button.type = "button";
      button.textContent = symbol;
      button.setAttribute("aria-label", label);
      button.addEventListener("click", () => changeDirection(direction));
    }

    controls.append(button);
  });

  panel.append(status, canvas, actions, controls);
  gameContent.append(panel);

  const context = canvas.getContext("2d");
  const cellSize = 20;
  const cellCount = canvas.width / cellSize;

  let snake;
  let direction;
  let nextDirection;
  let food;
  let score;
  let timer = null;
  let isRunning = false;
  let gameOver = false;

  function placeFood() {
    const emptyCells = [];

    for (let x = 0; x < cellCount; x += 1) {
      for (let y = 0; y < cellCount; y += 1) 
        {
            const occupied = snake.some((part) => part.x === x && part.y === y);

        if (!occupied) {emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length === 0) return null;

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  function draw() {
    context.fillStyle = "#f5f3fb";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (food) {
      context.fillStyle = "#f0748f";
      context.beginPath();
      context.arc(
        food.x * cellSize + cellSize / 2,
        food.y * cellSize + cellSize / 2,
        cellSize * 0.38,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    snake.forEach((part, index) => {
      context.fillStyle = index === 0 ? "#6043c3" : "#806ae0";
      context.beginPath();
      context.roundRect(
        part.x * cellSize + 2,
        part.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4,
        6
      );
      context.fill();
    });
  }

  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }

    isRunning = false;
  }

  function changeDirection(newDirection) {
    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left"
    };

    if (newDirection === opposites[direction]) return;
    if (newDirection === opposites[nextDirection]) return;

    nextDirection = newDirection;
  }

  function tick() {
    direction = nextDirection;

    const head = { ...snake[0] };

    if (direction === "up") head.y -= 1;
    if (direction === "down") head.y += 1;
    if (direction === "left") head.x -= 1;
    if (direction === "right") head.x += 1;

    const foundFood = food && head.x === food.x && head.y === food.y;

    const outside =
      head.x < 0 ||
      head.y < 0 ||
      head.x >= cellCount ||
      head.y >= cellCount;

    const bodyToCheck = foundFood ? snake : snake.slice(0, -1);
    const hitSelf = bodyToCheck.some(
      (part) => part.x === head.x && part.y === head.y
    );

    if (outside || hitSelf) {
      gameOver = true;
      stopTimer();
      startButton.textContent = "Играть снова";
      status.textContent = `Игра окончена. Твой счёт: ${score}`;
      return;
    }

    snake.unshift(head);

    if (foundFood) {
      score += 1;
      saveSnakeRecord(score);
      food = placeFood();

      if (!food) {
        gameOver = true;
        stopTimer();
        startButton.textContent = "Играть снова";
        status.textContent = `Победа! Твой счёт: ${score}`;
      } else {
        status.textContent = `Счёт: ${score}`;
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function startGame() {
    if (gameOver) {
      resetGame();
    }

    if (isRunning) {
      stopTimer();
      startButton.textContent = "Продолжить";
      status.textContent = `Пауза. Счёт: ${score}`;
      return;
    }

    isRunning = true;
    startButton.textContent = "Пауза";
    status.textContent = `Счёт: ${score}`;
    timer = setInterval(tick, 125);
  }

  function resetGame() {
    stopTimer();
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    direction = "right";
    nextDirection = "right";
    score = 0;
    gameOver = false;
    food = placeFood();
    startButton.textContent = "Начать";
    status.textContent = "Счёт: 0. Нажми «Начать», чтобы играть.";
    draw();
  }

  function onKeyDown(event) {
    const keys = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right"
    };

    const newDirection = keys[event.key];

    if (!newDirection) return;

    event.preventDefault();
    changeDirection(newDirection);
  }

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", resetGame);
  window.addEventListener("keydown", onKeyDown);

  resetGame();

  return () => {
    stopTimer();
    window.removeEventListener("keydown", onKeyDown);
  };
}

renderCatalog();

if (activeProfile) {
  showCatalogForPlayer();
} else {
  showProfileForm();
}