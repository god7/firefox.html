define(['js/tabiframedeck'], function(TabIframeDeck) {

  "use strict";

  const Cmds = {
    goBack: function() {
      TabIframeDeck.getSelected().goBack();
    },
    goForward: function() {
      TabIframeDeck.getSelected().goForward();
    },
    reload: function() {
      TabIframeDeck.getSelected().reload();
    },
    stop: function() {
      TabIframeDeck.getSelected().stop();
    },
    createNewTab: function(url) {
      TabIframeDeck.add({url:url,select:true});
    },
    selectNextTab: function() {
      TabIframeDeck.selectNext();
    },
    selectPreviousTab: function() {
      TabIframeDeck.selectPrevious();
    },
    focusURLBar: function() {
      document.querySelector(".urlinput").focus();
      document.querySelector(".urlinput").select();
    },
    focusSearchBar: function() {
      document.querySelector(".searchinput").focus();
      document.querySelector(".searchinput").select();
    },
    closeTab: function() {
      TabIframeDeck.remove(TabIframeDeck.getSelected());
    },
    zoomIn: function() {
      TabIframeDeck.getSelected().zoomIn();
    },
    zoomOut: function() {
      TabIframeDeck.getSelected().zoomOut();
    },
    resetZoom: function() {
      TabIframeDeck.getSelected().resetZoom();
    },
  }

  return Cmds;

});
