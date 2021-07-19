import React from 'react';
import { Dtsi } from 'src/devicetree';

import { CombosComponent } from './CombosComponent';
// import { KeymapComponent } from './KeymapComponent';


export const DtsiComponent: React.FC<Dtsi> = ({keymap, combos}: Dtsi) => {
    let combosComponent = <></>
    if (combos === undefined) {
        return CombosComponent
    }
    combosComponent = <CombosComponent combos={combos}></CombosComponent>

    return <div>
        {combosComponent}
        {/* <KeymapComponent keymap={keymap}></KeymapComponent> */}
    </div>
}