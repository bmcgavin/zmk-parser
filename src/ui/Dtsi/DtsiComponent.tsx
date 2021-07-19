import React from 'react';
import { Dtsi } from 'src/devicetree/types';

import { CombosComponent } from './CombosComponent';
import { KeymapComponent } from './KeymapComponent';

export const DtsiComponent: React.FC<Dtsi> = ({keymap, combos}: Dtsi) => {
    let combosComponent, keymapComponent = <></>

    console.log(keymap)
    console.log(combos)
    if (combos?.combos !== undefined) {
        combosComponent = <CombosComponent combos={combos.combos}></CombosComponent>
    }
    if (keymap !== undefined) {
        keymapComponent = <KeymapComponent layers={keymap.layers}></KeymapComponent>
    }

    return <div>
        {combosComponent}
        {keymapComponent}
    </div>
}