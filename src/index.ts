type Parser<T> = (ctx: Context) => Result<T>;

type Result<T> = Success<T> | Failure;

type Success<T> = Readonly<{
  success: true;
  value: T;
  ctx: Context;
}>;

type Failure = Readonly<{
  success: false;
  expected: string;
  ctx: Context;
}>;

type Context = Readonly<{
  text: string;
  index: number;
}>;

function success<T>(ctx: Context, value: T): Success<T> {
  return { success: true, value, ctx };
}

function failure(ctx: Context, expected: string): Failure {
  return { success: false, expected, ctx };
}

// match an exact string or fail
function str(match: string): Parser<string> {
  return ctx => {
    const endIdx = ctx.index + match.length;
    if (ctx.text.substring(ctx.index, endIdx) === match) {
      return success({ ...ctx, index: endIdx }, match);
    } else {
      return failure(ctx, match);
    }
  };
}

// match a regexp or fail
function regex(re: RegExp, expected: string): Parser<string> {
  return ctx => {
    re.lastIndex = ctx.index;
    const res = re.exec(ctx.text);
    if (res && res.index === ctx.index) {
      return success({ ...ctx, index: ctx.index + res[0].length }, res[0]);
    } else {
      return failure(ctx, expected);
    }
  };
}

// try each matcher in order, starting from the same point in the input. return the first one that succeeds.
// or return the failure that got furthest in the input string.
// which failure to return is a matter of taste, we prefer the furthest failure because.
// it tends be the most useful / complete error message.
function any<T>(parsers: Parser<T>[]): Parser<T> {
  return ctx => {
    let furthestRes: Result<T> | null = null;
    for (const parser of parsers) {
      const res = parser(ctx);
      if (res.success) return res
      if (!furthestRes || furthestRes.ctx.index < res.ctx.index)
        furthestRes = res;
    }
    return furthestRes!;
  };
}

// match a parser, or succeed with null
function optional<T>(parser: Parser<T>): Parser<T | null> {
  return any([parser, ctx => success(ctx, null)]);
}

// look for 0 or more of something, until we can't parse any more. note that this function never fails, it will instead succeed with an empty array.
function many<T>(parser: Parser<T>): Parser<T[]> {
  return ctx => {
    let values: T[] = [];
    let nextCtx = ctx;
    while (true) {
      const res = parser(nextCtx);
      if (!res.success) break;
      values.push(res.value);
      nextCtx = res.ctx;
    }
    return success(nextCtx, values);
  };
}

// look for an exact sequence of parsers, or fail
function sequence<T>(parsers: Parser<T>[]): Parser<T[]> {
  return ctx => {
    let values: T[] = [];
    let nextCtx = ctx;
    for (const parser of parsers) {
      const res = parser(nextCtx);
      //console.log(res)
      if (!res.success) return res;
      values.push(res.value);
      nextCtx = res.ctx;
    }
    return success(nextCtx, values);
  };
}

interface Array<T> {
  fill(value: T): Array<T>;
}

function count<T>(parser: Parser<T>, count: number): Parser<T[]> {
  return sequence<T>(new Array<Parser<T>>(count).fill(parser))
}

// a convenience method that will map a Success to callback, to let us do common things like build AST nodes from input strings.
function map<A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> {
  return ctx => {
    const res = parser(ctx);
    return res.success ? success(res.ctx, fn(res.value)) : res;
  };
}

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

interface Dtsi {
  keymap: Keymap;
  combos: Combos;
}

interface Keymap {
  keymap: Layer[]
}

interface Layer {
  name: string
  bindings: Binding[]
}

interface Binding {
  index: number
  output: string
}

interface Combos {
  combos: Combo[]
}

interface Combo {
  name: string
  timeout: number
  bindings: Binding[]
  positions: number[]
  layers: number[]
  slowRelease: boolean
}

// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parse(text: string): Dtsi {
  const res = dtsi({ text, index: 0 });
  if (res.success) return res.value;
  throw `Parse error, expected ${res.expected} at char ${res.ctx.index}\n${res.ctx.text}`;
}
const bindingIdent = regex(/\&[^\&>]+/g, "binding")

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

const dtsiMarker = regex(/\/\s+\{\s*/g, "/ {");
const keymapMarker = regex(/\s*keymap\s*/g, "keymap");
const compatibleMarker = regex(/\s*compatible = \"zmk,[^\"]+\";\s*/g, "compatible = \"zmk,<smth>\"")

const layerIdent = regex(/[a-zA-Z][a-zA-Z0-9]*_layer/g, "layer");
const comboIdent = regex(/[a-zA-Z][a-zA-Z0-9_]*/g, "combo");
const brace = regex(/\s*[\{\}];?\s*/g, "brace");
const angleBracket = regex(/\s*[\<\>];?\s*/g, "angle bracket");
const ws = regex(/\s+/g, "ws");
const eq = regex(/\s*=\s*/g, "eq");
const integerWs = map(
  regex(/[0-9]+\s?/g, "integer"),
  (intWs): Number => parseInt(intWs.trim())
);
const layer = map(
  sequence<any>([layerIdent, brace, bindings, brace]),
  ([ident, _lb, bindings, _rb]): Layer => ({
    name: ident,
    bindings: bindings
  })
);

const keymap = map(
  sequence<any>([dtsiMarker, keymapMarker, brace, compatibleMarker, many(layer), brace, brace]),
  ([_d, _keymap, _lb, _compat, layers, _rb]): Keymap => layers
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
  sequence<any>([comboIdent, brace, count(comboOptions, 5), brace]),
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
  sequence<any>([dtsiMarker, str("combos"), brace, compatibleMarker, many(combo), brace, brace]),
  ([_d, _c, _b, _cm, combos]): Combos => combos
)

const dtsi = map(
  sequence<any>([optional(combos), optional(keymap), optional(combos)]),
  ([c1, keymap, c2]): Dtsi => {
    const combos = c1 == null ? c2 : c1
    return {
      keymap,
      combos
    }
  }
);

function example(code: string) {
  console.log(JSON.stringify(parse(code), null, 2));
}

example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; }; / { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; ");
example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; / { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");

const ctx = { index: 0 };
