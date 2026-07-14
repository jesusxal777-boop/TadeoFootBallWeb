// Este archivo contiene funciones de utilidad para la UI
// Las funciones principales se manejan en game.js

// Función para reproducir sonidos (placeholder)
function playSound(soundName) {
    // Implementar reproducción de sonidos aquí
    console.log('Playing sound:', soundName);
}

// Función para mostrar notificaciones
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

// Función para crear partículas
function createParticles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Función para vibración (si está disponible)
function vibrate(duration = 100) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}
