var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/stack/index.ts
var Stack = class {
  #localVariables = [];
  #scopes = [];
  /**
   * Returns the recent scope of the local variables array
   */
  #getRecentScope() {
    const hasScopes = this.#scopes.length;
    return hasScopes ? this.#scopes[this.#scopes.length - 1] : this.#localVariables;
  }
  /**
   * Finds item inside the list or `needle in haystack`
   */
  #isInList(list, item) {
    return !!list.find((listItem) => listItem === item);
  }
  /**
   * Define a new custom scope
   */
  defineScope() {
    this.#scopes.push([]);
  }
  /**
   * Clear recently created scope
   */
  clearScope() {
    this.#scopes.pop();
  }
  /**
   * Define variable inside the stack.
   */
  defineVariable(variableName) {
    this.#getRecentScope().push(variableName);
  }
  /**
   * Returns a boolean telling if a variable is defined inside
   * the stack
   */
  has(variableName) {
    if (this.#isInList(this.#localVariables, variableName)) {
      return true;
    }
    return !!this.#scopes.find((scope) => this.#isInList(scope, variableName));
  }
  /**
   * Returns the state tree for the stack
   */
  getState() {
    return {
      localVariables: this.#localVariables,
      scopes: this.#scopes
    };
  }
  /**
   * Returns a flat list of defined variables
   */
  list() {
    return this.#scopes.flat().concat(this.#localVariables);
  }
};

// src/parser/main.ts
import { Tokenizer, MustacheTypes, TagTypes } from "edge-lexer";

// src/parser/stringify.ts
import { generate } from "astring";
function stringify(astExpression) {
  return generate(astExpression);
}

// src/parser/generate_ast.ts
import { EdgeError } from "edge-error";
import { parse as acornParse } from "acorn";
function patchLoc(loc, lexerLoc) {
  if (loc.start.line === 1) {
    loc.start.column = loc.start.column + lexerLoc.start.col;
  }
  loc.start.line = loc.start.line + lexerLoc.start.line - 1;
  loc.end.line = loc.end.line + lexerLoc.start.line - 1;
}
function generateAST(jsArg, lexerLoc, filename) {
  const acornOptions = {
    locations: true,
    ecmaVersion: 2020,
    allowAwaitOutsideFunction: true,
    onToken: (token) => patchLoc(token.loc, lexerLoc)
  };
  try {
    const ast = acornParse(jsArg, acornOptions);
    return ast["body"][0];
  } catch (error) {
    const line = error.loc.line + lexerLoc.start.line - 1;
    const col = error.loc.line === 1 ? error.loc.column + lexerLoc.start.col : error.loc.column;
    throw new EdgeError(error.message.replace(/\(\d+:\d+\)/, ""), "E_ACORN_ERROR", {
      line,
      col,
      filename
    });
  }
}

// src/parser/transform_ast.ts
import { EdgeError as EdgeError5 } from "edge-error";

// src/expressions/index.ts
var expressions_exports = {};
__export(expressions_exports, {
  ArrayExpression: () => array_expression_default,
  ArrowFunctionExpression: () => arrow_function_expression_default,
  AssignmentExpression: () => assignment_expression_default,
  AwaitExpression: () => await_expression_default,
  BinaryExpression: () => binary_expression_default,
  BlockStatement: () => block_statement_default,
  CallExpression: () => call_expression_default,
  ChainExpression: () => chain_expression_default,
  ConditionalExpression: () => conditional_expression_default,
  ExpressionStatement: () => expression_statement_default,
  FunctionDeclaration: () => function_declaration_default,
  Identifier: () => identifier_default,
  Literal: () => literal_default,
  LogicalExpression: () => logical_expression_default,
  MemberExpression: () => member_expression_default,
  NewExpression: () => new_expression_default,
  ObjectExpression: () => object_expression_default,
  ReturnStatement: () => return_statement_default,
  SequenceExpression: () => sequence_expression_default,
  SpreadElement: () => spread_element_default,
  TemplateLiteral: () => template_literal_default,
  ThisExpression: () => this_expression_default,
  UnaryExpression: () => unary_expression_default
});

// src/parser/expression_builder/member.ts
function makeMemberAccessor(propertyName, args) {
  return {
    type: "MemberExpression",
    object: {
      type: "Identifier",
      name: propertyName
    },
    computed: false,
    property: args
  };
}

