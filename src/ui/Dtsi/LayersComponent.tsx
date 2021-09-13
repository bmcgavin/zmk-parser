import React, { useState } from 'react';
import { Layer } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { LayerComponent } from './LayerComponent';
import { Layout } from './KeymapComponent';

type Layers = {
    onSelectedKeysChange:any,
    selectedKeys: LayerKey[],
    layers: Layer[],
    layout: Layout,
}
export const LayersComponent: React.FC<Layers> = ({onSelectedKeysChange, selectedKeys, layers, layout}: Layers) => {
    
    const initialState = {
        activeLayer: layers[0].name
    }
    const [state, setState] = useState(initialState)

    const setLayer = (name: string) => {
        setState({activeLayer: name})
    }

    return (
        <div>
        <ul className="vertical-tab-list">
        {layers.map((layer) => {
            let className = "vertical-tab"
            if (layer.name == state.activeLayer) {
                className += " activeLayer"
            }
            return <li className={className} onClick={() => setLayer(layer.name)}>{layer.name}</li>
        })}
        </ul>
        {layers.map(function(layer, index){
            if (layer.name == state.activeLayer) {
                return <LayerComponent onSelectedKeysChange={onSelectedKeysChange} layerCount={layers.length} layer={index} selectedKeys={selectedKeys} layout={layout} key={layer.name+"_"+index} name={layer.name} bindings={layer.bindings}></LayerComponent>;
            }
        })}
    </div>
    )
}


