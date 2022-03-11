import { KeymapParser, Document } from '../parser'

import { Dtsi } from '../../devicetree/types';

const parse = (doc: Document): Promise<Dtsi> => {
    const parser = KeymapParser.init('./dist/tree-sitter-devicetree.wasm')
    return parser.then(p => p.getDtsi(p.parse(doc)))
}

describe("KeymapParser", () => {
    test('empty document', async () => {
      const doc = new Document("")
      const expected: Dtsi = {
        keymap: {
          layers: []
        },
        combos: undefined
      }
      
      expect(await parse(doc)).toStrictEqual(expected)
        
    })

    test('single layer single binding', async () => {
      const doc = new Document(`
/ { 
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &trans
            >;
        };
    };
};
      `)
      const expected: Dtsi = {
        keymap: {
          layers: [
              {
                  name: "default_layer",
                  bindings: [
                      {
                          index: 0,
                          output: "&trans"
                      }
                  ]
              }
          ]
        },
        combos: undefined
      }
      
      expect(await parse(doc)).toStrictEqual(expected)
        
    
    })
  
  })