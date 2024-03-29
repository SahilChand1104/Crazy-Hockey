const canvas = document.createElement("Canvas");
const width = canvas.width = 700;
const length = canvas.height = 900;
document.body.appendChild(canvas);
const dimension = canvas.getContext('2d');

let userScore = 0;
let cpuScore = 0;

let gameOver = false;

const Rink = () => {
    dimension.beginPath();
    dimension.arc(width / 2, length / 2, width / 10, 0, 2 * Math.PI);
    dimension.moveTo(0, length / 2);
    dimension.lineTo(width, length / 2);
    dimension.stroke();
};

window.addEventListener('mousemove', (e) => {
    player.x = e.x - window.innerWidth / 2 + width / 2;
    player.y = e.y - length * .05;
});

class User {
    constructor() {
        this.x = width / 2; // Start at the bottom middle
        this.y = length * 0.95; // Start at the bottom
        this.prevX = this.x;
        this.prevY = this.y;
        this.dx = 0;
        this.dy = 0;
        this.maxY = length * 0.95; // Max y position (bottom)
    }

    draw() {
        dimension.beginPath();
        dimension.arc(this.x, this.y, width * 0.05, 0, 2 * Math.PI);
        dimension.fillStyle = "purple";
        dimension.fill();
        dimension.stroke();
    }

    update() {
        this.dy = this.y - this.prevY;
        this.prevX = this.x;
        this.prevY = this.y;

        // Ensure the player cannot cross the middle line
        if (this.y < length / 2) {
            this.y = length / 2;
        }
        if (this.y > this.maxY) {
            this.y = this.maxY;
        }
    }
}

class Puck {
    constructor() {
        this.reset();
        this.radius = width * 0.04;
        this.speed = 1;
    }

    reset() {
        this.x = width / 2;
        this.y = length / 2;
        this.dx = 0;
        this.dy = 0;
    }

    spawnInFrontOfNet(net) {
        this.x = width / 2;
        //this.y = net.y > length / 2 ? net.y - net.height / 2 - this.radius : net.y + net.height / 2 + this.radius;
        this.y = length/1.25;
        this.dx = 0;
        this.dy = 0;
    }

    

    draw() {
        dimension.beginPath();
        dimension.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        dimension.fillStyle = "black";
        dimension.fill();
        dimension.stroke();
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        if (this.x + this.radius > width || this.x - this.radius < 0) {
            this.dx *= -1;
            this.x = this.x < width / 2 ? this.radius : width - this.radius;
        }

        if (this.y + this.radius > length || this.y - this.radius < 0) {
            this.dy *= -1;
            this.y = this.y < length / 2 ? this.radius : length - this.radius;
        }

        const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
        const minDistance = this.radius + width * 0.05;
        if (distance < minDistance) {
            const overlap = minDistance - distance;
            const angle = Math.atan2(this.y - player.y, this.x - player.x);
            this.x += Math.cos(angle) * overlap;
            this.y += Math.sin(angle) * overlap;
            const impactSpeed = Math.sqrt(this.dx ** 2 + this.dy ** 2);
            const relativeSpeed = (player.dx - this.dx) ** 2 + (player.dy - this.dy) ** 2;
            if (relativeSpeed > 2) {
                this.dx += player.dx * 0.5;
                this.dy += player.dy * 0.5;
            }
        }
    }
}

class CPU {
    constructor() {
        this.x = width / 2; // Start at the top middle
        this.y = length * 0.05; // Start at the top
        this.dx = 3;
        this.dy = 3;
        this.homePosition = { x: width / 2, y: length * 0.2 }; // Define home position
        this.minY = length * 0.05; // Min y position (top)
    }

    draw() {
        dimension.beginPath();
        dimension.arc(this.x, this.y, width * 0.05, 0, 2 * Math.PI);
        dimension.fillStyle = "yellow";
        dimension.fill();
        dimension.stroke();
    }

