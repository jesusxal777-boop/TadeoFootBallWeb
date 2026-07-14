class Ball {
    constructor(game, x, y) {
        this.game = game;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 1200;
        this.friction = 0.98;
        this.bounce = 0.7;
    }
    
    update() {
        // Aplicar gravedad
        this.vy += this.gravity * (1 / 60);
        
        // Aplicar fricción
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Actualizar posición
        this.x += this.vx * (1 / 60);
        this.y += this.vy * (1 / 60);
        
        // Colisión con el suelo
        if (this.y + this.radius >= FIELD_Y + FIELD_HEIGHT) {
            this.y = FIELD_Y + FIELD_HEIGHT - this.radius;
            this.vy *= -this.bounce;
            
            // Detener si está muy lento
            if (Math.abs(this.vy) < 50) {
                this.vy = 0;
            }
        }
        
        // Colisión con el techo
        if (this.y - this.radius <= FIELD_Y) {
            this.y = FIELD_Y + this.radius;
            this.vy *= -this.bounce;
        }
        
        // Colisión con las paredes
        if (this.x - this.radius <= FIELD_X) {
            this.x = FIELD_X + this.radius;
            this.vx *= -this.bounce;
        }
        if (this.x + this.radius >= FIELD_X + FIELD_WIDTH) {
            this.x = FIELD_X + FIELD_WIDTH - this.radius;
            this.vx *= -this.bounce;
        }
        
        // Colisión con jugadores
        this.checkPlayerCollision(this.game.player);
        this.checkPlayerCollision(this.game.rival);
    }
    
    checkPlayerCollision(player) {
        const dx = this.x - (player.x + player.width / 2);
        const dy = this.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + player.width / 2;
        
        if (distance < minDistance) {
            // Separar la pelota del jugador
            const angle = Math.atan2(dy, dx);
            this.x = player.x + player.width / 2 + Math.cos(angle) * minDistance;
            this.y = player.y + player.height / 2 + Math.sin(angle) * minDistance;
            
            // Transferir velocidad del jugador a la pelota
            this.vx = player.vx * 0.5 + Math.cos(angle) * 200;
            this.vy = player.vy * 0.5 + Math.sin(angle) * 200;
        }
    }
    
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
    }
    
    draw(ctx, images) {
        if (images.ball) {
            ctx.drawImage(images.ball, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Patrón de pentágonos
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
