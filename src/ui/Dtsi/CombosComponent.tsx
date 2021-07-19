import React from 'react';
import { Combos } from 'src/devicetree/types';

import { ComboComponent } from './ComboComponent';

export const CombosComponent: React.FC<Combos> = (combos: Combos) => {
    
    return <div>
        {combos.combos.map(function(combo, index){
            return <ComboComponent bindingIndex={index} combo={combo}></ComboComponent>;
        })}
    </div>
}