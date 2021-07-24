import React, { useState } from 'react';
import { Keymap, Layer } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { LayerComponent } from './LayerComponent';

export type Layout = {
    columnsForRow: Map<number,number>,
    rows: number
}

type KeymapWithKeys = {
    onSelectedKeysChange: any,
    selectedKeys: LayerKey[],
    layers: Layer[]
}

export const KeymapComponent: React.FC<KeymapWithKeys> = ({onSelectedKeysChange, selectedKeys, layers}: KeymapWithKeys) => {
    
    const initialState: Layout = {
        columnsForRow:new Map<number,number>([[0,12],[1,12],[2,12],[3,14],[4,8]]),
        rows:5
    }
    const [state, setState] = useState(initialState)

    let columnInputs = []
    {for (let row = 0; row < state.rows;row++) {
        columnInputs.push(<div>Columns for {row}:<input type="number" value={state.columnsForRow.get(row)} name="columnsFor{row}" onChange={(event) => {setState({...state,columnsForRow:state.columnsForRow.set(row, Number(event.target.value))})}}></input></div>)
    }}

    return <div>
        <div>Keymap</div>
        <div>Rows:<input type="number" name="rows" value={state.rows} onChange={(event) => {setState({...state,rows:Number(event.target.value)})}}></input></div>
        {columnInputs}
        {layers.map(function(layer, index){
            return <LayerComponent onSelectedKeysChange={onSelectedKeysChange} layer={index} selectedKeys={selectedKeys} layout={state} key={layer.name+"_"+index} name={layer.name} bindings={layer.bindings}></LayerComponent>;
        })}
    </div>
}

