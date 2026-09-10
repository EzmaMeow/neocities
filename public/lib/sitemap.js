export class Results {
    out = '';
    path = '';
    dirName = '';
    fileName = '';
    fullPath = '';
    target;
    update(target = this.target, path = this.path, dirName = this.dirName, fullPath = this.fullPath) {
        this.target = target
        this.path = path;
        this.fullPath = fullPath;
        this.dirName = dirName;
    }
}

export function createFileHtml(results) {
    results.out = (`
            ${results.out}
            <li><a href="${results.fullPath}" title="${results.fullPath}" class='file'>${results.fileName}</a></li>
        `)
    return results.out
}

export function createDirectoryHtml(results, end = false) {
    if (end) {
        results.out = `${results.out}</ul></details>`
        return results.out
    }
    results.out = `${results.out} <details class ='directory'><summary> ${results.dirName} </summary><ul>`
    return results.out
}

export class Sitemap {
    #map = {};
    get map() { return structuredClone(this.#map); }
    path = '/data/sitemap.json'
    getDir(path) {
        const pathSegments = path.split("/").filter(Boolean);
        if (Array.isArray(pathSegments) && pathSegments.length > 0) {
            let target = this.#map;
            for (let i = 0, len = pathSegments.length; i < len; i++) {
                const pathSegment = pathSegments[i];
                if (target[0] !== null && typeof target[0] === "object") {
                    if (target[0][pathSegment]) {
                        target = target[0][pathSegment]
                    }
                    else {
                        console.log('path dose not match map', ' ', path, ' ', this.map);
                        return null
                    }
                }
                else {
                    console.log('no dir in path', ' ', path, ' ', pathSegment);
                    return null
                }
            }
            return structuredClone(target);
        }
        return null
    }
    hasFile(path = '', file) {
        let dir = this.#map;
        if (path) {
            dir = this.getDir(path)
            if (!dir) { return false }
        }
        return dir.includes(file)
    }
    async load(path = this.path) {
        //TODO: handle non-json cases
        if (path.endsWith('.json')) {
            this.#map = await (await fetch(path)).json();
        }

    }

    /**
   * @virtual
   */
    createFileHtml = createFileHtml;
    /**
   * @virtual
   */
    createDirectoryHtml = createDirectoryHtml;

    dirArrayToHtml(results) {
        const path = results.path
        const fullPath = results.fullPath
        const dirName = results.dirName
        const target = results.target
        for (let i = 0; i < results.target.length; i++) {
            results.path = path;
            results.fullPath = fullPath;
            results.dirName = dirName;
            results.target = target
            if (results.target[i]) {
                if (Array.isArray(results.target[i])) {
                    results.target = results.target[i];
                    this.dirArrayToHtml(results)
                }
                else if (typeof results.target[i] === 'object') {
                    results.target = results.target[i];
                    this.dirObjToHtml(results)
                }
                else {
                    results.fileName = results.target[i];
                    results.fullPath = `${results.path}/${results.fileName}`;
                    this.createFileHtml(results)
                }
            }
        }
        return results
    }

    dirObjToHtml(results) {
        const path = results.path
        const target = results.target
        for (const [key, value] of Object.entries(target)) {
            results.dirName = key;
            results.target = value;
            results.path = `${path}/${key}`;
            results.fullPath = results.path;
            this.createDirectoryHtml(results)
            if (Array.isArray(results.target)) {
                this.dirArrayToHtml(results)
            }
            else if (typeof results.target === 'object') {
                this.dirObjToHtml(results)
            }
            this.createDirectoryHtml(results, true)
        }
        return results

    }

    createSitemapHtml(results = new Results()) {
        if (this.test) { this.test() }
        results.target = this.#map;
        if (Array.isArray(this.#map)) {
            this.dirArrayToHtml(results)
        }
        else {
            console.log('map is not an array')

            this.dirObjToHtml(results)
        }
        return results.out
    }
}

export default new Sitemap();