class Snake {
    constructor() {
        this.firstBlock = new SnakeBlock(game.blockSize, game.blockSize, game.blockSize);
        this.lastBlock = this.firstBlock;

        gameboard.removeAvailableSpot(this.firstBlock.x, this.firstBlock.y);
    }
    addBlock() {
        this.lastBlockSave = this.lastBlock;

        this.lastBlock = new SnakeBlock(this.lastBlockSave.x, this.lastBlockSave.y, game.blockSize);

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
    constructor(size, interval) {
        this.blockSize = size;
        this.updateInterval = interval;
        this.score = 0;
        this.running;
    }

    start() {
        this.running = true;
        window.requestAnimationFrame(runSnake);
        apple.place();
    }

    end() {
        this.running = false;
        document.querySelector(".ULOST").style.display = "block";
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
                break;
            }
        }
    }
}

class Apple {
    constructor() {
        this.blockSize = game.blockSize;
    }

    place() {
        this.element = document.createElement("div");
        this.element.classList.add("apple", "block");

        const spotIndex = Math.round(Math.random() * gameboard.availableSpots.length);

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
        //saves current coordinates
        this.previousX = this.x;
        this.previousY = this.y;

        gameboard.addAvailableSpot(this.previousX, this.previousY);

        if (frontX) {
            //checks in which direction block is moving
            this.vx = frontX - this.x;
            this.vy = frontY - this.y;
            //moves block
            this.x = frontX;
            this.y = frontY;
        } else {
            //game over detector
            if (this.x + this.vx * this.blockSize >= gameboard.width || this.x + this.vx * this.blockSize < 0 || this.y + this.vy * this.blockSize < 0 || this.y + this.vy * this.blockSize >= gameboard.height || isSelfcolliding(this.blockBehind, this)) {
                game.end();
                return;
            }

            //moves block
            this.x += this.vx * this.blockSize;
            this.y += this.vy * this.blockSize;
        }

        gameboard.removeAvailableSpot(this.x, this.y);

        //actually moves block
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";

        //applpe chonk detector
        if (this.x === apple.x && this.y === apple.y) {
            game.score++;
            snake.addBlock();
            apple.element.classList.add("apple-disappear");
            apple.place();
        }

        //sends this blocks previous x- and y-coordinates (the ones it had before moving) to the block behind
        if (this.blockBehind) {
            this.blockBehind.move(this.previousX, this.previousY);
        }
    }
}

const game = new Game(parseInt(window.prompt("HOW THICC 🍑 SHOULD SHNAKE BE? WE RECMND 50", 50)), parseInt(window.prompt("HOW QUICK U WANT GAME? WE RECMND 150", 150)));

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
                case "ArrowLeft":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x < snake.firstBlock.x) break;

                    snake.setXDirection(-1);
                    break;
                case "ArrowRight":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.x > snake.firstBlock.x) break;

                    snake.setXDirection(1);
                    break;
                case "ArrowUp":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y < snake.firstBlock.y) break;

                    snake.setYDirection(-1);
                    break;
                case "ArrowDown":
                    if (snake.firstBlock.blockBehind && snake.firstBlock.blockBehind.y > snake.firstBlock.y) break;

                    snake.setYDirection(1);
                    break;
            }
        });
    },
    false
);

function round(toRound, roundTo) {
    if (toRound > 0) {
        return Math.floor(toRound / roundTo) * roundTo;
    } else {
        return roundTo;
    }
}

function isSelfcolliding(currentBlock, foremostBlock) {
    while (currentBlock) {
        if (currentBlock.x === foremostBlock.x + foremostBlock.vx * foremostBlock.blockSize && currentBlock.y === foremostBlock.y + foremostBlock.vy * foremostBlock.blockSize) {
            return true;
        }
        currentBlock = currentBlock.blockBehind;
    }
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
