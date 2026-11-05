// javascript-obfuscator settings for the .mcpb build.
//
// Constrained by one fact: the functions in src/looker/scripts*.ts are sent to
// the browser as source text (page.evaluate(fn) ships fn.toString()). Any
// transform that makes a function depend on something outside its own body
// breaks it in the page, silently, at run time. So:
//
//   stringArray: false       the string table is a module-level array; every
//                            function would reference it.
//   renameGlobals: false     top-level names are referenced by export.
//   selfDefending: false     it re-checks the code's own text and fights the
//                            reformatting that toString() round trips cause.
//   deadCodeInjection: false it silently forces stringArray back on.
//
// What remains is per-function: local renaming, control-flow flattening and
// number/key transforms. `node tools/check-page-scripts.mjs
// --obfuscate` proves these settings keep every page function self-contained.
//
// This is a deterrent against casual reading, not protection: anyone running
// the bundle can still observe what it does.
export const obfuscatorOptions = {
  target: 'node',
  compact: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  stringArray: false,
  selfDefending: false,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: false,
  numbersToExpressions: true,
  transformObjectKeys: true,
  simplify: true,
  splitStrings: false,
  unicodeEscapeSequence: false,
  sourceMap: false,
};
