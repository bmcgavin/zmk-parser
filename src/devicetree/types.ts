// Begin language specific stuff

// DTSI grammar
// dtsi = [ map ]
// map = '/ {' keymap | combos
// keymap = 'keymap {compatible = "zmk, keymap";' [ layers ]
// layer = layer_name [ binding ]
// layer_name = /[a-z0-9\-_]+/
// combos = 'combos {compatible = "zmk,combos";' [ combo ]
// combo = combo_identifier combomap
// combomap = timeout-ms | key-positions | bindings
// bindings = 'bindings' [ binding ]

export type Dtsi = {
  keymap: Keymap | undefined;
  combos: Combos | undefined;
}

export type Keymap = {
  layers: Layer[]
}

export type Layer = {
  name: string
  bindings: Binding[]
}

export type Binding = {
  index: number
  output: string
}

export type Combos = {
  combos: Combo[]
}

export type Combo = {
  name: string
  timeout: number
  bindings: Binding[]
  positions: number[]
  layers: number[]
  slowRelease: boolean
}
