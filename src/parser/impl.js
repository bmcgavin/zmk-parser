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
exports.__esModule = true;
exports.map = exports.count = exports.sequence = exports.many = exports.optional = exports.any = exports.regex = exports.str = exports.failure = exports.success = void 0;
function success(ctx, value) {
    return { success: true, value: value, ctx: ctx };
}
exports.success = success;
function failure(ctx, expected) {
    return { success: false, expected: expected, ctx: ctx };
}
exports.failure = failure;
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
exports.str = str;
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
exports.regex = regex;
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
exports.any = any;
// match a parser, or succeed with null
function optional(parser) {
    return any([parser, function (ctx) { return success(ctx, null); }]);
}
exports.optional = optional;
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
exports.many = many;
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
exports.sequence = sequence;
function count(parser, count) {
    return sequence(new Array(count).fill(parser));
}
exports.count = count;
// a convenience method that will map a Success to callback, to let us do common things like build AST nodes from input strings.
function map(parser, fn) {
    return function (ctx) {
        var res = parser(ctx);
        return res.success ? success(res.ctx, fn(res.value)) : res;
    };
}
exports.map = map;
