import React, { useCallback } from 'react';
import { Combo, Combos } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { ComboComponent } from './ComboComponent';

type CombosWithHandler = {
    onSelectedKeysChange: any,
    selectedKeys: LayerKey[],
    layerCount: number,
    combos: Combo[],
}

export const CombosComponent: React.FC<CombosWithHandler> = ({onSelectedKeysChange, selectedKeys, layerCount, combos}: CombosWithHandler) => {
    function onlyUnique<T>(value: T, index: number, self: T[]): boolean {
        return self.indexOf(value) === index;
    }
    const output = (selectedKeys: LayerKey[]): string => {

        const layers = selectedKeys.map((sK) => sK.layer).filter(onlyUnique)
        const keys = selectedKeys.map((sK) => sK.key).filter(onlyUnique)
        console.log(selectedKeys)
        return `combo_temp \{
    timeout-ms = <50>;
    key-positions = <${keys.join(" ")}>;
    bindings = <??>;
    layers = <${layers.join(" ")}>
};`
    }
    
        return <div>
        <span>Combos</span><br/>
        <textarea id="combos" value={output(selectedKeys)}></textarea>
        {combos.map(function(combo, index){
            return <ComboComponent onSelectedKeysChange={onSelectedKeysChange} layerCount={layerCount} key={combo.name} bindingIndex={index} combo={combo}></ComboComponent>;
        })}
    </div>
}