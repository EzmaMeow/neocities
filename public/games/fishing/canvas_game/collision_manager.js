//NOTE: may add multi collsion systems for expermention and to not have to waste  time with a 'solve all cases' solution that may end up being slower
//NOTE: this is in planing and will be worked on once there a system that needs it

//Note: true line casts might not be a thing. may be a shape cast and then check all collisions for the ones that collided on a line...unless i understand a better way
//since the goal to have a tile map based system, a cell base collsion manager may be used first for tiles with collsions then check enities. to solve shapes that do not 
//a full  tile size collsion, tile enities may be made. this is a second lookup if a collsion with a tile happens. it will look up if the same region, chunk, and cell id exists 
//in the tile enity conatiner and will use that object to check of there is a collsion. this be useful sonce that tile is still static and keeps them out of the enitity container
//which checks are generaly a filter loop to check what is near and then check if in bounds
//for the tile system, it may be regions(unlimit size, but only a few loaded at a time), chunks(fixed sized base on)

//Note: maze game have a cell base nav system that mess with bitflags. this is less complex, but should help not make the same mistakes when messing with grids and flags
//NOTE: Should try to design chunk to also be used with the rendering part. issue is nameing collsions since it could also be visablity instead
//visbilty masks are currently not used, but masks can reprents that. render objects instead of collsion objects for what gets render
//issues is render objects can only have one cell ref it as the draw point. more than one ref means it will be drawn more than once (this is fine, but a diffrent in design)
//ideally having the tile and cell system as a collsion/render object would be better and keep this slim as long as it can function correctly
//the only issue is rendering dose not need to bitfeild for visiblty and object should have masks when added. so rendering would be an array of rendering objects base on the cell local position
export class TileChunk{
    //32 uint32 representing the rows where each uint32 is a bitflag of if there a collion at that cell or not
    //meant to be a quick way to get collsion coords
    //note: this also mean less loops since bit math can be done on each row, but require more inderstand of the collsion lookup math to design
    collsions = new Uint32Array(32)
    //full array of the collsion masks appled to the row
    //this is for confirm checks to see if the collsion applies to them
    //this is only for the tile and not the tile collsion object(if any)
    masks = new Uint32Array(32*32)
    //below may be better as an array,but could be a map(map cheaper if near empty, but get quite expensive when half full or more). 
    objects = new Array(32*32)
    //NOTE: the two reasons for this system is to simplify collsion filtering and not needing a collsion object for the default collsion profile
    //so any full tile collsion can be assign without needing an object for the collsion mask diffrences. multi tile cases could cause issues though
    //but such cases should not happen without tile collsion object (one standard tile per tile) and when it dose, the milti tiles should be handled as a single tile
    //with the handler caculating what masks are used
    //NOTE: could use bitset in c++ for the collsion array if there ever a need to have this more performat
}

export class TileCollsion {
    //regions are coord keys of a region object that contains chunks, collsion masks, and collsion objects. may using string for easy look up without being limited in amount, but could allow the id function to be change
    //chunks are Uint32Array() with a fix length base on the region area
    //the collsion mask may need to hold the chunks or have an id look up base on chunk id and cell bit
    //Note: could use the filter to open sides at the cost of 4-6(up/down) flags, though may be better not to do that and use neigboring cells as wall and use a mask for secret movement that get toggled when entering the trigger and passage area
    //NOTE: changing the collsion (on/off and flags) will be supported, but old state shold be kept to restore or have a way to restore it since this handles collsion not rendering
    //Note: could use the collsion mask as chunk id and cell bit, but treat undefined as 'any' since 0 in cell means no collsion. it a bit odd, but prevent using unessary slots
    //also could have this declare what undefinded mask would default to. 
    //the collsion object is a map where the key is a id base on chunk id and cell bit and the value is some collsion object that hold additoal data and functionality

    //NOTE: may not do region of chunk of cells since can hold 32 cells in a row withuint32 and reserve 32 index in the array for each axis
    //the design be diffrent since now chunk with be an object instead of a unit32array that contain arrays and defaults
    //below is an key system for 1024x1024x1024 cells. would need to change it for 32x32x32 (31)
    //key = 23 | (10 << 10) | (123 << 20); //x,y,z
    //const x = key & 1023;
    //const y = (key >>> 10) & 1023;
    //const z = (key >>> 20) & 1023;

    //Note: the chunk might as a well extend collsion object. it might be able to be added to collsion object itself and the tile collsion not really be needed once the tilemap
    //is made to manage all tile chunks. maybe a render chunk be handle that way too, but less extra features and probably to make managing them similar and chunking the rendering
    //logic on changes on the tile map
    chunks = new Map()

}

export class CollisionManager{

}
export default new CollisionManager();