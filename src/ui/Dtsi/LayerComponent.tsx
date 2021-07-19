import React from 'react';
import { Layer } from 'src/devicetree/types';

import { BindingComponent } from './BindingComponent';

export const LayerComponent: React.FC<Layer> = ({name, bindings}: Layer) => {
    
    return <div>
        {bindings.map(function(binding, index){
            return <BindingComponent key={name+"_"+binding.index} index={binding.index} output={binding.output}></BindingComponent>;
        })}
    </div>
}