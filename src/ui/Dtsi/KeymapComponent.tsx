import React, { useState } from 'react';
import { Keymap } from 'src/devicetree/types';

import { LayerComponent } from './LayerComponent';

type State = {
    columns: number
}

export const KeymapComponent: React.FC<Keymap> = ({layers}: Keymap) => {
    
    const [columns, setColumns] = useState(0)

    return <div>
        <span>Keymap</span>
        <span>Columns:<input type="number" name="columns" onChange={(event) => {setColumns(Number(event.target.value))}}></input></span>
        {layers.map(function(layer, index){
            return <LayerComponent columns={columns} key={layer.name+"_"+index} name={layer.name} bindings={layer.bindings}></LayerComponent>;
        })}
    </div>
}

