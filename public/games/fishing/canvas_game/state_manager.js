//this holds stateful objects like game or player state. how the states are split up will depend on the game
//also these states should have an easy way to save and load if they are presistant.
//NOTE: assset manager also handles json (and should also handle text), but these are meant to be fixed data or read only
//while state is more reserver for data that is modify during gameplay and may be save for next session.


//NOTE ON SAVE KEYS. since web and other cases my share certain save files, the save keys should be more detail
//the base key can stay '' or 'game' or something the repsent the all apps that will pull from this namespace
//then the save ids should be appName/client and client(or global/client, but not nessary)
//and game states would not be 'gameState' or 'game', but the name of the game or app. if the game state is a global one, then 'state' or 'global' or 'globalState' would be better
//player may stay player to ref the client player and it should be expected to see both a global and app state
export class StateManager {
    //an ideitifier for the game this is for. could be the game name (probably will add '/' after it to split it up)
    //this is because it may be saved in a similar areas as other savables such as local storage and this helps keep data contained
    saveKeyPrefix = ''
    saveLocally = false;

    #states = new Map();
    protectedStates = ['game', 'player', 'client']

    getStatesKeys() {
        return Array.from(this.#states.keys());
    }
    getState(id) {
        return this.#states.get(id)
    }
    addState(id, value = {}) {
        if (!id) {
            return
        }
        if (this.#states.has(id) && this.protectedStates.includes(id)) {
            //if the state exists and is proteced, return
            return
        }
        this.#states.set(id, value)
    }
    removeState(id) {
        if (!id) {
            return
        }
        if (this.protectedStates.includes(id)) {
            //protected states can only be reset (or set)
            return
        }
        return this.#states.delete(id)
    }
    //reset and set are general use, though getting and calling their functions is more proper if doing more than one task against it
    //but still useful if it only one call
    resetState(id) {
        if (!id) {
            return
        }
        const state = this.#states.get(id)
        if (state.reset) {
            return state.reset()
        }
    }
    //set state is like reset, but it uses a object to set it
    //reset set to true will reset it before appling else it would act more like a bulk property setting
    setState(id, data, reset = true) {
        if (!id || !data) {
            return
        }
        const state = this.#states.get(id)
        if (!state){
            return
        }
        //setState should handle reset cases as well
        if (state.setState) {
            return state.setState(data, reset)
        }
        //but if none is provided, it will attemp to call it before mergining the objects
        //if no reset function, then this won't know what to reset (may delete unessary keys, but rather not)
        //so the reset flag will not do anything if there no reset function or there no setState function
        else {
            if (state.reset && reset) {
                state.reset()
            }
            Object.assign(state, data)
            return state;
        }
    }

    //Note: may need to add save version checker and handler
    saveState(id) {
        if (!id) {
            return
        }
        const state = this.#states.get(id)
        if (!state) {
            return
        }
        let saveState
        //Allow the save state to do logic before getting a save version of the state
        if (state.getSaveState) {
            saveState = state.saveState()
        }
        saveState = JSON.stringify(state);
        if (this.saveLocally) {
            localStorage.setItem(id, saveState)
        }
        else {
            sessionStorage.setItem(id, saveState)
            //purge the local storage catch if exists since
            //we only update it if allowed which may cause issue if one is left (session would be ignored)
            if (id in localStorage) {
                localStorage.removeItem(id);
            }
        }
    }

    loadState(id, defaultState = {}, reset = true) {
        if (!id) {
            return
        }
        let saveState;
            saveState = localStorage.getItem(id)
            if (!saveState) {
                saveState = sessionStorage.getItem(id)
            }
        if (!saveState) {
            saveState = defaultState
        }
        else {
            saveState = JSON.parse(saveState);
        }
        
        if (this.#states.has(id) && this.protectedStates.includes(id)){
            this.setState(id,saveState,reset)
        }
        else {
            this.addState(id,saveState)
        }
        return saveState;
        //TODO: need to make sure a state is made that handles storing client state
        //this.save_locally = save_state.save_locally ? true : false;
        //this.sound_volume = parseFloat(save_state.sound_volume) || 0.25;
        //this.score = save_state.score || 0;
        //if (this.score > 0 && this.elements.score) {
        //    this.elements.score.innerHTML = `Score: ${this.score}`;
        //}
    }
}
export default new StateManager();