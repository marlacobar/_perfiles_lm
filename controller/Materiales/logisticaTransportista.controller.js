sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
"../../formatter/fm_status",
   "sap/ui/core/Fragment",
    'sap/ui/model/json/JSONModel',
   "sap/ui/model/Filter"
], function (JQuery, BaseController, MessageToast, MessageBox, formatter, Fragment,JSONModel,Filter) {
    "use strict";
    var DocumentoGlobal = '';
	var oView ;
	var oModelUbic = new sap.ui.model.json.JSONModel();
	var oModelLog = new sap.ui.model.json.JSONModel();
	var RegistroID = "";
	var Reasignacion=0;
	var EstatusLog;
	var oThis;
    return BaseController.extend("sap.ui.demo.webapp.controller.Materiales.logisticaTransportista", {
        formatter: formatter,
        onInit: function () {
            //jQuery.sap.getUriParameters().get("Plant")
            var oRouter = this.getRouter();
            oRouter.getRoute("logisticaTransportista").attachMatched(this._onRouteMatched, this);
	oView = this.getView();
	oThis = this;
	this.on_load_ubic();
	this.IntervalKPI();
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username");
        },

	onRegistroSolicita:function(solicita){		
		var inserta = 0;
		var puerta = oView.byId("apt_puerta").getSelectedKey();
		var cliente = oView.byId("apt_cliente").getSelectedKey();
		var destino = oView.byId("apt_destino").getValue();
		var transporte = oView.byId("apt_transporte").getValue();
		var me5 = oView.byId("apt_me5").getValue();
		var e5a10 = oView.byId("apt_5a10").getValue();
		var m10 = oView.byId("apt_m10").getValue();
		var paq = oView.byId("apt_paq").getValue();
		var user=this.byId("username").getText().split("-");
		
		if (RegistroID !== "" && puerta !== 0 && cliente !== 0  && (me5 >0 || e5a10 >0 || m10>0 || paq>0) )
		{
			inserta =1;
		}
		if(inserta == 1){
			var aData={
				REGISTROID : RegistroID,
				PUERTA:puerta,
				DESTINO:destino,
				CLIENTE: cliente,
				TRANSPORTE: transporte,
				MENOR5: me5,
				ENTRE5A10: e5a10,
				MAYOR10:m10,
				PAQUETES: paq,
				REASIGNACION:Reasignacion,
				USUARIO: user[0],
				SOLICITA : solicita
			};
			//console.log(aData);
			this.Realiza_registro(aData,"MII/DatosTransaccionales/Transportes/Transaction/Ins_SolicitaLogistica");
			this.onCloseSolicitaUnidad();
		}else{
			this.getOwnerComponent().openHelloDialog("Favor de validar los datos a ingresar y verificar las remisiones");
		}
	},

		onSolicitarUnidad: function(){
			if(!this.oDialogRU){
				this.oDialogRU = oView.byId("DGAssignaPuerta");
				this.oDialogRU = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.AssignaPuertaLogistica", this);			
				oView.addDependent(this.oDialogRU);
				this.oDialogRU.onAfterRendering = function(){
					oThis._onload("apt_puerta","", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Puerta", "SelectPuerta");
					oThis._onload("apt_cliente","", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Clientes", "SelectClientes");
					oThis.onClearDialog();
				}
			}
			this.oDialogRU.open();
		},

		onCloseSolicitaUnidad: function(){
			this.oDialogRU.close();
		},
	
		onTblRegistros:function(estatus){
			var oThis=this;
			EstatusLog = estatus;
			oView.getModel().setProperty('/TituloDetalle', "Detalle");
			if(!this.oDialogR){
				this.oDialogR = oView.byId("DGTBL");
				this.oDialogR = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Registros", this);
				oView.addDependent(this.oDialogR);				
				this.oDialogR.onAfterRendering = function(){
					oView.byId("KTLOG").setVisible(false);
					oView.byId("KTLOG_ESP").setVisible(false);
					var tbl = "KTLOG";
					if(EstatusLog =="0"){
						tbl = tbl + "_ESP";
					}
					oView.byId(tbl).setVisible(true);
					var oData = {
						ESTATUS : EstatusLog,
						"PAGINA":"LOGISTICA"
				            }
					oThis._base_onloadTable(tbl,oData, "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Ubic", "Reporte", "");
				}	
			}			
			this.oDialogR.open();
		},

		onCloseTblRegistros:function(){
			this.oDialogR.close();
		},
		AsignaLog:function(oEvent){
			var oSelectedItem = oEvent.getSource().getParent();
			var oBindingContext = oSelectedItem.getBindingContext();
			var transporte =oBindingContext.getProperty('TRANSPORTE');
			this.onCloseTblRegistros();
			this.onSolicitarUnidad();
			oView.byId('apt_transporte').setValue(transporte);
			this.onTraerDatos();
		},
	filterJsonKPI(JSON,UBIC){
		var resp = JSON.filter(function (item) { return item.UBICACION == UBIC});
		var cantidad = (resp.length == 0 ? 0:resp[0].CANTIDAD);
		return cantidad;
	},
	on_load_ubic:function(){
		var oData = {
			ESLOGISTICA:true
		}
		var path = "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Ubic_KPI";
		var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path +
		"&OutputParameter=JsonOutput&Content-Type=text/xml";
		uri = uri.replace(/\s+/g, '');
		oModelUbic.setData(null);
		var oThis = this;
		$.ajax({
			async: false,
			type: "POST",
			crossDomain: true,
			url: uri,
			data:oData,
			dataType: "xml",
			cache: false,
			success: function (xml) {
				var opElement = xml.getElementsByTagName("Row")[0].firstChild;
				var aData = JSON.parse(opElement.firstChild.data);
				var total = 0, ocupacion = 0;
				var espera = parseInt(oThis.filterJsonKPI(aData.ITEMS,"ESPERA"));
				var p1 = parseInt(oThis.filterJsonKPI(aData.ITEMS,"PUERTA 1"));
				var p2 = parseInt(oThis.filterJsonKPI(aData.ITEMS,"PUERTA 2"));
				var p3 = parseInt(oThis.filterJsonKPI(aData.ITEMS,"PUERTA 3"));
				var decapado = parseInt(oThis.filterJsonKPI(aData.ITEMS,"DECAPADO"));
				var pintadora = parseInt(oThis.filterJsonKPI(aData.ITEMS,"PINTADORA 2"));
				var galvanizadora = parseInt(oThis.filterJsonKPI(aData.ITEMS,"GALVANIZADORA 2"));
				var molino = parseInt(oThis.filterJsonKPI(aData.ITEMS,"MOLINO"));
				var pordefinir = parseInt(oThis.filterJsonKPI(aData.ITEMS,"POR DEFINIR"));
				//oView.byId("kpi_total").setValue(total);
				ocupacion = Math.round((total / 20)*100);
				//console.log("total:" + total + "/espera=" + espera + "/bascula=" + bascula + "/carga=" + carga);
				oModelUbic.setData({
					TOTAL:total,
					OCUPACION:ocupacion,
					ESPERA:espera,
					PUERTA1:p1,
					PUERTA2:p2,
					PUERTA3:p3,
					DECAPADO:decapado,
					PINTADORA:pintadora,
					GALVANIZADORA:galvanizadora,
					MOLINO:molino,
					PORDEFINIR:pordefinir,
				});
				ocupacion = Math.round((total / 20)*100);
				//console.log("total:" + total + "/espera=" + espera + "/bascula=" + bascula + "/carga=" + carga);
				oModelUbic.setData({
					TOTAL:total,
					OCUPACION:ocupacion,
					ESPERA:espera,
					PUERTA1:p1,
					PUERTA2:p2,
					PUERTA3:p3,
					DECAPADO:decapado,
					PINTADORA:pintadora,
					GALVANIZADORA:galvanizadora,
					MOLINO:molino
				});
				oView.setModel(oModelUbic,"data");
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log("ERROR");
			}
		});
	},
	_onload: function (Combo, oData, path, name) {
		var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path +
			"&OutputParameter=JsonOutput&Content-Type=text/xml"
		uri = uri.replace(/\s+/g, '');
		var oView = this.getView(),
		oCombo = oView.byId(Combo),
		oModel_empty = new sap.ui.model.json.JSONModel();

		oCombo.setModel(oModel_empty);
		oModel_empty.setData({});
		oCombo.setBusy(true);

		$.ajax({
			type: "GET",
			dataType: "xml",
			cache: false,
			url: uri,
			data: oData
		})
		.done(function (xmlDOM) {
			var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
			if (opElement.firstChild != null) {
				var aData = JSON.parse(opElement.firstChild.data);
				if (aData !== undefined) {
					//Create the JSON model and set the data
					var oModel = new sap.ui.model.json.JSONModel();
					oCombo.setModel(oModel);
					oModel.setData(aData);

				} else {
					MessageToast.show("No se han recibido " + name);
				}
			} else {
				MessageToast.show("No se han recibido datos");
			}
			
			oCombo.setBusy(false);
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			if (console && console.log) {
				MessageBox.alert("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
			}
			oCombo.setBusy(false);
		});
	},
	

        Realiza_registro(oData,path) {
            var uri = "http://"+ this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            sap.ui.core.BusyIndicator.show(0);
	var oThis = this;			
            console.log(oData);
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
                        if (aData.ERROR !== undefined) {
			MessageBox.alert(aData.ERROR);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                                             
                            MessageToast.show(aData.MESSAGE);
			oThis.on_load_ubic();
                        }
                    }
                    else {
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
	onClearDialog:function(){
		oView.byId("apt_transporte").setValue("");
		oView.byId("apt_puerta").setSelectedKey(0);
		oView.byId("apt_puerta").setEnabled(false);
		oView.byId("apt_cliente").setSelectedKey(0);
		oView.byId("apt_cliente").setEnabled(false);
		oView.byId("apt_destino").setSelectedKey(0);
		oView.byId("apt_destino").setEnabled(false);
		oView.byId("apt_me5").setValue("");
		oView.byId("apt_5a10").setValue("");
		oView.byId("apt_m10").setValue("");
		oView.byId("apt_paq").setValue("");
		oView.getModel().setProperty('/EnableAsignacion', false);
		oModelLog.setData({});
		oView.setModel(oModelLog,"info");
		RegistroID="";
		Reasignacion=0;
	},
	onTraerDatos:function(){
		var transporte = oView.byId("apt_transporte").getValue();
		if(transporte !== undefined || transporte !== ""){
			var oData={
				TRANSPORTE : transporte
			};
			var path = "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Logistica";
			var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path +
				"&OutputParameter=JsonOutput&Content-Type=text/xml";
			uri = uri.replace(/\s+/g, '');
			var oThis =this;
			$.ajax({
				async: false,
				type: "POST",
				crossDomain: true,
				url: uri,
				dataType: "xml",
				data:oData,
				success: function (xml) {
					var opElement = xml.getElementsByTagName("Row")[0].firstChild;
					var aData = eval(opElement.firstChild.data);
			                        if (aData[0].ERROR !== undefined) {
						MessageBox.alert(aData[0].ERROR);
						oView.getModel().setProperty('/EnableAsignacion', false);
			                        }else {
						var res = JSON.parse(opElement.firstChild.data);
						RegistroID=res[0].FOLIO;
						if(res[0].PUERTA !== "---"){
							Reasignacion=1;
						}else{
							Reasignacion=0;
						}
						oModelLog.setData(res[0]);
						oView.setModel(oModelLog,"info");
						oThis.onSetView();
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log("ERROR");
				}
			});
		}
	},
	onSetView:function(){
		oView.getModel().setProperty('/EnableAsignacion', true);
		oView.byId("apt_puerta").setEnabled(true);
		oView.byId("apt_cliente").setEnabled(true);
		console.log(Reasignacion);
	},
	IntervalKPI:function(){
		var oThis=this;
		this.KPIinterval = setInterval(function(){
			oThis.on_load_ubic();
		}, 60000);
	}
    });
});