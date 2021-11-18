## What

Parser for ZMK keymaps based on https://www.sigmacomputing.com/blog/writing-a-parser-combinator-from-scratch-in-typescript/

## Why

Because I didn't want to count key indices in order to make combos

## How

Use yarn to install dependencies:

    yarn install

Then run a local server:

    yarn start

(which just runs `webpack serve --mode development`)

Then browse to localhost:9500

And you can paste in your keymap, or select a default. If you paste in your own, make sure you set the geometry (rows / columns).

Then look at the Keymap tab - you can see layers. I've broken editing because of click events.

Then there are combos on the Combos tab - the idea is that you select keys and that pre-populates the combos DTSI, and you can enter the keycode you want it to trigger and the layers you want it to be active on, and then copy/paste into your keymap. But it's broken.

## Why is it all so broken?

Honest answer - I'm setting up a k3s homelab and got a 3D printer so I'm spending less time on this at the moment. I did just manage to get my Sweep working again so I'm in dire need of combos.

More useful answer - I wanted to separate out the keymap / combos areas into pages, but didn't think it through - you need to be able to see the physical layout in order to say what keys you want in a combo. So I got halfway and then stopped.

## Troubleshooting

> It says my keymap is broken in an obscure way!

e.g. `Parse error, expected brace at char 5 / { keymap { compatible = "zmk,keymap"; [your entire keymap]`

Some DTSI nodes are not supported in my totally noddy parser implementation - e.g. sensor_bindings. Delete them from the Parser textarea and you should be good to go. Better solution is to implement a proper DTSI parser (tree-sitter?)

> I don't own a symmetric split!

Yup, sorry about that. Suspend disbelief.

> I can't edit my keymap!
> I can't make combos!

I will raise github issues for these and more!