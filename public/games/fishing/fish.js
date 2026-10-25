import { Entity } from './entity.js'
import assetManager from "./canvas_game/asset_manager.js"
import renderObjectManager from "./canvas_game/render_object_manager.js"
import { ImageRenderObject } from "./canvas_game/image_render_object.js"
import { CAPABILITY_FLAGS } from "./canvas_game/render_object.js"
import navigationManager from "./canvas_game/navigation_manager.js"

export class Fish extends Entity {
    move_to = [0.0, 0.0, 0.0];
    direction = [0.0, 0.0, 0.0];
    velocity = [0.0, 0.0, 0.0];
    base_speed = 8.0;
    //depth and opacity are related, but not the same
    //for example if fish base opacity is .8, then it should
    //be .8 at depth of 1
    _depth = 1.0;
    ai_state = 'idle';
    type = {}
    weight_ratio = 1.0;
    difficulty = 0.0;
    get min_weight() {
        return this.type.min_weight || 0.001;
    }
    get max_weight() {
        return this.type.max_weight || 1.000;
    }
    get weight() {
        //console.log(`${min_weight} ${max_weight} ${this.weight_ratio}`)
        return this.min_weight + (this.max_weight - this.min_weight) * this.weight_ratio;
    } //used as static info about the fish povided by json
    get depth() {
        return this._depth;
    }
    set depth(value = 1.0) {
        this._depth = value;
        this.update_opacity();
    }
    update_opacity() {
        if (this.sprite) {
            this.sprite.opacity = Math.min(Math.max(this.depth * this.opacity, 0), 1);
        }
    }
    get_speed() {
        if (this.sprint) {
            return this.base_speed * this.sprint;
        }
        return this.base_speed;
    }

    onCaught;
    onEscaped;
    onBite;

    onClick(event) {
        this.bite(event)
    }
    caught(event) {
        if (this.onCaught) {
            this.onCaught(event)
        }
    }
    escape(event) {
        if (this.onEscaped) {
            this.onEscaped(event)
        }
        this.flee()
    }
    catch(event) {
        //run logic to see if it Caught or Escaped
        if (!event) {
            event = {}
        }
        if (!event.fish) { event.fish = this }
        event.catchRoll = Math.random();
        event.difficulty = this.difficulty * 0.5 + (1.0 - this.depth) * 0.75; //0.75 is an offset so deep fishes can be impossible (under 0.5 but in this case 0.4-0.3)
        if (event.catchRoll * (event.catchBonus || 1) <= event.difficulty * 2) {
            event.catchSucess = false;
            this.escape(event)
            return
        }
        event.catchSucess = true;
        this.caught(event);
    }
    //bite happens on click
    bite(event) {
        event.fish = this;
        //starts the logic after taking the bait
        if (this.onBite) {
            this.onBite(event)
        }
        this.catch(event)
    }
    flee() {
        this.dive = 0.0;
        this.getRandomPoint(this.move_to);
        //navigationManager.getRandomPoint(this.width, this.height,1, this.move_to)
        this.ai_state = 'dive';
        this.sprint = 2;

    }

    //get random point in the default region
    //this could be more compucated depending on how regions are handled.
    getRandomPoint(results =[0,0,0]){
        const region = navigationManager.getRegion('bounds');
        navigationManager.getRandomPoint(region,this.width, this.height,0, results)
        this.move_to[2]=this.dive;
        return results
    }


