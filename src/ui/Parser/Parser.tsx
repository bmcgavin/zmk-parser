import React, { Fragment } from 'react';
import { sanitise } from '../../sanitiser';

import { parse, Dtsi } from '../../devicetree'
import { DtsiComponent } from '../Dtsi/DtsiComponent';

import { initialLily58Keymap, initialFerrisKeymap} from '../../../test';

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

  setParserPage =(e: React.MouseEvent<HTMLLIElement>): void => {
    this.setState({activeTab: "parser"})
  }

  setDtsiPage = (e: React.MouseEvent<HTMLLIElement>): void => {
    this.setState({activeTab: "dtsi"})
  }

  /*
/ { keymap { compatible = "zmk,keymap"; default_layer { bindings = < &trans >; }; raise_layer { bindings = < &kp N2 &kp N3 &bt SEL 0 >; }; }; combos { compatible = "zmk,combos"; combo_f1 { slow-release; timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp F1>; layers = <1>; }; combo_n1 { timeout-ms = <50>; key-positions = <13 25>; bindings = <&kp N1>; }; }; }; 
  */
  render() {
    
    const dtsi = this.state.dtsi
    const parseError = this.state.parseError

    let dtsiComponent = <></>
    if (dtsi !== undefined) {
      dtsiComponent = <div>DTSI: <DtsiComponent onSelectedKeysChange={this.handleSelectedKeysChange} selectedKeys={this.state.selectedKeys} combos={dtsi.combos} keymap={dtsi.keymap}></DtsiComponent></div>
    }
    let parseErrorComponent = <></>
    if (parseError !== "") {
      parseErrorComponent = (
        <div>
          parse error: {parseError}
        </div>
      )
    }
    let parserComponent = (
      <Fragment>
        <label htmlFor="keymap">Paste your keymap here:</label>
        <textarea id="keymap" name="keymap" onChange={this.onChange} value={this.state.keymap}></textarea>
        {parseErrorComponent}
      </Fragment>
    )
    let page = parserComponent
    if (this.state.activeTab == "dtsi") {
      page = dtsiComponent
    }

    return <div className="Parser">
      <header className="Parser-header">
        <h3>ZMK Parser</h3>
      </header>
      <ul className="tab-list">
        <li className="tab" onClick={this.setParserPage}>
          Parser
        </li>
        <li className="tab" onClick={this.setDtsiPage}>
          DTSI
        </li>
      </ul>
      {page}
      
    </div>
  }
}