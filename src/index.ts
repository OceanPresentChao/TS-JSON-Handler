import { Tokenizer } from './Tokenizer';

let test = new Tokenizer();

test.tokenize('{"a" :  -1e-2, "b":[123,"oc ean" ]  }');

console.log(test.TokenList);
