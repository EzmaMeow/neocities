import { MediaWrapper } from '/lib/media_wrapper.js'

export class Radio extends MediaWrapper {
    SAVEKEY = 'radioPlayerOption:';
    #audio
    get audio() { return this.#audio; }
    defaultStation = "https://radio.garden/listen/wcpe-the-classical-station/dNa5l6AK";
    stationName = ''
    stateChange() {

    }
    parseUrlInput(url) {
        if (url === '%defaultStation') {
            url = this.defaultStation;
        }
        let streamUrl = url;
        let stationId = null;
        //will replace url with the default station if '%defaultStation' was passed
        if (url) {
            this.stationName = url;
        }
        else {
            this.stationName = '';
        }
        if (!streamUrl.startsWith('http://')) {
            stationId = streamUrl;
        }
        if (streamUrl.startsWith('https://radio.garden/listen/')) {
            const urlParts = streamUrl.split('/').filter(Boolean);
            stationId = urlParts.length ? urlParts[urlParts.length - 1] : '';
            this.stationName = urlParts.length ? urlParts[urlParts.length - 2] : '';
        }
        if (stationId) {
            streamUrl = `https://radio.garden/api/ara/content/listen/${stationId}/channel.mp3`
        }
        return streamUrl
    }
    parseBoolean(value) {
        let newValue = value
        if (typeof newValue === "string") {
            newValue = /^true$/i.test(newValue.trim());
        }
        return Boolean(newValue);
    }
    setOption(property, value) {
        if (property === 'volume') {
            this.target.volume = parseFloat(value);
            return true;
        }
        if (property === 'src') {
            this.load(this.parseUrlInput(value));
            return true;
        }
        if (property === 'autoplay') {
            this.target.autoplay = this.parseBoolean(value);
            return true;
        }
        if (property === 'useLocalStorage') {
            this.useLocalStorage = this.parseBoolean(value);
            return true;
        }
        return false;

    }
    saveOption(property, value) {
        if (this.useLocalStorage) {
            localStorage.setItem(this.SAVEKEY + property, value)
        }
        else {
            sessionStorage.setItem(this.SAVEKEY + property, value)
        }
    }
    loadOption(property, defaultValue) {
        let value = localStorage.getItem(this.SAVEKEY + property)
        if (value === null) {
            value = sessionStorage.getItem(this.SAVEKEY + property)
        }
        if (value === null) {
            value = defaultValue
        }
        this.setOption(property, value)
        return value;

    }
    routeOptionInputs(optionClass) {
        const options = document.querySelectorAll(optionClass);
        options.forEach(option => {
            //sync the value
            const loadValue = this.loadOption(
                option.dataset.property,
                option.type === 'checkbox' ? option.checked : option.value
            )

            if (option.type === 'checkbox') {
                if (typeof loadValue === "string") {
                    option.checked = /^true$/i.test(loadValue.trim());
                }
                else {
                    option.checked = Boolean(loadValue);
                }

            }
            else {
                option.value = loadValue;
            }
            option.addEventListener('change', (event) => {
                const target = event.target;
                const property = target.dataset.property;
                const value = target.type === 'checkbox' ? target.checked : target.value;
                if (this.setOption(property, value)) {
                    this.saveOption(property, value);
                }
            });
        });
    }
    //The error callback is a way to update the state when browser prevents playback on load by catching the error when playing on load without overriding load.
    onError(error) {
        this.stateChange();
    }
    constructor(mediaElement) {
        super(mediaElement);
        this.target.addEventListener("timeupdate", () => this.stateChange());
        this.target.addEventListener("pause", () => this.stateChange());
        this.target.addEventListener("ended", () => this.stateChange());

    }
}
export function initRadio(options={}) {
    const streamInput = document.getElementById(options.streamInput || 'streamUrl');
    const radio = new Radio(document.getElementById(options.radioAudio || 'radioAudio'));
    const toggleRadioElement = document.getElementById(options.radioToggle || 'toggleRadio');

    function loadRadio() {
        radio.load(radio.parseUrlInput(streamInput.value.trim()), radio.target.autoplay);
    }
    function defaultClicked() {
        streamInput.value = '%defaultStation';
        if (radio.setOption('src', '%defaultStation')) {
            radio.saveOption('src', '%defaultStation');
        }
    }

    function toggleRadio() {
        radio.toggle();
    }

    function unlockAudio() {
        loadRadio();
        document.removeEventListener("click", unlockAudio);
        document.removeEventListener("keydown", unlockAudio);
        document.removeEventListener("touchstart", unlockAudio);
    }

    radio.routeOptionInputs('.radioOptions');

    if (toggleRadioElement) {
        radio.stateChange = () => {
            if (radio.isStopped) {
                toggleRadioElement.innerHTML = `∅${radio.stationName ? ' Failed to play from ' + radio.stationName: ' No source. '}`;
            }
            else if (!radio.isPlaying) {
                toggleRadioElement.innerHTML = '▷ Paused from ' + radio.stationName;
            }
            else {
                toggleRadioElement.innerHTML = '⏸ Playing from ' + radio.stationName;
            }
        }
        if (!radio.target.autoplay){
            toggleRadioElement.innerHTML = `∅${radio.stationName ? ' Not playing from ' + radio.stationName: ' No source.'}`;
        }
    }
    
    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
    document.getElementById('radioDefaultStation').addEventListener("click", (event) => defaultClicked())
    document.getElementById('toggleRadio').addEventListener("click", (event) => toggleRadio())
    return radio
}
//init()