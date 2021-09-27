
const fs = require('fs')
const path = require('path')

const keymapsDir = '../../lib/keymaps'

let layouts: {[name: string]: number[]} = {
  "a_dux": [10, 10, 10, 4],
  "bfo9000": [14, 14, 14, 14, 14],
  "boardsource3x4": [4, 4, 4],
  "clueboard_california": [2, 2, 1, 2, 2, 1],
  "corne": [12, 12, 12, 6],
  "cradio": [10, 10, 10, 4],
  "crbn": [12, 12, 12, 12],
  "eek": [10, 10, 10, 6],
  "helix": [12, 12, 12, 14, 14],
  "iris": [12, 12, 12, 14, 6],
  "jian": [14, 12, 12, 6],
  "jorne": [14, 12, 12, 6],
  "kyria": [12, 12, 16, 10],
  "lily58": [12, 12, 12, 14, 8],
  "m60": [14, 14, 13, 12, 8],
  "microdox": [10, 10, 10, 6],
  "nibble": [15, 16, 15, 16, 11],
  "qaz": [10, 10, 9, 8],
  "quefrency": [15, 15, 14, 14, 12],
  "reviung41": [12, 12, 12, 5],
  "romac": [3, 3, 3, 3],
  "romac_plus": [3, 3, 3, 3],
  "sofle": [12, 12, 12, 14, 8],
  "splitreus62": [12, 12, 12, 12, 14],
  "tg4x": [13, 12, 11, 9],
  "tidbit": [3, 4, 4, 4, 4],
  "tidbit_19key": [3, 4, 4, 4, 4]
}
type Keymap = {
  name: string
  columns: number[]
  keymap: string
}
let keymaps: Keymap[] = []

const paths = fs.readdirSync(keymapsDir).map((filename: string) => {
  const name = path.basename(filename).replace(".keymap","")
  keymaps.push({
    name: name,
    columns: layouts[name] ? layouts[name] : [1],
    keymap: fs.readFileSync(path.join(keymapsDir, filename), 'utf8')
  })
})

fs.writeFile('../static/static.ts', "export const staticKeymaps: string = `"+JSON.stringify(keymaps, null, 2).replace(/\\(.)/g, '\\\\$1').replace(/`/g, '\\`').replace(/\\\\\\ /g, '\\\\\\\\ ')+"`;", (err: Error) => {
  if (err) {
    console.log(err)
    return
  }
})

