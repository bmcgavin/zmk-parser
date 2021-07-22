import React from 'react';
import { Combo, Combos } from 'src/devicetree/types';

import { ComboComponent } from './ComboComponent';

type CombosWithHandler = {
    onSelectedKeysChange: any,
    combos: Combo[]
}

export const CombosComponent: React.FC<CombosWithHandler> = ({onSelectedKeysChange, combos}: CombosWithHandler) => {
    
    return <div>
        <span>Combos</span>
        {combos.map(function(combo, index){
            return <ComboComponent onSelectedKeysChange={onSelectedKeysChange} key={combo.name} bindingIndex={index} combo={combo}></ComboComponent>;
        })}
    </div>
}