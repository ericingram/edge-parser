/**
 * Buffer class to construct template
 */
export declare class EdgeBuffer {
    #private;
    /**
     * Exposing output variable name
     */
    outputVariableName: string;
    constructor(filename: string, options: {
        outputVar: string;
        rethrowCallPath: string | [string, string];
    });
    /**
     * Creates a new buffer instance by merging the options from the existing one
     */
    create(filename: string, options: {
        outputVar?: string;
        rethrowCallPath?: string | [string, string];
    }): EdgeBuffer;
    /**
     * Returns the size of buffer text
     */
    get size(): number;
    /**
     * Write raw text to the output variable
     */
    outputRaw(text: string): this;
    /**
     * Write JS expression to the output variable
     */
    outputExpression(text: string, filename: string, lineNumber: number, templateLiteral: boolean): this;
    /**
     * Write JS expression
     */
    writeExpression(text: string, filename: string, lineNumber: number): this;
    /**
     * Write JS statement. Statements are not suffixed with a semi-colon. It
     * means, they can be used for writing `if/else` statements.
     */
    writeStatement(text: string, filename: string, lineNumber: number): this;
    /**
     * Wrap template with a custom prefix and suffix
     */
    wrap(prefix: string, suffix: string): this;
    /**
     * Disable instantiation of the file and the line number variables.
     */
    disableFileAndLineVariables(): this;
    /**
     * Disable instantiation of the out variable.
     */
    disableOutVariable(): this;
    /**
     * Disable outputting the return statement
     */
    disableReturnStatement(): this;
    /**
     * Disable wrapping buffer output inside try/catch.
     */
    disableTryCatchBlock(): this;
    /**
     * Return template as a string
     */
    flush(): string;
}
