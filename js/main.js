class Snake {
  constructor() {
    this.firstBlock = new SnakeBlock(
      shnake.game.blockSize,
      shnake.game.blockSize,
      shnake.game.blockSize
    );
    this.lastBlock = this.firstBlock;

    shnake.gameboard.removeAvailableSpot(this.firstBlock.x, this.firstBlock.y);
  }
  addBlock(x, y) {
    this.lastBlockSave = this.lastBlock;

    this.lastBlock = new SnakeBlock(x, y, shnake.game.blockSize);

    this.lastBlockSave.blockBehind = this.lastBlock;
  }
  update() {
    this.firstBlock.move();
    document.querySelector(".score").innerHTML = shnake.game.score;
  }
  setXDirection(vx) {
    this.firstBlock.vx = vx;
    this.firstBlock.vy = 0;
  }
  setYDirection(vy) {
    this.firstBlock.vy = vy;
    this.firstBlock.vx = 0;
  }
}

class Game {
  constructor(settings) {
    for (const setting in settings) {
      this[setting] = settings[setting];
    }

    this.blockSize = settings.blockSize;
    this.updateInterval = settings.updateInterval;
    this.score = 1;
    this.running;

    this.shouldInitListeners = true;
  }

  init() {
    let toDelete = document.querySelectorAll(".delete-on-restart");
    toDelete.forEach((element) => {
      element.remove();
    });
    hideModals();

    delete shnake.gameboard, shnake.apple, shnake.snake;
    this.score = 1;
    this.updateInterval = round(1000 / this.speed, 1);
    this.running = true;

    shnake.gameboard = new Gameboard(
      document.body.clientHeight,
      document.body.clientWidth
    );
    shnake.snake = new Snake();
    shnake.apple = new Apple();

    window.requestAnimationFrame(runSnake);
    shnake.apple.place();

    if (this.shouldInitListeners) this.initListeners();
    this.shouldInitListeners = false;
  }

  initListeners() {
    document.addEventListener("keydown", (e) => {
      switch (e.key.toLowerCase()) {
        case "r":
          shnake.game.restart();
          break;
        case "a":
        case "arrowleft":
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.x < shnake.snake.firstBlock.x
          )
            break;

          shnake.snake.setXDirection(-1);
          break;
        case "d":
        case "arrowright":
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.x > shnake.snake.firstBlock.x
          )
            break;

          shnake.snake.setXDirection(1);
          break;
        case "w":
        case "arrowup":
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.y < shnake.snake.firstBlock.y
          )
            break;

          shnake.snake.setYDirection(-1);
          break;
        case "s":
        case "arrowdown":
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.y > shnake.snake.firstBlock.y
          )
            break;

          shnake.snake.setYDirection(1);
          break;
      }
    });

    let hammer = new Hammer(shnake.gameboard.element);
    hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL, threshold: 25 });
    hammer.on("pan", (e) => {
      switch (e.direction) {
        case 2:
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.x < shnake.snake.firstBlock.x
          )
            break;

          shnake.snake.setXDirection(-1);
          break;
        case 4:
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.x > shnake.snake.firstBlock.x
          )
            break;

          shnake.snake.setXDirection(1);
          break;
        case 8:
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.y < shnake.snake.firstBlock.y
          )
            break;

          shnake.snake.setYDirection(-1);
          break;
        case 16:
          if (
            shnake.snake.firstBlock.blockBehind &&
            shnake.snake.firstBlock.blockBehind.y > shnake.snake.firstBlock.y
          )
            break;

          shnake.snake.setYDirection(1);
          break;
      }
    });
  }

  end(won) {
    showModal(won ? "win" : "lose");
    this.running = false;
  }
}

