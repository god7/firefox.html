define(["js/eventemitter"], function(EventEmitter) {

  "use strict";

  let _tabIframeArray = [];
  let _selectIndex = -1;

  const TabIframeDeck = {

    add: function(options={}) {
      let tabIframe = document.createElement("tab-iframe");
      tabIframe.setAttribute("flex", "1");

      let parent = document.querySelector(".iframes");
      parent.appendChild(tabIframe);
      _tabIframeArray.push(tabIframe);

      this.emit("add", {tabIframe: tabIframe});

      if (options.url) {
        tabIframe.setLocation(options.url);
      }

      if (options.select || _selectIndex < 0) {
        this.select(tabIframe);
      } else {
        tabIframe.hide();
      }

      return tabIframe;
    },

    remove: function(tabIframe) {
      let index = _tabIframeArray.indexOf(tabIframe);
      if (index < 0) {
        throw new Error("Unknown tabIframe");
      }

      if (_tabIframeArray.length == 1) {
        throw new Error("Deck has only one tabiframe");
      }

      if (index == _selectIndex) {
        let newSelectIndex;
        if (index == _tabIframeArray.length - 1) {
          newSelectIndex = index - 1;
        } else {
          newSelectIndex = index + 1;
        }
        this.select(_tabIframeArray[newSelectIndex]);
      }

      if (_selectIndex > index) {
        _selectIndex--;
      }

      _tabIframeArray.splice(index, 1);
      tabIframe.remove();

      this.emit("remove", {tabIframe});
    },

    select: function(tabIframe) {
      let index = _tabIframeArray.indexOf(tabIframe);
      if (index < 0) {
        throw new Error("Unknown tabiframe");
      }

      if (_selectIndex > -1) {
        let selectedTabIframe = _tabIframeArray[_selectIndex];
        selectedTabIframe.hide();
        this.emit("unselect", {
          tabIframe: selectedTabIframe,
          index: _selectIndex
        });
      }

      _selectIndex = index;
      tabIframe.show();

      this.emit("select", {tabIframe});
    },

    selectNext: function() {
      let newSelectIndex = _selectIndex + 1;
      if (newSelectIndex == _tabIframeArray.length) {
        newSelectIndex = 0;
      }
      this.select(_tabIframeArray[newSelectIndex]);
    },

    selectPrevious: function() {
      let newSelectIndex = _selectIndex - 1;
      if (newSelectIndex < 0) {
        newSelectIndex = _tabIframeArray.length - 1;
      }
      this.select(_tabIframeArray[newSelectIndex]);
    },

    getSelected: function() {
      return _tabIframeArray[_selectIndex];
    },

    getCount: function() {
      return _tabIframeArray.length;
    },
  }

  TabIframeDeck[Symbol.iterator] = function*() {
    for (let tabIframe of _tabIframeArray) {
      yield tabIframe;
    }
  }

  EventEmitter.decorate(TabIframeDeck);
  TabIframeDeck.add();

  return TabIframeDeck;
});
