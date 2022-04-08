export function isWhiteSpace(ch: string): boolean {
    if (ch && (ch === " " || ch === "\t" || ch === "\r" || ch === "\n")) {
        return true;
    }
    return false;
}

interface LooseObject {
    [key: string]: string
}
const escapee: LooseObject = {
    "t": "\t",
    "\\": "\\",
    "n": "\n",
    "r": "\r",
    "b": "\b",
    "f": "\f",
    "&": "\&",
    "'": "\'",
    '"': "\"",
}
export function isEscapee(ch: string): boolean {
    return ch in escapee;
}

export function toEscapee(ch: string): string {
    if (isEscapee(ch)) {
        return escapee[ch]!;
    }
    return "";
}

export function isDangerCh(ch: string): boolean {
    return ch === "]" || ch === "," || ch === "}"
}