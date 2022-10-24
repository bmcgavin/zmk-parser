import React, { CSSProperties, useCallback, useState, useEffect } from 'react';
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
    output: string,
    keymapOrCombo: string
}

export const BindingComponent: React.FC<BindingWithStyle> = ({onSelectedKeysChange, onOutputChange, selectedKeys, layer, style, index, output, keymapOrCombo}: BindingWithStyle) => {

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
    const onKeyUpHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code == "Enter") {
            handleBindingUpdate()
        }
        if (event.code == "Escape") {
            //revert
            setToggle(true)
        }
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

    const handleBindingEdit = useCallback((_) => {
        setToggle(false)
    },
    [])

    return ( 
        (keymapOrCombo == "keymap") ? 
            toggle ? (
                <div id={"binding_"+index} className="binding" style={style} onDoubleClick={handleBindingEdit} title={alt}>{inner}</div>
            ) : (
                <input id={"input_"+index} type="text" className="binding" style={style} onBlur={event => setToggle(true)} onKeyUp={onKeyUpHandler} autoFocus onChange={onChangeHandler} onDoubleClick={handleBindingUpdate} value={inputValue}></input>
            ) 
        :
            toggle ? (
                <div id={"binding_"+index} className="binding" style={style} onClick={handleKeyClick} title={alt}>{inner}</div>
            ) : (
                <div id={"binding_"+index} className="binding selected" style={style} onBlur={event => setToggle(true)} onClick={handleKeyClick}></div>
            ) 

    )
}

