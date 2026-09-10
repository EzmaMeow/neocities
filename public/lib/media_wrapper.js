//This is a to help read a media element and could be expanded to append features
export class MediaWrapper {
    get isLoading() {
        return this.target.networkState === this.target.NETWORK_LOADING ||
            this.target.readyState < this.target.HAVE_FUTURE_DATA;
    }

    get isReady() {
        return this.target.readyState >= this.target.HAVE_FUTURE_DATA;
    }

    get isPaused() {
        return this.target.paused && !this.target.ended;
    }
    get isPlaying() {
        return !this.target.paused &&
            !this.target.ended &&
            this.target.readyState >= this.target.HAVE_FUTURE_DATA;
    }
    get isStopped() {
        return !this.target.src ||
            this.target.networkState === this.target.NETWORK_EMPTY ||
            (this.target.paused && this.target.currentTime === 0)
    }

    get isBuffering() {
        return this.target.readyState < this.target.HAVE_FUTURE_DATA &&
            !this.target.paused &&
            !this.target.ended;
    }
    get hasError() {
        return this.target.error !== null;
    }
    async play() {
        if (this.isPlaying || this.hasError) {
            return;
        }
        const result = await this.target.play()
            .catch(error => {
                if (this.onError) {
                    //if return true, then it handled the error, else it will log it. in other words return true will stop logging the error
                    if (this.onError(error)) { return };
                }
                console.error(error);
            });
        return result;
    }
    pause() {
        if (!this.isPlaying) return;
        this.target.pause();
    }
    stop() {
        this.target.src = "";
        this.lastPlayPromise = undefined;
        this.pause()
    }
    async toggle() {
        if (!this.target.src) {
            return;
        }
        if (this.isPlaying) {
            this.pause();
        } else if (this.isPaused || this.isReady) {
            return await this.play();
        } else if (this.isStopped && this.target.src) {
            return await this.play();
        }
    }
    async load(src, play = this.target.autoplay) {
        if (this.target.src === src) { return }
        this.stop();
        if (!src) return;
        this.target.src = src;
        if (play && src) {
            return await this.play();
        }
    }
    constructor(audioElement) {
        this.target = audioElement;
    }
}