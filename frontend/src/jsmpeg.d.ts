

declare module 'jsmpeg-player' {
  export class Player {
    constructor (url: string, options: { canvas: HTMLCanvasElement, autoplay?: boolean });

    /**
     * Starts playback
     */
    play(): void;
    /**
     * Pauses playback
     */
    pause(): void;
    /**
     * Stop playback and goes to the beginning
     */
    stop(): void;
    /**
     * advance playback by one video frame. This does not decode audio. 
     * @returns true on success and false when there's not enough data.
     */
    nextFrame(): boolean;
    /**
     * Stops playback, disconnects the source and cleans up WebGL and WebAudio state. The player can not be used afterwards.
     */
    destroy(): void;
    /**
     * The audio volume (0-1)
     */
    volume: number;
    /**
     * The current playback position in seconds
     */
    currentTime: number;
    /**
     * playback is paused
     * @readonly
     */
    paused: boolean;
  }
  export = { Player } ;
}
