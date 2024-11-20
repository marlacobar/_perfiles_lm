// JavaScript source code
sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

], function (JQuery, BaseController, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("sap.ui.demo.webapp.controller.Mantenimiento.Ordenes.crearOrden", {

        oOperacion: new sap.ui.model.json.JSONModel({ ITEMS:[] }),

        //Funcion de inicializacion del controlador con la configuracion del enrutador 
        onInit: function () {
            
            var oRouter = this.getRouter();
            oRouter.getRoute("crearOrdenPM").attachMatched(this._onRouteMatched, this);

        },
        //Funcion del manejo de evento de la coincidencia de ruta trayendo los datos de getUsuario 
        _onRouteMatched: function (oEvent) {
            /**
           * @param {Event} oEvent funcion de evento manejador
           */
            this._getUsuario("username");
            var oArgs, oView,
                oModel = new sap.ui.model.json.JSONModel(),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                view_button = this.getView().byId("viewButton"),
                create_button = this.getView().byId("createButton");

            oArgs = oEvent.getParameter("arguments");
            oView = this.getView();

            var oTable_Oper = oView.byId('PMOperationList');

            oModel.setData({ notification: oArgs.id });
            oModel_empty.setData({});
            oView.setModel(oModel);
            oTable_Oper.setModel(oModel_empty);
            

            if (view_button.getVisible()) {
                view_button.setVisible(false);
            }

            if (!create_button.getVisible()) {
                create_button.setVisible(true);
            }
                        
            oView.bindElement({
                path: "/"
            });

            var oData = {
                "NOTIFICATION": oArgs.id
            };

            this.oOperacion.setData({ ITEMS: [] });

            console.log(oData);
            this.datosAviso(oData, 'MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/notification_detail');
        },
        //Funcion del manejador de evento del boton para navegar a la pagina detalleOrdenPM 
        onViewPMOrder: function (oEvent) {
            /**
           * @param {Event} oEvent funcion de evento manejador
           */
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("detalleOrdenPM", {
                id: oCtx.getProperty("order")
            });

        },

        //Funcion para agregar operaciones 
        onAddOperation: function (oEvent) {

            if (this.validaCapturaOperaciones()) {

                var input_description = this.byId("txt_operacion"),                   
                    input_ctd_per = this.byId("ctd_personas"),
                    input_dur_ope = this.byId("duracion_oper"),
                    oModel_empty = new sap.ui.model.json.JSONModel(),
                    oView = this.getView(),
                    oTable = oView.byId("PMOperationList");

                oModel_empty.setData({});
                oTable.setModel(oModel_empty);

                var objOperacion = this.oOperacion.getProperty("/ITEMS");
                objOperacion.push({
                    "operation": ((objOperacion.length + 1) * 10).toString().padStart(4,"0"),
                    "plant": '',
                    "work_center": '',
                    "control_key": 'PM01',
                    "description": input_description.getValue(),
                    "work": input_dur_ope.getValue(),
                    "capacities": input_ctd_per.getValue()
                });

                this.oOperacion.setProperty("/ITEMS", objOperacion);

                oTable.setModel(this.oOperacion);
                oTable.setBusy(false);

                this.byId("txt_operacion").setValue("");
                this.byId("ctd_personas").setValue("");
                this.byId("duracion_oper").setValue("");

            }

        },

        onDeleteOperation: function () {

            var oView = this.getView(),
                oTable = this.byId("PMOperationList"),
                //oViewModel = oView.getModel("viewModel"),
                oSelectedItems = oTable.getSelectedItems(),
                aContexts = oTable.getSelectedContexts();

            var aBarras = this.oOperacion.getProperty("/ITEMS");

            if (oSelectedItems.length > 0) {

                for (var i = aContexts.length - 1; i >= 0; i--) {
                    var oThisObj = aContexts[i].getObject();
                    var index = $.map(aBarras, function (obj, index) {
                        if (obj === oThisObj) {
                            return index;
                        }
                    })
                    aBarras.splice(index, 1);
                }

                for (var i in aBarras) {
                    aBarras[i].operation = ((parseInt(i) + 1) * 10).toString().padStart(4, "0")
                }

                oTable.removeSelections(true);
                oTable.setModel(this.oOperacion);
                this.oOperacion.setProperty("/ITEMS", aBarras);
                oTable.getModel().refresh();
                this.oOperacion.refresh();

            } else {
                MessageToast.show("Seleccionar una posición");
            }
        },

        validaCaptura: function () {
            var combo_orderType = this.byId("PMType"),
                input_description = this.byId("PM_orderDesc"),
                combo_priority = this.byId("priority"),
                validaCampos = true;

            if (input_description.getValue() == '') {
                this.getOwnerComponent().openHelloDialog("Ingresa una descripcion");
                validaCampos = false;
            }
            else if (combo_priority.getValue() == '') {
                this.getOwnerComponent().openHelloDialog("Selecciones la prioridad");
                validaCampos = false;
            }
           
            return validaCampos;
        },

        validaCapturaOperaciones: function () {
            var input_description = this.byId("txt_operacion"),
                input_ctd_per = this.byId("ctd_personas"),
                input_dur_ope = this.byId("duracion_oper"),
                validaCampos = true;

            if (input_description.getValue() == '') {
                this.getOwnerComponent().openHelloDialog("Ingresa una descripcion");
                validaCampos = false;
            }
            else if (input_dur_ope.getValue() == '') {
                this.getOwnerComponent().openHelloDialog("Indica  la  duración de la operacion");
                validaCampos = false;
            }
            else if (input_ctd_per.getValue() == '') {
                this.getOwnerComponent().openHelloDialog("Indica  la  ctd de  personas");
                validaCampos = false;
            }

            return validaCampos;
        },

        //Funcion para crear una orden PM haciendo el envio de datos proporcionado con la transaccion 
        onCreatePMOrder: function (oEvent) {
            /**
           * @param {Event} oEvent funcion de evento manejador
           */
            var combo_orderType = this.byId("PMType"),
                input_description = this.byId("PM_orderDesc"),
                combo_priority = this.byId("priority"),
                input_ctd_per = this.byId("ctd_personas"),
                input_dur_ope = this.byId("duracion_oper");

            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();

            const aPosiciones = this.oOperacion.getProperty("/ITEMS");

            const sPosicionesJSON = JSON.stringify(aPosiciones);

            //if (input_description.getValue() == '') {
            //    this.getOwnerComponent().openHelloDialog("Ingresa una descripcion");
            //}
            //else if (input_dur_ope.getValue() == '') {
            //    this.getOwnerComponent().openHelloDialog("Indica  la  duraci?n de la operacion");
            //}
            //else if (input_ctd_per.getValue() == '') {
            //    this.getOwnerComponent().openHelloDialog("Indica  la  ctd de  personas");
            //}
            //else {

            if (aPosiciones.length > 0) {
                var oData = {
                    "NOTIFICATION": oCtx.getProperty("notification"),
                    "ORDER_TYPE": combo_orderType.getSelectedKey(),
                    "PRIORITY": combo_priority.getSelectedKey(),
                    "SHORT_TEXT": input_description.getValue(),
                    "DURATION_NORMAL": input_dur_ope.getValue(),
                    "NUMBER_OF_CAPACITIES": input_ctd_per.getValue(),
                    "OPERATIONS": sPosicionesJSON
                };

                console.log(oData);
                this.createPMOrder('PMOrderOperation', oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/createOrder_v2');
            }
            else {
                this.getOwnerComponent().openHelloDialog("Capture al menos una operación");
            }
            //}

        },
        //Funcion para obtener los datos relacionado coon un aviso atraves de una solicitud 
        datosAviso: function (oData, path) {
            /**
              * @param {object} oData almacena los datos como objetos
              * @param {string} path representa la ruta   
              */

            var uri = window.location.protocol + "//" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            console.log(uri);

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
                    console.log(xmlDOM);
                    if (xmlDOM.getElementsByTagName("Row")[0] === undefined)
                        MessageToast.show("Error al obtener los datos del aviso");
                    else {
                        var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                        if (opElement.firstChild !== null) {
                            var aData = JSON.parse(opElement.firstChild.data);
                            if (aData !== undefined) {
                                if (aData.error !== undefined) {
                                    oThis.getOwnerComponent().openHelloDialog(aData.error);
                                }
                                else {
                                    oThis.byId("PM_orderDesc").setValue(aData.short_text);
                                    oThis._base_onloadCOMBO('priority', {}, 'MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/prioridades_select_CEMH', aData.priority, "Prioridades");
                                }
                            }
                            else {
                                MessageToast.show("No se han recibido datos");
                            }
                        }
                        else {
                            MessageToast.show("No se han recibido datos");
                        }
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
        //Funcion para crear una roden de mantenimiento atravez de una solicitud 
        createPMOrder: function (idObject, oData, path) {
            /**
              * @param {object} oData almacena los datos como objetos
              * @param {string} path representa la ruta 
              * @param {string} idObject identificator del objecto 
              */

            var uri = window.location.protocol + "//" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
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
                            var oData = {
                                "ORDER": aData[0].object
                            },
                                oModel = new sap.ui.model.json.JSONModel(),
                                oView = oThis.getView(),
                                create_button = oThis.getView().byId("createButton"),
                                view_button = oThis.getView().byId("viewButton"),
                                cancel_button = oThis.getView().byId("cancelCreate"),
                                oTable = oThis.getView().byId("PMOperationList"),
                                oModel_empty = new sap.ui.model.json.JSONModel(),
                                toolbar_table = oThis.getView().byId("toolbar");


                            oModel.setData({ order: aData[0].object });
                            oView.setModel(oModel);

                            oModel_empty.setData({});
                            oTable.setModel(oModel_empty);

                            oThis._base_onloadTable('PMOperationList', oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_operations', "Operaciones", "");

                            if (create_button.getVisible()) {
                                create_button.setVisible(false);
                            }
                            if (!view_button.getVisible()) {
                                view_button.setVisible(true);
                            }

                            if (cancel_button.getVisible()) {
                                cancel_button.setVisible(false);
                            }

                            if (toolbar_table.getEnabled()) {
                                toolbar_table.setEnabled(false);
                            }
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: ?Hay conexi?n de red?");
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
        //Funcion para cancelar la operacion de crear Orden PM 
        onCancelCreatePMOrder: function () {
            var resourceModel = this.getView().getModel("i18n");
            this._handleMessageBoxOpen(resourceModel.getResourceBundle().getText("cancel.createPMOrder"), "warning");
        },
        //Funcion de evento cuando se cancela la creacioon de orden muestra un mensaje y navega a atras 
        _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
            /**
            * @param {string} sMessage - Mensaje que se mostrara en el cuadro de dialogo.
            * @param {string} sMessageBoxType - Tipo de cuadro de dialogo, como "confirm", "warning", etc.
            */
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this.onNavBack();
                    }
                }.bind(this)
            });
        }

    });
}
);
