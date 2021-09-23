import React, { CSSProperties, Fragment } from 'react';
import { Binding } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { BindingComponent } from './BindingComponent';
import { Layout } from './KeymapComponent';

type LayerWithColumns = {
    onSelectedKeysChange:any,
    onOutputChange: any,
    selectedKeys: LayerKey[],
    layer: number,
    layout: Layout,
    name: string,
    bindings: Binding[]
}
export const LayerComponent: React.FC<LayerWithColumns> = ({
  onSelectedKeysChange, 
  onOutputChange, 
  selectedKeys,
  layer,
  layout,
  name,
  bindings
}: LayerWithColumns) => {
  
  const outputRaw = (keymap: String[][]): String => {
    return keymap.map((row) => {
      return "  "+row.join("\t")
    }).join("\n")
  }

  const widest = (layout: Layout): number => Math.max(...layout.columns)

  let w = widest(layout)
  
  let padded: Binding[] = []
  let empty: Binding = {
    index: -1,
    output: "",
  }
  let copy = bindings.slice()
  layout.columns.map((column, index) => {
    let row = copy.splice(0, column)
    if (w == column) {
      padded.push(...row)
    } else if (index == layout.rows-1) {
      let totalPad = w - column
      let sidePad = Math.ceil(totalPad / 2)
      padded.push(...Array<Binding>(sidePad).fill(empty))
      padded.push(...row)
      padded.push(...Array<Binding>(sidePad).fill(empty))
    } else {
      let totalPad = w - column
      let sideRow = Math.ceil(column / 2)
      padded.push(...row.splice(0, sideRow))
      padded.push(...Array<Binding>(totalPad).fill(empty))
      padded.push(...row)
    }
  })

  let raw: String[][] = []

  return (
  <div>
    <div className="layer">
      
        {padded.map(function(binding, index){

            const style: CSSProperties = {}
            selectedKeys.map(function(selectedKey){
              if (selectedKey.key == binding.index && selectedKey.layer == layer)
                style.backgroundColor = "red"
                
            })

            let colSum = 0
            let column = index + 1
            let row = 1

            let w = widest(layout)
            for (const i in layout.columns) {
              colSum += w
              if (index < colSum) {
                break
              }
              column -= w
              row++
            }

            
            style.gridColumn = column
            style.gridRow = row

            // console.log("binding")
            // console.log(binding)
            // console.log(style)
            if (binding.index == -1) {
              return <div style={style} key={"padding_"+index}></div>
            }
            if (raw[row] === undefined) {
              raw[row] = []
            }
            raw[row].push(binding.output)
            // console.log("returning BindingComponent")
            return <BindingComponent
              onSelectedKeysChange={onSelectedKeysChange}
              onOutputChange={onOutputChange}
              selectedKeys={selectedKeys}
              style={style}
              layer={layer}
              key={name+"_binding_"+index}
              index={binding.index}
              output={binding.output}/>
        })}
      </div>
      
      <textarea
        readOnly
        id="renderedKeymap"
        value={"bindings = <" + outputRaw(raw) + "\n>;"}/>
    </div>
  )
}