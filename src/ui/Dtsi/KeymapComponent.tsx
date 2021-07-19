import React from 'react';
import { Keymap } from 'src/devicetree/types';

import { LayerComponent } from './LayerComponent';

export const KeymapComponent: React.FC<Keymap> = ({layers}: Keymap) => {
    
    return <div>
        {layers.map(function(layer, index){
            return <LayerComponent key="{layer.name}_{index}" name={layer.name} bindings={layer.bindings}></LayerComponent>;
        })}
    </div>
}