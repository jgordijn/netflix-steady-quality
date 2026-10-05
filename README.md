# Netflix: steady quality

A tiny Chromium extension that stops Netflix from repeatedly dropping from 1080p to 720p, and the glitch each of those drops causes, on setups where quality switches aren't seamless.

## The problem

On some Linux setups, Netflix in Chromium glitches every few minutes. The picture freezes (audio may keep playing), then the player reloads and jumps back about a second.

I hit this on an Apple Silicon laptop running Asahi Linux, with Chromium and the ChromeOS ARM Widevine module. On that setup Widevine decrypts *and* decodes the video itself (`DecryptingVideoDecoder` in `chrome://media-internals`).

`chrome://media-internals` showed that every glitch lined up exactly with this line:

```
video decoder config changed midstream, new config: codec: av1 ... coded size: [1280,720]
```

Netflix's automatic quality switching kept going round the same loop: start at 1080p, drop to 720p after a few minutes, then rebuild the player at 1080p again. On most platforms these switches are seamless. Here, each one tears down and re-creates the decoder, and you see that as the freeze and jump back.

The quality drops weren't caused by bandwidth (the network was clean) or by decoding being too slow (H.264 did the same). Netflix reacts to the dropped frames reported by [`HTMLVideoElement.getVideoPlaybackQuality()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/getVideoPlaybackQuality). A Netflix engineer has said publicly that the player uses `droppedVideoFrames` and `totalFrameDelay` to detect an overloaded CPU and lower the resolution ([W3C mailing list](https://lists.w3.org/Archives/Public/public-hme-editors/2016Jul/0086.html)).

## What it does

On `netflix.com` only, it wraps `getVideoPlaybackQuality()` so it reports `0` dropped frames, `0` corrupted frames and `0` frame delay. It does the same for the legacy `webkitDroppedFrameCount`. Netflix then has no reason to lower the quality, so the decoder never restarts.

It doesn't change what's actually rendered. The real dropped-frame count is kept in `window.__nfRealDropped` (check it in the DevTools console on the Netflix tab).

**Trade-off:** if your machine really can't keep up, Netflix won't lower the quality to compensate.

## Install

1. Clone or download this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Reload any open Netflix tab.

## Diagnosing whether you have the same problem

Open `chrome://media-internals`, select the Netflix player and look for `video decoder config changed midstream` at the moment of a glitch. If your glitches line up with those lines, this extension should help.

## License

MIT
