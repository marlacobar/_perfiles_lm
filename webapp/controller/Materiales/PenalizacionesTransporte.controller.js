sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "sap/ui/demo/webapp/model/formatter",
    'sap/ui/model/json/JSONModel',
 "sap/ui/demo/webapp/model/formatPods",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/export/Spreadsheet'
], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, formatter,JSONModel,formatPods,Export,ExportTypeCSV,Spreadsheet) {
    "use strict";
	var oModel_empty = new sap.ui.model.json.JSONModel();
	var oView ,oThis;
    return BaseController.extend("sap.ui.demo.webapp.controller.Materiales.PenalizacionesTransporte", {
	formatPods: formatPods,

	onInit: function () {
		var oRouter = this.getRouter();
            	oRouter.getRoute("PenalizacionesTransporte").attachMatched(this._onRouteMatched, this);
		oView =this.getView();
		oThis =this;
        	},

        	_onRouteMatched: function (oEvent) {
            	this._getUsuario("username");
	            this.onConsultar();
        	},
	
	onConsultar:function(){
	            this._LoadQuery("","MII/DatosTransaccionales/Transportes/Query/Get_Penalizaciones","penalizaciones");
	},

	DesactivarPenalizacion:function(oEvent){
		var oSelectedItem = oEvent.getSource().getParent();
            	var oBindingContext = oSelectedItem.getBindingContext("penalizaciones");
            	var penalizacion = oBindingContext.getProperty('PENALIZACIONID');
		var oData={
				PENALIZACIONID :penalizacion
			}
		oThis.Realiza_registro(oData,"MII/DatosTransaccionales/Transportes/Transaction/Desactiva_Penalizacion","DesactivaPenalizacion");
     
	},
	Realiza_registro(oData, path, tipo) {
            var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            sap.ui.core.BusyIndicator.show(0);
            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData.ERROR !== undefined && aData.ERROR !== "" && aData.ERROR !== "---") {
			MessageBox.alert(aData.ERROR);
                        }
                        else {
			switch (tipo) {
				case 'DesactivaPenalizacion':
				            MessageBox.success(aData.MESSAGE);
					oThis._LoadQuery("","MII/DatosTransaccionales/Transportes/Query/Get_Penalizaciones","penalizaciones");
				break;
			}
                        }
                    } else {
                        MessageBox.alert("La solicitud ha fallado: ¿Hay conexión de red?");
                    }
                    sap.ui.core.BusyIndicator.hide();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud a fallado: " + textStatus);
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

	

	onExport: function (oEvent) {
		var aCols, aProducts, oSettings, oSheet;
		var oView = this.getView();
        
		aCols = this.ColumnConfig_Penalizacion();
		aProducts = this.getView().getModel("penalizaciones").getData();

		oSettings = {
			workbook: {
				columns: aCols,
				context: { sheetName: 'ReportePenalizaciones' }
			},
			dataSource: aProducts,
			fileName: "ReportePenalizaciones.xlsx"
		};

		oSheet = new Spreadsheet(oSettings);
		oSheet.build()
			.then(function () {
				MessageToast.show('Se ha exportado reporte');
			})
			.finally(function () {
				oSheet.destroy();
			});
	},
	ColumnConfig_Penalizacion: function () {
		return [
			{
				label: 'Transporte',
				type: 'string',
				property: 'TRANSPORTE',
			},
                		{
				label: 'Fecha Penalizacion',
				property: 'FECHA_PENALIZACION',
				type: 'datetime',
			},
                		{
				label: 'Tipo',
				property: 'TIPO',
				type: 'string',
			},
                		{
				label: 'Penalizado',
				property: 'PENALIZADO',
				type: 'string',
			},
                		{
				label: 'Comentario',
				property: 'COMENTARIO',
				type: 'string',
			}
		];
	},	

});
});