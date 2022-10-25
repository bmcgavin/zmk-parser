import React, { useState } from 'react';
import { Combo, Keymap, Layer } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { LayersComponent } from './LayersComponent';

export type Layout = {
    columns: number[],
    rows: number
}

type KeymapWithKeys = {
    onSelectedKeysChange: any,
    onOutputChange: any,
    selectedKeys: LayerKey[],
    layers: Layer[],
    columns: number[],
    rows: number,
    keymapOrCombo: string,
    combos: Combo[],
    onCombosChange: any,
    onLayersChange: any
}

export const KeymapComponent: React.FC<KeymapWithKeys> = ({onSelectedKeysChange, onOutputChange, selectedKeys, layers, columns, rows, keymapOrCombo, combos, onCombosChange, onLayersChange}: KeymapWithKeys) => {

    return <LayersComponent
            onSelectedKeysChange={onSelectedKeysChange}
            onOutputChange={onOutputChange}
            selectedKeys={selectedKeys}
            layers={layers}
            columns={columns}
            rows={rows}
            keymapOrCombo={keymapOrCombo}
            combos={combos}
            onCombosChange={onCombosChange}
            onLayersChange={onLayersChange}>
        </LayersComponent>
}

