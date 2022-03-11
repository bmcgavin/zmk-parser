import { ParserComponent, ParserInputs } from '../ParserComponent'

import React from 'react';

import { render, fireEvent, waitFor, getByTestId } from "@testing-library/react";

function renderParser(props: Partial<ParserInputs> = {}) {
  const defaultProps: ParserInputs = {
   onKeymapChange: () => {},
   onLayoutChange: () => {},
   keymap: "",
   rows: 0,
   columns: [],
   parseError: ""
  }
  return render(<ParserComponent {...defaultProps} {...props}/>);
}

describe("<ParserComponent>", () => {
  test('onLayoutChange rows', async () => {
    const onLayoutChange = jest.fn()
    const { findByTestId } = renderParser({onLayoutChange});
    const rowsInput = await findByTestId("rows-input"); 
    const columnsInputs = []

    fireEvent.change(rowsInput, {target:{value:1}})
    expect(onLayoutChange).toHaveBeenCalledWith(1, [0])
  })

  test('onLayoutChange columns,', async () => {
    const onLayoutChange = jest.fn()
    const { findByTestId } = renderParser({onLayoutChange, rows: 1});
    const columnsInputs = []
    columnsInputs.push(await findByTestId("columns-0-input"))

    fireEvent.change(columnsInputs[0], {target:{value:1}})
    expect(onLayoutChange).toHaveBeenCalledWith(1, [1])
  })

})
