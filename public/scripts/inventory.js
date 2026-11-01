
//TODO NOTE: split this into core and display where display depends on the stucture to read, but need to be given a vaild inventory ref
//inventory should holds various inventories as needed with an optional filter to filter out unnessary containers
//Note: current items have capture log data since the fish acts as a simple inventory but with log data as the meta instead of amount
//need to change display to also pull from such logs.
//the issue is fishes are meant to be advance items, but are this odd simple item so limits and such are not nessary
//in short I could work on the log and a log display instead of inventory and switch to advance when needed. could convert the log to items\
//also need a way to call these logs like statistics under items of subtype fish

export class Item {
    static icon_class = 'inv_item_icon';
    static text_class = 'inv_item_text';
    static header_class = 'inv_item_header';
    static body_class = 'inv_item_body';
    static footer_class = 'inv_item_footer';
    //note:name and amount is not nessary needed except for sorting reasons. so at least won't need setters and getters
    #name; get name() { return this.#name; }
    set name(value) {
        if (this.#name === value) { return }
        this.#name = value;
    }
    #amount; get amount() { return this.#amount; }
    set amount(value) {
        if (this.#amount === value) { return }
        this.#amount = value;
    }
    #iconSrc; get iconSrc() { return this.#iconSrc; }
    set iconSrc(value) {
        if (this.#iconSrc === value) { return }
        this.#iconSrc = value;
        this.header_icon.src = this.#iconSrc;
    }
    get hidden() { return this.element.hidden }
    set hidden(value) { this.element.hidden = value }
    updateText(text) {
        this.header_text.innerHTML = text;
    }
    updateInfo(text) {
        this.body.innerHTML = text;
    }
    onSelectionChanged(is_selected) {

    }
    headerClicked(event) {
        this.is_selected = !this.is_selected;
        this.body.hidden = !this.is_selected;
        this.footer.hidden = !this.is_selected;
        this.onSelectionChanged(this.is_selected);
    }
    createItemHeader() {
        //NOTE: may have short info to the right of name or part of text
        //such as weight/size and amount
        this.header = document.createElement('div');
        this.header.className = this.header_class || Item.header_class;
        this.header_icon = document.createElement('img');
        this.header_icon.className = this.icon_class || Item.icon_class;
        this.header_text = document.createElement('span');
        this.header_text.className = this.text_class || Item.text_class;
        this.header_icon.style = 'height:16px;'
        this.element.appendChild(this.header);
        this.header.appendChild(this.header_icon);
        this.header.appendChild(this.header_text);

        this.header.addEventListener("click", (event) => this.headerClicked(event));

        return this.header;
    }
    createItemBody() {
        this.body = document.createElement('div');
        this.body.className = this.body_class || Item.body_class;
        this.body.hidden = true;
        this.element.appendChild(this.body);
        return this.body;
    }
    createItemFooter() {
        this.footer = document.createElement('div');
        this.footer.className = this.footer_class || Item.footer_class;
        this.footer.hidden = true;
        this.element.appendChild(this.footer);
        return this.footer;
    }
    removeItemHeader() {
        this.header.removeEventListener("click", (event) => this.headerClicked(event));

        this.header.removeChild(this.header_icon);
        this.header.removeChild(this.header_text);
        this.element.removeChild(this.header);
        this.header_icon = null;
        this.header_text = null;
        this.header = null;
    }
    removeItemBody() {
        this.element.removeChild(this.body);
        this.body = null;
    }
    removeItemFooter() {
        this.element.removeChild(this.footer);
        this.footer = null;
    }
    deconstructor() {
        this.removeItemHeader();
        this.removeItemBody();
        this.removeItemFooter();
        this.element = null;
    }
    constructor() {
        this.element = document.createElement('div');
        this.createItemHeader();
        this.createItemBody();
        this.createItemFooter();
        this.element.hidden = true;
    }
}

export class Inventory {
    //NOTE: item actions may need to be treated as callbacks and the creator of the inventory need
    //to connect them to do anything and tell inventory to uopdate the changes afterwards
    load(data = {}) {
        //clear or add this property that hold an array format of the
        //pass inventory items as long as it exist and not null
        //NOTE: for the actual savable inventory data, any key base object should be ref by a asset path or id...or their paths should be grab when saving and replaced or
        this.inventoryData = [];
        //the idea is to load the inventory as an array of
        //items objects(not from the class nessary)
        //the objects should be read only(well action need a source to trigger though)
        //so it could read an active item state. they item might need
        //a proxy around it if it properties are diffrent than the item here
        //or a callable to act as an adapter
        //
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                if (!value || typeof value !== 'object') { continue }
                //this is used for the advance inventory where items are stored in slots
                //or some structure (grid base stuff of variation of sizes are not a focus here)
                //so the item data is the value
                this.inventoryData.push(value)

            }
        }
        else if (data instanceof Map) {
            for (const [key, value] of data) {
                if (!key || typeof key !== 'object') { continue }
                //key is the class or base object and the value is additional meta data
                //or just the amount. This is used for the simple inventory
                this.inventoryData.push([key, value])
            }
        }
        //note: need a share display info idealy from a asset. the key should be the fish item asset path or id which should be used to fetch it
        else if (typeof data === "object" && data) {
            for (const [key, value] of Object.entries(data)) {
                this.inventoryData.push([{name:key},value])
            }
        }
        //NOTE: the inventoryData should be treated as fixed
        //and sorted items or something be used for display

    }
    hasPreviousPage() {
        return this.page > 0;
    }
    hasNextPage() {
        return (this.page + 1) * this.max_items < this.inventoryData.length;
    }
    nextPage() {
        if (this.hasNextPage()) {
            this.page += 1;
            this.updateItems();
        }
    }
    previousPage() {
        if (this.hasPreviousPage()) {
            this.page -= 1;
            this.updateItems();
        }
    }
    //the item data may be in two formats. the array is a static item and a meta item
    //where the meta overrides the static item properties at times or just adds new ones
    //the non_array is a meta item that extends a static item or acts as a wrapper of the static item
    //so it should do all that override stuff when the propery is acess in itself
    //NOTE: can store this as a var before assigning the pacth so it can call the old logic
    getItemDataProperty(data, property, default_value) {
        if (Array.isArray(data)) {
            if (data[1][property]) {
                return data[1][property] !== undefined ? data[1][property] : default_value;
            }
            return data[0][property] !== undefined ? data[0][property] : default_value;
        }
        return data[property] !== undefined ? data[property] : default_value;

    }
    updateItem(item, item_data) {
        item.name = this.getItemDataProperty(item_data, 'name', 'no_name')
        item.amount = this.getItemDataProperty(item_data, 'amount', 0)
        item.iconSrc = this.getItemDataProperty(item_data, 'iconSrc', "/assets/anim_profile_pic.gif")
        //should call update text here as well and keep item simple
        //also means most if the display stuff can be overriden here
        if (item.amount !== 1) {
            item.updateText(`${item.name} (x${item.amount})`);
        }
        else {
            item.updateText(item.name);
        }
    }
    updateItems() {
        const page = this.page || 0;
        const page_start = page * this.max_items;
        for (let i = 0; i < this.max_items; i++) {
            const item = this.items[i]
            const page_position = page_start + i;
            //safty checks. last one needed if data segment smaller than page size
            if (page_position < 0) { continue; }
            if (page_position >= this.inventoryData.length) {
                item.hidden = true;
                continue;
            }
            item.hidden = false;
            const item_data = this.inventoryData[page_position]
            this.updateItem(item, item_data);
        }
    }
    removeItem(item, parent = this.element) {
        if (!item || !parent) {
            return
        }
        if (!parent.contains(item.element)) {
            console.log(parent, ' dose not have ', item, '. ignoring removal.')
            return
        }
        item.deconstructor();
        item = null;
    }
    createItem(parent = this.element) {
        if (!parent) {
            console.log(parent, ' is not vaild.')
            return
        }
        const item = new Item();
        parent.appendChild(item.element);
        this.items.push(item);
        return item
    }
    constructor(parent_id = 'inventory', max_items = 10) {
        const parent = document.getElementById(parent_id);
        this.max_items = max_items;
        this.page = 0;
        this.element = document.createElement('div');
        parent.appendChild(this.element);
        this.items = [];
        for (let i = 0; i < this.max_items; i++) {
            this.createItem();
        }
        console.log(this)
    }
}