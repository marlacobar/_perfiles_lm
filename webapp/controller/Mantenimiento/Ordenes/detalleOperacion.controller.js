// JavaScript source code
// JavaScript source code
sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/json/JSONModel'

], function (JQuery, BaseController, MessageToast, MessageBox, JSONModel) {
    "use strict";
    const LISTA_MATERIALES = "LISTA_MATERIALES";
    const COMPONENTES = "COMPONENTES";
    return BaseController.extend("sap.ui.demo.webapp.controller.Mantenimiento.Ordenes.detalleOperacion", {

        oComponent: new sap.ui.model.json.JSONModel({ ITEMS: [] }),
        oOrder: "",
        oActivity: "",

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("detalleOperacionPM").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username");
            var oArgs, oView;
            oArgs = oEvent.getParameter("arguments");
            oView = this.getView();
            var plant = oArgs.plant;

            oView.bindElement({
                path: "/"
            });

            this.oOrder = oArgs.order;
            this.oActivity = oArgs.activity;

            var aData = {
                "ORDER": oArgs.order,
                "OPERATION": oArgs.activity
            };

            //this.oComponent.setData({ ITEMS: [] });

            oView.getModel().setProperty('/order', oArgs.order);
            oView.getModel().setProperty('/operation', oArgs.activity);

            this.byId("PMComponentList").getColumns()[1].setVisible(false);
            this.byId("PMComponentList").getColumns()[0].setVisible(false);
            this._base_onloadTable("PMComponentList", aData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_components", "Componentes", "");
            this._base_onloadHeader(aData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_operation", "Cabecera");
        },

        /****************************** START COMPONENT ***************************************/
        onDocumentos: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();

            this.getRouter().navTo("detalleMAF",
                {
                    id: oCtx.getProperty("equipo"),
                });
        },

        onOpenDialogAddComponent: function (oEvent) {
            var boton = oEvent.getSource().getId();
            var accion = "";
            if (boton.indexOf("lista") > 0) {
                accion = LISTA_MATERIALES;
            } else {
                accion = COMPONENTES;
            }

            var oView = this.getView(),
                oDialog = oView.byId("AddComponentDialog"),
                oData = {
                    "ORDER": oView.getModel().getProperty('/order')
                };
            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PMAddComponent", this);
                oView.addDependent(oDialog);
            }

            oView.byId('inputQuantity').setValue('');
            oView.byId('material_addOperation').getSelectedKey('');

            //JERO LISTA MATERIALES
            if (accion === LISTA_MATERIALES) {
                var cmb_material = this.byId("material_addOperation");
                var modeloInicial = new sap.ui.model.json.JSONModel();
                modeloInicial.setData({});
                cmb_material.setModel(modeloInicial);
                this._base_onloadCOMBO("material_addOperation", oData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/Equipo_ListaMateriales", "", "Materiales");
            } else {
                this._base_onloadCOMBO("material_addOperation", {}, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_materiales", "", "Materiales");
            }

            oDialog.open();
        },

        onDeleteComponent: function (oEvent) {
            var oView = this.getView(),
                oTable = this.byId("PMComponentList"),
                //oViewModel = oView.getModel("viewModel"),
                oSelectedItems = oTable.getSelectedItems(),
                aContexts = oTable.getSelectedContexts(),
                othis = this;
                                  
            var oArgs = oEvent.getParameter("arguments");

            
            othis.oComponent.setData({ ITEMS: [] });
            var items = othis.oComponent.getProperty("/ITEMS");

            if (oSelectedItems.length > 0) {

                for (var i = aContexts.length - 1; i >= 0; i--) {
                    var oThisObj = aContexts[i].getObject();
                    
                    items.push({
                        "consumption": oThisObj.consumption,
                        "item_number": oThisObj.item_number,
                        "material": oThisObj.material,
                        "matl_desc": oThisObj.matl_desc,
                        "plant": oThisObj.plant,
                        "quantity": oThisObj.quantity,
                        "res_item": oThisObj.res_item,
                        "reserv_no": oThisObj.reserv_no,
                        "stage": oThisObj.stage,
                        "unit": oThisObj.unit
                    });
                }

                var sComponentesJSON = JSON.stringify(items);
                                
                var oData = {
                    OPERATION: othis.oActivity,
                    ORDER: othis.oOrder,
                    COMPONENTS: sComponentesJSON
                }

                this.deleteComponent(oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/delete_component');

            } else {
                MessageToast.show("Seleccionar al menos una posición");
            }
        },

        onCloseDialogAddComponentCancel: function () {
            this.getView().byId("AddComponentDialog").close();
        },

        onCloseDialogAddComponentConfirm: function (oEvent) {
            var material = this.byId('material_addOperation'),
                quantity = this.byId('inputQuantity'),
                resourceModel = this.getView().getModel("i18n");

            this.onCloseDialogAddComponentCancel();

            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();

            //JERO AJUSTE MATERIAL
            if (material.getSelectedKey().trim() === "Materiales" || material.getSelectedKey().trim() === "") {
                this.getOwnerComponent().openHelloDialog(resourceModel.getResourceBundle().getText("Debe seleccionar material"));
                return;
            }
            else
                if (quantity.getValue() === '' || quantity.getValue() == '0') {
                    this.getOwnerComponent().openHelloDialog(resourceModel.getResourceBundle().getText("Debe  inresar ctd"));
                    return;
                }

            var oData = {
                "MATERIAL": material.getSelectedKey(),
                "QUANTITY": quantity.getValue(),
                "STAGE": material.getSelectedItem().getText().split("||")[2] === undefined ? "" : material.getSelectedItem().getText().split("||")[2].split(":")[1].trim(),
                "PLANT": oCtx.getProperty("plant"),
                "OPERATION": oCtx.getProperty("activity"),
                "ORDER": oCtx.getProperty("order")
            };
            console.log(oData);

            this.addComponent(oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/add_component');
        },

        addComponent: function (oData, path) {

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
                                "ORDER": aData[0].object,
                                "OPERATION": aData[0].object2
                            };
                            oThis._base_onloadTable("PMComponentList", xData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_components", "Componentes", "");
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio informaci�n");
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

        deleteComponent: function (oData, path) {

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
                                "ORDER": aData[0].object,
                                "OPERATION": aData[0].object2
                            };
                            oThis._base_onloadTable("PMComponentList", xData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_components", "Componentes", "");
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio informaci�n");
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

        /****************************** END COMPONENT ****************************************/

        /****************************** START NOTIFICATION ***************************************/

        onOpenDialogAddNotification: function (oEvent) {
            var
                oItem = oEvent.getSource(),
                oCtx = oItem.getBindingContext(),
                oView = this.getView(),
                oDialog = oView.byId("PMNotificationDialog");

            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PMNotification", this);
                oView.addDependent(oDialog);
            }
            var oData = {},
                oInputDesc = oView.byId('inputDescOperation'),
                oAData = {
                    "WERKS": oCtx.getProperty("plant"),
                    "PLANT": oCtx.getProperty("plant")
                };

            oInputDesc.setValue(oCtx.getProperty("description"));
            oView.byId('start_date').setValue('');
            oView.byId('end_date').setValue('');
            oView.byId('NOTI').setSelected(false);

            this._base_onloadCOMBO("listPMDesviacion", oAData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_desv", "Desviaciones");
            this._base_onloadCOMBO("workCenter_list", oAData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/puestos_trabajo_pm", oCtx.getProperty("work_center"), "Centro Trabajo");

            oDialog.open();
        },

        onCloseDialogAddNotification: function () {
            this.getView().byId("PMNotificationDialog").close();
        },

        onCloseDialogAddNotificationConfirm: function (oEvent) {
            var descOperation = this.byId('inputDescOperation'),
                devReason_list = this.byId('listPMDesviacion'),
                start_date = this.byId('start_date'),
                end_date = this.byId('end_date'),
                oComboUser = this.byId('listPMUsers'),
                oComboWorkCenter = this.byId('workCenter_list'),
                num_nomina = "",
                checkNoti = this.byId("NOTI"),
                NOTI = '';

            if (checkNoti.getSelected() === true)
                NOTI = 'X';
            else
                NOTI = '';

            if (descOperation.getValue() === '') {
                this.getOwnerComponent().openHelloDialog("Ingresa una descripcion");
            }
            else if (start_date.getValue() === '') {
                this.getOwnerComponent().openHelloDialog("Ingresa una fecha de inicio");
            }
            else if (end_date.getValue() === '') {
                this.getOwnerComponent().openHelloDialog("Ingresa una fecha de termino");
            }
            else if (oComboWorkCenter.getSelectedKey() === '') {
                this.getOwnerComponent().openHelloDialog("Selecciona un puesto de trabajo");
            }
            else {
                this.onCloseDialogAddNotification();

                var oItem, oCtx;
                oItem = oEvent.getSource();
                oCtx = oItem.getBindingContext();
                var oData = {
                    "DESCRIPTION": descOperation.getValue(),
                    "ORDER": oCtx.getProperty("order"),
                    "OPERATION": oCtx.getProperty("activity"),
                    "PLANT": oCtx.getProperty("plant"),
                    "WORK_CENTER": oComboWorkCenter.getSelectedKey(),
                    "DEV_REASON": devReason_list.getSelectedKey() == "Desviaciones" ? "0000" : devReason_list.getSelectedKey(),
                    "START_DATE": start_date.getValue(),
                    "END_DATE": end_date.getValue(),
                    "ACTIVITY_TYPE": oCtx.getProperty("acttype"),
                    "NOTI": NOTI
                };
                console.log(oData);
                this.createNotification(oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/notification');
            }

        },

        createNotification: function (oData, path) {

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
                    console.log(opElement);
                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData[0].error !== undefined) {
                            var xData = {
                                "ORDER": aData[0].object,
                                "OPERATION": aData[0].object2
                            };

                            oThis._base_onloadHeader(xData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_operation", "Cabecera");
                            oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                        }
                        else {
                            //Create  the JSON model and set the data                                                                                                
                            MessageToast.show(aData[0].message);

                            var yData = {
                                "ORDER": aData[0].object,
                                "OPERATION": aData[0].object2
                            };

                            oThis._base_onloadHeader(yData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_operation", "Cabecera");
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio informaci�n");
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

        /****************************** END NOTIFICATION ****************************************/

        /****************************** START CONSUMPTION ****************************************/

        onOpenDialogAddConsumption: function (oEvent) {
            var orden = this.getView().getModel().getProperty("/order");
            var operacion = this.getView().getModel().getProperty("/activity");
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();

            var items = this.getView().byId("PMComponentList").getSelectedItems();
            var xml_completo = '<Rowsets>\n';
            xml_completo += '<Rowset>\n';

            var i = 0;
            var error = 0;
            items.forEach(function (item) {
                if (item.getCells()[9].getBindingContext().getProperty("quantity_consumption").trim() !== "" && item.getCells()[9].getBindingContext().getProperty("quantity_consumption") != 0 && item.getCells()[9].getBindingContext().getProperty("quantity_consumption") != undefined) {
                    i++;
                    xml_completo += '<Row>\n';
                    xml_completo += '<RESERV_NO>' + item.getCells()[0].getProperty("text") + '</RESERV_NO>\n';
                    xml_completo += '<RES_ITEM>' + item.getCells()[1].getProperty("text") + '</RES_ITEM>\n';
                    xml_completo += '<MATERIAL>' + item.getCells()[3].getTitle() + '</MATERIAL>\n';
                    xml_completo += '<MATERIAL_DESC>' + item.getCells()[4].getProperty("text") + '</MATERIAL_DESC>\n';
                    xml_completo += '<STGE_LOC>' + item.getCells()[7].getProperty("text") + '</STGE_LOC>\n';
                    xml_completo += '<PLANT>' + item.getCells()[8].getProperty("text") + '</PLANT>\n';
                    xml_completo += '<QUANTITY>' + item.getCells()[9].getBindingContext().getProperty("quantity_consumption") + '</QUANTITY>\n';
                    xml_completo += '<UM>' + item.getCells()[6].getProperty("text") + '</UM>\n';
                    xml_completo += '<ORDER>' + orden + '</ORDER>\n';
                    xml_completo += '<OPERATION>' + operacion + '</OPERATION>\n';
                    xml_completo += "</Row>\n";
                } else {
                    error++;
                }
            });
            xml_completo += "</Rowset>\n";
            xml_completo += "</Rowsets>\n";
            console.log(xml_completo);
            if (i != 0 && error === 0) {
                var oData = {
                    "GOODS_ISSUES": xml_completo
                };

                var message = "¿Confirma consumo?"
                var path = "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/consumption";
                this.confirmarAccion(oData, path, message);

                //this.createConsumption(oData, 'MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/consumption');
            } else {
                this.getOwnerComponent().openHelloDialog("Debe indicar una CANTIDAD a consumir");
            }


        },

        createConsumption: function (oData, path) {

            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oThis = this;

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
                            };
                            oThis._base_onloadTable("PMComponentList", oData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_components", "Componentes", "");
                        }

                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio informaci�n");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexi�n de red?");

                        sap.ui.core.BusyIndicator.hide();
                    }
                });

        },

        /****************************** END CONSUMPTION ****************************************/

        //JERO 20 SEP 2023
        confirmarAccion: function (oData, path, message) {
            var oThis = this;
            MessageBox["warning"](message, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this.createConsumption(oData, path);
                    }
                }.bind(this)
            });
        },

    });
}
);

