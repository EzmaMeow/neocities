//NOTE: may add multi collsion systems for expermention and to not have to waste  time with a 'solve all cases' solution that may end up being slower
//NOTE: this is in planing and will be worked on once there a system that needs it

//Note: true line casts might not be a thing. may be a shape cast and then check all collisions for the ones that collided on a line...unless i understand a better way
//since the goal to have a tile map based system, a cell base collsion manager may be used first for tiles with collsions then check enities. to solve shapes that do not 
//a full  tile size collsion, tile enities may be made. this is a second lookup if a collsion with a tile happens. it will look up if the same region, chunk, and cell id exists 
//in the tile enity conatiner and will use that object to check of there is a collsion. this be useful sonce that tile is still static and keeps them out of the enitity container
//which checks are generaly a filter loop to check what is near and then check if in bounds
//for the tile system, it may be regions(unlimit size, but only a few loaded at a time), chunks(fixed sized base on)

//Note: maze game have a cell base nav system that mess with bitflags. this is less complex, but should help not make the same mistakes when messing with grids and flags

export class TileCollsion {
    //regions are coord keys of a region object that contains chunks, collsion masks, and collsion objects. may using string for easy look up without being limited in amount, but could allow the id function to be change
    //chunks are Uint32Array() with a fix length base on the region area
    //the collsion mask may need to hold the chunks or have an id look up base on chunk id and cell bit
    //Note: could use the filter to open sides at the cost of 4-6(up/down) flags, though may be better not to do that and use neigboring cells as wall and use a mask for secret movement that get toggled when entering the trigger and passage area
    //NOTE: changing the collsion (on/off and flags) will be supported, but old state shold be kept to restore or have a way to restore it since this handles collsion not rendering
    //Note: could use the collsion mask as chunk id and cell bit, but treat undefined as 'any' since 0 in cell means no collsion. it a bit odd, but prevent using unessary slots
    //also could have this declare what undefinded mask would default to. 
    //the collsion object is a map where the key is a id base on chunk id and cell bit and the value is some collsion object that hold additoal data and functionality
    regions = new Map()

}

export class CollisionManager{

}
export default new CollisionManager();