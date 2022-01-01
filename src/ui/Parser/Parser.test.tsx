import ParserApp from './Parser'
import { Tree } from 'web-tree-sitter'
import { Document } from '../../tree-sitter'
import { Dtsi } from 'src/devicetree/types';


test('getDtsi', () => {
  const app = new ParserApp({})
  app.parser.then(p => {
    const emptyTree = p.parse(new Document(""))
    const emptyDtsi: Dtsi = {
      keymap: {
        layers: []
      },
      combos: undefined
    }
    expect(app.getDtsi(emptyTree)).toStrictEqual(emptyDtsi)
    
  })

})

