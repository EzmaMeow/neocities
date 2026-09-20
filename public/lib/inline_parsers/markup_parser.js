//might not include calc in the future (maybe)
import { calc } from './calc_parser.js'

//may have functions parse the value since it may be more complex than comma seprated basic values
export function textToArgs(value) {
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

export const defaultAllowedTags = [
    "details", "summary", "b", "i", "u", "em", "strong", "mark", "small"
];
export const defaultCustomTags = {
    "color": function (value) { return `style="color:${value || 'white'}"` },
    "spoiler": function (value) { return `` }
};
export const defaultVaribles = {
    'prev_result': '',
    'prev_rand': Math.random()
}
export const defaultFunctions = {
    "date_year": () => new Date().getFullYear(),
    "date_month": () => new Date().getMonth() + 1,
    "date_day": () => new Date().getDate(),
    "date_hour": () => new Date().getHours(),
    "date_minute": () => new Date().getMinutes(),
    "date_second": () => new Date().getSeconds(),
    "random": (state, value) => {
        state.varibles.set('prev_rand', Math.random())
        return state.varibles.get('prev_rand')
    },
    "calc": (state, value) => calc(value)
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
            const fn = this.customTags.get(id)
            const parsedValue = this.parseInlineVaribles(value)
            const data = fn ? fn(parsedValue) : ''
            return closed ? `</${id}>` : `<${id} ${data}>`;
        }
    }

    parseVaribles(full, id, value, closed) {
        if (this.varibles.has(id) && !closed) {
            console.log('var: ', id)
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
        if (this.functions.has(id) && !closed) {
            const parsedValue = value ? this.parseInlineVaribles(value) : undefined
            const results = this.functions.get(id)(this, parsedValue);
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
