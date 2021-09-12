import React, { useState } from 'react';
import { Keymap, Layer } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { LayerComponent } from './LayerComponent';

export type Layout = {
    columns: number[],
    rows: number
}

type KeymapWithKeys = {
    onSelectedKeysChange: any,
    selectedKeys: LayerKey[],
    layers: Layer[]
}

export const KeymapComponent: React.FC<KeymapWithKeys> = ({onSelectedKeysChange, selectedKeys, layers}: KeymapWithKeys) => {
    
    const initialState: Layout = {
        // columns:[10,10,10, 4],
        // rows:4
        columns:[12,12,12,14,8],
        rows: 5
    }
    const [state, setState] = useState(initialState)

    const onChange = (event:React.ChangeEvent<HTMLInputElement>, row: number) => {
        const newCol:number[] = state.columns.map((v: number, k: number): number => {if (k==row) {return Number(event.target.value)} return v})
        setState({...state,columns:newCol})
    }

    let columnInputs = []
    {for (let row = 0; row < state.rows;row++) {
        columnInputs.push(<div key={"columnsFor"+row}>Columns for {row}:<input type="number" value={state.columns[row]} name="columnsFor{row}" onChange={(event) => onChange(event, row)}></input></div>)
    }}

    return <div>
        <div>Keymap</div>
        <div>Rows:<input type="number" name="rows" value={state.rows} onChange={(event) => {setState({...state,rows:Number(event.target.value)})}}></input></div>
        {columnInputs}

        {layers.map(function(layer, index){
            return <LayerComponent onSelectedKeysChange={onSelectedKeysChange} layerCount={layers.length} layer={index} selectedKeys={selectedKeys} layout={state} key={layer.name+"_"+index} name={layer.name} bindings={layer.bindings}></LayerComponent>;
        })}
    </div>
}