// src/expressions/identifier.ts
var identifier_default = {
  toStatement(statement, _, parser) {
    if ((parser.options.localVariables || []).indexOf(statement.name) > -1 || parser.stack.has(statement.name) || global[statement.name] !== void 0) {
      return statement;
    }
    return makeMemberAccessor(parser.options.statePropertyName, statement);
  }
};

// src/expressions/member_expression.ts
var member_expression_default = {
  toStatement(statement, filename, parser) {
    statement.object = transformAst(statement.object, filename, parser);
    if (statement.property.type !== "Identifier") {
      statement.property = transformAst(statement.property, filename, parser);
    }
    return statement;
  }
};

// src/expressions/expression_statement.ts
var expression_statement_default = {
  toStatement(statement, filename, parser) {
    return transformAst(statement.expression, filename, parser);
  }
};

// src/expressions/call_expression.ts
var call_expression_default = {
  toStatement(statement, filename, parser) {
    statement.callee = transformAst(statement.callee, filename, parser);
    statement.arguments = statement.arguments.map(
      (node) => transformAst(node, filename, parser)
    );
    return statement;
  }
};

// src/expressions/arrow_function_expression.ts
import { EdgeError as EdgeError2 } from "edge-error";
var arrow_function_expression_default = {
  toStatement(statement, filename, parser) {
    parser.stack.defineScope();
    statement.params.forEach((param) => {
      if (param.type === "Identifier") {
        parser.stack.defineVariable(param.name);
      } else if (param.type === "ObjectPattern") {
        parser.utils.collectObjectExpressionProperties(param).forEach((prop) => {
          parser.stack.defineVariable(prop);
        });
      } else if (param.type === "ArrayPattern") {
        parser.utils.collectArrayExpressionProperties(param).forEach((prop) => {
          parser.stack.defineVariable(prop);
        });
      } else {
        const { line, col } = parser.utils.getExpressionLoc(param);
        throw new EdgeError2(
          `Report this error to the maintainers: Unexpected arrow function property type ${param.type}`,
          "E_PARSER_ERROR",
          {
            line,
            col,
            filename
          }
        );
      }
    });
    statement.body = transformAst(statement.body, filename, parser);
    parser.stack.clearScope();
    return statement;
  }
};

// src/expressions/literal.ts
var literal_default = {
  toStatement(statement) {
    return statement;
  }
};

// src/expressions/template_literal.ts
var template_literal_default = {
  toStatement(statement, filename, parser) {
    statement.expressions = statement.expressions.map((expression) => {
      return transformAst(expression, filename, parser);
    });
    return statement;
  }
};

// src/expressions/binary_expression.ts
var binary_expression_default = {
  toStatement(statement, filename, parser) {
    statement.left = transformAst(statement.left, filename, parser);
    statement.right = transformAst(statement.right, filename, parser);
    return statement;
  }
};

// src/expressions/array_expression.ts
var array_expression_default = {
  toStatement(statement, filename, parser) {
    statement.elements = statement.elements.map(
      (element) => transformAst(element, filename, parser)
    );
    return statement;
  }
};

// src/expressions/object_expression.ts
import { EdgeError as EdgeError3 } from "edge-error";
var object_expression_default = {
  toStatement(statement, filename, parser) {
    statement.properties = statement.properties.map((node) => {
      if (node.type === "Property") {
        node.shorthand = false;
        if (node.computed === true) {
          node.key = transformAst(node.key, filename, parser);
        }
        node.value = transformAst(node.value, filename, parser);
        return node;
      }
      if (node.type === "SpreadElement") {
        return transformAst(node, filename, parser);
      }
      const { line, col } = parser.utils.getExpressionLoc(node);
      throw new EdgeError3(
        `Report this error to the maintainers: Unexpected object property type "${node.type}"`,
        "E_PARSER_ERROR",
        {
          line,
          col,
          filename
        }
      );
    });
    return statement;
  }
};

// src/expressions/unary_expression.ts
var unary_expression_default = {
  toStatement(statement, filename, parser) {
    statement.argument = transformAst(statement.argument, filename, parser);
    return statement;
  }
};

// src/expressions/function_declaration.ts
var function_declaration_default = {
  toStatement(statement) {
    return statement;
  }
};

// src/expressions/conditional_expression.ts
var conditional_expression_default = {
  toStatement(statement, filename, parser) {
    statement.test = transformAst(statement.test, filename, parser);
    statement.consequent = transformAst(statement.consequent, filename, parser);
    statement.alternate = transformAst(statement.alternate, filename, parser);
    return statement;
  }
};

