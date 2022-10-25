import React, { useCallback, useState } from 'react';

import  { Combo } from '../../devicetree/types';
import { LayerKey } from '../Parser/Parser';

type ComboProps = {
    setComboTemp: any
    onSelectedKeysChange: any
    layerCount: number
    bindingIndex: number
    combo: Combo
}

export const ComboComponent: React.FC<ComboProps> = ({setComboTemp, onSelectedKeysChange, layerCount, bindingIndex, combo}: ComboProps) => {

    const handleComboClick = useCallback(() => {
        // console.log("combocomponent")
        // console.log(combo)
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
        setComboTemp(combo)
    },
    [combo, layerCount])
    const handleClearClick = useCallback(() => {
        onSelectedKeysChange([])
    }, [])

    return <div>
        <button onClick={handleClearClick}>Clear</button>
        <div onClick={handleComboClick}>{combo.name}</div>
    </div>

}
