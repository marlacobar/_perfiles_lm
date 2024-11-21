sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "../../model/formatter",
    'sap/ui/model/json/JSONModel',
    "sap/ui/export/Spreadsheet"

], function(JQuery, BaseController, MessageToast, MessageBox,Filter, FilterOperator,formatter, JSONModel, Spreadsheet) {
    "use strict";
    var  DocumentoGlobal='';
    return BaseController.extend("sap.ui.demo.webapp.controller.Materiales.me", {
        formatter: formatter,
        onInit: function() {
            var oRouter = this.getRouter();
            oRouter.getRoute("InspeccionCalidadPT").attachMatched(this._onRouteMatched, this);
            this._base_onloadCOMBO("Puesto_Trabajo_select", "", "MIIExtensions/Operation/Transaction/get_work_center_mii", "", "Puestos trabajo");           
        },

        _onRouteMatched: function(oEvent) {
            this._getUsuario("username","id_pt_terminado");
            this.onShowView ();
        },
		onShowView: function () {
			var liberados = this.byId("liberados").getSelected();
			var rechazados = this.byId("rechazados").getSelected();
			//var sUC = this.byId("cbUC").getValue();
			var lote = this.byId("lote").getValue();

			if (liberados == false && rechazados == false) {
				this.getOwnerComponent().openHelloDialog("Debe seleccionar un estatus.");
			} else {
				var sPuesto = this.byId('Puesto_Trabajo_select');
				var oData = {
					"LIBERADOS": liberados == true ? "1" : "0",
					"RECHAZADOS": rechazados == true ? "1" : "0",
					"PUESTO_TRABAJO": sPuesto.getSelectedKey(),
					//"UC": sUC,
					"LOTE": lote
				};
				console.log(oData);
				this._base_onloadTable('Partidas_List', oData, 'MII/DatosTransaccionales/Pedidos/Transaction/entradas_me', "Items", "");

			}

		},

		onExport: function() {
			var aCols, aProducts, oSettings, oSheet;


		/*if(this.byId("rechazados").getSelected()==false){
		this.getOwnerComponent().openHelloDialog("Debe selecccionar estatus Rechazados.");
		return;
		}*/


		var tPartidas_List            = this.getView().byId("Partidas_List");
		var agrItemsPartidas_List       = tPartidas_List.getBinding("items");
		var mItemsPartidas_List = agrItemsPartidas_List.getModel();
		var jDatosPartidas_List           = mItemsPartidas_List.getData();

		if(Object.keys(jDatosPartidas_List).length == 0){return;}


			aCols = this.createColumnConfig();
			aProducts =  this.getView().byId("Partidas_List").getModel().getProperty('/ITEMS');

			oSettings = {
				workbook: { columns: aCols,
							context: {
								sheetName: "Inspección PT - Rechazados"
							}
			},
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Descarga finalizada');
				})
				.finally(function() {
					oSheet.destroy();
				});
		},

		  createColumnConfig: function() {
		    return [
 		     {
  		      label: 'Material',
  		      property: 'MATERIAL'
   		   },
 		     {
  		      label: 'Descripción',
  		      property: 'DESC_MATERIAL'
   		   },
 		     {
  		      label: 'Almacén',
  		      property: 'ALMACEN'
   		   },
 		     {
  		      label: 'Lote',
  		      property: 'LOTE'
   		   },
 		     {
  		      label: 'Cantidad',
  		      property: 'CANTIDAD'
   		   },
 		     {
  		      label: 'UM',
  		      property: 'UM'
   		   },
 		     {
  		      label: 'Fecha',
  		      property: 'FECHA_INS'
   		   },
 		     {
  		      label: 'Documento',
  		      property: 'DOCUMENTO'
   		   },
 		     {
  		      label: 'Lote inspección',
  		      property: 'LOTE_INSPECCION'
   		   },
 		     {
  		      label: 'Orden',
  		      property: 'ORDEN'
   		   },
   		  {
  		      label: 'Master',
  		      property: 'MASTER'
   		   }
 		   ];
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
                    tipo:"04",
                    producido: oCtx.getProperty("LOTE")
                });
        }


    });
});