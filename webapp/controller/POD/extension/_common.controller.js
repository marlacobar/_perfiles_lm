/**
 * Bayco Consulting : Proyecto Indalum SAP MII
 * 2023
 * Extension Common.controller.js
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
    "sap/ui/model/Filter",
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
    BusyIndicator,
    Filter
) {
    "use strict";
    const INSTALACION = "INSTALACION";
    const INSTALACION_PINTURA = "INSTALACION_PINTURA";
    const DESINSTALACION = "DESINSTALACION";
    const DECLARACION = "DECLARACION";
    const ERROR_MSG = "ERROR_MSG";
    const INICIO_PROCESO = "INICIO_PROCESO";
    const CONFIRMA_INICIO_PROCESO = "CONFIRMA_INICIO_PROCESO";
    const TRX_CONFIRMAR = "CONFIRMAR";
    const TRX_VERIFICAR = "VERIFICAR";
    const RECUPERAR_VIGA = "RECUPERAR_VIGA";
    const POST_DELETE_ITEM_ANODIZADO = "POST_DELETE_ITEM_ANODIZADO";
    const AGREGAR_ITEMS_ANODIZADO = "AGREGAR_ITEMS_ANODIZADO"
    const DECLARAR_ANODIZADO = "DECLARAR_ANODIZADO"
    const REFRESH_FRAGMENT_VIGAS = "REFRESH_FRAGMENT_VIGAS";
    const FIJAR_CANASTA = "FIJAR_CANASTA";
    const ANULAR_FIJAR_CANASTA = "ANULAR_FIJAR_CANASTA";
    const ASIGNAR_AUXILIAR_EXTRUSION = "ASIGNAR_AUXILIAR_EXTRUSION";
    const DESMONTAR_CANASTA = "DESMONTAR_CANASTA";
    const AREA_TEMPLE = "TEMPLE";
    const CONFIRMA_FIN_PROCESO = "CONFIRMA_FIN_PROCESO";
    const MODELO_UC = "MODELO_UC";
    const MOD_CHAR = "MOD_CHAR";
    const MOD_CHAR_MODEL = "MOD_CHAR_MODEL";
    const CONSUMO_MASIVO = "CONSUMO_MASIVO";
    const CP_MANUAL = "CP_MANUAL";
    const FIJAR_LOTEPINTURA = "FIJAR_LOTEPINTURA";
    const DESMONTAR_LOTEPINTURA = "DESMONTAR_LOTEPINTURA";
    const IMPRESION_ETIQUETA_AUTOMOTRIZ = "IMPRESION_ETIQUETA_AUTOMOTRIZ";
    return {
        //JERO : DESTRUIR DIALOG
        _destruirDialog: function (oEvent) {
            oEvent.getSource().getParent().destroy();
        },
        //JERO : PARA TODOS LOS PROCESOS
        _ejecutarTransaccion: function (oData, path, postEx) {
            var oThis = this;
            var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');
            sap.ui.core.BusyIndicator.show(0);
            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            }).done(function (xmlDOM) {
                try {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    if (opElement.firstChild !== null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].status === "E") {
                            MessageBox.error(aData[0].message);
                            var params = {
                                mensaje: aData[0].message,
                                referencia: aData[0].reference,
                                wildcard: aData[0].wildcard,
                                status: aData[0].status
                            };
                            //Advertencia: Rutina de ejecucion local
                            oThis._onAfterEjecutarTransaccion(ERROR_MSG, params);
                        } else {
                            var params = {
                                mensaje: aData[0].message,
                                referencia: aData[0].reference,
                                wildcard: aData[0].wildcard,
                                status: aData[0].status
                            };
                            //Advertencia: Rutina de ejecucion local
                            oThis._onAfterEjecutarTransaccion(postEx, params);
                        }
                    } else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibió información");
                    }
                    sap.ui.core.BusyIndicator.hide();
                } catch (e) {
                    //oThis.handleOpenDialog();
                    oThis.getOwnerComponent().openHelloDialog("Error en procesamiento de mensaje: Contactar administrador");
                    console.log("Error", e.stack);
                    console.log("Error", e.name);
                    console.log("Error", e.message);
                } finally {
                    sap.ui.core.BusyIndicator.hide();
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                    //oThis.handleOpenDialog();
                    oThis.getOwnerComponent().openHelloDialog("Error en ejecución: Verificar conexión de red");
                }
                sap.ui.core.BusyIndicator.hide();
            });
        },
        //JERO : PARA TODOS LOS PROCESOS
        _onAfterEjecutarTransaccion: function (postEx, params) {
            //
            switch (postEx) {

                case INSTALACION:
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");
                    var componente_pedido = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("COMP_PEDIDO");
                    var componente_pos = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("COMP_PEDIDO_POS");
                    var material = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("MATERIAL");
                    var almacen = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("STORAGE_LOCATION");
                    var oData = {
                        "ALMACEN": almacen,
                        "CD_PLANTA": planta,
                        "CD_PUESTO": puesto,
                        "ORDEN": orden,
                        "COMP_PEDIDO": componente_pedido,
                        "COMP_POS": componente_pos,
                        "MATERIAL": material,
                        "USUARIO": usuario
                    };
                    this.enlistarInventario(oData);
                    MessageToast.show(params.mensaje);
                    break;


                // EXTRUSION
                case FIJAR_CANASTA:
                    MessageToast.show(params.mensaje);
                    this.enlistarCanastillaAsignadaExtrusion();
                    this.enlistarCanastillasDisponibleExtrusion();
                    this.limpiarInputCanastaExtrusion();
                    break;
                case ANULAR_FIJAR_CANASTA:
                    MessageToast.show(params.mensaje);
                    this.enlistarCanastillaAsignadaExtrusion();
                    this.enlistarCanastillasDisponibleExtrusion();
                    break;
                case ASIGNAR_AUXILIAR_EXTRUSION:
                    MessageToast.show(params.mensaje);
                    this.enlistarCanastillaAsignadaExtrusion();
                    this.enlistarCanastillasDisponibleExtrusion();
                    this.limpiarInputCanastaExtrusion();
                    break;
                case DESMONTAR_CANASTA:
                    MessageToast.show(params.mensaje);
                    this.enlistarCanastillaAsignadaExtrusion();
                    this.enlistarCanastillasDisponibleExtrusion();
                    break;
                case DECLARACION:
                    this.enlistarOrdenesIniciadas();
                    MessageToast.show(params.mensaje);
                    break;
                case INICIO_PROCESO:
                    this.enlistarOrdenesIniciadas();
                    //this.actualizarModeloVista();
                    this.confirmarInicioTemplado(params);
                    break;
                case CONFIRMA_INICIO_PROCESO:
                    this.enlistarOrdenesIniciadas();
                    //this.actualizarModeloVista();
                    if (params.status === "W") {
                        MessageBox.warning(params.mensaje);
                    } else {
                        MessageToast.show(params.mensaje);
                    }
                    break;
                // PINTURA
                
                case FIJAR_LOTEPINTURA:
                    MessageToast.show(params.mensaje);
                    this.enlistarLotePinturaAsignado();
                    this.enlistarLotesPinturaDisponibles()
                    break;
                case DESMONTAR_LOTEPINTURA:
                    MessageToast.show(params.mensaje);
                    this.enlistarLotePinturaAsignado();
                    this.enlistarLotesPinturaDisponibles()
                    break;
                // ANODIZADO
                case RECUPERAR_VIGA:
                    this.recuperarVigaSimple();
                    this.recuperarDetalleViga();
                    break;
                case POST_DELETE_ITEM_ANODIZADO:
                    MessageToast.show(params.mensaje);
                    this.recuperarDetalleViga();
                    break;
                case AGREGAR_ITEMS_ANODIZADO:
                    MessageToast.show(params.mensaje);
                    this.enlistarInventarioAnodizado();
                    this.recuperarDetalleViga();
                    break;
                case DECLARAR_ANODIZADO:
                    MessageToast.show(params.mensaje);
                    this.enlistarDeclaracionesAnodizado();
                    break;
                case REFRESH_FRAGMENT_VIGAS:
                    MessageToast.show(params.mensaje);
                    this.recuperarVigaSimple();
                    this.recuperarDetalleViga();
                    this.byId("inp_accion").setValue("");
                    break;
                // AMARRES
                case MODELO_UC:
                    MessageToast.show(params.mensaje);
                    this.actualizarModeloUc();
                    break;
                case MOD_CHAR:
                    MessageToast.show(params.mensaje);
                    break;
                case MOD_CHAR_MODEL:
                    MessageToast.show(params.mensaje);
                    this.obtenerPiezasPorAtado();
                    break;
                case IMPRESION_ETIQUETA_AUTOMOTRIZ:
                    MessageToast.show(params.mensaje);
                    this.actualizarModeloUc();
                    break;
                // VALOR AGREGADO
                case CONFIRMA_FIN_PROCESO:
                    this.enlistarOrdenesIniciadas();
                    MessageToast.show(params.mensaje);
                    break;
                //HORNO HOM
                case CONSUMO_MASIVO:
                    MessageToast.show(params.mensaje);
                    this.recuperarComponentesInstalados();
                    break;
                //ALL
                case CP_MANUAL:
                    MessageToast.show(params.mensaje);
                    this.onRefreshInstall();
                    break;
                // ERRORES
                case ERROR_MSG:
                    this.byId("inp_asignarCanastilla") !== undefined ? this.byId("inp_asignarCanastilla").setValue("") : console.log("Error msg");
                    break;
                // SOLO EMITE EL MENSAJE
                default:
                    MessageToast.show(params.mensaje);
                    break;
            }
            //
        },
        recuperarComponentesInstalados: function () {
            var orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");
            var puesto = this._oInput.getSelectedKey();
            var xData = {
                "ORDER": orden,
                "WORK_CENTER": puesto
            };
            console.log(xData);
            var path = "MIIExtensions/Components/Transaction/get_installed_components";
            var tab = "installedComponentTable";
            this._base_onloadTable(tab, xData, path, "Componentes instalados", "");
        },
        stripLeadingZeros: function (sState) {
            if (sState == "") {
                return "";
            } else {
                return isNaN(sState) ? sState : parseInt(sState);
            }
        },
        // JERO 26 OCTUBRE MODELO STD 
        _setModelo(oData, path, nombre) {
            var oThis = this;
            var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            $.ajax({
                cache: false,
                data: oData,
                dataType: "xml",
                type: "GET",
                url: uri
            }).done(function (xmlDOM) {
                try {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                oThis.getView().setModel(oModel, nombre);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + "Datos");
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }
                } catch {
                    MessageToast.show("No se han recibido datos");
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                    MessageToast.show("La solicitud ha fallado: " + textStatus);
                }
            });
        },
        getServerHost: function () {
            /**
             * Validates and returns the right host
             */
            const hostname = window.location.hostname,
                sPort = window.location.port,
                sServer = hostname === "localhost" ? "localhost:8010/proxy" : hostname + ":" + sPort;

            return sServer;
        },
        onCrearAvisoPM() {
            this.getRouter().navTo("crearAviso", {
                "idPlanta": "IN01"
            });
        },
        onCrearParo() {
            this.getRouter().navTo("verParos", {
                "idPlanta": "IN01"
            });
        },
        onGetTilesPuesto: function (oPuestoTrabajo) {

            // console.log(" Get Tiles Puesto")

            let oThis = this;
            let oView = this.getView();
            if (oView.byId("input") == undefined) {
                return false;
            }
            let oPuestoTrabajoTag = oView.byId("input").getSelectedKey();
            if (oPuestoTrabajoTag == "") {
                return false;
            }
            oView.setModel(new sap.ui.model.json.JSONModel(), "TagTilesModel");
            var oModelTagTiles = new sap.ui.model.json.JSONModel();
            oModelTagTiles.setSizeLimit(100);
            var oPath = "MII/DatosTransaccionales/PCoTags/Transaction/getValorTag_By_Puesto-TipoTag_xacuteQuery";
            var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
            var parameters = {
                "Param.1": oPuestoTrabajoTag
            };
            oModelTagTiles.loadData(url, parameters, true, "POST");
            oModelTagTiles.attachRequestCompleted(function () {
                // IF Fatal Error input
                if (oModelTagTiles.getData().Rowsets.FatalError) {
                    global.functions.onMessage("E", oModelTagTiles.getData().Rowsets.FatalError);
                    return;
                }
                oView.setModel(oModelTagTiles, "TagTilesModel");
            });
        },
        buscarMaterialInventario: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                aFilters = new Filter({
                    filters: [
                        new Filter("CD_MATERIAL", sap.ui.model.FilterOperator.Contains, sQuery),
                        new Filter("LOTE", sap.ui.model.FilterOperator.Contains, sQuery)
                    ]
                });
            }
            //var list = this.byId("tbl_inventario");
            var id = oEvent.getSource().getParent().getParent().getId().split("--")[2];//Get id obj table
            var list = this.byId(id);
            var binding = list.getBinding("items");
            binding.filter(aFilters, "Application");
        },
        //<!--##############-->
        //19 OCTUBRE : ATADOS PARA EMPAQUE, PINTURA Y ANODIZADO
        _on_generar_atados: function () { // 202310 GAST
            var operation = this._oInput.getSelectedKey();
            var WORK_CENTER = this._oInput.getSelectedKey();
            if (operation === '') this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
            else {
                var oData = {
                    "WORK_CENTER": this._oInput.getSelectedKey()
                };
                var oView = this.getView();
                var oThis = this;
                if (!this.byId("Reporte_generar_atados__frg")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Reporte_generar_atados",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis._open_generar_atados(oData);
                    });
                } else {
                    this.byId("Reporte_generar_atados__frg").open();
                    this._open_generar_atados(oData);
                }
            }
        },
        //19 OCTUBRE : ATADOS PARA EMPAQUE, PINTURA Y ANODIZADO
        _open_generar_atados: function (oData) { // 202310
            var WORK_CENTER = "";
            if (oData.WORK_CENTER !== undefined) {
                WORK_CENTER = oData.WORK_CENTER;
            }
            var oView = this.getView();
            var oThis = this;
            var columns = {
                columns: [
                    { Column: "Orden", Visible: 1 },
                    { Column: "Material", Visible: 1 },
                    { Column: "Descripción", Visible: 1 },
                    { Column: "Almacén", Visible: 0 },
                    { Column: "Rollo Master", Visible: 1 },
                    { Column: "Lote de Salida", Visible: 1 },
                    { Column: "Cantidad", Visible: 1 },
                    { Column: "Documento", Visible: 0 },
                    { Column: "Fecha Inicio", Visible: 0 },
                    { Column: "Fecha Fin", Visible: 1 },
                    { Column: "Ancho", Visible: 1 },
                    { Column: "Espesor", Visible: 1 },
                    { Column: "Longitud", Visible: 1 },
                    { Column: "Supervisor", Visible: 1 },
                    { Column: "Inspección", Visible: 1 },
                    { Column: "Tipo", Visible: 0 },
                    { Column: "Calidad", Visible: 1 },
                    { Column: "ID", Visible: 0 },
                    { Column: "Defecto", Visible: 1 },
                    { Column: "Imprimir", Visible: 1 }
                ]
            };
            // this._setColumns(columns, "columnList", "ProductionReport_Table_2");
            var oTable = oView.byId("ProductionReport_Table_2");
            var oColumns = oTable.getColumns();
            // oColumns[17].setVisible( false );
            this._base_onloadTable("ProductionReport_Table_2", oData, "MIIExtensions/Reports/Transaction/get_production_report_active___atados__v1", "Reporte Produccion", "");
        },
        //19 OCTUBRE : ATADOS PARA EMPAQUE, PINTURA Y ANODIZADO
        _onPrint_Etiq_Atados(oEvent) {
            var user = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oItem = oEvent.getSource().getParent();
            var oTable = oItem.getParent();
            var oIndex = oTable.indexOfItem(oItem);
            var oModel = oTable.getModel();
            var oModelData = oModel.getProperty("/ITEMS");
            var row = oModelData[oIndex];
            //
            if (row.CANTIDAD > 0) {
            } else {
                row.CANTIDAD = row.CANTIDAD.replace(',', ''); // 20231128
            }
            //
            row.CANTIDAD = 1 * row.CANTIDAD;
            row.CHARACTERISTIC_VALUE = 1 * row.CHARACTERISTIC_VALUE;
            row.CUANTOS_ATADOS = 1 * row.CUANTOS_ATADOS;
            row.CUANTOS_PIEZAS = 1 * row.CUANTOS_PIEZAS;
            if (row.CHARACTERISTIC_VALUE == 0) {
                return;
            }
            var w_cant_x_etiquetar = 0;
            if (row.CUANTOS_PIEZAS >= row.CANTIDAD) {
                w_cant_x_etiquetar = 1;
            } else {
                w_cant_x_etiquetar = (row.CANTIDAD - row.CUANTOS_PIEZAS) / row.CHARACTERISTIC_VALUE;
            }
            //debugger
            var w_ok = 1;
            var w_cant_x_etiquetar_aux = Math.floor(w_cant_x_etiquetar);
            if (w_cant_x_etiquetar_aux == 0) {
                if (row.PEDIDO != "") { // 20231228 
                    row.CHARACTERISTIC_VALUE = row.CANTIDAD - row.CUANTOS_PIEZAS;
                    w_cant_x_etiquetar = 1;
                } else {
                    w_ok = 0;
                }
            }
            if (!w_ok) { // 20231228
                this.getOwnerComponent().openHelloDialog("MTS no cumple [ piezas_x_atados ] ");
                return
            }
            var oData = {
                "NUM_ORDEN": row.NUM_ORDER,
                "MATERIAL": row.MATERIAL,
                "LOTE": row.BATCH_MII,
                "UM": row.UM,
                "Q_PZAS_X_ATADO": row.CHARACTERISTIC_VALUE,
                "ETIQ_PENDIENTES": w_cant_x_etiquetar,
                "_USER_MII": user
            };
            var w_info_msj = "Confirma imprimir etiqueta de Atados ?";
            //debugger
            this._handleMessageBoxOpen__imprimir_Etiq_Atados(w_info_msj, "warning", oData, this);
            //debugger
        },
        //19 OCTUBRE : ATADOS PARA EMPAQUE, PINTURA Y ANODIZADO
        _handleMessageBoxOpen__imprimir_Etiq_Atados: function (sMessage, sMessageBoxType, oData, oThis) { // 202310
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        var w_trx = "MII/DatosTransaccionales/Produccion/Etiquetar_Atados/Transaction/etiquetar_atados";
                        //debugger
                        oThis._BD_MII__exe_data_Etiq_Atados(oData, w_trx);
                        //debugger
                    }
                }.bind(this)
            });
        },
        //19 OCTUBRE : ATADOS PARA EMPAQUE, PINTURA Y ANODIZADO
        _BD_MII__exe_data_Etiq_Atados: function (oData, path) { // 202310
            var server = this.getView().getModel("ModeloPrincipal").getProperty("/SERVER");
            var uri = server + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');
            var oThis = this;
            sap.ui.core.BusyIndicator.show(0);
            //debugger
            $.ajax({
                crossDomain: true,
                async: false,
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            }).done(function (xmlDOM) {
                var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                if (opElement.firstChild != null) {
                    var aData = eval(opElement.firstChild.data);
                    if (aData[0].error !== undefined) {
                        oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                    } else {
                        //Create  the JSON model and set the data
                        oThis.getOwnerComponent().openHelloDialog(aData[0].message);
                        oThis._on_generar_atados();
                    }
                } else {
                    oThis.getOwnerComponent().openHelloDialog("No se recibio informacion");
                }
                sap.ui.core.BusyIndicator.hide();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                    oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
                }
                sap.ui.core.BusyIndicator.hide();
            });
        },
        //19 OCTUBRE : ATADOS PARA EMPAQUE, PINTURA Y ANODIZADO
        _onCloseReporte_generar_atados: function (oEvent) { // 202310
            this.onCloseReporteProduccion();
        },
        //<!--##############-->
        // ATADOS PARA EMPAQUE, PINTURA Y ANODIZADO
        _onCloseReporte_generar_atados_unifica_menudeo: function (oEvent) { // 20231222
            this.onCloseReporteProduccion();
        },
        _on_generar_atados_unifica_menudeo: function () { // 20231222
            this.on_generar_atados_unifica_menudeo();
        },
        //<!--##############-->

        _onValidarCP: function () {
            var oView = this.getView();
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var tab_item = oView.byId('installedComponentTable').getSelectedItem();
            var material = tab_item.getBindingContext().getProperty("MATERIAL");
            var lote = tab_item.getBindingContext().getProperty("BATCH");
            var orden = tab_item.getBindingContext().getProperty("NUM_ORDER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var cantidad = tab_item.getBindingContext().getProperty("CANTIDAD");
            var idTab = tab_item.getBindingContext().getProperty("ID_TAB");

            if (tab_item.length === 0) {
                this.handleWarningMessageBoxPress("Selecciona un componente");
            }
            else {
                var oData = {
                    "WORK_CENTER": this._oInput.getSelectedKey()
                };
                var oData = {
                    "COMPONENT": material,
                    "BATCH": lote,
                    "WORK_CENTER": puesto,
                    "SITE": planta,
                    "USER": usuario,
                    "ORDER": orden,
                    "VIA": "1",
                    "SECTOR": "01",
                    "CANTIDAD": cantidad,
                    "ID_TAB": idTab
                };
                var path = "MIIExtensions/SFC/Transaction/validarGenerarCP";
                var postEx = "CP_MANUAL";
                this._ejecutarTransaccion(oData, path, postEx);
            }

        },

        _onValidarCP_Consumos: function () {
            var oView = this.getView();
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var tab_item = oView.byId('RollosConsumidosTable').getSelectedItem();
            var material = tab_item.getBindingContext().getProperty("MATERIAL");
            var lote = tab_item.getBindingContext().getProperty("BATCH");
            var orden = tab_item.getBindingContext().getProperty("NUM_ORDER");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var cantidad = tab_item.getBindingContext().getProperty("CANTIDAD");
            var idTab = tab_item.getBindingContext().getProperty("ID_TAB");

            if (tab_item.length === 0) {
                this.handleWarningMessageBoxPress("Selecciona un componente");
            }
            else {
                var oData = {
                    "WORK_CENTER": this._oInput.getSelectedKey()
                };
                var oData = {
                    "COMPONENT": material,
                    "BATCH": lote,
                    "WORK_CENTER": puesto,
                    "SITE": planta,
                    "USER": usuario,
                    "ORDER": orden,
                    "VIA": "1",
                    "SECTOR": "01",
                    "CANTIDAD": cantidad,
                    "ID_TAB": idTab
                };
                var path = "MIIExtensions/SFC/Transaction/validarGenerarCP";
                var postEx = "CP_MANUAL";
                this._ejecutarTransaccion(oData, path, postEx);
            }

        },


        anularConsumo: function (oEvent) {
            var tbl = this.byId("RollosConsumidosTable");
            var work_center = this._oInput.getSelectedKey();
            var documento = tbl.getSelectedItem().getBindingContext().getObject().DOCUMENTO;
            var lote = tbl.getSelectedItem().getBindingContext().getObject().BATCH;
            var user = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var order = tbl.getSelectedItem().getBindingContext().getObject().NUM_ORDER;
            var Id = "";
            var canasta = "";
            var oData = {
                "DOCUMENTO": documento,
                "CHARG": lote,
                "USER": user,
                "MOVIMIENTO": 261,
                "NUM_ORDER": order,
                "ID": Id,
                "CANASTA": canasta,
                "WORK_CENTER": work_center
            };
            this.confirmarAnulacion(oData);
        },

        confirmarAnulacion: function (oData) {
            var oThis = this;
            var oDialog = new Dialog({
                title: 'Confirmar acci\u00F3n',
                type: 'Message',
                content: new Text({
                    text: 'Confirme anulación de movimiento 262, esta acción no se puede deshacer'
                }),
                beginButton: new Button({
                    type: sap.m.ButtonType.Accept,
                    text: 'SI, Confirmo Anulación',
                    press: function () {
                        oThis.anular261(oData, 'MIIExtensions/SFC/Transaction/anular_movimiento_262');
                        oThis.onRollosConsumidos();
                        // oThis.authAnular();
                        oDialog.close();
                    }
                }),
                endButton: new Button({
                    type: sap.m.ButtonType.Reject,
                    text: 'NO, Cancelar',
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

        anular261(oData, path) {
            var uri = this.getView().getModel("ModeloPrincipal").getProperty("/SERVER") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            sap.ui.core.BusyIndicator.show(0);
            var oThis = this;
            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            }).done(function (xmlDOM) {
                var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                if (opElement.firstChild !== null) {
                    var aData = eval(opElement.firstChild.data);
                    if (aData[0].ERROR !== undefined) {
                        oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                    } else {
                        MessageToast.show(aData[0].MESSAGE);
                    }
                } else {
                    oThis.handleErrorMessageBoxPress("La solicitud ha fallado: �Hay conexi�n de red?");
                }
                sap.ui.core.BusyIndicator.hide();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                    MessageToast.show("La solicitud a fallado: " + textStatus);
                }
                sap.ui.core.BusyIndicator.hide();
            });
        },


    };
});