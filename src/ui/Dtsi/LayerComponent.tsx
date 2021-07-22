import React, { CSSProperties } from 'react';
import { Binding } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { BindingComponent } from './BindingComponent';

type LayerWithColumns = {
    onSelectedKeysChange:any,
    selectedKeys: LayerKey[],
    layer: number,
    columns: number,
    name: string,
    bindings: Binding[]
}
export const LayerComponent: React.FC<LayerWithColumns> = ({onSelectedKeysChange, selectedKeys, layer, columns, name, bindings}: LayerWithColumns) => {
    
    return (
    <div>
      <div>
        {name}
      </div>
      <div>
        {bindings.map(function(binding, index){

            let style: CSSProperties = {
                border: "2px solid"
            }
            if (index % columns == 0) {
                style.border = "5px solid"
            }
            console.log(selectedKeys)
            selectedKeys.map(function(selectedKey){
                selectedKey.key.map(function(key){
                    if (key == index)
                      if (selectedKey.layer.length == 0 || selectedKey.layer.indexOf(layer) > -1)
                        style.backgroundColor = "red"
                })
            })

            return <BindingComponent onSelectedKeysChange={onSelectedKeysChange} selectedKeys={selectedKeys} style={style} layer={layer} key={name+"_binding_"+binding.index} index={binding.index} output={binding.output}></BindingComponent>;
        })}
        </div>
      </div>
    )
}