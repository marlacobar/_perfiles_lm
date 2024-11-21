sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
"../../formatter/fm_status",
    'sap/ui/model/json/JSONModel',
   'sap/ui/core/BusyIndicator',
], function(JQuery, BaseController, MessageToast, MessageBox,formatter, JSONModel,BusyIndicator) {
    "use strict";
	var oView;
	var  DocumentoGlobal='';
	var InputsRem = 0;
	var RegistroID="";
	var oModelBsc = new sap.ui.model.json.JSONModel();
	var PesajeManual = 0;
	var BasculaAutoriza=1;

    return BaseController.extend("sap.ui.demo.webapp.controller.Materiales.BasculaNuevo", {
         formatter: formatter,
        onInit: function() {
            //jQuery.sap.getUriParameters().get("Plant")
            var oRouter = this.getRouter();
            oRouter.getRoute("BasculaNuevo").attachMatched(this._onRouteMatched, this);
	oModelBsc.setData(null);
	oView = this.getView();
	oView.setModel(oModelBsc,"data");
	this.onInitView();
	PesajeManual=1;
	//this.onValidarPesoManual();
        },	

	beforeNavBack:function(){
		oModelBsc.setData(null);
		oView.setModel(oModelBsc,"data");
		this.onNavBack();
		this.onInitView();
		$.ajaxSetup({
    			beforeSend:null,
    			complete:null,
		});
	},

        _onRouteMatched: function(oEvent) {
            this._getUsuario("username");
	$.ajaxSetup({
    		beforeSend:function(){
			BusyIndicator.show(0);
    		},
    		complete:function(){
			BusyIndicator.hide();
    		}
	});
        },
	onValidarPesoManual(){
		var path = "GALVASID/DatosTransaccionales/Transportes/Transaction/Validacion_Bascula";
		var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
		uri = uri.replace(/\s+/g, '');
		$.ajax({
			async: false,
			type: "POST",
			url: uri,
			dataType: "xml",
			cache: false,
			success: function (xml) {
				var opElement = xml.getElementsByTagName("Row")[0].firstChild;
				var aData = JSON.parse(opElement.firstChild.data);		                        
				PesajeManual = aData.TIPO_PESAJE;
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log("ERROR");
			}
		});
		
	},
	onGuardarProducto:function(){
		var transporte = oView.byId("basc_transporte").getValue();
		var producto = oView.byId("basc_producto").getValue();
		var oData={
			TRANSPORTE:transporte,
			PRODUCTO:producto
		};
		var path = "GALVASID/DatosTransaccionales/Transportes/Transaction/Upd_Registro_Producto";
		var uri = "/XMII/Runner?Transaction=" + path +"&OutputParameter=JsonOutput&Content-Type=text/xml";
		uri = uri.replace(/\s+/g, '');
		$.ajax({
			async: false,
			type: "POST",
			crossDomain: true,
			url: uri,
			dataType: "xml",
			data:oData,
			cache: false,
			success: function (xml) {
				var opElement = xml.getElementsByTagName("Row")[0].firstChild;
				var aData = JSON.parse(opElement.firstChild.data);
		                        if (aData.ERROR !== "") {
					MessageBox.alert(aData.ERROR);
		                        }
		                        else {
					MessageBox.alert(aData.MESSAGE);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log("ERROR");
			}
		});		
	},
	onSolicitar:function(oEvent){
		var oSelectedItem = oEvent.getSource().getParent();
		var oBindingContext = oSelectedItem.getBindingContext();
		var transporte =oBindingContext.getProperty('TRANSPORTE');
		var user=this.byId("username").getText();
		var aData={
			ID : transporte,
			USUARIO: user.substring(0,10),
			AREA : "BASCULA" 
		}
		var path = "GALVASID/DatosTransaccionales/Transportes/Transaction/Ins_TransporteSolicitud";
		var uri = "/XMII/Runner?Transaction=" + path +	"&OutputParameter=JsonOutput&Content-Type=text/xml";
		uri = uri.replace(/\s+/g, '');
		$.ajax({
			async: false,
			type: "POST",
			crossDomain: true,
			url: uri,
			data: aData,
			dataType: "xml",
			cache: false,
			success: function (xml) {
				var opElement = xml.getElementsByTagName("Row")[0].firstChild;
				var aData = JSON.parse(opElement.firstChild.data);
		                        if (aData.ERROR !== "" || aData.ERROR !==undefined) {
					MessageBox.alert(aData.ERROR);
		                        }
		                        else {
					MessageBox.alert(aData.MESSAGE);
				}

			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log("ERROR");
			}
		});
	},
	onPesajeManual:function(transporte,tipo){
		var Pesaje=(tipo==1?"TARA":(tipo==2?"BRUTO":"FINAL"));
		if(!this.oDialogPM){
			this.oDialogPM = oView.byId("DGPesajeManual");
			this.oDialogPM = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.PesajeManual", this);
			oView.addDependent(this.oDialogPM);
		}
		this.oDialogPM.open();
		oView.byId("pm_peso").setValue("");
		oView.byId("pm_tppesaje").setValue(Pesaje);
		oView.byId("pm_transporte").setValue(transporte);
	},
	onGuardarPesoManual:function(){
		var transporte = oView.byId("pm_transporte").getValue(); 
		var peso = oView.byId("pm_peso").getValue();
		var tipopeso = oView.byId("pm_tppesaje").getValue();
		var tipo = (tipopeso=="TARA"?1:(tipopeso=="BRUTO"?2:3));
		this.onPesaje(transporte,tipo,peso);
		this.onClosePesajeManual();
	},
	onClosePesajeManual:function(){
		this.oDialogPM.close();
	},
	onTransportes:function(){
		oView.getModel().setProperty('/TituloDetalle', "Detalle Fila Bascula");
		var oThis = this;
		if(!this.oDialogR){
			this.oDialogR = oView.byId("DGTBL");
			this.oDialogR = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Registros", this);
			oView.addDependent(this.oDialogR);
		}
		this.oDialogR.onAfterRendering = function(){			
			oView.byId("KTBASC").setVisible(true);
			var oData = {
				"ESTATUS" : "FILA_BASCULA",
				"PAGINA":"BASCULA"
		            }
			oThis._base_onloadTable("KTBASC",oData, "GALVASID/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Ubic", "Reporte", "");
		}
		this.oDialogR.open();
		
	},
	/*InfoBascula:function(oEvent){
		var oSelectedItem = oEvent.getSource().getParent();
		var oBindingContext = oSelectedItem.getBindingContext();
		var tarjeton =oBindingContext.getProperty('TARJETON');
		this.onCloseTblRegistros();
		console.log(tarjeton);
		oView.byId('basc_tarjeton').setText(tarjeton);
		var oThis=this;
		setTimeout(function(){
			oThis.onTraerDatos();
		}, 1000);
	},*/

	onValidaTransporte:function(){
		var transporte = oView.byId("basc_transporte").getValue();
		if(transporte === ""){
			this.getOwnerComponent().openHelloDialog("Favor de Ingresar un Tarjeton");
			return;
                	}else{
			return transporte;
		}
	},
	onCloseTblRegistros:function(){
		this.oDialogR.close();
	},
	onTraerDatos:function(){
		var transporte = this.onValidaTransporte();
		oModelBsc.setData(null);
		var oThis = this;
		oThis.onInitView();
		if(transporte !== undefined){
			var oData={
				TRANSPORTE : transporte
			};
			var path = "GALVASID/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Bascula";
			var uri ="/XMII/Runner?Transaction=" + path +"&OutputParameter=JsonOutput&Content-Type=text/xml";
			uri = uri.replace(/\s+/g, '');

			$.ajax({
				async: false,
				type: "POST",
				crossDomain: true,
				url: uri,
				dataType: "xml",
				cache: false,
				data:oData,
				success: function (xml) {
					var opElement = xml.getElementsByTagName("Row")[0].firstChild;
					var aData = eval(opElement.firstChild.data);
			                        if (aData[0].ERROR !== undefined) {
						MessageBox.alert(aData[0].ERROR);
			                        }
			                        else {
						var res = JSON.parse(opElement.firstChild.data);
						oModelBsc.setData(res[0]);
						RegistroID = res[0].FOLIO;
						oView.setModel(oModelBsc,"data");
						oThis.onSetView(res[0]);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log("ERROR");
				}
			});
		}
	},
	onAgregarRem:function(){
		if(!this.oDialogRem){
			this.oDialogRem = oView.byId("DGAgregaRemision");
			this.oDialogRem = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.AgregaRemisiones", this);			
		}
		this.oDialogRem.open();
		this.onSetDialogRemision();
	},
	onCloseAddRemision:function(){
		this.oDialogRem.close();
		if(InputsRem>0){
			for(var x = 0;x<InputsRem;x++ ){
				oView.byId("add_rem_"+ x).destroy();
			}
		}
		InputsRem= 0;
	},
	onSetDialogRemision:function(){
		if(InputsRem>0){
			for(var x = 0;x<InputsRem;x++ ){
				oView.byId("add_rem_"+ x).destroy();
			}
		}
		
		var _oSF2 = oView.byId("SFMAddRem");
		var data = oView.getModel("data").getData();
		if(data.REMISIONES > 0 ){	
			var rems = data.REMISION.split(",");
			InputsRem = data.REMISIONES;
			for(var i=0; i < data.REMISIONES;i++){
				_oSF2.addContent(new sap.m.Label({
					text:""
    				}));
				_oSF2.addContent(new sap.m.Input({
					id : oView.createId("add_rem_" + i), 
					value:rems[i],
					enabled: true
    				}));
			}
		}
		console.log(InputsRem);
	},
	onAceptaAddRemision:function(){
		console.log(InputsRem);
		var remisiones = "";
		if(InputsRem >0 ){
			for(var x = 0;x<InputsRem;x++ ){
				remisiones = remisiones + oView.byId("add_rem_"+ x).getValue() + ",";
			}
		}
		remisiones = remisiones.slice(0, -1);
		//console.log(remisiones+ "///" + 	RegistroID);
			var oData={
				REGISTROID : RegistroID,
				REMISIONES : remisiones
			};
			var path="GALVASID/DatosTransaccionales/Transportes/Transaction/Ins_Transporte_Remisiones";
			var uri = "/XMII/Runner?Transaction="+path+"&OutputParameter=*&Content-Type=text/xml";
	            	uri = uri.replace(/\s+/g, '');
            		var Othis = this;
	            	$.ajax({
            	    		type: "GET",
                			url: uri,
                			dataType: "xml",
	                		cache: false,
            	    		data: oData,
				dataType: "xml",
	            	})
			.done(function (xmlDOM) {
				var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
				if (opElement.firstChild !== null) {
					var aData = JSON.parse(opElement.firstChild.data);
					console.log(aData);
			                        if (aData.ERROR !== undefined && aData.ERROR != "") {
						MessageBox.alert(aData.ERROR);
			                        }else{
						Othis.onCloseAddRemision();
					}					
		                    }
		                    else {
		                        MessageBox.alert("La solicitud ha fallado: ¿Hay conexión de red?");
		                    }
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				if (console && console.log) {
					MessageToast.show("La solicitud a fallado: " + textStatus);
				}
			});	
	},
	onAddLineRemision:function(){
		var _oSF2 = oView.byId("SFMAddRem");
		_oSF2.addContent(new sap.m.Label({
			text:""
    		}));
		_oSF2.addContent(new sap.m.Input({
			id : oView.createId("add_rem_" + InputsRem), 
			enabled: true
    		}));
		InputsRem ++;
	},
	onInitView:function(){
		RegistroID = "";
		oView.byId("btnrecibemat").setVisible(false);
		oView.byId("btnpesajefinal").setVisible(false);
		oView.byId("btnaddrem").setVisible(false);
		oView.byId("btnboleta").setVisible(false);
		oView.byId("btnsalida").setVisible(false);
		oView.byId("btncambiocont").setVisible(false);
		oView.byId("btnregenera").setVisible(false);
		oView.byId("lbl_pcarga").setVisible(false);
		oView.byId("basc_pcarga").setVisible(false);
		oView.byId("lbl_pextra").setVisible(false);
		oView.byId("basc_pextra").setVisible(false);
		oView.byId("lbl_tcontenedor").setVisible(false);
		oView.byId("basc_tcontenedor").setVisible(false);
		oView.byId("btnpesajetara").setEnabled(false);
		oView.byId("btnpesajebruto").setEnabled(false);
		oView.byId("btnproducto").setEnabled(false);
		oView.byId("basc_producto").setEnabled(false);
	},
	onViewContenedor:function(){
		if(!this.oDialogCTN){
			this.oDialogCTN = oView.byId("DGCTN");
			this.oDialogCTN = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Contenedores", this);
			oView.addDependent(this.oDialogCTN);
		}
		this.oDialogCTN.open();
		oView.byId("rs_select").setVisible(true);
		oView.byId("cnt_nuevo").setVisible(true);
		var data = oView.getModel("data").getData();
		var oData = {
			PRVID : data.PRVID
		};
		this._base_onloadTable("KTCTN",oData, "GALVASID/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Contenedores", "Reporte", "");
	},
	onCloseTblContenedores:function(){
		this.oDialogCTN.close();
	},
	onNuevoContenedor:function(){
		oView.byId("cont_numero").setValue("");
		oView.byId("cont_tara").setValue("");
		oView.byId("cont_tara").setEnabled(true);
		oView.byId("cont_numero").setEnabled(true);
		this.onCloseTblContenedores();
	},
	onSelCont:function(oEvent){
		var oSelectedItem = oEvent.getSource().getParent();
		var oBindingContext = oSelectedItem.getBindingContext();
		var cont =oBindingContext.getProperty('CONTENEDOR');
		var peso_tara =oBindingContext.getProperty('PESO_TARA');
		oView.byId("cont_numero").setValue(cont);
		oView.byId("cont_tara").setValue(peso_tara);
		this.onCloseTblContenedores();
	},
	onSetView:function(oData){
		oView.byId("lbltranprov").setText("Linea Transp.");
		oView.byId("lbl_plana").setText("Placas Plana");
		oView.byId("lbl_plana").setVisible(true);
		oView.byId("basc_plana").setVisible(true);
		oView.byId("btnproducto").setEnabled(true);
		oView.byId("basc_producto").setEnabled(true);
		if(oData.CICLO){
			switch(oData.CICLO){
				case "DESCARGA":
					oView.byId("btnrecibemat").setVisible(true);
					oView.byId("btnaddrem").setVisible(true);
					if(oData.FECHAINGRESO !="TimeUnavailable"){
						if(oData.PESAJE_BRUTO >0){
							oView.byId("btnpesajetara").setEnabled(true);
						}
						oView.byId("btnpesajebruto").setEnabled(true);
						if(oData.PESAJE_TARA >0 && oData.PESAJE_BRUTO >0){
							oView.byId("btnboleta").setVisible(true);
							//oView.byId("btnregenera").setVisible(true);
						}
					}
				break;
				case "CARGA":
					oView.byId("lbl_pcarga").setVisible(true);
					oView.byId("basc_pcarga").setVisible(true);
					oView.byId("lbl_pextra").setVisible(true);
					oView.byId("basc_pextra").setVisible(true);
					if(oData.FECHAINGRESO !="TimeUnavailable"){
						if(oData.PESAJE_TARA >0 ){
							oView.byId("btnpesajebruto").setEnabled(true);
						}
						oView.byId("btnpesajetara").setEnabled(true);
						if(oData.PESAJE_TARA >0 && oData.PESAJE_BRUTO >0){
							oView.byId("btnpesajefinal").setVisible(true);
							oView.byId("btnboleta").setVisible(true);
						}
					}
				break;
				case "CHATARRA":
					oView.byId("lbltranprov").setText("Cliente");
					oView.byId("lbl_plana").setVisible(false);
					oView.byId("basc_plana").setVisible(false);
					oView.byId("lbl_contenedor").setVisible(true);
					oView.byId("basc_contenedor").setVisible(true);
					if(oData.FECHAINGRESO !="TimeUnavailable"){
						if( oData.SALIDA_CONTENEDOR=="1"){
							oView.byId("btntaracont").setVisible(true);
							oView.byId("lbl_tcontenedor").setVisible(true);
							oView.byId("basc_tcontenedor").setVisible(true);
							if(oData.PESAJE_TARA >0 ){
								oView.byId("btnpesajebruto").setEnabled(true);
							}
							oView.byId("btnpesajetara").setEnabled(true);
						}else{
							if(oData.PESAJE_BRUTO >0 ){
								oView.byId("btnpesajetara").setEnabled(true);
							}
							oView.byId("btnpesajebruto").setEnabled(true);
						}
						if( oData.PESAJE_TARA >0 && oData.PESAJE_BRUTO >0){
							oView.byId("btnboleta").setVisible(true);
							if( oData.SALIDA_CONTENEDOR=="0"){
								oView.byId("btncambiocont").setVisible(true);
							}
						}					
					}
				break;
				default:
					oView.byId("btnpesajetara").setEnabled(true);
					oView.byId("btnpesajebruto").setEnabled(true);
					oView.byId("btnboleta").setVisible(true);
				break;
			}
		}		
	},
	onCambiarContenedor:function(){
		if(!this.oDialogCC){
			this.oDialogCC = oView.byId("DGCambioContenedor");
			this.oDialogCC = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.CambioContenedor", this);	
			oView.addDependent(this.oDialogCC);
		}
		this.oDialogCC.open();
		oView.byId("cont_numero").setEnabled(false);
		oView.byId("cont_tara").setEnabled(false);
	},
	onActualizaContenedor:function(){
		if(!this.oDialogTC){
			this.oDialogTC = oView.byId("DGTaraContenedor");
			this.oDialogTC = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.TaraContenedor", this);	
			oView.addDependent(this.oDialogTC);
		}
		this.oDialogTC.onAfterRendering = function(){
			var data = oView.getModel("data").getData();
			oView.byId("tc_contenedor").setValue(data.CONTENEDOR);
			oView.byId("tc_tara").setValue(data.TARA_CONTENEDOR);
			oView.byId("tc_cotid").setText(data.CONTENEDORID);
		}
		this.oDialogTC.open();		
	},
	onCloseCambioContenedor:function(){
		this.oDialogCC.close();
	},
	onCloseTaraContenedor:function(){
		oView.byId("tc_contenedor").setValue("");
		oView.byId("tc_tara").setValue("");
		oView.byId("tc_cotid").setText("");
		this.oDialogTC.close();
	},
	ActualizaTaraContenedor:function(){
		var contenedor = oView.byId("tc_contenedor").getValue();
		var tara =oView.byId("tc_tara").getValue();
		var contenedorid = oView.byId("tc_cotid").getText();
		var oData={
				CONTENEDOR: contenedor,
				CONTENEDORID: contenedorid,
				TARA_CONTENEDOR: tara,
			};
		console.log(oData);
		var path="GALVASID/DatosTransaccionales/Transportes/Transaction/ins_ActualizaTaraContenedor";
		var uri = "/XMII/Runner?Transaction="+path+"&OutputParameter=JsonOutput&Content-Type=text/xml";
	            uri = uri.replace(/\s+/g, '');
           		var Othis = this;
	           	$.ajax({
			type: "POST",
           			url: uri,
           			dataType: "xml",
             		cache: false,
	         	    	data: oData,
            	})
		.done(function (xmlDOM) {
			var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
			if (opElement.firstChild !== null) {
				var aData = JSON.parse(opElement.firstChild.data);
	            	            if (aData.ERROR  !="---" && aData.ERROR != undefined)  {
					MessageBox.alert(aData.ERROR);
		                        }else {
					Othis.onTraerDatos();
					Othis.onCloseTaraContenedor();
	            	            }
			}
			else {
				Othis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: ¿Hay conexión de red?");
			}
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			if (console && console.log) {
				MessageToast.show("La solicitud a fallado: " + textStatus);
			}			
		});
	},
	onRegistroCambio:function(){
		var othis=this;
		MessageBox.warning("Esto cerrara el tarjeton actual y se ingresara de nuevo con el nuevo contenedor, ¿Deseas Continuar?", {
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK,
			onClose: function (sAction) {
				if(sAction=="OK"){
					othis.onCambioContenedor();
				}
			}
		});
	},
	onReGenerar:function(){
		if(!this.oDialogRG){
			this.oDialogRG = oView.byId("DGGeneraRegistro");
			this.oDialogRG = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.GenerarRegistro", this);	
			oView.addDependent(this.oDialogRG);
		}
		var transporte=oView.byId("basc_transporte").getValue();
		oView.byId("rg_transporte").setValue(transporte);
		this.oDialogRG.open();
	},
	onCloseGeneraRegistro:function(){
		oView.byId("rg_transporte").setValue("");
		this.oDialogRG.close();
	},
	onValidarRemision:function(){
		var rem = oView.byId("rg_ordcompra").getValue();
		var oThis = this;
		if (rem !== ""){
			var oData={
				REMISION : rem
			};
			var path = "GALVASID/DatosTransaccionales/Transportes/Transaction/Validar_Remision_Pedido";
			var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
			uri = uri.replace(/\s+/g, '');
			$.ajax({
				type: "POST",
				url: uri,
				dataType: "xml",
				cache: false,
				data:oData,
				success: function (xml) {
					var opElement = xml.getElementsByTagName("Row")[0].firstChild;
					var aData = JSON.parse(opElement.firstChild.data);
			                        if (aData.ERROR !== undefined) {
						MessageBox.alert(aData.ERROR);
						//oThis.getOwnerComponent().openHelloDialog();
			                        }else{
						if(aData.TIPO == "REMISION"){
							oView.byId("rg_ordcompra").setValue(aData.ORDCOMPRA);
						}
						ValidaRemision=1;
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log("ERROR");
				}
			});
		}else{
			//oThis.getOwnerComponent().openHelloDialog("Favor de ingresar pedido o remision");
			//alert("");
			MessageBox.alert("Favor de ingresar pedido o remision");
		}
	},
	onRG:function(){
		var transporte = oView.byId("rg_transporte").getValue();
		var ordencompra = oView.byId("rg_ordcompra").getValue();
		if(transporte !="" && ordencompra !="" && ValidaRemision != 0){
			var oData={
				TRANSPORTE: transporte,
				ORDENCOMPRA: ordencompra,
			};
			var path="GALVASID/DatosTransaccionales/Transportes/Transaction/Ins_RegistroDescarga";
			var uri =  "/XMII/Runner?Transaction="+path+"&OutputParameter=*&Content-Type=text/xml"
		            uri = uri.replace(/\s+/g, '');
            		var Othis = this;
	            	$.ajax({
				type: "GET",
           				url: uri,
           				dataType: "xml",
               			cache: false,
	           	    		data: oData,                			
            		})
			.done(function (xmlDOM) {
				var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
				if (opElement.firstChild !== null) {
					var aData = JSON.parse(opElement.firstChild.data);
		            	            if (aData.ERROR !== "") {
						MessageBox.alert(aData.ERROR);
			                        }else {
						Othis.onCloseGeneraRegistro();
						oView.byId("basc_transporte").setValue(aData.TRANSPORTE_NUEVO);
						Othis.onTraerDatos();
		            	            }
				}
				else {
					Othis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: ¿Hay conexión de red?");
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				if (console && console.log) {
					MessageToast.show("La solicitud a fallado: " + textStatus);
				}
			});
		}else{
			MessageBox.alert("Favor de ingresar los datos necesarios.");
		}
	},
	onCambioContenedor:function(){
		var transporte = oView.byId("basc_transporte").getValue();
		var contenedor = oView.byId("cont_numero").getValue();
		var conten_tara = oView.byId("cont_tara").getValue();
		if(transporte !="" && contenedor !="" && conten_tara != ""){
			var oData={
				TRANSPORTE: transporte,
				REGISTROID: RegistroID,
				CONTENEDOR: contenedor,
				TARA_CONTENEDOR: conten_tara,
			};
			var path="GALVASID/DatosTransaccionales/Transportes/Transaction/Ins_CambioContenedor";
			var uri =  "/XMII/Runner?Transaction="+path+"&OutputParameter=*&Content-Type=text/xml"
		            uri = uri.replace(/\s+/g, '');
            		var Othis = this;
	            	$.ajax({
				type: "GET",
           				url: uri,
           				dataType: "xml",
               			cache: false,
	           	    		data: oData,                			
            		})
			.done(function (xmlDOM) {
				var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
				if (opElement.firstChild !== null) {
					var aData = JSON.parse(opElement.firstChild.data);
		            	            if (aData.ERROR  !="") {
						MessageBox.alert(aData.ERROR);
			                        }else {
						Othis.onCloseCambioContenedor();
						oView.byId("basc_transporte").setValue(aData.TRANSPORTE_NUEVO);
						Othis.onTraerDatos();
		            	            }
				}
				else {
					Othis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: ¿Hay conexión de red?");
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				if (console && console.log) {
					MessageToast.show("La solicitud a fallado: " + textStatus);
				}			
			});
		}else{
			MessageBox.alert("Favor de ingresar los datos necesarios.");
		}
	},
	onTaraContenedor:function(){
		var contenedor = oView.byId("cont_numero").getValue();
		var oData={
			CONTENEDOR : contenedor
		};
		var path="GALVASID/DatosTransaccionales/Transportes/Transaction/Get_Transportes_Contenedor";
		var uri =  "/XMII/Runner?Transaction="+path+"&OutputParameter=*&Content-Type=text/xml"
	            uri = uri.replace(/\s+/g, '');
            	var Othis = this;
	            $.ajax({
			type: "GET",
           			url: uri,
           			dataType: "xml",
               		cache: false,
           	    		data: oData,                			
            	})
		.done(function (xmlDOM) {
			var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
			if (opElement.firstChild !== null) {
				var aData = JSON.parse(opElement.firstChild.data);
		                        if (aData.ERROR != "") {
					oView.byId("cont_tara").setValue(0);
					oView.byId("cont_tara").setEnabled(true);
					MessageBox.alert(aData.ERROR + ", Favor de Ingresarlo!");
		                        }else {
					oView.byId("cont_tara").setValue(aData.TARA);
		                        }
			}
			else {
				oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: ¿Hay conexión de red?");
			}
		})
		.fail(function (jqXHR, textStatus, errorThrown) {
			if (console && console.log) {
				MessageToast.show("La solicitud a fallado: " + textStatus);
			}
		});
	},
	onPesajeSist:function(){
		var peso_tara = oView.byId("basc_tara").getValue();
		var peso_bruto = oView.byId("basc_bruto").getValue();
		var peso_carga = oView.byId("basc_pcarga").getValue();
		
		var neto = peso_bruto - peso_tara;
		oView.byId("basc_neto").setValue(neto);
		var dif = Math.abs(neto - peso_carga);
		var tol = peso_carga * .0065;
		var Othis = this;
		if(dif>tol){
			MessageBox.alert("Fuera de tolerancia " + tol + " por:" + dif   );
		}else{
			Othis.getOwnerComponent().openHelloDialog("Aceptado, favor de continuar");
		}
	},
	onValidatePeso:function(tipo){
		var peso_tara = oView.byId("basc_tara").getValue();
		var peso_bruto = oView.byId("basc_bruto").getValue();
		var transporte = this.onValidaTransporte();
		var valpeso = 0;
		this.onValidarPesoManual();
		var othis= this;
		if(transporte !== undefined){
			switch(tipo){
				case 1:
					if(peso_tara >0){
						valpeso=1;
					}
				break;
				case 2:
					if(peso_bruto >0){
						valpeso=1;
					}
				break;
			}
			if(valpeso==1){
				MessageBox.warning("Ya se tiene el pesaje a realizar, ¿Desea Actualizar el pesaje?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {
						if(sAction=="OK"){
							if(PesajeManual == 1){
								othis.onPesajeManual(transporte,tipo);
							}else{
								othis.onPesaje(transporte,tipo);
							}
						}
					}
				});
			}else{
				if(PesajeManual == 1){
					othis.onPesajeManual(transporte,tipo);
				}else{
					othis.onPesaje(transporte,tipo);
				}
			}
			
		}else{
			MessageBox.alert("Favor de buscar primero un transporte");
		}		
	},
	onPesaje:function(transporte,tipo,peso,autorizado){
		console.log(tipo);
		var peso_extra =  parseInt(oView.byId("basc_pextra").getValue());
		var user = oView.byId("username").getText();
		var autoriza = (autorizado == "1" ? "true":false);
			var oData={
				TRANSPORTE : transporte,
				PESAJE: tipo,
				PESO:peso,
				PESO_EXTRA : peso_extra,
				AUTORIZADO:autoriza,
				USUARIO:user
			};
			var path="GALVASID/DatosTransaccionales/Transportes/Transaction/Ins_RegistroBascula";
			var uri =  "/XMII/Runner?Transaction="+path+"&OutputParameter=*&Content-Type=text/xml"
	            	uri = uri.replace(/\s+/g, '');
            		var Othis = this;
	            	$.ajax({
            	    		type: "GET",
                			url: uri,
                			dataType: "xml",
	                		cache: false,
            	    		data: oData,                			
	            	})
			.done(function (xmlDOM) {
				var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
				if (opElement.firstChild !== null) {
					var aData = eval(opElement.firstChild.data);
			                        if (aData[0].ERROR !== undefined) {
						if(aData[0].TYPE =="W" && BasculaAutoriza==1){
							MessageBox.warning(aData[0].ERROR + ", ¿Se autoriza el registro ?", {
								actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
								emphasizedAction: MessageBox.Action.OK,
								onClose: function (sAction) {
									if(sAction=="OK"){
										Othis.onPesaje(transporte,tipo,peso,1);
									}
								}
							});
						}else{
							MessageBox.alert(aData[0].ERROR);
						}
			                        }
			                        else {
              					MessageBox.information("Aceptado, favor de continuar");
						if(tipo == "3"){
							Othis.onBoleta();							
						}
			                        }
					Othis.onTraerDatos();
		                    }
		                    else {
		                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: ¿Hay conexión de red?");
		                    }
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				if (console && console.log) {
					MessageToast.show("La solicitud a fallado: " + textStatus);
				}
			});
	},
	onRecibirMat:function(){
		$.ajaxSetup({
    			beforeSend:null,
    			complete:null,
		});
		var transporte = this.onValidaTransporte();
		if(transporte !== undefined){
			var pedido = oView.byId("basc_transporte").getValue();
			this.getRouter().navTo("recibirMaterialNuevo", {
            	        		tarjeton: transporte
			});
		}
	},
	onClearData:function(){
		oView.byId("basc_transporte").setValue ="";
		oModelBsc.setData(null);
		oView.setModel(oModelBsc,"data");
	},
	onBoleta: function (Tarjeton) {
            	var wind = window.open("", "prntBoleta");
	            var lines = '<head>  \
<meta charset="utf-8" />  \
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">  \
<title>Galvasid - Boleta de Báscula</title>  \
<meta name="description" content="">  \
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"> \
<script src="js/jquery-3.4.1.slim.min.js"></script> \
<link rel="stylesheet" href="css/bootstrap4.4.1.min.css">\
<script src="js/popper.min.js"></script> \
<script src="js/bootstrap.min.js"></script> \
<link rel="stylesheet" type="text/css" href="css/custom.css">  \
</head>  \
<body>  \
<div class="print">\
<!--<div id="wrapper"> -->\
<div  id="NW">\
<div style="padding-left:7.8mm; padding-right:8.6mm; padding-top:52mm" >  \
<table class="table table-borderless">\
<tr >  \
<td  class="text-center"></span></td>  \
<td colspan="2"  style="background-color:black !important"class="text-center"><strong></strong></td>  \
<td  class="text-center"></span></td>  \
</tr> \
<tr >  \
<td  class="text-left"><strong>TRANSPORTE:</strong></td>  \
<td  class="text-center"><span id="transporteNW"/></td>  \
<td  class="text-left"><strong>BOLETA:</strong></td>  \
<td  class="text-center"><span id="folioNW"/></td>  \
</tr> \
</table>\
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong> <span id="proveedorNW"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferNW"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoNW"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaNW"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorNW"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoNW"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="entradaNW"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="salidaNW"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="2"><strong>Peso Neto: </strong><span id="pesoNW"></span> Kg </td>   \
<td colspan="2" style="text-align: right;"><strong> FO-CP-009 REV.03 </strong></td>   \
</tr>   \
</table> \
</div> \
</div>\
<div  id="NE">\
<div style="padding-left:7.8mm; padding-right:8.6mm; padding-top:52mm" >  \
<table class="table table-borderless">\
<tr >  \
<td  class="text-center"></span></td>  \
<td colspan="2"  style="background-color:black !important"class="text-center"><strong></strong></td>  \
<td  class="text-center"></span></td>  \
</tr> \
<tr >  \
<td  class="text-left"><strong>TRANSPORTE:</strong></td>  \
<td  class="text-center"><span id="transporteNE"/></td>  \
<td  class="text-left"><strong>BOLETA:</strong></td>  \
<td  class="text-center"><span id="folioNE"/></td>  \
</tr> \
</table>\
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong><span id="proveedorNE"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferNE"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoNE"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaNE"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorNE"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoNE"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="entradaNE"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="salidaNE"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="2"><strong>Peso Neto: </strong><span id="pesoNE"></span> Kg </td>   \
<td colspan="2" style="text-align: right;"><strong> FO-CP-009 REV.03 </strong></td>   \
</tr>   \
</table> \
</div> \
</div>\
<div  id="SW">\
<div style="padding-left:7.8mm; padding-right:8.6mm; padding-top:41mm" >  \
<table class="table table-borderless">\
<tr >  \
<td  class="text-center"></span></td>  \
<td colspan="2"  style="background-color:black !important"class="text-center"><strong></strong></td>  \
<td  class="text-center"></span></td>  \
</tr> \
<tr >  \
<td  class="text-left"><strong>TRANSPORTE:</strong></td>  \
<td  class="text-center"><span id="transporteSW"/></td>  \
<td  class="text-left"><strong>BOLETA:</strong></td>  \
<td  class="text-center"><span id="folioSW"/></td>  \
</tr> \
</table> \
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong><span id="proveedorSW"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferSW"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoSW"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaSW"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorSW"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoSW"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="entradaSW"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="salidaSW"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="2"><strong>Peso Neto: </strong><span id="pesoSW"></span> Kg </td>   \
<td colspan="2" style="text-align: right;"><strong> FO-CP-009 REV.03 </strong></td>   \
</tr>   \
</table> \
</div> \
</div>\
<div id="SE">\
<div style="padding-left:7.8mm; padding-right:8.6mm; padding-top:41mm" >  \
<table class="table table-borderless">\
<tr >  \
<td  class="text-center"></span></td>  \
<td colspan="2"  style="background-color:black !important"class="text-center"><strong></strong></td>  \
<td  class="text-center"></span></td>  \
</tr> \
<tr >  \
<td  class="text-left"><strong>TRANSPORTE:</strong></td>  \
<td  class="text-center"><span id="transporteSE"/></td>  \
<td  class="text-left"><strong>BOLETA:</strong></td>  \
<td  class="text-center"><span id="folioSE"/></td>  \
</tr> \
</table>\
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong><span id="proveedorSE"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferSE"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoSE"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaSE"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorSE"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoSE"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="entradaSE"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 22mm;">\
<p>\
<span id="salidaSE"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="2"><strong>Peso Neto: </strong><span id="pesoSE"></span> Kg </td>   \
<td colspan="2" style="text-align: right;"><strong> FO-CP-009 REV.03 </strong></td>   \
</tr>   \
</table>  \
</div> \
</div>\
<!--</div> -->\
</div>\
</body>';

            wind.document.write(lines);
            var usuario =  this.byId("username").getText();
	var data = oView.getModel("data").getData();
            var folio, proveedor, chofer, vehiculo, placa, pesador, producto, entrada, salida, peso,transporte;
                        transporte = data.TRANSPORTE;
                        folio = data.BOLETA;
                        proveedor = data.TRANSPORTISTA;
                        chofer = data.CHOFER;
                        placa = data.PLACAS;
                        pesador = usuario;
		producto =data.PRODUCTO;
		switch(data.CICLO){
			case "DESCARGA":
				vehiculo="Vehiculo de carga con producto ";
				entrada = "Peso Bruto:" + data.PESAJE_BRUTO + " Kg";
				entrada = entrada + "<br>D/T : " + data.FECHA_BRUTO ;
				salida = "Peso Tara:" + data.PESAJE_TARA  + " Kg";
				salida = salida + "<br>D/T : " +  data.FECHA_TARA ;
		                        peso = data.PESAJE_NETO;
			break;
			case "CARGA":
				vehiculo="Vehiculo de carga vacio ";
				entrada =  "Peso Tara:" + data.PESAJE_TARA  + " Kg";
				entrada = entrada + "<br>D/T : " +   data.FECHA_TARA  ;
				salida =  "Peso Bruto:" + data.PESAJE_BRUTO   + " Kg";
				salida = salida + "<br>D/T : " +   data.FECHA_BRUTO  ;
		                        peso = data.PESAJE_NETO;
			break;
			case "OTRO":
				vehiculo="Vehiculo Otro ";
				entrada =  "Peso Tara:" + data.PESAJE_TARA  + " Kg";
				entrada = entrada + "<br>D/T : " +   data.FECHA_TARA  ;
				salida =  "Peso Bruto:" + data.PESAJE_BRUTO   + " Kg";
				salida = salida + "<br>D/T : " +   data.FECHA_BRUTO  ;
		                        peso = data.PESAJE_NETO;
			break;
			case "CHATARRA":
				vehiculo = (data.SALIDA_CONTENEDOR=="1" ? "Tolva con producto" : "Tolva vacio");
				producto = producto + " " + (data.SALIDA_CONTENEDOR=="1" ? "Tolva #" + data.CONTENEDOR  : "CONT#" + data.CONTENEDOR);
				entrada = (data.SALIDA_CONTENEDOR == "0" ? "Peso Bruto:" + data.PESAJE_BRUTO  : "Peso Tara:" + data.PESAJE_TARA  ) + " Kg";
				entrada = entrada + "<br>D/T : " + (data.SALIDA_CONTENEDOR == "0" ? data.FECHA_BRUTO  :  data.FECHA_TARA  );
				entrada = entrada + (data.SALIDA_CONTENEDOR=="0" ? "" :"<br>  Tolva Tara: " + data.TARA_CONTENEDOR + " Kg."); 
				salida = (data.SALIDA_CONTENEDOR == "0" ? "Peso Tara:" + data.PESAJE_TARA  : "Peso Bruto:" + data.PESAJE_BRUTO  ) + " Kg";
				salida = salida + "<br>D/T : " + (data.SALIDA_CONTENEDOR == "0" ? data.FECHA_TARA  :  data.FECHA_BRUTO  );
		                        peso = (data.SALIDA_CONTENEDOR == "0" ? data.PESAJE_NETO  :  data.PESAJE_NETO -  data.TARA_CONTENEDOR );
			break;
		}
                        //vehiculo = (data.CICLO  == "DESCARGA" ? "" : (data.CICLO == "CARGA" ? "Vehiculo de carga vacio" : "Contenedor" ));
                        /*
                        entrada = (data.CICLO == "DESCARGA" ? "Peso Bruto:" + data.PESAJE_BRUTO  : "Peso Tara:" + data.PESAJE_TARA  ) + " Kg";
		entrada = entrada + "<br>D/T : " + (data.CICLO == "DESCARGA" ? data.FECHA_BRUTO  :  data.FECHA_TARA  );
                        salida = (data.CICLO == "DESCARGA" ? "Peso Tara:" + data.PESAJE_TARA  : "Peso Bruto:" + data.PESAJE_BRUTO  ) + " Kg";
		salida = salida + "<br>D/T : " + (data.CICLO == "DESCARGA" ? data.FECHA_TARA  :  data.FECHA_BRUTO  );
		*/
                        setTimeout(function () {
                            wind.document.getElementById("transporteNW").innerHTML = transporte;
                            wind.document.getElementById("transporteNE").innerHTML = transporte;
                            wind.document.getElementById("transporteSE").innerHTML = transporte;
                            wind.document.getElementById("transporteSW").innerHTML = transporte;


                            wind.document.getElementById("folioNW").innerHTML = folio;
                            wind.document.getElementById("folioNE").innerHTML = folio;
                            wind.document.getElementById("folioSW").innerHTML = folio;
                            wind.document.getElementById("folioSE").innerHTML = folio;

                            wind.document.getElementById("proveedorNW").innerHTML = proveedor;
                            wind.document.getElementById("proveedorNE").innerHTML = proveedor;
                            wind.document.getElementById("proveedorSW").innerHTML = proveedor;
                            wind.document.getElementById("proveedorSE").innerHTML = proveedor;

                            wind.document.getElementById("choferNW").innerHTML = chofer;
                            wind.document.getElementById("choferNE").innerHTML = chofer;
                            wind.document.getElementById("choferSW").innerHTML = chofer;
                            wind.document.getElementById("choferSE").innerHTML = chofer;

                            wind.document.getElementById("vehiculoNW").innerHTML = vehiculo;
                            wind.document.getElementById("vehiculoNE").innerHTML = vehiculo;
                            wind.document.getElementById("vehiculoSW").innerHTML = vehiculo;
                            wind.document.getElementById("vehiculoSE").innerHTML = vehiculo;

                            wind.document.getElementById("placaNW").innerHTML = placa;
                            wind.document.getElementById("placaNE").innerHTML = placa;
                            wind.document.getElementById("placaSW").innerHTML = placa;
                            wind.document.getElementById("placaSE").innerHTML = placa;

                            wind.document.getElementById("pesadorNW").innerHTML = pesador;
                            wind.document.getElementById("pesadorNE").innerHTML = pesador;
                            wind.document.getElementById("pesadorSW").innerHTML = pesador;
                            wind.document.getElementById("pesadorSE").innerHTML = pesador;

                            wind.document.getElementById("productoNW").innerHTML = producto;
                            wind.document.getElementById("productoNE").innerHTML = producto;
                            wind.document.getElementById("productoSW").innerHTML = producto;
                            wind.document.getElementById("productoSE").innerHTML = producto;

                            wind.document.getElementById("entradaNW").innerHTML = entrada;
                            wind.document.getElementById("entradaNE").innerHTML = entrada;
                            wind.document.getElementById("entradaSW").innerHTML = entrada;
                            wind.document.getElementById("entradaSE").innerHTML = entrada;

                            wind.document.getElementById("pesoNW").innerHTML = peso;
                            wind.document.getElementById("pesoNE").innerHTML = peso;
                            wind.document.getElementById("pesoSW").innerHTML = peso;
                            wind.document.getElementById("pesoSE").innerHTML = peso;

                            wind.document.getElementById("salidaNW").innerHTML = salida;
                            wind.document.getElementById("salidaNE").innerHTML = salida;
                            wind.document.getElementById("salidaSW").innerHTML = salida;
                            wind.document.getElementById("salidaSE").innerHTML = salida;

                            wind.print();
                            wind.close();
                        }, 3000);

        },

onGeneraSalida: function() {
    var oThis = this;    
    var id_tr, placas, boleta;
    var data = oView.getModel("data").getData();
	console.log(data);
    var usuario = this.byId("username").getText();
    var codigo_trx;
    var Boleta_print;
        codigo_trx = data.TRANSPORTE;
        Boleta_print = data.BOLETA;	
        var windo = window.open("", "prntPasePesaje");
        var lines = ' <head>\
        <meta charset="utf-8" />\
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\
        <title></title>\
        <meta name="description" content="">\
        <meta name="viewport" content="width=device-width">\
        <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">\
        <script src="js/JsBarcode.all.min.js"></script>\
        </head>\
        <body>\
        <div id="Etiqueta_ZPL"  align="center">\
        <span style="margin-top:18px; font-size:13px;" id="Boleta_final"></span>\
        <svg style="margin-top:-25px;" id="barcode" ></svg>\
        </div>\
        </body>';
        //        <span style="margin-top:-35px;" id="fecha"></span>\
        windo.document.write(lines);
        //wind.document.getElementById("pesadorNW").innerHTML = pesador;

        setTimeout(function() {
            JsBarcode(windo.document.getElementById("barcode"), codigo_trx, {
                width: 2,
                height: 45,
                displayValue: false
            });
            //wind.document.getElementById("fecha").innerHTML = fecha_trx;
            windo.document.getElementById("Boleta_final").innerHTML = Boleta_print;

            windo.print();
            windo.close();
        }, 2000);
},
	
/*
        onTractor : function(){
            this.getRouter().navTo("tractor");            
        },
         oncargavacio : function(){
            this.getRouter().navTo("cargavacio");
        },
        oncargaproducto : function(){
            this.getRouter().navTo("cargaproducto");
        },
        onSalidaTractor : function(){
            this.getRouter().navTo("tractorsalida");
        },
        onSalidacargavacio : function(){
            this.getRouter().navTo("cargavaciosalida");
        },
         onSalidaProducto : function(){
            this.getRouter().navTo("cargaproductosalida");
        }
*/
    });
});