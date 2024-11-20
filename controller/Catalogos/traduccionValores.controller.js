sap.ui.define([
	'jquery.sap.global',
	"sap/ui/demo/webapp/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/export/Spreadsheet',
	"sap/m/MessageToast",
	'sap/ui/export/library',
	"../../formatter/fm_status",
	'sap/m/Token',
	"sap/ui/model/FilterOperator",
], function (jQuery, BaseController, JSONModel,Fragment,Filter,MessageBox,Export,ExportTypeCSV,Spreadsheet,MessageToast,exportLibrary,formatter,Token,FilterOperator) {
	"use strict";

	var user = '',
		key_proveedor = '',
		cat_reg = '';
	var oView, oThis,oDialog_Edit;
	var newModel = new sap.ui.model.json.JSONModel();
	var dummyData = [];	 
	var empty = {
		"Rowsets" : {"Rowset":[{"Row" : dummyData}] }
	};

	return BaseController.extend("sap.ui.demo.webapp.controller.Catalogos.traduccionValores", {
        
	formatter: formatter,
		
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("traduccionValores").attachMatched(this._onRouteMatched, this);	
			oView = this.getView();
			oThis = this;
		},

		_onRouteMatched: function (oEvent) {				
			var  oArgs = oEvent.getParameter("arguments");        
			//this._getUsuario("username","id_revision_lotes");
			this._getUsuario2("username");		
		},

		onSuggest: function(oEvent){
			var oInput = this.byId("SupplierSeach").getValue(),
				oData = {"Param.1": oInput },
				oThis = this,
				oPath = "MIIExtensions/Components/Query/getSuppliersbyDesc"; 
				
			var oModelMAT = new sap.ui.model.json.JSONModel();                                    
			var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
			var parameters = oData;
			oModelMAT.loadData(url, parameters, true, "POST");

			oModelMAT.attachRequestCompleted(function() {
				// IF Fatal Error
				if (oModelMAT.getData().Rowsets.FatalError) {
					oThis.byId(idObj).setBusy(false)
					console.log("Fatal Error");
					return;
				}
				if(oModelMAT.getData().Rowsets.Rowset[0].Row){
                            			oThis.getView().setModel(oModelMAT, "SupplierModel");
				}
                		});
			oThis.byId("SupplierSeach").setValue(oInput);
		},

         onSuggestionItemSelected: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            if(oItem){
                key_proveedor = oItem.getKey();
                this.onLoadTable({"Param.1":key_proveedor},"MII/DatosTransaccionales/Pedidos/Query/sel_reg_traduccion","char"); 
            }
                
        },                
          
          enableControl : function(value) {
            return !!value;
          },
        
          disableControl : function(value) {
            return !value;
          },

	onNewChar : function(oEvent) {
		if(!this.oDialog_Edit){
			this.oDialog_Edit = oView.byId("translatechars_edit");
			this.oDialog_Edit = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Catalogos.TranslateChars_Edit", this);
			oView.addDependent(this.oDialog_Edit);
			this.oDialog_Edit.onBeforeClose = function(){
				this.oDialog_Edit.destroy();
			};
		}
		this.oDialog_Edit.onAfterRendering = function(){
			oView.byId("che_desc").setValue("");
			oView.byId("che_tipo").setSelectedKey("");
			oView.byId("che_codgalv").setValue("");
			oView.byId("che_codprv").setValue("");
			oView.byId("che_conversion").setValue("");
		}
		this.oDialog_Edit.open();
          },
	onCancelChars:function(){
		this.oDialog_Edit.close();
	},
	onNewCharCat : function(oEvent) {
		var oModel = oView.getModel("cat");
		var Registros = (oModel != undefined ? oModel.getData() : empty) ;
		console.log(Registros.Rowsets.Rowset[0].Row);
		var obj = {
			CREATENEWCAT: false,
			REMOVENEWCAT: false,
			SAVENEWCAT: true,
			SAVENEWCATEDIT: true
		};
		Registros.Rowsets.Rowset[0].Row.push(obj);
		newModel.setData(Registros);
		oView.setModel(newModel,"cat");
          },

          onEditChar: function(oEvent){
		var oSelectedItem = oEvent.getSource().getParent();
		var oBindingContext = oSelectedItem.getBindingContext("char");
		console.log(oBindingContext);
		if(!this.oDialog_Edit){
			this.oDialog_Edit = oView.byId("translatechars_edit");
			this.oDialog_Edit = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Catalogos.TranslateChars_Edit", this);
			oView.addDependent(this.oDialog_Edit);
			this.oDialog_Edit.onBeforeClose = function(){
				this.oDialog_Edit.destroy();
			};
		}
		this.oDialog_Edit.onAfterRendering = function(){
			oView.byId("che_desc").setValue(oBindingContext.getProperty('CHAR_DESC'));
			oView.byId("che_tipo").setSelectedKey(oBindingContext.getProperty('TYPE'));
			oView.byId("che_codgalv").setValue(oBindingContext.getProperty('COD_CHAR'));
			oView.byId("che_codprv").setValue(oBindingContext.getProperty('COD_CHAR_SUP'));
			oView.byId("che_conversion").setValue(oBindingContext.getProperty('CON'));
		}
		this.oDialog_Edit.open();                
          },

	onEditCharCat: function(oEvent){
		var 
			obj = oEvent.getSource().getBindingContext("cat").getObject(),
			path = oEvent.getSource().getBindingContext("cat").getPath(),
			oModel = oView.getModel('cat');
		obj.SAVENEWCAT = true;
		obj.SAVENEWCATEDIT = false;
		obj.REMOVENEWCAT = false;
		oModel.setProperty(path, obj);
          },

	onViewCharCat: function(oEvent){
		var obj = oEvent.getSource().getBindingContext("char").getObject();

		if(!key_proveedor){
			MessageToast.show("Seleccione un proveedor");
			return;
		} 

		if(!obj.CHAR_DESC || !obj.TYPE || !obj.COD_CHAR || !obj.COD_CHAR_SUP){
			MessageToast.show("Llene todos los campos");
			return;
		}

		cat_reg = obj.COD_CHAR;

		if(!this.byId("translateChars")) {
			Fragment.load({
				id: oView.getId(),
				name: "sap.ui.demo.webapp.fragment.Catalogos.TranslateChars_Cat",
				controller: this
			}).then(function(oDialog) {
				oView.addDependent(oDialog);                    
				var oDialog = oThis.byId("translateChars");
				oDialog.onAfterRendering = function(){
					oThis.onLoadTable({"Param.1":key_proveedor,"Param.2":cat_reg},"GALVASID/DatosTransaccionales/Pedidos/Query/sel_cat_values","cat");
				}
				oDialog.open();
                		});
            	} else {
			this.byId("translateChars").open();
		}
	},


          _getUsuario2: function (id) {
		var oThis = this;

		$.ajax({
			type: "GET",
			url: "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
			dataType: "xml",
			cache: false,
			success: function (xml) {
				var nombre = $(xml).find('Profile').attr('firstname');
				var apellido = $(xml).find('Profile').attr('lastname');
				user = $(xml).find('Profile').attr('IllumLoginName');
				user = user.toUpperCase();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log("ERROR");
			}
		});
	},

	onSaveChar : function() {
		var oInput = this.byId("SupplierSeach").getValue(),
			oData,                
			oPath = 'MII/DatosTransaccionales/Pedidos/Transaction/ins_upd_reg_traduccion',
			url = "/XMII/Runner?Transaction=" + oPath + "&OutputParameter=XmlOutput&Content-Type=text/xml";                                                    
		if(!oInput){
			MessageToast.show("Seleccione un proveedor");
			return;
		}
	            var 	desc = oView.byId("che_desc").getValue(),
			tipo = oView.byId("che_tipo").getSelectedKey(),
			codgalv = oView.byId("che_codgalv").getValue(),
			codprv = oView.byId("che_codprv").getValue(),
			conv = oView.byId("che_conversion").getValue();
		
		if(!oInput|| !tipo|| !codgalv || !codprv || !conv){
                            MessageToast.show("Llene todos los campos");
                            return;
                        }
                      
                        oData = {
                            "PROVEEDOR": key_proveedor,
                            "TYPE": tipo,
                            "CHAR_DESC": desc,
                            "COD_CHAR": codgalv,
                            "COD_CHAR_SUP": codprv,
                            "CONVERSION": conv,
                            "USER": user
                        };
                         
		$.ajax({
			url: url,
			type: 'POST',
			data: $.param(oData),
			contentType: 'application/x-www-form-urlencoded',
			success: function(xml){
				if($(xml).find("ERRORES").text()!=0)
					MessageToast.show($(xml).find("MENSAJE").text());                     
				else
				{
					MessageToast.show($(xml).find("MENSAJE").text());
					oThis.onLoadTable({"Param.1":key_proveedor},"MII/DatosTransaccionales/Pedidos/Query/sel_reg_traduccion","char"); 
					oThis.oDialog_Edit.close();
				}
			},
			error: function(e){
				oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado");
			}
               	 });              
          },

          onSaveCharCat : function(oEvent){
		var	path = oEvent.getSource().getBindingContext("cat").getPath(),
			obj = oEvent.getSource().getBindingContext("cat").getObject(),  
			id_value = key_proveedor + '-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9),                                         
			oPath = 'MII/DatosTransaccionales/Pedidos/Transaction/ins_upd_regCatChar',
			url = "/XMII/Runner?Transaction=" + oPath + "&OutputParameter=XmlOutput&Content-Type=text/xml";                                
		if(!obj.VALUE_CAT || !obj.VALUE_SUP_CAT){
			MessageToast.show("Llene todos los campos");
			return;
            	}

		if(!obj.ID_VALUE)
			obj.ID_VALUE = id_value;

		var oData = {
			"ID_VALUE": !obj.ID_VALUE ? id_value : obj.ID_VALUE,
			"ID_PROVEEDOR": key_proveedor,
			"COD_CARACTERISTICA": cat_reg,
			"VALOR": obj.VALUE_CAT,
			"VALOR_SUP": obj.VALUE_SUP_CAT
		}

		$.ajax({
			url: url,
			type: 'POST',
			data: $.param(oData),
			contentType: 'application/x-www-form-urlencoded',
			success: function(xml){
				if($(xml).find("ERRORES").text()!=0)
					MessageToast.show($(xml).find("MENSAJE").text());                         
				else
				{
					MessageToast.show($(xml).find("MENSAJE").text());
					oThis.onLoadTable({"Param.1":key_proveedor,"Param.2":cat_reg},"MII/DatosTransaccionales/Pedidos/Query/sel_cat_values","cat");					
				}
			},
			error: function(e){
				oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado");
			}
		});              
	},

          onDeleteChar: function(oEvent){            
		var oPath = oEvent.getSource().getBindingContext("char").getPath(),
			obj = oEvent.getSource().getBindingContext("char").getObject(),                
			path = 'MII/DatosTransaccionales/Pedidos/Transaction/del_reg',
			url = "/XMII/Runner?Transaction=" + path + "&OutputParameter=XmlOutput&Content-Type=text/xml";                                
                                
		$.ajax({
			url: url,
			type: 'POST',
			data: $.param({
				"ID_PROVEEDOR": key_proveedor,
				"COD_CHAR": obj.COD_CHAR
			}),
			contentType: 'application/x-www-form-urlencoded',
			success: function(xml){
				if($(xml).find("ERRORES").text()!=0)
					MessageToast.show($(xml).find("MENSAJE").text());                      
				else
				{
					MessageToast.show($(xml).find("MENSAJE").text());
					oThis.onLoadTable({"Param.1":key_proveedor},"MII/DatosTransaccionales/Pedidos/Query/sel_reg_traduccion","char"); 
				}
			},
			error: function(e){
				oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado");
			}
                	});
	},
          
	onDeleteCharCat: function(oEvent){            
		var 
			oPath = oEvent.getSource().getBindingContext("cat").getPath(),
			obj = oEvent.getSource().getBindingContext("cat").getObject(),                
			path = 'MII/DatosTransaccionales/Pedidos/Query/del_cat_value',
			url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + path + "&Content-Type=text/json";                                
                                
		$.ajax({
			url: url,
			type: 'POST',
			data: $.param({
				"Param.1": obj.ID_VALUE
			}),
			contentType: 'application/x-www-form-urlencoded',
			success: function(data){
				if(data.Rowsets.FatalError){
					MessageToast.show("Error al borrar registro");
					console.log(data.Rowsets.FatalError);
				}
				else
				{
					MessageToast.show("Operación correcta");
					oThis.onLoadTable({"Param.1":key_proveedor,"Param.2":cat_reg},"MII/DatosTransaccionales/Pedidos/Query/sel_cat_values","cat");
				}
			},
			error: function(e){
				oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado");
			}
		});
	},

      onLoadTable: function(oData, oPath, id_data){
 	empty.Rowsets.Rowset[0].Row = [];
             var oModelMAT = new sap.ui.model.json.JSONModel();
             oModelMAT.setSizeLimit(10000)                   
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
			oView.setModel(oModelMAT,id_data);
		}else{
			oModelMAT.setData(empty);
			oView.setModel(oModelMAT,id_data);
		}
                           
            });
      },   

	onCloseFragment: function() {
		this.byId("translateChars").close();
	},
       
	});
});