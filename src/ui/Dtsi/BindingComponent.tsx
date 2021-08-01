import React, { CSSProperties, useCallback } from 'react';

import { LayerKey } from '../Parser/Parser';

type BindingWithStyle = {
    onSelectedKeysChange: any,
    selectedKeys: LayerKey[],
    layer: number,
    style: CSSProperties,
    index: number,
    output: string
}

export const BindingComponent: React.FC<BindingWithStyle> = ({onSelectedKeysChange, selectedKeys, layer, style, index, output}: BindingWithStyle) => {

    const handleKeyClick = useCallback(() => {
        const layerKey: LayerKey = {
            layer: [layer],
            key: [index]
        }
        selectedKeys.push(layerKey)
        onSelectedKeysChange(selectedKeys)
    },
    [index, layer, selectedKeys])
    return <div className="binding" style={style} onClick={handleKeyClick}>{output}</div>
}

