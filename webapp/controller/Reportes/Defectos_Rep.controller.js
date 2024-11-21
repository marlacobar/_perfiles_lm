sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    'sap/m/Token'
], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, Token) {
    "use strict";
    return BaseController.extend("sap.ui.demo.webapp.controller.Reportes.Defectos_Rep", {
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("Defectos_Rep").attachMatched(this._onRouteMatched, this);
            var oView = this.getView();

            var oMultiInput = oView.byId("batch");

            // add validator
            var fnValidator = function (args) {
                var text = args.text;

                return new Token({ key: text, text: text });
            };

            oMultiInput.addValidator(fnValidator);

        },

        onFilterSearch: function (oEvent) {

            var oView = this.getView(),
                input = oView.byId("batch").getTokens(),
                sData = input.map(function (oToken) {
                    return oToken.getKey();
                }).join(";");

            var oData = {
                'BATCH': sData
            };
            this._base_onloadTable("Defectos", oData, "MII/DatosTransaccionales/Reportes/Transaction/Produccion/get_paros_rep", "Defectos", "");
            console.log(oData);
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username", "id_defecto_reporte");
            var
                oArgs = oEvent.getParameter("arguments"),
                oView = this.getView(),
                oTable = oView.byId('Defectos'),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;

            //clear table
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);

            oView.bindElement({
                path: "/"
            });
        }
    });
});

