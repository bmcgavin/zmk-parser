import parse from '../src/devicetree';
import { sanitise } from '../src/sanitiser';

function example(code: string) {
  console.log(JSON.stringify(parse(code), null, 2));
}

//example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; ");
//example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");
//example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; };");
//example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");



console.log(JSON.stringify(parse(sanitise(`
#include <behaviors.dtsi>

#define LCAG(keycode) APPLY_MODS(MOD_LCTL, APPLY_MODS(MOD_LALT, APPLY_MODS(MOD_LGUI, keycode)))

//todo :
/ {
    /**
     * Let's talk about combos and nongreedy regex
     */
    combos {
      compatible = \"zmk,combos\";
      combo_f1 {
        slow-release;
        timeout-ms = <50>;
        key-positions = <13 25>;
        bindings = <&kp F1>;
        layers = <1>;
      };
    };
    /**
     * Let's talk about keymaps for a while
     */
    keymap {
      compatible = \"zmk,keymap\";
      default_layer {
        bindings = < &trans >;
      };
      raise_layer {
        bindings = < &kp N2 &kp N3 &bt SEL 0 >;
      };
    };
}; 
`))
, null, 2))
