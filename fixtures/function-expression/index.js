let out = "";
let $lineNumber = 1;
let $filename = "{{ __dirname }}index.edge";
try {
out += "\n";
out += function foo() {};
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;