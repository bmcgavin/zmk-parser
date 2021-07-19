import React from 'react';

import  { Binding } from '../../devicetree/types';

export const BindingComponent: React.FC<Binding> = ({index, output}: Binding) => {

    return <div>{output}</div>
}

