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
        combos: []
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
        combos: []
      }
      
      expect(await parse(doc)).toStrictEqual(expected)
        
    
    })

    test('labelled keymap single layer single binding', async () => {
      const doc = new Document(`
/ { 
    keymap0: keymap {
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
        combos: []
      }
      
      expect(await parse(doc)).toStrictEqual(expected)
        
    
    })

    test('single combo', async () => {
      const doc = new Document(`
/ { 
  combos {
    compatible = "zmk,combos";
    combo_esc {
        timeout-ms = <50>;
        key-positions = <0 1>;
        bindings = <&kp ESC>;
    };
  };
};
      `)
      const expected: Dtsi = {
        keymap: {
          layers: []
        },
        combos: [
          {
            name: "combo_esc",
            timeout: 50,
            bindings: [
              {
              index: -1,
              output: "&kp ESC"
              }
            ],
            positions: [0, 1],
            layers: [],
            slowRelease: false
          }
        ]
      
      }
      
      expect(await parse(doc)).toStrictEqual(expected)
        
    
    })
  
    test('multiple combos', async () => {
      const doc = new Document(`
/ { 
  combos {
    compatible = "zmk,combos";
    combo_esc {
        timeout-ms = <50>;
        key-positions = <0 1>;
        bindings = <&kp ESC>;
    };
    combo_tab {
      timeout-ms = <50>;
      key-positions = <10 11>;
      bindings = <&kp TAB>;
    };
  };
};
      `)
      const expected: Dtsi = {
        keymap: {
          layers: []
        },
        combos: [
          {
            name: "combo_esc",
            timeout: 50,
            bindings: [
              {
              index: -1,
              output: "&kp ESC"
              }
            ],
            positions: [0, 1],
            layers: [],
            slowRelease: false
          },
          {
            name: "combo_tab",
            timeout: 50,
            bindings: [
              {
              index: -1,
              output: "&kp TAB"
              }
            ],
            positions: [10, 11],
            layers: [],
            slowRelease: false
          }
        ]
      
      }
      
      expect(await parse(doc)).toStrictEqual(expected)
        
    
    })
  })