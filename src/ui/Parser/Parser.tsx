import React, { Fragment } from 'react';
import { sanitise } from '../../sanitiser';

import { parse, Dtsi } from '../../devicetree'

import { initialLily58Keymap, initialFerrisKeymap} from '../../../test';
import { Binding, Layer } from 'src/devicetree/types';
import { CombosComponent } from '../Dtsi/CombosComponent';
import { KeymapComponent } from '../Dtsi/KeymapComponent';
import { LayerComponent } from '../Dtsi/LayerComponent';

export type LayerKey = {
  layer: number
  key: number
}

const initialLayerKeys: LayerKey[] = []

type Props = {}
export type State = {
  activeTab: string;
  keymap: string;
  dtsi: Dtsi | undefined;
  parseError: string | undefined;
  selectedKeys: LayerKey[]
};

export const initialState: State = {
  activeTab: "parser",
  // keymap: initialFerrisKeymap,
  keymap: initialLily58Keymap,
  dtsi: undefined,
  parseError: undefined,
  selectedKeys: initialLayerKeys
}

export default class ParserApp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = initialState
    this.handleSelectedKeysChange = this.handleSelectedKeysChange.bind(this)
    this.handleOutputChange = this.handleOutputChange.bind(this)
  }

  handleOutputChange(binding: Binding, layer: number) {
    console.log("handleOutputChange")
    console.log(binding)
    if (this.state.dtsi?.keymap?.layers[layer] === undefined) {
      return
    }
    let bindings = this.state.dtsi.keymap.layers[layer].bindings
    const index = bindings.findIndex((b: Binding) => b.index === binding.index)
    if (index === -1) {
      return
    }
    bindings = [...bindings.slice(0, index), binding, ...bindings.slice(index + 1)]
    let layers = this.state.dtsi.keymap.layers
    const newLayer: Layer = {
      name: layers[layer].name,
      bindings: bindings
    }
    layers = [...layers.slice(0, layer), newLayer, ...layers.slice(layer + 1)]
    const keymap = {
      ...this.state.dtsi.keymap,
      layers: layers
    }
    const dtsi = {
      ...this.state.dtsi,
      keymap: keymap 
    }
    
    this.setState({dtsi})
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

  setPage =(name: string): void => {
    this.setState({activeTab: name})
  }

  /*
/ { keymap { compatible = "zmk,keymap"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = "zmk,combos"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; 
  */
  render() {
    
    const dtsi = this.state.dtsi
    const parseError = this.state.parseError

    let keymapComponent = <></>
    if (dtsi !== undefined && dtsi.keymap !== undefined) {
      keymapComponent = <KeymapComponent
        onSelectedKeysChange={this.handleSelectedKeysChange}
        onOutputChange={this.handleOutputChange}
        selectedKeys={this.state.selectedKeys}
        layers={dtsi.keymap.layers}/>
    }
    let combosComponent = <></>
    if (dtsi !== undefined && dtsi.keymap !== undefined && dtsi.combos !== undefined) {
      combosComponent = (
        <>
          <CombosComponent
            onSelectedKeysChange={this.handleSelectedKeysChange}
            selectedKeys={this.state.selectedKeys}
            layerCount={dtsi.keymap.layers.length}
            combos={dtsi.combos.combos}/>
          
        </>
      )
    }
    let parseErrorComponent = <></>
    if (parseError !== "") {
      parseErrorComponent = (
        <div className="parseError">
          {parseError}
        </div>
      )
    }
    let parserComponent = (
      <Fragment>
        <label htmlFor="keymap">Paste your keymap here:</label><br/>
        <textarea id="keymap" name="keymap" onChange={this.onChange} value={this.state.keymap}></textarea>
        {parseErrorComponent}
      </Fragment>
    )
    let page = parserComponent
    switch (this.state.activeTab) {
      case "keymap":
        page = keymapComponent
        break
      case "combos":
        page = combosComponent
        break
    }

    return <div className="Parser">
      <header className="Parser-header">
        <h3>ZMK Parser</h3>
      </header>
      <ul className="tab-list">
        <li className="tab" onClick={() => this.setPage("parser")}>
          Parser
        </li>
        <li className="tab" onClick={() => this.setPage("keymap")}>
          Keymap
        </li>
        <li className="tab" onClick={() => this.setPage("combos")}>
          Combos
        </li>
      </ul>
      {page}
      
    </div>
  }
}