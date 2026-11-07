import Script from "next/script";

/*
 * Yandex.Metrika counter 114123654. Loaded after the page is interactive so it
 * never delays the first paint; tag.js follows client-side (History API)
 * navigations on its own. Rendered only on the indexable production site, so
 * previews and local dev don't pollute the stats.
 */
export const METRIKA_ID = 114123654;

export default function YandexMetrika() {
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">{`
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');
ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
`}</Script>
      <noscript>
        <div><img src={`https://mc.yandex.ru/watch/${METRIKA_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div>
      </noscript>
    </>
  );
}
