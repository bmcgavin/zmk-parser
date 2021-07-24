import React, { CSSProperties, Fragment } from 'react';
import { Binding } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { BindingComponent } from './BindingComponent';
import { Layout } from './KeymapComponent';



type LayerWithColumns = {
    onSelectedKeysChange:any,
    selectedKeys: LayerKey[],
    layer: number,
    layout: Layout,
    name: string,
    bindings: Binding[]
}
export const LayerComponent: React.FC<LayerWithColumns> = ({onSelectedKeysChange, selectedKeys, layer, layout, name, bindings}: LayerWithColumns) => {
    
    return (
    <div>
      <div>
        {name}
      </div>
      <div className="layer">
          {bindings.map(function(binding, index){

              const style: CSSProperties = {}
              selectedKeys.map(function(selectedKey){
                  selectedKey.key.map(function(key){
                      if (key == index)
                        if (selectedKey.layer.length == 0 || selectedKey.layer.indexOf(layer) > -1)
                          style.backgroundColor = "red"
                  })
              })
              let colSum = 0
              let row = 1

              for (const column of layout.columns) {
                colSum += column
                if (index < colSum) {
                    break
                }
                row++
              }
              style.gridRow = row
              return <BindingComponent onSelectedKeysChange={onSelectedKeysChange} selectedKeys={selectedKeys} style={style} layer={layer} key={name+"_binding_"+binding.index} index={binding.index} output={binding.output}></BindingComponent>;
          })}
        </div>
      </div>
    )
}