require.config({
  scriptType: "text/javascript;version=1.8",
  enforceDefine: true,
});

define([
  'js/os',
  'js/tabiframe',
  'js/tabiframedeck',
  'js/keybindings',
  'js/tab',
  'js/navbar',
], function(
  os,
  tabiframe,
  TabIframeDeck,
  keybindings,
  tab
) {

  "use strict";

  TabIframeDeck.add({url: "http://medium.com"});

  TabIframeDeck.on("selectedTabIframeUpdate", (tabIframe) => {
    document.title = "Firefox - " + tabIframe.title;
  });
})
