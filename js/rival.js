class Rival {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 80;
        this.vx = 0;
        this.vy = 0;
        this.speed = 300;
        this.jumpForce = 550;
        this.gravity = 1200;
        this.isJumping = false;
        this.kickRadius = 80;
        this.kickForce = 700;
        this.difficulty = 1.0;
        this.thinkTimer = 0;
    }
    
    update() {
        const ball = this.game.ball;
        
        // Actualizar dificultad según el partido
        this.difficulty = this.game.rivals[this.game.currentMatch].difficulty;
        
        // Lógica de IA
        this.thinkTimer++;
        if (this.thinkTimer > 30) {
            this.thinkTimer = 0;
            this.makeDecision(ball);
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
        
        // Detectar gol
        this.checkGoal();
    }
    
    makeDecision(ball) {
        const dx = ball.x - this.x;
        const dy = ball.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si la pelota está cerca, intentar patearla
        if (distance < this.kickRadius * 1.5) {
            if (Math.abs(dy) < 50 && Math.abs(dx) > 20) {
                this.kick(ball);
            }
            
            // Saltar si la pelota está alta
            if (dy < -50 && !this.isJumping) {
                this.jump();
            }
        }
        
        // Perseguir la pelota
        if (dx > 50) {
            this.vx = this.speed * this.difficulty;
        } else if (dx < -50) {
            this.vx = -this.speed * this.difficulty;
        } else {
            this.vx = 0;
        }
    }
    
    jump() {
        if (!this.isJumping) {
            this.vy = -this.jumpForce;
            this.isJumping = true;
        }
    }
    
    kick(ball) {
        const dx = ball.x - this.x;
        const dy = ball.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.kickRadius) {
            const angle = Math.atan2(dy, dx);
            const kickAngle = angle - Math.PI * 0.2;
            
            ball.vx = Math.cos(kickAngle) * this.kickForce * this.difficulty;
            ball.vy = Math.sin(kickAngle) * this.kickForce * this.difficulty;
        }
    }
    
    checkGoal() {
        const ball = this.game.ball;
        
        // Portería jugador (izquierda)
        if (ball.x < FIELD_X + 50 && 
            ball.y > FIELD_Y + 150 && 
            ball.y < FIELD_Y + 450) {
            this.game.rivalScore++;
            ball.reset();
        }
    }
    
    draw(ctx, images) {
        if (images.playerRival) {
            ctx.drawImage(images.playerRival, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#0000AA';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
