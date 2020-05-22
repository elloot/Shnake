class Snake {
    constructor() {
        this.firstBlock = new SnakeBlock(game.blockSize, game.blockSize, game.blockSize);
        this.lastBlock = this.firstBlock;

        gameboard.removeAvailableSpot(this.firstBlock.x, this.firstBlock.y);
    }
    addBlock(x, y) {
        this.lastBlockSave = this.lastBlock;

        this.lastBlock = new SnakeBlock(x, y, game.blockSize);

        this.lastBlockSave.blockBehind = this.lastBlock;
    }
    update() {
        this.firstBlock.move();
        document.querySelector(".score").innerHTML = game.score;
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
    }

    init() {
        this.running = true;

        gameboard = new Gameboard(document.body.clientHeight, document.body.clientWidth);
        snake = new Snake();
        apple = new Apple();

        window.requestAnimationFrame(runSnake);
        apple.place();

        document.addEventListener("keydown", (e) => {
            switch (e.key.toLowerCase()) {
                case "r":
                    game.restart();
                    break;
                case "a":
                case "arrowleft":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x < snake.firstBlock.x) break;

                    snake.setXDirection(-1);
                    break;
                case "d":
                case "arrowright":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x > snake.firstBlock.x) break;

                    snake.setXDirection(1);
                    break;
                case "w":
                case "arrowup":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y < snake.firstBlock.y) break;

                    snake.setYDirection(-1);
                    break;
                case "s":
                case "arrowdown":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y > snake.firstBlock.y) break;

                    snake.setYDirection(1);
                    break;
            }
        });

        let hammer = new Hammer(gameboard.element);
        hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL, threshold: 25 });
        hammer.on("pan", (e) => {
            switch (e.direction) {
                case 2:
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x < snake.firstBlock.x) break;

                    snake.setXDirection(-1);
                    break;
                case 4:
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x > snake.firstBlock.x) break;

                    snake.setXDirection(1);
                    break;
                case 8:
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y < snake.firstBlock.y) break;

                    snake.setYDirection(-1);
                    break;
                case 16:
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y > snake.firstBlock.y) break;

                    snake.setYDirection(1);
                    break;
            }
        });
    }

    restart() {
        this.score = 1;
        let toDelete = document.querySelectorAll(".delete-on-restart");
        let toHide = document.querySelectorAll(".hide-on-restart");

        toDelete.forEach((element) => {
            element.remove();
        });

        toHide.forEach((element) => {
            element.style.display = "none";
        });

        this.init();
    }

    end(won) {
        if (won) {
            document.querySelector(".modal--win").style.display = "block";
        } else {
            document.querySelector(".modal--lose").style.display = "block";
        }
        this.running = false;
    }
}

class Gameboard {
    constructor(clientHeight, clientWidth) {
        this.width = round(clientWidth, game.blockSize);
        this.height = round(clientHeight, game.blockSize);

        this.element = document.querySelector(".gameboard");

        this.element.style.width = this.width + "px";
        this.element.style.minWidth = this.width + "px";

        this.element.style.height = this.height + "px";
        this.element.style.minHeight = this.height + "px";

        this.availableSpots = [];

        for (let y = 0; y < this.height; y += game.blockSize) {
            for (let x = 0; x < this.width; x += game.blockSize) {
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
        this.blockSize = game.blockSize;
    }

    place() {
        if (!gameboard.availableSpots.length) {
            game.end(true);
        } else {
            this.element = document.createElement("div");
            this.element.classList.add("apple", "block", "delete-on-restart");

            const spotIndex = Math.round(Math.random() * (gameboard.availableSpots.length - 1));

            this.x = gameboard.availableSpots[spotIndex].x;
            this.y = gameboard.availableSpots[spotIndex].y;

            this.element.style.width = this.blockSize + "px";
            this.element.style.height = this.blockSize + "px";

            this.element.addEventListener("animationend", (e) => {
                if (e.animationName === "apple-disappear") {
                    gameboard.element.removeChild(e.target);
                }
            });

            this.element.style.left = this.x + "px";
            this.element.style.top = this.y + "px";

            gameboard.element.appendChild(this.element);
        }
    }
}

let applePlace = false;

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

        gameboard.element.appendChild(this.element);
    }

    move(frontX, frontY) {
        this.previousX = this.x;
        this.previousY = this.y;

        if (frontX != undefined) {
            this.x = frontX;
            this.y = frontY;
        } else {
            //game over detector
            if (isWallColliding(this) || (this.blockBehind != undefined ? isSelfcolliding(this) : false)) {
                game.end(false);
                return;
            }

            this.x += this.vx * this.blockSize;
            this.y += this.vy * this.blockSize;

            //only removes an available spot if snake has moved
            if (this.x != this.previousX || this.y != this.previousY) gameboard.removeAvailableSpot(this.x, this.y);

            //apple chonk detector
            if (this.x === apple.x && this.y === apple.y) applePlace = true;
        }

        //set CSS positioning
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

        //sends this blocks previous x- and y-coordinates (the ones it had before moving) to the block behind
        if (this.blockBehind) {
            this.blockBehind.move(this.previousX, this.previousY);
        } else if (this.x != this.previousX || this.y != this.previousY) {
            //only adds an available spot if this block is not the head and if this block has moved
            if (applePlace) {
                game.score++;
                snake.addBlock(this.previousX, this.previousY);

                apple.element.classList.add("apple-disappear");
                apple.place();
            } else gameboard.addAvailableSpot(this.previousX, this.previousY);

            applePlace = false;
        }
    }
}

const validSettings = {
    blockSize: { min: 10, max: 100, default: 50 },
    updateInterval: { min: 10, max: 5000, default: 150 },
    color: { values: [], default: "white" },
};

const game = new Game(parseSettings());

let gameboard;

let snake;

let apple;

let lastTime = new Date().getTime();
let deltaUpdate = 0;

window.addEventListener(
    "load",
    () => {
        game.init();
    },
    false
);

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
                console.error(`${value} is not a valid value for ${key} - using default value of ${validSettings[key].default}`);
                break;
        }
    }

    return settings;
}

function validateSetting(key, value) {
    if (Object.keys(validSettings).includes(key)) {
        if (typeof validSettings[key].default == "number") {
            if (!(value >= validSettings[key].min && value <= validSettings[key].max)) {
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
        if (snake.firstBlock.x + snake.firstBlock.vx * snake.firstBlock.blockSize === currentBlock.x && snake.firstBlock.y + snake.firstBlock.vy * snake.firstBlock.blockSize === currentBlock.y) {
            return true;
        }

        currentBlock = currentBlock.blockBehind;
    }
    return false;
}

function isWallColliding(headBlock) {
    return headBlock.x + headBlock.vx * headBlock.blockSize >= gameboard.width || headBlock.x + headBlock.vx * headBlock.blockSize < 0 || headBlock.y + headBlock.vy * headBlock.blockSize < 0 || headBlock.y + headBlock.vy * headBlock.blockSize >= gameboard.height;
}

function runSnake() {
    let currentTime = new Date().getTime();
    deltaUpdate += (currentTime - lastTime) / game.updateInterval;
    lastTime = currentTime;

    while (deltaUpdate >= 1) {
        deltaUpdate--;
        snake.update();
    }

    if (game.running) {
        window.requestAnimationFrame(runSnake);
    }
}
