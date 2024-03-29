/*
 * edge-parser
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Returns Acorn complaint AST for a member expression
 */
export function makeMemberAccessor(propertyName: string, args: object): any {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: propertyName,
    },
    computed: false,
    property: args,
  }
}
