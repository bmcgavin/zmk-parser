    import Parser from 'web-tree-sitter';

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

    async function createParser() {
        await Parser.init();
        const parser = new Parser();
        const language = await Parser.Language.load('./tree-sitter-devicetree.wasm');
        parser.setLanguage(language)
        return parser
        
    }

    /**
     * Parses `.keymap` files.
     */
    export class KeymapParser {
        static async init(): Promise<KeymapParser> {
            const parser = await createParser();
            return new KeymapParser(parser)
        }

        private constructor(private parser: Parser) { }

        getLanguage(): Parser.Language {
            return this.parser.getLanguage()
        }
        

        /**
         * Returns an up-to-date parse tree for a document.
         */
        parse(document: Document): Parser.Tree {
            // console.log(this.parser.parse(document.toString()).rootNode.toString())
            return this.parser.parse(document.toString());
        }

        /**
         * Builds a tree-sitter query for keymap files.
         */
        query(expression: string): Parser.Query {
            return this.parser.getLanguage().query(expression);
        }

    }