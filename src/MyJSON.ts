import type { Value } from './type';
import { Tokenizer } from './Tokenizer';
export class MyJSON {
    private tokenizer: Tokenizer
    constructor() {
        this.tokenizer = new Tokenizer();
    }
    stringify(val: Value): string {
        /**将JavaScript值转换成JSON对象 */
        if (typeof val === "boolean" || typeof val === "number"
            || typeof val === "string") {
            return val.toString();
        }
        if (val === null) {
            return "null";
        }
        if (Array.isArray(val)) {
            return this.stringifyArray(val);
        }
        if (typeof val === "object") {
            return this.stringifyObject(val);
        }
        else {
            throw new Error("该类型不能转换成JSON字符串！");
        }
    }
    parse(text: string): Value | undefined {
        return this.tokenizer.parse(text);
    }
    private stringifyObject(obj: Object): string {
        let result = "{";
        // stringify要更简单。类型很好判断，注意递归即可
        for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value)) {
                result += `"${String(key)}":${this.stringifyArray(value)},`;
            }
            else if (typeof value === "object") {
                result += `"${String(key)}":${this.stringifyObject(value)},`;
            }
            else if (typeof value === "boolean" || typeof value === "number"
                || value === null) {
                result += `"${String(key)}":${String(value)},`
            } else if (typeof value === "string") {
                result += `"${String(key)}":"${value}",`
            } else {
                throw new Error("该类型不能转换成JSON字符串！");
            }
        }
        result += "}";
        return result;
    }
    private stringifyArray(arr: Array<any>): string {
        let result = "[";
        for (const value of arr) {
            if (Array.isArray(value)) {
                result += `${this.stringifyArray(value)},`;
            }
            else if (typeof value === "object") {
                result += `${this.stringifyObject(value)},`;
            }
            else if (typeof value === "boolean" || typeof value === "number"
                || value === null) {
                result += `${String(value)},`
            } else if (typeof value === "string") {
                result += `"${value}",`
            } else {
                throw new Error("该类型不能转换成JSON字符串！");
            }
        }
        result += "]";
        return result;
    }
}