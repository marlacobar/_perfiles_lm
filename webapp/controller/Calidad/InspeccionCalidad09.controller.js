sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "../../model/formatter",
    'sap/ui/model/json/JSONModel'

], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, formatter, JSONModel) {
    "use strict";
    var DocumentoGlobal = '';
    var centro;
    return BaseController.extend("sap.ui.demo.webapp.controller.Calidad.InspeccionCalidad09", {
        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("InspeccionCalidad09").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username", "avatar");

            var oArgs = oEvent.getParameter("arguments"),
                oView = this.getView(),
                oThis = this;
            centro = oArgs.planta;

            this.onSearch();
        },
        onSearch: function (oEvent) {
            var date = this.byId("fecha").getValue();
            date = date.split(" - ");
            var fecha_in = date[0],
                fecha_fin = date[1];
            //var tipo = this.byId("tipo_inspeccion").getSelectedKey();
            var lote = this.byId("inp_lote").getValue();
            var insplot = this.byId("inp_insplot").getValue();
            var orden = this.byId("inp_orden").getValue();
            var material = this.byId("inp_material").getValue();
            var color = this.byId("color").getSelectedKey();

            // Filtro de fecha obligatorio
            if ((fecha_in == "" || fecha_in == undefined) && (fecha_fin == "" || fecha_fin == undefined)) {
                if (oEvent !== undefined) {
                    MessageToast.show("El filtro de fecha es obligatorio");
                }
                return;
            } else {
                color = color === 'NUEVO' ? 'LIB' : (color === 'DECISION') ? 'DE' : (color === 'INSPECCION') ? 'VERF' : (color === 'ANULADO') ? 'LOTA' : '';

                var oData = {
                    "FECHA_INICIO": fecha_in,
                    "FECHA_FIN": fecha_fin,
                    //    "TIPO":tipo,
                    "CENTRO": centro,
                    "ORDEN": orden,
                    "LOTE": lote,
                    "LOTE_INSPECCION": insplot,
                    "MATERIAL": material,
                    "ESTATUS": color
                };
                console.log(oData)

                this._base_onloadTable('insplot_list', oData, 'MII/DatosTransaccionales/Calidad/Transaction/get_insplot_09', "Lotes de inspeccion", "");
            }
        },

        onSearch_: function (oEvt) {
            // add filter for search
            var aFilters = [];
            var sQuery = oEvt.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("LOTE_INSPECCION", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var list = this.byId("insplot_list");
            var binding = list.getBinding("items");
            binding.filter(aFilters, "Application");
        },

        onSearch__: function (oEvt) {
            // add filter for search
            var aFilters = [];
            var sQuery = oEvt.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("PEDIDO", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            // update list binding
            var list = this.byId("insplot_list");
            var binding = list.getBinding("items");
            binding.filter(aFilters, "Application");
        },

        onInspeccion: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            var material = oCtx.getProperty("MATERIAL");
            var tipo = oCtx.getProperty("LOTE_INSPECCION").substring(0, 2);
            var orden = oCtx.getProperty("ORDEN");
            var lote;
            var de = oCtx.getProperty("ESTATUS");

            if (oCtx.getProperty("LOTE") != "") {
                lote = oCtx.getProperty("LOTE");
            } else {
                lote = "0000000000"
            }
            if (oCtx.getProperty("ORDEN") == "N/A" || oCtx.getProperty("ORDEN") == "") {
                orden = 0
            }
            this.getRouter().navTo("InspeccionesPeriodicas", {
                centro: centro,
                lote: oCtx.getProperty("LOTE_INSPECCION"),
//                documento: orden,
                tipo: tipo,
                producido: lote,
                material: material,
                de: de
            });
        }
    });
});