class Snake {
    constructor(size) {
        this.size = size;
        this.firstBlock = new SnakeBlock(document.body.clientWidth / 2, document.body.clientHeight / 2, this.size);
        this.lastBlock = this.firstBlock;
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

class Apple {
    constructor() {
        this.size = snake.size;
    }

    place() {
        this.element = document.createElement("div");
        this.element.classList.add("apple", "block");

        this.x = round(Math.random() * (document.body.clientWidth - this.size), snake.size);
        this.y = round(Math.random() * (document.body.clientHeight - this.size), snake.size);

        this.element.style.width = this.size + "px";
        this.element.style.height = this.size + "px";

        this.element.addEventListener("animationend", (e) => {
            if (e.animationName === "apple-disappear") {
                document.body.removeChild(e.target);
            }
        });

        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";

        document.body.appendChild(this.element);
    }
}

class SnakeBlock {
    constructor(x, y, size) {
        this.size = size;
        this.x = round(x, size);
        this.y = round(y, size);

        this.vx = 0;
        this.vy = 0;

        this.blockBehind;

        this.element = document.createElement("div");
        this.element.classList.add("snake-block", "block");

        this.element.style.width = this.size + "px";
        this.element.style.height = this.size + "px";

        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";

        document.body.appendChild(this.element);
    }

    move(frontX, frontY) {
        //saves current coordinates
        this.previousX = this.x;
        this.previousY = this.y;

        if (frontX) {
            //checks in which direction block is moving
            this.vx = frontX - this.x;
            this.vy = frontY - this.y;
            //moves block
            this.x = frontX;
            this.y = frontY;
        } else {
            //game over detector
            if (this.x + this.vx * this.size > document.body.clientWidth || this.x + this.vx * this.size < 0 || this.y + this.vy * this.size < 0 || this.y + this.vy * this.size > document.body.clientHeight || isSelfcolliding(this.blockBehind, this)) {
                clearInterval(intervalID);
                document.querySelector(".ULOST").style.display = "block";
                return;
            }

            //moves block
            this.x += this.vx * this.size;
            this.y += this.vy * this.size;
        }

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

const snake = new Snake(window.prompt("HOW THICC 🍑 SHOULD SHNAKE BE? WE RECMND 50", 50));
let apple = new Apple();
apple.place();
let intervalID;
let score = 0;

window.addEventListener(
    "load",
    () => {
        // window.requestAnimationFrame(runSnake);

        const interval = window.prompt("HOW QUICK U WANT GAME? WE RECMND 150", 150);

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
            }
        });
    },
    false
);

function round(toRound, roundTo) {
    if (toRound > 0) {
        return Math.ceil(toRound / roundTo) * roundTo;
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
