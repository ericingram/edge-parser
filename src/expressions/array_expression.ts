/*
 * edge-parser
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Parser } from '../parser/main.js'
import { transformAst } from '../parser/transform_ast.js'

export default {
  toStatement(statement: any, filename: string, parser: Parser) {
    statement.elements = statement.elements.map((element: any) =>
      transformAst(element, filename, parser)
    )
    return statement
  },
}
