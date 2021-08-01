import { parse } from '../src/devicetree';
import { sanitise } from '../src/sanitiser';

function example(code: string) {
  console.log(JSON.stringify(parse(code), null, 2));
}

//example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; ");
//example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");
//example("/ { combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; };");
//example("/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; };");



// console.log(JSON.stringify(parse(sanitise(`
// #include <behaviors.dtsi>

// #define LCAG(keycode) APPLY_MODS(MOD_LCTL, APPLY_MODS(MOD_LALT, APPLY_MODS(MOD_LGUI, keycode)))

// //todo :
// / {
//     /**
//      * Let's talk about combos and nongreedy regex
//      */
//     combos {
//       compatible = \"zmk,combos\";
//       combo_f1 {
//         slow-release;
//         timeout-ms = <50>;
//         key-positions = <13 25>;
//         bindings = <&kp F1>;
//         layers = <1>;
//       };
//     };
//     /**
//      * Let's talk about keymaps for a while
//      */
//     keymap {
//       compatible = \"zmk,keymap\";
//       default_layer {
//         bindings = < &trans >;
//       };
//       raise_layer {
//         bindings = < &kp N2 &kp N3 &bt SEL 0 >;
//       };
//     };
// }; 
// `))
// , null, 2))


const initialKeymap = `#include <behaviors.dtsi>

#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>
#include <dt-bindings/zmk/ext_power.h>

#define LCAG(keycode) APPLY_MODS(MOD_LCTL, APPLY_MODS(MOD_LALT, APPLY_MODS(MOD_LGUI, keycode)))

//todo :
// shifted keys
// emulate CAG on lower
// mo(ctl,esc) not working
// raise - => =
// raise shift - => +
// insert
// prsc
// =## 
/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
// -------------------------------------------------------------------------------------------------------------------
// |  \`          |  1  |  2  |  3   |  4   |  5   |                   |  6   |  7    |  8    |  9   |   0   |   -   |
// |  TAB         |  Q  |  W  |  E   |  R   |  T   |                   |  Y   |  U    |  I    |  O   |   P   |   \   |
// |  MO(CTL,ESC) |  A  |  S  |  D   |  F   |  G   |                   |  H   |  J    |  K    |  L   |   ;   |   '   |
// | SHIFT        |  Z  |  X  |  C   |  V   |  B   |   "["  |  |  "]"  |  N   |  M    |  ,    |  .   |   /   | SHIFT |
//                            | ALT  | GUI  | LWR  | SPACE  |  | ENTER | RAISE| BSPC  | CTL   |
      bindings = <
&kp     GRAV     &kp N1    &kp N2    &kp N3    &kp N4    &kp N5                       &kp N6    &kp N7    &kp N8    &kp N9    &kp N0    &kp MINUS
&kp     TAB      &kp Q     &kp W     &kp E     &kp R     &kp T                        &kp Y     &kp U     &kp I     &kp O     &kp P     &kp BSLH
&mt LCTL ESC     &kp A     &kp S     &kp D     &kp F     &kp G                        &kp H     &kp J     &kp K     &kp L     &kp SCLN  &kp QUOT
&kp     LSFT     &kp Z     &kp X     &kp C     &kp V     &kp B   &kp LBKT  &kp RBKT   &kp N     &kp M     &kp CMMA  &kp DOT   &kp FSLH  &kp RSFT
                                      &kp LALT  &kp LGUI  &mo 1   &kp SPC   &kp RET    &mo 2     &kp BKSP  &kp RCTL
      >;
    };

    lower_layer {
// --------------------------------------------------------------------------------------------------------------------------------
// |  btclr | bt0    | bt1    | bt2    | bt3    | EP_0 |                        |  F1    |  F2   |  F3     |  F4  |  F5   |  F6   |
// |  V-    | V+     | CAG(W) |        |        | EP_1 |                        |  F7    |  F8   |  F9     |  F10 |  F11  |  F12  |
// |  ESC   | CAG(A) | CAG(S) | CAG(D) | CAG(F) | EP_T |                        |        |       |  CAG(K) |      |       |   ~   |
// |  P/P   | CAG(Z) | CAG(X) | CAG(C) | CAG(V) |      |          |  |          | CAG(N) |  _    |  +      |  {   |   }   |   \   |
//                            | PREV   | NEXT   |      | CS(ESC)  |  | CAG(RET) |  ADJ   |       |
      bindings = <
&bt BT_CLR   &bt BT_SEL 0  &bt BT_SEL 1 &bt BT_SEL 2 &bt BT_SEL 3 &ext_power EP_OFF                                &kp F1      &kp F2    &kp F3      &kp F4    &kp F5     &kp F6
&kp K_VOL_DN &kp K_VOL_UP  &kp LCAG(W)  &trans       &trans       &ext_power EP_ON                                 &kp F7      &kp F8    &kp F9      &kp F10   &kp F11    &kp F12
&kp ESC      &kp LCAG(A)   &kp LCAG(S)  &kp LCAG(D)  &kp LCAG(F)  &ext_power EP_TOG                                &trans      &trans    &kp LCAG(K) &trans    &trans     &kp TILD
&kp K_PP     &kp LCAG(Z)   &kp LCAG(X)  &kp LCAG(C)  &kp LCAG(V)  &trans           &trans            &trans        &kp LCAG(N) &kp MINUS &kp EQL     &kp LBKT  &kp RBKT   &kp NON_US_BSLH
                                        &kp K_PREV   &kp K_NEXT   &trans           &kp LC(LS(ESC))   &kp LCAG(RET) &mo 3       &trans    &trans
      >;
    };

    raise_layer {
// ---------------------------------------------------------------------------------------------------------------
// | F1  |  F2  |  F3  |  1   |  2  |  3  |                   |  btclr   | EP_0  | EP_1  | EP_T |       |   =  |
// | F4  |  F5  |  F6  |  4   |  5  |  6  |                   |  HOME    | PGDN  | PGUP  | END  | PRSC  | INS  |
// | F7  |  F8  |  F9  |  7   |  8  |  9  |                   |  <-      |   v   |  ^    |  ->  |       |      |
// | F10 |  F11 |  F12 |  0   |  *  |  -  |                   |  +       |   =   |   [   |  ]   |       |      |
//                     |      |     | ADJ |        |  |       |          | DEL   |       |
      bindings = <
&trans   &trans    &trans    &kp N1   &kp N2     &kp N3                       &bt BT_CLR &ext_power EP_OFF &ext_power EP_ON  &ext_power EP_TOG &trans    &kp EQL
&trans   &trans    &trans    &kp N4   &kp N5     &kp N6                       &kp HOME   &kp PGDN          &kp PGUP          &kp END           &kp PRSC  &kp INS
&kp F1   &kp F2    &kp F3    &kp N7   &kp N8     &kp N9                       &kp LARW   &kp DARW          &kp UARW          &kp RARW          &trans    &trans
&kp F7   &kp F8    &kp F9    &kp N0   &kp LS(N8) &kp MINUS   &trans   &trans  &kp PLUS   &kp EQL           &kp LBKT          &kp RBKT          &trans    &trans
                    &trans    &trans   &mo 3      &trans                       &trans     &trans            &kp DEL           &trans
      >;
    };
          adjust_layer {
// ---------------------------------------------------------------------------------------------------------------
// |       |     |     |      |      |      |                   |         |        |        |         |       |      |
// |       |     |     |      |      |      |                   |         |        |        |         |       |      |
// |       |     |     |      |      |      |                   | CAG(<-) | CAG(v) | CAG(^) | CAG(->) |       |      |
// |       |     |     |      |      |      |        |  |       |         |        |        |         |       |      |
//                     |      |      |      |        |  |       |         |        |        |
      bindings = <
&trans   &trans    &trans    &trans    &trans    &trans                       &trans         &trans         &trans         &trans         &trans    &trans
&trans   &trans    &trans    &trans    &trans    &trans                       &trans         &trans         &trans         &trans         &trans    &trans
&trans   &trans    &trans    &trans    &trans    &trans                       &kp LCAG(LARW) &kp LCAG(DARW) &kp LCAG(UARW) &kp LCAG(RARW) &trans    &trans
&trans   &trans    &trans    &trans    &trans    &trans    &trans   &trans    &trans         &trans         &trans         &trans         &trans    &trans
                    &trans    &trans    &trans    &trans                       &trans         &trans         &trans         &trans
      >;
    };
  };
    combos {
        compatible = "zmk,combos";
        combo_n1 {
            timeout-ms = <50>;
            key-positions = <13 25>; //q a
            bindings = <&kp N1>;
        };
    };
};
`
export default initialKeymap;
