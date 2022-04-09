# TS-JSON-Handler
自己用typescript实现的一个JSON解析器和生成器。
将stringify和parse两个函数都放在了MyJSON类中

## stringify函数
可以将数组、对象、字符串、布尔、数字、null解析成合法的JSON格式字符串

## parse函数
可以将JSON合法字符串解析成JSON对象或数组，有着良好的报错提示

### parse函数原理
主要利用Tokenizer类
#### 首先进行词法解析：
使用CharReader类依次读取输入的JSON字符串，将字符串解析成一个个Token（判断特定的字符可知道Token的类型），将所有结果存到Tokenizer的tokenlist中
#### 然后进行语法解析：
使用parse函数，对tokenlist进行依次读取，根据当前的Token类型判断接下来预期的Token类型是什么，继续往下读需要判断当前的Token类型是否符合预期。可以判断JSON格式是否合法
遇到数组和对象类型要进行递归
