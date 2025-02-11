sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Token",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (Controller, MessageToast, Token, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend(
      "ui5.kitchen-clean-plan.controller.OverviewPanel",
      {
        onNewEntry() {
          // read msg from i18n model
          const oBundle = this.getView().getModel("i18n").getResourceBundle();
          const sRecipient = this.getView()
            .getModel()
            .getProperty("/recipient/name");
          const sMsg = oBundle.getText("filterField", [sRecipient]);

          // show message
          MessageToast.show(sMsg);
        },

        onFilter: function (oEvent) {
          //TODO: funktionalität des Filters einfügen
          var sQuery = oEvent.getParameter("query"); // Eingabewert aus Suchfeld
          var oTable = this.getView().byId("cleaningTable");
          var oBinding = oTable.getBinding("items");

          if (sQuery) {
            var aFilters = [
              new Filter("name", FilterOperator.Contains, sQuery),
              new Filter("task", FilterOperator.Contains, sQuery),
              new Filter("date", FilterOperator.Contains, sQuery),
            ];
            oBinding.filter(new Filter(aFilters, false)); // OR-Suche
          } else {
            oBinding.filter([]); // Filter zurücksetzen
          }
          //sap.m.MessageToast.show("Search icon clicked!");
        },

        onDeleteSelected: function () {
          //TODO: funktionalität des Buttons löschen einfügen
          sap.m.MessageToast.show("Delete button clicked!");
        },

        onSelectItem: function () {
          //TODO: funktionalität von Checkboxen einfügen
          sap.m.MessageToast.show("Search icon clicked!");
        },

        async onOpenDialog() {
          // create dialog lazily
          this.oDialog ??= await this.loadFragment({
            name: "ui5.kitchen-clean-plan.view.NewEntryDialog",
          });

          this.oDialog.open();
        },

        onInit() {
          var oMultiInput = this.getView().byId("taskInput");

          if (oMultiInput) {
            // tokenValidator aus Component.js verwenden
            var oComponent = this.getOwnerComponent();
            oMultiInput.addValidator(
              oComponent.tokenValidator.bind(oComponent)
            );
          }
        },

        //Neue Tätigkeiten als Token hinzufügen
        onTaskAdd(oEvent) {
          var oMultiInput = this.getView().byId("taskInput");
          // Den eingegebenen Wert aus dem Event holen und Leerzeichen entfernen
          var sValue = oEvent.getParameter("value")?.trim();

          if (!sValue) {
            return; // Keine leeren Tokens hinzufügen
          }

          // Prüfen, ob das Token bereits existiert (doppelte vermeiden)
          var aTokens = oMultiInput.getTokens();
          var bExists = aTokens.some((token) => token.getText() === sValue);

          // Falls das Token noch nicht existiert, wird es hinzugefügt
          if (!bExists) {
            oMultiInput.addToken(new Token({ key: sValue, text: sValue }));
          }

          // Eingabefeld leeren
          oMultiInput.setValue("");
        },

        //Icon (valueHelp) wird geklickt -> alle Tokens werden gelöscht
        onTaskDelete() {
          this.getView().byId("taskInput").removeAllTokens();
        },

        onCreateDialog() {
          // TODO: Logik für Erstellen neues Eintrags
          this.byId("NewEntryDialog").close(); //may be change function
        },

        onCloseDialog() {
          // note: We don't need to chain to the pDialog promise, since this event handler
          // is only called from within the loaded dialog itself.
          this.byId("NewEntryDialog").close();
        },
      }
    );
  }
);
