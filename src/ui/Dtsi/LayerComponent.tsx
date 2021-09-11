import React, { CSSProperties, Fragment } from 'react';
import { Binding } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { BindingComponent } from './BindingComponent';
import { Layout } from './KeymapComponent';



type LayerWithColumns = {
    onSelectedKeysChange:any,
    selectedKeys: LayerKey[],
    layerCount: number,
    layer: number,
    layout: Layout,
    name: string,
    bindings: Binding[]
}
export const LayerComponent: React.FC<LayerWithColumns> = ({onSelectedKeysChange, selectedKeys, layerCount, layer, layout, name, bindings}: LayerWithColumns) => {
    

  console.log("layout")
  console.log(layout)
    return (
    <div>
      <div>
        {name}
      </div>
      <div className="layer">
        
          {bindings.map(function(binding, index){

              console.log("index")
              console.log(index)
              const style: CSSProperties = {}
              selectedKeys.map(function(selectedKey){
                      if (selectedKey.key == index && selectedKey.layer == layer)
                        style.backgroundColor = "red"
                  
              })
              let colSum = 0
              let column = index + 1
              let row = 1

              for (const currentColumn of layout.columns) {
                colSum += currentColumn
                if (index < colSum) {
                    break
                }
                column -= currentColumn
                row++
              }
              
              style.gridColumn = column
              style.gridRow = row
              return <BindingComponent onSelectedKeysChange={onSelectedKeysChange} selectedKeys={selectedKeys} style={style} layer={layer} key={name+"_binding_"+binding.index} index={binding.index} output={binding.output}></BindingComponent>;
          })}
        </div>
      </div>
    )
}