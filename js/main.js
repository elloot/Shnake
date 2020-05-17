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
        this.score = 0;
        this.running;
    }

    start() {
        this.running = true;
        window.requestAnimationFrame(runSnake);
        apple.place();
    }

    end(won) {
        if (won) {
            document.querySelector(".UWON").style.display = "block";
        } else {
            document.querySelector(".ULOST").style.display = "block";
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
            this.element.classList.add("apple", "block");

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
        this.element.classList.add("snake-block", "block");

        this.element.style.width = this.blockSize + "px";
        this.element.style.height = this.blockSize + "px";

        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";

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
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";

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

const game = new Game(parseSettings());

const gameboard = new Gameboard(document.body.clientHeight, document.body.clientWidth);

const snake = new Snake();

const apple = new Apple();

let lastTime = new Date().getTime();
let deltaUpdate = 0;

window.addEventListener(
    "load",
    () => {
        game.start();

        document.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "a":
                case "ArrowLeft":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x < snake.firstBlock.x) break;

                    snake.setXDirection(-1);
                    break;
                case "d":
                case "ArrowRight":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x > snake.firstBlock.x) break;

                    snake.setXDirection(1);
                    break;
                case "w":
                case "ArrowUp":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y < snake.firstBlock.y) break;

                    snake.setYDirection(-1);
                    break;
                case "s":
                case "ArrowDown":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y > snake.firstBlock.y) break;

                    snake.setYDirection(1);
                    break;
            }
        });
    },
    false
);

function parseSettings() {
    let settings = {};

    let url = new URL(window.location.href);
    let entries = url.searchParams.entries();

    for (const entry of entries) {
        settings[entry[0]] = !isNaN(parseInt(entry[1])) ? parseInt(entry[1]) : entry[1];
    }

    return settings;
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
