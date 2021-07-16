import React from 'react';

import parse from '../../devicetree';

const ParserComponent: React.FC = (props) => {
  const code = "/ { keymap { compatible = \"zmk,keymap\"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = \"zmk,combos\"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; ";
  
  return <div>{JSON.stringify(parse(code), null, 2)}</div>
}

export default ParserComponent;