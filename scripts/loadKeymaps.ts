
const fs = require('fs')
const path = require('path')

const keymapsDir = '../lib/keymaps'

type Layout = {
  columns: number[],
  rows: number
}
let layouts: {[name: string]: Layout} = {
  "a_dux": {
    columns: [10, 10, 10, 4],
    rows: 4
  },

}
type Keymap = {
  name: String
  layout: Layout
  keymap: String
}
let keymaps: Keymap[] = []

const paths = fs.readdirSync(keymapsDir).map((filename: String) => {
  const name = path.basename(filename).replace(".keymap","")
  keymaps.push({
    name: name,
    layout: layouts[name] ? layouts[name] : {columns: [], rows: 0},
    keymap: fs.readFileSync(path.join(keymapsDir, filename), 'utf8')
  })
})

fs.writeFile('../src/static.ts', "export const staticKeymaps: String = `"+JSON.stringify(keymaps, null, 2).replace(/`/g, '\\`')+"`;", (err: Error) => {
  if (err) {
    console.log(err)
    return
  }
})

