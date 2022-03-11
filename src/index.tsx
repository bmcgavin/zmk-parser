import React from "react";
import ReactDOM from "react-dom";
import './index.css';
import { ParserComponent } from "./ui";

ReactDOM.render(
    <React.StrictMode>
        <ParserComponent languagePath="./tree-sitter-devicetree.wasm"/>
    </React.StrictMode>,
    document.getElementById('parser')
)