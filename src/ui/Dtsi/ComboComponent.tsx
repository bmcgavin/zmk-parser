import React, { useCallback, useState } from 'react';

import  { Combo } from '../../devicetree/types';
import { LayerKey } from '../Parser/Parser';

type ComboProps = {
    onSelectedKeysChange: any
    layerCount: number
    bindingIndex: number
    combo: Combo
}



export const ComboComponent: React.FC<ComboProps> = ({onSelectedKeysChange, layerCount, bindingIndex, combo}: ComboProps) => {

    const handleComboClick = useCallback(() => {
        console.log(combo)
        let layerKeys = []
        let layerLimit = layerCount
        if (combo.layers.length != 0) {
            layerLimit = combo.layers.length
        }
        for (let i = 0; i < layerLimit; i++) {
            for (const pos of combo.positions) {
                layerKeys.push({layer: i, key: pos})
            }
        }
        onSelectedKeysChange(layerKeys)
    },
    [combo, layerCount])
    const handleClearClick = useCallback(() => {
        onSelectedKeysChange([])
    }, [])

    const handleCreateClick = useCallback(() => {

    }, [])

    
    return <div>
        <button onClick={handleClearClick}>Clear</button>
        <button onClick={handleCreateClick}>Create</button>
        <div onClick={handleComboClick}>{combo.bindings} ({combo.positions})</div>
    </div>

}