// src/expressions/logical_expression.ts
var logical_expression_default = {
  toStatement(statement, filename, parser) {
    statement.left = transformAst(statement.left, filename, parser);
    statement.right = transformAst(statement.right, filename, parser);
    return statement;
  }
};

// src/expressions/sequence_expression.ts
var sequence_expression_default = {
  toStatement(statement, filename, parser) {
    statement.expressions = statement.expressions.map((expression) => {
      return transformAst(expression, filename, parser);
    });
    return statement;
  }
};

// src/expressions/assignment_expression.ts
var assignment_expression_default = {
  toStatement(statement, filename, parser) {
    statement.left = transformAst(statement.left, filename, parser);
    statement.right = transformAst(statement.right, filename, parser);
    return statement;
  }
};

// src/expressions/await_expression.ts
import { EdgeError as EdgeError4 } from "edge-error";
var UNALLOWED_EXPRESSION_MESSAGE = "Make sure to render template in async mode before using await expression";
var await_expression_default = {
  toStatement(statement, filename, parser) {
    if (!parser.options.async) {
      const { line, col } = parser.utils.getExpressionLoc(statement);
      throw new EdgeError4(UNALLOWED_EXPRESSION_MESSAGE, "E_PARSER_ERROR", {
        line,
        col,
        filename
      });
    }
    statement.argument = transformAst(statement.argument, filename, parser);
    return statement;
  }
};

// src/expressions/new_expression.ts
var new_expression_default = {
  toStatement(statement, filename, parser) {
    statement.arguments = statement.arguments.map((expression) => {
      return transformAst(expression, filename, parser);
    });
    return statement;
  }
};

// src/expressions/block_statement.ts
var block_statement_default = {
  toStatement(statement, filename, parser) {
    statement.body = statement.body.map((token) => {
      return transformAst(token, filename, parser);
    });
    return statement;
  }
};

// src/expressions/return_statement.ts
var return_statement_default = {
  toStatement(statement, filename, parser) {
    statement.argument = transformAst(statement.argument, filename, parser);
    return statement;
  }
};

// src/expressions/this_expression.ts
var this_expression_default = {
  toStatement(statement) {
    return statement;
  }
};

// src/expressions/chain_expression.ts
var chain_expression_default = {
  toStatement(statement, filename, parser) {
    statement.expression = transformAst(statement.expression, filename, parser);
    return statement;
  }
};

// src/expressions/spread_element.ts
var spread_element_default = {
  toStatement(statement, filename, parser) {
    statement.argument = parser.utils.transformAst(statement.argument, filename, parser);
    return statement;
  }
};

// src/parser/transform_ast.ts
function transformAst(astExpression, filename, parser) {
  const Expression = expressions_exports[astExpression.type];
  if (Expression) {
    return Expression.toStatement(astExpression, filename, parser);
  }
  const { type, loc } = astExpression;
  throw new EdgeError5(`"${type}" is not supported`, "E_UNALLOWED_EXPRESSION", {
    line: loc.start.line,
    col: loc.start.column,
    filename
  });
}

// src/parser/expression_builder/callable.ts
function makeCallable(paths, args) {
  if (typeof paths === "string") {
    return {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: paths
      },
      arguments: args
    };
  }
  return {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: paths[0]
      },
      property: {
        type: "Identifier",
        name: paths[1]
      }
    },
    arguments: args
  };
}

// src/parser/collect_object_expression_properties.ts
function collectObjectExpressionProperties(expression) {
  return expression.properties.map((prop) => {
    if (prop.value.type !== "Identifier") {
      throw new Error("Object destructuring should not reference dynamic properties");
    }
    return prop.value.name;
  });
}
function collectArrayExpressionProperties(expression) {
  return expression.elements.map((prop) => {
    if (prop.type !== "Identifier") {
      throw new Error("Array destructuring should not reference dynamic properties");
    }
    return prop.name;
  });
}

