"use strict";
exports.__esModule = true;
exports.sanitise = void 0;
var removeIncludes = function (code) {
    return code.map(function (line) { return line.replace(/^#.*$/g, ""); });
};
var removeComments = function (code) {
    return code.map(function (line) { return line.replace(/\/\/.*$/g, ""); });
};
var removeSpaces = function (code) {
    return code.map(function (line) { return line.replace(/\s\s+/g, " "); });
};
var removeNewlines = function (code) {
    return code.filter(function (line) { return line.length != 0; });
};
var removeMultilineComments = function (lines) {
    return lines.replace(/\/\*.*?\*\//g, "");
};
function sanitise(code) {
    var starter = function (code) { return code.split(/\n/); };
    var codeArray = starter(code);
    var arraySanitisers = [
        removeComments,
        removeIncludes,
        removeSpaces,
        removeNewlines,
    ];
    for (var _i = 0, arraySanitisers_1 = arraySanitisers; _i < arraySanitisers_1.length; _i++) {
        var fn = arraySanitisers_1[_i];
        codeArray = fn(codeArray);
    }
    var joiner = function (code) { return code.join(''); };
    var codeString = joiner(codeArray);
    var stringSanitisers = [
        removeMultilineComments
    ];
    for (var _a = 0, stringSanitisers_1 = stringSanitisers; _a < stringSanitisers_1.length; _a++) {
        var fn = stringSanitisers_1[_a];
        codeString = fn(codeString);
    }
    return codeString;
}
exports.sanitise = sanitise;
