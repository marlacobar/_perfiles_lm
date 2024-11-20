sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "../../model/formatter",
    'sap/ui/model/json/JSONModel'

], function(JQuery, BaseController, MessageToast, MessageBox,Filter, FilterOperator,formatter, JSONModel) {
    "use strict";
    var  DocumentoGlobal='';
    return BaseController.extend("sap.ui.demo.webapp.controller.Calidad.InspeccionCalidadMP", {
        formatter: formatter,
        onInit: function() {
            //jQuery.sap.getUriParameters().get("Plant")
            var oRouter = this.getRouter();
            oRouter.getRoute("InspeccionCalidadMP").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            this._getUsuario("username","id_mat_prima");
            this._base_onloadTable('Partidas_List', '', 'MII/DatosTransaccionales/Pedidos/Transaction/movimientos_pedidos_calidad', "Lotes de inspeccion", "");
        },
        onSearch: function (oEvt) {
            // add filter for search
            var aFilters = [];
            var sQuery = oEvt.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("LOTE", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }

            // update list binding
            var list = this.byId("Partidas_List");
            var binding = list.getBinding("items");
            binding.filter(aFilters, "Application");
        },
	
	onCerrarSesion:function(){
  var oThis= this;
  $.ajax({
    type: "GET",
    async:false,
    url: "/XMII/Illuminator?service=Logout", 
    }).done(function (data) { 
    if (!document.execCommand("ClearAuthenticationCache")) {
      window.localStorage.clear()
      $.ajax({
      type: "GET",
      url: "/XMII/Illuminator?service=Logout", 
      error: function () {
      }
      });
    }
    location.reload();
    });
    
},
        onInspeccion: function(oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
           this.getRouter().navTo("inspeccion", {
                    lote: oCtx.getProperty("LOTE_INSPECCION"),
                    documento: oCtx.getProperty("DOCUMENTO"),
                    tipo:"01",
                    producido: oCtx.getProperty("LOTE")
                });
        }
});
});