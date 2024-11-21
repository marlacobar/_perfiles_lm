sap.ui.define([
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "../../model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    'sap/ui/model/json/JSONModel',
    "sap/ui/export/Spreadsheet",
    'sap/m/Token',
], function (BaseController, MessageToast, Filter, FilterOperator, formatter, Fragment, MessageBox, JSONModel, Spreadsheet, Token) {
    "use strict";

    var plant_gb = '';

    return BaseController.extend("sap.ui.demo.webapp.controller.Reportes.ReporteIM", {

        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("ReporteIM").attachMatched(this._onRouteMatched, this);
            var oView = this.getView();
            var inputMaterial = oView.byId("material_input");
            var inputLote = oView.byId("lote_input");

            var fnValidator = function (args) {
                var text = args.text;

                return new Token({ key: text, text: text });
            };

            inputMaterial.addValidator(fnValidator);
            inputLote.addValidator(fnValidator);
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username", "id_reporte_im");

            this._base_onloadCOMBO("Almacen_select", "", "MII/DatosTransaccionales/Pedidos/Transaction/get_storage_mii", "", "Almacenes IM");
        },

        onExport: function () {
            var aCols, aProducts, oSettings, oSheet;

            aCols = this.createColumnConfig();
            aProducts = this.getView().byId("t_lotes_IM").getModel().getProperty('/ITEMS');

            oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                        sheetName: "Reporte de lotes IM"
                    }
                },
                dataSource: aProducts
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show('Descarga finalizada');
                })
                .finally(function () {
                    oSheet.destroy();
                });
        },

        createColumnConfig: function () {
            return [
                {
                    label: 'Lote',
                    property: 'lote'
                },
                {
                    label: 'Almacén',
                    property: 'almacen'
                },
                {
                    label: 'Material',
                    property: 'material'
                },
                {
                    label: 'Descripción',
                    property: 'descripcion'
                },
                {
                    label: 'UM',
                    property: 'um'
                },
                {
                    label: 'Libre Utilización',
                    property: 'libreUtilizacion'
                },
                {
                    label: 'Inspección Calidad',
                    property: 'inspeccionCalidad'
                },
                {
                    label: 'Stock Bloqueado',
                    property: 'stockBloqueado'
                },
                {
                    label: 'Stock Bloq. Devoluciones',
                    property: 'stockBloqueadoDevoluciones'
                },
                {
                    label: 'Stock Tránsito',
                    property: 'stockTransito'
                },
                {
                    label: 'Fecha Creacion',
                    property: 'f_creacion'
                },
                {
                    label: 'Fecha Caducidad',
                    property: 'f_caducidad'
                },
                {
                    label: 'Proveedor',
                    property: 'proveedor'
                }
            ];
        },

        onSearch: function (oEvent) {

            var oView = this.getView();
            var material = '';
            var lote = '';
            var aTokensMaterial = this.getView().byId("material_input").getTokens();
            var aTokensLote = this.getView().byId("lote_input").getTokens();

            material = aTokensMaterial.map(function (oToken) {
                return "'0000000000" + oToken.getKey() + "'";
            }).join(",");

            lote = aTokensLote.map(function (oToken) {
                return "'" + oToken.getKey() + "'";
                //return oToken.getKey();
            }).join(",");
            
            if (this.byId("Almacen_select").getSelectedKey() == "" && material == "" && lote == "") {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un almacén.");
                return;
            }            
            var resourceModel = this.getView().getModel("i18n");
            var oData = {
                "ALMACEN": this.byId("Almacen_select").getSelectedKey(),
                "LOTE": lote,
                "PLANTA": "2010",
                "MATERIAL": material
            };
            console.log(oData);
            this._base_onloadTable("t_lotes_IM", oData, "MIIExtensions/Reports/Transaction/reporte_MaterialLoteIM", "Lotes de IM", "");


        }

    });
});