class Gameboard {
  constructor(clientHeight, clientWidth) {
    this.width = round(clientWidth, shnake.game.blockSize);
    this.height = round(clientHeight, shnake.game.blockSize);

    this.element = document.querySelector(".gameboard");

    this.element.style.width = this.width + "px";
    this.element.style.minWidth = this.width + "px";

    this.element.style.height = this.height + "px";
    this.element.style.minHeight = this.height + "px";

    this.availableSpots = [];

    for (let y = 0; y < this.height; y += shnake.game.blockSize) {
      for (let x = 0; x < this.width; x += shnake.game.blockSize) {
        this.addAvailableSpot(x, y);
      }
    }
  }

  addAvailableSpot(x, y) {
    this.availableSpots.push({ x: x, y: y });
  }

  removeAvailableSpot(x, y) {
    for (let i = 0; i < this.availableSpots.length; i++) {
      if (this.availableSpots[i].x === x && this.availableSpots[i].y === y) {
        this.availableSpots.splice(i, 1);
      }
    }
  }
}

class Apple {
  constructor() {
    this.blockSize = shnake.game.blockSize;
  }

  place() {
    if (!shnake.gameboard.availableSpots.length) {
      shnake.game.end(true);
    } else {
      this.element = document.createElement("div");
      this.element.classList.add("apple", "block", "delete-on-restart");

      const spotIndex = Math.round(
        Math.random() * (shnake.gameboard.availableSpots.length - 1)
      );

      this.x = shnake.gameboard.availableSpots[spotIndex].x;
      this.y = shnake.gameboard.availableSpots[spotIndex].y;

      this.element.style.width = this.blockSize + "px";
      this.element.style.height = this.blockSize + "px";

      this.element.addEventListener("animationend", (e) => {
        if (e.animationName === "appleDisappear") {
          shnake.gameboard.element.removeChild(e.target);
        }
      });

      this.element.style.left = this.x + "px";
      this.element.style.top = this.y + "px";

      shnake.gameboard.element.appendChild(this.element);
    }
  }
}

class SnakeBlock {
  constructor(x, y, size) {
    this.blockSize = size;
    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;

    this.blockBehind;

    this.element = document.createElement("div");
    this.element.classList.add("snake-block", "block", "delete-on-restart");

    this.element.style.width = this.blockSize + "px";
    this.element.style.height = this.blockSize + "px";

    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

    shnake.gameboard.element.appendChild(this.element);
  }

  move(frontX, frontY) {
    this.previousX = this.x;
    this.previousY = this.y;

    if (frontX != undefined) {
      this.x = frontX;
      this.y = frontY;
    } else {
      // game over detector
      if (
        isWallColliding(this) ||
        (this.blockBehind != undefined ? isSelfcolliding(this) : false)
      ) {
        shnake.game.end(false);
        return;
      }

      this.x += this.vx * this.blockSize;
      this.y += this.vy * this.blockSize;

      // only removes an available spot if snake has moved
      if (this.x != this.previousX || this.y != this.previousY)
        shnake.gameboard.removeAvailableSpot(this.x, this.y);
    }

    // set CSS positioning
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

    // sends this blocks previous x- and y-coordinates (the ones it had before moving) to the block behind
    if (this.blockBehind) {
      this.blockBehind.move(this.previousX, this.previousY);
    } else if (this.x != this.previousX || this.y != this.previousY) {
      // only adds an available spot if this block is not the head and if this block has moved
      if (
        shnake.snake.firstBlock.x === shnake.apple.x &&
        shnake.snake.firstBlock.y === shnake.apple.y
      ) {
        shnake.audio.play(
          `eat${
            shnake.game.score - 12 * Math.floor(shnake.game.score / 12) || 12
          }`
        );

        shnake.game.score++;
        shnake.snake.addBlock(this.previousX, this.previousY);

        shnake.apple.element.classList.add("apple--disappearing");
        shnake.apple.place();
      } else shnake.gameboard.addAvailableSpot(this.previousX, this.previousY);
    }
  }
}

