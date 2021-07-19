"use strict";
exports.__esModule = true;
var devicetree_1 = require("../src/devicetree");
var sanitiser_1 = require("../src/sanitiser");
function example(code) {
    console.log(JSON.stringify(devicetree_1.parse(code), null, 2));
}
//example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; ");
//example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");
//example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; };");
//example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");
console.log(JSON.stringify(devicetree_1.parse(sanitiser_1.sanitise("\n#include <behaviors.dtsi>\n\n#define LCAG(keycode) APPLY_MODS(MOD_LCTL, APPLY_MODS(MOD_LALT, APPLY_MODS(MOD_LGUI, keycode)))\n\n//todo :\n/ {\n    /**\n     * Let's talk about combos and nongreedy regex\n     */\n    combos {\n      compatible = \"zmk,combos\";\n      combo_f1 {\n        slow-release;\n        timeout-ms = <50>;\n        key-positions = <13 25>;\n        bindings = <&kp F1>;\n        layers = <1>;\n      };\n    };\n    /**\n     * Let's talk about keymaps for a while\n     */\n    keymap {\n      compatible = \"zmk,keymap\";\n      default_layer {\n        bindings = < &trans >;\n      };\n      raise_layer {\n        bindings = < &kp N2 &kp N3 &bt SEL 0 >;\n      };\n    };\n}; \n")), null, 2));
