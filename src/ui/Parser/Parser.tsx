import React from 'react';
import { sanitise } from '../../sanitiser';

import { parse, Dtsi } from '../../devicetree'
import { DtsiComponent } from '../Dtsi/DtsiComponent';

import initialKeymap from '../../../test';

export type LayerKey = {
  layer: number[]
  key: number[]
}

const initialLayerKeys: LayerKey[] = []

type Props = {}
export type State = {
  keymap: string;
  dtsi: Dtsi | undefined;
  parseError: string | undefined;
  selectedKeys: LayerKey[]
};

export const initialState: State = {
  keymap: initialKeymap,
  dtsi: undefined,
  parseError: undefined,
  selectedKeys: initialLayerKeys
}

export default class ParserApp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = initialState
    this.handleSelectedKeysChange = this.handleSelectedKeysChange.bind(this)
  }

  handleSelectedKeysChange(selectedKeys: LayerKey[]) {
    this.setState({
      selectedKeys: selectedKeys
    }, () => console.log(selectedKeys))
  }

  componentDidMount() {
    this.parseKeymap()
  }

  parseKeymap = (): void => {
    console.log("parseKeymap")
    this.setState((previousState: State) =>{
      const state = {
        ...previousState,
        parseError: "",
      }
      try {
        // console.log("KM")
        // console.log(this.state.keymap)
        // console.log("KMS")
        // console.log(sanitise(this.state.keymap))
        state.dtsi = parse(sanitise(this.state.keymap)) as Dtsi
      } catch (e) {
        // console.log("e")
        // console.log(e)
        state.parseError = e
      }
      return state
    }, () => {
      // console.log(this.state.dtsi);
      // console.log(this.state.parseError)
    })
  }

  onChange = (e: React.FormEvent<HTMLTextAreaElement>): void => {
    this.setState({ keymap: e.currentTarget.value }, () => {
      // console.log("onChange")
      // console.log(this.state.keymap)
      this.parseKeymap()
    });
    
    
  };

  /*
/ { keymap { compatible = "zmk,keymap"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = "zmk,combos"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; 
  */
  render() {
    
    const dtsi = this.state.dtsi
    const parseError = this.state.parseError

    let dtsiComponent = <></>
      if (dtsi !== undefined) {
        dtsiComponent = <DtsiComponent onSelectedKeysChange={this.handleSelectedKeysChange} selectedKeys={this.state.selectedKeys} combos={dtsi.combos} keymap={dtsi.keymap}></DtsiComponent>
      }
    return <div className="Parser">
      <header className="Parser-header">
        <h3>ZMK Parser</h3>
      </header>
      <div>
        DTSI: {dtsiComponent}
      </div>
      <textarea name="keymap" onChange={this.onChange} value={this.state.keymap}></textarea>
      <div>
        parseError: {parseError}
      </div>
    </div>
  }
}