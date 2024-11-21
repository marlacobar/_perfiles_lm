sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/ui/demo/webapp/model/formatter",
    'sap/ui/model/json/JSONModel',
	"sap/ui/Device"
], function (JQuery, BaseController, formatter,JSONModel,Device) {
	"use strict";
	var oModel_empty = new sap.ui.model.json.JSONModel();
	var oView ;
	var height,div,pos;
	return BaseController.extend("sap.ui.demo.webapp.controller.Pizarras.monitor_transportes", {

		onInit: function () {
			var oRouter = this.getRouter();
			oView =this.getView();
			this.onConsultar();
			height=Device.resize.height;
			div = height / 25;			
			pos=0;
	        	},		 
	        	_onRouteMatched: function (oEvent) {
			var  oThis=this;
			/*this.UnidSolct = setInterval(function(){
				oThis.onConsultar();
			}, 10000);*/
			this.ScrollPage = setInterval(function(){
				pos += div;
				if(pos >= height + div){
					pos=0;
				}
				oView.byId("piz_page").scrollTo(pos);
			}, 1000);
        		},
	
		onConsultar:function(){
			var oData = {"Param.1": " AND CICLO='CARGA' AND FECHA_TARA IS NOT NULL ORDER BY DIASTARA DESC,HORASTARA DESC" },
				oThis = this,
				oPath = "MII/DatosTransaccionales/Transportes/Query/Transporte_Ubicacion"; 
				
			var oModelMAT = new sap.ui.model.json.JSONModel();
			var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
			var parameters = oData;
			oModelMAT.loadData(url, parameters, true, "POST");

			oModelMAT.attachRequestCompleted(function() {
				// IF Fatal Error
				if (oModelMAT.getData().Rowsets.FatalError) {
					console.log("Fatal Error");
					return;
				}
				if(oModelMAT.getData().Rowsets.Rowset[0].Row){
                            			oThis.getView().setModel(oModelMAT, "transportes");
				}
                		});
		},
		estatus:function(dias){
			console.log(dias);
			var bgcolor="";
			if(dias>0)
				bgcolor = "red";
			return bgcolor;
		},

	});
});