//this handled definitions based assets
//this might replace items role of handling item definition since a definition should cover at least log, enitiy, and item
//Note that this can be loaded in as a global object. decided not to depend on asset manager since this is just data. should also reduce asset clutter
//also using object over map since most this data should stay loaded for a while
export class Definitions extends EventTarget {
    //Note: dose not nessary need to cache the data in asset manager nor dose it need to use asset manager if not caching
    path = "./data/definitions"
    #definitions = {};
    get definitions() {
        return this.#definitions
    }
    //NOTE: unlike assets, this will lack a cleanup functions. may be lazy and try adding gneric events to notify whena  definitation is removed or add
    async load(src) {
        if (!src) {
            return
        }
        if (this.#definitions[src]) {
            return this.#definitions[src]
        }
        //may need to handle \ as well, but path otherrides should be rare
        const path = src.startsWith("./") || src.startsWith("/") ? src : `${this.path}/${src}`
        const definition = await fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .catch(error => {
                console.error('Failed to fetch JSON:', error);
            });
        //const definition = await assetManager.load(path, id, cache);
        if (!definition) {
            return definition
        }
        this.#definitions[src] = definition;
        this.dispatchEvent(new CustomEvent('definitionLoaded', {
            detail: {
                path: path,
                src: src,
                definition: definition
            }, // optional custom data
            bubbles: true,
            cancelable: true,
        }))
        return definition
    }
    //slower on larger object and may just rebuild the defininition object if alot of object need to be removed
    unload(src) {
        const definition = this.#definitions[src];
        if (!definition) {
            return
        }
        delete this.#definitions[src];
        this.dispatchEvent(new CustomEvent('definitionUnloaded', {
            detail: {
                src: src,
                definition: definition
            }, // optional custom data
            bubbles: true,
            cancelable: true
        }))
    }
}

//assetManager.classMap.definition = Definition
export default new Definitions();