/*
 * edge-parser
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { transformAst } from '../parser/transform_ast.js'
import { Parser } from '../parser/main.js'

export default {
  toStatement(statement: any, filename: string, parser: Parser) {
    statement.callee = transformAst(statement.callee, filename, parser)
    statement.arguments = statement.arguments.map((node: any) =>
      transformAst(node, filename, parser)
    )
    return statement
  },
}
