import React from 'react';
import { Combos, Keymap } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { CombosComponent } from './CombosComponent';
import { KeymapComponent } from './KeymapComponent';

type DtsiWithHandler = {
    onSelectedKeysChange: any,
    selectedKeys: LayerKey[],
    keymap: Keymap | undefined,
    combos: Combos | undefined
}

export const DtsiComponent: React.FC<DtsiWithHandler> = ({onSelectedKeysChange, selectedKeys, keymap, combos}: DtsiWithHandler) => {
    let combosComponent, keymapComponent = <></>

    // console.log(keymap)
    // console.log(combos)
    if (combos?.combos !== undefined) {
        let layerCount = keymap?.layers.length ? keymap.layers.length : 0
        combosComponent = <CombosComponent onSelectedKeysChange={onSelectedKeysChange} layerCount={layerCount} combos={combos.combos}></CombosComponent>
    }
    if (keymap !== undefined) {
        keymapComponent = <KeymapComponent onSelectedKeysChange={onSelectedKeysChange} selectedKeys={selectedKeys} layers={keymap.layers}></KeymapComponent>
    }

    return <div>
        {combosComponent}
        {keymapComponent}
    </div>
}