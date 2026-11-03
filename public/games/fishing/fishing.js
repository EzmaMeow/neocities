import { Level } from './level.js'
import { Fish } from './fish.js'
import renderObjectManager from "./canvas_game/render_object_manager.js"
import assetManager from "./canvas_game/asset_manager.js"
import renderer from "./canvas_game/renderer.js"
import { OrthogonalCamera } from "./canvas_game/cameras.js"
import navigationManager from "./canvas_game/navigation_manager.js"
import stateManager from "./canvas_game/state_manager.js"
import audioManager from "./canvas_game/audio_manager.js"
import definitions from "./canvas_game/definitions.js"

const fishList = [
    "carp",
    "catfish",
    "crappie",
    "trout",
    "largemouth_bass",
    "smallmouth_bass",
    "sturgeon",
    "walleye",
    "pike",
    "pickerel",
    "muskellunge",
    "bluegill",
    "sunfish",
    "drum",
    "tilapia",
    "salmon"
]
//definitions.addEventListener("definitionLoaded", (event) => {
//    console.log('meow?', event)
//})


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
    #catchBonus = 0.5; //this is to allow one to wait between catches
    set catchBonus(value) {
        this.#catchBonus = value;
        if (this.catchSucessProgress) {
            this.catchSucessProgress.value = Math.min(Math.max(value * 100, 0), 100);
        }
    }
    get catchBonus() {
        return this.#catchBonus;
    }
    //should have them assign later
    //NOTE: this might be kept, but it may be better to have them at class level since assets are going to be stored in the asset manager
    //so controll elements will be the only ones that will manage here(though assests may still be stored for quicker acess)
    elements = {
        sound_volume: undefined,
        splash_sound: undefined,
        quick_splash_sound: undefined,
        score: undefined
    }
    setSaveLocally(value) {
        if (this.saveLocallyToggle) {
            this.saveLocallyToggle.checked = value;
        }
        stateManager.saveLocally = value
        this.dirtySaveState = true;
    }
    updateSoundVolume(value) {
        audioManager.volume = value;
        if (this.soundVolumnController) {
            this.soundVolumnController.value = value;

        }
        if (this.soundsEffects.splash) {
            this.soundsEffects.splash.volume = value;
        }
        if (this.soundsEffects.quickSplash) {
            this.soundsEffects.quickSplash.volume = value;
        }
        this.dirtySaveState = true;
    }
    //todo: have the sounds stored in a array and loop it to set the sound volumn. could also make callables that dose that as well, but that can be harder to manage
    updateSounds() {
        let soundVolume = 1;
        if (this.soundVolumnController) {
            soundVolume = this.soundVolumnController.value;
            audioManager.volume = soundVolume;
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
        const client = this.client || stateManager.getState('client')
        const player = this.player || stateManager.getState('player')

        //also save version may need to be save on all state base on what logic change. for now verion is not really used
        //client.save_version = this.save_version;
        client.saveLocally = stateManager.saveLocally;
        client.soundVolume = audioManager.volume;
        player.fishingScore = this.score;

        stateManager.saveState('client')
        stateManager.saveState('player')
        this.dirtySaveState = false;
        //TODO: remove old unused keys. ideally use a version checker to trim saves eventually

    }
    load() {

        this.client = stateManager.loadState('client') || {}
        this.player = stateManager.loadState('player') || {}

        this.updateSoundVolume(this.client.soundVolume || 0.25)
        this.setSaveLocally(this.client.saveLocally);
        this.score = this.player.fishingScore || 0;
        if (this.score > 0 && this.elements.score) {
            this.elements.score.innerHTML = `Score: ${this.score}`;
        }

        //note: this.inventory is a map made by this as an old way of storing items.
        //the display uses inventory.js to load that map data for display
        //can not convery map to json, but may be able it save inventoryData from inventory as json (should be an array of object or array of object and object meta)
        //so should move to use the inventory here

        this.dirtySaveState = false;
    }

    async register_elements(element_info = {}) {
        this.soundVolumnController = document.getElementById(element_info.soundVolume || 'sound_volume');
        this.saveLocallyToggle = document.getElementById(element_info.saveLocally || 'fishing_save_locally');
        this.catchSucessProgress = document.getElementById(element_info.catchSuccess || 'catchSuccess');
        this.lastCatchElement = document.getElementById(element_info.lastCatch || 'last-catch');
        this.soundsEffects = {
            //Note: free neocities seem to disallow sound upload so either host elsewhere or generate the sound via code
            splash: await assetManager.load('https://ezmameow.github.io/assets/splash.wav', 'splashSound'),
            quickSplash: await assetManager.load('https://ezmameow.github.io/assets/quick_splash.wav', 'quickSplashSound')
        }
        this.elements = {
            //save_locally: document.getElementById(element_info.save_locally || 'fishing_save_locally'),
            score: document.getElementById(element_info.score || 'score'),
            gameCanvas: document.getElementById(element_info.gameCanvas || 'gameCanvas')

        }
        camera.viewport = this.elements.gameCanvas

        if (this.soundVolumnController) {
            this.soundVolumnController.addEventListener('change', (event) => {
                this.updateSoundVolume(parseFloat(event.target.value))
                const sound = this.soundsEffects.splash;
                audioManager.playAudioElement(sound, 'soundEffects')
            })
            this.updateSoundVolume(parseFloat(this.soundVolumnController.value));
        }
        if (this.saveLocallyToggle) {
            this.saveLocallyToggle.addEventListener('change', (event) => {
                this.setSaveLocally(event.target.checked);
            })
            this.setSaveLocally(this.saveLocallyToggle.checked);
        }
        //setting the dirty save state to false so this dose not save a state on load
        this.dirtySaveState = false;
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
        if (this.dirtySaveState) {
            this.save();
        }
        if (this.catchBonus < 1.0) {
            this.catchBonus += delta
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

        const fish_types = Object.keys(this.fishData);
        fish.type = this.fishData[fish_types[Math.floor(Math.random() * fish_types.length)]] || {};
        fish.weight_ratio = Math.random();
        const weight = fish.type.minWeight + (fish.type.maxWeight - fish.type.minWeight) * fish.weight_ratio;
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
    onFishCaught = () => {
    }
    fish_caught(catch_data = {}) {
        const random_point = [0.0, 0.0];
        const sound = this.soundsEffects.splash;
        audioManager.playAudioElement(sound, 'soundEffects');
        if (!this.inventory) {
            this.inventory = new Map();
        }
        if (!this.player.logs) {
            this.player.logs = {};
        }
        if (!this.player.logs.fish) {
            this.player.logs.fish = {};
        }
        const fishLog = this.player.logs.fish;
        const fishType = catch_data.fish.type ? catch_data.fish.type.id : "fish";
        if (!fishLog[fishType]) {
            fishLog[fishType] = {
                totalCatches: 0,
                weightRatio: 0.0,
                minWeightRatio: undefined,
                maxWeightRatio: 0
            }
        }
        const fishLogData = fishLog[fishType];
        fishLogData.weightRatio += catch_data.fish.weight_ratio;
        fishLogData.totalCatches += 1;
        if (!fishLogData.minWeightRatio) {
            fishLogData.minWeightRatio = catch_data.fish.weight_ratio
        }
        else if (catch_data.fish.weight_ratio < fishLogData.minWeightRatio) {
            fishLogData.minWeightRatio = catch_data.fish.weight_ratio
        }
        if (catch_data.fish.weight_ratio > fishLogData.maxWeightRatio) {
            fishLogData.maxWeightRatio = catch_data.fish.weight_ratio
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
        //console.log(this.player.inventory)
        this.score += Math.max(Math.floor(catch_data.fish.difficulty * 100), 1)
        this.dirtySaveState = true;
        this.elements.score.innerHTML = `Score: ${this.score}`;
        //console.log(catch_data.fish.type, ' ', catch_data.fish.weight, 'kg')
        if (this.lastCatchElement && catch_data.fish.type.name) {
            this.lastCatchElement.innerText = `Latest catch: ${catch_data.fish.type.name} (${catch_data.fish.weight.toFixed(3)}kg)`
        }
        this.update_fish(catch_data.fish);
        this.catchBonus = 0.0;

        this.onFishCaught();
    }
    failed_catch(catch_data = {}) {
        const sound = this.soundsEffects.quickSplash;
        audioManager.playAudioElement(sound, 'soundEffects');
        this.catchBonus = 0.0;
    }
    async loadInitFishes() {
        const random_point = [0.0, 0.0];

        const fishData = {
            width: 16,
            height: 16,
            img_src: '/assets/fish.gif',
            opacity: 0.9
        }

        if (!this.fishData) { this.fishData = {} }

        for (let fish of fishList) {
            await definitions.load(`fish/${fish}.json`).then((data) => {
                if (!data) {
                    return
                }
                this.fishData[data.id || fish] = data;
            });
        }

        for (let i = 0; i < 10; i++) {
            const region = navigationManager.getRegion('bounds');
            if (region) {
                navigationManager.getRandomPoint(region, fishData.width, fishData.height, 0, random_point)
            }
            else { console.log('mewmew', navigationManager) }
            fishData.x = random_point[0];
            fishData.y = random_point[1];
            fishData.base_speed = Math.random() * 8 + 8;
            fishData.scale_x = Math.random() * 1.5 + 0.5;
            fishData.scale_y = Math.random() * 1.5 + 0.5;
            const fish = await Fish.create(fishData)
            this.update_fish(fish)
            //this.update_fish(fish, Math.random() * 0.5 + 0.5)
            this.level.addChild(fish)
            fish.onCaught = (event) => { this.fish_caught(event) }
            fish.onEscaped = (event) => this.failed_catch(event)
            fish.onBite = (event) => {
                event.catchBonus = this.catchBonus;
            }
        }
        //the log need the data to run the update
        //so may need to make a few async functions with onX functions or events
        //when some thing not awaited are finished processing. need to anot await everything so init load dose not stall for things that can load as needed
        //such as loading in the fish. the fish are needed, but having the scenen render and have the fish spawn under water once their data loaded may be better
        if (this.onReady){
            this.onReady();
        }
    }
    //todo: make this handle a promiss properly by resolving it on_ready
    async start() {
        if (this.#started) { return }
        this.#started = true;
        this.#level = await Level.create();

        //const random_point = [0.0, 0.0];
        //const fishData = {
        //    width: 16,
        //    height: 16,
        //    img_src: '/assets/fish.gif',
        //    opacity: 0.9
        //}
        //if (!this.fishData) { this.fishData = {} }
        this.loadInitFishes()
        
        //for (let fish of fishList) {
        //    await definitions.load(`fish/${fish}.json`).then((data) => {
        //        if (!data) {
        //            return
        //        }
        //        this.fishData[fish] = data;
        //    });
        //}

        //for (let i = 0; i < 10; i++) {
        //    const region = navigationManager.getRegion('bounds');
        //    if (region) {
        //        navigationManager.getRandomPoint(region, fishData.width, fishData.height, 0, random_point)
        //    }
        //    else { console.log('mewmew', navigationManager) }
        //   fishData.x = random_point[0];
        //    fishData.y = random_point[1];
        //    fishData.base_speed = Math.random() * 8 + 8;
        //    fishData.scale_x = Math.random() * 1.5 + 0.5;
        //    fishData.scale_y = Math.random() * 1.5 + 0.5;
        //    const fish = await Fish.create(fishData)
        //    this.update_fish(fish, Math.random() * 0.5 + 0.5)
        //    this.level.addChild(fish)
        //    fish.onCaught = (event) => { this.fish_caught(event) }
        //    fish.onEscaped = (event) => this.failed_catch(event)
        //    fish.onBite = (event) => {
        //        event.catchBonus = this.catchBonus;
        //    }
        //}

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
    //const mixFishData = await assetManager.load("./data/mixwater_fish.json")
    //const fishData = options.saltwater ? await assetManager.load("./data/saltwater_fish.json") : await assetManager.load("./data/freshwater_fish.json");
    //for reasons json files will have its contents either in data or content. text files might also behave this way. this is to prevent overriding the asset properties
    //jsons that represnt a object like image as a atlas is expected to follow a patter, but also could have code to make sure it is followed
    // game.fishData = fishData.content
    //Object.assign(game.fishData, mixFishData.content);

    await game.start();
    game.load(save_key);
    return game;
}