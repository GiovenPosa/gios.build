import { useCallback, useEffect, useState, type VideoHTMLAttributes } from 'react';

// React sets `muted` only as a property and never writes the attribute, and
// Safari decides whether a video may play by itself from the attribute, so
// muted autoplaying videos could sit frozen there. Write it as soon as the
// element exists (before its source has loaded), and nudge it to play.
const muteAndPlay = (video: HTMLVideoElement | null) => {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.play().catch(() => {});
};

// AV1 in WebM, tried before the MP4; browsers that can't play AV1 skip it
export const WEBM_TYPE = 'video/webm; codecs="av01.0.05M.08"';

type LoopVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  /** a smaller WebM copy of `src`, tried first */
  webm?: string;
  /** load only once it's near the screen, so it doesn't take bandwidth
   *  from what's on screen at load */
  lazy?: boolean;
};

/**
 * A silent, looping, autoplaying video that also plays in Safari. Pass a
 * `poster` (its first frame) so it shows straight away while it loads.
 */
export function LoopVideo({ src, webm, lazy = false, ...props }: LoopVideoProps) {
  const [near, setNear] = useState(!lazy);
  const [node, setNode] = useState<HTMLVideoElement | null>(null);
  // stable, so it runs once per element
  const attach = useCallback((video: HTMLVideoElement | null) => {
    muteAndPlay(video);
    setNode(video);
  }, []);

  useEffect(() => {
    if (near || !node) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: '600px 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, [near, node]);

  // the sources arrived after the element did: have it pick one
  useEffect(() => {
    if (lazy && near) node?.load();
  }, [lazy, near, node]);

  return (
    <video
      ref={attach}
      autoPlay
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload={near ? 'auto' : 'none'}
      src={near && !webm ? src : undefined}
      // in case the first play() came before there was anything to play
      onCanPlay={(e) => {
        if (e.currentTarget.paused) e.currentTarget.play().catch(() => {});
      }}
      {...props}
    >
      {near && webm && <source src={webm} type={WEBM_TYPE} />}
      {near && webm && <source src={src} type='video/mp4' />}
    </video>
  );
}
