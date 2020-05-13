class Snake {
    constructor(size) {
        this.size = size;

        console.log(gameboard.leftBound + this.size, gameboard.topBound + this.size);
        this.firstBlock = new SnakeBlock(this.size, this.size, this.size);
        this.lastBlock = this.firstBlock;

        gameboard.removeAvailableSpot(this.firstBlock.x, this.firstBlock.y);
    }
    addBlock() {
        this.lastBlockSave = this.lastBlock;

        this.lastBlock = new SnakeBlock(this.lastBlockSave.x, this.lastBlockSave.y, this.size);

        this.lastBlockSave.blockBehind = this.lastBlock;
    }
    update() {
        this.firstBlock.move();
        document.querySelector(".score").innerHTML = score;
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

class Gameboard {
    constructor(clientHeight, clientWidth) {
        this.width = round(clientWidth, 50);
        this.height = round(clientHeight, 50);

        this.element = document.querySelector(".gameboard");

        this.element.style.width = this.width + "px";
        this.element.style.minWidth = this.width + "px";

        this.element.style.height = this.height + "px";
        this.element.style.minHeight = this.height + "px";

        this.availableSpots = [];

        for (let y = 0; y < this.height; y += 50) {
            for (let x = 0; x < this.width; x += 50) {
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
        this.size = snake.size;
    }

    place() {
        this.element = document.createElement("div");
        this.element.classList.add("apple", "block");

        const spotIndex = Math.round(Math.random() * gameboard.availableSpots.length);

        this.x = gameboard.availableSpots[spotIndex].x;
        this.y = gameboard.availableSpots[spotIndex].y;

        this.element.style.width = this.size + "px";
        this.element.style.height = this.size + "px";

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
        this.size = size;
        this.x = x;
        this.y = y;

        this.vx = 0;
        this.vy = 0;

        this.blockBehind;

        this.element = document.createElement("div");
        this.element.classList.add("snake-block", "block");

        this.element.style.width = this.size + "px";
        this.element.style.height = this.size + "px";

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
            if (this.x + this.vx * this.size >= gameboard.width || this.x + this.vx * this.size < 0 || this.y + this.vy * this.size < 0 || this.y + this.vy * this.size >= gameboard.height || isSelfcolliding(this.blockBehind, this)) {
                clearInterval(intervalID);
                document.querySelector(".ULOST").style.display = "block";
                return;
            }

            //moves block
            this.x += this.vx * this.size;
            this.y += this.vy * this.size;
        }

        gameboard.removeAvailableSpot(this.x, this.y);

        //actually moves block
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";

        //applpe chonk detector
        if (this.x === apple.x && this.y === apple.y) {
            score++;
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

let gameboard = new Gameboard(document.body.clientHeight, document.body.clientWidth);

const snake = new Snake(parseFloat(window.prompt("HOW THICC 🍑 SHOULD SHNAKE BE? WE RECMND 50", 50)));

let apple = new Apple();
apple.place();

let intervalID;
let score = 0;

window.addEventListener(
    "load",
    () => {
        // window.requestAnimationFrame(runSnake);

        const interval = parseFloat(window.prompt("HOW QUICK U WANT GAME? WE RECMND 150", 150));

        intervalID = setInterval(runSnake, interval);

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
                case "Alt":
                    for (i = 0; i < 100; i++) apple.place();
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
        if (currentBlock.x === foremostBlock.x + foremostBlock.vx * foremostBlock.size && currentBlock.y === foremostBlock.y + foremostBlock.vy * foremostBlock.size) {
            clearInterval(intervalID);
            document.querySelector(".ULOST").style.display = "block";
            return true;
        }
        currentBlock = currentBlock.blockBehind;
    }
}

function runSnake() {
    snake.update();

    // window.requestAnimationFrame(runSnake);
}
