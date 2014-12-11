define([
  "js/commands",
  "js/urlhelper",
  "js/tabiframedeck"
], function(
  Cmds,
  UrlHelper,
  TabIframeDeck
) {

  "use strict";

  document.querySelector(".back-button").onclick = () => Cmds.goBack();
  document.querySelector(".forward-button").onclick = () => Cmds.goForward();
  document.querySelector(".reload-button").onclick = () => Cmds.reload();
  document.querySelector(".stop-button").onclick = () => Cmds.stop();

  let urlTemplate = "https://search.yahoo.com/search?p={searchTerms}";

  let urlbar = document.querySelector(".urlbar");
  let urlinput = document.querySelector(".urlinput");
  let navbar = document.querySelector(".navbar");

  let UserInputs = new Map();

  urlinput.addEventListener("focus", () => {
    urlinput.select();
    urlbar.classList.add("focus");
  })

  urlinput.addEventListener("blur", () => {
    urlbar.classList.remove("focus");
  })

  urlinput.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
      UrlInputChanged()
    }
  });

  urlinput.addEventListener("input", () => {
    UserInputs.set(TabIframeDeck.getSelected(), urlinput.value);
  });

  let searchbar = document.querySelector(".searchbar");
  let searchinput = document.querySelector(".searchinput");
  searchinput.addEventListener("focus", () => {
    searchinput.select();
    searchbar.classList.add("focus");
  })
  searchinput.addEventListener("blur", () => searchbar.classList.remove("focus"))
  searchinput.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
      SearchInputChanged()
    }
  });

  function UrlInputChanged() {
    let text = urlinput.value;
    let url = PreprocessUrlInput(text);
    let tabIframe = TabIframeDeck.getSelected();
    tabIframe.setLocation(url);
    tabIframe.focus();
  }

  function SearchInputChanged() {
    let text = searchinput.value;
    let url = urlTemplate.replace('{searchTerms}', encodeURIComponent(text));
    let tabIframe = TabIframeDeck.getSelected();
    tabIframe.setLocation(url);
    tabIframe.focus();
  }

  TabIframeDeck.on("remove", (tabIframe) => {
    UserInputs.delete(tabIframe);
  });

  TabIframeDeck.on("select", OnTabSelected);

  let lastSelectedTab = null;

  function OnTabSelected() {
    let selectedTabIframe = TabIframeDeck.getSelected();
    if (lastSelectedTab) {
      lastSelectedTab.off("dataUpdate", UpdateTab);
    }
    lastSelectedTab = selectedTabIframe;
    if (selectedTabIframe) {
      selectedTabIframe.on("dataUpdate", UpdateTab);
      UpdateTab();
    }
  }

  OnTabSelected();

  function UpdateTab() {
    let tabIframe = TabIframeDeck.getSelected();

    if (tabIframe.loading) {
      navbar.classList.add("loading");
    } else {
      navbar.classList.remove("loading");
    }

    let userInput = UserInputs.get(tabIframe);
    if (userInput) {
      urlinput.value = userInput;
    } else {
      urlinput.value = tabIframe.location
    }

    if (!window.IS_PRIVILEGED) {
      return;
    }

    if (tabIframe.securityState == "secure") {
      navbar.classList.add("ssl");
      if (tabIframe.securityExtendedValidation) {
        navbar.classList.add("sslev");
      }
    } else {
      navbar.classList.remove("ssl");
      navbar.classList.remove("sslev");
    }

    tabIframe.canGoBack().then(canGoBack => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoBack) {
        navbar.querySelector(".back-button").classList.remove("disabled");
      } else {
        navbar.querySelector(".back-button").classList.add("disabled");
      }
    });

    tabIframe.canGoForward().then(canGoForward => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoForward) {
        navbar.querySelector(".forward-button").classList.remove("disabled");
      } else {
        navbar.querySelector(".forward-button").classList.add("disabled");
      }
    });
  };

  function PreprocessUrlInput(input) {
    if (UrlHelper.isNotURL(input)) {
      return urlTemplate.replace('{searchTerms}', encodeURIComponent(input));
    }

    if (!UrlHelper.hasScheme(input)) {
      input = 'http://' + input;
    }

    return input;
  };

});
