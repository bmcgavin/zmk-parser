//import { Buffer } from 'buffer';
import Parser from 'web-tree-sitter';
// import JavaScript from 'tree-sitter-javascript';

// import { grammarB64Rinh, grammarB64Mine, grammarB64JS, grammarB64JSFromnpmjspage, grammarB64MineFromOtherTreeSitter } from './grammar';
import { tree_sitter_devicetree } from './tree-sitter-devicetree.wasm';

// const GRAMMAR_FILE = `${__dirname}/../tree-sitter-devicetree.wasm`;
const WHITESPACE_RE = /\s/;

export class Document {
  public lineCount: number = 0;
  public text: string[] = [];

  public constructor(text: string) {
    this.text = text.split("\n")
    this.lineCount = this.text.length
  }

  lineAt(line: number): string {
    return this.text[line]
  }

  toString(): string {
    return this.text.join("\n")
  }
}

class Position {
  public line: number = 0;
  public character: number = 0;

  // with()

  public constructor(line: number, character: number) {
    this.line = line;
    this.character = character
  }
}

async function createParser() {
    await Parser.init();
    const parser = new Parser();
    //const grammar: string = Buffer.from(grammarB64MineFromOtherTreeSitter, 'base64').toString('binary')
    //const enc = new TextEncoder()
    //const genc = enc.encode(grammar)
    //const language = await Parser.Language.load(genc);
    // const language = parser.setLanguage("tree-sitter-mine.wasm")
    // const language = parser.setLanguage(JavaScript)
    console.log("HEEH")
    parser.setLanguage(tree_sitter_devicetree);

    return parser
    
    // parser.setLanguage(language);
    
}


/**
 * Parses `.keymap` files.
 */
export class KeymapParser {
    static async init(): Promise<KeymapParser> {
        const parser = await createParser();
        return new KeymapParser(parser)
    }

    // private _onDidChangeParse = new vscode.EventEmitter<ParseChangedEvent>();
    // public onDidChangeParse = this._onDidChangeParse.event;

    private trees: Record<string, Parser.Tree> = {};

    private constructor(private parser: Parser) {

    }

    /**
     * Returns an up-to-date parse tree for a document.
     */
    parse(document: Document): Parser.Tree {
        return this.trees[document.toString()] ?? this.openDocument(document);
    }

    /**
     * Builds a tree-sitter query for keymap files.
     */
    query(expression: string): Parser.Query {
        return this.parser.getLanguage().query(expression);
    }

    private getTree(document: string): Parser.Tree | undefined {
        return this.trees[document];
    }

    private setTree(document: Document, tree: Parser.Tree): Parser.Tree {
        this.trees[document.toString()] = tree;
        // this._onDidChangeParse.fire({ document });
        return tree;
    }

    private deleteTree(document: Document) {
        delete this.trees[document.toString()];
    }

    private getParserInput(document: Document): Parser.Input {
        return (index, startPosition) => {
            if (startPosition && startPosition.row < document.lineCount) {
                const line = document.lineAt(startPosition.row);
                return line.slice(startPosition.column);
            }

            return null;
        };
    }

    private openDocument(document: Document): Parser.Tree {
        return this.setTree(document, this.parser.parse(document.toString()));
    }

    // private updateTree(document: string) { //was an event
    //     const tree = this.getTree(document);
    //     if (!tree) {
    //         return;
    //     }

    //     for (const change of e.contentChanges) {
    //         const startIndex = change.rangeOffset;
    //         const oldEndIndex = change.rangeOffset + change.rangeLength;
    //         const newEndIndex = change.rangeOffset + change.text.length;
    //         const startPosition = asPoint(e.document.positionAt(startIndex));
    //         const oldEndPosition = asPoint(e.document.positionAt(oldEndIndex));
    //         const newEndPosition = asPoint(e.document.positionAt(newEndIndex));
    //         tree.edit({ startIndex, oldEndIndex, newEndIndex, startPosition, oldEndPosition, newEndPosition });
    //     }

    //     // TODO: figure out how to make this work to be more efficient.
    //     // const newTree = this.parser.parse(this.getParserInput(e.document), tree);
    //     const newTree = this.parser.parse(e.document.getText(), tree);
    //     this.setTree(e.document, newTree);
    // }
}

/**
 * Converts a vscode position to a tree-sitter point.
 */
export function asPoint(position: Position): Parser.Point {
    return { row: position.line, column: position.character };
}

/**
 * Converts a tree-sitter point to a vscode position.
 */
export function asPosition(point: Parser.Point): Position {
    return new Position(point.row, point.column);
}

/**
 * Returns whether two nodes are equal.
 * TODO: replace this with a.equals(b) once tree-sitter's equals() is fixed.
 */
export function nodesEqual(a: Parser.SyntaxNode, b: Parser.SyntaxNode): boolean {
    type NodeWithId = Parser.SyntaxNode & { id: number };

    return (a as NodeWithId).id === (b as NodeWithId).id;
}

/**
 * Returns whether `node` is a descendant of `other`.
 */
export function isDescendantOf(node: Parser.SyntaxNode, other: Parser.SyntaxNode): boolean {
    let current: Parser.SyntaxNode | null = node;

    while (current) {
        if (nodesEqual(current, other)) {
            return true;
        }

        current = current.parent;
    }

    return false;
}

/**
 * Finds a position inside the first non-whitespace token which is before the
 * given position.
 */
export function findPreviousToken(
    document: Document,
    position: Position
): Position | undefined {
    const line = document.lineAt(position.line);

    for (let i = position.character - 1; i >= 0; i--) {
        const char = line[i];

        if (char !== undefined && !WHITESPACE_RE.test(char)) {
            // return position.with({ character: i });
        }
    }

    return undefined;
}

/**
 * Gets the named descendant of `root` at a position.
 */
export function nodeAtPosition(root: Parser.SyntaxNode, position: Position): Parser.SyntaxNode {
    const point = asPoint(position);
    return root.namedDescendantForPosition(point);
}

/**
 * Returns the closest ancestor that has a given node type.
 */
export function getAncesorOfType(node: Parser.SyntaxNode | null, type: string): Parser.SyntaxNode | null {
    while (node && node.type !== type) {
        node = node.parent;
    }

    return node;
}

/**
 * Gets the start/end position of a node as a vscode range.
 */
// export function getNodeRange(node: Parser.SyntaxNode): vscode.Range {
//     return new vscode.Range(asPosition(node.startPosition), asPosition(node.endPosition));
// }

/**
 * Gets the name of the DeviceTree property which includes the given node,
 * or `undefined` if it is not part of a property.
 */
// export function getPropertyName(node: Parser.SyntaxNode): string | undefined {
//     const prop = getAncesorOfType(node, 'property');
//     return prop?.childForFieldName('name')?.text;
// }
