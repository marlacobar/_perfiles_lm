/**
 * Bayco Consulting : Proyecto Indalum SAP MII
 * 2023
 * Extension Templado.controller.js
 */

sap.ui.define(
    [
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
    ],
    function (Button,
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
        BusyIndicator) {
        "use strict";
        const INSTALACION = "INSTALACION";
        const DESINSTALACION = "DESINSTALACION";
        const DECLARACION = "DECLARACION";
        const ERROR_MSG = "ERROR_MSG";
        const INICIO_PROCESO = "INICIO_PROCESO";
        const CONFIRMA_INICIO_PROCESO = "CONFIRMA_INICIO_PROCESO";
        const TRX_CONFIRMAR = "CONFIRMAR";
        const TRX_VERIFICAR = "VERIFICAR";
        return {

            cargarFragmentoCanastilla: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var oView = this.getView();
                var oThis = this;
                var planta = planta;
                var oData = {
                    "CD_PLANTA": planta
                };
                if (!this.byId("dlg_instalarCanastilla")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Templado.TempleInstalarCanastilla",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis.enlistarCanastillasDisponibles();
                    });
                } else {
                    this.byId("dlg_instalarCanastilla").open();
                    this.enlistarCanastillasDisponibles();
                }
            },

            cancelarTSD: function (oEvent) {
                oEvent.getSource().getParent().destroy();
            },

            enlistarCanastillasDisponibles: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario
                }
                var path = " MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Canastillas_Disponibles_Produccion";
                var tabla = "tbl_canastillasDisponibles";
                var nombre = "Canastillas_Disponibles";
                this._base_onloadTable(tabla, oData, path, nombre, "");
            },

            escaneoCanastillaPrev_p0: function (codigo) {
                var oView = this.getView();
                var oThis = this;
                // Fill Zeroes to Input (Canastilla ID)
                codigo = codigo.padStart(4, 0);
                if (isNaN(codigo)) {
                    MessageBox.error("Código NO Válido");
                    return;
                }
                if (codigo.length != 4) {
                    return;
                }
                if (!this.byId("dlg_canastillaItems")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Templado.CanastillaItems",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis.enlistarItemsCanastillas(codigo);
                    });
                } else {
                    this.byId("dlg_canastillaItems").open();
                    this.enlistarItemsCanastillas(codigo);
                }
            },
            escaneoCanastillaPrev_p2: function () {
                let codigo = this.byId("inp_asignarCanastilla").getValue();
                this.escaneoCanastillaPrev_p0(codigo);
            },
            escaneoCanastillaPrev: function (oEvent) {
                let codigo = oEvent.getParameter("value");
                this.escaneoCanastillaPrev_p0(codigo);
            },

            enlistarItemsCanastillas: function (codigo) {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var oData = {
                    "CD_PLANTA": planta,
                    "USUARIO": usuario,
                    "CODIGO": codigo
                };
                var tabla = "tbl_canastillaItems";
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Canastilla_Items_Lista";
                var name = "Items"
                this._base_onloadTable(tabla, oData, path, name, "");
                this.asignarModeloCodigo(codigo);
            },

            asignarModeloCodigo: function (codigo) {
                if (this.getView().getModel("ModeloTemplado") === undefined) {
                    var oModel = new sap.ui.model.json.JSONModel({
                        CODIGO: ""
                    });
                    this.getView().setModel(oModel, "ModeloTemplado");
                }
                this.getView().getModel("ModeloTemplado").setProperty("/CODIGO", codigo);
            },

            aceptarAsignacionCanastilla: function () {
                this.byId("inp_asignarCanastilla").setValue("");
                var codigo = this.getView().getModel("ModeloTemplado").getProperty("/CODIGO");
                var items = '<Rowsets>\n';
                items += '<Rowset>\n';
                items += "<Row>\n";
                items += '<CANASTILLA>' + codigo + '</CANASTILLA>\n';
                items += "</Row>\n";
                items += "</Rowset>\n";
                items += "</Rowsets>\n";
                this.instalarCanastilla(items);
            },

            escaneoCanastilla: function (oEvent) { //DEPRECADA ver escaneoCanastillaPrev
                var codigo = oEvent.getParameter("newValue");
                if (isNaN(codigo) || codigo.length > 4) {
                    MessageBox.error("Código NO Válido");
                    return;
                }
                var items = '<Rowsets>\n';
                items += '<Rowset>\n';
                items += "<Row>\n";
                items += '<CANASTILLA>' + codigo + '</CANASTILLA>\n';
                items += "</Row>\n";
                items += "</Rowset>\n";
                items += "</Rowsets>\n";
                this.instalarCanastilla(items);
            },

            asignarCanastillas: function () {
                //var tbl_items = this.byId("tbl_canastillasDisponibles").getSelectedItems();
                /*
                var id = "";
                var elemento;
                var items = '<Rowsets>\n';
                items += '<Rowset>\n';
    
                if(tbl_items.length === 0){
                    MessageBox.error("Debes seleccionar AL MENOS un registro")
                    return;
                }
    
                for(var i = 0; i < tbl_items.length; i++){
                    elemento = tbl_items[i];
                    id = elemento.getBindingContext().getProperty("CODIGO");
                    items += "<Row>\n";
                    items += '<CANASTILLA>' + id + '</CANASTILLA>\n';
                    items += "</Row>\n";
                }
    
                items += "</Rowset>\n";
                items += "</Rowsets>\n";
                this.instalarCanastilla(items);
                */

                var codigo = this.byId("tbl_canastillasDisponibles").getSelectedItem().getBindingContext().getProperty("CODIGO");
                var oView = this.getView();
                var oThis = this;
                if (!this.byId("dlg_canastillaItems")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Templado.CanastillaItems",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis.enlistarItemsCanastillas(codigo);
                    });
                } else {
                    this.byId("dlg_canastillaItems").open();
                    this.enlistarItemsCanastillas(codigo);
                }

            },

            instalarCanastilla: function (items) {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Puesto_Canastilla_Instalar";
                var oData = {
                    "ITEMS": items,
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario,
                    "FL_SPLIT": "0"
                };
                var postEx = INSTALACION;
                this._ejecutarTransaccion(oData, path, postEx);
            },

            instalarCanastillaSplit: function (items) {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Puesto_Canastilla_Instalar";
                var oData = {
                    "ITEMS": items,
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario,
                    "FL_SPLIT": "1"
                };
                var postEx = INSTALACION;
                this._ejecutarTransaccion(oData, path, postEx);
            },
            //Funcion de aceptar la asignacion de canastilla split 
            aceptarAsignacionCanastillaSplit: function () {
                this.byId("inp_asignarCanastilla").setValue("");
                var codigo = this.getView().getModel("ModeloTemplado").getProperty("/CODIGO");
                var items = '<Rowsets>\n';
                items += '<Rowset>\n';
                items += "<Row>\n";
                items += '<CANASTILLA>' + codigo + '</CANASTILLA>\n';
                items += "</Row>\n";
                items += "</Rowset>\n";
                items += "</Rowsets>\n";
                this.instalarCanastillaSplit(items);
            },

            enlistarOrdenesIniciadas: function () {
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var oData = {
                    "WORK_CENTER": puesto
                };
                var tabla = "OrdersList";
                var path = "MIIExtensions/Orders/Transaction/get_started_ordenes";
                var name = "Ordenes"
                this._base_onloadTable(tabla, oData, path, name, "");
            },

            cargarFragmentoCanastillasInstaladas: function () {
                var oView = this.getView();
                var oThis = this;
                if (!this.byId("dlg_canastillasInstaladas")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Templado.CanastillasInstaladas",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis.enlistarCanastillasInstaladas();
                        oThis.enlistarDetalleCanastasInstaladas();
                    });
                } else {
                    this.byId("dlg_canastillasInstaladas").open();
                    this.enlistarCanastillasInstaladas();
                    this.enlistarDetalleCanastasInstaladas();
                }
            },

            enlistarCanastillasInstaladas: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto
                };
                var tabla = "tbl_canastillasInstaladas";
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Canastillas_Instaladas_Lista";
                var name = "Canastillas_Instaladas"
                this._base_onloadTable(tabla, oData, path, name, "");
            },

            enlistarDetalleCanastasInstaladas: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto
                };
                var tabla = "tbl_detalleItemsCanastilla";
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Temple_ItemsProceso_Lista";
                var name = "Items_Instalados"
                this._base_onloadTable(tabla, oData, path, name, "");
            },

            desmontarCanastilla: function () {
                var tbl_items = this.byId("tbl_canastillasInstaladas").getSelectedItems();
                var id = "";
                var elemento;
                var items = '<Rowsets>\n';
                items += '<Rowset>\n';

                if (tbl_items.length === 0) {
                    MessageBox.error("Debes seleccionar AL MENOS un registro")
                    return;
                }

                for (var i = 0; i < tbl_items.length; i++) {
                    elemento = tbl_items[i];
                    id = elemento.getBindingContext().getProperty("CANASTILLA");
                    items += "<Row>\n";
                    items += '<CANASTILLA>' + id + '</CANASTILLA>\n';
                    items += "</Row>\n";
                }

                items += "</Rowset>\n";
                items += "</Rowsets>\n";
                this.desinstalarCanastilla(items);
            },

            desinstalarCanastilla: function (items) {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Canastilla_Desinstalar";
                var oData = {
                    "ITEMS": items,
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario
                };
                var postEx = DESINSTALACION;
                this._ejecutarTransaccion(oData, path, postEx);
            },

            notificarProcesoTemple: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Temple_Declarar";
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario
                };
                var postEx = DECLARACION;
                var message = "¿Confirmar declaración?";
                this.confirmarAccion(oData, path, message, postEx);
            },

            confirmarAccion: function (oData, path, message, postEx) {
                var oThis = this;
                MessageBox["warning"](message, {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            oThis._ejecutarTransaccion(oData, path, postEx);
                        }
                    }.bind(this)
                });
            },

            iniciarProcesoTemplado: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Temple_Proceso_Iniciar";
                var tipo = TRX_VERIFICAR;
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario,
                    "TIPO": tipo
                };
                var postEx = INICIO_PROCESO;
                var message = "¿Confirmar Inicio de proceso?";
                this._ejecutarTransaccion(oData, path, postEx);
            },

            confirmarInicioTemplado: function (params) {
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
                params.status == "W" ? message = "¿Confirmar Inicio de proceso? \n " + params.mensaje : message = message;
                this.confirmarAccion(oData, path, message, postEx);
            },

            actualizarModeloVista: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var oData = {
                    "CD_PUESTO": puesto,
                    "CD_PLANTA": planta,
                    "USUARIO": usuario
                }
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/ModeloPOD_Temple_Obtener";
                this.setModeloObjetos(oData, path);
            },

            invalidarAsignacionCanastilla: function () {
                this.byId("inp_asignarCanastilla").setValue("");
                this.byId("dlg_canastillaItems").destroy();
            },

            mostrarCaracteristicaItem: function (oEvent) {
                var material = this.byId("tbl_canastillaItems").getSelectedItem().getBindingContext().getProperty("CD_MATERIAL")
                var lote = this.byId("tbl_canastillaItems").getSelectedItem().getBindingContext().getProperty("LOTE")
                var oData = {
                    "MATERIAL": material,
                    "LOTE": lote
                };
                var tabla = "tbl_caracteristicaItem";
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Canastilla_ItemsChars_Lista";
                var name = "CharsItemsCanastilla"
                this._base_onloadTable(tabla, oData, path, name, "");
            },


            //Funcion que carga la informacion del fragmento de ordenes de canstillas instaladas 
            cargarFragmentoCanastillasInstaladasDetalleOrdenes: function (oEvent) {
                var oView = this.getView();
                var oThis = this;
                let sCanastilla = oEvent.getSource().getParent().getBindingContext().getProperty("ID_CANASTILLA");
                let sLote = oEvent.getSource().getParent().getBindingContext().getProperty("LOTE");

                var detalleOrdenesCanastillaModel = new sap.ui.model.json.JSONModel();
                detalleOrdenesCanastillaModel.setSizeLimit(10000);
                // Ejecutar Transacción 
                let param = {
                    "Param.1": sCanastilla,
                    "Param.2": sLote
                };

                let path = "MII/DatosTransaccionales/Produccion/Canastillas/Query/__DetalleDistribucionCanastilla_selectQuery";

                var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + path + "&Content-Type=text/json";

                detalleOrdenesCanastillaModel.loadData(url, param, true, "POST");
                detalleOrdenesCanastillaModel.attachRequestCompleted(function (oController) {

                    // IF Fatal Error input
                    if (detalleOrdenesCanastillaModel.getData().Rowsets.FatalError) {
                        global.functions.onMessage("E", detalleOrdenesCanastillaModel.getData().Rowsets.FatalError);
                        return false;
                    }

                    oView.setModel(detalleOrdenesCanastillaModel, "detalleOrdenesCanastillaModel");

                    // Abrir Dialog Detalle Contenido Canastilla
                    oThis.getCanastillasInstaladasDetalleOrdenes(sCanastilla);


                });

            },
            //Funcion que abre el fragmento de detalle de ordenes de canaastillas instaladas 
            getCanastillasInstaladasDetalleOrdenes: function (sCanastilla) {
                var oView = this.getView();
                var oThis = this;

                if (!this.byId("dlg_canastillasInstaladasDetalleOrdenes")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Templado.CanastillasInstaladasDetalleOrdenes",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        //oThis.enlistarCanastillasInstaladas();
                        //oThis.enlistarDetalleCanastasInstaladas();
                    });
                } else {
                    this.byId("dlg_canastillasInstaladasDetalleOrdenes").open();
                    //this.enlistarCanastillasInstaladas();
                    //this.enlistarDetalleCanastasInstaladas();
                }



            },
            //Funcion que cierra el fragmento de detalle de ordenes de canastillas instaladas 
            closeFragmentoCanastillasInstaladasDetalleOrdenes: function () {
                var oView = this.getView();
                var oThis = this;
                oThis.byId("dlg_canastillasInstaladasDetalleOrdenes").close();

            },

            onScanSuccess: function (oEvent) {
                var oThis = this;
                console.log(oEvent);
                if (oEvent.getParameter("cancelled")) {
                    MessageToast.show("Escaneo Cancelado", { duration: 1000 });
                } else {
                    if (oEvent.getParameter("text")) {
                        var result = String(oEvent.getParameter("text")).padStart(4, '0')
                        oThis.getView().byId("inp_asignarCanastilla").setValue(result);
                    } else {
                        oThis.getView().byId("inp_asignarCanastilla").setValue('');
                    }
                }
            },
            onScanError: function (oEvent) {
                MessageToast.show("Escaneo error: " + oEvent, { duration: 1000 });
            },


        };
    }
);