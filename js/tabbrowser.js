define(["js/eventemitter"], function(EventEmitter) {

  "use strict";

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
    console.log("createdCallback");
    EventEmitter.decorate(this);
  };

  tabIframeProto._createInnerIframe = function() {
    let iframe = document.createElement("iframe");
    iframe.setAttribute("mozbrowser", "true");
    iframe.setAttribute("flex", "1");
    iframe.setAttribute("remote", "true");
    this.appendChild(iframe);
    for (let eventName of IFRAME_EVENTS) {
      iframe.addEventListener(this, this);
    }
    this._innerIframe = iframe;
  };

  tabIframeProto.handleEvent = function(event) {
    this.emit(event.type, event);
  };

  tabIframeProto.attachedCallback = function() {
    console.log("attachedCallback");
  };

  tabIframeProto.detachedCallback = function() {
    console.log("detachedCallback");
    for (let eventName of IFRAME_EVENTS) {
      this.iframe.addEventListener(this, this);
    }
  };


  document.registerElement("tab-iframe", {prototype: tabIframeProto});
});
