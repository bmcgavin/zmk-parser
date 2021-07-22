import React, { useCallback, useState } from 'react';

import  { Combo } from '../../devicetree/types';
import { LayerKey } from '../Parser/Parser';

type ComboProps = {
    onSelectedKeysChange: any
    bindingIndex: number
    combo: Combo
}



export const ComboComponent: React.FC<ComboProps> = ({onSelectedKeysChange, bindingIndex, combo}: ComboProps) => {

    const handleClick = useCallback(() => {
        console.log(combo)
        const layerKey: LayerKey = {
            layer: combo.layers,
            key: combo.positions
        }
        onSelectedKeysChange([layerKey])
    },
    [combo])
    return <div onClick={handleClick}>{combo.bindings} ({combo.positions})</div>

}