    update() {
        if (!gameOver && puck.y < this.y) {
            this.retract();
        } else {
            this.strike();
            const distance = Math.sqrt((this.x - puck.x) ** 2 + (this.y - puck.y) ** 2);
            const minDistance = puck.radius + width * 0.05;
            if (distance < minDistance) {
                const overlap = minDistance - distance;
                const angle = Math.atan2(this.y - puck.y, this.x - puck.x);
                puck.x += Math.cos(angle) * overlap;
                puck.y += Math.sin(angle) * overlap;
                const impactSpeed = Math.sqrt(puck.dx ** 2 + puck.dy ** 2);
                const relativeSpeed = (this.dx - puck.dx) ** 2 + (this.dy - puck.dy) ** 2;
                if (relativeSpeed > 2) {
                    puck.dx += this.dx * 0.5;
                    puck.dy += this.dy * 0.5;
                }
            }
        }
    
        // Ensure the CPU cannot cross the middle line
        if (this.y > length / 2) {
            this.y = length / 2;
        }
        if (this.y < this.minY) {
            this.y = this.minY;
        }
    }

    strike(){
        const relativeX = puck.x - this.x
        const relativeY = puck.y - this.y
        const theta = Math.atan(relativeX/relativeY)
        const vector = 10
        this.dx = vector*Math.sin(theta)
        this.dy = vector*Math.cos(theta)

        this.x += this.dx
        this.y += this.dy

    }

    retract(){
        this.dx = 3
        this.dy = 3
        this.x += this.x > this.homePosition.x ? this.dx*-1 : this.dx
        this.y += this.y > this.homePosition.y ? this.dy*-1 : this.dy
    }
}

class Net {
    constructor(x, y, width, height, team) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.team = team; // 'user' or 'cpu'
    }

    draw() {
        dimension.fillStyle = 'black';
        dimension.fillRect(this.x, this.y, this.width, this.height);
    }

    checkScore(puck) {
        if (
            puck.x - puck.radius >= this.x &&
            puck.x + puck.radius <= this.x + this.width &&
            puck.y + puck.radius >= this.y &&
            puck.y - puck.radius <= this.y + this.height
        ) {
            if (this.team === 'user') {
                userScore++;
                if (userScore >= 7) {
                    gameOver = true;
                    console.log('Game Over! User Wins!');
                    showEndMessage("User");
                    return;
                }
                console.log('User scored!');
                puck.spawnInFrontOfNet(cpuNet);
            } else if (this.team === 'cpu') {
                cpuScore++;
                if (cpuScore >= 7) {
                    gameOver = true;
                    console.log('Game Over! CPU Wins!');
                    showEndMessage("CPU");
                    return;
                }
                console.log('CPU scored!');
                puck.spawnInFrontOfNet(userNet);  
            }
        }
    }
}



function showEndMessage(winner) {
    dimension.clearRect(0, 0, width, length);
    dimension.font = "30px Arial";
    dimension.fillStyle = "black";
    dimension.fillText(`Game Over! ${winner} Wins!`, width / 2 - 150, length / 2 - 30);
    dimension.fillText("Do you want to play again? (Y/N)", width / 2 - 150, length / 2 + 30);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'y' || event.key === 'Y') {
            resetGame();
            animate();
        } else if (event.key === 'n' || event.key === 'N') {
            // Do nothing or show some exit message
        }
    });
}

function resetGame() {
    userScore = 0;
    cpuScore = 0;
    gameOver = false;
    puck.reset();
}

const player = new User();
const puck = new Puck();
const cpu = new CPU();
const userNet = new Net(width / 2 - width * 0.2, 0, width * 0.4, length * 0.05, 'user');
const cpuNet = new Net(width / 2 - width * 0.2, length - length * 0.05, width * 0.4, length * 0.05, 'cpu');

function drawScore() {
    dimension.font = "30px Arial";
    dimension.fillStyle = "black";
    dimension.fillText("User: " + userScore, 20, 40);
    dimension.fillText("CPU: " + cpuScore, width - 150, 40);
}

function animate() {
    dimension.clearRect(0, 0, width, length);

    Rink();

    player.draw();
    player.update();

    puck.draw();
    puck.update();

    cpu.draw();
    cpu.update();

    userNet.draw(); // Draw user net
    cpuNet.draw(); // Draw CPU net

    userNet.checkScore(puck);
    cpuNet.checkScore(puck);

    drawScore(); // Draw the score

    if (!gameOver) {
        requestAnimationFrame(animate);
    }
}

animate();