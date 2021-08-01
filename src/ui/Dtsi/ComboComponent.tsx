import React, { useCallback, useState } from 'react';

import  { Combo } from '../../devicetree/types';
import { LayerKey } from '../Parser/Parser';

type ComboProps = {
    onSelectedKeysChange: any
    bindingIndex: number
    combo: Combo
}



export const ComboComponent: React.FC<ComboProps> = ({onSelectedKeysChange, bindingIndex, combo}: ComboProps) => {

    const handleComboClick = useCallback(() => {
        console.log(combo)
        const layerKey: LayerKey = {
            layer: combo.layers,
            key: combo.positions
        }
        onSelectedKeysChange([layerKey])
    },
    [combo])
    const handleClearClick = useCallback(() => {
        onSelectedKeysChange([])
    }, [])


    
    return <div><button onClick={handleClearClick}>Clear</button><div onClick={handleComboClick}>{combo.bindings} ({combo.positions})</div><div></div></div>

}
