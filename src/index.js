"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function success(ctx, value) {
    return { success: true, value: value, ctx: ctx };
}
function failure(ctx, expected) {
    return { success: false, expected: expected, ctx: ctx };
}
// match an exact string or fail
function str(match) {
    return function (ctx) {
        var endIdx = ctx.index + match.length;
        if (ctx.text.substring(ctx.index, endIdx) === match) {
            return success(__assign(__assign({}, ctx), { index: endIdx }), match);
        }
        else {
            return failure(ctx, match);
        }
    };
}
// match a regexp or fail
function regex(re, expected) {
    return function (ctx) {
        re.lastIndex = ctx.index;
        var res = re.exec(ctx.text);
        if (res && res.index === ctx.index) {
            return success(__assign(__assign({}, ctx), { index: ctx.index + res[0].length }), res[0]);
        }
        else {
            return failure(ctx, expected);
        }
    };
}
// try each matcher in order, starting from the same point in the input. return the first one that succeeds.
// or return the failure that got furthest in the input string.
// which failure to return is a matter of taste, we prefer the furthest failure because.
// it tends be the most useful / complete error message.
function any(parsers) {
    return function (ctx) {
        var furthestRes = null;
        for (var _i = 0, parsers_1 = parsers; _i < parsers_1.length; _i++) {
            var parser = parsers_1[_i];
            var res = parser(ctx);
            if (res.success)
                return res;
            if (!furthestRes || furthestRes.ctx.index < res.ctx.index)
                furthestRes = res;
        }
        return furthestRes;
    };
}
// match a parser, or succeed with null
function optional(parser) {
    return any([parser, function (ctx) { return success(ctx, null); }]);
}
// look for 0 or more of something, until we can't parse any more. note that this function never fails, it will instead succeed with an empty array.
function many(parser) {
    return function (ctx) {
        var values = [];
        var nextCtx = ctx;
        while (true) {
            var res = parser(nextCtx);
            if (!res.success)
                break;
            values.push(res.value);
            nextCtx = res.ctx;
        }
        return success(nextCtx, values);
    };
}
// look for an exact sequence of parsers, or fail
function sequence(parsers) {
    return function (ctx) {
        var values = [];
        var nextCtx = ctx;
        for (var _i = 0, parsers_2 = parsers; _i < parsers_2.length; _i++) {
            var parser = parsers_2[_i];
            var res = parser(nextCtx);
            //console.log(res)
            if (!res.success)
                return res;
            values.push(res.value);
            nextCtx = res.ctx;
        }
        return success(nextCtx, values);
    };
}
function count(parser, count) {
    return sequence(new Array(count).fill(parser));
}
// a convenience method that will map a Success to callback, to let us do common things like build AST nodes from input strings.
function map(parser, fn) {
    return function (ctx) {
        var res = parser(ctx);
        return res.success ? success(res.ctx, fn(res.value)) : res;
    };
}
function parseBindings(text) {
    var res = bindings({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index;
}
// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parseBinding(text) {
    var res = binding({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index;
}
// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parseLayer(text) {
    var res = layer({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index;
}
// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parseKeymap(text) {
    var res = keymap({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index;
}
// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parseCombo(text) {
    var res = combo({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index + "\n" + res.ctx.text;
}
// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parseCombos(text) {
    var res = combos({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index + "\n" + res.ctx.text;
}
// our top level parsing function that takes care of creating a `Ctx`, and unboxing the final AST (or throwing)
function parse(text) {
    var res = dtsi({ text: text, index: 0 });
    if (res.success)
        return res.value;
    throw "Parse error, expected " + res.expected + " at char " + res.ctx.index + "\n" + res.ctx.text;
}
var bindingIdent = regex(/\&[^\&>]+/g, "binding");
var binding = map(sequence([bindingIdent]), function (_a) {
    var args = _a[0];
    return args.trim();
});
var bindings = map(sequence([str("bindings = < "), many(binding), str(">;")]), function (_a) {
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
var dtsiMarker = regex(/\/\s+\{\s*/g, "/ {");
var keymapMarker = regex(/\s*keymap\s*/g, "keymap");
var compatibleMarker = regex(/\s*compatible = \"zmk,[^\"]+\";\s*/g, "compatible = \"zmk,<smth>\"");
var layerIdent = regex(/[a-zA-Z][a-zA-Z0-9]*_layer/g, "layer");
var comboIdent = regex(/[a-zA-Z][a-zA-Z0-9_]*/g, "combo");
var brace = regex(/\s*[\{\}];?\s*/g, "brace");
var angleBracket = regex(/\s*[\<\>];?\s*/g, "angle bracket");
var ws = regex(/\s+/g, "ws");
var eq = regex(/\s*=\s*/g, "eq");
var integerWs = map(regex(/[0-9]+\s?/g, "integer"), function (intWs) { return parseInt(intWs.trim()); });
var layer = map(sequence([layerIdent, brace, bindings, brace]), function (_a) {
    var ident = _a[0], _lb = _a[1], bindings = _a[2], _rb = _a[3];
    return ({
        name: ident,
        bindings: bindings
    });
});
var keymap = map(sequence([dtsiMarker, keymapMarker, brace, compatibleMarker, many(layer), brace, brace]), function (_a) {
    var _d = _a[0], _keymap = _a[1], _lb = _a[2], _compat = _a[3], layers = _a[4], _rb = _a[5];
    return layers;
});
var comboTimeout = map(sequence([regex(/\s*timeout-ms\s*/g, "timeout-ms"), eq, angleBracket, integerWs, angleBracket]), function (_a) {
    var _t = _a[0], _e = _a[1], _ab = _a[2], timeout = _a[3];
    return timeout;
});
var comboPositions = map(sequence([regex(/\s*key-positions\s*/g, "key-positions"), eq, angleBracket, many(integerWs), angleBracket]), function (_a) {
    var _k = _a[0], _e = _a[1], _ab = _a[2], positions = _a[3];
    return positions;
});
var comboBindings = map(sequence([regex(/\s*bindings\s*/g, "bindings"), eq, angleBracket, binding, angleBracket]), function (_a) {
    var _b = _a[0], _e = _a[1], _ab = _a[2], binding = _a[3];
    return binding;
});
var comboLayers = map(sequence([regex(/\s*layers\s*/g, "layers"), eq, angleBracket, many(integerWs), angleBracket]), function (_a) {
    var _l = _a[0], _e = _a[1], _ab = _a[2], layers = _a[3];
    return layers;
});
var comboSlowRelease = map(sequence([regex(/\s*slow-release;\s*/g, "slow-release")]), function (_a) {
    var slowRelease = _a[0];
    return slowRelease ? true : false;
});
var comboOptions = map(sequence([
    optional(comboBindings),
    optional(comboTimeout),
    optional(comboPositions),
    optional(comboLayers),
    optional(comboSlowRelease)
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
var combo = map(sequence([comboIdent, brace, count(comboOptions, 5), brace]), function (_a) {
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
var combos = map(sequence([dtsiMarker, str("combos"), brace, compatibleMarker, many(combo), brace, brace]), function (_a) {
    var _d = _a[0], _c = _a[1], _b = _a[2], _cm = _a[3], combos = _a[4];
    return combos;
});
var dtsi = map(sequence([optional(combos), optional(keymap), optional(combos)]), function (_a) {
    var c1 = _a[0], keymap = _a[1], c2 = _a[2];
    var combos = c1 == null ? c2 : c1;
    return {
        keymap: keymap,
        combos: combos
    };
});
function example(code) {
    console.log(JSON.stringify(parse(code), null, 2));
}
example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; }; / { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; ");
example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; / { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");
var ctx = { index: 0 };
