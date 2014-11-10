"use strict";
var log = console.log.bind(console);
var err = console.error.bind(console);

Promise.whatevs = function(ops) {

};

importScripts("polyfills/serviceworker-cache-polyfill.js");
importScripts("lib/localforage.js");

var version = 1;
var coreCacheName = "poly-air-" + version.toString();
var baseUrl = new URL("/", this.location.href) + "";

this.onerror = err;

this.addEventListener("install", function(e) {
  log("oninstall");

  e.waitUntil(caches.open(coreCacheName).then(function(core) {
    var resourceUrls = [
      "/",
      "//fonts.googleapis.com/css?family=RobotoDraft:regular,bold,italic,thin,light,bolditalic,black,medium&lang=en",
      "//fonts.gstatic.com/s/robotodraft/v2/u0_CMoUf3y3-4Ss4ci-VwZ7-ASEDocFpVYx1Gz4aSTw.woff2",
      "components/core-a11y-keys/core-a11y-keys.html",
      "components/core-ajax/core-ajax.html",
      "components/core-ajax/core-xhr.html",
      "components/core-animated-pages/core-animated-pages.css",
      "components/core-animated-pages/core-animated-pages.html",
      "components/core-animated-pages/transitions/core-transition-pages.html",
      "components/core-animated-pages/transitions/cross-fade.html",
      "components/core-animated-pages/transitions/hero-transition.html",
      "components/core-animated-pages/transitions/slide-from-right.html",
      "components/core-drawer-panel/core-drawer-panel.css",
      "components/core-drawer-panel/core-drawer-panel.html",
      "components/core-header-panel/core-header-panel.css",
      "components/core-header-panel/core-header-panel.html",
      "components/core-icon-button/core-icon-button.css",
      "components/core-icon-button/core-icon-button.html",
      "components/core-icon/core-icon.css",
      "components/core-icon/core-icon.html",
      "components/core-icons/av-icons.html",
      "components/core-icons/core-icons.html",
      "components/core-icons/maps-icons.html",
      "components/core-icons/social-icons.html",
      "components/core-iconset-svg/core-iconset-svg.html",
      "components/core-iconset/core-iconset.html",
      "components/core-input/core-input.css",
      "components/core-input/core-input.html",
      "components/core-media-query/core-media-query.html",
      "components/core-meta/core-meta.html",
      "components/core-overlay/core-key-helper.html",
      "components/core-overlay/core-overlay-layer.html",
      "components/core-overlay/core-overlay.html",
      "components/core-scaffold/core-scaffold.html",
      "components/core-selection/core-selection.html",
      "components/core-selector/core-selector.html",
      "components/core-style/core-style.html",
      "components/core-toolbar/core-toolbar.css",
      "components/core-toolbar/core-toolbar.html",
      "components/core-transition/core-transition-css.html",
      "components/core-transition/core-transition-overlay.css",
      "components/core-transition/core-transition.html",
      "components/font-roboto/roboto.html",
      "components/more-routing/driver.html",
      "components/more-routing/driver/hash.html",
      "components/more-routing/driver/mock.html",
      "components/more-routing/driver/path.html",
      "components/more-routing/more-route-selector.html",
      "components/more-routing/more-route-switch.html",
      "components/more-routing/more-route.html",
      "components/more-routing/more-routing.html",
      "components/more-routing/polymer-expressions.html",
      "components/more-routing/route.html",
      "components/more-routing/routing.html",
      "components/more-switch/more-switch.html",
      "components/more-switch/template-switch.html",
      "components/paper-button/paper-button-base.html",
      "components/paper-button/paper-button.html",
      "components/paper-checkbox/paper-checkbox.css",
      "components/paper-checkbox/paper-checkbox.html",
      "components/paper-fab/paper-fab.html",
      "components/paper-focusable/paper-focusable.html",
      "components/paper-icon-button/paper-icon-button.html",
      "components/paper-input/paper-input.css",
      "components/paper-input/paper-input.html",
      "components/paper-item/paper-item.css",
      "components/paper-item/paper-item.html",
      "components/paper-radio-button/paper-radio-button.css",
      "components/paper-radio-button/paper-radio-button.html",
      "components/paper-ripple/paper-ripple.html",
      "components/paper-shadow/paper-shadow.css",
      "components/paper-shadow/paper-shadow.html",
      "components/paper-toast/paper-toast.css",
      "components/paper-toast/paper-toast.html",
      "components/polymer/layout.html",
      "components/polymer/polymer.html",
      "components/polymer/polymer.js",
      "components/polymer/polymer.js.map",
      "components/webcomponentsjs/webcomponents.min.js",
      "flight-panel.html",
      "icons/icon.svg",
      "lib/localforage.js",
      "manifest.json",
    ];

    return core.addAll(resourceUrls.map(function(url) {
      var finalUrl = baseUrl + url;
      if (url.indexOf("//") == 0) {
        finalUrl = baseUrl.protocol + url;
      }
      return finalUrl;
    }));
  }));
});

this.addEventListener("activate", function(e) {
  log("onactivate");
  // Clobber old caches
  e.waitUntil(
    caches.keys().then(function(keys) {
      var toClobber = keys.filter(function(k) {
        return k != coreCacheName;
      });

      return Promise.all(toClobber.map(function(cacheName) {
        log("deleting cache: " + cacheName);
        return caches.delete(cacheName);
      }));
    })
  );
});

this.addEventListener("fetch", function(e) {
  // log("onfetch:", e.request.url);

  var request = e.request;
  var requestUrl = new URL(request.url);
  var coreCache = null;

  // TODO: Make sure we aren't caching the posts to /push
  if (requestUrl.pathname == "/push") {
    if (!navigator.onLine) {
      // TODO(slightlyoff): figure out replay
    }
    return;
  }

  // Basic read-through caching.
  e.respondWith(
    caches.open(coreCacheName).
      then(function(core) {
        coreCache = core;
        return coreCache.match(request);
      }).
      then(function(response) {
        if (response) {
          return response;
        }

        // Wasn't in the cache, so add and return it
        log("runtime caching: " + requestUrl);

        return coreCache.add(request).then(
          function(response) {
            log("added:", requestUrl);
            return coreCache.match(request);
          }
        );
      }, err)
  );
});

var notify = function(title, body, icon) {
  return new Notification(title, {
    serviceWorker: true,
    body: body,
    icon: icon || "icons/icon-96.png"
  });
};

this.addEventListener("push", function(evt) {
  var data = evt.data.split(":");
  log(data);
  var title = "No Title";
  var message = "No Message";
  var messageType = data[0];

  if (messageType == "gate") {
    localforage.getItem("track").then(function(flight) {
      title = "Gate changed!";
      message = flight.companyShort + flight.flightNumber
                  + " gate is " + data[1];

      flight.departGate = data[1];
      localforage.setItem("track", flight).then(function() {
        return notify(title, message);
      });
    });
  }

  if (messageType == "delay") {
    localforage.getItem("track").then(function(flight) {
      title = "Flight delay!";
      message = flight.companyShort + flight.flightNumber +
                  " has a " + data[1] + " minutes delay";

      flight.status = "Delay of " + data[1] + " minutes";
      localforage.setItem("track", flight).then(function() {
        return notify(title, message);
      });
    });
  }
});
