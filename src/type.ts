export interface Token {
    type: TokenType
    value: string | number | boolean | null
}

export enum TokenType {
    STRING,
    NUMBER,
    BOOLEAN,
    NULL,
    BEGIN_OBJECT,
    END_OBJECT,
    BEGIN_ARRAY,
    END_ARRAY,
    COMMA,
    COLON,
    KEY,
    END_DOCUMENT,
}
