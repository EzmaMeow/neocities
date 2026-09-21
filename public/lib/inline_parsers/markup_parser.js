//might not include calc in the future (maybe)
import { calc } from './calc_parser.js'
const customTagNamespace = "mk"

//may have functions parse the value since it may be more complex than comma seprated basic values
export function textToArgs(value) {
    if (!value) { return [] }
    let args = value.split(",").map(item => {
        const trimmedItem = item.trim()
        if (trimmedItem === "true") return true;
        if (trimmedItem === "false") return false;
        if (/^null$/i.test(trimmedItem)) {
            return null;
        }
        if (/^undefined$/i.test(trimmedItem)) {
            return undefined;
        }
        if (!isNaN(trimmedItem) && trimmedItem !== "") {
            return Number(trimmedItem);
        }
        return trimmedItem
    });
    return args
}

export function htmlLink(value, closed) {
    if (closed) { return "</a>" }
    const args = textToArgs(value)
    const title = `${args[1] ? `title="${args[1]}"` : ""}`
    return `<a href="${args[0] || ""}" ${title} target="${args[2] || "_blank"}">`
}

export function htmlImage(value, closed) {
    if (closed) { return "</img>" }
    const args = textToArgs(value)
    const title = `${args[1] ? `title="${args[1]}"` : ""}`
    return `<img src="${args[0] || ""}" ${title} alt="${args[2] || "Image"}" ${Number(args[3]) ? `width=${Number(args[3])}` : ''} ${Number(args[4]) ? `height=${Number(args[4])}` : ''}">`
}

export const defaultAllowedTags = [
    "details", "summary", "b", "i", "u", "em", "strong", "mark", "small", "code", "blockquote", "table", "tr","th","td","ul","li","ol","dl","dt","dd"
];
export const defaultCustomTags = {
    "color": function (value) { return `style="color:${value || 'white'}"` },
    "hide": function (value) { return `hidden` },
    "spoiler": undefined, "tab":undefined,
    "center": undefined, "left": undefined, "right": undefined,
};
export const defaultVaribles = {
    'prev_result': '',
    'prev_rand': Math.random()
}
export const defaultFunctions = {
    "date_year": (state, value, closed) => !closed ? new Date().getFullYear() : '',
    "date_month": (state, value, closed) => !closed ? new Date().getMonth() + 1 : '',
    "date_day": (state, value, closed) => !closed ? new Date().getDate() : '',
    "date_hour": (state, value, closed) => !closed ? new Date().getHours() : '',
    "date_minute": (state, value, closed) => !closed ? new Date().getMinutes() : '',
    "date_second": (state, value, closed) => !closed ? new Date().getSeconds() : '',
    "random": (state, value, closed) => {
        if (closed) return ''
        state.varibles.set('prev_rand', Math.random())
        return state.varibles.get('prev_rand')
    },
    "calc": (state, value) => calc(value),
    "link": (state, value, closed) => htmlLink(value, closed),
    "image": (state, value, closed) => htmlImage(value, closed)
}
export const defaultUserVaribles = {
}

class MarkupParser {
    allowedTags = new Set(defaultAllowedTags);
    customTags = new Map(Object.entries(defaultCustomTags));
    varibles = new Map(Object.entries(defaultVaribles));
    functions = new Map(Object.entries(defaultFunctions));
    userVaribles = new Map(Object.entries(defaultUserVaribles));

    allowUserVaribles = true;
    limitToExistingUserVaribles = false;

    parseTags(full, id, value, closed) {
        if (this.allowedTags.has(id)) {
            return closed ? `</${id}>` : `<${id}>`;
        }
    }

    parseCustomTags(full, id, value, closed) {
        if (this.customTags.has(id)) {
            const tagName = `${customTagNamespace}-${id}`
            const fn = this.customTags.get(id)
            const parsedValue = this.parseInlineVaribles(value)
            const data = fn ? fn(parsedValue) : ''

            return closed ? `</${tagName}>` : `<${tagName} ${data}>`;
        }
    }

    parseVaribles(full, id, value, closed) {
        if (this.varibles.has(id) && !closed) {
            return this.varibles.get(id);
        }
    }

    parseUserVaribles(full, id, value, closed) {
        if ('%' && this.allowUserVaribles && !closed) {
            if (id.startsWith('%')) {
                if (typeof value !== 'undefined' && (!this.limitToExistingUserVaribles || this.userVaribles.has(id))) {
                    const parsedValue = this.parseInlineVaribles(value)
                    this.userVaribles.set(id, parsedValue)
                    return ''
                }
                return this.userVaribles.get(id)
            }
        }
    }

    parseInlineVaribles(text) {
        if (!text) {
            return text
        }
        return text.replace(/var:([^\s]+)/g, (full, id) => {
            let results = this.parseVaribles(full, id);
            if (typeof results !== 'undefined') { return results }
            results = this.parseUserVaribles(full, id)
            if (typeof results !== 'undefined') { return results }
            return full;
        });
    }

    parseFunctions(full, id, value, closed) {
        if (this.functions.has(id)) {
            const parsedValue = value ? this.parseInlineVaribles(value) : undefined
            const results = this.functions.get(id)(this, parsedValue, closed);
            this.varibles.set('prev_result', results)
            return results
        }
    }
    parseText(text) {
        let parsedText = text.replace(/(\\)?\[(\/)?([A-Za-z0-9_$%-]+)(?:=([^\]]+))?\]/g, (full, esc, closed, id, value) => {
            if (esc) {
                return full.slice(1)
            }
            let results = this.parseTags(full, id, value, closed)
            if (typeof results !== 'undefined') { return results }
            results = this.parseCustomTags(full, id, value, closed)
            if (typeof results !== 'undefined') { return results }
            results = this.parseVaribles(full, id, value, closed)
            if (typeof results !== 'undefined') { return results }
            results = this.parseUserVaribles(full, id, value, closed)
            if (typeof results !== 'undefined') { return results }
            results = this.parseFunctions(full, id, value, closed)
            if (typeof results !== 'undefined') { return results }
            return full
        });
        return parsedText
    }
}
export default new MarkupParser();
