# Flakture

This is the core game. It doesn't include any larger supporting interface, nor anything for computer opponents, but the
combination of message passing present in the game should make supporting those things imminently possible.

You can see `example/` for an example setup of everything but the actual built JS file - for that, you'll need to
compile these changes into an entry point and include it (that's the nonexistent `flakture.js`). It will also need some
form of Font Awesome included, which I didn't want to bundle here for copyright reasons. But `example/` includes
some programmer art for you to mess with.

## Apologia

This game is written in vanilla JS, using a quasi-framework class setup I create myself here. The obtuseness
of this is something that might annoy you, but it works well for me.

## Contributing

I have no idea if anyone will want to contribute to this, but if so, you can open a PR.