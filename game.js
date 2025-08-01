import { AudioManager } from './audioManager.js';

const COOKING_ACTIONS = {
    chop: { icon: '🔪', label: 'Chop' },
    fry: { icon: '🍳', label: 'Fry' },
    boil: { icon: '🍲', label: 'Boil' },
};
const ACTION_TYPES = Object.keys(COOKING_ACTIONS);

const SOUND_ASSETS = {
    correct: 'https://play.rosebud.ai/assets/Retro PickUp Coin 07.wav?MQsm',
    error: 'https://play.rosebud.ai/assets/Retro Descending Short 20.wav?UZNz',
    complete: 'https://play.rosebud.ai/assets/Retro PowerUP StereoUP 05.wav?JFxQ'
};

class FastKitchenGame {
    constructor() {
        this.orderQueueEl = document.getElementById('order-queue');
        this.playerInputEl = document.getElementById('player-input');
        this.scoreEl = document.getElementById('score');
        this.livesEl = document.getElementById('lives');
        this.timerBarEl = document.getElementById('timer-bar');

        this.currentOrder = [];
        this.playerInput = [];
        this.score = 0;
        this.lives = 3;
        this.timerId = null;
        this.orderTimeLimit = 5000;

        this.level = 1;
        this.ordersCompleted = 0;

        this.audioManager = new AudioManager(SOUND_ASSETS);

        this.setupEventListeners();
        this.generateNewOrder();
    }

    setupEventListeners() {
        const chopBtn = document.getElementById('chop-btn');
        const fryBtn = document.getElementById('fry-btn');
        const boilBtn = document.getElementById('boil-btn');

        chopBtn.addEventListener('click', () => this.handleAction('chop'));
        fryBtn.addEventListener('click', () => this.handleAction('fry'));
        boilBtn.addEventListener('click', () => this.handleAction('boil'));
    }

    generateNewOrder() {
        this.stopTimer();
        this.ordersCompleted++;

        if (this.ordersCompleted % 3 === 0) {
            this.level++;
        }

        const minLen = 2 + Math.floor(this.level / 2);
        const maxLen = minLen + 1;
        const orderLength = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;

        this.currentOrder = [];
        this.playerInput = [];

        for (let i = 0; i < orderLength; i++) {
            const randomAction = ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)];
            this.currentOrder.push(randomAction);
        }

        this.orderTimeLimit = Math.max(2000, 5000 - (this.level - 1) * 500);

        this.displayOrder();
        this.displayPlayerInput();
        this.updateScore();
        this.updateLives();
        this.updateLevel();
        this.startTimer();
    }

    displayOrder() {
        this.orderQueueEl.innerHTML = '';
        const orderTicket = document.createElement('div');
        orderTicket.className = 'order-ticket';

        this.currentOrder.forEach(actionId => {
            const stepIcon = document.createElement('div');
            stepIcon.className = 'step-icon';
            stepIcon.textContent = COOKING_ACTIONS[actionId].icon;
            orderTicket.appendChild(stepIcon);
        });

        this.orderQueueEl.appendChild(orderTicket);
    }

    displayPlayerInput() {
        this.playerInputEl.innerHTML = '';
        if (this.playerInput.length === 0) {
            this.playerInputEl.innerHTML = '<span class="placeholder">Waiting for input...</span>';
        } else {
            this.playerInput.forEach(actionId => {
                const stepIcon = document.createElement('div');
                stepIcon.className = 'step-icon progress';
                stepIcon.textContent = COOKING_ACTIONS[actionId].icon;
                this.playerInputEl.appendChild(stepIcon);
            });
        }
    }

    updateScore() {
        this.scoreEl.textContent = `Score: ${this.score}`;
    }

    updateLives() {
        this.livesEl.innerHTML = `<span>${'❤️'.repeat(this.lives)}${'🖤'.repeat(3 - this.lives)}</span>`;
    }

    updateLevel() {
        const levelEl = document.getElementById('level');
        if (levelEl) {
            levelEl.textContent = `Level: ${this.level}`;
        }
    }

    startTimer() {
        this.timerBarEl.style.transition = 'none';
        this.timerBarEl.style.width = '100%';
        void this.timerBarEl.offsetWidth;
        this.timerBarEl.style.transition = `width ${this.orderTimeLimit / 1000}s linear`;
        this.timerBarEl.style.width = '0%';

        this.timerId = setTimeout(() => this.handleTimeOut(), this.orderTimeLimit);
    }

    stopTimer() {
        clearTimeout(this.timerId);
        this.timerId = null;
    }

    handleTimeOut() {
        if (this.lives === 0) return;
        this.lives--;
        this.updateLives();
        document.body.style.animation = 'shake 0.5s';
        setTimeout(() => document.body.style.animation = '', 500);

        if (this.lives > 0) {
            this.generateNewOrder();
        } else {
            this.playerInputEl.innerHTML = '<span class="placeholder">Game Over!</span>';
            this.stopTimer();
        }
        this.audioManager.playSound('error');
    }

    handleAction(actionType) {
        if (this.lives === 0) return;

        this.playerInput.push(actionType);
        this.displayPlayerInput();

        const currentStepIndex = this.playerInput.length - 1;

        if (this.playerInput[currentStepIndex] !== this.currentOrder[currentStepIndex]) {
            this.audioManager.playSound('error');
            this.lives--;
            this.updateLives();
            this.playerInput = [];
            document.body.style.animation = 'shake 0.5s';
            setTimeout(() => document.body.style.animation = '', 500);

            if (this.lives === 0) {
                this.playerInputEl.innerHTML = '<span class="placeholder">Game Over!</span>';
                this.stopTimer();
            } else {
                setTimeout(() => this.displayPlayerInput(), 100);
            }
            return;
        }

        this.audioManager.playSound('correct');

        if (this.playerInput.length === this.currentOrder.length) {
            this.audioManager.playSound('complete');
            this.score += 10;
            this.updateScore();
            this.stopTimer();
            setTimeout(() => this.generateNewOrder(), 500);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new FastKitchenGame();
});
