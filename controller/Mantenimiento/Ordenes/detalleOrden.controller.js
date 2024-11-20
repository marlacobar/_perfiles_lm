sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/ui/model/json/JSONModel',
    "sap/ui/model/Filter",
    "/../../../model/formatter", 

], function (JQuery, BaseController, MessageToast, MessageBox, Fragment, JSONModel, Filter, formatter) {
    "use strict";
    const REFRESH_HEADER = "REFRESH_HEADER";
    const ERROR_MSG = "ERROR_MSG";
    return BaseController.extend("sap.ui.demo.webapp.controller.Mantenimiento.Ordenes.detalleOrden", {

        formatter: formatter,

        onInit: function () {
            //jQuery.sap.getUriParameters().get("Plant")
            var oRouter = this.getRouter();
            oRouter.getRoute("detalleOrdenPM").attachMatched(this._onRouteMatched, this);            
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username");
            var oArgs, oView;
            oArgs = oEvent.getParameter("arguments");
            oView = this.getView();   

            var oTable = oView.byId("PMOperationList");
            var oModel_empty = new sap.ui.model.json.JSONModel();
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);

            oView.bindElement({
                path: "/"
            });

            var aData = {
                "ORDER": oArgs.id
            };

            this._base_onloadHeader(aData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/visualizar_orden","Cabecera");
            this._base_onloadTable('PMOperationList', aData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_operations',"Operaciones","");
        },

        onOpenDialogAddOperation : function (oEvent) {
            var oView = this.getView();
            var oDialog = oView.byId("AddOperationDialog");
            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PMOperationMod", this);
                oView.addDependent(oDialog);
            }
            var
                oItem = oEvent.getSource(),
                oCtx = oItem.getBindingContext(),
                oData = {
                    "PLANT": oCtx.getProperty("plant"),
                    "WORKCENTER_KEY":"0005"
                };

            oView.byId('inputDescOperation').setValue('');
            oView.byId('inputWorkOperation').setValue('');

            this._base_onloadCOMBO("workCenter_list", oData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/puestos_trabajo_pm", oCtx.getProperty("work_center"), "Centro Trabajo");

            oDialog.open();
        },

        onOpenDialogCloseOrder: function (oEvent) {
            var oItem = oEvent.getSource(),
                oCtx = oItem.getBindingContext(),
                order = oCtx.getProperty("order"),
                resourceModel = this.getView().getModel("i18n"),
                oData = {
                    "ORDER": order
                };

            this._handleMessageBoxOpen(resourceModel.getResourceBundle().getText("MessageConfirmCTEC"), "warning", oData, this);
        },

        _handleMessageBoxOpen: function (sMessage, sMessageBoxType, oData, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.changeOrderStatus(oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/cerrar_orden');
                    }
                }.bind(this)
            });
        },

        onCloseDialogAddOperation: function () {
            this.getView().byId("AddOperationDialog").close();
        },

        onCloseDialogAddOperationConfirm: function (oEvent) {
            var descOperation = this.byId('inputDescOperation');
            var work = this.byId('inputWorkOperation');
            var workCenter_list = this.byId('workCenter_list');
            

            if (descOperation.getValue() == '')
                this.getOwnerComponent().openHelloDialog("Indique la operacion");
            else if (work.getValue() == '')
                this.getOwnerComponent().openHelloDialog("Indique el trabajo estimado");
            else if (workCenter_list.getSelectedKey() == '')
                this.getOwnerComponent().openHelloDialog("Indique el puesto de trabajo");
            else {
                this.onCloseDialogAddOperation();
                var oItem, oCtx;
                oItem = oEvent.getSource();
                oCtx = oItem.getBindingContext();
                var oData = {
                    "DESCRIPTION": descOperation.getValue(),
                    "ORDER": oCtx.getProperty("order"),
                    "WORK_CENTER": workCenter_list.getSelectedKey(),
                    "WORK": work.getValue(),
                    "PLANT": oCtx.getProperty("plant")
                };
                console.log(oData);
                this.createPMOperation('PMOrderOperation', oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/add_operation');
            }
                
            
        },
        onTipoArchivoIncorrecto: function( oEvent ){
            this.getOwnerComponent().openHelloDialog("Solo se permiten archivos con extesi\u00F3n :xlsx,text,doc,pdf");
        },
        handleSelectFile: function( oEvent ){
        var fileDetails = oEvent.getParameters("file").files[0];
               sap.ui.getCore().fileUploadArr = [];
               if (fileDetails) {
                var mimeDet = fileDetails.type,
                 fileName = fileDetails.name;
                this.base64coonversionMethod(mimeDet, fileName, fileDetails, "001");
               } else {
                sap.ui.getCore().fileUploadArr = [];
               }
        },
          // Base64 conversion of selected file(Called method)....
              base64coonversionMethod: function (fileMime, fileName, fileDetails, DocNum) {
               var that = this;

                FileReader.prototype.readAsBinaryString = function (fileData) {
                 var binary = "";
                 var cadena="";
                 var reader = new FileReader();
                 reader.onload = function (e) {
                  var bytes = new Uint8Array(reader.result);
                  var length = bytes.byteLength;
                  for (var i = 0; i < length; i++) {
                   binary += String.fromCharCode(bytes[i]);
                  }
                  that.base64ConversionRes = btoa(binary);
                  cadena=btoa(binary);
                  console.log(binary);
      
                 };
                 reader.readAsArrayBuffer(fileData);
                };
               
               var reader = new FileReader();
               reader.onload = function (readerEvt) {
                var binaryString = readerEvt.target.result;
                that.base64ConversionRes = btoa(binaryString);
                sap.ui.getCore().fileUploadArr.push({
                 "DocumentType": DocNum,
                 "MimeType": fileMime,
                 "FileName": fileName,
                 "Content": that.base64ConversionRes,

                });
               };
               reader.readAsBinaryString(fileDetails);
              },

        createPMOperation: function (idObject, oData, path) {

            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oThis = this;

            sap.ui.core.BusyIndicator.show(0);

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
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].error !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                
                            MessageToast.show(aData[0].message);
                            var xData = {
                                "ORDER": aData[0].object
                            };
                            oThis._base_onloadTable('PMOperationList', xData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_operations', "Operaciones", "");
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
        onOpenDialogRelease: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();            
            var oData = {
                "ORDER": oCtx.getProperty("order")
            };
            this.changeOrderStatus(oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/liberar_orden');
        },

        onPMOrderOperation: function (oEvent) {            
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            
            this.getRouter().navTo("detalleOperacionPM", {
                order: oCtx.getProperty("order"),
                activity: oCtx.getProperty("operation"),
                plant: oCtx.getProperty('plant')
            });        
        },

        onShowNoti: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("avisoDetalle", {
                id: oCtx.getProperty("notification")
            });

        },

        onOpenDialog: function () {
            this.getOwnerComponent().openHelloDialog();
        },

        //JERO 22 SEP 2023 ESTATUS DE USUARIO
        onEstatusUsuario: function(oEvent){
            var oView = this.getView();
            var oThis=this;
            if(!this.byId("tsd_estatusUsuario")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.Mantenimiento.EstatusUsuario",
                    controller:this
                }).then(function (oDialog) {                    
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.enlistarEstatusUsuario();
                });
            }else{
                this.byId("tsd_estatusUsuario").open();
                this.enlistarEstatusUsuario();
            } 
        },

        enlistarEstatusUsuario: function(){
            var orden = this.getView().getModel().getProperty("/order");
            var oData = {
                "ORDEN" :   orden
            };
            var path = " MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_user_status_Clasif";
            var tabla = "tbl_estatusUsuario1";
            var nombre = "Estatus_Usuario";
            this._base_onloadTable(tabla, oData, path, nombre,"");    
            var path2 = " MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_user_status_NoClasif";
            var tabla2 = "tbl_estatusUsuario2";
            var nombre2 = "Estatus_UsuarioNC";
            this._base_onloadTable(tabla2, oData, path2, nombre2,"");      
        },

        filtroTSD: function(oEvent){
            var aFilters = [];
            var sQuery = oEvent.getParameter("value");
            if (sQuery && sQuery.length > 0) {
				aFilters = new Filter ({
					filters:[
					new Filter("CODIGO", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("DESCRIPCION", sap.ui.model.FilterOperator.Contains, sQuery)
					]
				});
            }

            var list = this.byId(oEvent.getSource().getId().split("--")[2]);
            var binding = list.getBinding("items");
            binding.filter(aFilters, "Application");
        },

        confirmarEstatus:function(oEvent){
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts && aContexts.length) {
                var elemento = aContexts.map(function(oContext) {
                    return {
                       codigo      :   oContext.getObject().CODIGO,
                       descripcion :   oContext.getObject().DESCRIPCION
                    };
               });
                //EXECUTE TRANSACTION
                var orden = this.getView().getModel().getProperty("/order");
                var estatus = elemento[0].codigo;
                var descripcion = elemento[0].descripcion;
                var oData = {
                    "ORDER" :   orden,
                    "STATUS":   estatus
                };
                var path = "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/user_status";
                var message =  "¿Confirma Cambio? \n Estatus: " + descripcion;
                var postEx = REFRESH_HEADER;
                this.confirmarAccion(oData,path,message,postEx);
            }
        },

        confirmarEstatusDialog: function(){
            var orden = this.getView().getModel().getProperty("/order");
            var estatus1 = this.byId("tbl_estatusUsuario1").getSelectedItem();
            estatus1 === null ? estatus1 = undefined: estatus1 = this.byId("tbl_estatusUsuario1").getSelectedItem().getBindingContext().getObject().CODIGO;
            //var descripcion1 = this.byId("tbl_estatusUsuario1").getSelectedItem().getBindingContext().getObject().DESCRIPCION;
            var estatus2 = "";
            //var descripcion2 = "";
            var activo2 = "";
            var itemsStatus2 = this.byId("tbl_estatusUsuario2").getItems();
            var items = '<Rowsets>\n';
            items += '<Rowset>\n';

            if(estatus1 !== undefined){
                items += "<Row>\n";
                items += '<ESTATUS>' + estatus1 + '</ESTATUS>\n';
                items += '<ACTIVO>' + "" + '</ACTIVO>\n';
                items += "</Row>\n";
            }

            for(var i = 0; i < itemsStatus2.length; i++){
                estatus2 = itemsStatus2[i].getBindingContext().getObject().CODIGO;
                activo2 = itemsStatus2[i].getSelected() === true ? "" : "X";
                items += "<Row>\n";
                items += '<ESTATUS>' + estatus2 + '</ESTATUS>\n';
                items += '<ACTIVO>' + activo2 + '</ACTIVO>\n';
                items += "</Row>\n";
            }
            //ACTIVO EN REALIDAD ES INACTIVO

            items += "</Rowset>\n";
            items += "</Rowsets>\n";

            var oData = {
                "ORDER" :   orden,
                "STATUS":   items
            };
            var path = "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/user_status";
            var message =  "¿Confirmar Cambio?";
            var postEx = REFRESH_HEADER;
            this.confirmarAccion(oData,path,message,postEx);
        },

        confirmarAccion: function(oData,path,message,postEx){
            var oThis = this;
            MessageBox["warning"](message, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis._ejecutarTransaccion(oData,path,postEx);
                    }
                }.bind(this)
            });
        },

        actualizarCabecera: function(){
            var orden = this.getView().getModel().getProperty("/order");
            var oData = {
                "ORDER" :   orden
            };
            var path = "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/visualizar_orden";
            var nombre= "Cabecera";
            this._base_onloadHeader(oData, path,nombre);
        },

        cancelarTSD:function(oEvent){
            this.byId("tsd_estatusUsuario").destroy();
            //oEvent.getSource().destroy();
        },

        onAfterEjecutarTransaccion: function(postEx,params){
            switch(postEx){
                case REFRESH_HEADER :
                    MessageToast.show(params.mensaje);
                    this.actualizarCabecera();
                    this.cancelarTSD();
                    break;
                case ERROR_MSG:
                    break;
                default:
                    MessageToast.show(params.mensaje);
                    break;
            }
        },

        /********************************************* START CHANGE ORDER STATUS **********************************************/

        onOpenDialogAcceptWork: function () {
            var oView = this.getView(),
                resourceModel = this.getView().getModel("i18n"),
                oData = {
                    "ORDER": oView.getModel().getProperty('/order'),
                    "STATUS": "ACEP"
                };            
            this._MessageBoxChangeOrderEstatus(resourceModel.getResourceBundle().getText("PMChageUserStatus.confirm"), "warning", oData, this);
        },

        _MessageBoxChangeOrderEstatus: function (sMessage, sMessageBoxType, oData, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.changeOrderStatus(oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/user_status');
                    }
                }.bind(this)
            });
        },
        /********************************************* END CHANGE ORDER STATUS ************************************************/

        changeOrderStatus: function (oData, path) {

            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oThis = this;

            sap.ui.core.BusyIndicator.show(0);

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
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].error !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                
                            MessageToast.show(aData[0].message);
                            var xData = {
                                "ORDER": aData[0].object
                            };

                            oThis._base_onloadHeader(xData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/visualizar_orden", "Cabecera");
                        }

                    }
                    else {
                        MessageToast.show("No se recibio informaci�n");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexi�n de red?");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });

        }

    });
}
);