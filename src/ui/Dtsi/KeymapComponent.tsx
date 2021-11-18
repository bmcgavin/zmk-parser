import React, { useState } from 'react';
import { Keymap, Layer } from 'src/devicetree/types';
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
    rows: number
}

export const KeymapComponent: React.FC<KeymapWithKeys> = ({onSelectedKeysChange, onOutputChange, selectedKeys, layers, columns, rows}: KeymapWithKeys) => {

    return <div>
        <div>Keymap</div>

        <LayersComponent
            onSelectedKeysChange={onSelectedKeysChange}
            onOutputChange={onOutputChange}
            selectedKeys={selectedKeys}
            layers={layers}
            columns={columns}
            rows={rows}>
        </LayersComponent>;
        
    </div>
}

