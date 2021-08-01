import React from 'react';
import { Combo, Combos } from 'src/devicetree/types';

import { ComboComponent } from './ComboComponent';

type CombosWithHandler = {
    onSelectedKeysChange: any,
    combos: Combo[]
}

export const CombosComponent: React.FC<CombosWithHandler> = ({onSelectedKeysChange, combos}: CombosWithHandler) => {
    
    const output = (combo: Combo): string => {
        return `${combo.name} \{
    timeout-ms = <${combo.timeout}>;
    key-positions = <${combo.positions.join(" ")}>;
    bindings = <${combo.bindings}>;
    ${combo.slowRelease?"slow-release":""}
    ${combo.layers.length!=0?"layers = <"+combo.layers.join(" ")+">":""}
};`
    }

    let combosText = ""

    return <div>
        <span>Combos</span>
        <textarea value={combosText} onChange={() => combosText}></textarea>
        {combos.map(function(combo, index){
            combosText += output(combo)
            console.log(combosText)
            return <ComboComponent onSelectedKeysChange={onSelectedKeysChange} key={combo.name} bindingIndex={index} combo={combo}></ComboComponent>;
        })}
    </div>
}