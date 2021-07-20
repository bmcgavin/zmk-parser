import React, { CSSProperties } from 'react';

import  { Binding } from '../../devicetree/types';

type BindingWithStyle = {
    style: CSSProperties,
    index: number,
    output: string
}

export const BindingComponent: React.FC<BindingWithStyle> = ({style, index, output}: BindingWithStyle) => {

    return <div className="binding" style={style}>{output}</div>
}

