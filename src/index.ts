
import { MyJSON } from './MyJSON';

let test = new MyJSON();
test.parse(`{"a":123,"v":true}`);
test.stringify([1, 2, 3, { a: 123 }]);
