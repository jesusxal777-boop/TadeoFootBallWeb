class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 80;
        this.vx = 0;
        this.vy = 0;
        this.speed = 400;
        this.jumpForce = 600;
        this.gravity = 1200;
        this.isJumping = false;
        this.energy = 0;
        this.maxEnergy = 100;
        this.kickRadius = 80;
        this.kickForce = 800;
        this.superKickForce = 1600;
        
        this.keys = {};
        this.setupInput();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.jump();
            }
            if (e.key.toLowerCase() === 'x') {
                this.kick();
            }
            if (e.key.toLowerCase() === 'z') {
                this.superKick();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Soporte táctil
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        const canvas = this.game.canvas;
        
        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Botones virtuales
            if (touchY > CANVAS_HEIGHT - 100) {
                if (touchX < CANVAS_WIDTH / 5) {
                    this.keys['ArrowLeft'] = true;
                } else if (touchX < 2 * CANVAS_WIDTH / 5) {
                    this.keys['ArrowRight'] = true;
                } else if (touchX < 3 * CANVAS_WIDTH / 5) {
                    this.jump();
                } else if (touchX < 4 * CANVAS_WIDTH / 5) {
                    this.kick();
                } else {
                    this.superKick();
                }
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
        });
    }
    
    update() {
        // Movimiento horizontal
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.vx = -this.speed;
        } else if (this.keys['ArrowRight'] || this.keys['d']) {
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }
        
        // Aplicar gravedad
        this.vy += this.gravity * (1 / 60);
        
        // Actualizar posición
        this.x += this.vx * (1 / 60);
        this.y += this.vy * (1 / 60);
        
        // Colisión con el suelo
        if (this.y + this.height >= FIELD_Y + FIELD_HEIGHT) {
            this.y = FIELD_Y + FIELD_HEIGHT - this.height;
            this.vy = 0;
            this.isJumping = false;
        }
        
        // Colisión con los límites del campo
        if (this.x < FIELD_X) {
            this.x = FIELD_X;
        }
        if (this.x + this.width > FIELD_X + FIELD_WIDTH) {
            this.x = FIELD_X + FIELD_WIDTH - this.width;
        }
        
        // Recargar energía
        this.energy = Math.min(this.maxEnergy, this.energy + 0.5);
        
        // Detectar gol
        this.checkGoal();
    }
    
    jump() {
        if (!this.isJumping) {
            this.vy = -this.jumpForce;
            this.isJumping = true;
        }
    }
    
    kick() {
        const ball = this.game.ball;
        const dx = ball.x - this.x;
        const dy = ball.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.kickRadius) {
            const angle = Math.atan2(dy, dx);
            const kickAngle = angle - Math.PI * 0.2; // Ángulo hacia arriba
            
            ball.vx = Math.cos(kickAngle) * this.kickForce;
            ball.vy = Math.sin(kickAngle) * this.kickForce;
        }
    }
    
    superKick() {
        if (this.energy >= this.maxEnergy) {
            const ball = this.game.ball;
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.kickRadius * 1.5) {
                const angle = Math.atan2(dy, dx);
                const kickAngle = angle - Math.PI * 0.1;
                
                ball.vx = Math.cos(kickAngle) * this.superKickForce;
                ball.vy = Math.sin(kickAngle) * this.superKickForce;
                
                this.energy = 0;
                
                // Efecto visual
                this.createKickEffect();
            }
        }
    }
    
    createKickEffect() {
        // Aquí se pueden agregar efectos visuales
        console.log('Super Kick!');
    }
    
    checkGoal() {
        const ball = this.game.ball;
        
        // Portería rival (derecha)
        if (ball.x > FIELD_X + FIELD_WIDTH - 50 && 
            ball.y > FIELD_Y + 150 && 
            ball.y < FIELD_Y + 450) {
            this.game.playerScore++;
            ball.reset();
        }
    }
    
    draw(ctx, images) {
        if (images.playerMexico) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(-1, 1);
            ctx.drawImage(images.playerMexico, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillStyle = '#00AA00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
