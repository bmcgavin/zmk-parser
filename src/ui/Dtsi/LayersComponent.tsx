import React, { useState } from 'react';
import { Layer } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { LayerComponent } from './LayerComponent';
import { Layout } from './KeymapComponent';

type Layers = {
    onSelectedKeysChange:any,
    onOutputChange: any,
    selectedKeys: LayerKey[],
    layers: Layer[],
    columns: number[],
    rows: number
}
export const LayersComponent: React.FC<Layers> = ({onSelectedKeysChange, onOutputChange, selectedKeys, layers, columns, rows}: Layers) => {
    
    const initialState = {
        activeLayer: layers[0].name
    }
    const [state, setState] = useState(initialState)

    const setLayer = (name: string) => {
        setState({activeLayer: name})
    }

    const copyLayer = () => {
        console.log("copyLayer")
        let e = document.getElementById("renderedKeymap") as HTMLInputElement
        if (e === null) {
            return
        }
        e.select()
        document.execCommand('copy')
        console.log("copied!")
    }

    return (
        <div>
        <div>Layers</div>
        <ul className="vertical-tab-list">
        {layers.map((layer) => {
            let className = "vertical-tab"
            if (layer.name == state.activeLayer) {
                className += " activeLayer"

            }
            return <li key={layer.name} className={className} onClick={() => setLayer(layer.name)}>{layer.name}<a onClick={copyLayer}>📋</a></li>
        })}
        </ul>
        {layers.map((layer, index) => {
            if (layer.name == state.activeLayer) {
                return <LayerComponent 
                    onSelectedKeysChange={onSelectedKeysChange}
                    onOutputChange={onOutputChange}
                    layer={index}
                    selectedKeys={selectedKeys}
                    columns={columns}
                    rows={rows}
                    key={layer.name+"_"+index}
                    name={layer.name}
                    bindings={layer.bindings}/>
            }
        })}
    </div>
    )
}


