// Enemy templates number
const enemy_number = 6;

// Slider
var id=Math.floor(Math.random()*enemy_number)+1;
var timer1=0;
var timer2=0;

const extra = document.getElementById('extra');
extra.innerHTML = "";

const target = document.getElementById('target');
target.innerHTML = "Your Targets:";

const hitpoints = document.getElementById('hitpoints');
hitpoints.innerHTML = "";

const monitor = document.getElementById('monitor');
monitor.style.display = "none";

const credit = document.getElementById('credit');
credit.innerHTML = "Take Aim!";

const blink = document.querySelector('.blink');
blink.style.display = "none";

const hero = document.getElementById('hero');
hero.innerHTML = "<img src='./images/kapitan_bomba.png' id='kapitan'/>";

const nav = document.querySelector('nav');

let start = false;
let gameOver = false;

function slideFade(){
    $("#slider").fadeOut(500);
}

function changeSlide(){
    let nr = id;
    id=Math.floor(Math.random()*enemy_number)+1;
    while(id==nr) id=Math.floor(Math.random()*enemy_number)+1;;
    var obraz="<img src=\"images/slider/enemy"+id+".png\">";
    document.getElementById("slider").innerHTML=obraz;
    if(gameOver==false && start==true){
        extra.innerHTML = "+" + (Math.floor(Math.random()*10)+1) * 10;
        monitor.style.display = "block";
        switch(id){
            case 1: hitpoints.innerHTML = `Hit-points: ${1}`;
            break;
            case 2: hitpoints.innerHTML = `Hit-points: ${1}`;
            break;
            case 3: hitpoints.innerHTML = `Hit-points: ${2}`;
            break;
            case 4: hitpoints.innerHTML = `Hit-points: ${2}`;
            break;
            case 5: hitpoints.innerHTML = `Hit-points: ${3}`;
            break;
            case 6: hitpoints.innerHTML = `Hit-points: ${1}`;
            break;
        };
    };
    $("#slider").fadeIn(500);
    timer1=setTimeout("changeSlide()",1500);
    timer2=setTimeout("slideFade()",1000);
}

function stopSlide(){
    clearTimeout(timer1);
    clearTimeout(timer2);
}

// Game
const cursor = document.querySelector('.cursor');
cursor.style.display = "none";

window.addEventListener('mousemove', (e) => {
    if(e.x > window.innerWidth * 0.25 && e.y > window.innerHeight * 0.1 && e.y < window.innerHeight * 0.9){
        cursor.style.display = "block";
        cursor.style.left = e.pageX + "px";
        cursor.style.top = e.pageY + "px";
    }
    else{
        cursor.style.display = "none";
    }
});

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

ctx.font = '50px Silkscreen';

let score = 0;

let timeToNextEnemy = 0;
let enemyInterval = 500;
let lastTime = 0;

var laser = new Audio('./sounds/laser.mp3');

// Enemies Classes
let enemies = [];

// let aliens = [];

class Alien {
    constructor(){
        this.spriteWidth = 160;
        this.spriteHeight = 160;
        this.sizeModifier = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 0.6 + 0.4 : Math.random() * 0.3 + 0.2;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * ((canvas.height - (0.1 * window.innerHeight)) - (this.height + (0.1 * window.innerHeight))) + (0.1 * window.innerHeight);
        this.directionX = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 5 + 3 : Math.random() * 3.5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/sprites/alien.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceLastFrame = 0;
        this.frameInterval = Math.random() * 100 + 100;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
        this.id = 1;
        this.hitpoints = 1;
    };
    update(deltatime){
        if(this.y < 0 + 0.1 * window.innerHeight || this.y > canvas.height - this.height - 0.1 * window.innerHeight){
            this.directionY *= -1;
        };
        // console.log(this.x);
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.hasTrail){
                for(let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                };  
            };
        };
        if(this.x < (0.25 * window.innerWidth) - this.width/2) gameOver = true;
    };
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    };
};

// let brains = [];

class Brain {
    constructor(){
        this.spriteWidth = 144;
        this.spriteHeight = 120;
        this.sizeModifier = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 0.6 + 0.4 : Math.random() * 0.3 + 0.3;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * ((canvas.height - (0.1 * window.innerHeight)) - (this.height + (0.1 * window.innerHeight))) + (0.1 * window.innerHeight);
        this.directionX = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 5 + 3 : Math.random() * 3.5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/sprites/brain.png';
        this.frame = 0;
        this.maxFrame = 7;
        this.timeSinceLastFrame = 0;
        this.frameInterval = Math.random() * 100 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
        this.id = 2;
        this.hitpoints = 1;
    };
    update(deltatime){
        if(this.y < 0 + 0.1 * window.innerHeight || this.y > canvas.height - this.height - 0.1 * window.innerHeight){
            this.directionY *= -1;
        };
        // console.log(this.x);
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.hasTrail){
                for(let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                };  
            };
        };
        if(this.x < (0.25 * window.innerWidth) - this.width/2) gameOver = true;
    };
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    };
};

