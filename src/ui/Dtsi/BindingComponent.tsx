import React, { CSSProperties, useCallback, useState } from 'react';
import { Binding } from 'src/devicetree/types';

import { LayerKey } from '../Parser/Parser';

import {allSanitisers, sanitise} from './util';

type BindingWithStyle = {
    onSelectedKeysChange: any,
    onOutputChange: any,
    selectedKeys: LayerKey[],
    layer: number,
    style: CSSProperties,
    index: number,
    output: string
}

export const BindingComponent: React.FC<BindingWithStyle> = ({onSelectedKeysChange, onOutputChange, selectedKeys, layer, style, index, output}: BindingWithStyle) => {

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

    let [alt, inner] = sanitise(output, allSanitisers)

    const [inputValue, setInputValue] = useState(alt)
    const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const [toggle, setToggle] = useState(true)

    const handleBindingUpdate = useCallback(() => {
        setToggle(true)
        const binding: Binding = {
            index: index,
            output: inputValue
        }
        onOutputChange(binding, layer)
    },
    [inputValue, index, layer])


    return ( 
        toggle ? (
            <div className="binding" style={style} onDoubleClick={() => setToggle(false)} onClick={handleKeyClick} title={alt}>{inner}</div>
        ) : (
            <input type="text" className="binding" style={style} onChange={onChangeHandler} onDoubleClick={handleBindingUpdate} value={inputValue}></input>
        ) 
    )
}