// src/parser/main.ts
var Parser = class {
  constructor(tags, stack = new Stack(), options) {
    this.tags = tags;
    this.stack = stack;
    this.options = options;
    /**
     * Parser utilities work with the AST
     */
    this.utils = {
      stringify,
      transformAst,
      makeCallable,
      makeMemberAccessor,
      generateAST,
      makeEscapeCallable: makeCallable,
      makeStatePropertyAccessor: makeMemberAccessor,
      collectObjectExpressionProperties,
      collectArrayExpressionProperties,
      getExpressionLoc(expression) {
        const loc = expression.loc || expression.property?.loc;
        return {
          line: loc.start.line,
          col: loc.start.column
        };
      }
    };
    this.asyncMode = !!this.options.async;
  }
  /**
   * Returns the options to be passed to the tokenizer
   */
  #getTokenizerOptions(options) {
    if (!this.options) {
      return options;
    }
    return {
      claimTag: this.options.claimTag,
      onLine: this.options.onLine,
      filename: options.filename
    };
  }
  /**
   * Process escaped tag token by writing it as it is. However, the children
   * inside a tag are still processed.
   */
  #processEscapedTagToken(token, buffer) {
    const lines = `@${token.properties.name}(${token.properties.jsArg})`.split("\n");
    lines.forEach((line) => buffer.outputRaw(line));
    token.children.forEach((child) => this.processToken(child, buffer));
    buffer.outputRaw(`@end${token.properties.name}`);
  }
  /**
   * Process escaped muscahe block by writing it as it is.
   */
  #processEscapedMustache(token, buffer) {
    const lines = token.type === MustacheTypes.EMUSTACHE ? `{{${token.properties.jsArg}}}`.split("\n") : `{{{${token.properties.jsArg}}}}`.split("\n");
    lines.forEach((line) => buffer.outputRaw(line));
  }
  /**
   * Process mustache token
   */
  #processMustache({ properties, loc, filename, type }, buffer) {
    const node = transformAst(generateAST(properties.jsArg, loc, filename), filename, this);
    const expression = type === MustacheTypes.MUSTACHE ? makeCallable(this.options.escapeCallPath, [node]) : node;
    if (node.type === "TemplateLiteral") {
      buffer.outputExpression(stringify(expression), filename, loc.start.line, false);
    } else if (node.type === "FunctionDeclaration") {
      buffer.outputExpression(stringify(node), filename, loc.start.line, false);
    } else {
      buffer.outputExpression(stringify(expression), filename, loc.start.line, true);
    }
  }
  /**
   * Convert template to tokens
   */
  tokenize(template, options) {
    const tokenizer = new Tokenizer(template, this.tags, this.#getTokenizerOptions(options));
    tokenizer.parse();
    return tokenizer.tokens;
  }
  /**
   * Process a lexer token. The output gets written to the buffer
   */
  processToken(token, buffer) {
    switch (token.type) {
      case "raw":
        buffer.outputRaw(token.value);
        break;
      case "newline":
        buffer.outputRaw("\n");
        break;
      case TagTypes.TAG:
        if (typeof this.options.onTag === "function") {
          this.options.onTag(token);
        }
        this.tags[token.properties.name].compile(this, buffer, token);
        break;
      case TagTypes.ETAG:
        this.#processEscapedTagToken(token, buffer);
        break;
      case MustacheTypes.EMUSTACHE:
      case MustacheTypes.ESMUSTACHE:
        this.#processEscapedMustache(token, buffer);
        break;
      case MustacheTypes.SMUSTACHE:
      case MustacheTypes.MUSTACHE:
        if (typeof this.options.onMustache === "function") {
          this.options.onMustache(token);
        }
        this.#processMustache(token, buffer);
    }
  }
};

