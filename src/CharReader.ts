import { isWhiteSpace } from './tools';
export class CharReader {
    text: string
    position: number
    len: number
    constructor(text?: string) {
        this.text = text || "";
        this.position = 0;
        this.len = 0;
    }
    setText(text: string) {
        this.text = text;
        this.len = text.length;
    }
    peek(): string {
        if (!this.text) { return ""; }
        return this.text[this.position]!;
    }
    hasNext(): boolean {
        if (!this.text || this.position === this.len) { return false; }
        return true;
    }
    hasBack(): boolean {
        if (!this.text || this.position === 0) { return false; }
        return true;
    }
    peekNext(): string {
        if (this.hasNext()) return this.text[this.position + 1]!;
        else { throw new Error("字符串越界！") }
    }
    peekBack(): string {
        if (this.hasBack()) return this.text[this.position - 1]!;
        else { throw new Error("字符串越界！") }
    }
    next(): string {
        if (this.hasNext()) return this.text[this.position++]!;
        else { throw new Error("字符串越界！") }
    }
    back(): string {
        if (this.hasBack()) return this.text[this.position--]!;
        else { throw new Error("字符串越界！") }
    }
    clear(): void {
        this.text = "";
        this.position = 0;
        this.len = 0;
    }
    getText(): string {
        return this.text || "";
    }
    skipWhite(): void {
        if (!isWhiteSpace(this.peek())) { return; }
        while (this.hasNext() && isWhiteSpace(this.next())) { }
    }
    isEmpty(): boolean { return this.len === 0; }
}