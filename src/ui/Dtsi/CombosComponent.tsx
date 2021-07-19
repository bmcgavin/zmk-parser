import React from 'react';
import { Combos } from 'src/devicetree/types';

import { ComboComponent } from './ComboComponent';

export const CombosComponent: React.FC<Combos> = ({combos}: Combos) => {
    
    return <div>
        {combos.map(function(combo, index){
            return <ComboComponent key={combo.name} bindingIndex={index} combo={combo}></ComboComponent>;
        })}
    </div>
}