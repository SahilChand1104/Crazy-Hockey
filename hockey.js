const canvas = document.createElement("Canvas");
const width = canvas.width = 700;
const length = canvas.height = 900;
document.body.appendChild(canvas);
const dimension = canvas.getContext('2d');

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
        this.x = undefined;
        this.y = undefined;
        this.prevX = undefined;
        this.prevY = undefined;
        this.dx = undefined;
        this.dy = undefined;
    }

    draw() {
        dimension.beginPath();
        dimension.arc(this.x, this.y, width * 0.05, 0, 2 * Math.PI);
        dimension.fillStyle = "purple";
        dimension.fill();
        dimension.stroke();
    }

    update() {
        this.dx = this.x - this.prevX;
        this.dy = this.y - this.prevY;
        this.prevX = this.x;
        this.prevY = this.y;
    }
}

class Puck {
    constructor() {
        this.x = width / 2;
        this.y = length / 2;
        this.radius = width * 0.04;
        this.dx = 2;
        this.dy = 2;
    }

    draw() {
        dimension.beginPath();
        dimension.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        dimension.fillStyle = "black";
        dimension.fill();
        dimension.stroke();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

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

const player = new User();
const puck = new Puck();

function animate() {
    dimension.clearRect(0, 0, width, length);

    Rink();

    player.draw();
    player.update();

    puck.draw();
    puck.update();

    requestAnimationFrame(animate);
}

animate();
