import React, { Fragment } from 'react';
// import { sanitise } from '../../sanitiser';
import { Document, KeymapParser } from '../../tree-sitter';

import { Dtsi } from '../../devicetree'

import { Binding, Layer } from 'src/devicetree/types';
import { CombosComponent } from '../Dtsi/CombosComponent';
import { KeymapComponent } from '../Dtsi/KeymapComponent';
import { staticKeymaps } from '../../static/static';
import { SyntaxNode, Tree, Language } from 'web-tree-sitter'

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
  selectedKeys: LayerKey[],
  columns: number[],
  rows: number,
  keymaps: Keymap[],
  tree: Tree | undefined
};

export const initialState: State = {
  activeTab: "parser",
  keymap: "",
  dtsi: undefined,
  parseError: undefined,
  selectedKeys: initialLayerKeys,
  columns:[],
  rows: 0,
  keymaps: JSON.parse(staticKeymaps),
  tree: undefined
}

type Keymap = {
  name: string
  columns: number[],
  keymap: string
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
    const pP = Promise.resolve(this.init())
    this.parser = pP.then((p) => {
      this.language = p.getLanguage()
      return p
    })
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
            this.getDtsi(state.tree)
          }
          return state
        }, () => {
        })
      }
    )
    
  }

  getDtsi = (tree: Tree): Dtsi => {
    const dtsi: Dtsi = {
      keymap: undefined,
      combos: undefined
    }
    console.log("getDtsi")
    console.log(tree.rootNode.toString())
    const bindingsQuery = this.language?.query(`(document (node (node name: (identifier) @node (#match? @node "^keymap$") (node (property name: (identifier) value: (integer_cells) @bindings)))))`)
    if (bindingsQuery) {
      const bindings = bindingsQuery.captures(tree.rootNode)
      console.log(bindings)
      const args = `[(identifier) (integer_literal) (call_expression)]`
      const one = `((reference label: (identifier)) ${args}) @one`
      const two = `((reference label: (identifier)) ${args} . ${args}) @two`
      const either = `(reference label: (identifier)) @reference`
      const trans = `(reference label: (identifier)) @trans (#match? @trans "^&trans")`
      const notTrans = `(reference label: (identifier)) @other (#not-match? @other "^&trans") ${args}+`
      // const queryString = `[(${notTrans}) (${trans})]`
      // const queryString = `((reference) @reference (#match? @reference "^&") . (identifier) @binding (#not-match? @binding "^&"))`
      const queryString = `[(${either}) (${either} . ${args} @arg1 . ${args}? @arg2)]`
      console.log(queryString)
      const keycodesQuery = this.language?.query(queryString)
      
      if (keycodesQuery) {
        bindings.forEach(binding => {
          const keycodes = keycodesQuery.captures(binding.node)
          console.log(keycodes)
          keycodes.forEach(keycode => {
            console.log(`${keycode.name} ${keycode.node.text}`)
            switch(keycode.node.text) {
              case "&kp":

              case "&trans":

              case "&mo":

              case "&ext_power":

              case "&bt":

            }
          })
        })
      }
    }
    return dtsi

  }

  onChange = (e: React.FormEvent<HTMLTextAreaElement>): void => {
    this.setState({ keymap: e.currentTarget.value }, () => {
      // console.log("onChange")
      // console.log(this.state.keymap)
      this.parseKeymap()
    });
  };


  onLayoutChange = (event:React.ChangeEvent<HTMLInputElement>, row: number): void => {
    const newCol:number[] = this.state.columns.map((v: number, k: number): number => {if (k==row) {return Number(event.target.value)} return v})
    this.setState({...this.state,columns: newCol})
  }

  selectLayout = (event:React.ChangeEvent<HTMLSelectElement>): void => {
    let idx = event.target.selectedIndex
    let keymap = this.state.keymaps[idx-1]
    this.setState({
      ...this.state,
      rows: keymap.columns.length,
      columns: keymap.columns,
      keymap: keymap.keymap
    }, this.parseKeymap)
  }

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
        layers={dtsi.keymap.layers}
        columns={this.state.columns}
        rows={this.state.columns.length}/>
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
    let columnInputs = []
    {for (let row = 0; row < this.state.rows;row++) {
        columnInputs.push(
          <div key={"columnsFor"+row}>Columns for {row}:
            <input type="number" value={this.state.columns[row]} name="columnsFor{row}" onChange={(event) => this.onLayoutChange(event, row)}></input>
          </div>
        )
    }}

    const staticKeymapsInputComponent = (
      this.state.keymaps.map((keymap: Keymap, index: number) => {
        return <option key={keymap.name} value={index}>{keymap.name}</option>
      })
    )
    

    let parserComponent = (
      <Fragment>
        <label htmlFor="keymap">Paste your keymap here:</label><br/>
        <textarea id="keymap" name="keymap" onChange={this.onChange} value={this.state.keymap}></textarea>
        {parseErrorComponent}
        <div>Rows:
          <input type="number" name="rows" 
            value={this.state.rows} 
            onChange={(event) => {this.setState({...this.state,rows:Number(event.target.value)})}}>
          </input>
        </div>
        {columnInputs}
        <select onChange={this.selectLayout}>
          <option value="romac">Or select a default keymap</option>
          {staticKeymapsInputComponent}
        </select>
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