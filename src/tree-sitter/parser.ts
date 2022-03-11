import { Dtsi } from 'src/devicetree/types';
import Parser, { Tree } from 'web-tree-sitter';

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

    async function createParser(languagePath: string) {
        await Parser.init();
        const parser = new Parser();
        const language = await Parser.Language.load(languagePath);
        parser.setLanguage(language)
        return parser
        
    }

    /**
     * Parses `.keymap` files.
     */
    export class KeymapParser {
        static async init(languagePath: string): Promise<KeymapParser> {
            const parser = await createParser(languagePath);
            return new KeymapParser(parser)
        }

        private constructor(private parser: Parser) { }
        
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

        getDtsi(tree: Tree): Dtsi {
            const dtsi: Dtsi = {
            keymap: {
                layers: []
            },
            combos: undefined
            }

            // console.log("getDtsi")
            // console.log(tree.rootNode.toString())
            const bindingsQuery = this.query(`(document (node [
                (node name: (identifier) @keymapOrCombo (#match? @keymapOrCombo "^keymap$") (node name: (identifier) @layer (property name: (identifier) @bindingOrSensor (#match? @bindingOrSensor "^bindings$") value: (integer_cells) @bindings)))
                (labeled_item item: (node name: (identifier) @keymapOrCombo (#match? @keymapOrCombo "^keymap$") (node name: (identifier) @layer (property name: (identifier) @bindingOrSensor (#match? @bindingOrSensor "^bindings$") value: (integer_cells) @bindings))))
            ]))`)
            if (bindingsQuery) {
            const bindingsTree = bindingsQuery.captures(tree.rootNode)
            // console.log(bindingsTree)
            const args = `[(identifier) (integer_literal) (call_expression)]`
            const either = `(reference label: (identifier)) @reference`
            const queryString = `[(${either}) (${either} . ${args} @arg1 . ${args}? @arg2)]`
            // console.log(queryString)
            const keycodesQuery = this.query(queryString)
            
            if (keycodesQuery) {
                let layerIndex = -1
                bindingsTree.forEach(capture => {
                // console.log(capture.name+": "+capture.node.text)
                switch (capture.name) {
                    case "layer":
                    layerIndex++
                    let layerName = capture.node.text
                    // console.log(layerName)
                    if (dtsi.keymap?.layers) {
                        dtsi.keymap.layers[layerIndex] = {
                        name: layerName,
                        bindings: []
                        }
                    }
                    case "bindings":
                    const keycodes = keycodesQuery.captures(capture.node)
                    // console.log(keycodes)
                    let keyIndex = 0
                    keycodes.forEach((keycode, index) => {
                        // console.log(`${index} ${keycode.name} ${keycode.node.text}`)
                        switch(keycode.name) {
                        case "reference":
                        // switch(keycode.node.text) {
                        // case "&kp":
                            let output = keycode.node.text
                            // console.log(keycodes[index+1])
                            if (keycodes[index+1]?.name == "arg1") {
                            // console.log(keycodes[index+1].node.text)
                            output += " "+keycodes[index+1].node.text
                            }
                            // console.log(keycodes[index+2])
                            if (keycodes[index+2]?.name == "arg2") {
                            // console.log(keycodes[index+2].node.text)
                            output += " "+keycodes[index+2].node.text
                            }
                            // console.log(output)
                            dtsi.keymap?.layers[layerIndex].bindings.push({index: keyIndex, output: output})
                        // case "&trans":

                        // case "&mo":
            
                        // case "&ext_power":
            
                        // case "&bt":
                        // }
                        keyIndex++
            
                        }
                    })
                    }
                })
            }
            }
            // console.log(dtsi.keymap)
            return dtsi
        
        }
    }