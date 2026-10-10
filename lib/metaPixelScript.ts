/** Keep early events in Meta's standard queue while the organic page paints. */
export function metaPixelScript(pixelId: string) {
  return `
    if (navigator.doNotTrack !== "1" && navigator.globalPrivacyControl !== true) {
      (function(f,b) {
        if (f.fbq) return;
        var n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
        n('init', ${JSON.stringify(pixelId)});
        n('track', 'PageView');
        var loaded=false;
        function load() {
          if(loaded)return;
          loaded=true;
          var t=b.createElement('script');t.async=true;
          t.src='https://connect.facebook.net/en_US/fbevents.js';
          b.head.appendChild(t);
        }
        if(f.location.pathname.replace(/\\/$/, '') === '/free-demo') {
          function idle() {
            if(f.requestIdleCallback)f.requestIdleCallback(load,{timeout:2000});
            else f.setTimeout(load,0);
          }
          if(b.readyState === 'complete')idle();
          else f.addEventListener('load',idle,{once:true});
        } else load();
      })(window,document);
    }
  `;
}
