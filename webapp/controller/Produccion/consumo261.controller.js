sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/ui/model/json/JSONModel',
    "sap/ui/demo/webapp/model/formatter",
    'sap/ui/core/mvc/Controller',

], function (JQuery, BaseController, MessageToast, MessageBox, JSONModel, fragment, formatter, Controller) {
    "use strict";

    var vltyp = '';
    var cantrest = '';
    var useretiqueta = '';

    return BaseController.extend("sap.ui.demo.webapp.controller.Produccion.consumo", {

        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("Consumo261").attachMatched(this._onRouteMatched, this);

            var oThis = this;
            oThis.byId('work_center').setValue("");
            oThis.byId('orden_input').setValue("");
            oThis.byId('Material_input').setValue("");
            oThis.byId('um').setValue("");
            oThis.byId('centro').setValue("");
            oThis.byId('almacen').setValue("");
            oThis.byId('lote_select').setValue("");
            oThis.byId('ctd').setValue("");
            oThis.byId('lbl_cantdispo').setText("");

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var nombre = $(xml).find('Profile').attr('firstname');
                    var apellido = $(xml).find('Profile').attr('lastname');
                    var idUs = $(xml).find('Profile').attr('uniquename');
                    idUs = idUs.toUpperCase();
                    oThis.byId("usuario").setValue(idUs);
                    useretiqueta = idUs;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });

            this.getWC("username");

        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username");

        },

        getWC: function (id) {
            var oThis = this;
            oThis.byId('orden_input').setValue("");
            oThis.byId('Material_input').setValue("");
            oThis.byId('um').setValue("");
            oThis.byId('centro').setValue("");
            oThis.byId('almacen').setValue("");
            oThis.byId('lote_select').setValue("");
            oThis.byId('ctd').setValue("");
            oThis.byId('lbl_cantdispo').setText("");

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var oData = {};
                    oThis._base_onloadCOMBO("work_center", oData, "MEINTExtensions/Operation/Transaction/get_operations_install_order", "", "Centros");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        getOrdenesFab: function (oEvent) {
            var oThis = this;
            var oView = this.getView();
            var estacion = oView.byId("work_center").getSelectedKey();

            oThis.byId('Material_input').setValue("");
            oThis.byId('um').setValue("");
            oThis.byId('centro').setValue("");
            oThis.byId('almacen').setValue("");
            oThis.byId('lote_select').setValue("");
            oThis.byId('ctd').setValue("");
            oThis.byId('lbl_cantdispo').setText("");

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var oData = {
                        "WORK_CENTER": estacion
                    };
                    oThis._base_onloadCOMBO("orden_input", oData, "MEINTExtensions/Operation/Transaction/get_orders_install_order", "", "Ordenes");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        onChangeMat: function (oEvent) {
            var oThis = this;
            var oView = this.getView();
            var orden = oView.byId("orden_input").getSelectedKey();
            var estacion = oView.byId("work_center").getSelectedKey();

            oThis.byId('um').setValue("");
            oThis.byId('centro').setValue("");
            oThis.byId('almacen').setValue("");
            oThis.byId('lote_select').setValue("");
            oThis.byId('ctd').setValue("");
            oThis.byId('lbl_cantdispo').setText("");

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var oData = {
                        "ORDEN": orden,
                        "WORK_CENTER": estacion
                    };
                    oThis._base_onloadCOMBO("Material_input", oData, "MEINTExtensions/Operation/Transaction/get_materials_install_order", "", "Materiales");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        onChangeMatDet: function (oEvent) {
            var oThis = this;
            var oView = this.getView();
            var orden = oView.byId("orden_input").getSelectedKey();
            var material = oView.byId("Material_input").getSelectedKey();
            var estacion = oView.byId("work_center").getSelectedKey();

            var oData = {
                "ORDEN": orden,
                "MATERIAL": material,
                "WORK_CENTER": estacion
            };

            oThis.byId('um').setValue("");
            oThis.byId('centro').setValue("");
            oThis.byId('almacen').setValue("");
            oThis.byId('lote_select').setValue("");
            oThis.byId('ctd').setValue("");
            oThis.byId('lbl_cantdispo').setText("");

            var path = "MEINTExtensions/Operation/Transaction/get_mat_detail_install_order";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

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
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);

                                // Assign the model object to the SAPUI5 core
                                //oView.getView().setModel(oModel);
                                if (aData.UM == "KGM") {
                                    oThis.byId('um').setValue("KG");
                                }
                                if (aData.UM == "LTR") {
                                    oThis.byId('um').setValue("L");
                                }
                                oThis.byId('centro').setValue(aData.CENTRO);
                                oThis.onAlmacenDisponible();
                                //oThis.byId('almacen').setValue(aData.ALMACEN);
                                //oThis.onLotesDisponibles();
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: \u00BFHay conexi\u00F3n de red??");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        onAlmacenDisponible: function () {
            var oThis = this;
            var oView = this.getView();
            var material = oView.byId("Material_input").getSelectedKey();

            oThis.byId('lote_select').setValue("");
            oThis.byId('ctd').setValue("");
            oThis.byId('lbl_cantdispo').setText("");

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var oData = {
                        "MATERIAL": material,
                    };
                    oThis._base_onloadCOMBO("almacen", oData, "GALVASID/DatosTransaccionales/Produccion/Transaction/get_lgort_bymatnr_lX03", "", "Materiales");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        onLotesDisponibles: function () {
            var oThis = this;
            var oView = this.getView();
            var orden = oView.byId("orden_input").getSelectedKey();
            var material = oView.byId("Material_input").getSelectedKey();
            var estacion = oView.byId("work_center").getSelectedKey();
            var almacen = oView.byId("almacen").getSelectedKey();
            oThis.byId('lbl_cantdispo').setText("");

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var oData = {
                        "ORDER": orden,
                        "WORK_CENTER": estacion,
                        "MATERIAL": material,
                        "ALMACEN": almacen
                    };
                    oThis._base_onloadCOMBO("lote_select", oData, "MEINTExtensions/Consumption/Transaction/sel_rollos_disp_consum_261", "", "LotesDisponibles");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        onCantDisponible: function (){
            var oThis = this;
            var oView = this.getView();
            var material = oView.byId("Material_input").getSelectedKey();
            var lote = oView.byId("lote_select").getSelectedKey();

            var oData =
            {
                "LOTE": lote,
                "MATERIAL": material
            };

            var path = "MEINTExtensions/Consumption/Transaction/get_cantidad_disponible";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

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
                    var aData = JSON.parse(opElement.firstChild.data);
                    if (aData !== undefined) {
                        if (aData.error !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData.error);
                        } else {
                            oThis.byId('lbl_cantdispo').setText(aData.CANT_DISPONIBLE);
                        }
                    } else {
                        MessageToast.show("No se han recibido " + name);
                    }
                } else {
                    MessageToast.show("No se han recibido datos");
                }
                sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                    oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
                }
                sap.ui.core.BusyIndicator.hide();
            });
        },

        /*onLoteVTLYP: function (oEvent) {
            var oThis = this;
            oThis.onSerchBatchMKOL();
        },*/

        onSerchBatchMKOL: function (oEvent) {

            vltyp = "";

            var oThis = this;
            var oView = this.getView();
            var wc = oView.byId("work_center").getSelectedKey();
            var material = oView.byId("Material_input").getSelectedKey();
            var almacen = oView.byId("almacen").getValue();
            var lote = oView.byId("lote_select").getSelectedKey();


            var oData = {
                "WC": wc,
                "MATERIAL": material,
                "STORAGE": almacen,
                "LOTE": lote
            };

            var path = "GALVASID/DatosTransaccionales/Produccion/Transaction/get_batch_consm_261";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

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
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);

                                // Assign the model object to the SAPUI5 core
                                //oView.getView().setModel(oModel);
                                vltyp = (aData.TYP);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: \u00BFHay conexi\u00F3n de red??");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });

        },

        handleLoadItems: function (oControlEvent) {
            oControlEvent.getSource().getBinding("items").resume();
        },

        onConsumo: function () {

            var oThis = this;
            var oView = this.getView();

            var almacen = oView.byId("almacen").getSelectedKey();
            var cantidad = oView.byId("ctd").getValue();
            var lote = oView.byId("lote_select").getSelectedKey();
            var material = oView.byId("Material_input").getSelectedKey();
            var centro = oView.byId("centro").getValue();
            var usuario = oView.byId("usuario").getValue();
            var work_center = oView.byId("work_center").getSelectedKey();
            var um = oView.byId("um").getValue();
            var num_orden = oView.byId("orden_input").getValue();

            if (work_center == "" || num_orden == "" || material == "" || um == "" || centro == "" || 
                almacen == "" || lote == "" ||cantidad == ""){
                    MessageToast.show("Hay campos vacios, favor de revisar");
                    return;
            }

            var oData =
            {
                "ALMACEN": almacen,
                "CANTIDAD": cantidad,
                //"COST_CENTER": this.byId('centro_c').getValue(),
                "CENTRO": centro,
                "LOTE": lote,
                "MATERIAL": material,
                "NUM_ORDEN": num_orden,
                "UM": um,
                "USER": usuario,
                "WORK_CENTER": work_center
            };
            var path = "MEINTExtensions/Consumption/Transaction/consumo261_instalacion_consumo";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

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

                    if (opElement.firstChild !== null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].ERROR !== undefined) {
                            MessageToast.show(aData[0].ERROR);
                        } else {
                            oThis.cantidadrestante(lote, material);
                            MessageToast.show(aData[0].MESSAGE);
                            oThis.byId('work_center').setValue("");
                            oThis.byId('orden_input').setValue("");
                            oThis.byId('Material_input').setValue("");
                            oThis.byId('um').setValue("");
                            oThis.byId('centro').setValue("");
                            oThis.byId('almacen').setValue("");
                            oThis.byId('lote_select').setValue("");
                            oThis.byId('ctd').setValue("");
                            oThis.byId('lbl_cantdispo').setText("");
                            oThis.onInit();

                        }

                    } else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio informacion");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        cantidadrestante: function (lote,material) {

            var oThis = this;
            var resourceModel = this.getView().getModel("i18n");

            var path = "MEINTExtensions/Consumption/Transaction/get_cantidad_restante";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            sap.ui.core.BusyIndicator.show(0);

            var oData =
            {
                "LOTE": lote,
                "MATERIAL": material
            };

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
                        // oThis.MessageBoxConfirmEtiqueta(resourceModel.getResourceBundle().getText("¿Desea Imprimir Etiqueta de Cantidad Restante?"), "warning", lote, oThis);

                    }
                    sap.ui.core.BusyIndicator.hide();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        MessageBoxConfirmEtiqueta: function (sMessage, sMessageBoxType, lote, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.ImprimirEtiqueta(lote, 'GALVASID/DatosTransaccionales/Pedidos/Transaction/datos_etiqueta_pts_pinturas_used');
                    }
                }.bind(this)
            });
        },

        ImprimirEtiqueta: function (lote, path) {

            var wind = window.open("", "prntExample");
            var lines = ' <head>\
		        <meta charset="utf-8" />\
			    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\
			    <title></title>\
			    <meta name="description" content="">\
			    <meta name="viewport" content="width=device-width">\
			    <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">\
			    <link rel="stylesheet" type="text/css" href="css/custom_eti.css">\
		        </head>\
		        <body>\
			    <div id="Etiqueta_ZPL"></div>\
		        </body>';
            wind.document.write(lines);
            var cadena_ZPL = "";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=*&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oData = {
                "DOCUMENTO": lote
            };

            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var qr, centro, material, material_desc, of, lote, fecha, almacen, ancho, largo, 
                        espesor, cantidad, um, destino_o, destino_d, ref, piezas, transporte, ss, si, 
                        a1, a2, otros, fecha_print, tipo, proveedor, codigo, lote_prov, desc_pin, caducidad;
                    $(xmlDOM).find('Row').each(function () {
                        qr = $(this).find('QR').text();
                        fecha_print = $(this).find('FECHA_PRINT').text();
                        centro = $(this).find('CENTRO').text();
                        material = $(this).find('MATERIAL').text();
                        material_desc = $(this).find('MATERIAL_DESC').text(); 
                        of = $(this).find('OF').text();
                        lote = $(this).find('LOTE').text();
                        fecha = $(this).find('FECHA').text();
                        almacen = $(this).find('ALMACEN').text();
                        ancho = $(this).find('ANCHO').text();
                        largo = $(this).find('LARGO').text();
                        espesor = $(this).find('ESPESOR').text();
                        cantidad = $(this).find('CANTIDAD').text();
                        um = $(this).find('UM').text();
                        tipo = $(this).find('TIPO').text();
                        proveedor = $(this).find('PROVEEDOR').text();
                        of = $(this).find('PEDIDO').text();
                        codigo = $(this).find('CODIGO').text();
                        lote_prov=$(this).find('LOTE_PROV').text();
                        desc_pin= $(this).find('DESC_PIN_PROV').text();
                        caducidad = $(this).find('CADUCIDAD').text();
                        ref = ''
                        piezas = '0';
                        ss = '';
                        si = '';
                        a1 = '';
                        a2 = '';
                        destino_o = "";
                        destino_d = "";
                        transporte = "MAR";
                        
                        cadena_ZPL += "^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR4,4~SD25^JUS^LRN^CI0^XZ\n";
                        cadena_ZPL += "^XA ^MMT ^PW831 ^LL1239 ^LS0 ^FO10,1070^FS\n";
                        cadena_ZPL += "^MD8.3\n";
                        cadena_ZPL += "~SD8.3\n";
                        cadena_ZPL += "^FO10,5^FS\n";
                        cadena_ZPL += "^FT720,600^A0R,70,70^FH^FD^FS\n";
                        cadena_ZPL += "^FO720,5^GFA,2184,2184,13,gJF8,MFEI0SF8,LFEK07QF8,LFM0QF8,KFCM01PF8,\n"
                        cadena_ZPL += "KFO03OF8,JFCP0OF8,JF8P03NF8,IFEQ01NF8,IFCR07MF8,IF8R03MF8,IFS01MF8\n"
                        cadena_ZPL += ",FFET07LF8,FFCT03LF8,FF8T01LF8,FF8U0LF8,FFV07KF8,FEV03KF8,FEV01KF8,\n"
                        cadena_ZPL += "FCV01KF8,FCW0KF8,F8W07JF8,F8W03JF8,F8L07FFCM03JF8,FL01JF8L01JF8,FL07KFM0JF8,FL0LF8L0JF8,EK01LFEL07IF8,EK03MFL07IF8,EK07MF8K03IF8,EK07\n"
                        cadena_ZPL += "MFEK03IF8,EK0NFEK01IF8,EK0OFK01IF8,CJ01OF8J01IF8,CJ01OFCK0IF8,CJ01O\n"
                        cadena_ZPL += "FEK0IF8,:CJ01PFK07FF8,:CJ01PF8J07FF8,::CJ01PFCJ07FF8,EJ01PFCJ07FF8,:E\n"
                        cadena_ZPL += "J01FC0MFCJ07FF8,EJ01FC007KFCJ07FF8,EK0FCI0KFCJ07FF8,:FK0FCI0KFCJ07\n"
                        cadena_ZPL += "FF8,:FK07CI0KFCJ07FF8,:F8K0CI0KFCJ07FF8,F8O0KFCJ07FF8,:FCO0KFCJ07FF\n"
                        cadena_ZPL += "8,::FEO0KFCJ07FF8,:FFO0KFCJ07FF8,:FF8N0KFCJ07FF8,FFCN0KFCJ07FF8,:FF\n"
                        cadena_ZPL += "EN0KFCJ07FF8,IFN0KFCJ07FF8,:IF8M0KFCJ07FF8,IFCM0KFCJ07FF8,IFEM0KFC\n"
                        cadena_ZPL += "J07FF8,JFM0KFCJ07FF8,E7IF8K0KFCJ07FF8,E1JFEJ0KFCJ07FF8,E07KFI0KFCJ\n"
                        cadena_ZPL += "07FF8,E03LFC0KFCJ07FF8,E00MFEKFCJ07FF8,E003RFCJ07FF8,E001RFCJ07FF\n"
                        cadena_ZPL += "8,EI07QFCJ07FF8,EI03RFEI07FF8,EJ0TF807FF8,EJ03TFE7FF8,EJ01XF8,EK07W\n"
                        cadena_ZPL += "F8,EK01WF8,EL0WF8,EL03VF8,EM0VF8,EM07UF8,EM01UF8,EN07TF8,EN03TF8,\n"
                        cadena_ZPL += "EO0TF8,FO03SF8,F8N01SF8,FEO0SF8,FFO0SF8,FFCN0SF8,IFN0SF8,IF8M0FCQ\n"
                        cadena_ZPL += "F8,IFEM0FC7PF8,JF8L0FC1PF8,JFCL0FC07OF8,KFL0FC00OF8,KFL0FC003NF8,\n"
                        cadena_ZPL += "KFL0FC001NF8,KFL0FCI07MF8,KFL0FCI01MF8,KFL0FCJ0MF8,KFL0FCJ03LF8,K\n"
                        cadena_ZPL += "FL0FCK0LF8,KFL0FCK07KF8,KFL0FCK01KF8,KFL0FCL07JF8,KFL0FCL03JF8,KF\n"
                        cadena_ZPL += "K0CFCM0JF8,KFK0EFCM03IF8,KFK0FFCM01IF8,KFK0FFCN07FF8,::KFK0IFN07F\n"
                        cadena_ZPL += "F8,KFK0IF8M07FF8,KFK0IFEM07FF8,KFK0IFN07FF8,KFK0FFCN07FF8,:KFK0CFC\n"
                        cadena_ZPL += "N07FF8,KFL0FCN07FF8,:::::JFM0FCN07FF8,IF8M0FCN07FF8,FF8N0FCN07FF8,F\n"
                        cadena_ZPL += "CO0FCN0IF8,EP0FCM07IF8,EP0FCL07JF8,EP0FCK03KF8,EP0FCJ03LF8,EP0FCI\n"
                        cadena_ZPL += "03MF8,EP0FC001NF8,EP0FC01OF8,EP0FC0PF8,EP0FCQF8,EP0SF8,:EO07SF8,E\n"
                        cadena_ZPL += "N03TF8,EM03UF8,EL01VF8,EK01WF8,EJ01XF8,EJ0YF8,EI0gF8,E007gF8,E07gGF\n"
                        cadena_ZPL += "8,E3gHF8,gJF8,:::::^FS\n"
                        cadena_ZPL += "^FO720,173^GFA,2376,2376,12,!::::C07!CI0!CJ03!CL0!CM03!CO0!CO01F87!CO01F8\n"
                        cadena_ZPL += "01!CO01F8I07!CO01F8J01!CO01F8L03!CO01F8N0!:::::::::::CJ03FI01F8N0!CJ03FFC\n"
                        cadena_ZPL += "01F8N0!CJ03JF9F8N0!CJ03LF8N0!CJ03MF8M0!CJ03NFEL0!CJ03PF8J0!CJ03RFI0\n"
                        cadena_ZPL += "!CJ03SFC0!CJ03!:::::::::::::::::::CJ03TF8!FEI03SF80!IF803RF800!JFE3QFJ0!VFK0!U\n"
                        cadena_ZPL += "FL0!TFM0!SFN0!RF8N0!:OFE1F8N0!NFE01F8N0!MFE001F8N0!LFEI01F8N0!KFEJ\n"
                        cadena_ZPL += "01F8N0!JFCK01F8N0!IFCL01F8N0!FFCM01F8N0!FCN01F8N0!CO01F8N0!::CO01F\n"
                        cadena_ZPL += "8M01!CO01F8L01!CO01F8K01!CO01F8I01!CO01F8001!CO01F801!CO01F81!CO01\n"
                        cadena_ZPL += "F9!CO01!:CN01!CN07!CN03!CO0!CO03!CO01!EO01!F8N01!FCN01!FFN01F9!FFC\n"
                        cadena_ZPL += "M01F8!IFM01F83!IF8L01F80!IFEL01F803!JF8K01F801!JFEK01F8007!KF8J01F800\n"
                        cadena_ZPL += "1!KFCJ01F8I07!CKFJ01F8I03!C3JFCI01F8J0!C1KFI01F8J03!C07JF8001F8K0!C01J\n"
                        cadena_ZPL += "FE001F8K07!C007JF801F8K01!C003JFE01F8L07!CI0KF81F8L03!CI03JFC1F8M0!\n"
                        cadena_ZPL += "CJ0KF1F8M03!CJ07JFDF8N0!CJ01LF8N0!CK07KF8N0!CK01KF8N0!CL0KF8N0!CL\n"
                        cadena_ZPL += "03JFEN0!CM0KF8M0!CM03JFCM0!CM01KFM0!CN07JFCL0!CN01KFL0!EO07JF8K\n"
                        cadena_ZPL += "0!FO03JFEK0!FCN01KF8J0!FEN01KFEJ0!FF8M01LFJ0!FFEM01LFCI0!IFM01F9KFI\n"
                        cadena_ZPL += "0!IFCL01F87JFC00!JFL01F83KF00!JF8K01F80KF80!JFEK01F803JFE0!JFEK01F80\n"
                        cadena_ZPL += "1KF8!JFEK01F8007JFE!JFEK01F8003!JFEK01F8I0!JFEK01F8I03!JFEK01F8I01!JF\n"
                        cadena_ZPL += "EK01F8J07!JFEK01F8J01!JFEK01F8K0!JFEK01F8K03!JFEK01F8L0!JFEK01F8L07!\n"
                        cadena_ZPL += "JFEJ019F8L01!JFEJ01FF8M03!JFEJ01FF8N0!::JFEJ01FFEN0!JFEJ01IFN0!JFEJ01\n"
                        cadena_ZPL += "IFCM0!JFEJ01FFEN0!JFEJ01FF8N0!:JFEJ011F8N0!JFEK01F8N0!::::JFCK01F8N0!I\n"
                        cadena_ZPL += "FEL01F8N0!IFM01F8N0!FFN01F8N0!FO01F8M01!CO01F8L01!CO01F8L0!CO01F8\n"
                        cadena_ZPL += "K0!CO01F8J07!CO01F8I07!CO01F8003!CO01F803!CO01F83!CO01F9!CO01!:CO0!\n"
                        cadena_ZPL += "CN0!CM07!CL07!CK03!CJ03!CI01!C001!C01!C0!C!!::^FS\n"
                        cadena_ZPL += "^FO720,370^GFA,2400,2400,12,gIFE:87gGFE801gFE8I03XFE8J07WFE:::8J07MFC7\n"
                        cadena_ZPL += "NFE8J07LF8001MFE8J07LFJ03LFE8J07LFK0LFE8J07LFK03KFE8J07LFL0KFE8J0\n"
                        cadena_ZPL += "7LFL07JFE8J07JFBFL03JFE8J07JF3FL01JFE8J07JF3FM0JFE8J07IFE3FM07IFE8\n"
                        cadena_ZPL += "J07IFC3FM03IFE:8J07IF83FM01IFE8J07IF83FN0IFE8J07IF03FN07FFE:8J07FFE0\n"
                        cadena_ZPL += "3FN07FFE8J07FFE03FN03FFE:8J07FFC03FN03FFE8J07FFC03F007K03FFE8J07\n"
                        cadena_ZPL += "FFC03F00FCJ01FFE8J07FF803F00FEJ01FFE8J07FF803F01FFJ01FFE::8J07FF00\n"
                        cadena_ZPL += "3F03FFJ01FFE::8J07FE003F07FFJ01FFE:CJ03FE003F07FFJ01FFECJ03FC003F0\n"
                        cadena_ZPL += "7FFJ01FFECJ03FC003F0IFJ01FFECJ01F8003F0IFJ01FFECK0F8003F0IFJ01FFEE\n"
                        cadena_ZPL += "O03F1IFJ01FFE::EO03F3IFJ01FFEFO03F3IFJ01FFE:F8N03F3IFJ01FFEF8N03F7I\n"
                        cadena_ZPL += "FJ01FFEFCN03F7IFJ01FFEFEN03KFJ01FFE:FFN03KFJ01FFEFF8M03KFJ01FFEF\n"
                        cadena_ZPL += "FCM03KFJ01FFEFFEM03KFJ01FFEIFM03KFJ01FFEIF8L03KFJ01FFEIFEL03KFJ0\n"
                        cadena_ZPL += "1FFEJFL03KFJ01FFEJFCK0LFJ01FFEKF8I03LFJ01FFELF801MFJ01FFEVFJ01FF\n"
                        cadena_ZPL += "E::::80TFJ01FFE8003SFI01FFE8J0SFC01FFE8K01SF1FFE8M07TFE8N01SFE8O0\n"
                        cadena_ZPL += "3RFE8O03F0PFE8O03F003NFE8O03FJ0MFE8O03FK03KFE8O03FM0JFE8O03FN\n"
                        cadena_ZPL += "01FFE:::::::CO03FN01FFEIFCL03FN01FFEKF8J03FN01FFELFEI03FN01FFENF803\n"
                        cadena_ZPL += "FN01FFEOFE3FN01FFERFN01FFESFM01FFE9SFCK01FFE803SFJ01FFE8I0SFC\n"
                        cadena_ZPL += "001FFE8J03SF81FFE8L0VFE8M03TFE8O0SFE8O03RFE8O03F07OFE8O03F001N\n"
                        cadena_ZPL += "FE8O03FJ07LFE8O03FK01KFE8O03FM03IFE8 \n"
                        cadena_ZPL += "O03FN01FFE::::::::::8J04J03FN01FFE8J07FI03FN01FFE8J07FFC03FN01FFE8J07J\n"
                        cadena_ZPL += "F3FN01FFE8J07LFN01FFE8J07MF8L01FFE8J07NFEK01FFE8J07OFCJ01FFE:::::::\n"
                        cadena_ZPL += ":::CJ03OFCJ01FFE::CJ01OFCJ01FFE:EK0OFCJ01FFE:EK07NFCJ01FFEEK07NF8\n"
                        cadena_ZPL += "J01FFEFK03NF8J01FFEFK01NF8J01FFEFL0NFK03FFEF8K07MFK03FFEF8K03LF\n"
                        cadena_ZPL += "EK03FFEFCK01LFCK03FFEFCL0LFCK03FFEFEL03KF8K07FFEFEL01JFEL07FFE\n"
                        cadena_ZPL += "FFM03IFCL07FFEFF8M07FFM0IFEFF8W0IFEFFCV01IFEIFV03IFE:IF8U07IFEIFC\n"
                        cadena_ZPL += "U07IFEIFEU0JFEJFT01JFEJF8S03JFEJFCS07JFEKFS0KFEKF8Q01KFEKFCQ03K\n"
                        cadena_ZPL += "FELFQ07KFELF8P0LFELFEO01LFEMF8N07LFENFM01MFENFEL07MFEOFCJ01N\n"
                        cadena_ZPL += "FEPFE001OFEgIFE:::::::::::::::^FS";
                        cadena_ZPL += "^FT420,365^BQN,2,8^FDLA," + qr + "^FS\n";
                        cadena_ZPL += "^FT370,50^A0R,30,33^FH^FDFECHA/DT:^FS\n";
                        cadena_ZPL += "^FT370,210^A0R,30,33^FH^FD" + fecha + "^FS\n";
                        cadena_ZPL += "^FT340,50^A0R,30,33^FH^FDMATERIAL:^FS\n";
                        cadena_ZPL += "^FT340,210^A0R,30,33^FH^FD" + material + "^FS\n";
                        cadena_ZPL += "^FT310,50^A0R,30,33^FH^FD" + material_desc + "^FS \n";
                        if (ref !== '') {
                            cadena_ZPL += "^FT270,50^A0R,30,33^FH^FDREF:^FS\n";
                            cadena_ZPL += "^FT270,125^A0R,30,33^FH^FD" + "ref" + "^FS\n";
                        }
                        cadena_ZPL += "^FT370,570^A0R,30,33^FH^FDRUTA/ROUTE: ^FS\n";
                        cadena_ZPL += "^FT370,780^A0R,30,33^FH^FDO: PROV ^FS\n";
                        cadena_ZPL += "^FT370,920^A0R,30,33^FH^FDD: " + almacen + "^FS\n";
                        cadena_ZPL += "^FT340,570^A0R,30,33^FH^FDCENTRO/PLANT: ^FS\n";
                        cadena_ZPL += "^FT340,800^A0R,30,33^FH^FD" + centro + "^FS\n";
                        cadena_ZPL += "^FT310,570^A0R,30,33^FH^FDALMACEN/WH: ^FS\n";
                        cadena_ZPL += "^FT310,780^A0R,30,33^FH^FD" + almacen + "^FS\n";
                        cadena_ZPL += "^FT30,1290^BQN,4,6^FDLA," + qr + "^FS\n";
                        cadena_ZPL += "^FT650,1200^A0,25,25^FH^FD" + almacen + "^FS\n";
                        cadena_ZPL += "^FT240,50^A0R,30,33^FH^FDPROVEEDOR:^FS\n";
                        cadena_ZPL += "^FT240,230^A0R,30,33^FH^FD" + proveedor + "^FS\n";
                        //cadena_ZPL += "^FT210,50^A0R,30,33^FH^FDCODIGO:^FS\n";
                        cadena_ZPL += "^FT550,420^A0R,50,65^FH^FD" + codigo + "^FS\n";
                        cadena_ZPL += "^FT180,50^A0R,30,33^FH^FD" + desc_pin + "^FS\n";
                        cadena_ZPL += "^FT150,50^A0R,30,33^FH^FDL.PROV:^FS\n";
                        cadena_ZPL += "^FT150,170^A0R,30,33^FH^FD" + lote_prov + "^FS\n";
                        cadena_ZPL += "^FT120,50^A0R,30,33^FH^FDCADUCIDAD:^FS\n";
                        cadena_ZPL += "^FT120,230^A0R,30,33^FH^FD" + caducidad + "^FS\n";
                        cadena_ZPL += "^FT430,1200^A0,25,25^FH^FD" + material + "^FS\n";
                        cadena_ZPL += "^FT50,1310^A0,30,30^FH^FD" + lote + "^FS\n";
                        cadena_ZPL += "^FT250,1200^A0,25,25^FH^FD" + of + "^FS\n";
                        cadena_ZPL += "^FT632,1155^A0,25,25^FH^FDALMACEN^FS\n";
                        cadena_ZPL += "^FT25,780^A0R,23,30^FH^FDFO-PR-004 REV.04^FS\n";
                        cadena_ZPL += "^FT635,1320^A0,20,19^FH^FDFO-PR-004 REV.04^FS\n";
                        cadena_ZPL += "^FT500,420^A0R,50,65^FH^FDPC: " + of + "^FS\n";
                        cadena_ZPL += "^FT25,50^A0R,30,23^FH^FD" + fecha_print + "^FS \n";
                        cadena_ZPL += "^FT25,490^A0R,30,23^FH^FD" + useretiqueta + "^FS \n";
                        cadena_ZPL += "^FT620,420^A0R,68,103^FH^FD" + lote + "^FS\n";
                        cadena_ZPL += "^FT222,1320^A0,24,24^FH^FD" + fecha_print + "^FS\n";
                        cadena_ZPL += "^FT410,1320^A0,24,24^FH^FD" + useretiqueta + "^FS\n";
                        cadena_ZPL += "^FT280,1155^A0,25,25^FH^FDPC^FS\n";
                        cadena_ZPL += "^FT270,1250^A0,30,30^FH^FD^FS\n";
                        cadena_ZPL += "^FT430,430^A0R,60,60^FH^FD" + cantidad + " " + um + "^FS\n";
                        cadena_ZPL += "^FT430,1155^A0,25,25^FH^FDMATERIAL^FS\n";
                        cadena_ZPL += "^FT410,1276^A0,50,57^FH^FD" + cantidad + " " + um + "^FS\n";
                        cadena_ZPL += "^LRY^FO720,570^GB0,504,95^FS\n";
                        cadena_ZPL += "^LRN^PQ1,0,1,Y^XZ\n";




                        wind.document.getElementById("Etiqueta_ZPL").innerHTML = cadena_ZPL;
                    });
                    setTimeout(function () {
                        wind.print();
                    }, 3000);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
                    }
                });
        },

    });
});