// let beetles = [];

class Beetle {
    constructor(){
        this.spriteWidth = 160;
        this.spriteHeight = 160;
        this.sizeModifier = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 0.6 + 0.4 : Math.random() * 0.3 + 0.25;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * ((canvas.height - (0.1 * window.innerHeight)) - (this.height + (0.1 * window.innerHeight))) + (0.1 * window.innerHeight);
        this.directionX = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 4 + 3 : Math.random() * 3 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/sprites/beetle.png';
        this.frame = 0;
        this.maxFrame = 10;
        this.timeSinceLastFrame = 0;
        this.frameInterval = Math.random() * 100 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
        this.id = 3;
        this.hitpoints = 2;
    };
    update(deltatime){
        if(this.y < 0 + 0.1 * window.innerHeight || this.y > canvas.height - this.height - 0.1 * window.innerHeight){
            this.directionY *= -1;
        };
        // console.log(this.x);
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.hasTrail){
                for(let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                };  
            };
        };
        if(this.x < (0.25 * window.innerWidth) - this.width/2) gameOver = true;
    };
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    };
};

// let octopoda = [];

class Octopus {
    constructor(){
        this.spriteWidth = 215;
        this.spriteHeight = 135;
        this.sizeModifier = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 0.6 + 0.4 : Math.random() * 0.3 + 0.25;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * ((canvas.height - (0.1 * window.innerHeight)) - (this.height + (0.1 * window.innerHeight))) + (0.1 * window.innerHeight);
        this.directionX = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 4 + 3 : Math.random() * 2 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/sprites/octopus.png';
        this.frame = 0;
        this.maxFrame = 3;
        this.timeSinceLastFrame = 0;
        this.frameInterval = Math.random() * 100 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
        this.id = 4;
        this.hitpoints = 2;
    };
    update(deltatime){
        if(this.y < 0 + 0.1 * window.innerHeight || this.y > canvas.height - this.height - 0.1 * window.innerHeight){
            this.directionY *= -1;
        };
        // console.log(this.x);
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.hasTrail){
                for(let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                };  
            };
        };
        if(this.x < (0.25 * window.innerWidth) - this.width/2) gameOver = true;
    };
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    };
};

// let insects = [];

class Insect {
    constructor(){
        this.spriteWidth = 184;
        this.spriteHeight = 176;
        this.sizeModifier = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 0.6 + 0.4 : Math.random() * 0.3 + 0.2;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * ((canvas.height - (0.1 * window.innerHeight)) - (this.height + (0.1 * window.innerHeight))) + (0.1 * window.innerHeight);
        this.directionX = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 4 + 3 : Math.random() * 2 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/sprites/insect.png';
        this.frame = 0;
        this.maxFrame = 6;
        this.timeSinceLastFrame = 0;
        this.frameInterval = Math.random() * 100 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
        this.id = 5;
        this.hitpoints = 3;
    };
    update(deltatime){
        if(this.y < 0 + 0.1 * window.innerHeight || this.y > canvas.height - this.height - 0.1 * window.innerHeight){
            this.directionY *= -1;
        };
        // console.log(this.x);
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.hasTrail){
                for(let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                };  
            };
        };
        if(this.x < (0.25 * window.innerWidth) - this.width/2) gameOver = true;
    };
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    };
};

// let eyeballs = [];

class Eyeball {
    constructor(){
        this.spriteWidth = 169;
        this.spriteHeight = 169;
        this.sizeModifier = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 0.6 + 0.4 : Math.random() * 0.3 + 0.25;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * ((canvas.height - (0.1 * window.innerHeight)) - (this.height + (0.1 * window.innerHeight))) + (0.1 * window.innerHeight);
        this.directionX = (window.innerHeight > 500 && window.innerWidth > 1000) ? Math.random() * 5 + 3 : Math.random() * 3 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/sprites/eyeball.png';
        this.frame = 0;
        this.maxFrame = 6;
        this.timeSinceLastFrame = 0;
        this.frameInterval = Math.random() * 100 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
        this.id = 6;
        this.hitpoints = 1;
    };
    update(deltatime){
        if(this.y < 0 + 0.1 * window.innerHeight || this.y > canvas.height - this.height - 0.1 * window.innerHeight){
            this.directionY *= -1;
        };
        // console.log(this.x);
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.hasTrail){
                for(let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                };  
            };
        };
        if(this.x < (0.25 * window.innerWidth) - this.width/2) gameOver = true;
    };
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    };
};

let explosions = [];

class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = './images/sprites/explosion.png';
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio;
        this.sound.src = './sounds/blaster.mp3';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markedForDeletion = false;
    };
    update(deltatime){
        if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 12) this.markedForDeletion = true;
        };
    };
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size)
    };
};

let particles = [];

