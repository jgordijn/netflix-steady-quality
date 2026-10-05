(() => {
  const proto = HTMLVideoElement.prototype;
  const orig = proto.getVideoPlaybackQuality;
  if (orig) {
    proto.getVideoPlaybackQuality = function () {
      const q = orig.call(this);
      window.__nfRealDropped = q.droppedVideoFrames;
      return {
        creationTime: q.creationTime,
        totalVideoFrames: q.totalVideoFrames,
        droppedVideoFrames: 0,
        corruptedVideoFrames: 0,
        totalFrameDelay: 0,
      };
    };
  }
  for (const k of ['webkitDroppedFrameCount']) {
    try { Object.defineProperty(proto, k, { get: () => 0, configurable: true }); } catch (e) {}
  }
})();
