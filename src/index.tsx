import React from "react";
import ReactDOM from "react-dom";
// import * as serviceWorker from './serviceworker'
import { ParserComponent } from "./ui";

ReactDOM.render(
    <React.StrictMode>
        <ParserComponent />
    </React.StrictMode>,
    document.getElementById('parser')
)