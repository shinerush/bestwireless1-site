/* Site configuration. This is the ONLY file that needs editing to go live.
   Paths are rewritten per-page by build.py; do not hand-edit dataBase/storeBase. */

window.BW1_CONFIG = {
  // Optional. Without a key, the locator still works via browser geolocation
  // and city/ZIP matching against your own store list. With a key, any typed
  // address or ZIP in the US resolves. Restrict the key by HTTP referrer.
  googleMapsKey: "",

  // Set by build.py per page. Leave as-is.
  dataBase: "data/",
  storeBase: "stores/",

  // Analytics — paste IDs when ready.
  ga4Id: "",
  metaPixelId: ""
};
