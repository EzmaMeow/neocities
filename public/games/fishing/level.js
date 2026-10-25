import assetManager from "./canvas_game/asset_manager.js"
import renderObjectManager from "./canvas_game/render_object_manager.js"
import { ImageRenderObject } from "./canvas_game/image_render_object.js"
import { SceneNode } from "./canvas_game/scene_node.js"
import navigationManager from "./canvas_game/navigation_manager.js"

export class Level extends SceneNode {
    background
    objects = [];
    world;
    test = 0
    update(delta = 1.0) {
        super.update(delta)
        for (const object of this.objects) {
            object.update(delta);
        }
    }
    //on_ are callbacks that can be assign
    //but only one can exist at a time(unless a signal or event is used)
    async on_ready() {

    }
    //reservr for object ready logic
    async #ready() {
        const image = await assetManager.load("https://64.media.tumblr.com/e98d0375bdc66a34480164c535f87872/bffe166c6db88413-3d/s400x600/9aa3a8b6cb3ec80147edaf474ad8b4bec15b3e64.pnj");
        navigationManager.addRegion('bounds', 256.0, 256.0, 1.0, 0.0, 256.0 - 82.0, 0.0)
        this.backgroundRenderObject = new ImageRenderObject(image, { width: 256, height: 256 })
        renderObjectManager.add(this.backgroundRenderObject)
        this.addChild(this.backgroundRenderObject)
        await this.on_ready()
    }
    //Note: could make this async, just need to reslove on load (also maybe rename this?)
    async setup(element, background, world = this.world) {
        await this.#ready();
        
    }
    constructor(world = {}) {
        super();
        
    }
}