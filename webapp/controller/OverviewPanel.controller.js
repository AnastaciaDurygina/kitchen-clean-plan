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
        /*onNewEntry() {
          //PRÜFEN OB GENUTZT
          // read msg from i18n model
          const oBundle = this.getView().getModel("i18n").getResourceBundle();
          const sRecipient = this.getView()
            .getModel()
            .getProperty("/recipient/name");
          const sMsg = oBundle.getText("filterField", [sRecipient]);

          // show message
          MessageToast.show(sMsg);
        },*/

        onFilter(oEvent) {
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
          //sap.m.MessageToast.show("Search icon clicked!");//PRÜFEN OB GENUTZT
        },

        //Löscht die ausgewählten Einträge aus der Tabelle "cleaningTable"
        onDeleteSelected() {
          //NEW

          // Zugriff auf die Tabelle
          var oTable = this.getView().byId("cleaningTable");

          // Alle selektierten Items (Zeilen) abrufen
          var aSelectedItems = oTable.getSelectedItems();

          // Falls keine Zeile ausgewählt ist, eine Meldung anzeigen und abbrechen
          if (aSelectedItems.length === 0) {
            sap.m.MessageToast.show(
              "Bitte wählen Sie mindestens eine Zeile zum Löschen aus."
            );
            return;
          }

          // Zugriff auf das Model
          var oModel = this.getView().getModel("cleaningModel");

          // Alle existierenden Einträge aus dem Model abrufen
          var aCleaningTasks = oModel.getProperty("/cleaningTasks") || [];

          // IDs der zu löschenden Einträge in die Liste sammeln
          var aToDelete = aSelectedItems.map((oItem) => {
            return oItem.getBindingContext("cleaningModel").getObject();
          });

          // Nur die Einträge behalten, die nicht gelöscht werden sollen
          var aUpdatedTasks = aCleaningTasks.filter(
            (task) =>
              !aToDelete.some(
                (delTask) =>
                  delTask.name === task.name &&
                  delTask.task === task.task &&
                  delTask.date === task.date
              )
          ); //some () gibt true, wenn mind. 1 Eintrag in aToDelete mit task übereinstimmt-> löschen

          // Aktualisiertes Array ins Model setzen
          oModel.setProperty("/cleaningTasks", aUpdatedTasks);

          // Selektion in der Tabelle zurücksetzen
          oTable.removeSelections(true);

          // Erfolgsmeldung anzeigen
          sap.m.MessageToast.show("Ausgewählte Einträge wurden gelöscht.");
        },

        //öffnet Dialog-Fenster
        async onOpenDialog() {
          // create dialog lazily
          this.oDialog ??= await this.loadFragment({
            name: "ui5.kitchen-clean-plan.view.NewEntryDialog",
          });

          this.oDialog.open();
        },

        //Weiter Funktionalitäten im Dialog
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

        onCreateEntry() {
          // NEW

          // Zugriff auf das Model "cleaningModel" als JSONModel in manifest.json initialisisert
          var oModel = this.getView().getModel("cleaningModel");
          var aCleaningTasks = oModel.getProperty("/cleaningTasks") || []; //Falls undefined oder null zurückkommt, wird ein leeres Array []

          // Name aus Input-Feld holen
          var sName = this.getView().getModel().getProperty("/recipient/name");

          // Tätigkeiten aus MultiInput-Feld holen (Tokens)
          var oMultiInput = this.byId("taskInput"); //Zugriff holen
          var aTokens = oMultiInput.getTokens(); // Tätigkeiten auslesen
          var aTasks = aTokens.map((oToken) => oToken.getText()); // Extrahiere Texte aus Tokens, in Array

          // Datum aus DatePicker holen
          var sDate = this.byId("DP1").getDateValue(); //aus dem DatePicker auslesen
          if (sDate) {
            sDate = sDate.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }); // Format MM/DD/YYYY
          }

          // Validierung: Falls keine Daten eingegeben wurden (extra)
          if (!sName || aTasks.length === 0 || !sDate) {
            sap.m.MessageToast.show("Bitte alle Felder ausfüllen!");
            return;
          }

          // Neues Objekt erstellen und in das Model pushen
          var oNewEntry = {
            name: sName,
            task: aTasks.join(", "), // Falls mehrere Tasks, als CSV speichern
            date: sDate,
          };

          aCleaningTasks.push(oNewEntry); // Neues Element zur Liste hinzufügen
          oModel.setProperty("/cleaningTasks", aCleaningTasks); //Array wieder ins Model setzen, Model aktualisieren

          // Erfolgsnachricht anzeigen
          sap.m.MessageToast.show("Neuer Eintrag hinzugefügt!");

          // Dialog schließen
          this.byId("NewEntryDialog").close();
        },

        onCloseDialog() {
          //TODO kommentar
          // note: We don't need to chain to the pDialog promise, since this event handler
          // is only called from within the loaded dialog itself.
          this.byId("NewEntryDialog").close();
        },
      }
    );
  }
);
