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
            layer: layer,
            key: index
        }
        for (let i = 0; i < selectedKeys.length; i++) {
            if (selectedKeys[i].layer == layer && selectedKeys[i].key == index) {
                selectedKeys.splice(i, 1)
                onSelectedKeysChange(selectedKeys)
                return
            }
        }
        selectedKeys.push(layerKey)
        onSelectedKeysChange(selectedKeys)
    },
    [index, layer, selectedKeys])

    type stringSanitiser = (input: string) => string

    const kp = (input: string) => input.replace("&kp ", "")
    const trans = (input: string) => input.replace("&trans", "&nbsp;")

    const sanitise = (input: string, sanitisers: stringSanitiser[]): string => {
        let output = input
        for (const fn of sanitisers) {
            output = fn(output)
        }

        return output
    }
    return <div className="binding" style={style} onClick={handleKeyClick}>{sanitise(output, [kp, trans])}</div>
}

