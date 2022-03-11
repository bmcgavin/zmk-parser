import React, { useEffect } from 'react';
// import { sanitise } from '../../sanitiser';
import { Document, KeymapParser } from '../../tree-sitter';

import { Dtsi, Binding, Layer } from 'src/devicetree/types';

import { CombosComponent } from '../Dtsi/CombosComponent';
import { KeymapComponent } from '../Dtsi/KeymapComponent';
import { ParserComponent } from './ParserComponent';
import { Tree } from 'web-tree-sitter'

export type LayerKey = {
  layer: number
  key: number
}

const initialLayerKeys: LayerKey[] = []

export interface Props {
  languagePath: string
}
export type State = {
  activeTab: string;
  keymap: string;
  dtsi: Dtsi | undefined;
  parseError: string;
  selectedKeys: LayerKey[],
  columns: number[],
  rows: number,
  tree: Tree | undefined
};

export const initialState: State = {
  activeTab: "parser",
  keymap: "",
  dtsi: undefined,
  parseError: "",
  selectedKeys: initialLayerKeys,
  columns:[],
  rows: 0,
  tree: undefined
}

export default class ParserApp extends React.Component<Props, State> {

  async init(languagePath: string): Promise<KeymapParser> {
    const kp = await KeymapParser.init(languagePath);
    return kp

  }
  parser: Promise<KeymapParser>
  constructor(props: Props) {
    super(props);
    this.parser = this.init(props.languagePath).then((p) => {
      return p
    })
    this.state = initialState
    this.handleSelectedKeysChange = this.handleSelectedKeysChange.bind(this)
    this.handleOutputChange = this.handleOutputChange.bind(this)
    this.handleLayoutChange = this.handleLayoutChange.bind(this)
    this.handleKeymapChange = this.handleKeymapChange.bind(this)
  }

  handleOutputChange(binding: Binding, layer: number) {
    // console.log("handleOutputChange")
    // console.log(binding)
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
    }
    //, () => console.log(selectedKeys)
    )
  }

  handleLayoutChange(rows: number, columns: number[]) {
    this.setState({
      rows, columns
    }
    //, () => console.log(columns)
    )
  }

  handleKeymapChange(keymap: string, rows: number, columns: number[]) {
    // console.log(keymap)
    this.setState({keymap, rows, columns}, () => {
      this.parseKeymap()
    })
  }

  // Removed this because of the unmounted component warning
  //  but also it's no longer needed (hangover from pre-populated
  //  keymap textarea for testing)
  // componentDidMount() {
  //   this.parseKeymap()
  // }

  parseKeymap = (): void => {
    // console.log("parseKeymap")
    this.parser.then(
      parser => {
        this.setState((previousState: State) =>{
          const state = {
            ...previousState,
            parseError: "",
          }
          try {
            state.tree = parser.parse(new Document(this.state.keymap))
          } catch (e) {
            state.parseError = e
          }
          if (typeof(state.tree) != "undefined") {
            state.dtsi = parser.getDtsi(state.tree)
          }
          return state
        }, () => {
          // console.log(this.state.dtsi)
        })
      }
    )
  }

  setPage =(name: string): void => {
    this.setState({activeTab: name})
  }

  /*
/ { keymap { compatible = "zmk,keymap"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = "zmk,combos"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; 
  */
  render() {
    
    const dtsi = this.state.dtsi

    let keymapComponent = <></>
    if (dtsi !== undefined && dtsi.keymap !== undefined) {
      keymapComponent = <KeymapComponent
        data-testid="keymap"
        onSelectedKeysChange={this.handleSelectedKeysChange}
        onOutputChange={this.handleOutputChange}
        selectedKeys={this.state.selectedKeys}
        layers={dtsi.keymap.layers}
        columns={this.state.columns}
        rows={this.state.columns?.length}/>
    }
    let combosComponent = <></>
    if (dtsi !== undefined && dtsi.keymap !== undefined && dtsi.combos !== undefined) {
      combosComponent = (
        <CombosComponent
          data-testid="combos"
          onSelectedKeysChange={this.handleSelectedKeysChange}
          selectedKeys={this.state.selectedKeys}
          layerCount={dtsi.keymap.layers.length}
          combos={dtsi.combos.combos}/>
      )
    }

    let parserComponent = (
      <ParserComponent
        data-testid="parser"
        onKeymapChange={this.handleKeymapChange}
        onLayoutChange={this.handleLayoutChange}
        keymap={this.state.keymap}
        rows={this.state.rows}
        columns={this.state.columns}
        parseError={this.state.parseError}/>
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