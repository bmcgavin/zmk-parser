import React, { useState } from 'react';
import { Keymap, Layer } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { LayerComponent } from './LayerComponent';

type State = {
    columns: number
}

type KeymapWithKeys = {
    onSelectedKeysChange: any,
    selectedKeys: LayerKey[],
    layers: Layer[]
}

export const KeymapComponent: React.FC<KeymapWithKeys> = ({onSelectedKeysChange, selectedKeys, layers}: KeymapWithKeys) => {
    
    const [columns, setColumns] = useState(0)

    return <div>
        <div>Keymap</div>
        <div>Columns:<input type="number" name="columns" onChange={(event) => {setColumns(Number(event.target.value))}}></input></div>
        {layers.map(function(layer, index){
            return <LayerComponent onSelectedKeysChange={onSelectedKeysChange} layer={index} selectedKeys={selectedKeys} columns={columns} key={layer.name+"_"+index} name={layer.name} bindings={layer.bindings}></LayerComponent>;
        })}
    </div>
}

