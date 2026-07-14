// Configuración del juego
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 600;
const FIELD_X = 40;
const FIELD_Y = 60;

// Estados del juego
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    VICTORY: 'victory',
    DEFEAT: 'defeat'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.state = GAME_STATE.MENU;
        this.currentMatch = 0;
        this.playerScore = 0;
        this.rivalScore = 0;
        this.gameTime = 90;
        this.matchTimer = null;
        
        this.rivals = [
            { name: 'Estados Unidos', difficulty: 1.0 },
            { name: 'Brasil', difficulty: 1.2 },
            { name: 'Argentina', difficulty: 1.4 },
            { name: 'Francia', difficulty: 1.6 },
            { name: 'Inglaterra', difficulty: 1.8 }
        ];
        
        this.images = {};
        this.loadImages();
        this.setupEventListeners();
        
        this.player = null;
        this.rival = null;
        this.ball = null;
        
        this.gameLoop();
    }
    
    loadImages() {
        const imagesToLoad = [
            { name: 'ball', src: 'assets/images/ball.png' },
            { name: 'playerMexico', src: 'assets/images/player_mexico.png' },
            { name: 'playerRival', src: 'assets/images/player_rival.png' },
            { name: 'background', src: 'assets/images/background.png' }
        ];
        
        imagesToLoad.forEach(img => {
            const image = new Image();
            image.src = img.src;
            image.onload = () => {
                this.images[img.name] = image;
            };
            image.onerror = () => {
                console.warn(`No se pudo cargar: ${img.src}`);
                // Crear un canvas de respaldo
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(0, 0, 64, 64);
                this.images[img.name] = canvas;
            };
        });
    }
    
    setupEventListeners() {
        document.getElementById('playBtn').addEventListener('click', () => this.startGame());
        document.getElementById('creditsBtn').addEventListener('click', () => this.showCredits());
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        this.currentMatch = 0;
        this.startMatch();
    }
    
    startMatch() {
        this.playerScore = 0;
        this.rivalScore = 0;
        this.gameTime = 90;
        this.state = GAME_STATE.PLAYING;
        
        // Ocultar menús
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('creditsScreen').classList.add('hidden');
        document.getElementById('victoryScreen').classList.add('hidden');
        document.getElementById('gameHUD').classList.remove('hidden');
        
        // Crear objetos del juego
        this.player = new Player(this, 200, 400);
        this.rival = new Rival(this, 1000, 400);
        this.ball = new Ball(this, 640, 300);
        
        // Actualizar HUD
        document.getElementById('rivalName').textContent = this.rivals[this.currentMatch].name;
        
        // Mostrar mensaje
        this.showMessage(`Partido ${this.currentMatch + 1}: México vs ${this.rivals[this.currentMatch].name}`);
        
        // Iniciar temporizador
        if (this.matchTimer) clearInterval(this.matchTimer);
        this.matchTimer = setInterval(() => this.updateTimer(), 1000);
    }
    
    updateTimer() {
        this.gameTime--;
        document.getElementById('gameTimer').textContent = this.gameTime;
        
        if (this.gameTime <= 0) {
            this.endMatch(this.playerScore > this.rivalScore);
        }
    }
    
    endMatch(playerWon) {
        clearInterval(this.matchTimer);
        this.state = GAME_STATE.PAUSED;
        
        if (playerWon) {
            if (this.currentMatch < this.rivals.length - 1) {
                this.showMessage('¡Ganaste! Siguiente partido...');
                setTimeout(() => {
                    this.currentMatch++;
                    this.startMatch();
                }, 2000);
            } else {
                this.showVictory();
            }
        } else {
            this.showMessage('Perdiste. Inténtalo de nuevo.');
            setTimeout(() => {
                this.startMatch();
            }, 2000);
        }
    }
    
    showMessage(text) {
        const messageEl = document.getElementById('gameMessage');
        document.getElementById('messageText').textContent = text;
        messageEl.classList.remove('hidden');
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }
    
    showVictory() {
        this.state = GAME_STATE.VICTORY;
        document.getElementById('gameHUD').classList.add('hidden');
        document.getElementById('victoryScreen').classList.remove('hidden');
    }
    
    showMenu() {
        this.state = GAME_STATE.MENU;
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('creditsScreen').classList.add('hidden');
        document.getElementById('gameHUD').classList.add('hidden');
        if (this.matchTimer) clearInterval(this.matchTimer);
    }
    
    showCredits() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('creditsScreen').classList.remove('hidden');
    }
    
    update() {
        if (this.state !== GAME_STATE.PLAYING) return;
        
        this.player.update();
        this.rival.update();
        this.ball.update();
        
        // Actualizar UI
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('rivalScore').textContent = this.rivalScore;
        
        // Actualizar barra de energía
        const energyPercent = (this.player.energy / this.player.maxEnergy) * 100;
        document.getElementById('energyFill').style.width = energyPercent + '%';
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar fondo
        if (this.images.background) {
            this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Dibujar campo
        this.drawField();
        
        // Dibujar objetos del juego
        if (this.state === GAME_STATE.PLAYING) {
            this.player.draw(this.ctx, this.images);
            this.rival.draw(this.ctx, this.images);
            this.ball.draw(this.ctx, this.images);
        }
    }
    
    drawField() {
        const ctx = this.ctx;
        
        // Líneas del campo
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        // Rectángulo principal
        ctx.strokeRect(FIELD_X, FIELD_Y, FIELD_WIDTH, FIELD_HEIGHT);
        
        // Línea central
        ctx.beginPath();
        ctx.moveTo(FIELD_X + FIELD_WIDTH / 2, FIELD_Y);
        ctx.lineTo(FIELD_X + FIELD_WIDTH / 2, FIELD_Y + FIELD_HEIGHT);
        ctx.stroke();
        
        // Círculo central
        ctx.beginPath();
        ctx.arc(FIELD_X + FIELD_WIDTH / 2, FIELD_Y + FIELD_HEIGHT / 2, 50, 0, Math.PI * 2);
        ctx.stroke();
        
        // Áreas de portería
        ctx.strokeRect(FIELD_X, FIELD_Y + 150, 100, 300);
        ctx.strokeRect(FIELD_X + FIELD_WIDTH - 100, FIELD_Y + 150, 100, 300);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Iniciar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