// src/edge_buffer/index.ts
import stringify2 from "js-stringify";
var EdgeBuffer = class _EdgeBuffer {
  #outputFileAndLineNumber = true;
  #outputOutVariable = true;
  #outputReturnStatement = true;
  #wrapInsideTryCatch = true;
  #options = {
    outputVar: "",
    rethrowCallPath: "",
    fileNameVar: "$filename",
    lineVar: "$lineNumber"
  };
  /**
   * Prefixes and suffix to wrap the final output
   */
  #prefix = [];
  #suffix = [];
  /**
   * Collected lines
   */
  #buffer = [];
  /**
   * Current runtime line number
   */
  #currentLineNumber = 1;
  /**
   * Input filename
   */
  #filename;
  /**
   * Current runtime filename
   */
  #currentFileName;
  /**
   * Cached compiled output. Once this value is set, the `flush`
   * method will become a noop
   */
  #compiledOutput;
  constructor(filename, options) {
    this.#filename = filename;
    this.#currentFileName = this.#filename;
    this.outputVariableName = options.outputVar;
    this.#options.outputVar = options.outputVar;
    this.#options.rethrowCallPath = Array.isArray(options.rethrowCallPath) ? options.rethrowCallPath.join(".") : options.rethrowCallPath;
  }
  /**
   * Creates a new buffer instance by merging the options from the existing one
   */
  create(filename, options) {
    return new _EdgeBuffer(filename, Object.assign({}, this.#options, options));
  }
  /**
   * Returns the size of buffer text
   */
  get size() {
    return this.#buffer.length;
  }
  /**
   * Setup template with initial set of lines
   */
  #setup(buffer) {
    this.#outputOutVariable && buffer.push(`let ${this.outputVariableName} = "";`);
    this.#outputFileAndLineNumber && buffer.push(`let ${this.#options.lineVar} = 1;`);
    this.#outputFileAndLineNumber && buffer.push(`let ${this.#options.fileNameVar} = ${stringify2(this.#filename)};`);
    this.#wrapInsideTryCatch && buffer.push("try {");
  }
  /**
   * Tear down template by writing final set of lines
   */
  #teardown(buffer) {
    if (this.#wrapInsideTryCatch) {
      buffer.push("} catch (error) {");
      buffer.push(
        `${this.#options.rethrowCallPath}(error, ${this.#options.fileNameVar}, ${this.#options.lineVar});`
      );
      buffer.push("}");
    }
    this.#outputReturnStatement && buffer.push(`return ${this.outputVariableName};`);
  }
  /**
   * Update the filename at runtime
   */
  #updateFileName(filename) {
    if (this.#currentFileName !== filename) {
      this.#currentFileName = filename;
      this.#buffer.push(`${this.#options.fileNameVar} = ${stringify2(filename)};`);
    }
  }
  /**
   * Update the line number at runtime
   */
  #updateLineNumber(lineNumber) {
    if (lineNumber > 0 && this.#currentLineNumber !== lineNumber) {
      this.#currentLineNumber = lineNumber;
      this.#buffer.push(`${this.#options.lineVar} = ${lineNumber};`);
    }
  }
  /**
   * Write raw text to the output variable
   */
  outputRaw(text) {
    this.#buffer.push(`${this.outputVariableName} += ${stringify2(text)};`);
    return this;
  }
  /**
   * Write JS expression to the output variable
   */
  outputExpression(text, filename, lineNumber, templateLiteral) {
    this.#updateFileName(filename);
    this.#updateLineNumber(lineNumber);
    text = templateLiteral ? `\`\${${text}}\`` : text;
    this.#buffer.push(`${this.outputVariableName} += ${text};`);
    return this;
  }
  /**
   * Write JS expression
   */
  writeExpression(text, filename, lineNumber) {
    this.#updateFileName(filename);
    this.#updateLineNumber(lineNumber);
    this.#buffer.push(`${text};`);
    return this;
  }
  /**
   * Write JS statement. Statements are not suffixed with a semi-colon. It
   * means, they can be used for writing `if/else` statements.
   */
  writeStatement(text, filename, lineNumber) {
    this.#updateFileName(filename);
    this.#updateLineNumber(lineNumber);
    this.#buffer.push(`${text}`);
    return this;
  }
  /**
   * Wrap template with a custom prefix and suffix
   */
  wrap(prefix, suffix) {
    this.#prefix.push(prefix);
    this.#suffix.push(suffix);
    return this;
  }
  /**
   * Disable instantiation of the file and the line number variables.
   */
  disableFileAndLineVariables() {
    this.#outputFileAndLineNumber = false;
    return this;
  }
  /**
   * Disable instantiation of the out variable.
   */
  disableOutVariable() {
    this.#outputOutVariable = false;
    return this;
  }
  /**
   * Disable outputting the return statement
   */
  disableReturnStatement() {
    this.#outputReturnStatement = false;
    return this;
  }
  /**
   * Disable wrapping buffer output inside try/catch.
   */
  disableTryCatchBlock() {
    this.#wrapInsideTryCatch = false;
    return this;
  }
  /**
   * Return template as a string
   */
  flush() {
    if (this.#compiledOutput !== void 0) {
      return this.#compiledOutput;
    }
    let buffer = [];
    this.#prefix.forEach((text) => text.split("\n").forEach((line) => buffer.push(`${line}`)));
    this.#setup(buffer);
    buffer = buffer.concat(this.#buffer);
    this.#teardown(buffer);
    this.#suffix.forEach((text) => text.split("\n").forEach((line) => buffer.push(`${line}`)));
    this.#compiledOutput = buffer.join("\n");
    return this.#compiledOutput;
  }
};

// index.ts
var expressions = Object.keys(expressions_exports).reduce((result, name) => {
  result[name] = name;
  return result;
}, {});
export {
  EdgeBuffer,
  Parser,
  Stack,
  expressions
};
//# sourceMappingURL=index.js.map