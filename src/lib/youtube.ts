let ytApiLoaded = false;

export function loadYTApi(): Promise<void> {
    if (ytApiLoaded && (window as any).YT?.Player) return Promise.resolve();
    return new Promise((resolve) => {
        if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const wait = setInterval(() => {
                if ((window as any).YT?.Player) {
                    clearInterval(wait);
                    ytApiLoaded = true;
                    resolve();
                }
            }, 100);
            return;
        }
        const prev = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
            ytApiLoaded = true;
            prev?.();
            resolve();
        };
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
    });
}
