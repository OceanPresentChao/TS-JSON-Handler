import { CharReader } from './CharReader';
import type { Token } from './type';
import { TokenType } from './type';
import { isWhiteSpace, isDangerCh } from "./tools"


export class Tokenizer {
    reader: CharReader
    TokenList: Array<Token>
    constructor() {
        this.reader = new CharReader();
        this.TokenList = [];
    }
    setText(text: string): void {
        this.reader.clear();
        this.reader.setText(text);
    }
    tokenize(text?: string) {
        if (text) { this.reader.setText(text); }
        if (this.reader.isEmpty()) { throw new Error("还没有设置text"); }
        try {
            while (this.reader.hasNext()) {
                this.reader.skipWhite();
                const ch = this.reader.peek();
                if (/^[0-9]$/.test(ch)) {
                    this.TokenList.push(this.readNumber());
                    console.log(this.TokenList);
                } else if (ch === "t" || ch === "f") {
                    this.TokenList.push(this.readBoolean());
                } else if (ch === '"') {
                    this.TokenList.push(this.readString());
                } else if (ch === "n") {
                    this.TokenList.push(this.readNull());
                } else if (ch === "[") {
                    this.TokenList.push({ type: TokenType.BEGIN_ARRAY, value: "[" });
                    this.reader.next();
                } else if (ch === "]") {
                    this.TokenList.push({ type: TokenType.END_ARRAY, value: "]" });
                    this.reader.next();
                } else if (ch === "{") {
                    this.TokenList.push({ type: TokenType.BEGIN_OBJECT, value: "{" });
                    this.reader.next();
                } else if (ch === "}") {
                    this.TokenList.push({ type: TokenType.END_OBJECT, value: "}" });
                    this.reader.next();
                } else if (ch === ":") {
                    this.TokenList.push({ type: TokenType.COLON, value: ":" });
                    this.reader.next();
                } else if (ch === ",") {
                    this.TokenList.push({ type: TokenType.COMMA, value: "," });
                    this.reader.next();
                } else {
                    throw new Error("词法错误！");
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
    private readNumber(): Token {
        let number = 0;
        while (this.reader.hasNext() && !isWhiteSpace(this.reader.peek()) && !isDangerCh(this.reader.peek())) {
            const ch = this.reader.peek();
            if (/^[0-9]$/.test(ch)) {
                number = number * 10 as number + Number(ch);
            } else {
                throw new Error("number词法错误")
            }
            this.reader.next();
        }
        const token: Token = { type: TokenType.NUMBER, value: number };
        return token;
    }
    private readNull(): Token {
        if (this.reader.len - this.reader.position < 3) {
            throw new Error("null词法错误");
        }
        if (this.reader.next() === "n" && this.reader.next() === "u"
            && this.reader.next() === "l" && this.reader.next() === "l") {
            const token = { type: TokenType.NULL, value: null }
            return token;
        }
        else {
            throw new Error("null词法错误");
        }
    }
    private readBoolean(): Token {
        if (this.reader.peek() === "t") {
            if (this.reader.len - this.reader.position < 3) {
                throw new Error("true词法错误");
            }
            if (this.reader.next() === "t" && this.reader.next() === "r"
                && this.reader.next() === "u" && this.reader.next() === "e") {
                const token = { type: TokenType.BOOLEAN, value: true }
                return token;
            }
            else {
                throw new Error("true词法错误");
            }
        } else {
            if (this.reader.len - this.reader.position < 4) {
                throw new Error("false词法错误");
            }
            if (this.reader.next() === "f" && this.reader.next() === "a"
                && this.reader.next() === "l" && this.reader.next() === "s" && this.reader.next() === "e") {
                const token = { type: TokenType.BOOLEAN, value: false }
                return token;
            }
            else {
                throw new Error("false词法错误");
            }
        }
    }
    private readString(): Token {
        let text = "";
        this.reader.next();
        while (this.reader.hasNext() && this.reader.peek() !== '"') {
            const ch = this.reader.peek();
            text += ch;
            this.reader.next();
        }
        const token: Token = { type: TokenType.STRING, value: text };
        return token;
    }
}