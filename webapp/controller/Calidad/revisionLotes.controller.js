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
], function (jQuery, BaseController, JSONModel,Fragment,Filter,MessageBox,Export,ExportTypeCSV,Spreadsheet,MessageToast,exportLibrary,formatter,Token) {
	"use strict";

	var EdmType = exportLibrary.EdmType,
		user = '',
		user_nombre;

	return BaseController.extend("sap.ui.demo.webapp.controller.Calidad.revisionLotes", {
        
        formatter: formatter,
		
		onInit: function () {					
            var oRouter = this.getRouter(),               
                oView = this.getView(), 
                oTable = oView.byId("revisionLotes_table"),
                oColumns = oTable.getColumns(),
                inputOrden = oView.byId("num_orden_input"),
                inputBatch = oView.byId("lote_input");
            oRouter.getRoute("revision_lotes").attachMatched(this._onRouteMatched, this);		
            
            var fnValidator = function(args){
				var text = args.text;

				return new Token({key: text, text: text});
			};

			inputOrden.addValidator(fnValidator);
            inputBatch.addValidator(fnValidator);

            oColumns[14].setVisible(false);	
            oColumns[15].setVisible(false);	
            oColumns[16].setVisible(false);	

            this._base_onloadCOMBO("calidadFilter", {}, "MIIExtensions/Operation/Transaction/get_qaList", "", "Calidades");
            this.getWC("username");

                            /*+++++++  Oscar Jiménez 20-08-2021   OCULTAR COLUMNAS ++++++++*/
                            var columns = {
                                columns: [{
                                        Column: "Material",
                                        Visible: 1
                                    }, {
                                        Column: "Descripcion",
                                        Visible: 1
                                    }, {
                                        Column: "Lote",
                                        Visible: 1
                                    }, {
                                        Column: "Almacén",
                                        Visible: 1
                                    }, {
                                        Column: "Cantidad",
                                        Visible: 1
                                    }, {
                                        Column: "Orden",
                                        Visible: 1
                                    }, {
                                        Column: "Pedido",
                                        Visible: 1
                                    }, {
                                        Column: "Registrado",
                                        Visible: 1
                                    }, {
                                        Column: "P. Trabajo",
                                        Visible: 1
                                    }, {
                                        Column: "Afectado por",
                                        Visible: 1
                                    }, {
                                        Column: "Defecto",
                                        Visible: 1
                                    }, {
                                        Column: "Observaciones",
                                        Visible: 1
                                    }, {
                                        Column: "Calidad",
                                        Visible: 1
                                    },
                                    {
                                        Column: "Estado",
                                        Visible: 1
                                    },
                                ]
                            };
            
                            this._setColumns(columns, "columnList", "revisionLotes_table");
            
                            /*+++++++  Oscar Jiménez 20-08-2021   OCULTAR COLUMNAS ++++++++*/
		},        
		
		_onRouteMatched: function (oEvent) {	
			this._getUsuario2("username");
			this._getUsuario("username","id_revision_lotes");           
		},

        getWC: function (id) {
            var oThis = this;

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var nombre = $(xml).find('Profile').attr('firstname');
                    var apellido = $(xml).find('Profile').attr('lastname');
                    var idUs = $(xml).find('Profile').attr('uniquename');
                        idUs=idUs.toUpperCase();
                    oThis.byId(id).setText(nombre + ' ' + apellido);
                    var oData = {
                        "USER": idUs
                    };
                    oThis._base_onloadCOMBO("puestoTrabajoSelect", oData, "MIIExtensions/Operation/Transaction/get_operations_Select_user", "", "Centros");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },
		
		onConsultar: function(){			
			var 
                oView = this.getView(),
                fecha_inicio = oView.byId("start_date").getValue(),
			    fecha_fin = oView.byId("end_date").getValue(),
                aTokensOrden= this.getView().byId("num_orden_input").getTokens(),
                aTokensLote= this.getView().byId("lote_input").getTokens(),
			    orden = '',	
			    lote = '',
                work_center = oView.byId("puestoTrabajoSelect").getSelectedKey(), 		
                calidad = oView.byId("calidadFilter").getSelectedKey(); 	
                
                
                orden = aTokensOrden.map(function(oToken) {
                    return "'" + oToken.getKey() + "'";
                  }).join(",");

                lote = aTokensLote.map(function(oToken) {
                    return oToken.getKey();
                  }).join(",");
			
			var oData = {
				"in_fechaInicio" : fecha_inicio,
				"in_fechaFin" : fecha_fin,
				"in_ordenes" : orden,
                "in_lotes": lote,
                "in_bloqueados": this.getView().byId("chk_error").getState(),
                "in_liberados": this.getView().byId("chk_libre").getState(),
                "in_retornos": this.getView().byId("chk_retorno").getState(),
                "in_devoluciones": this.getView().byId("chk_devolucion").getState(),
                "in_workCenter": work_center,
                "in_calidad": calidad
            }
			
			this._base_onloadTable("revisionLotes_table",oData, "MIIExtensions/Calidad/Transaction/get_lotesRevision", "Registros", "");
		
		},

        onViewChars: function(){
            var oThis = this;
            var oView = this.getView(),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),
                lote = '',
                material = '';

                if(oItems.length === 0){
                    this.getOwnerComponent().openHelloDialog("Seleccione un registro");
                    return;
                }   
                if(oItems.length > 1){
                    this.getOwnerComponent().openHelloDialog("Seleccione solo un registro para ver sus características");
                    return;
                }                
                else{
                    if (!this.byId("batchCharsDialog")) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.materialChars",
                            controller: this
                        }).then(function(oDialog) {
                            oView.addDependent(oDialog);
                            oDialog.open();
                            oItems.forEach(function (item) {
                                lote = item.getCells()[2].getText();
                                material = item.getCells()[0].getText();
                                 });
            
                            var oData = {
                                "LOTE": lote,
                                "MATERIAL": material,
                                "FLAGUI": "X"
                            };                
            
                            oThis._base_onloadTable("oTableMaterialCharact", oData, "MII/DatosTransaccionales/Pedidos/Transaction/get_chars_material_revision", "Chars", "");
             
                        });
                    } else {
                        this.byId("batchCharsDialog").open();
                        oItems.forEach(function (item) {
                            lote = item.getCells()[2].getText();
                            material = item.getCells()[0].getText();
                             });
        
                        var oData = {
                            "LOTE": lote,
                            "MATERIAL": material,
                            "FLAGUI": "X"
                        };                
        
                        this._base_onloadTable("oTableMaterialCharact", oData, "MII/DatosTransaccionales/Pedidos/Transaction/get_chars_material_revision", "Chars", "");
         
                    }
                }           
        },

        onSaveMatChars: function(){
            var oView = this.getView(),
                oTable_chars = oView.byId("oTableMaterialCharact"),
                oTable_batch = oView.byId("revisionLotes_table"),
                oChars_data = oTable_chars.getModel().oData,
                oItems_batch = oTable_batch.getSelectedItems(),
                oChars = [], 
                lote = '', 
                material = '',
                almacen = '',
                oValor = '';
                
                oChars_data.ITEMS.forEach(function (item) {
                    oValor = item.sel_KEY_MM != "" ? item.sel_KEY_MM : item.value;                    
                    
                    oChars.push({
                            INSPCHAR: item.INSPCHAR,
                            sel_KEY_MM : item.sel_KEY_MM,
                            value : item.value,
                            valLimpio: oValor
                            });
                });

                oItems_batch.forEach(function (item) {                    
                    lote = item.getCells()[2].getText();
                    material = item.getCells()[0].getText();
                    almacen = item.getCells()[3].getText();
                 });

                var oData = {
                    "inJSON": JSON.stringify(oChars),
                    "inLote": lote,
                    "inMaterial": material,
                    "inAlmacen": almacen,
                    "inUsuario": oView.byId("username").getText(),
                };            

                this.onSaveMatChars_send(oData,'MIIExtensions/Reports/Transaction/onSaveMaterialChars_mod_revision');
        },

        onSaveMatChars_send(oData,path) {
            var uri = "http://"+ this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
			
            sap.ui.core.BusyIndicator.show(0);
			var oThis = this;
			
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
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].ERROR !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].ERROR);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                                             
                            MessageToast.show(aData[0].MESSAGE);                          
                            oThis.onCloseDialogMaterialChars();
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: �Hay conexi�n de red?");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud ha fallado: " + textStatus);
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },	

		_getUsuario2: function (id) {
            var oThis = this;

            $.ajax({
                type: "GET",
                url: "http://"+ this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var nombre = $(xml).find('Profile').attr('firstname');
                    var apellido = $(xml).find('Profile').attr('lastname');
                    user = $(xml).find('Profile').attr('IllumLoginName');
                    user = user.toUpperCase();
					user_nombre = nombre + ' ' + apellido;
					console.log(user);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
		},

        onTraspaso: function(move){
            var oView = this.getView(),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),
                lote = '',
                material = '',
                orden = '',
                tm = '',
                mov = '',
                fecha = '',
                status = '',
                movtext = '',
                bloqueados = true,
                liberados = true;                

                if(oItems.length === 0){
                    this.getOwnerComponent().openHelloDialog("Seleccione al menos un registro");
                    return;
                }         
                else{
                    oItems.forEach(function (item) {                        
                        lote += (lote != '' ? ',' : '') + item.getCells()[2].getText();
                        material += (material != '' ? ',' : '') + item.getCells()[0].getText();
                        orden += (orden != '' ? ',' : '') + item.getCells()[5].getText();
                        fecha += (fecha != '' ? ',' : '') + item.getCells()[7].getText();
                        status = item.getCells()[14].getText();                        
		if(move === 344 && status == '1'){
			tm = 344;
                        }else if( move === 343 && status == '3' ){
			tm = 343
		}else if ( move === 343 && status == '4' ){
			tm = 453
		}
		mov += (mov != '' ? ',' : '') + tm;

                        if(move === 344 && status != '1'){
                            liberados = false;                            
                        }

                        if(move === 344)
                            movtext = "bloquearan ";
                        else if (move === 343)
                            movtext = "liberaran ";
                            

                        if(move === 343 && status != '3'){
                            bloqueados = false;                            
                        }
                                                                              

                        });

                        if(!liberados){
                            this.getOwnerComponent().openHelloDialog("Seleccione solo registros liberados");
                            return;
                         }
                         
                         if(!bloqueados){
                            this.getOwnerComponent().openHelloDialog("Seleccione solo registros bloqueados");
                            return;
                         }
    
                    var oData = {
                        "in_lotes": lote,
                        "in_materiales": material,
                        "in_ordenes": orden,
                        "in_moveType": mov,
                        "in_fechas": fecha,
		"in_usuario": user,
                    };                    

                    this.confirmTraspaso("Se " + movtext + oItems.length + " lote(s) seleccionados", "warning", oData, this);                
                                        
                }
        },

        confirmTraspaso: function(sMessage, sMessageBoxType, oData, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.Traspaso(oData, 'MIIExtensions/SFC/Transaction/traspaso_masivo');
                    }
                }.bind(this)
            });
        },

        OnDefectos: function(oEvent) {
            var oView = this.getView(),
                oDialog = oView.byId("DefectosDialog"),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),                
                lote_inspeccion = '',
                lote = '';

                oItems.forEach(function (item) {                    
                    lote_inspeccion += (lote_inspeccion != '' ? ',' : '') + item.getCells()[15].getText();
                    lote += (lote != '' ? ',' : '') + item.getCells()[2].getText();
                     });

                     if(oItems.length === 0){
                        this.getOwnerComponent().openHelloDialog("Seleccione un registro");
                        return;
                    }   

            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.RegistroDefectos", this);
                oView.addDependent(oDialog);
            }
            var oData = {
                "LOTE_INSPECCION": lote_inspeccion, 
                "LOTE": lote               
            };            
            this._base_onloadTable("Tabla_Defectos", oData, "MII/DatosTransaccionales/Pedidos/Transaction/defectos_lote_inspeccion_masivo", "Defectos registrados", "");
            this._base_onloadCOMBO("listPadres", '', "MII/DatosTransaccionales/Pedidos/Transaction/get_grupo_defectos", "");
            oDialog.open();

            var  oTableDefectos = oView.byId("Tabla_Defectos"),
            oColumnsDefectos = oTableDefectos.getColumns();
            oColumnsDefectos[0].setVisible(false);            
            oColumnsDefectos[10].setVisible(false);     
        },

        onChangeQA: function(){
            var oView = this.getView(),
            oDialog = oView.byId("changeQaModal"),
            oTable = oView.byId("revisionLotes_table"),
            oItems = oTable.getSelectedItems(),
            lote_inspeccion = '';

            oItems.forEach(function (item) {
                lote_inspeccion = item.getCells()[15].getText();
                 });

                 if(oItems.length === 0){
                    this.getOwnerComponent().openHelloDialog("Seleccione al menos un registro");
                    return;
                }   

        // create dialog lazily
        if (!oDialog) {
            // create dialog via fragment factory
            oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.changeQA", this);
            oView.addDependent(oDialog);
        }
        var oData = {
            "LOTE_INSPECCION": lote_inspeccion
        };
        this._base_onloadCOMBO("qaModalCombo", oData, "MIIExtensions/Operation/Transaction/get_qaList", "", "Calidades");
        
        oDialog.open();
        },

        acceptChangeQa: function(){
            var oView = this.getView(),
                qa = oView.byId("qaModalCombo").getSelectedKey(),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),
                lote = '',
                material = '',
                cantidad = '',
                pedido = '',
                posicion = '',
                id = '',
                counter = 0,
                that = this,
                lote_inspeccion = '';                

            if(qa === ""){
                this.getOwnerComponent().openHelloDialog("Seleccione la calidad");
                    return;
            }   
            
            oItems.forEach(function (item) {  
                                
                var pedido_pos = item.getCells()[6].getText(),
                    pedidoAux2 = '',
                    posicionAux2 = '';
                
                if(pedido_pos !== ''){
                    pedido_pos = pedido_pos.split('/');
                    var pedidoAux = pedido_pos[0],                    
                        posicionAux = pedido_pos[1];
    
                        pedidoAux2 = that.pad(pedidoAux,10);
                        posicionAux2 = that.pad(posicionAux,6);
                }

                lote += (lote != '' ? ',' : '') + item.getCells()[2].getText();
                material += (material != '' ? ',' : '') + item.getCells()[0].getText();
                cantidad += (cantidad != '' ? ',' : '') + item.getCells()[4].getText().replace(',','');
                pedido += (counter > 0 ? ',' : '') + pedidoAux2;
                posicion += (counter > 0 ? ',' : '') + posicionAux2;
                lote_inspeccion += (lote_inspeccion != '' ? ',' : '') + item.getCells()[15].getText();
                id += (id != '' ? ',' : '') + item.getCells()[16].getText();

                counter++;
            });
            
            var oData = {
                "in_calidad": qa,
                "in_id": id,
                "in_lotes": lote,
                "in_materiales": material,
                "in_usuario": user,
                "in_loteInspeccion": lote_inspeccion,
                "in_cantidad": cantidad,
                "in_pedido": pedido,
                "in_posicion": posicion 
            };

            console.log(oData);

            this.sendWorkCenterAffected(oData, 'MIIExtensions/SFC/Transaction/changeQaMultiple',true);

            this.declineChangeQa();
        },

        onObservacion: function(open){
            var oView = this.getView(),
                oDialog = oView.byId("observacionesDialog"),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),
                lote_inspeccion = '',
                lote = '';

                oItems.forEach(function (item) {
                    lote_inspeccion += (lote_inspeccion != '' ? ',' : '') + item.getCells()[15].getText();
                    lote += (lote != '' ? ',' : '') + item.getCells()[2].getText();
                     });

                     if(oItems.length === 0){
                        this.getOwnerComponent().openHelloDialog("Seleccione un registro");
                        return;
                    }   

            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.registroObservacion", this);
                oView.addDependent(oDialog);
            }
            var oData = {
                "LOTE_INSPECCION": lote_inspeccion,
                "LOTE": lote
            };
            this._base_onloadTable("ObservacionesTable", oData, "MII/DatosTransaccionales/Pedidos/Transaction/observaciones_lote_inspeccion_masivo", "Observaciones", "");
            
            if(open)
                oDialog.open();
        },

        onChangePadres: function(oEvent) {
            var oData = {
                "ID_GRUPO_DEFECTO": oEvent.getParameter("selectedItem").getKey()
            };
            this._base_onloadCOMBO("listHijos", oData, "MII/DatosTransaccionales/Pedidos/Transaction/get_defectos", "");
        },

        onChangePadresMod: function(oEvent) {
            var oData = {
                "ID_GRUPO_DEFECTO": oEvent.getParameter("selectedItem").getKey()
            };
            this._base_onloadCOMBO("listHijosMod", oData, "MII/DatosTransaccionales/Pedidos/Transaction/get_defectos", "");
        },

        approveChange: function(oEvent){
            var swt = oEvent.getSource(),
                value = swt.getState(),
                row = swt.getParent();

                 var oData = {
                     "ESTATUS": value ? '1' : '0',
                     "ID_DEFECTO": row.getCells()[0].getText(),
                     "LOTE_INSPECCION": row.getCells()[10].getText(),
                     "USUARIO": user
                 }    
                 this.sendWorkCenterAffected(oData, 'MIIExtensions/SFC/Transaction/check_defect',false,true);      
        },

        changePriority: function(oEvent){
            var swt = oEvent.getSource(),
                value = swt.getState(),
                row = swt.getParent();

                 var oData = {
                     "ESTATUS": value ? '1' : '0',
                     "ID_DEFECTO": row.getCells()[0].getText(),
                     "LOTE_INSPECCION": row.getCells()[10].getText(),
                     "USUARIO": user
                 }    
                 this.sendWorkCenterAffected(oData, 'MIIExtensions/SFC/Transaction/change_priority',false,true);      
        },

        anularSeleccion: function(){
            this.byId("revisionLotes_table").removeSelections(true); 
        },

        onSaveDefecto: function() {
            var oView = this.getView(),            
            oTable = oView.byId("revisionLotes_table"),
            oItems = oTable.getSelectedItems(),
            lote_inspeccion = '',
            lote = '';
            var idGrupo = this.byId("listPadres");
            var idDefecto = this.byId("listHijos");

            oItems.forEach(function (item) {
                lote_inspeccion += (lote_inspeccion != '' ? ',' : '') + item.getCells()[15].getText();
                lote += (lote != '' ? ',' : '') + item.getCells()[2].getText();
            });

            if (idGrupo.getSelectedKey() != "" && idDefecto.getSelectedKey() != "") {
                var oData = {
                    "in_idDefecto": idDefecto.getSelectedKey(),
                    "in_loteInspeccion": lote_inspeccion,
                    "in_lote": lote,
                    "in_descripcion": this.byId("observacion_defecto").getValue(),
                    "in_usuario": user
                };
                console.log(oData);
                this._handleMessageBoxConfirmDefecto("Se registrará el defecto a los " + oItems.length + " lote(s) seleccionados", "warning", oData, this);                
            } else {
                this.getOwnerComponent().openHelloDialog("Debes seleccionar una clase y defecto a  registrar.");
            }
        },

        onSaveDefectoDef: function() {
            var oView = this.getView(),            
            oTable = oView.byId("revisionLotes_table"),
            oTableDef = oView.byId("Tabla_Defectos"),
            oItems = oTable.getSelectedItems(),
            oItemsDef = oTableDef.getSelectedItems(),
            idDefecto_new = this.byId("listHijosMod"),
            lote_inspeccion = '',
            idDefecto_old = '',
            lote = '';            

            oItems.forEach(function (item) {
                lote_inspeccion += (lote_inspeccion != '' ? ',' : '') + item.getCells()[15].getText();                
            });

            oItemsDef.forEach(function (item) {
                idDefecto_old = item.getCells()[0].getText();                
            });

            var oData = {
                "in_idDefecto_new": idDefecto_new.getSelectedKey(),
                "in_idDefecto_old": idDefecto_old,
                "in_loteInspeccion": lote_inspeccion,
                "in_descripcion": this.byId("observacion_defectoMod").getValue(),
                "in_usuario": user
            };

            console.log(oData);
            
            this.sendWorkCenterAffected(oData, 'MIIExtensions/SFC/Transaction/changeDefect',false,true);  
            this.onCloseDialogModDef();

        },

        cleanFragmentDefectos: function() {
            var idGrupo = this.byId("listPadres");
            var idDefecto = this.byId("listHijos");
            idDefecto.setSelectedKey("");
            idGrupo.setSelectedKey("");
            this.byId("observacion_defecto").setValue("");
        },
        _handleMessageBoxConfirmDefecto: function(sMessage, sMessageBoxType, oData, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.SendDefecto(oData, 'MIIExtensions/SFC/Transaction/defectMultiple');
                    }
                }.bind(this)
            });
        },
        SendDefecto: function(oData, path) {
            var User_MII = this.byId("username").getText();
            var combooperacion = this.byId('listOperation')
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this.getView(),            
            oTable = oView.byId("revisionLotes_table"),
            oItems = oTable.getSelectedItems(),
            lote_inspeccion = '';

            oItems.forEach(function (item) {
                lote_inspeccion = item.getCells()[15].getText();
                 });

            var oThis = this;

            sap.ui.core.BusyIndicator.show(0);

            $.ajax({
                    type: "GET",
                    dataType: "xml",
                    cache: false,
                    url: uri,
                    data: oData
                })
                .done(function(xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild != null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].ERROR !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData[0].ERROR);
                        } else {
                            //Create  the JSON model and set the data                                                                                                
                            MessageToast.show(aData[0].MESSAGE);
                            oThis.cleanFragmentDefectos();
                            oThis.OnDefectos();
                        }

                    } else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio informacion");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexion de red?");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });

        },

        onCloseDialogDefectos: function() {
            this.getView().byId("DefectosDialog").close();
        },

        onCloseDialogHideColumns: function() {
            this.getView().byId("hideColumns_fragment").close();
        },

        onCloseDialogObservaciones: function() {
            this.getView().byId("observacionesDialog").close();
        },

        declineChangeQa: function(){
            this.getView().byId("changeQaModal").close();
        },

        onPuestoTrabajoAfectar: function() {
            var

                oView = this.getView(),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),
                oDialog = oView.byId("Error_puesto");

                if(oItems.length === 0){
                    this.getOwnerComponent().openHelloDialog("Seleccione un registro");
                    return;
                }  

            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Error_Caract", this);
                oView.addDependent(oDialog);
            }
            this._base_onloadCOMBO("Puesto_Select", '', "MIIExtensions/Operation/Transaction/get_operations_Select", "");
            oDialog.open();

        },

        onSaveObservaciones: function(){
            var oView = this.getView(),
                observacion = oView.byId("observacionLote").getValue(),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),          
                lote_inspeccion = '',
                lote = '';

                oItems.forEach(function (item) {
                    lote_inspeccion += (lote_inspeccion != '' ? ',' : '') + item.getCells()[15].getText();
                    lote += (lote != '' ? ',' : '') + item.getCells()[2].getText();
                });

                if($.trim(observacion) === ''){
                    this.getOwnerComponent().openHelloDialog("Ingrese una observacion");
                    return;
                }                

                var oData = {
                    "in_loteInspeccion": lote_inspeccion,
                    "in_lote": lote,
                    "in_observacion": observacion,
                    "in_usuario": user
                }

                console.log(oData);

                this.confirmAction("Se registrará la observación a los " + oItems.length + " lote(s) seleccionados", "warning", oData, this, 'MIIExtensions/SFC/Transaction/obsMultiple');                
            
        },

        confirmAction: function(sMessage, sMessageBoxType, oData, oThis, path) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.sendObs(oData, path);
                    }
                }.bind(this)
            });
        },

        sendObs(oData,path) {
            var uri = "http://"+ this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
			
            sap.ui.core.BusyIndicator.show(0);
			var oThis = this;
			
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
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].ERROR !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].ERROR);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                                             
                            MessageToast.show(aData[0].MESSAGE);       
                            oThis.byId("observacionLote").setValue();                                               
                            oThis.onObservacion(0);
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: �Hay conexi�n de red?");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud ha fallado: " + textStatus);
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },	

        onAceptar: function() {
            var resourceModel = this.getView().getModel("i18n"),
                oView = this.getView(),
                oTable = oView.byId("revisionLotes_table"),
                oItems = oTable.getSelectedItems(),
                combo = this.byId('Puesto_Select'),
                lote = '';

                oItems.forEach(function (item) {
                    lote += (lote != '' ? ',' : '') + item.getCells()[2].getText();
                });

            if (combo.getSelectedKey() == "") {
                this.getOwnerComponent().openHelloDialog("Es obligatorio seleccionar un puesto de trabajo.");
            } else {
                this.onCancelar();

                var oData = {                    
                    "in_lote": lote,
                    "in_puestoTrabajo": combo.getSelectedKey(),
                    "in_usuario": user
                };
                this.confirmSendWorkCenter("Se cambiará afectado por a los " + oItems.length + " lote(s) seleccionados", "warning", oData, this); 
            }

        },

        confirmSendWorkCenter: function(sMessage, sMessageBoxType, oData, oThis, path) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.sendWorkCenterAffected(oData, 'MIIExtensions/SFC/Transaction/workCAffectedMultiple', true)
                    }
                }.bind(this)
            });
        },

        pad : function (str, max) {
            str = str.toString();
            return str.length < max ? this.pad("0" + str, max) : str;
        },

        changeCombo: function(oEvent) {
            var oItem = oEvent.getSource(),
                key = oItem.getSelectedKey(),
                row = oItem.getParent(),                
                pedido_pos = row.getCells()[6].getText(),
                pedido = '',
                posicion = ''; 
                
                if(pedido_pos !== ''){
                    pedido_pos = pedido_pos.split('/');
                    var pedido = pedido_pos[0],                    
                        posicion = pedido_pos[1];
    
                        pedido = this.pad(pedido,10);
                        posicion = this.pad(posicion,6);
                }
                

            var oData = {
                "ID": row.getCells()[16].getText(),
                "MATERIAL": row.getCells()[0].getText(),
                "LOTE": row.getCells()[2].getText(),
                "CALIDAD": key,
                "USUARIO": user,
                "LOTE_INSPECCION": row.getCells()[15].getText(),
                "CANTIDAD": row.getCells()[4].getText().replace(',',''),
                "PEDIDO":pedido,
                "POSICION": posicion
            }

            this.sendWorkCenterAffected(oData,'MIIExtensions/SFC/Transaction/changeQA', false);
        },
    
        sendWorkCenterAffected(oData,path,reload,def) {
            var uri = "http://"+ this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
			
            sap.ui.core.BusyIndicator.show(0);
			var oThis = this;
			
            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {

                    console.log(xmlDOM);
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].ERROR !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].ERROR);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                                             
                            MessageToast.show(aData[0].MESSAGE);    
                            if(reload)                                                  
                                oThis.onConsultar();
                            if(def)
                                oThis.OnDefectos();
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: �Hay conexi�n de red?");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud ha fallado: " + textStatus);
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },	


        onCancelar: function() {
            this.getView().byId("Error_puesto").close();
        },
				
        Traspaso(oData,path) {
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
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].ERROR !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].ERROR);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                                             
                            MessageToast.show(aData[0].MESSAGE);                                                      
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: ¿Hay conexión de red?");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud ha fallado: " + textStatus);
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },	

        onCloseDialogMaterialChars: function() {
            this.byId("batchCharsDialog").destroy()
        },

 onModObs: function(){
        var
            oView = this.getView(),
            oThis = this,
            oItems = this.byId("ObservacionesTable").getSelectedItems();
        if(oItems.length===0){
            this.getOwnerComponent().openHelloDialog("Selecciona un registro");
            return;
        }
        
        var obs = "";
        oItems.forEach(function (item) {
            obs = item.getCells()[1].getText();
        });
        
        if (!this.byId("modObsDialog")) {
            Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.modObs",
                controller: this
            }).then(function(oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                oThis.byId("observacionLoteMod").setValue(obs);
            });
        } else {
            this.byId("modObsDialog").open();
            this.byId("observacionLoteMod").setValue(obs);
        }
            
        
    },

    onModDef: function(){
        var
            oView = this.getView(),
            oThis = this,
            oItems = this.byId("Tabla_Defectos").getSelectedItems();
        if(oItems.length===0){
            this.getOwnerComponent().openHelloDialog("Selecciona un registro");
            return;
        }
        
        var obs = "";
        oItems.forEach(function (item) {
            obs = item.getCells()[4].getText();
        });
        
        if (!this.byId("modDefDialog")) {
            Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.modDef",
                controller: this
            }).then(function(oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                oThis.byId("observacion_defectoMod").setValue(obs);
            });
        } else {
            this.byId("modDefDialog").open();
            this.byId("observacion_defectoMod").setValue(obs);
        }
            
        this._base_onloadCOMBO("listPadresMod", '', "MII/DatosTransaccionales/Pedidos/Transaction/get_grupo_defectos", "");
    },
        
    onSaveModObs: function(){
        if(!this.byId("observacionLoteMod").getValue()){
            this.getOwnerComponent().openHelloDialog("Ingresa una observación");
            return;
        }
        
        var id = "",
            oItems = this.byId("ObservacionesTable").getSelectedItems();
        
        oItems.forEach(function (item) {
            id = item.getCells()[0].getText();
        });
        
        var oData = {
          "in_id": id,
          "in_observacion": this.byId("observacionLoteMod").getValue()
        };
        
        this.sendObs(oData, 'MIIExtensions/SFC/Transaction/obsMod');
        this.onCloseDialogModObs();
        
    },
        
    onCloseDialogModObs: function() {
        this.byId("modObsDialog").destroy()
    },

    onCloseDialogModDef: function() {
        this.byId("modDefDialog").destroy()
    },

    /*******   Oscar Jiménez 20-08-2021   OCULTAR COLUMNAS ***********/

    onSelectionChange: function(oEvent) {
        this._selectionColumn(oEvent, "revisionLotes_table");
    },

    _selectionColumn: function(oEvent, table) {
        var oTable = this.byId(table),
            index = oEvent.getParameter("listItem").getBindingContext().sPath.split('/')[2];

        if (oEvent.getParameter("selected")) {
            oTable.getColumns()[index].setVisible(true);
        } else {
            oTable.getColumns()[index].setVisible(false);
        }
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

    _openModalColumn: function() {
        var oView = this.getView(),
            oDialog = oView.byId("hideColumns_fragment");
        // create dialog lazily
        if (!oDialog) {
            // create dialog via fragment factory
            oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.hideColumns", this);
            oView.addDependent(oDialog);
        }
        oDialog.open();
    },

    _setColumns: function(columns, List, Table) {
        var oView = this.getView(),
            oDialog = oView.byId("hideColumns_fragment");
        // create dialog lazily
        if (!oDialog) {
            // create dialog via fragment factory
            oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.hideColumns", this);
            oView.addDependent(oDialog);
        }

        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(columns);
        this.byId("hideColumns_fragment").setModel(oModel);

        var oList = this.byId(List),
            oTable = this.byId(Table),
            oItems = oList.getItems(),
            oColumns = oTable.getColumns();

        $.each(columns.columns, function(index) {
            if (this.Visible) {
                oList.setSelectedItem(oItems[index]);
            } else {
                oColumns[index].setVisible(false);
            }
        });
    },

    _selectColumnsAll: function() {
        var oList = this.byId("columnList"),
            oItems = oList.getItems();

        $.each(oList.getItems(), function(index) {
            oList.setSelectedItem(oItems[index], true, true);
        });
    },
onExport: function (oEvent) {
        var aCols, aProducts, oSettings, oSheet;

        var oView = this.getView();        
        
        aCols = this.ColumnConfig_RevLote();
        aProducts = this.getView().byId("revisionLotes_table").getModel().getProperty('/ITEMS');

        oSettings = {
            workbook: {
                columns: aCols,
                context: { sheetName: 'RevisionLote' }
            },
            dataSource: aProducts,
            fileName: "RevisionLote.xlsx"
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
    ColumnConfig_RevLote: function () {
            return [
                {
                    label: 'Material',
                    type: 'string',
                    property: 'MATERIAL',                    
                },
                {
                    label: 'Descripcion',
                    property: 'DESCRIPTION',
                    type: 'string',
                },                                
                {
                    label: 'Lote',
                    property: 'BATCH',
                    type: 'string',
                },
                {
                    label: 'Almacen',
                    property: 'STORAGE_LOCATION',
                    type: 'string',
                },
                {
                    label: 'Cantidad',
                    property: 'QUANTITY',
                    type: 'string'
                },
                {
                    label: 'Orden',
                    property: 'SHOP_ORDER',
                    type: 'string'
                },
                {
                    label: 'Pedido',
                    type: 'string',
                    property: 'S_ORD_POS',
                },
                {
                    label: 'Registrado',
                    type: 'string',
                    property: 'PROD_DATE',
                },
                {
                    label: 'Puesto Trabajo',
                    type: 'string',
                    property: 'WORK_CENTER',
                },
                {
                    label: 'Afectado por',
                    type: 'string',
                    property: 'WORK_CENTER_AFFECTED',
                },
                {
                    label: 'Defecto',
                    type: 'string',
                    property: 'DEFECT',
                },
                {
                    label: 'Observaciones',
                    type: 'string',
                    property: 'OBS',
                },
                {
                    label: 'Calidad',
                    type: 'string',
                    property: 'QA',
                },
                {
                    label: 'Estado',
                    type: 'Enumeration',
                    property: 'STATUS',
	        valueMap: {
                        '0': 'Desconocido',
                        '1': 'Liberado',
                        '2': 'Calidad',
                        '3': 'Bloqueado'
                    }
                },                 
            ];
        },

    /*******   Oscar Jiménez 20-08-2021   OCULTAR COLUMNAS ***********/


	});
});