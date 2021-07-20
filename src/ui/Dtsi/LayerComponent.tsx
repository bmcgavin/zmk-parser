import React, { CSSProperties } from 'react';
import { Binding } from 'src/devicetree/types';

import { BindingComponent } from './BindingComponent';

type LayerWithColumns = {
    columns: number,
    name: string,
    bindings: Binding[]
}
export const LayerComponent: React.FC<LayerWithColumns> = ({columns, name, bindings}: LayerWithColumns) => {
    
    return <div>
        {bindings.map(function(binding, index){
            console.log("Columns: "+columns)
            console.log("index: "+index)

            let style: CSSProperties = {
                border: "2px solid"
            }
            if (index % columns == 0) {
                style.border = "5px solid"
            }
            return <BindingComponent style={style} key={name+"_binding_"+binding.index} index={binding.index} output={binding.output}></BindingComponent>;
        })}
    </div>
}