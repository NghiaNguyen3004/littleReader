/**
 * AUDIO PLAYER
 * ============
 * This file manages the audio playback controls.
 * 
 * What does it do?
 * - Controls playing and pausing the audiobook
 * - Manages volume and playback position
 * - Provides helper functions for the audio element
 * 
 * Note: In this simple version, we use the HTML5 <audio> element
 * which has built-in controls, so this file is mainly for future
 * enhancements like custom controls or playlists.
 */

/**
 * AudioPlayer class - Manages audio playback
 */
class AudioPlayer {
    /**
     * Create a new AudioPlayer
     * @param {HTMLAudioElement} audioElement - The HTML audio element to control
     */
    constructor(audioElement) {
        this.audioElement = audioElement;
        this.isPlaying = false;
        this.volume = 1.0; // Default volume (1.0 = 100%)
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for the audio element
     */
    setupEventListeners() {
        // Update isPlaying when audio starts playing
        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            console.log('▶️ Audio started playing');
        });

        // Update isPlaying when audio is paused
        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
            console.log('⏸️ Audio paused');
        });

        // Log when audio finishes
        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            console.log('✅ Audio finished playing');
        });
    }

    /**
     * Play the audio
     */
    play() {
        if (!this.isPlaying) {
            this.audioElement.play();
        }
    }

    /**
     * Pause the audio
     */
    pause() {
        if (this.isPlaying) {
            this.audioElement.pause();
        }
    }

    /**
     * Stop the audio and reset to beginning
     */
    stop() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0; // Reset to start
        this.isPlaying = false;
    }

    /**
     * Set the volume
     * @param {number} value - Volume level (0.0 to 1.0)
     */
    setVolume(value) {
        // Ensure value is between 0 and 1
        this.volume = Math.max(0, Math.min(1, value));
        this.audioElement.volume = this.volume;
    }

    /**
     * Get the current playback time
     * @returns {number} - Current time in seconds
     */
    getCurrentTime() {
        return this.audioElement.currentTime;
    }

    /**
     * Set the current playback time
     * @param {number} time - Time in seconds
     */
    setCurrentTime(time) {
        this.audioElement.currentTime = time;
    }

    /**
     * Get the total duration of the audio
     * @returns {number} - Duration in seconds
     */
    getDuration() {
        return this.audioElement.duration;
    }

    /**
     * Check if audio is currently playing
     * @returns {boolean} - True if playing, false otherwise
     */
    isAudioPlaying() {
        return this.isPlaying;
    }
}