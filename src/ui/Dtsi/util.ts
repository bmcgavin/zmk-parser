type stringSanitiser = (input: string) => string

const numbers = (input: string) => input.replace(/&kp N([0-9]+)/, "$1")
const kp = (input: string) => input.replace("&kp ", "")
const mt = (input: string) => input.replace(/&mt (.*)/, "MT($1)")
const bt = (input: string) => input.replace(/&bt (.*)/, "🖧 $1")
const ep = (input: string) => input.replace(/&ext_power (.*)/, "⏻ $1")
const trans = (input: string) => input.replace("&trans", "▲")
const symbols = (input: string) => {
    let output = input
    type mapping = {
        src: string,
        dest: string,
    }
    const mappings: mapping[] = [
        {src: "GRAV", dest: "`"},
        {src: "MINUS", dest: "-"},
        {src: "TAB", dest: "⭾"},
        {src: "BSLH", dest: "\\"},
        {src: "SCLN", dest: ";"},
        {src: "QUOT", dest: "'"},
        {src: "LSFT", dest: "L⇧"},
        {src: "RSFT", dest: "R⇧"},
        {src: "LBKT", dest: "["},
        {src: "RBKT", dest: "]"},
        {src: "CMMA", dest: ","},
        {src: "DOT", dest: "."},
        {src: "FSLH", dest: "/"},
        {src: "LALT", dest: "L⎇"},
        {src: "RALT", dest: "R⎇"},
        {src: "LGUI", dest: "L🗗"},
        {src: "RGUI", dest: "R🗗"},
        {src: "SPC", dest: "␠"},
        {src: "RET", dest: "⏎"},
        {src: "ESC", dest: "⎋"},
        {src: "BKSP", dest: "⌫"},
        {src: "RCTL", dest: "R⌃"},
        {src: "LCTL", dest: "L⌃"},
        {src: "BT_CLR", dest: "⌀"},
        {src: "BT_SEL", dest: ""},
        {src: "K_VOL_DN", dest: "🕩"},
        {src: "K_VOL_UP", dest: "🕪"},
        {src: "TILD", dest: "~"},
        {src: "DEL", dest: "⌧"},
        {src: "EP_TOG", dest: "⏼"},
        {src: "EP_OFF", dest: "⌀"},
        {src: "EP_ON", dest: "⏽"},
        {src: "EQL", dest: "="},
        {src: "HOME", dest: "⇤"},
        {src: "END", dest: "⇥"},
        {src: "PGUP", dest: "↟"},
        {src: "PGDN", dest: "↡"},
        {src: "K_PP", dest: "⏯"},
        {src: "K_PREV", dest: "⏮"},
        {src: "K_NEXT", dest: "⏭"},
        {src: "RARW", dest: "🠂"},
        {src: "UARW", dest: "🠁"},
        {src: "DARW", dest: "🠃"},
        {src: "LARW", dest: "🠀"},
        {src: "PLUS", dest: "+"},
        {src: "PRSC", dest: "⎙"},
        {src: "INS", dest: "⎀"},
    ]
    for (const mapping of mappings) {
        output = output.replace(mapping.src, mapping.dest)
    }
    return output
}

export const allSanitisers: stringSanitiser[] = 
    [numbers, kp, trans, bt, mt, ep, symbols]


export const sanitise = (input: string, sanitisers: stringSanitiser[]): [string, string] => {
    let output = input
    for (const fn of sanitisers) {
        output = fn(output)
    }

    return [input, output]
}
