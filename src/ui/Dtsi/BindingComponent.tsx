import React, { CSSProperties } from 'react';

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

    
    return <div className="binding" style={style}>{output}</div>
}

