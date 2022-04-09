export interface Token {
    type: TokenType
    value: string | number | boolean | null
}

export enum TokenType {
    STRING = 1,
    NUMBER = 2,
    BOOLEAN = 4,
    NULL = 8,
    BEGIN_OBJECT = 16,
    END_OBJECT = 32,
    BEGIN_ARRAY = 64,
    END_ARRAY = 128,
    COMMA = 256,
    COLON = 512,
    KEY = 1024,
    END_DOCUMENT = 2048,
}

export type Value = string | number | boolean | null | Array<any> | Object

export interface LooseObject {
    [propname: string]: any
}