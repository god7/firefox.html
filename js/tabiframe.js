define([
  "js/eventemitter"
], function(
  EventEmitter
) {

  "use strict";

  dump("XXX\n");

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  const IFRAME_EVENTS = [
    "mozbrowserasyncscroll", "mozbrowserclose", "mozbrowsercontextmenu",
    "mozbrowsererror", "mozbrowsericonchange", "mozbrowserloadend",
    "mozbrowserloadstart", "mozbrowserlocationchange", "mozbrowseropenwindow",
    "mozbrowsersecuritychange", "mozbrowsershowmodalprompt", "mozbrowsertitlechange",
    "mozbrowserusernameandpasswordrequired"
  ];

  let tabIframeProto = Object.create(HTMLElement.prototype);

  tabIframeProto.setLocation = function(url) {
    if (!this._innerIframe) {
      this._createInnerIframe();
    }
    if (window.IS_PRIVILEGED) {
      this._innerIframe.src = url;
    } else {
      this._innerIframe.src = "data:," + url;
    }
  };

  tabIframeProto.show = function() {
    this.removeAttribute("hidden");
    if (window.IS_PRIVILEGED && this._innerIframe) {
      this._innerIframe.setVisible(true);
    }
    this.emit("visible");
  };

  tabIframeProto.hide = function() {
    this.setAttribute("hidden", "true");
    if (window.IS_PRIVILEGED && this._innerIframe) {
      this._innerIframe.setVisible(false);
    }
    this.emit("hidden");
  };

  tabIframeProto.createdCallback = function() {
    this._zoom = 1;
    this._clearTabData();
    EventEmitter.decorate(this);
  };

  tabIframeProto._createInnerIframe = function() {
    let iframe = document.createElement("iframe");
    iframe.setAttribute("mozbrowser", "true");
    iframe.setAttribute("flex", "1");
    iframe.setAttribute("remote", "true");
    this.appendChild(iframe);
    for (let eventName of IFRAME_EVENTS) {
      iframe.addEventListener(eventName, this);
    }
    this._innerIframe = iframe;
    this._applyZoom();
  };

  tabIframeProto.attachedCallback = function() {
  };

  tabIframeProto.detachedCallback = function() {
    if (this._innerIframe) {
      for (let eventName of IFRAME_EVENTS) {
        this._innerIframe.removeEventListener(eventName, this);
      }
    }
  };

  tabIframeProto.zoomIn = function() {
    this._zoom += 0.1;
    this._zoom = Math.min(MAX_ZOOM, this._zoom);
    this._applyZoom();
  };

  tabIframeProto.zoomOut = function() {
    this._zoom -= 0.1;
    this._zoom = Math.max(MIN_ZOOM, this._zoom);
    this._applyZoom();
  };

  tabIframeProto.resetZoom = function() {
    this._zoom = 1;
    this._applyZoom();
  };

  tabIframeProto._applyZoom = function() {
    if (this._innerIframe) {
      this._innerIframe.zoom(this._zoom);
    }
  };

  tabIframeProto.reload = function() {
    if (this._innerIframe) this._innerIframe.reload();
  };

  tabIframeProto.stop = function() {
    if (this._innerIframe) this._innerIframe.stop();
  };

  tabIframeProto.goBack = function() {
    if (this._innerIframe) this._innerIframe.goBack();
  };

  tabIframeProto.goForward = function() {
    if (this._innerIframe) this._innerIframe.goForward();
  };

  tabIframeProto._clearTabData = function() {
    this._loading = false;
    this._title = "";
    this._location = "";
    this._favicon = "";
    this._securityState = "unsecure";
    this._securityExtendedValidation = false;
  };

  Object.defineProperty(tabIframeProto, "loading", {
    get: function () {
      return this._loading;
    }
  });

  Object.defineProperty(tabIframeProto, "title", {
    get: function () {
      return this._title;
    }
  });

  Object.defineProperty(tabIframeProto, "location", {
    get: function () {
      return this._location;
    }
  });

  Object.defineProperty(tabIframeProto, "favicon", {
    get: function () {
      return this._favicon;
    }
  });

  Object.defineProperty(tabIframeProto, "securityState", {
    get: function () {
      return this._securityState;
    }
  });

  Object.defineProperty(tabIframeProto, "securityExtendedValidation", {
    get: function () {
      return this._securityExtendedValidation;
    }
  });

  tabIframeProto.canGoBack = function() {
    return new Promise((resolve, reject) => {
      if (!this._innerIframe) {
        return resolve(false);
      }
      this._innerIframe.getCanGoBack().onsuccess = r => {
        return resolve(r.target.result);
      };
    });
  };

  tabIframeProto.canGoForward = function() {
    return new Promise((resolve, reject) => {
      if (!this._innerIframe) {
        return resolve(false);
      }
      this._innerIframe.getCanGoForward().onsuccess = r => {
        return resolve(r.target.result);
      };
    });
  };

  tabIframeProto.focus = function() {
    if (this._innerIframe) {
      this._innerIframe.focus();
    }
  };

  tabIframeProto.handleEvent = function(e) {
    let somethingChanged = true;

    switch(e.type) {
      case "mozbrowserloadstart":
        this._clearTabData();
        this._loading = true;
        break;
      case "mozbrowserloadend":
        this._loading = false;
        break;
      case "mozbrowsertitlechange":
        this._title = e.detail;
        break;
      case "mozbrowserlocationchange":
        this._location = e.detail;
        break;
      case "mozbrowsericonchange":
        this._favicon = e.detail.href;
        break;
      case "mozbrowsererror":
        this._loading = false;
        break;
      case "mozbrowseropenwindow":
        // FIXME: TabIframeDeck.add({url:e.detail.url});
        break;
      case "mozbrowsersecuritychange":
        this._securityState = e.detail.state;
        this._securityExtendedValidation = e.detail.extendedValidation;
        break;
      default:
        somethingChanged = false;
    }

    if (somethingChanged) {
      this.emit("dataUpdate");
    }

    // Forward event
    this.emit(e.type, e);
  };

  document.registerElement("tab-iframe", {prototype: tabIframeProto});
});
