import React, { useCallback, useState } from 'react';
import { Combo } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { ComboComponent } from './ComboComponent';

type CombosWithHandler = {
    onSelectedKeysChange: any,
    selectedKeys: LayerKey[],
    layerCount: number,
    combos: Combo[],
    onCombosChange: any
}

export const CombosComponent: React.FC<CombosWithHandler> = ({onSelectedKeysChange, selectedKeys, layerCount, combos, onCombosChange}: CombosWithHandler) => {
    function onlyUnique<T>(value: T, index: number, self: T[]): boolean {
        return self.indexOf(value) === index;
    }
    const initialComboTemp: Combo = {
        name: "combo_temp",
        timeout: 50,
        bindings: [],
        positions: [],
        layers: [],
        slowRelease: false
    }

    const stringifyCombo = (combo: Combo): string => {
        console.log(combo.bindings)
        return `${combo.name} {
            timeout-ms = <${combo.timeout}>;
            key-positions = <${combo.positions.join(" ")}>;
            bindings = <${combo.bindings.map(binding => {return binding.output}).join(" ")}>;
            layers = <${combo.layers.join(" ")}>;
        };`
    }
    const [name, setName] = useState("")
    const onNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        comboTemp.name="combo_"+event.target.value
        setComboTemp(comboTemp)
        setName(event.target.value)
    }
    
    const [timeout, setTimeout] = useState(50)
    const onTimeoutHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        comboTemp.timeout=Number(event.target.value)
        setComboTemp(comboTemp)
        setTimeout(Number(event.target.value))
    }
    
    const [binding, setBinding] = useState("&kp ?")
    const onBindingHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const binding = {
            index: -1,
            output: event.target.value
        }
        comboTemp.bindings= [binding]
        setComboTemp(comboTemp)
        setBinding(event.target.value)
    }
    
    const [comboTemp, setComboTemp] = useState(initialComboTemp)
    const output = (selectedKeys: LayerKey[]) => {

        const layers = selectedKeys.map((sK) => sK.layer).filter(onlyUnique)
        const keys = selectedKeys.map((sK) => sK.key).filter(onlyUnique)
        // console.log("keys")
        // console.log(keys)
        
        comboTemp.layers = layers
        // comboTemp.positions = keys
        // console.log("comboTemp")
        // console.log(comboTemp)
        return <textarea id="combos" value={stringifyCombo(comboTemp)} onChange={() => {}}></textarea>
    }
    
    const handleCreateClick = useCallback(() => {
        combos.push(comboTemp)
        onCombosChange(combos)
    }, [comboTemp])

    const handleCopyClick = useCallback(() => {
        setBinding(comboTemp.bindings[0].output)
        setName(comboTemp.name.replace('combo_', ''))
        setTimeout(comboTemp.timeout)
    }, [comboTemp])

    return <div className='combos'>
        <span>Combos</span>
        <span>
            <label htmlFor="comboTempName">Name: combo_</label> 
            <input name="comboTempName" type="text" value={name} onChange={onNameHandler}></input>
        </span>
        <span>
            <label htmlFor="comboTempTimeout">Timeout: </label> 
            <input name="comboTempTimeout" type="number" value={timeout} onChange={onTimeoutHandler}></input>
        </span>
        <span>
            <label htmlFor="comboTempBinding">Binding: </label> 
            <input name="comboTempBinding" type="text" value={binding} onChange={onBindingHandler}></input>
        </span>
        <span>
            <button onClick={handleCreateClick}>Create</button>
            <button onClick={handleCopyClick}>Copy from text</button>
        </span>

        {output(selectedKeys)}
        {combos.map(function(combo, index){
            return <ComboComponent setComboTemp={setComboTemp} onSelectedKeysChange={onSelectedKeysChange} layerCount={layerCount} key={combo.name} bindingIndex={index} combo={combo}/>;
        })}
    </div>
}