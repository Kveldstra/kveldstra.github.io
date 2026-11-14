const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d"); //gives us "ctx" the "paintbrush"

const gameTitle = "RUNNER";  //CHANGE to game name later

const groundY = 280; //ground position

//game objects
const player = { x: 50, y: 220, width: 40, height: 60,
    velocityY: 0,     //how fast we move up/ down
    onGround: true    //are we standing on the ground?
};

const gravity = 0.5;  //pulls the player down every frame
const jumpStrength = -12;  //negative = upward

let gameSpeed = 5;  //dynamic obstacle speed
const startSpeed = 5;  //speed resets to this
const maxSpeed = 12;  //speed never exceeds this
const obstacles = [];  //starts a new array (list) of all the obstacles
let spawnTimer = 0;  //counts frames since last obstacle
let nextSpawn = 90;  //wait how many frames before next obstacle
let gameStarted = false;  //has the player pressed start yet?
let gameOver = false;  //is the run over?
let score = 0;  //starting score
let highScore =0;  //starting highScore

const hitboxPadding = 8;  //hitbox forgivness, how many pixels to shrink on each side

const startButton = { x: 300, y: 125, width: 200, height: 50 };  //where the start button sits (x, y is its top-left corner)

//listen for spacebar: jump, start, or restart
document.addEventListener("keydown", function (event) {
    if (event.code !== "Space") return;
        event.preventDefault();

    if (!gameStarted) {
        if (!event.repeat) gameStarted = true;
    } else if (gameOver) {
        if (!event.repeat) resetGame();  //ignore a held-down key
    } else if (player.onGround) {
        player.velocityY = jumpStrength;
        player.onGround = false;
    }
});

//clicking the start button also starts the game
canvas.addEventListener("click", function (event) {
    if (gameStarted) return;

    const b = startButton;
    const clickedButton = 
        event.offsetX >= b.x && event.offsetX <= b.x + b.width &&
        event.offsetY >= b.y && event.offsetY <= b.y + b.height;

    if (clickedButton) gameStarted = true;
});

//return everything to its starting numbers
function resetGame() {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.onGround = true;
    obstacles.length = 0;
    spawnTimer = 0;
    nextSpawn = 90;
    gameSpeed = startSpeed;
    score = 0;
    gameOver = false;
}

//creates and adds a new obstacle to the list
function spawnObstacle() {
    const height = 30 + Math.random() * 30;  //random height between 30 and 60
    obstacles.push({
        x: canvas.width,       //starts just off the right edge
        y: groundY - height,   //bottom of the obstacle stays on the ground
        width: 20,
        height: height
    });
}

//do these two boxes (obstacles) overlap? 4 number comparisons says yes or no
function isColliding(a,b) {
    return a.x < b.x + b.width &&  //a's left edge is left of b's right edge
    a.x + a.width > b.x &&  //a's right edge is right of b's left edge
    a.y < b.y + b.height &&  //a's top is above b's bottom
    a.y + a.height > b.y;  //a's bottom is below b's top
}

//hitbox forgivness
function getPlayerHitbox() {
    return {
        x: player.x + hitboxPadding,
        y: player.y + hitboxPadding,
        width: player.width - hitboxPadding * 2,
        height: player.height - hitboxPadding * 2
    };
}

//update: change the numbers
function update() {
    if (!gameStarted || gameOver) return;  //freeze at the beginning and once the run is over

    //score and speed both increase with each frame
    score += 0.1;
    if (gameSpeed < maxSpeed) {
        gameSpeed += 0.002;
    }

    //player physics
    player.velocityY += gravity;  //gravity changes the speed
    player.y += player.velocityY;  //speed changes the position
    //land on the ground
    if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }

    //spawn timer
    spawnTimer++;
    if(spawnTimer >= nextSpawn) {
        spawnObstacle();
        spawnTimer = 0;
        nextSpawn = 70 + Math.random() * 80;  //wait between 70 and 150 frames
    }

    //move every obstacle, and remove the ones that left the screen
    for (let i = obstacles.length - 1; i >= 0; i--) {   //start i at the last item, keep going while i is 0 or more, and count down by one each time
        obstacles[i].x -= gameSpeed;
        
        //check for a hit
        if(isColliding(getPlayerHitbox(), obstacles[i])) {
            gameOver = true;
            console.log("hit!");
            highScore = Math.max(highScore, Math.floor(score));  //sets the larger of the two numbers as the highscore
        }
        
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

//start screen
function drawStartScreen() {
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.font = "48px sans-serif";
    ctx.fillText(gameTitle, canvas.width / 2, 110);

    //button
    const b = startButton;
    ctx.fillStyle = "tomato";
    ctx.fillRect(b.x, b.y, b.width, b.height);

    //button label
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("PRESS START", b.x + b.width / 2, b.y + b.height / 2 + 8);  //+8 nudges the text

    //hint
    ctx.fillStyle ="#333";
    ctx.font = "16px sans-serif";
    ctx.fillText("or press Space", canvas.width / 2, 200);
}

//draw: paint the current numbers into the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //wipes the canvas at the start of each draw

    //ground
    ctx.fillStyle = "#333"; //fillStyle sets the color
    ctx.fillRect(0, groundY, canvas.width, 2); //fillRect(x, y, width, height) draws a rectangle. 
        //Sidenote: x and y start at the TOP LEFT, y increases going down
    
    //player
    ctx.fillStyle = "tomato";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    //on the start screen, draw the menu and skip the rest
    if(!gameStarted) {
        drawStartScreen();
        return;
    }

    //obstacle, draw every obstacle in the list
    ctx.fillStyle = "#333";
    for (const o of obstacles) {   //do this for each item in the list, calling it o
        ctx.fillRect(o.x, o.y, o.width, o.height);
    }

    //score display, top right
    ctx.fillStyle = "#333";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("HI " + highScore + "   " + Math.floor(score), canvas.width - 20, 30);

    //game over message + hint
    if (gameOver) {
        ctx.textAlign = "center";
        ctx.font = "32px sans-serif";
        ctx.fillText("GAME OVER", canvas.width / 2, 140);
        ctx.font = "16px sans-serif";
        ctx.fillText("Press Space to restart", canvas.width / 2, 170);
    }
}

// the game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); //tells the browser to run gameLoop again right before it paints the next frame
}

gameLoop();


// endless runner:
// x Blank canvas, draw shape
// x game loop
// x make the player jump w gravity
// x obstacles that scroll toward player
// x collision detection, game over
// x score & restart
// x title page
//   replace shapes with my art & tweak game to customize

//Kaylie Veldstra x Claude practice 2026