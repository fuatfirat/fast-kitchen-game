export class AudioManager {
    constructor(soundConfig) {
        this.sounds = {};
        this.preloadSounds(soundConfig);
    }

    preloadSounds(soundConfig) {
        for (const key in soundConfig) {
            const audio = new Audio(soundConfig[key]);
            audio.preload = 'auto';
            this.sounds[key] = audio;
        }
    }

    playSound(name) {
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => console.error(`Error playing sound: ${name}`, error));
        } else {
            console.warn(`Sound not found: ${name}`);
        }
    }
}