    update_animation(delta = 1.0) {
        if (this.sprite) {
            if (typeof this.sprite.frame === "undefined") { this.sprite.frame = 0 }
            if (this.velocity[0] < 0) {
                this.sprite.textureY = 0;
            }
            else {
                this.sprite.textureY = 1;
            }
            this.sprite.frame += delta;
            let step = Math.round(this.sprite.frame * 4)
            this.sprite.textureX = step % 4
        }

    }
    ai(delta = 1.0) {
        if (this.ai_state === 'idle') {
            const roll = Math.random() * 20;
            //console.log(roll)
            if (roll >= 17) {
                this.wait = Math.random() * 25 + 5;
                this.ai_state = 'wait'
                return

            }
            else if (roll < 5) {
                if (this.depth <= 0.5) {
                    this.dive = Math.random() * 0.5 + 0.5;
                    this.ai_state = 'surface'
                    this.getRandomPoint(this.move_to);
                    //navigationManager.getRandomPoint(this.width, this.height,1, this.move_to)
                    return

                }
                else {
                    this.dive = Math.random() * 0.5
                    this.ai_state = 'dive'
                    this.getRandomPoint(this.move_to);
                    //navigationManager.getRandomPoint(this.width, this.height,1, this.move_to)
                    return

                }
            }
            else {
                this.getRandomPoint(this.move_to);
                //navigationManager.getRandomPoint(this.width, this.height,1, this.move_to)
                this.ai_state = 'swiming';
                return
                //console.log('set to swim ', this.move_to);

            }
        }
        else if (this.ai_state === 'wait') {
            this.wait -= delta;
            if (this.wait <= 0.0) {
                this.ai_state = 'idle';
                return
            }

        }
        else if (this.ai_state === 'surface') {
            if (this.depth >= this.dive || this.depth >= 1.0) {
                this.ai_state = 'swiming';
                return
            }
            else {
                this.depth += delta * 0.1;
            }
            if (Math.abs(this.move_to[0] - this.position[0]) <= 1 && Math.abs(this.move_to[1] - this.position[1])
            ) {
                this.getRandomPoint(this.move_to);
                //navigationManager.getRandomPoint(this.width, this.height,1, this.move_to)
            }

        }
        else if (this.ai_state === 'dive') {
            if (this.depth <= this.dive || this.depth <= 0.0) {
                this.sprint = 1;
                this.ai_state = 'swiming';
                return
            }
            else {
                this.depth -= delta * 0.1;
            }
            if (Math.abs(this.move_to[0] - this.position[0]) <= 1 && Math.abs(this.move_to[1] - this.position[1])
            ) {
                this.getRandomPoint(this.move_to);
                //navigationManager.getRandomPoint(navigationManager.getRegion('bounds'),this.width, this.height,1, this.move_to)
            }

        }
        if (this.ai_state === 'swiming') {
            if (Math.abs(this.move_to[0] - this.position[0]) <= 1 && Math.abs(this.move_to[1] - this.position[1])
            ) {
                this.ai_state = 'idle';
                return
            }
        }

    }
    update(delta = 1.0) {
        //needed to have the global transfrom caculated on update if dirty here since it was not updating before (probably too dependent on the getter logic)
        //might be able to remove it and update it on certain changes, but here allow it to run once per update at the cost of when it is called.
        //so may be better to have a few update functions base on order like pre render and post render (and pre physics and post pyshics)
        super.update(delta)
        const position = this.position;
        const speed = this.get_speed()
        this.ai(delta);

        if (this.ai_state === 'idle' || this.ai_state === 'wait') {
            this.update_animation(delta);
            return
        }

        this.direction[0] = this.move_to[0] - position[0];
        this.direction[1] = this.move_to[1] - position[1];

        const length = Math.sqrt(this.direction[0] * this.direction[0] + this.direction[1] * this.direction[1]);

        this.direction[0] /= length;
        this.direction[1] /= length;
        this.velocity[0] = this.direction[0] * speed  * delta;
        this.velocity[1] = this.direction[1] * speed  * delta;
        this.set_position(position[0] + this.velocity[0], position[1] + this.velocity[1], this.depth);
        //if (length > 0.2) {
        this.update_animation(delta);
    }

    save() {
        const data = super.save();
        data.depth = this.depth;
        data.base_speed = this.base_speed;
        //ai state could be save too, but will need to redeisgn it first
        return data;
    }
    load(data) {
        //could also have arrays or object rep random math unless there is a sting eva for that already 
        //(look like evaluateExpression can handle math, but the random numbers would have to added via code)
        super.load(data)
        if (data.depth !== undefined) {
            //will call the update after load
            this.depth = parseFloat(data.depth) || 0.0;
        }
        if (data.base_speed !== undefined) {
            this.base_speed = parseFloat(data.base_speed) || 0.0;
        }
        //type need to be an object. ideally it is parced before this
        //so should not need to convert it (just make sure it is an object)
        if (data.type !== undefined) {
            this.type = data.type || {};
        }
        if (data.weight_ratio !== undefined) {
            this.weight_ratio = parseFloat(data.weight_ratio) || 1.0;
        }
    }

    async ready() {
        const spriteImage = await assetManager.load("/assets/fish.json");
        this.sprite = new ImageRenderObject(spriteImage, {
            width: 12,
            height: 12,
            capabilityFlags: CAPABILITY_FLAGS.CLICKABLE,
            //need to use ()=> since function will bind this to sprite
            onClick: (event) => {
                if (this.onClick) {
                    this.onClick(event || {})
                }
            }
        })
        renderObjectManager.add(this.sprite)
        this.addChild(this.sprite)

    }
}