const validSettings = {
  blockSize: { min: 10, max: 100, default: 50, step: 10 },
  speed: { min: 1, max: 20, default: 7, step: 1 },
  //testBoolean: { default: false },
  //testString: { default: "Hello!" },
  //testDropdown: { values: ["Lorem", "Ipsum"], default: "Lorem" },
};

// namespace for all game-objects
let shnake = {};
shnake.game = new Game(parseSettings());
shnake.audio = new Howl({
  src: ["audio/sounds.mp3"],
  sprite: {
    eat1: [0, 600],
    eat2: [1000, 600],
    eat3: [2000, 600],
    eat4: [3000, 600],
    eat5: [4000, 600],
    eat6: [5000, 600],
    eat7: [6000, 600],
    eat8: [7000, 600],
    eat9: [8000, 600],
    eat10: [9000, 600],
    eat11: [10000, 600],
    eat12: [11000, 600],
    gameOver: [12000, 900],
    perfectScore: [13000, 2700],
    startGame: [16000, 1600],
    hover: [18000, 500],
    click: [19000, 300],
    whoosh1: [20000, 600],
    whoosh2: [21000, 600],
  },
});

let lastTime = new Date().getTime();
let deltaUpdate = 0;

function parseSettings() {
  let settings = {};

  for (const setting in validSettings) {
    settings[setting] = validSettings[setting].default;
  }

  let url = new URL(window.location.href);
  let entries = url.searchParams.entries();

  for (const entry of entries) {
    const key = entry[0];
    const value = !isNaN(parseInt(entry[1])) ? parseInt(entry[1]) : entry[1];

    const result = validateSetting(key, value);

    switch (result) {
      case "ok":
        settings[key] = value;
        break;
      case "badSetting":
        console.error(`${key} is not a valid setting`);
        break;
      case "badValue":
        console.error(
          `${value} is not a valid value for ${key} - using default value of ${validSettings[key].default}`
        );
        break;
    }
  }

  return settings;
}

function validateSetting(key, value) {
  if (Object.keys(validSettings).includes(key)) {
    if (typeof validSettings[key].default == "number") {
      if (
        !(value >= validSettings[key].min && value <= validSettings[key].max)
      ) {
        return "badValue";
      }
    } else {
      if (!validSettings[key].includes(value)) {
        return "badValue";
      }
    }
  } else {
    return "badSetting";
  }

  return "ok";
}

function round(toRound, roundTo) {
  if (toRound > 0) {
    return Math.floor(toRound / roundTo) * roundTo;
  } else {
    return roundTo;
  }
}

// SHOULD PROBABLY RENAME currentBlock TO MORE APPROPRIATE NAME
function isSelfcolliding(currentBlock) {
  while (currentBlock.blockBehind != undefined) {
    if (
      shnake.snake.firstBlock.x +
        shnake.snake.firstBlock.vx * shnake.snake.firstBlock.blockSize ===
        currentBlock.x &&
      shnake.snake.firstBlock.y +
        shnake.snake.firstBlock.vy * shnake.snake.firstBlock.blockSize ===
        currentBlock.y
    ) {
      return true;
    }

    currentBlock = currentBlock.blockBehind;
  }
  return false;
}

function isWallColliding(headBlock) {
  return (
    headBlock.x + headBlock.vx * headBlock.blockSize >=
      shnake.gameboard.width ||
    headBlock.x + headBlock.vx * headBlock.blockSize < 0 ||
    headBlock.y + headBlock.vy * headBlock.blockSize < 0 ||
    headBlock.y + headBlock.vy * headBlock.blockSize >= shnake.gameboard.height
  );
}

function runSnake() {
  let currentTime = new Date().getTime();
  deltaUpdate += (currentTime - lastTime) / shnake.game.updateInterval;
  lastTime = currentTime;

  while (deltaUpdate >= 1) {
    deltaUpdate--;
    shnake.snake.update();
  }

  if (shnake.game.running) {
    window.requestAnimationFrame(runSnake);
  }
}
