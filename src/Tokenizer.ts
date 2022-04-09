import { CharReader } from './CharReader';
import type { Token, Value } from './type';
import { TokenType, LooseObject } from './type';
import { isWhiteSpace, isDangerCh, isDigit, isDigitPunc } from "./tools"


export class Tokenizer {
    reader: CharReader
    TokenList: Array<Token>
    private position: number
    private len: number
    private constValueType: number
    constructor() {
        this.reader = new CharReader();
        this.TokenList = [];
        this.position = 0;
        this.len = 0;
        this.constValueType = TokenType.BOOLEAN | TokenType.STRING | TokenType.NULL | TokenType.NUMBER;
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
                if (isDigit(ch) || isDigitPunc(ch)) {
                    this.TokenList.push(this.readNumber());
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
                    if (this.TokenList.length >= 1) this.TokenList[this.TokenList.length - 1]!.type = TokenType.KEY;
                    this.TokenList.push({ type: TokenType.COLON, value: ":" });
                    this.reader.next();
                } else if (ch === ",") {
                    this.TokenList.push({ type: TokenType.COMMA, value: "," });
                    this.reader.next();
                } else {
                    throw new Error("词法错误！");
                }
            }
            this.len = this.TokenList.length;
            this.position = 0;
        } catch (err) {
            console.error(err);
        }
    }
    private readNumber(): Token {
        let str = "";
        while (this.reader.hasNext() && !isWhiteSpace(this.reader.peek()) && !isDangerCh(this.reader.peek())) {
            const ch = this.reader.peek();
            if (isDigit(ch) || isDigitPunc(ch)) {
                str += ch;
            } else {
                throw new Error("number词法错误")
            }
            this.reader.next();
        }
        let number = Number(str);
        if (typeof number !== "number") {
            throw new Error("number词法错误")
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
        this.reader.next();
        return token;
    }
    parse(text: string): Value | undefined {
        if (text.trim() === "") { return text; }
        this.tokenize(text);
        console.log(this.TokenList);
        try {
            let theToken = this.TokenList[this.position];
            if (theToken?.type === TokenType.NUMBER || theToken?.type === TokenType.STRING
                || theToken?.type === TokenType.NULL || theToken?.type === TokenType.BOOLEAN) {
                if (this.len === 1) { return theToken.value }
                else { throw new Error("常值解析错误!"); }
            } else if (theToken?.type === TokenType.BEGIN_ARRAY) {
                this.position++;
                return this.parseArray();
            } else if (theToken?.type === TokenType.BEGIN_OBJECT) {
                this.position++;
                return this.parseObject();
            } else {
                throw new Error("输入语法有误！");
            }
        } catch (err) {
            console.error(err);
        }
        return undefined;
    }
    private parseArray(): Array<any> {
        let result: Array<any> = [];
        let expectedType = this.constValueType | TokenType.END_ARRAY;
        let currentToken: Token;
        while (this.hasMore()) {
            currentToken = this.TokenList[this.position]!;
            switch (currentToken.type) {
                case TokenType.END_ARRAY:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        return result;
                    }
                    break;
                case TokenType.BEGIN_ARRAY:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        this.position++;
                        result.push(this.parseArray());
                        expectedType = this.constValueType | TokenType.END_ARRAY;
                    }
                    break;
                case TokenType.BEGIN_OBJECT:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        this.position++;
                        result.push(this.parseObject());
                        expectedType = TokenType.COMMA | TokenType.END_ARRAY;
                    }
                    break;
                case TokenType.NULL:
                case TokenType.STRING:
                case TokenType.NUMBER:
                case TokenType.BOOLEAN:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        result.push(currentToken.value);
                        expectedType = TokenType.COMMA | TokenType.END_ARRAY;
                    }
                    break;
                case TokenType.COMMA:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        expectedType = this.constValueType | TokenType.END_ARRAY | TokenType.BEGIN_OBJECT;
                    }
                    break;
                default:
                    throw new Error("语法错误！");
            }
            this.position++;
        }
        return result;
    }
    private parseObject(): object {
        let result: Map<string, any> = new Map();
        let expectedType = TokenType.KEY | TokenType.END_OBJECT;
        let currentToken: Token;
        let key: string = "";
        while (this.hasMore()) {
            currentToken = this.TokenList[this.position]!;
            switch (currentToken.type) {
                case TokenType.END_OBJECT:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        this.position++;
                        return this.map2object(result);
                    }
                    break;
                case TokenType.BEGIN_OBJECT:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        result.set(key, this.parseObject());
                        expectedType = TokenType.KEY | TokenType.END_OBJECT;
                    }
                    break;
                case TokenType.BEGIN_ARRAY:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        this.position++;
                        result.set(key, this.parseArray());
                        expectedType = TokenType.KEY | TokenType.END_OBJECT;
                    }
                    break;
                case TokenType.KEY:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        key = currentToken.value as string;
                        expectedType = TokenType.COLON;
                    }
                    break;
                case TokenType.COLON:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        expectedType = this.constValueType | TokenType.BEGIN_ARRAY | TokenType.BEGIN_OBJECT;
                    }
                    break;
                case TokenType.COMMA:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        expectedType = TokenType.KEY | TokenType.END_OBJECT;
                    }
                    break;
                case TokenType.NULL:
                case TokenType.STRING:
                case TokenType.NUMBER:
                case TokenType.BOOLEAN:
                    if (this.isExpected(currentToken.type, expectedType)) {
                        result.set(String(key), currentToken.value);
                        expectedType = TokenType.COMMA | TokenType.END_OBJECT;
                    }
                    break;
                default:
                    throw new Error("语法错误！");
            }
            this.position++;
        }
        return this.map2object(result);
    }
    private isExpected(currentType: number, expectedType: number): boolean {
        if ((currentType & expectedType) === 0) {
            throw new Error("语法错误！");
        }
        return true;
    }
    private hasMore(): boolean {
        return this.position < this.len;
    }
    private map2object(map: Map<string, any>): LooseObject {
        let obj: LooseObject = {};
        for (const [key, value] of map.entries()) {
            if (value instanceof Map) {
                obj[key] = this.map2object(value);
            } else {
                obj[key] = value;
            }
        }
        console.log("!!!", obj);
        return obj;
    }
}