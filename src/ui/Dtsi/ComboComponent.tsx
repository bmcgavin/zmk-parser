import React, { useState } from 'react';

import  { Combo } from '../../devicetree/types';
import { initialState } from '../Parser/Parser';

type ComboProps = {
    bindingIndex: number
    combo: Combo
}

export const ComboComponent: React.FC<ComboProps> = ({bindingIndex, combo}: ComboProps) => {
    
    return <div>{combo.bindings}</div>

}
