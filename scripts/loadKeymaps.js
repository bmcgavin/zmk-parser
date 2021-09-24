var fs = require('fs');
var path = require('path');
var keymapsDir = '../lib/keymaps';
var layouts = {
    "a_dux": {
        columns: [10, 10, 10, 4],
        rows: 4
    }
};
var keymaps = [];
var paths = fs.readdirSync(keymapsDir).map(function (filename) {
    var name = path.basename(filename).replace(".keymap", "");
    keymaps.push({
        name: name,
        layout: layouts[name] ? layouts[name] : { columns: [], rows: 0 },
        keymap: fs.readFileSync(path.join(keymapsDir, filename), 'utf8')
    });
});
fs.writeFile('../src/static.ts', "export const staticKeymaps: String = `" + JSON.stringify(keymaps, null, 2).replace(/`/g, '\\`') + "`;", function (err) {
    if (err) {
        console.log(err);
        return;
    }
});
