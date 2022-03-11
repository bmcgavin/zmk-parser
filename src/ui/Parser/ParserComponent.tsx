import React, { useCallback } from "react";

import { staticKeymaps } from '../../static/static';

export type ParserInputs = {
  onKeymapChange: any
  onLayoutChange: any
  keymap: string
  rows: number
  columns: number[]
  parseError: string
}

type StaticKeymap = {
  name: string
  columns: number[],
  keymap: string
}

export const ParserComponent: React.FC<ParserInputs> = ({onKeymapChange, onLayoutChange, keymap, rows, columns, parseError}: ParserInputs) => {
    
  const keymaps = JSON.parse(staticKeymaps)

  const onRowsChange = (inputRows: string) => {
    let newColumns = columns
    let newRows = Number(inputRows)
    if (newRows < rows) {
      newColumns = newColumns.slice(0, newRows)
    } else if (newRows > rows) {
      for (let i = rows; i< newRows; i++) {
        newColumns = newColumns.concat([0])
      }
    }
    handleLayoutUpdate(newRows, newColumns)
  }
  const onColumnChange = (inputColumnForRow: string, row: number) => {
    let columnForRow = Number(inputColumnForRow)
    let newColumns = columns.slice(0, row)
    newColumns.push(columnForRow)
    newColumns.push(...columns.slice(row+1, columns.length))
    handleLayoutUpdate(rows, newColumns)
  }
  const handleLayoutUpdate = useCallback((rows, columns) => {
    onLayoutChange(rows, columns)
  },
  [])
  
  const selectLayout = (event:React.ChangeEvent<HTMLSelectElement>): void => {
    let idx = event.target.selectedIndex
    let newKeymap = keymaps[idx-1]
    handleKeymapUpdate(newKeymap.keymap, newKeymap.columns.length, newKeymap.columns)
  }

  const handleKeymapUpdate = useCallback((keymap, rows, columns) => {
    onKeymapChange(keymap, rows, columns)
  },
  [])
  
  let parseErrorComponent = <></>
  if (parseError !== "") {
    parseErrorComponent = (
      <div className="parseError">
        {parseError}
      </div>
    )
  }
  let columnInputs = []
  for (let row = 0; row < rows;row++) {
    const col = columns[row] == undefined ? 0 : columns[row]
    columnInputs.push(
      <div key={"columnsFor"+row}>Columns for {row}:
        <input data-testid={"columns-"+row+"-input"} type="number" value={col} name="columnsFor{row}" onChange={(event) => onColumnChange(event.target.value, row)}></input>
      </div>
    )
  }

  const staticKeymapsInputComponent = (
    keymaps.map((keymap: StaticKeymap, index: number) => {
      return <option key={keymap.name} value={index}>{keymap.name}</option>
    })
  )    
  
  return <div>
    <label htmlFor="keymap">Paste your keymap here:</label><br/>
    <textarea data-testid="keymap-textarea" id="keymap" name="keymap" onChange={(event) => handleKeymapUpdate(event.target.value, rows, columns)} value={keymap}></textarea>
    {parseErrorComponent}
    <div>Rows:
      <input data-testid="rows-input" type="number" name="rows" 
        value={rows} 
        onChange={(event) => onRowsChange(event.target.value)}>
      </input>
    </div>
    {columnInputs}
    <select data-testid="layout-select" onChange={selectLayout}>
      <option value="">Or select a default keymap</option>
      {staticKeymapsInputComponent}
    </select>
  </div>
}