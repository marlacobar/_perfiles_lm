sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/json/JSONModel',
    "sap/ui/vk/ContentResource",
    "sap/ui/vk/ContentConnector",
    "sap/ui/vk/dvl/ViewStateManager",
    "sap/ui/core/Fragment",

], function (JQuery, BaseController, MessageToast, MessageBox, JSONModel, ContentResource, ContentConnector, ViewStateManager, Fragment) {
    "use strict";

    return BaseController.extend("sap.ui.demo.webapp.controller.Mantenimiento.Avisos.avisoDetalle", {
        onInit: function () {
            //jQuery.sap.getUriParameters().get("Plant")
            var oRouter = this.getRouter();
            oRouter.getRoute("avisoDetalle").attachMatched(this._onRouteMatched, this);            
        },
        _onRouteMatched: function (oEvent) {
            this._getUsuario("username");
            var
                oArgs = oEvent.getParameter("arguments"),
                oView = this.getView(),
                oThis = this;

            oView.bindElement({
                path: "/"
            });

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});

            this.getView().setModel(oModel);

            var binding = new sap.ui.model.Binding(oModel, "/", oModel.getContext("/"));
            binding.attachChange(function () {

                if (oModel.getProperty("/order") !== "")
                    oThis.byId("addOrder").setEnabled(false);
                else
                    oThis.byId("addOrder").setEnabled(true);

                if (oModel.getProperty("/status") === "MEAB")
                    oThis.byId("releaseOrder").setEnabled(true);
                else
                    oThis.byId("releaseOrder").setEnabled(false);

                if (oModel.getProperty("/status").includes("MECE")) {
                    oThis.byId("closeNotif").setEnabled(false);
                    oThis.byId("statusUsuarioAviso").setEnabled(false);
                }
                
            });

            var oData = {
                "NOTIFICATION": oArgs.id
            };
            this._base_onloadHeader_changed(oData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/notification_detail", "Cabecera Aviso", oModel);
            
        },        

        onRelease: function (oEvent) {
            var 
                oItem = oEvent.getSource(),
                resourceModel = this.getView().getModel("i18n"),
                oCtx = oItem.getBindingContext();

            var oData = {
                "AVISO": oCtx.getProperty("id")
            };
            this._handleMessagePutInProgress(resourceModel.getResourceBundle().getText("Liberar aviso de Mantenimiento"), "confirm", oData, this);
        },

        _handleMessagePutInProgress: function (sMessage, sMessageBoxType, oData, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.putInProgress(oData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/poner_en_tratamiento");
                    }
                }.bind(this)
            });
        },

        putInProgress: function (oData, path) {
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

                    if (opElement.firstChild !== null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].error !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                
                            MessageToast.show(aData[0].message);
                            var xData = {
                                "NOTIFICATION": aData[0].object
                            };
                            oThis.byId("releaseOrder").setEnabled(false);
                            oThis._base_onloadHeader(xData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/poner_en_tratamiento", "Cabecera Aviso");
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
        },

        onShowCreatePMOrder: function (oEvent) {            
            var                 
            oItem = oEvent.getSource(),
            oCtx = oItem.getBindingContext();
            
            this.getRouter().navTo("crearOrdenPM", {
                id: oCtx.getProperty("id")
            });            
        },

        onShowOrder: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("PMOrderDetail", {
                id: oCtx.getProperty("order")
            });

        },

        onAcceptRoomReservation: function (oEvent) {

            var fragmentId = this.getView().createId("fr1");
            var tab = sap.ui.core.Fragment.byId(fragmentId, "userData");
            console.log(tab);
        },
       

        verImgEquipo: function (oEvent) {
            // create popover
            var oView = this.getView();
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Mantenimiento.viewImageEquipment", this);
                this.getView().addDependent(this._oPopover);                
            }

            this._oPopover.openBy(oEvent.getSource());

            var oViewport = oView.byId("viewport");


            // Constructor for a new content resource. procides an object that owns content resouces, tracks changes, loads and destroys
            // content built from the content resource.
            var contentResource = new ContentResource({
                // specifying the resource to load
                source: "images/compresor.vds",
                sourceType: "vds",
                sourceId: "abc123"
            });
            // Constructor for a new content connector
            var contentConnector = new ContentConnector("abcd");

            // Manages the visibility and the selection states of nodes in the scene.
            var viewStateManager = new ViewStateManager("vsmA", {
                contentConnector: contentConnector
            });

            // set content connector and viewStateManager for viewport
            oViewport.setContentConnector(contentConnector);
            oViewport.setViewStateManager(viewStateManager);

            oView.addDependent(contentConnector).addDependent(viewStateManager);

            // Add resource to load to content connector
            contentConnector.addContentResource(contentResource);
                        
        }, 

        handleEmailPress: function (oEvent) {
            this._oPopover.close();            
        },

        onEstatusUsuario: function(oEvent){
            var oView = this.getView();
            var oThis=this;
            if(!this.byId("tsd_estatusUsuarioAvisos")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.Mantenimiento.EstatusUsuarioAvisos",
                    controller:this
                }).then(function (oDialog) {                    
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.enlistarEstatusUsuario();
                });
            }else{
                this.byId("tsd_estatusUsuarioAvisos").open();
                this.enlistarEstatusUsuario();
            } 
        },

        enlistarEstatusUsuario: function(){
            var aviso = this.getView().getModel().getProperty("/id");
            var oData = {
                "AVISO" :   aviso
            };
            var path = "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/get_user_status_Clasif";
            var tabla = "tbl_estatusUsuario1";
            var nombre = "Estatus_Usuario";
            this._base_onloadTable(tabla, oData, path, nombre,"");    
   
        }, 

        cancelarTSD:function(oEvent){
            this.byId("tsd_estatusUsuario").destroy();
            //oEvent.getSource().destroy();
        }, 

        confirmarEstatusDialog: function(){
            const aviso = this.getView().getModel().getProperty("/id");
            const estatus = this.byId("tbl_estatusUsuario1").getSelectedItem().getBindingContext().getObject().CODIGO;

            let oData = {
                "AVISO" :   aviso,
                "STATUS":   estatus
            };

            var path = "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/user_status";
            var message =  "¿Confirmar Cambio?";
            var postEx = "REFRESH_HEADER";
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

        onCloseNotif: function(oEvent) {
            var 
                oItem = oEvent.getSource(),
                resourceModel = this.getView().getModel("i18n"),
                oCtx = oItem.getBindingContext();

            var oData = {
                "AVISO": oCtx.getProperty("id")
            };
            this._handleMessageClose(resourceModel.getResourceBundle().getText("Cerrar aviso de Mantenimiento"), "confirm", oData, this);            
        },

        _handleMessageClose: function (sMessage, sMessageBoxType, oData, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.closeNotif(oData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/cerrar_aviso");
                    }
                }.bind(this)
            });
        },

        closeNotif: function (oData, path) {
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

                    if (opElement.firstChild !== null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].error !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                
                            MessageToast.show(aData[0].message);

                            var xData = {
                                "NOTIFICATION": oData.AVISO
                            };
                            this._base_onloadHeader_changed(xData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/notification_detail", "Cabecera Aviso", oModel);
                            oThis.byId("closeNotif").setEnabled(false);

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
        },                          

    });
}
);