sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/ui/export/Spreadsheet'

], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, Export, ExportTypeCSV, Spreadsheet) {
    "use strict";

    return BaseController.extend("sap.ui.demo.webapp.controller.Mantenimiento.Reservas.CapturaReserva", {

        oPosition: new sap.ui.model.json.JSONModel({ ITEMS: [] }),

        //Funcion de inicilizacion con la configuracion del enrutador 
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("CapturaReserva").attachMatched(this._onRouteMatched, this);

            var fechaDefault = new Date();

            var startDate = this.byId("start_date");
            startDate.setDateValue(fechaDefault);

            var endDate = this.byId("end_date");
            endDate.setDateValue(fechaDefault);

        },
        //Funcion del manejador de evento de coincidencia con la ruta 
        _onRouteMatched: function (oEvent) {
            /**
            * @param {event} oEvent objecto de evento 
            */

            var oArgs, oView,
                oModel = new sap.ui.model.json.JSONModel(),
                oModel_empty = new sap.ui.model.json.JSONModel();

            oArgs = oEvent.getParameter("arguments");
            oView = this.getView();

            var aData = {

            };
            //this.setModelTable();

            var oTable_Reservas = oView.byId('TableItemReservas');

            oModel.setData({ notification: oArgs.id });
            oModel_empty.setData({});
            oView.setModel(oModel);
            oTable_Reservas.setModel(oModel_empty);

            this._base_onloadCOMBO_local("clase_movimiento_select", aData, "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetAllCatalogos", "", "ClaseMovimiento");

            var oData = {
                "p_almacen": "0101"
            };
            this.onloadCOMBO_material(oData, "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetStockByAlmacen", "", "SelectMaterial");

            this.oPosition.setData({ ITEMS: [] });

        },
        //Funcion que crea un modelo JSON con una estructura especifica para mostrarlo en la vista 
        setModelTable: function () {
            var oView = this.getView(),
                oTable = oView.byId('TableItemReservas'),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;
            oModel_empty.setData({
                "ITEMS": [
                    {
                        "POSICION": "",
                        "CENTRO": "",
                        "MATERIAL": "",
                        "DESCRIPCION": "",
                        "ALMACEN": "",
                        "CANTIDAD": "",
                        "CANTIDAD_FIJA": "",
                        "UNIDAD": "",
                        "MOVIMIENTO_PERMITIDO": "",
                        "TEXTO_POSICION": "",
                        "PUESTO_DESC": ""
                    }
                ]
            });
            oTable.setModel(oModel_empty);

        },
        //Funcion para cargar los datos de un combo localmente 
        _base_onloadCOMBO_local: function (Combo, oData, path, setKey, name) {
            /**
             * @param {string} combo -id del control combo al que se cargaran los datos 
              * @param {object} oData almacena los datos como objetos
              * @param {string} path representa la ruta 
              * @param {object} name contiene el nombre de la tabla  
              * @param {string} setKey -clave que se estlabece como seleccionada en el combo 
              */
            //var uri = window.location.protocol + "//" + this.getServerHost() + "/XMII/Runner?Transaction=" + path
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this.getView(),
                oCombo = oView.byId(Combo),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this; //save this

            //gView = oView;

            //oCombo.setModel(oModel_empty);
            //oModel_empty.setData({});

            //oCombo.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    //	console.log(opElement, oCobo);
                    if (opElement.firstChild != null) {
                        var aData = opElement.firstChild.data.replace(/\n/ig, ''); // 20200420
                        aData = eval(aData);
                        //aData = JSON.parse(opElement.firstChild.data.replace(/\n/ig, ''));
                        if (aData[0]['TI_CLSMOV'] !== undefined) {
                            var oCombo = oView.byId('clase_movimiento_select');
                            if (aData[0]['TI_CLSMOV'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_CLSMOV);
                                oModel.setSizeLimit(aData[0].TI_CLSMOV.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_CLSMOV.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }

                        if (aData[0]['TI_CENSUC'] !== undefined) {
                            var oCombo = oView.byId('centro_select');
                            if (aData[0]['TI_CENSUC'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_CENSUC);
                                oModel.setSizeLimit(aData[0].TI_CENSUC.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_CENSUC.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }

                        if (aData[0]['TI_CTAMAY'] !== undefined) {
                            var oCombo = oView.byId('SelectCuentaMayor');
                            if (aData[0]['TI_CTAMAY'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_CTAMAY);
                                oModel.setSizeLimit(aData[0].TI_CTAMAY.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_CTAMAY.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }

                        if (aData[0]['TI_POSPRE'] !== undefined) {
                            var oCombo = oView.byId('SelectPosPre');
                            if (aData[0]['TI_POSPRE'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_POSPRE);
                                oModel.setSizeLimit(aData[0].TI_POSPRE.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_POSPRE.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }

                        if (aData[0]['TI_CTOCTE'] !== undefined) {
                            var oCombo = oView.byId('SelectPCentroCoste');
                            if (aData[0]['TI_CTOCTE'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_CTOCTE);
                                oModel.setSizeLimit(aData[0].TI_CTOCTE.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_CTOCTE.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }

                        if (aData[0]['TI_CTOGTR'] !== undefined) {
                            var oCombo = oView.byId('SelectCentroGestor');
                            if (aData[0]['TI_CTOGTR'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_CTOGTR);
                                oModel.setSizeLimit(aData[0].TI_CTOGTR.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_CTOGTR.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }

                        if (aData[0]['TI_ALMACEN'] !== undefined) {
                            var oCombo = oView.byId('SelectAlmacen');
                            if (aData[0]['TI_ALMACEN'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_ALMACEN);
                                oModel.setSizeLimit(aData[0].TI_ALMACEN.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_ALMACEN.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }

                        if (aData[0]['TI_EQUIPO'] !== undefined) {
                            var oCombo = oView.byId('SelectCCEquipo');
                            if (aData[0]['TI_EQUIPO'].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData[0].TI_EQUIPO);
                                oModel.setSizeLimit(aData[0].TI_EQUIPO.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData[0].TI_EQUIPO.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }


                    } else {
                        MessageToast.show("No se han recibido datos");
                    }
                    if (setKey != "")
                        oCombo.setSelectedKey(setKey);

                    //oCombo.setBusy(false);

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    oCombo.setBusy(false);
                });
        },
        //Funcion del manejador de evento que se ejecuta cuando se cambia la seleccion de almacen 
        onChangeSelectAlmacen: function (oEvent) {
            /**
            * @param {Event} oEvent objecto de evento 
            */
            var oData = {
                "p_almacen": oEvent.getParameter("selectedItem").getKey()
            };
            this.onloadCOMBO_material(oData, "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetStockByAlmacen", "", "SelectMaterial");

        },
        //
        onloadCOMBO_material: function (oData, path, setKey, name) {
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this.getView(),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this; //save this

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    //	console.log(opElement, oCobo);
                    if (opElement.firstChild != null) {
                        var aData = opElement.firstChild.data.replace(/\n/ig, ''); // 20200420
                        aData = eval(aData);
                        //aData = JSON.parse(opElement.firstChild.data.replace(/\n/ig, ''));
                        if (aData[0] !== undefined) {

                            var oComboMat = oView.byId('SelectMaterial');
                            var oComboCSMat = oView.byId('SelectCSMaterial');
                            var oComboCRMat = oView.byId('SelectCRMaterial');

                            if (aData[0].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            }
                            else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                oModel.setSizeLimit(aData.length); // 20200825 ; GAST

                                oComboMat.setModel(oModel);
                                oComboMat.getModel().setSizeLimit(aData.length);

                                oComboCSMat.setModel(oModel);
                                oComboCSMat.getModel().setSizeLimit(aData.length);

                                oComboCRMat.setModel(oModel);
                                oComboCRMat.getModel().setSizeLimit(aData.length);
                            }
                        }
                        else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    }
                    else {
                        MessageToast.show("No se han recibido datos");
                    }
                    //if (setKey != "")
                    //oCombo.setSelectedKey(setKey);

                    //oCombo.setBusy(false);

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    //oCombo.setBusy(false);
                });
        },

        //Funcion del manejador de evento que se ejecuta cuando se cambia la seleccion de material
        onChangeSelectMaterial: function (oEvent) {
            /**
            * @param {Event} oEvent objecto de evento 
            */
            var oData = {
                "material": oEvent.getParameter("selectedItem").getKey()
            };
            this._base_onloadCOMBO("SelectUMEntrada", oData, "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetUmByMaterial", "", "SelectUMEntrada");
        },
        //Funcion del manejador de evento para añadir otra fila a la tabla de 
        onAddRow: function (oEvent) {
            /**
            * @param {Event} oEvent objecto de evento 
            */
            //var centro = this.getView().byId("centro_select");
            var centro = "IN01";
            var material = this.getView().byId("SelectMaterial");
            //var almacen = this.getView().byId("SelectAlmacen");
            var almacen = "0101";
            var cantidad = this.getView().byId("inputCantidad");

            var othis = this;

            var localthis = this;
            //var uri = window.location.protocol + "//" + this.getServerHost() + "/XMII/Runner?Transaction=" + "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetStockByMaterial" +
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetStockByMaterial" +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";

            var oData = {
                "MATERIAL": material.getSelectedKey(),
                "ALMACEN": '0101',//almacen.getSelectedKey(),
                "CENTRO": 'IN01' //centro.getSelectedKey()
            }
            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    //	console.log(opElement, oCobo);
                    if (opElement.firstChild != null) {
                        //var aData = opElement.firstChild.data.replace(/\n/ig, ''); // 20200420
                        //aData = eval(aData);
                        //aData = JSON.parse(opElement.firstChild.data.replace(/\n/ig, ''));
                        var aData = JSON.parse(opElement.firstChild.data);

                        if (aData.ITEMS.length > 0) {
                            if (aData.ITEMS[0]['LABST'] !== undefined) {
                                if (parseInt(aData.ITEMS[0]['LABST']) < parseFloat(cantidad.getValue())) {
                                    MessageToast.show("Stock insuficiente, solo hay disponible la cantidad de: " + aData.ITEMS[0]['LABST']);
                                } else {
                                    var cuenta_mayor = localthis.byId("SelectCuentaMayor");
                                    var fecha_nec = localthis.byId("fecha_base").getValue().split('-');
                                    var send_fecha_nec = fecha_nec[2] + "-" + fecha_nec[1] + "-" + fecha_nec[0];

                                    var cantidad_fija = localthis.byId("check_cantidad_fija").getSelected();
                                    var unidadmedida = localthis.byId("SelectUMEntrada");
                                    var movimiento_permitido = localthis.byId("check_movimiento_permitido").getSelected();
                                    var txt_posicion = localthis.byId("input_txt_pos");
                                    var puesto_desc = localthis.byId("input_puesto_desc");
                                    var text_cantidad_fija = '';

                                    if (cantidad_fija) {
                                        text_cantidad_fija = 'X';
                                    }
                                    var text_movimiento_permitido = '';
                                    if (movimiento_permitido) {
                                        text_movimiento_permitido = 'X';
                                    }                                   
                                                                        
                                    var oTable = localthis.byId('TableItemReservas');
                                    var oModel_empty = new sap.ui.model.json.JSONModel();
                                    //var model = oTable.getModel();
                                    //var items = model.getData();

                                    oModel_empty.setData({});
                                    oTable.setModel(oModel_empty);

                                    var items = othis.oPosition.getProperty("/ITEMS");

                                    items.push({
                                        "POSICION": 1,
                                        //"CENTRO": centro.getSelectedKey(),
                                        "PLANTA": centro,
                                        "CENTRO": centro,
                                        "MATERIAL": material.getSelectedKey(),
                                        //"ALMACEN": almacen.getSelectedKey(),
                                        "DESCRIPCION": material.getSelectedItem().getAdditionalText(),
                                        "ALMACEN": almacen,
                                        "CANTIDAD": cantidad.getValue(),
                                        "CANTIDAD_FIJA": text_cantidad_fija,
                                        "UNIDAD": unidadmedida.getSelectedKey(),
                                        "MOVIMIENTO_PERMITIDO": text_movimiento_permitido,
                                        "TEXTO_POSICION": txt_posicion.getValue(),
                                        "PUESTO_DESC": puesto_desc.getValue(),
                                        "FECHA_NEC": send_fecha_nec,
                                        "CTA_MAY": cuenta_mayor.getSelectedKey(),
                                        "CANT_FIJA": "X",
                                        "MOV_PERM": "X"
                                    });
                                    //var oModel = new sap.ui.model.json.JSONModel();
                                    //oModel.setData(items);
                                    //oTable.setModel(oModel);

                                    othis.oPosition.setProperty("/ITEMS", items);
                                    oTable.setModel(othis.oPosition);
                                    oTable.setBusy(false);

                                    othis.byId("SelectMaterial").setValue("");
                                    othis.byId("inputCantidad").setValue("");
                                    othis.byId("SelectUMEntrada").setValue("");

                                }
                            } else {
                                MessageToast.show("No hay inventario disponible");
                            }
                        } else {
                            MessageToast.show("No hay inventario disponible");
                        }

                    } else {
                        MessageToast.show("No hay inventario disponible");
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    oCombo.setBusy(false);
                });



        },
        onDeletePosition: function (oEvent) {
            var oView = this.getView(),
                oTable = this.byId("TableItemReservas"),
                //oViewModel = oView.getModel("viewModel"),
                oSelectedItems = oTable.getSelectedItems(),
                aContexts = oTable.getSelectedContexts();

            var aBarras = this.oPosition.getProperty("/ITEMS");

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
                oTable.setModel(this.oPosition);
                this.oPosition.setProperty("/ITEMS", aBarras);
                oTable.getModel().refresh();
                this.oPosition.refresh();

            } else {
                MessageToast.show("Seleccionar una posición");
            }
        },
        //Funcion del manejador de evento que almacena y envia los datos de la reserva generada por una transaccion 
        onSave: function (oEvent) {
            /**
            * @param {Event} oEvent objecto de evento 
            */
            var oArgs,
                oView = this.getView(),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;

            var datos = this.byId('TableItemReservas');
            var model = datos.getModel();
            var items = model.getData();
            var combo = null;
            var centro = this.getView().byId("centro_select");

            //var almacen = this.getView().byId("SelectAlmacen");
            var almacen = "0101";
            //var fecha_base = this.getView().byId("fecha_base");
            var fecha_base = this.getView().byId("fecha_base").getValue().split('-');
            var send_fecha_base = fecha_base[2] + "-" + fecha_base[1] + "-" + fecha_base[0];
            var cuenta_mayor = this.getView().byId("SelectCuentaMayor");
            var dest_mcias = this.getView().byId("input_dest_mcias");
            //var clas_mov = this.getView().byId("clase_movimiento_select");
            var clas_mov = "201";
            var cent_cost = this.getView().byId("SelectPCentroCoste");
            var pos_pre = this.getView().byId("SelectPosPre");
            //console.log(items.ITEMS);
                        
            const sMaterialesJSON = JSON.stringify(items.ITEMS);
            console.log(sMaterialesJSON);

            //var lv_xml_items = '<?xml version="1.0" encoding="UTF-8"?><TI_RESERVAI>';

            //$.map(items.ITEMS, function (item, index) {
            //    lv_xml_items += '<item>';
            //    lv_xml_items += '<MATERIAL>' + item.MATERIAL + '</MATERIAL>';
            //    lv_xml_items += '<PLANTA>' + item.CENTRO + '</PLANTA>';
            //    lv_xml_items += '<ALMACEN>' + item.ALMACEN + '</ALMACEN>';
            //    lv_xml_items += '<LOTE></LOTE>';
            //    lv_xml_items += '<CANTIDAD>' + item.CANTIDAD + '</CANTIDAD>';
            //    lv_xml_items += '<UNIDAD>' + item.UNIDAD + '</UNIDAD>';
            //    lv_xml_items += '<FECHA_NEC>' + send_fecha_base + '</FECHA_NEC>';
            //    lv_xml_items += '<CTA_MAY>' + cuenta_mayor.getSelectedKey() + '</CTA_MAY>';
            //    lv_xml_items += '<TXT_POS>' + item.TEXTO_POSICION + '</TXT_POS>';
            //    lv_xml_items += '<DEST_MCIA>' + dest_mcias.getValue() + '</DEST_MCIA>';
            //    lv_xml_items += '<PTO_DESC>' + item.PUESTO_DESC + '</PTO_DESC>';
            //    lv_xml_items += '<CANT_FIJA>' + item.CANTIDAD_FIJA + '</CANT_FIJA>';
            //    lv_xml_items += '<MOV_PERM>' + item.MOVIMIENTO_PERMITIDO + '</MOV_PERM>';
            //    lv_xml_items += '</item>';

            //});
            //lv_xml_items += "</TI_RESERVAI>";
            //console.log(lv_xml_items);

            //var lv_xml_head = '<?xml version="1.0" encoding="UTF-8"?><TI_RESERVAH>';
            //lv_xml_head += '<item>';
            //lv_xml_head += '<PLANTA>IN01</PLANTA>';
            //lv_xml_head += '<FECHA_BASE>' + send_fecha_base + '</FECHA_BASE>';
            //lv_xml_head += '<USUARIO>USERMII</USUARIO>';
            //lv_xml_head += '<CLAS_MOV>201</CLAS_MOV>';
            //lv_xml_head += '<DEST_MCIA>' + dest_mcias.getValue() + '</DEST_MCIA>';
            //lv_xml_head += '<CTO_COST>' + cent_cost.getSelectedKey() + '</CTO_COST>';
            //lv_xml_head += '<POS_PRE>' + pos_pre.getSelectedKey() + '</POS_PRE>';
            //lv_xml_head += '<CTA_MAY>' + cuenta_mayor.getSelectedKey() + '</CTA_MAY>';
            //lv_xml_head += '</item>';
            //lv_xml_head += '</TI_RESERVAH>';
            //console.log(lv_xml_head);

            //var oData = {
            //    xml_items: lv_xml_items,
            //    xml_head: lv_xml_head
            //}

            var oData = {
                PLANTA: "IN01",
                USUARIO: "USERMII",
                CLAS_MOV: clas_mov,
                CTA_MAY: cuenta_mayor.getSelectedKey(),
                CTO_COST: cent_cost.getSelectedKey(),
                FECHA_BASE: send_fecha_base,
                MATERIALES: sMaterialesJSON
            }

            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GenerateReserva_v2" +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";

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
                        var aData = opElement.firstChild.data.replace(/\n/ig, ''); // 20200420
                        aData = eval(aData);
                        console.log(aData);

                        if (aData.length > 0) {
                            if (typeof aData[0].message !== 'undefined')
                                oThis.getOwnerComponent().openHelloDialog(aData[0].message);
                            else
                                oThis.getOwnerComponent().openHelloDialog("Error: " + aData[0].error);
                        }

                        var oTable_Reservas = oView.byId('TableItemReservas');
                        oModel_empty.setData({});
                        oTable_Reservas.setModel(oModel_empty);
                        oThis.oPosition.setData({ ITEMS: [] });
                    }

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    oCombo.setBusy(false);
                });
        },

        onShowCRView: function (oEvent) {
            var
                oThis = this, //save this
                oItem = oEvent.getSource(),
                oCtx = oItem.getBindingContext(),
                oComboMaterial = this.byId("SelectCRMaterial").getValue(),
                oInputStartDate = this.byId("start_date"),
                oInputEndDate = this.byId("end_date"),
                start_date = '',
                end_date = '',
                send_start_date = '',
                send_end_date = '',
                xml_data = '',
                reserva = this.byId("num_reserva_input").getValue();

            if (oInputStartDate.getValue() != "" && oInputEndDate.getValue()) {

                start_date = oInputStartDate.getValue().split('-');
                send_start_date = start_date[2] + start_date[1] + start_date[0];

                end_date = oInputEndDate.getValue().split('-');
                send_end_date = end_date[2] + end_date[1] + end_date[0];

                var oData = {
                    "MATERIAL": oComboMaterial,
                    "RESERVA": reserva,
                    "FECHA_INI": send_start_date,
                    "FECHA_FIN": send_end_date
                };

                this._base_onloadTable("Table_reservas", oData, "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetReservas", "Reservas", "");
            }
            else {
                oThis.getOwnerComponent().openHelloDialog("Debe seleccionar un rango de fechas");
            }
        },

        onShowCSView: function (oEvent) {
            var
                oThis = this, //save this
                oItem = oEvent.getSource(),
                oCtx = oItem.getBindingContext(),
                oComboMaterial = this.byId("SelectCSMaterial").getValue();

            if (oComboMaterial != "") {

                var oData = {
                    "MATERIAL": oComboMaterial,
                    "CENTRO": "IN01",
                    "ALMACEN": "0101"
                };

                this._base_onloadTable("Table_stock", oData, "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetStockByMaterial", "StockMaterial", "");
            }
            else {
                oThis.getOwnerComponent().openHelloDialog("Debe seleccionar un material");
            }
        },

        onShowCCView: function (oEvent) {
            var
                oThis = this, //save this
                oItem = oEvent.getSource(),
                oCtx = oItem.getBindingContext(),
                oComboEquipo = this.byId("SelectCCEquipo").getValue();

            if (oComboEquipo != "") {

                var oData = {
                    "EQUIPO": oComboEquipo,
                    "CENTRO": "IN01",
                    "ALMACEN": "0101"
                };

                this._base_onloadTable("Table_componentes", oData, "MII/DatosTransaccionales/Mantenimiento/Reservas/Transaction/GetComponentesByEquipo", "Componentes", "");
            }
            else {
                oThis.getOwnerComponent().openHelloDialog("Debe seleccionar un equipo");
            }
        },

    });
}
);




