import { AudioManager } from './audioManager.js';

const COOKING_ACTIONS = {
  chop: '🔪',
  fry: '🍳',
  boil: '🍲'
};

const ACTION_TYPES = Object.keys(COOKING_ACTIONS);

const SOUND_ASSETS = {
  correct: 'https://play.rosebud.ai/assets/Retro%20PickUp%20Coin%2007.wav?MQsm',
  error: 'https://play.rosebud.ai/assets/Retro%20Descending%20Short%2020.wav?UZNz',
  complete: 'https://play.rosebud.ai/assets/Retro%20PowerUP%20StereoUP%2005.wav?JFxQ'
};

class FastKitchenGame {
  constructor() {
    console.log("Fast Kitchen game initialized!");

    this.orderQueueEl = document.getElementById('order-queue');
    this.playerInputEl = document.getElementById('player-input');
    this.scoreEl = document.getElementById('score');
    this.livesEl = document.getElementById('lives');
    this.levelEl = document.getElementById('level');
    this.timerBarEl = document.getElementById('timer-bar');

    this.audioManager = new AudioManager(SOUND_ASSETS);

    this.currentOrder = [];
    this.playerInput = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.orderTimeLimit = 5000;
    this.timerId = null;

    this.setupEventListeners();
    this.generateNewOrder();
  }

  setupEventListeners() {
    document.getElementById('chop-btn').addEventListener('click', () => this.handleAction('chop'));
    document.getElementById('fry-btn').addEventListener('click', () => this.handleAction('fry'));
    document.getElementById('boil-btn').addEventListener('click', () => this.handleAction('boil'));
  }

  updateScore() {
    this.scoreEl.textContent = `Score: ${this.score}`;
  }

  updateLives() {
    const heart = '❤️';
    const lost = '🖤';
    const hearts = heart.repeat(this.lives) + lost.repeat(3 - this.lives);
    this.livesEl.innerHTML = `<span>${hearts}</span>`;
  }

  updateLevel() {
    const newLevel = Math.floor(this.score / 50) + 1;

    if (newLevel !== this.level) {
      this.level = newLevel;
      this.levelEl.textContent = `Level: ${this.level}`;

      const minTimeLimit = 2500;
      this.orderTimeLimit = Math.max(minTimeLimit, 5000 - (this.level - 1) * 500);
    }
  }

  generateNewOrder() {
    this.stopTimer();

    const maxLength = Math.min(2 + this.level, 6); // max 6 adım
    const orderLength = Math.floor(Math.random() * 2) + (maxLength - 1); // 2–3 → 3–4 → 4–5 gibi

    this.currentOrder = [];
    this.playerInput = [];

    for (let i = 0; i < orderLength; i++) {
      const randomAction = ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)];
      this.currentOrder.push(randomAction);
    }

    this.displayOrder();
    this.displayPlayerInput();
    this.updateScore();
    this.updateLives();
    this.updateLevel();
    this.startTimer();
  }

  displayOrder() {
    this.orderQueueEl.innerHTML = this.currentOrder.map(action => `<span>${COOKING_ACTIONS[action]}</span>`).join('');
  }

  displayPlayerInput() {
    if (this.lives === 0) return;
    if (this.playerInput.length === 0) {
      this.playerInputEl.innerHTML = '<span class="placeholder">Start Cooking...</span>';
    } else {
      this.playerInputEl.innerHTML = this.playerInput.map(action => `<span>${COOKING_ACTIONS[action]}</span>`).join('');
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

    this.audioManager.playSound('error');
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
      this.updateLevel();
      this.stopTimer();
      setTimeout(() => this.generateNewOrder(), 500);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => new FastKitchenGame());
