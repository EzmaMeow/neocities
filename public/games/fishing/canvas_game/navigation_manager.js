import { Mat4 } from "/lib/square_matrix_math.js"

//NOTE: this will be bare bone for navigation and will change
//for now it will hold rect(or circle) regions and blockers(rect or circle)
//for now there may not be any blockers, so the point check will be flat and not grid base or line check
//in other words this class need to be modify base on the project unless a solve all soultion is designed

export class NavigationManager {
    //lazy way will decalre one region and if needed will subtract areas base on block type
    //in future this should be replace with a proper navigation system
    //Note: this means if this get update, old games depending on it will need to be updated to work with it

    #regions = new Map();
    get region() { return this.#regions }

    getRegion(id) {
        return this.#regions.get(id);
    }
    addRegion(id, width = 0, height = 0, depth = 0, x = 0, y = 0, z = 0) {
        if (!id) {
            return
        }
        if (this.#regions.has(id)) {
            const region = this.#regions.get(id)
            Mat4.setPosition(region.transform, x, y, z);
            Mat4.setScale(region.transform, width, height, depth);
            return
        }
        const region = {
            transform: Mat4.identity(),
            allowFlags: 1
        }
        Mat4.setPosition(region.transform, x, y, z)
        Mat4.setScale(region.transform, width, height, depth)
        this.#regions.set(id, region)
        return region
    }
    removeRegion(id) {
        return this.#regions.delete(id);
    }

    setRegion(regionId, width = 0, height = 0, depth = 0, x = 0, y = 0, z = 0) {
        const region = this.getRegion(regionId)
        if (!region) {
            return
        }
        Mat4.setPosition(region.transform, x, y, z)
        Mat4.setScale(region.transform, width, height, depth)
        return region
    }

    getRandomPoint(region, agentWidth = 16.0, agentHeight = 16.0, agentDepth = 0, results = undefined) {
        if (!region) { return }
        if (!results) { results = new Float32Array(3) }
        const minX = Mat4.getPositionX(region.transform) + agentWidth;
        const maxX = Mat4.getXScale(region.transform) - agentWidth;
        const minY = Mat4.getPositionY(region.transform) + agentHeight;
        const maxY = Mat4.getYScale(region.transform) - agentHeight;
        const minZ = Mat4.getPositionZ(region.transform) + agentDepth;
        const maxZ = Mat4.getZScale(region.transform) - agentDepth;
        results[0] = Math.random() * (maxX - minX) + minX;
        results[1] = Math.random() * (maxY - minY) + minY;
        results[2] = Math.random() * (maxZ - minZ) + minZ;
        return results
    }
}
export default new NavigationManager();