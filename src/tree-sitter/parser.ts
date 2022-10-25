import { Dtsi, Keymap, Combo } from 'src/devicetree/types';
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
                combos: []
            }

            dtsi.keymap = this.getKeymap(tree)
            dtsi.combos = this.getCombos(tree)
            return dtsi
        }

        getCombos(tree: Tree): Combo[] {
            // console.log("tree.rootNode.toString()")
            // console.log(tree.rootNode.toString())

            let combos: Combo[] = []
            const comboQuery = this.query(`(document (node 
                (node name: (identifier) @keymapOrCombo (#match? @keymapOrCombo "^combos$") (node name: (identifier) @combo (property name: (identifier) @propertyName value: (integer_cells) @propertyValue)* @property))))`)
            if (comboQuery) {
                const combosTree = comboQuery.captures(tree.rootNode)
                // console.log("combosTree")
                // console.log(combosTree)
                if (combosTree.length > 0) {
                    let combo: Combo = {
                        name: "",
                        timeout: -1,
                        bindings: [],
                        positions: [],
                        layers: [],
                        slowRelease: false
                    }
                    combosTree.forEach((capture, index) => {
                        // console.log("capture.name")
                        // console.log(capture.name)
                        switch (capture.name) {
                            case "combo":
                                if (combo.name != "") {
                                    combos.push(combo)
                                    combo = {
                                        name: "",
                                        timeout: -1,
                                        bindings: [],
                                        positions: [],
                                        layers: [],
                                        slowRelease: false
                                    }
                                }
                                combo.name = capture.node.text
                                break
                            case "propertyName":
                                switch(capture.node.text) {
                                    case "bindings":
                                        const cleanBindings = combosTree[index+1].node.text.replace(/<|>/g, "")
                                        combo.bindings.push({index: -1, output: cleanBindings})
                                        break
                                    case "key-positions":
                                        const cleanKeyPositions = combosTree[index+1].node.text.replace(/<|>/g, "")
                                        cleanKeyPositions.split(" ").forEach(pos => {
                                            // console.log("pos")
                                            // console.log(pos)
                                            combo.positions.push(Number(pos))
                                        })

                                        break
                                    case "timeout-ms":
                                        combo.timeout = Number(combosTree[index+1].node.text.replace(/<|>/g, ""))


                                
                                }
                                break
                            default:
                                // console.log("capture.node.text")
                                // console.log(capture.node.text)
                                
                                
                        }
                    })

                    // console.log("combo")
                    // console.log(combo)
                    combos.push(combo)
                }
            }
            return combos
        }

        getKeymap(tree:Tree): Keymap {

            let keymap: Keymap = {
                layers: []
            }

            // console.log("getKeymap")
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

                        keymap.layers[layerIndex] = {
                            name: layerName,
                            bindings: []
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
                                keymap.layers[layerIndex].bindings.push({index: keyIndex, output: output})
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
            return keymap
        
        }
    }