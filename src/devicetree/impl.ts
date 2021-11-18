import { map, regex, sequence, many, str, optional, count } from '../parser';
import { Dtsi, Binding, Layer, Keymap, Combo, Combos } from './types';

const bindingIdent = regex(/\s*\&[^\&>]+/g, "binding")
const dtsiMarker = regex(/\/\s+\{\s*/g, "/ {");
const keymapMarker = regex(/\s*keymap\s*/g, "keymap");
const compatibleMarker = regex(/\s*compatible = \"zmk,[^\"]+\";\s*/g, "compatible = \"zmk,<smth>\"")
const ident = regex(/[a-zA-Z][a-zA-Z0-9_]*/g, "ident");
const brace = regex(/\s*[\{\}];?\s*/g, "brace");
const angleBracket = regex(/\s*[\<\>];?\s*/g, "angle bracket");
const eq = regex(/\s*=\s*/g, "eq");
const integerWs = map(
  regex(/[0-9]+\s?/g, "integer"),
  (intWs): Number => parseInt(intWs.trim())
);

const binding = map(
  sequence<any>([bindingIdent]),
  ([args]): Binding => args.trim()
);

const bindings = map(
  sequence<any>([str("bindings = < "), many(binding), str(">;")]),
  ([_ident, args]): Binding[] => {
    let bindings: Binding[] = []
    let i = 0;
    for (const binding of args) {
      bindings.push(({
        index: i++,
        output: binding
      }))
    }
    return bindings
  }
);

const layer = map(
  sequence<any>([ident, brace, bindings, brace]),
  ([ident, _lb, bindings, _rb]): Layer => ({
    name: ident,
    bindings: bindings
  })
);

const keymap = map(
  sequence<any>([keymapMarker, brace, compatibleMarker, many(layer), brace]),
  ([_keymap, _lb, _compat, layers, _rb]): Keymap => ({layers: layers})
);

const comboTimeout = map(
  sequence<any>([regex(/\s*timeout-ms\s*/g, "timeout-ms"), eq, angleBracket, integerWs, angleBracket]),
  ([_t, _e, _ab, timeout]): Number => timeout
);

const comboPositions = map(
  sequence<any>([regex(/\s*key-positions\s*/g, "key-positions"), eq, angleBracket, many(integerWs), angleBracket]),
  ([_k, _e, _ab, positions]): Number[] => positions
);

const comboBindings = map(
  sequence<any>([regex(/\s*bindings\s*/g, "bindings"), eq, angleBracket, binding, angleBracket]),
  ([_b, _e, _ab, binding]): Binding => binding
);

const comboLayers = map(
  sequence<any>([regex(/\s*layers\s*/g, "layers"), eq, angleBracket, many(integerWs), angleBracket]),
  ([_l, _e, _ab, layers]): Number[] => layers
);

const comboSlowRelease = map(
  sequence<any>([regex(/\s*slow-release;\s*/g, "slow-release")]),
  ([slowRelease]): Boolean => slowRelease ? true : false
);

const comboOptions = map(
  sequence<any>([
    optional(comboBindings),
    optional(comboTimeout),
    optional(comboPositions),
    optional(comboLayers),
    optional(comboSlowRelease)
  ]),
  ([bindings, timeout, positions, layers, slowRelease]): Combo => ({
    name: "",
    timeout,
    bindings,
    positions,
    layers,
    slowRelease
  })
);

const combo = map(
  sequence<any>([ident, brace, count(comboOptions, 5), brace]),
  ([name, _b, options]): Combo => {
    let combo: Combo = {
      name,
      timeout: 0,
      bindings: [],
      positions: [],
      layers: [],
      slowRelease: false
    }
    for (const option of options) {
      if (option.timeout !== null) combo.timeout = option.timeout;
      if (option.bindings !== null) combo.bindings = option.bindings;
      if (option.positions !== null) combo.positions = option.positions;
      if (option.layers !== null) combo.layers = option.layers;
      if (option.slowRelease !== null) combo.slowRelease = option.slowRelease;

    }
    return combo
  }
);

const combos = map(
  sequence<any>([str("combos"), brace, compatibleMarker, many(combo), brace]),
  ([_c, _b, _cm, combos]): Combos => ({
    combos
  })
)

const dtsiOptions = map(
  sequence<any>([
    optional(combos),
    optional(keymap)
  ]),
  ([combos, keymap]): Dtsi => ({
    keymap,
    combos
  })
);

const dtsi = map(
  sequence<any>([dtsiMarker, count(dtsiOptions, 2), brace]),
  ([_d, options]): Dtsi => {
    let dtsi: Dtsi = {
      keymap: undefined,
      combos: undefined
    }
    for (const option of options) {
      if (option.keymap !== null) dtsi.keymap = option.keymap;
      if (option.combos !== null) dtsi.combos = option.combos;
    }
    return dtsi
  }
);

// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
export function parse(text: string): Dtsi {
  const res = dtsi({ text, index: 0 });
  if (res.success) return res.value;
  throw `Parse error, expected ${res.expected} at char ${res.ctx.index}\n${res.ctx.text}`;
}