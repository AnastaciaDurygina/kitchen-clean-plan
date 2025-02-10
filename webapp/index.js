sap.ui.define(["sap/ui/core/ComponentContainer"], (ComponentContainer) => {
  "use strict";

  new ComponentContainer({
    name: "ui5.kitchen-clean-plan",
    settings: {
      id: "kitchen-clean-plan",
    },
    async: true,
  }).placeAt("content");
});
