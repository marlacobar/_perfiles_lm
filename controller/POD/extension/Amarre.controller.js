/**
 * Bayco Consulting : Proyecto Indalum SAP MII
 * 2023
 * Extension Amarre.controller.js
 */
sap.ui.define([
    "sap/m/Button",
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    "sap/m/Dialog",
    "sap/m/MessageBox",
    'sap/m/MessageToast',
    "sap/ui/core/Fragment",
    "sap/m/library",
    "sap/m/Text",
    "sap/m/TextArea",
    "/../../../model/formatter",
    'sap/ui/core/BusyIndicator',
], function (
    Button,
    Controller,
    JSONModel,
    ColumnListItem,
    Label,
    Dialog,
    MessageBox,
    MessageToast,
    Fragment,
    mobileLibrary,
    Text,
    TextArea,
    formatter,
    BusyIndicator
) {
    "use strict";
    const TRX_CONFIRMAR = "CONFIRMAR";
    const CONFIRMA_INICIO_PROCESO = "CONFIRMA_INICIO_PROCESO";
    const MODELO_UC = "MODELO_UC";
    const MOD_CHAR = "MOD_CHAR";
    const IMPRESION_ETIQUETA_AUTOMOTRIZ = "IMPRESION_ETIQUETA_AUTOMOTRIZ";

    return {
        //<!--  Inicio Metodos Extension  -->
        actualizarModeloFormaOrdenes: function () {
            //this.getView().getModel("CNF_OBJ").setProperty("/smf_ordenes",false);
        },
        //Inicio de proceso para amarre y valor agregado- Inicio de ordenes activas con relacion a canastas instaladas
        iniciarProcesoCanastillaOrdenActiva: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Temple_Proceso_Iniciar";
            var tipo = TRX_CONFIRMAR;
            var oData = {
                "CD_PLANTA": planta,
                "CD_PUESTO": puesto,
                "USUARIO": usuario,
                "TIPO": tipo
            };
            var postEx = CONFIRMA_INICIO_PROCESO;
            var message = "¿Confirmar Inicio de proceso?";
            this.confirmarAccion(oData, path, message, postEx);
        },
        validarCreacionUc: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var path = "MII/DatosTransaccionales/Produccion/Amarre/Transaction/UC_Puesto_Crear";
            var oData = {
                "CD_PLANTA": planta,
                "CD_PUESTO": puesto,
                "USUARIO": usuario
            };
            var postEx = MODELO_UC;
            var message = "¿Confirmar creación de UC?";
            this.confirmarAccion(oData, path, message, postEx);
        },
        actualizarModeloUc: function () {
            if (this.getView().getModel("ModeloUC") === undefined) {
                var oModel = new sap.ui.model.json.JSONModel({
                    NUMERO_UC: "",
                    PUESTO_ACTUAL: "",
                    ALMACEN_ACTUAL: ""
                });
                this.getView().setModel(oModel, "ModeloUC");
            }
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oData = {
                "CD_PLANTA": planta,
                "CD_PUESTO": puesto,
                "USUARIO": usuario
            };
            var path = "MII/DatosTransaccionales/Produccion/Amarre/Transaction/UC_Puesto_Obtener";
            var nombre = "ModeloUC";
            this._setModelo(oData, path, nombre);
        },
        confirmarCierreUc: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var codigo = this.getView().getModel("ModeloUC").getProperty("/NUMERO_UC");
            var path = "MII/DatosTransaccionales/Produccion/Amarre/Transaction/UC_Puesto_Confirmar";
            var oData = {
                "CD_PLANTA": planta,
                "CD_PUESTO": puesto,
                "USUARIO": usuario,
                "CODIGO": codigo
            };
            var postEx = MODELO_UC;
            var message = "¿Confirmar UC?";
            this.confirmarAccion(oData, path, message, postEx);
            this.GenerarPDF();
        },
        recuperarUc: function () {
            var oView = this.getView();
            var oThis = this;
            if (!this.byId("dlg_unidadControlPOD")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PantallaOperador.Amarre.UnidadControlPOD",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    //oThis.enlistarCanastillasInstaladas();
                    oThis.enlistarDetalleUC();
                });
            } else {
                this.byId("dlg_unidadControlPOD").open();
                //this.enlistarCanastillasInstaladas();
                this.enlistarDetalleUC();
            }
        },
        enlistarDetalleUC: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var oData = {
                "CD_PLANTA": planta,
                "CD_PUESTO": puesto
            };
            var tabla = "tbl_unidadControlDetalleItem";
            var path = "MII/DatosTransaccionales/Produccion/Amarre/Transaction/UC_Items_Lista";
            var name = "Items_UC"
            this._base_onloadTable(tabla, oData, path, name, "");
        },
        reimprimirEtiqueta: function () {
            var tbl_items = this.byId("tbl_unidadControlDetalleItem").getSelectedItems();
            var elemento;
            var items = '<Rowsets>\n';
            items += '<Rowset>\n';
            var id_etiqueta = "";
            var tbl_orden = this.byId("tbl_unidadControlDetalleItem").getSelectedItem();
            if (tbl_items.length === 0) {
                MessageBox.error("Debes seleccionar AL MENOS un registro")
                return;
            }
            for (var i = 0; i < tbl_items.length; i++) {
                //GET VAR
                elemento = tbl_items[i];
                id_etiqueta = elemento.getBindingContext().getProperty("ID_ETIQUETA");
                //ASSIGN THEM
                items += "<Row>\n";
                items += '<ID_ETIQUETA>' + id_etiqueta + '</ID_ETIQUETA>\n';
                items += "</Row>\n";
            }
            items += "</Rowset>\n";
            items += "</Rowsets>\n";
            var path = "MII/DatosTransaccionales/ZebraPrinting/Transaction/ImprimirEtiquetaFolioEtiqueta_Reimprsion";
            var oData = {
                "ITEMS": items
            };
            var postEx = "MOD_CHAR";
            var message = "¿Confirmar ?";
            this.confirmarAccion(oData, path, message, postEx);
        },
        selectOrder: function (oEvent) {
            var orden = oEvent.getSource().getSelectedItem().getBindingContext().getObject().SHOP_ORDER;
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var oData = {
                "ORDER": orden,
                "OPERATION": puesto,
                "WORK_CENTER": puesto
            };
            var rows_caracteristicas_of_orden_pp = [{
                "SHOP_ORDER": "ERROR"
            }];
            rows_caracteristicas_of_orden_pp = this.get_rows_chars_of_orden_pp(oData);
            var piezasPorAtado = rows_caracteristicas_of_orden_pp.find(i => i.CHARACTERISTIC_NAME === "ZCT_PIEZAS_ATADO");
            piezasPorAtado = piezasPorAtado === undefined ? piezasPorAtado : piezasPorAtado.CHARACTERISTIC_VALUE.split(" ")[0];
            this.byId("inp_piezasXatado").setValue(piezasPorAtado);
            this.get_ExtLngCorBil();
        },

        grabarPiezasPorAtado: function () {
            var valor_nuevo = this.byId("inp_piezasXatado").getValue();
            this.grabarPiezasPorAtado_fxBase(valor_nuevo);
        },
        grabarPiezasPorAtado_frg: function () { // 20240809
            var valor_nuevo = this.byId("inp_piezasXatado_frg").getValue();
            this.grabarPiezasPorAtado_fxBase(valor_nuevo);
        },
        grabarPiezasPorAtado_fxBase: function (valor_nuevo) {
            var orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var path = "MII/DatosTransaccionales/Produccion/Amarre/Transaction/PiezasPorAtado_Modificar";
            if (isNaN(valor_nuevo) || valor_nuevo.trim() === "" || valor_nuevo.indexOf(".") > 0) {
                MessageBox.error("Debes ingresar un número entero");
                return;
            }
            if (+valor_nuevo <= 0) {
                MessageBox.error("Debes ingresar un número entero");
                return;
            }
            var oData = {
                "VALOR_NUEVO": valor_nuevo,
                "ORDEN": orden,
                "USUARIO": usuario
            };
            var postEx = MOD_CHAR;
            var message = "¿Confirmar Cambio?";
            this.confirmarAccion(oData, path, message, postEx);
        },

        /* generar metodos de impresion de PDF ; CMolar 05-12-2023 */
        GenerarPDF: function (oEvent) {
            var oView = this.getView();
            var path = 'MII/DatosTransaccionales/Logistica/Transaction/Generate_PDF',
                uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=pdfString&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            sap.ui.core.BusyIndicator.show(0);
            var unidadcontrol = this.getView().getModel("ModeloUC").getProperty("/NUMERO_UC");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oThis = this;
            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: {
                    "id_unidadcontrol": unidadcontrol,
                    "usuario": usuario
                }
            }).done(function (xmlDOM) {
                var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                if (opElement.firstChild !== null) {
                    var decodedPdfContent = atob(opElement.firstChild.data);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], {
                        type: 'application/pdf'
                    });
                    var blobUrl = URL.createObjectURL(blob);
                    jQuery.sap.addUrlWhitelist("blob");
                    oView.setModel(new sap.ui.model.json.JSONModel({
                        data: blobUrl,
                        tarjeton: "impresion_uc"
                    }), "test");
                    oThis.onPDF();
                } else {
                    MessageBox.alert("La solicitud ha fallado: �Hay conexi�n de red?");
                }
                sap.ui.core.BusyIndicator.hide();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                    MessageToast.show("La solicitud ha fallado: " + textStatus);
                }
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onPDF: function () {
            var oView = this.getView();
            if (!this.oDialog) {
                this.oDialog = oView.byId("ControlCargaPDF");
                // create dialog via fragment factory
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Logistica.impresion_uc", this);
                oView.addDependent(this.oDialog);
            }
            this.oDialog.open();
        },
        //Funcionque cierra el fragmento 
        onCloseViewPdf: function () {
            this.oDialog.close();
        },
        // <!--  Fin Metodos Extension  -- >
        cargarFramentoEtiquetAutomotriz: async function (oEvent) {
            var oView = this.getView();
            var oThis = this;
            //var documento = oEvent.getSource().getParent().getBindingContext().getProperty("DOCUMENTO");
            //var cantidad = oEvent.getSource().getParent().getBindingContext().getProperty("CANTIDAD");
            //var fecha_notif = oEvent.getSource().getParent().getBindingContext().getProperty("END_DATE");
            //var num_orden = oEvent.getSource().getParent().getBindingContext().getProperty("NUM_ORDER");
            var lv_unidad_control = this.getView().getModel("ModeloUC").getProperty("/NUMERO_UC");
            //var batch = oEvent.getSource().getParent().getBindingContext().getProperty("BATCH");
            var oData = {
                //"DOCUMENTO"	:	documento,
                //"CANTIDAD"	:	cantidad,
                //"FECHA"		:	fecha_notif,
                //"NUM_ORDEN"	:	num_orden, 
                "UNIDAD_CONTROL": lv_unidad_control,
                //"BATCH"		: 	batch
            }
            var response = await this.prescargarinformacionEtiqueta(oData);
            console.log(response);
            if (!this.byId("dlg_etiquetaAutomotriz")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PantallaOperador.Empaque.etiquetaAutomotriz",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.cargarInformacionEtiqueta(response);
                });
            } else {
                this.byId("dlg_etiquetaAutomotriz").open();
                oThis.cargarInformacionEtiqueta(response);
            }
        },
        prescargarinformacionEtiqueta: async function (oFiltros) {
            const TRANSACTION = "MII/DatosTransaccionales/Produccion/Amarre/Transaction/GetDataEtiquetaAutomotriz";
            var response = await this._RUN_GET_REQUEST(TRANSACTION, oFiltros);
            console.log(response)
            return response;
        },
        _RUN_GET_REQUEST: async function (TRANSACTION, parameters = {}) {
            const COMPLETE_URL = this._BUILD_URL_PATH_TO_REQUEST(TRANSACTION);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData(COMPLETE_URL, parameters, true, "POST");
            return new Promise((resolve, reject) => {
                oModel.attachRequestCompleted(function (response) {
                    var response_list = []
                    try {
                        let oModel = response.getSource();
                        var oData = oModel.getData();
                        response_list = oData.Rowsets.Rowset[0].Row;
                    } catch (error) {
                        try {
                            var message_error = oData.Rowsets.FatalError;
                            var no_error = typeof message_error == "undefined";
                            if (no_error) throw true;
                        } catch (_error) {
                            resolve(true);
                        }
                        reject(message_error);
                    }
                    resolve(response_list);
                });
            });
        },
        _BUILD_URL_PATH_TO_REQUEST: function (TRANSACTION = false) {
            var no_input_trasaction = TRANSACTION ? false : true;
            if (no_input_trasaction) throw true;
            const SERVER_URL = window.location.protocol + "//" + this.getServerHost();
            const URL_QUERY = "/XMII/Illuminator?QueryTemplate=";
            const QUERY = "MII/Common/Query/XacuteQuery&Transaction=";
            const CONTENT_TYPE = "&Content-Type=text/json";
            const COMPLETE_URL = SERVER_URL + URL_QUERY + QUERY + TRANSACTION + CONTENT_TYPE;
            return COMPLETE_URL;
        },
        cargarInformacionEtiqueta: async function (oData) {
            if (oData[0] !== undefined) {
                this.byId("inp_cantidadEA").setValue(oData[0].QTY);
                this.byId("inp_pesoEA").setValue(oData[0].QTY_KG);
                this.byId("inp_proveedorEA").setValue(oData[0].ID_PROVEEDOR);
                this.byId("inp_direccionEA").setValue(oData[0].DIRECCION + ' ' + oData[0].DIRECCION_2 + ' ' + oData[0].DIRECCION_3);
                this.byId("inp_direccionEA_1").setValue(oData[0].DIRECCION);
                this.byId("inp_direccionEA_2").setValue(oData[0].DIRECCION_2);
                this.byId("inp_direccionEA_3").setValue(oData[0].DIRECCION_3);
                this.byId("inp_loteEA").setValue(oData[0].LOTE);
                this.byId("inp_loteproveedorEA").setValue(oData[0].BILLET_ID);
                this.byId("inp_ucEA").setValue(oData[0].UC_NUMBER);
                this.byId("inp_numeroparteEA").setValue(oData[0].PART_SAP);
                this.byId("inp_claveEA").setValue(oData[0].CLAVE);
                this.byId("inp_descripcionEA").setValue(oData[0].DESCRIPCION);
                //this.byId("inp_documentoEA").setValue(oData.DOCUMENTO);
                this.byId("inp_fechaEA").setValue(oData[0].FECHA);
            }
        },
        cancelarEtiqAuto: function () {
            this.byId("dlg_etiquetaAutomotriz").destroy();
        },
        imprimirEtiquetaAutomotriz: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var clave = this.byId("inp_claveEA").getValue();
            var numeroParte = this.byId("inp_numeroparteEA").getValue();
            var ordenCompra = this.byId("inp_ordencompraEA").getValue();
            var descripcion = this.byId("inp_descripcionEA").getValue();
            var proveedorPte = this.byId("inp_proveedorEA").getValue();
            var idProveedor = this.byId("inp_proveedorEA").getValue();
            var cantidad = this.byId("inp_cantidadEA").getValue();
            var peso = this.byId("inp_pesoEA").getValue();
            var fecha = this.byId("inp_fechaEA").getValue();
            var hojaViajera = this.byId("inp_travelingcardEA").getValue();
            var lote = this.byId("inp_loteEA").getValue();
            var billet = this.byId("inp_loteproveedorEA").getValue();
            // var documento = this.byId("inp_documentoEA").getValue();
            // var revision = this.byId("inp_revision").getValue();
            var numsplit = this.byId("inp_numeroparteEA").getValue().split('.');
            var engineering_level = "";
            if (numsplit.length > 1) {
                engineering_level = numsplit[3];
            }
            var path = "MII/DatosTransaccionales/ZebraPrinting/Transaction/imprimirEtiquetaAutomotriz";
            var oData = {
                "CD_PLANTA": planta,
                "CD_PUESTO": puesto,
                "USUARIO": usuario,
                "NUMERO_PARTE": numeroParte,
                "ORDEN_COMPRA": ordenCompra,
                "DESCRIPCION": descripcion,
                "PROV_PTE": proveedorPte,
                "PROV_ID": idProveedor,
                "CANTIDAD": cantidad,
                "FECHA": fecha,
                "HOJA_VIAJERA": hojaViajera,
                "LOTE": lote,
                "ENGIEERING_LEVEL": engineering_level
                // "DOCUMENTO"		:	documento,
                // "REVISION"		:	revision
            };
            var postEx = IMPRESION_ETIQUETA_AUTOMOTRIZ;
            var message = "¿Confirmar Impresión?";
            this.confirmarAccion(oData, path, message, postEx);
        },

    };
},);