class Particle {
    constructor(x, y, size, color){
        this.size = size;
        this.x = x + this.size/2 + Math.random() * 50 - 25;
        this.y = y + this.size/3 + Math.random() * 50 - 25;
        this. radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this. color = color;
    };
    update(){
        this.x += this.speedX;
        this.radius += 0.3;
        if(this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    };
    draw(){
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this. radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };
}

function drawScore(){
    ctx.textAlign = 'left';
    if(window.innerHeight > 800 && window.innerWidth > 1200){
        ctx. fillStyle = '#fff';
        ctx.fillText(`Score: ${score}`, window.innerWidth - 0.23 * window.innerWidth - 5, window.innerHeight - 0.82 * window.innerHeight - 5);
        ctx. fillStyle = '#f00';
        ctx.fillText(`Score: ${score}`, window.innerWidth - 0.23 * window.innerWidth, window.innerHeight - 0.82 * window.innerHeight);
    }
    else if(window.innerHeight > 500 && window.innerWidth > 1000){
        ctx. fillStyle = '#fff';
        ctx.fillText(`Score: ${score}`, window.innerWidth - 0.39 * window.innerWidth - 5, window.innerHeight - 0.82 * window.innerHeight - 5);
        ctx. fillStyle = '#f00';
        ctx.fillText(`Score: ${score}`, window.innerWidth - 0.39 * window.innerWidth, window.innerHeight - 0.82 * window.innerHeight);
    }
    else{
        ctx.font = '30px Silkscreen';
        ctx. fillStyle = '#fff';
        ctx.fillText(`Score: ${score}`, window.innerWidth - 0.32 * window.innerWidth - 5, window.innerHeight - 0.87 * window.innerHeight - 5);
        ctx. fillStyle = '#f00';
        ctx.fillText(`Score: ${score}`, window.innerWidth - 0.32 * window.innerWidth, window.innerHeight - 0.87 * window.innerHeight);
    }
    
};

function drawGameOver(){
    hero.innerHTML = "<img src='./images/skull.png' id='skull'/>";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText('Game Over', canvas.width - 0.75 * window.innerWidth/2 - 5, canvas.height/1.7 - 5)
    ctx.fillText('Your score: ' + score, canvas.width - 0.75 * window.innerWidth/2 - 5, 0.55 * canvas.height/0.8 - 5);
    ctx.fillStyle = '#fff';
    ctx.fillText('Game Over', canvas.width - 0.75 * window.innerWidth/2, canvas.height/1.7)
    ctx.fillText('Your score: ' + score, canvas.width - 0.75 * window.innerWidth/2, 0.55 * canvas.height/0.8);
};

window.addEventListener('click', (e) => {
    // console.log(e.x, e.y);
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    // console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    enemies.forEach(object => {
        if(object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
            object.hitpoints--;
            if(object.hitpoints == 0) object.markedForDeletion = true;
            if(object.id === id) score += 1 + parseInt(extra.innerText);
            else score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
            // console.log(explosions);
        };
    });
});

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextEnemy += deltatime;
    // console.log(deltatime);
    // console.log(window.innerHeight, window.innerWidth);
    if(timeToNextEnemy > enemyInterval){
        let enemy = Math.floor(Math.random()*enemy_number);
        // console.log(enemy);
        switch(enemy){
            case 0: enemies.push(new Alien());
            break;
            case 1: enemies.push(new Brain());
            break;
            case 2: enemies.push(new Beetle());
            break;
            case 3: enemies.push(new Octopus());
            break;
            case 4: enemies.push(new Insect());
            break;
            case 5: enemies.push(new Eyeball());
            break;
        };
        // console.log(enemies);
        timeToNextEnemy = 0;
        enemies.sort((a, b) => {
            return a.width - b.width;
        });
    };
    [...particles, ...enemies, ...explosions].forEach(object => object.update(deltatime));
    [...particles, ...enemies, ...explosions].forEach(object => object.draw());
    enemies = enemies.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);
    if(!gameOver){
        drawScore();
        requestAnimationFrame(animate);
    } 
    else {
        drawGameOver();
        collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
        collisionCanvas.style.backgroundColor = "red";
        nav.style.backgroundColor = "red";
        collisionCanvas.style.opacity = 0.5;
        blink.style.display = "none";
        monitor.style.display = "none";
        extra.innerHTML = "";
        target.innerHTML = "Your Targets:";
        credit.innerHTML = "Take Aim!";
        document.getElementById('start').style.display = "inline-block";
    }

};

function startGame(){
    laser.play();
    collisionCanvas.style.opacity = 0;
    nav.style.backgroundColor = "#777777";
    hero.innerHTML = "";
    blink.style.display = "block";
    target.innerHTML = "Current Target:";
    credit.innerHTML = "Extra Credit:";
    stopSlide();
    gameOver = false;
    start = true;
    changeSlide();
    score = 0;
    enemies = [];
    particles = [];
    explosions = [];
    animate(0);
    document.getElementById('start').style.display = "none";
};