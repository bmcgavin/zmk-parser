"use strict";
exports.__esModule = true;
exports.parse = void 0;
var parser_1 = require("../parser");
var bindingIdent = parser_1.regex(/\&[^\&>]+/g, "binding");
var dtsiMarker = parser_1.regex(/\/\s+\{\s*/g, "/ {");
var keymapMarker = parser_1.regex(/\s*keymap\s*/g, "keymap");
var compatibleMarker = parser_1.regex(/\s*compatible = \"zmk,[^\"]+\";\s*/g, "compatible = \"zmk,<smth>\"");
var layerIdent = parser_1.regex(/[a-zA-Z][a-zA-Z0-9]*_layer/g, "layer");
var comboIdent = parser_1.regex(/[a-zA-Z][a-zA-Z0-9_]*/g, "combo");
var brace = parser_1.regex(/\s*[\{\}];?\s*/g, "brace");
var angleBracket = parser_1.regex(/\s*[\<\>];?\s*/g, "angle bracket");
var eq = parser_1.regex(/\s*=\s*/g, "eq");
var integerWs = parser_1.map(parser_1.regex(/[0-9]+\s?/g, "integer"), function (intWs) { return parseInt(intWs.trim()); });
var binding = parser_1.map(parser_1.sequence([bindingIdent]), function (_a) {
    var args = _a[0];
    return args.trim();
});
var bindings = parser_1.map(parser_1.sequence([parser_1.str("bindings = < "), parser_1.many(binding), parser_1.str(">;")]), function (_a) {
    var _ident = _a[0], args = _a[1];
    var bindings = [];
    var i = 0;
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var binding_1 = args_1[_i];
        bindings.push(({
            index: i++,
            output: binding_1
        }));
    }
    return bindings;
});
var layer = parser_1.map(parser_1.sequence([layerIdent, brace, bindings, brace]), function (_a) {
    var ident = _a[0], _lb = _a[1], bindings = _a[2], _rb = _a[3];
    return ({
        name: ident,
        bindings: bindings
    });
});
var keymap = parser_1.map(parser_1.sequence([keymapMarker, brace, compatibleMarker, parser_1.many(layer), brace]), function (_a) {
    var _keymap = _a[0], _lb = _a[1], _compat = _a[2], layers = _a[3], _rb = _a[4];
    return ({ layers: layers });
});
var comboTimeout = parser_1.map(parser_1.sequence([parser_1.regex(/\s*timeout-ms\s*/g, "timeout-ms"), eq, angleBracket, integerWs, angleBracket]), function (_a) {
    var _t = _a[0], _e = _a[1], _ab = _a[2], timeout = _a[3];
    return timeout;
});
var comboPositions = parser_1.map(parser_1.sequence([parser_1.regex(/\s*key-positions\s*/g, "key-positions"), eq, angleBracket, parser_1.many(integerWs), angleBracket]), function (_a) {
    var _k = _a[0], _e = _a[1], _ab = _a[2], positions = _a[3];
    return positions;
});
var comboBindings = parser_1.map(parser_1.sequence([parser_1.regex(/\s*bindings\s*/g, "bindings"), eq, angleBracket, binding, angleBracket]), function (_a) {
    var _b = _a[0], _e = _a[1], _ab = _a[2], binding = _a[3];
    return binding;
});
var comboLayers = parser_1.map(parser_1.sequence([parser_1.regex(/\s*layers\s*/g, "layers"), eq, angleBracket, parser_1.many(integerWs), angleBracket]), function (_a) {
    var _l = _a[0], _e = _a[1], _ab = _a[2], layers = _a[3];
    return layers;
});
var comboSlowRelease = parser_1.map(parser_1.sequence([parser_1.regex(/\s*slow-release;\s*/g, "slow-release")]), function (_a) {
    var slowRelease = _a[0];
    return slowRelease ? true : false;
});
var comboOptions = parser_1.map(parser_1.sequence([
    parser_1.optional(comboBindings),
    parser_1.optional(comboTimeout),
    parser_1.optional(comboPositions),
    parser_1.optional(comboLayers),
    parser_1.optional(comboSlowRelease)
]), function (_a) {
    var bindings = _a[0], timeout = _a[1], positions = _a[2], layers = _a[3], slowRelease = _a[4];
    return ({
        name: "",
        timeout: timeout,
        bindings: bindings,
        positions: positions,
        layers: layers,
        slowRelease: slowRelease
    });
});
var combo = parser_1.map(parser_1.sequence([comboIdent, brace, parser_1.count(comboOptions, 5), brace]), function (_a) {
    var name = _a[0], _b = _a[1], options = _a[2];
    var combo = {
        name: name,
        timeout: 0,
        bindings: [],
        positions: [],
        layers: [],
        slowRelease: false
    };
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var option = options_1[_i];
        if (option.timeout !== null)
            combo.timeout = option.timeout;
        if (option.bindings !== null)
            combo.bindings = option.bindings;
        if (option.positions !== null)
            combo.positions = option.positions;
        if (option.layers !== null)
            combo.layers = option.layers;
        if (option.slowRelease !== null)
            combo.slowRelease = option.slowRelease;
    }
    return combo;
});
var combos = parser_1.map(parser_1.sequence([parser_1.str("combos"), brace, compatibleMarker, parser_1.many(combo), brace]), function (_a) {
    var _c = _a[0], _b = _a[1], _cm = _a[2], combos = _a[3];
    return combos;
});
var dtsiOptions = parser_1.map(parser_1.sequence([
    parser_1.optional(combos),
    parser_1.optional(keymap)
]), function (_a) {
    var combos = _a[0], keymap = _a[1];
    return ({
        keymap: keymap,
        combos: combos
    });
});
var dtsi = parser_1.map(parser_1.sequence([dtsiMarker, parser_1.count(dtsiOptions, 2), brace]), function (_a) {
    var _d = _a[0], options = _a[1];
    var dtsi = {
        keymap: undefined,
        combos: undefined
    };
    for (var _i = 0, options_2 = options; _i < options_2.length; _i++) {
        var option = options_2[_i];
        if (option.keymap !== null)
            dtsi.keymap = option.keymap;
        if (option.combos !== null)
            dtsi.combos = option.combos;
    }
    return dtsi;
});
// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parse(text) {
    var res = dtsi({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index + "\n" + res.ctx.text;
}
exports.parse = parse;
