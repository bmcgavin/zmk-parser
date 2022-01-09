import React from 'react';
// import { sanitise } from '../../sanitiser';
import { Document, KeymapParser } from '../../tree-sitter';

import { Dtsi, Binding, Layer, Keymap, Combo, Combos } from 'src/devicetree/types';

import { CombosComponent } from '../Dtsi/CombosComponent';
import { KeymapComponent } from '../Dtsi/KeymapComponent';
import { ParserComponent } from './ParserComponent';
import { Tree, Language } from 'web-tree-sitter'

export type LayerKey = {
  layer: number
  key: number
}

const initialLayerKeys: LayerKey[] = []

export interface Props {}
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

  async init(): Promise<KeymapParser> {
    const kp = await KeymapParser.init();
    return kp

  }
  parser: Promise<KeymapParser>
  language: Language | undefined = undefined
  constructor(props: Props) {
    super(props);
    this.parser = this.init().then((p) => {
      this.language = p.getLanguage()
      return p
    })
    this.state = initialState
    this.handleSelectedKeysChange = this.handleSelectedKeysChange.bind(this)
    this.handleOutputChange = this.handleOutputChange.bind(this)
    this.handleLayoutChange = this.handleLayoutChange.bind(this)
    this.handleKeymapChange = this.handleKeymapChange.bind(this)

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

  handleLayoutChange(rows: number, columns: number[]) {
    this.setState({
      rows, columns
    }, () => console.log(columns))
  }

  handleKeymapChange(keymap: string, rows: number, columns: number[]) {
    console.log(keymap)
    this.setState({keymap, rows, columns}, () => {
      this.parseKeymap()
    })
  }

  componentDidMount() {
    this.parseKeymap()
  }

  parseKeymap = (): void => {
    console.log("parseKeymap")
    this.parser.then(
      parser => {
        this.setState((previousState: State) =>{
          const state = {
            ...previousState,
            parseError: "",
          }
          try {
            const parsed = parser.parse(new Document(this.state.keymap))
            state.tree = parsed
          } catch (e) {
            state.parseError = e
          }
          if (typeof(state.tree) != "undefined") {
            state.dtsi = this.getDtsi(state.tree)
          }
          return state
        }, () => {
          console.log(this.state.dtsi)
        })
      }
    )
    
  }

  getDtsi(tree: Tree): Dtsi {
    const dtsi: Dtsi = {
      keymap: {
        layers: []
      },
      combos: undefined
    }

    // console.log("getDtsi")
    // console.log(tree.rootNode.toString())
    const bindingsQuery = this.language?.query(`(document (node (node name: (identifier) @keymapOrCombo (#match? @keymapOrCombo "^keymap$") (node name: (identifier) @layer (property name: (identifier) @bindingOrSensor (#match? @bindingOrSensor "^bindings$") value: (integer_cells) @bindings)))))`)
    if (bindingsQuery) {
      const bindingsTree = bindingsQuery.captures(tree.rootNode)
      // console.log(bindingsTree)
      const args = `[(identifier) (integer_literal) (call_expression)]`
      const either = `(reference label: (identifier)) @reference`
      const queryString = `[(${either}) (${either} . ${args} @arg1 . ${args}? @arg2)]`
      // console.log(queryString)
      const keycodesQuery = this.language?.query(queryString)
      
      if (keycodesQuery) {
        let layerIndex = -1
        bindingsTree.forEach(capture => {
          // console.log(capture.name+": "+capture.node.text)
          switch (capture.name) {
            case "layer":
              layerIndex++
              let layerName = capture.node.text
              // console.log(layerName)
              if (dtsi.keymap?.layers) {
                dtsi.keymap.layers[layerIndex] = {
                  name: layerName,
                  bindings: []
                }
              }
            case "bindings":
              const keycodes = keycodesQuery.captures(capture.node)
              console.log(keycodes)
              let keyIndex = 0
              keycodes.forEach((keycode, index) => {
                // console.log(`${index} ${keycode.name} ${keycode.node.text}`)
                switch(keycode.name) {
                case "reference":
                  // switch(keycode.node.text) {
                  // case "&kp":
                    let output = keycode.node.text
                    // console.log(keycodes[index+1])
                    if (keycodes[index+1]?.name == "arg1") {
                      // console.log(keycodes[index+1].node.text)
                      output += " "+keycodes[index+1].node.text
                    }
                    // console.log(keycodes[index+2])
                    if (keycodes[index+2]?.name == "arg2") {
                      // console.log(keycodes[index+2].node.text)
                      output += " "+keycodes[index+2].node.text
                    }
                    // console.log(output)
                    dtsi.keymap?.layers[layerIndex].bindings.push({index: keyIndex, output: output})
                  // case "&trans":

                  // case "&mo":
      
                  // case "&ext_power":
      
                  // case "&bt":
                  // }
                  keyIndex++
      
                }
              })
            }
        })
      }
    }
    console.log(dtsi.keymap)
    return dtsi
  
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