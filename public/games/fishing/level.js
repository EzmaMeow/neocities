import assetManager from "./canvas_game/asset_manager.js"
import renderObjectManager from "./canvas_game/render_object_manager.js"
import { ImageRenderObject } from "./canvas_game/image_render_object.js"
import { SceneNode } from "./canvas_game/scene_node.js"
import navigationManager from "./canvas_game/navigation_manager.js"

export class Level extends SceneNode {
    background
    objects = [];
    test = 0
    update(delta = 1.0) {
        super.update(delta)
        for (const object of this.objects) {
            object.update(delta);
        }
    }
    
    //reservr for object ready logic
    async ready() {
        const image = await assetManager.load("/assets/Waterscape2.webp");
        navigationManager.addRegion('bounds', 256.0, 256.0, 1.0, 0.0, 256.0 - 82.0, 0.0)
        this.backgroundRenderObject = new ImageRenderObject(image, { width: 256, height: 256 })
        renderObjectManager.add(this.backgroundRenderObject)
        this.addChild(this.backgroundRenderObject)
    }

    constructor() {
        super();
        
    }
}