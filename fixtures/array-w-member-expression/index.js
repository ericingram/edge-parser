let out = "";
let $lineNumber = 1;
let $filename = "{{ __dirname }}index.edge";
try {
out += "The even numbers are ";
out += `${ctx.escape([state.num1, state.num2, state.num3][state.fns.filter](num => num % 2 === 0))}`;
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;