import React, { useState } from 'react';
import { Combo, Layer } from 'src/devicetree/types';
import { LayerKey } from '../Parser/Parser';

import { LayerComponent } from './LayerComponent';

type Layers = {
    onSelectedKeysChange:any,
    onOutputChange: any,
    selectedKeys: LayerKey[],
    layers: Layer[],
    columns: number[],
    rows: number,
    keymapOrCombo: string,
    combos: Combo[],
    onCombosChange: any,
    onLayersChange: any
}
export const LayersComponent: React.FC<Layers> = ({onSelectedKeysChange, onOutputChange, selectedKeys, layers, columns, rows, keymapOrCombo, combos, onCombosChange, onLayersChange}: Layers) => {
    
    if (layers.length == 0) {
        return <></>
    }
    const initialState = {
        activeLayer: layers[0].name,
    }
    const [state, setState] = useState(initialState)

    const setLayer = (name: string) => {
        setState({...state, activeLayer: name})
    }

    const newLayer = () => {
        if (layers.length < 1) {
            return
        }
        let layer = {
            name: "new_layer",
            bindings: layers[0].bindings.map(binding => {
                let b = {index: binding.index, output: "&trans"}
                return b
            })
        }
        
        layers.push(layer)
        onLayersChange(layers)
        setState({activeLayer: layer.name})
    }

    const copyLayer = async () => {
        // console.log("copyLayer")
        let e = document.getElementById("renderedKeymap") as HTMLInputElement
        if (e === null) {
            return
        }
        await navigator.clipboard.writeText(e.value)
        // console.log("copied!")
    }

    const [editing, setEditing] = useState(false)
    const renameLayer = (index: number) => {
        // console.log("rename layer")
        setInputValue(layers[index].name)
        setEditing(true)
    }

    const [inputValue, setInputValue] = useState("")
    const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }
    const onKeyUpHandler = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.code == "Enter") {
            layers[index].name=inputValue
            onLayersChange(layers)
            setEditing(false)
        }

    }

    const deleteLayer = (index: number) => {
        if (state.activeLayer == layers[index].name) {
            setState({activeLayer: ""})
        } else {
            setState({activeLayer: state.activeLayer})
        }
        layers.splice(index, 1)
        onLayersChange(layers)

    }

    const toString = (): string => {
        let dtsi = "/ {\n"
        dtsi += "  keymap {\n    compatible = \"zmk,keymap\";\n" + layers.map(layer => {
            return "    "+layer.name + " {\n      bindings = <\n        " + layer.bindings.map(binding => {
                return binding.output
            }).join(" ") + "\n      >;\n    };\n"
        }).join("\n")
        dtsi += "  };\n"
        dtsi += "\n  combos {\n    compatible = \"zmk,combos\";\n" + combos.map(combo => {
            return "    "+combo.name + "{\n" +
                "      timeout-ms = <"+combo.timeout+">;\n" +
                "      bindings = <"+combo.bindings.map(binding => {return binding.output}).join(" ")+">;\n" +
                "      key-positions = <"+combo.positions.map(position => {return position}).join(" ")+">;\n" +
                "    };\n"
        }).join("\n")
        dtsi += "  };\n"
        dtsi += "};"
        // console.log(dtsi)
        return dtsi
    }

    const downloadBlob = (filename: string, content: string): void => {
        let blob = new Blob([content], { type: 'text/text' })
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("style", "display: none")
        var blobUrl = URL.createObjectURL(blob);
        a.href =  blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href)
        a.remove();
    }

    return (
        <>
        <div><button onClick={() => downloadBlob("generated.keymap", toString())}>Stringify</button></div>
        <div>Layers</div>
        <ul className="vertical-tab-list">
        {layers.map((layer, index) => {
            let className = "vertical-tab"
            let layerElement = <></>
            // console.log(editing)
            if (layer.name == state.activeLayer) {
                className += " activeLayer" 
            }
            if (layer.name == state.activeLayer && editing) {
                // console.log("edit")
                layerElement = <input key={layer.name} autoFocus className={className} type="text" value={inputValue} onChange={onChangeHandler} onKeyUp={(event) => onKeyUpHandler(event, index)}></input>    
            } else {
                layerElement = <li key={layer.name} className={className} onClick={() => setLayer(layer.name)}>{layer.name}<div className="right"><a onClick={copyLayer}>📋</a><a onClick={() => renameLayer(index)}>📝</a><a onClick={() => deleteLayer(index)}>❌</a></div></li>
            }
            
            // console.log(layerElement)
            return layerElement
        })}
        <li key="create_new_layer" className="vertical-tab" onClick={() => newLayer()}>New layer</li>
        </ul>
        {layers.map((layer, index) => {
            if (layer.name == state.activeLayer) {
                return <LayerComponent 
                    onSelectedKeysChange={onSelectedKeysChange}
                    onOutputChange={onOutputChange}
                    layer={index}
                    selectedKeys={selectedKeys}
                    columns={columns}
                    rows={rows}
                    key={layer.name+"_"+index}
                    name={layer.name}
                    bindings={layer.bindings}
                    keymapOrCombo={keymapOrCombo}
                    layerCount={layers.length}
                    combos={combos}
                    onCombosChange={onCombosChange}/>
            }
        })}
    </>
    )
}


