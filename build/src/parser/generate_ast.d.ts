import type { LexerLoc } from 'edge-lexer/types';
/**
 * Generates and returns the acorn AST for a given Javascript expression. Assuming
 * the Javascript expression is embedded into the edge lexer token, this method
 * expects you to pass the token loc and the filename.
 */
export declare function generateAST(jsArg: string, lexerLoc: LexerLoc, filename: string): any;
