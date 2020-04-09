import { parse, types, print } from "recast";

export const TILES = {
  HOP: "HOP",
  SILO: "SILO",
  GRASS: "GRASS"
};
export const DIRECTIONS = {
  RIGHT: "RIGHT",
  LEFT: "LEFT",
  UP: "UP",
  DOWN: "DOWN"
};

const IfCondition = ({ left, right }) => subBlocks => {
  const ifBlock = parse(`if(${left} === ${right}){}`).program.body[0];
  return {
    ...ifBlock,
    consequent: { ...ifBlock.consequent, body: [].concat(subBlocks) }
  };
};

const labelBlockWithBreak = parse("MAIN:{break MAIN;}").program.body[0];
console.log(labelBlockWithBreak);

const labelBlock = ({ labelName, subBlocks }) => {
  const labelBlock = parse(`${labelName}:{}`).program.body[0];
  return {
    ...labelBlock,
    body: { ...labelBlock.body, body: [].concat(subBlocks) }
  };
};

const BLOCKS_TO_AST = {
  REAP: parse("reapInContext();").program.body[0],
  DEPOSIT: parse("break MAIN;").program.body[0],
  MOVE_RIGHT: parse(`moveInContext(${DIRECTIONS.RIGHT});`).program.body[0],
  WHILE_TRUE: subBlocks => {
    const whileBlock = parse("while(true){}").program.body[0];
    return {
      ...whileBlock,
      body: { ...whileBlock.body, body: [].concat(subBlocks) }
    };
  },
  LABEL_WHILE_BLOCK: ({ labelName, subBlocks }) => {
    const labelWhileBlock = parse(`${labelName}: while(true){}`).program
      .body[0];
    return {
      ...labelWhileBlock,
      body: {
        ...labelWhileBlock.body,
        body: {
          ...labelWhileBlock.body.body,
          body: [].concat(subBlocks).concat(parse("break;").program.body[0])
        }
      }
    };
  },
  LABEL_BREAK: labelName => parse(`break ${labelName};`),
  LABEL_CONTINUE: labelName => parse(`continue ${labelName};`),
  LABEL_BLOCK_MAIN: subBlocks => labelBlock({ labelName: "MAIN", subBlocks }),
  IF_TILE_EQUALS_SILO: IfCondition({ left: "tile", right: "SILO" }),
  IF_TILE_EQUALS_HOP: IfCondition({ left: "tile", right: "HOP" })
};

export const move = direction => ({ currentColumn, currentLine, field }) => {
  const fieldLines = field.length;
  const fieldColumns = Math.max(...field.map(line => line.length));
  switch (direction) {
    case DIRECTIONS.UP:
      return currentLine - 1 < 0
        ? { currentColumn, currentLine }
        : { currentColumn, currentLine: currentLine - 1 };
    case DIRECTIONS.RIGHT:
      return currentColumn + 1 === fieldColumns
        ? { currentColumn, currentLine }
        : { currentColumn: currentColumn + 1, currentLine };
    case DIRECTIONS.DOWN:
      return currentLine + 1 === fieldLines
        ? { currentColumn, currentLine }
        : { currentColumn, currentLine: currentLine + 1 };
    case DIRECTIONS.LEFT:
      return currentColumn - 1 < 0
        ? { currentColumn, currentLine }
        : { currentColumn: currentColumn - 1, currentLine };
    default:
      return { currentColumn, currentLine };
  }
};

export const reap = ({ currentColumn, currentLine, currentField, stock }) => {
  const newField = { ...currentField };
  newField[currentLine][currentColumn] = TILES.GRASS;
  return {
    stock:
      currentField[currentLine][currentColumn] === TILES.HOP
        ? stock.concat(TILES.HOP)
        : stock,
    currentField: newField
  };
};

const evalWithContext = ({ code, field }) => {
  let stock = [];
  let currentField = { ...field };
  let currentLine = 0;
  let currentColumn = 0;

  const moveInContext = direction => {
    const newPositions = move(direction)({
      currentColumn,
      currentLine,
      field
    });
    currentLine = newPositions.currentLine;
    currentColumn = newPositions.currentColumn;
  };

  const reapInContext = () => {
    const newFieldAndStock = reap({
      currentColumn,
      currentLine,
      currentField,
      stock
    });
    stock = [...newFieldAndStock.stock];
    currentField = { ...newFieldAndStock.currentField };
  };

  eval(code);
};

const code = [
  "Jump1End:",
  "if(tile === 'HOP') {",
  "  reap();",
  "}",
  "if(tile === 'SILO') {",
  "  deposit();",
  "}",
  "moveRight();",
  "Jump1Start:"
].join("\n");

// Parse the code using an interface similar to require("esprima").parse.
// console.log(reapFunction)
// console.log(depositFunction)
// console.log(moveRightFunction)
// console.log(BLOCKS_TO_AST.WHILE_TRUE)
// console.log(ifCondition({left: "HOP", right: "HOP"}));

// const code = [
//   "while(true) {",
//   "  reap();",
//   "  while(true) {",
//   "    moveRight();",
//   "  }",
//   "}"
// ].join("\n");
// evalWithContext(code);

// console.log(code)
// const example = parse(code);
// console.log({example})

const prepareLabels = blocks => ({ LABEL_BLOCK_MAIN: [...blocks] });

const resolveBlock = block => {
  if (typeof block === "string") return BLOCKS_TO_AST[block];
  if (Array.isArray(block))
    return block.reduce(
      (acc, subBlock) => acc.concat(resolveBlock(subBlock)),
      []
    );
  if (typeof block === "object")
    return BLOCKS_TO_AST[Object.keys(block)[0]](
      resolveBlock(Object.values(block)[0])
    );
  console.log("UNKNOWN TYPE OF BLOCK", typeof block);
};

const exampleFromTheGame = [
  { IF_TILE_EQUALS_HOP: "REAP" },
  { IF_TILE_EQUALS_SILO: "DEPOSIT" },
  "MOVE_RIGHT"
];
// const codeWithLabels = prepareLabels(exampleFromTheGame);
// console.log({ codeWithLabels });
const program = parse("");
program.program.body = resolveBlock(exampleFromTheGame);

console.log(program);
console.log(print(program).code);

evalWithContext({
  code: print(program).code,
  field: [[TILES.HOP, TILES.HOP, TILES.SILO]]
});

export default BLOCKS_TO_AST;
