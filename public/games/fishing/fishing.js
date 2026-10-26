import { Level } from './level.js'
import { Fish } from './fish.js'
import renderObjectManager from "./canvas_game/render_object_manager.js"
import assetManager from "./canvas_game/asset_manager.js"
import renderer from "./canvas_game/renderer.js"
import { OrthogonalCamera } from "./canvas_game/cameras.js"
import navigationManager from "./canvas_game/navigation_manager.js"
import stateManager from "./canvas_game/state_manager.js"
import audioManager from "./canvas_game/audio_manager.js"

window.debugGame = function () {
    console.log('dropping latest state of various game systems')
    console.log(
        assetManager,
        stateManager,
        renderer,
        renderObjectManager,
        audioManager,
        navigationManager
    )
}

const camera = new OrthogonalCamera(undefined, 256, 256)
renderer.renderObjectManager = renderObjectManager;
renderer.camera = camera

export class Fishing_Game {

    #save_locally = false;
    get save_locally() {
        return this.#save_locally
    }
    set save_locally(value) {
        this.#save_locally = value;
        if (this.elements.save_locally) {
            this.elements.save_locally.checked = value;
        }
        stateManager.saveLocally = value
    }

    #current_time = 0;
    #last_time = 0;
    //NOTE: paused location may or may not need to be change. as long as it is part of the game loop, it should be fine (though an interface my be needed to check if paused) 
    #paused = false;
    get paused() {
        return this.#paused;
    }
    #started = false;
    get started() {
        return this.#started;
    }
    #level; get level() {
        return this.#level;
    }
    //save key is not needed, but a key that represent the game namespace may be useful.
    save_key = 'fishing_save_state';
    save_version = 1;
    dirty_save_state = false;
    //most of the rod logic should stay here or in it own object. how the fish respond should be move to the fish object and simplfy the callbacks
    catch_bonus = 0.5; //this is to allow one to wait between catches
    //should have them assign later
    //NOTE: this might be kept, but it may be better to have them at class level since assets are going to be stored in the asset manager
    //so controll elements will be the only ones that will manage here(though assests may still be stored for quicker acess)
    elements = {
        sound_volume: undefined,
        splash_sound: undefined,
        quick_splash_sound: undefined,
        score: undefined
    }
    //todo: have the sounds stored in a array and loop it to set the sound volumn. could also make callables that dose that as well, but that can be harder to manage
    updateSounds() {
        let soundVolume = 1;
        if (this.soundVolumnController) {
            soundVolume = this.soundVolumnController.value;
            audioManager.volume = soundVolume = this.soundVolumnController.value;
        }
        if (this.soundsEffects.splash) {
            this.soundsEffects.splash.volume = soundVolume;
        }
        if (this.soundsEffects.quickSplash) {
            this.soundsEffects.quickSplash.volume = soundVolume;
        }

    }
    save() {
        //need to set the state properties to sync for now 
        //since old system did not store a state and store these values in itself
        const client = stateManager.getState('client')
        const player = stateManager.getState('player')

        //also save version may need to be save on all state base on what logic change. for now verion is not really used
        client.save_version = this.save_version;
        client.save_locally = this.save_locally;
        client.sound_volume = this.sound_volume;
        player.fishingScore = this.score;

        stateManager.saveState('client')
        stateManager.saveState('player')

    }
    load() {

        const client = stateManager.loadState('client') || {}
        const player = stateManager.loadState('player') || {}

        this.save_locally = client.save_locally ? true : false;
        this.sound_volume = parseFloat(client.sound_volume) || 0.25;
        this.score = player.fishingScore || 0;
        if (this.score > 0 && this.elements.score) {
            this.elements.score.innerHTML = `Score: ${this.score}`;
        }
    }
    async register_elements(element_info = {}) {
        this.soundVolumnController = document.getElementById(element_info.sound_volume || 'sound_volume')
        this.soundsEffects = {
            //Note: free neocities seem to disallow sound upload so either host elsewhere or generate the sound via code
            splash: await assetManager.load('https://ezmameow.github.io/assets/splash.wav', 'splashSound'),
            quickSplash: await assetManager.load('https://ezmameow.github.io/assets/quick_splash.wav', 'quickSplashSound')
        }
        this.elements = {
            save_locally: document.getElementById(element_info.save_locally || 'fishing_save_locally'),
            score: document.getElementById(element_info.score || 'score'),
            gameCanvas: document.getElementById(element_info.gameCanvas || 'gameCanvas')

        }
        camera.viewport = this.elements.gameCanvas
        this.updateSounds();
        if (this.soundVolumnController) {
            this.soundVolumnController.addEventListener('change', (event) => {
                this.soundVolume = parseFloat(event.target.value);
                const sound = this.soundsEffects.splash;
                audioManager.volume = parseFloat(event.target.value);
                audioManager.playAudioElement(sound, 'soundEffects')
                this.dirty_save_state = true;
            })
        }
        if (this.elements.save_locally) {
            this.elements.save_locally.addEventListener('change', (event) => {
                this.save_locally = event.target.checked;
                this.dirty_save_state = true;
            })
        }
    }
    update() {
        if (this.paused) { return; }
        this.#current_time = performance.now();

        if (document.hidden || document.visibilityState !== "visible" || !document.hasFocus()) {
            this.#last_time = this.#current_time;
            requestAnimationFrame(() => this.update());
            return
        }
        const delta = (this.#current_time - this.#last_time) / 1000.0;
        if (delta > 2.0) { console.log('delta is greater than 2 seconds') }
        this.#last_time = this.#current_time;
        this.level.update(delta)
        //may need a slower loop for save checking. NOTE: saving might not save when game loop is paused(or it shouldn't)
        if (this.dirty_save_state = true) {
            this.save();
            this.dirty_save_state = false;
        }
        if (this.catch_bonus < 1.25) {
            this.catch_bonus += delta
        }
        if (this.elements.gameCanvas) {
            renderer.render(this.elements.gameCanvas)
        }


        requestAnimationFrame(() => this.update());
    }
    pause() {
        if (this.paused) { return }
        this.#paused = true;
    }
    resume() {
        if (!this.paused) { return }
        this.#paused = false;
        //ignore starting the loop if the 
        //game have not started yet.
        if (!this.#started) { return }
        this.#last_time = performance.now();
        this.#current_time = performance.now();
        this.update();
    }
    update_fish(fish, depth = 0) {
        const random_point = [0.0, 0.0, 0.0];

        const region = navigationManager.getRegion('bounds');
        if (region) {
            navigationManager.getRandomPoint(region, fish.width, fish.height, 0, fish.move_to)
            navigationManager.getRandomPoint(region, fish.width, fish.height, 0, random_point)
        }

        const fish_types = Object.keys(this.fish_data);
        fish.type = this.fish_data[fish_types[Math.floor(Math.random() * fish_types.length)]] || {};
        fish.weight_ratio = Math.random();
        const weight = fish.type.min_weight + (fish.type.max_weight - fish.type.min_weight) * fish.weight_ratio;
        const size = weight <= 10 ? 0.25 + (0.75 - 0.25) * weight / 10.0 : 0.75 + (3.0 - 0.75) * (weight - 10) / 1000.0;
        fish.difficulty = size / 3.0;
        fish.set_position(random_point[0], random_point[1]);
        fish.base_speed = Math.random() * 10 + 5 + size * 2;
        fish.set_scale(
            Math.random() + size,
            Math.random() + size
        )
        fish.depth = depth;
    }
    on_fish_caught = () => {
    }
    fish_caught(catch_data = {}) {
        const random_point = [0.0, 0.0];
        const sound = this.soundsEffects.splash;
        audioManager.playAudioElement(sound, 'soundEffects');
        if (!this.inventory) {
            this.inventory = new Map();
        }
        if (catch_data.fish.type) {
            if (!this.inventory.has(catch_data.fish.type)) {
                this.inventory.set(catch_data.fish.type, {
                    //amount: 0,
                    total_catches: 0,
                    weight_ratio: 0.0,
                    min_weight_ratio: undefined,
                    max_weight_ratio: 0
                })
            }
            const meta = this.inventory.get(catch_data.fish.type)
            //amount is needed for vol count. both amount and weight can be reduce
            //NOTE: amount is normally needed for simple items. it may be convert to 
            //the ceil of weight or treated as a float (and replace weight)
            //catches will be used for the total catches and inventory display may need 
            //be config to handle display that correctly
            const total_weight = catch_data.fish.weight + (catch_data.fish.min_weight + (catch_data.fish.max_weight - catch_data.fish.min_weight) * meta.weight_ratio)
            meta.weight_ratio = (total_weight - catch_data.fish.min_weight) / (catch_data.fish.max_weight - catch_data.fish.min_weight);
            // meta.amount += 1;
            meta.total_catches += 1;
            if (!meta.min_weight_ratio) {
                meta.min_weight_ratio = catch_data.fish.weight_ratio
            }
            else if (catch_data.fish.weight_ratio < meta.min_weight_ratio) {
                meta.min_weight_ratio = catch_data.fish.weight_ratio
            }
            if (catch_data.fish.weight_ratio > meta.max_weight_ratio) {
                meta.max_weight_ratio = catch_data.fish.weight_ratio
            }
        }
        //console.log(this.inventory)
        this.score += Math.max(Math.floor(catch_data.fish.difficulty * 100), 1)
        this.elements.score.innerHTML = `Score: ${this.score}`;
        //console.log(catch_data.fish.type, ' ', catch_data.fish.weight, 'kg')
        this.update_fish(catch_data.fish);
        this.dirty_save_state = true;
        this.catch_bonus = 0.25;
        this.on_fish_caught();
    }
    failed_catch(catch_data = {}) {
        const sound = this.soundsEffects.quickSplash;
        audioManager.playAudioElement(sound, 'soundEffects');
        this.catch_bonus = 0.25;
    }

    //todo: make this handle a promiss properly by resolving it on_ready
    async start() {
        if (this.#started) { return }
        this.#started = true;
        this.#level = await Level.create();

        const random_point = [0.0, 0.0];
        const fish_data = {
            width: 16,
            height: 16,
            img_src: '/assets/fish.gif',
            opacity: 0.9
        }
        for (let i = 0; i < 10; i++) {
            const region = navigationManager.getRegion('bounds');
            if (region) {
                navigationManager.getRandomPoint(region, fish_data.width, fish_data.height, 0, random_point)
            }
            else { console.log('mewmew', navigationManager) }
            fish_data.x = random_point[0];
            fish_data.y = random_point[1];
            fish_data.base_speed = Math.random() * 8 + 8;
            fish_data.scale_x = Math.random() * 1.5 + 0.5;
            fish_data.scale_y = Math.random() * 1.5 + 0.5;
            const fish = await Fish.create(fish_data)
            this.update_fish(fish, Math.random() * 0.5 + 0.5)
            this.level.addChild(fish)
            fish.onCaught = (event) => { this.fish_caught(event) }
            fish.onEscaped = (event) => this.failed_catch(event)
            fish.onBite = (event) => {
                event.catchBonus = this.catch_bonus;
            }
        }

        if (!this.#paused) {
            //if paused when start, then it will start paused.
            this.#last_time = performance.now();
            this.#current_time = performance.now();
            this.update();
        }
        if (this.elements.gameCanvas) {
            const canvas = this.elements.gameCanvas;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;

            canvas.addEventListener('click', function (event) {
                const rect = canvas.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                renderObjectManager.onClick(x, y, Infinity, 10, camera)
            })
        }

    }
    constructor() {
        //for connecting to some window events related to pausing
        window.addEventListener('blur', () => {
            this.pause();
        });

        // When the window gains focus
        window.addEventListener('focus', () => {
            this.resume();
        });
    }
}

export async function start_fishing_game(options = {}) {
    const game = new Fishing_Game();
    const save_key = options.save_key || 'fishing_save_state'
    game.register_elements(options.element_info || {})
    const mixFishData = await assetManager.load("./data/mixwater_fish.json")
    const fishData = options.saltwater ? await assetManager.load("./data/saltwater_fish.json") : await assetManager.load("./data/freshwater_fish.json");
    //for reasons json files will have its contents either in data or content. text files might also behave this way. this is to prevent overriding the asset properties
    //jsons that represnt a object like image as a atlas is expected to follow a patter, but also could have code to make sure it is followed
    game.fish_data = fishData.content
    Object.assign(game.fish_data, mixFishData.content);
    game.load(save_key);
    game.start();
    return game;
}