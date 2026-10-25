//this is to help manage group of audio and acts as a manager of audio context so more sound feature could become available in one spot
export class AudioManager {
    //NOTE: This will have minor support for audio element
    //but should focus more on audio node
    //audioContext = new (window.AudioContext || window.webkitAudioContext)();
    #buses = new Map()
    #volume = 1.0
    get volume() { return this.#volume }
    set volume(value = 1.0) {
        if (this.#volume !== value) {
            this.#volume = value;
            this.updateVolume()
        }

    }
    updateVolume() {
        for (const [id, bus] of this.#buses) {
            const volume = bus.volume * this.#volume
            for (const audio of bus.activeAudio) {
                audio.volume = volume
            }
            for (const audio of bus.activeAudio) {
                audio.volume = volume
            }
        }
    }
    addBus(id, bus) {
        if (!id || !bus) {
            return
        }
        return this.#buses.set(id, bus)
    }
    removeBus(id) {
        return this.#buses.delete(id)
    }
    onAudioEnded(audio, bus) {
        bus.activeAudio.delete(audio);
        bus.pendingAudio.delete(audio);
        audio.removeEventListener('ended', () => this.onAudioEnded(audio, bus))
        audio.removeEventListener('play', () => this.onAudioPlay(audio, bus))
    }
    onAudioPlay(audio, bus) {
        bus.pendingAudio.delete(audio);
        bus.activeAudio.add(audio);
        audio.removeEventListener('play', () => this.onAudioPlay(audio, bus))
    }
    pauseAudioElement(audio, busId, restart = true) {
        if (!audio) {
            return
        }
        const bus = this.#buses.get(busId)
        if (bus) {
            bus.activeAudio.delete(audio)
            bus.pendingAudio.delete(audio)
        }
        audio.pause();
        if (restart) {
            audio.currentTime = 0;
        }
    }
    playAudioElement(audio, busId, reset = true) {
        if (!audio) {
            return
        }
        let bus = this.#buses.get(busId)
        if (!bus) {
            if (!busId) {
                audio.volume = this.#volume;
                return audio.play()
            }
            bus = {
                activeAudio: new Set(),
                pendingAudio: new Set(),
                volume: 1.0
            }
            this.addBus(busId, bus)
        }
        audio.volume = bus.volume * this.#volume;
        if (bus.activeAudio.has(audio) && reset) {
            this.pauseAudioElement(audio, busId, reset)
        }
        if (bus.pendingAudio.has(audio)) {
            //audio will play soon if not error
            //so no need to play this call
            return
        }
        bus.pendingAudio.add(audio);

        audio.addEventListener('ended', () => this.onAudioEnded(audio, bus))
        audio.addEventListener('play', () => this.onAudioPlay(audio, bus))

        return audio.play()
            .catch(error => {
                bus.pendingAudio.delete(audio);
                console.warn(error)
            });
    }
    //test(audioElement){
    //this would only play the audio element as a node, but the source object is the same node
    //so the audio should have its stream fetch instead of being loaded as a audio element to be used with
    //audio context if it is expect more than one instance will be used
    //    const node = this.audioContext.createMediaElementSource(audioElement)
    //    node.connect(this.audioContext.destination)
    //}

}
export default new AudioManager();