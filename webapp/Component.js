sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/m/Token"],
  (UIComponent, JSONModel, Token) => {
    "use strict";

    return UIComponent.extend("ui5.kitchen-clean-plan.Component", {
      metadata: {
        //referenzen zu WurzelView
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        rootView: {
          interfaces: ["sap.ui.core.IAsyncContentCreation"],
          manifest: "json",
        },
      },

      init() {
        //Initialisierung
        //copy paste from App.controller
        // call the init function of the parent
        UIComponent.prototype.init.apply(this, arguments);
        // set data model
        const oData = {
          recipient: {
            name: "",
          },
        };
        const oModel = new JSONModel(oData);
        this.setModel(oModel);
      },

      //Validiert die Benutzereingabe
      tokenValidator(args) {
        // Überprüft und validiert die Benutzereingabe vor dem Hinzufügen als Token
        var text = args.text.trim();
        if (!text) {
          return null; // Leere Eingaben ignorieren
        }

        // Prüfen, ob das Token bereits existiert
        var oMultiInput = args.suggestionControl;
        var aTokens = oMultiInput.getTokens();
        var bExists = aTokens.some((token) => token.getText() === text);
        if (bExists) {
          return null; // Doppelte Tokens verhindern
        }
        // Erstellt und gibt ein neues Token zurück
        return new Token({ key: text, text: text });
      },
    });
  }
);
