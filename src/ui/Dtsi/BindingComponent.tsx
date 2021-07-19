import React from 'react';

import { initialState } from '../Parser/Parser';
import  { Binding } from '../../devicetree/types';

type BindingProps = {
    layerIndex: number,
    bindingIndex: number,
}

export const BindingComponent = (state: Binding) => {

    return <div>{state.output}</div>
}

