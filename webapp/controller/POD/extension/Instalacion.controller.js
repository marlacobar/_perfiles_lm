/**
 * Bayco Consulting : Proyecto Indalum SAP MII
 * 2023
 * Extension Pintura.controller.js
 */

sap.ui.define(
    [
        "sap/m/Button",
        'sap/ui/core/mvc/Controller',
        'sap/ui/model/json/JSONModel',
        'sap/m/ColumnListItem',
        "sap/m/MessageBox",
        'sap/m/MessageToast',
        "sap/ui/core/Fragment",
        "sap/m/library",
        "/../../../model/formatter",
        'sap/ui/core/BusyIndicator',
    ],
    function (Button,
        Controller,
        JSONModel,
        ColumnListItem,
        MessageBox,
        MessageToast,
        Fragment,
        mobileLibrary,
        formatter,
        BusyIndicator,) {
        "use strict";
        const INSTALACION = "INSTALACION";

        return {

            //Funcion que muestra el fragmento del inventario 
            mostrarFragmentoInventario: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");

                var tbl_orden = this.byId("OrdersList").getSelectedItem();
                if (tbl_orden === null) {
                    MessageBox.error("Debe seleccionar una orden activa");
                    return;
                }

                var tbl_componente = this.byId("TablaListaComponentes").getSelectedItem();
                if (tbl_componente === null) {
                    MessageBox.error("Debe seleccionar un componente");
                    return;
                }

                var orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");
                var componente_pedido = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("COMP_PEDIDO");
                var componente_pos = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("COMP_PEDIDO_POS");
                var material = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("MATERIAL");
                var almacen = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("STORAGE_LOCATION");
                var oView = this.getView();
                var oThis = this;
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
                if (!this.byId("dlg_inventarioAlmacen")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.InventarioAlmacen",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis.enlistarInventario(oData);
                    });
                } else {
                    this.byId("dlg_inventarioAlmacen").open();
                    this.enlistarInventario(oData);
                }
            },
            //Funcion que muestra la infomracion de la tabla de inventario 
            enlistarInventario: function (oData) {
                
                var path = "MII/DatosTransaccionales/Produccion/Pintura/Transaction/InventarioDisponible_Lista";
                var tabla = "tbl_inventario";
                var nombre = "Inventario";
                this._base_onloadTable(tabla, oData, path, nombre, "");
            },
            //Funcion que cierra el fragmento de inventario almacen 
            cancelarInventario: function (oEvent) {
                
                this.byId("dlg_inventarioAlmacen").destroy();
            },
            //Funcion que agrupa elementos en columnas 
            agruparComponentes: function () {
                var tbl_items = this.byId("tbl_inventario").getSelectedItems();
                var material = "";
                var lote = "";
                var almacen = "";
                var cantidad = "";
                var um = "";
                var orden = "";
                var canastilla = "";
                var canastilla_pid = "";
                var elemento;
                var error = "";
                var items = '<Rowsets>\n';
                items += '<Rowset>\n';

                var tbl_orden = this.byId("OrdersList").getSelectedItem();
                if (tbl_orden === null) {
                    MessageBox.error("Debe seleccionar una orden activa");
                    return;
                } else {
                    orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");
                }

                if (tbl_items.length === 0) {
                    MessageBox.error("Debes seleccionar AL MENOS un registro")
                    return;
                }

                for (var i = 0; i < tbl_items.length; i++) {
                    //GET VAR
                    elemento = tbl_items[i];
                    material = elemento.getBindingContext().getProperty("CD_MATERIAL");
                    lote = elemento.getBindingContext().getProperty("LOTE");
                    almacen = elemento.getBindingContext().getProperty("CD_ALMACEN");
                    cantidad = elemento.getBindingContext().getProperty("CANTIDAD");
                    um = elemento.getBindingContext().getProperty("UM");
                    // orden  = elemento.getBindingContext().getProperty("ORDEN");
                    canastilla = elemento.getBindingContext().getProperty("CANASTILLA");
                    canastilla_pid = elemento.getBindingContext().getProperty("CANASTILLA_PID");
                    //ASSIGN THEM
                    if (isNaN(cantidad) || cantidad.trim() === "") {
                        error = true;
                    }
                    items += "<Row>\n";
                    items += '<MATERIAL>' + material + '</MATERIAL>\n';
                    items += '<LOTE>' + lote + '</LOTE>\n';
                    items += '<ALMACEN>' + almacen + '</ALMACEN>\n';
                    items += '<CANTIDAD>' + cantidad + '</CANTIDAD>\n';
                    items += '<UM>' + um + '</UM>\n';
                    items += '<ORDEN>' + orden + '</ORDEN>\n';
                    items += '<CANASTILLA>' + canastilla + '</CANASTILLA>\n';
                    items += '<CANASTILLA_PID>' + canastilla_pid + '</CANASTILLA_PID>\n';
                    items += "</Row>\n";
                }

                items += "</Rowset>\n";
                items += "</Rowsets>\n";
                if (error == true) {
                    MessageBox.error("Debes ingresar una CANTIDAD válida");
                    return;
                }
                this.instalarComponentes(items);
            },
            //Funcion que instala componenetes de pinturas seleccionadoks 
            instalarComponentes: function (items) {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var piezasXAtado = this.byId("inp_piezasXatado").getValue();
                var path = "MII/DatosTransaccionales/Produccion/Pintura/Transaction/Componente_Instalar";
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "PIEZAS_X_ATADO": piezasXAtado,
                    "ITEMS": items,
                    "USUARIO": usuario
                };
                var postEx = INSTALACION;
                var message = "¿Confirmar Instalación?";
                this.confirmarAccion(oData, path, message, postEx);
            },
            //Funcion que muestra un mensaje para confirmar accion 
            confirmarAccion: function (oData, path, message, postEx) {
                /**
                * @param {object} param envia informacion a la funcion
                * @param {string} path representa la ruta 
                * @param {Action} message muestra un cuadro de advertencia
                * @param {string} postEx  ---
                */
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

            notificarOrdenPintado: function () {
                var piezas = this.byId("inputPesoBascula").getValue();
                if (piezas.trim() === "" || isNaN(piezas) || +piezas <= 0 || !Number.isInteger(+piezas)) {
                    MessageBox.error("Debe Ingresar un número de PIEZAS válido")
                    return;
                }
                var params = {
                    requiere_longitud: false
                };
                this.onNotificationOrder(params);
            },

            cargarFragmentoFijarLotePintura: function () {
                var oView = this.getView();
                var oThis = this;
                if (!this.byId("dlg_FijarLotePintura")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Pintura.FijarLotePintura",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis.enlistarLotePinturaAsignado();
                        oThis.enlistarLotesPinturaDisponibles();
                    });
                } else {
                    this.byId("dlg_FijarLotePintura").open();
                    this.enlistarLotePinturaAsignado();
                    this.enlistarLotesPinturaDisponibles();
                }
            },

            destruirFragmentoFijarLotePintura: function () {
                this.byId("dlg_FijarLotePintura").destroy();
            },

            enlistarLotePinturaAsignado: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario
                }
                var path = "MII/DatosTransaccionales/Produccion/Pintura/Transaction/LotePintura_Asignado";
                var tabla = "tbl_lotePinturaAsignado";
                var nombre = "LotesPinturaAsignado";
                this._base_onloadTable(tabla, oData, path, nombre, "");
            },

            enlistarLotesPinturaDisponibles: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario
                }
                var path = "MII/DatosTransaccionales/Produccion/Pintura/Transaction/LotesPintura_Lista";
                var tabla = "tbl_lotesPinturaDisponible";
                var nombre = "LotesPinturaDisponibles";
                this._base_onloadTable(tabla, oData, path, nombre, "");
            },

            fijarLotePintura: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var tabla = this.byId("tbl_lotesPinturaDisponible").getSelectedItem();
                if (tabla === null) {
                    MessageBox.error("Debe de seleccionar AL MENOS un registro")
                    return;
                }
                var lote = tabla.getBindingContext().getProperty("LOTE");
                var material = tabla.getBindingContext().getProperty("CD_MATERIAL");
                var path = "MII/DatosTransaccionales/Produccion/Pintura/Transaction/LotePintura_Fijar";
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "LOTE": lote,
                    "MATERIAL": material,
                    "USUARIO": usuario
                };
                var postEx = FIJAR_LOTEPINTURA;
                var message = "¿Confirmar Fijar?";
                this.confirmarAccion(oData, path, message, postEx);
            },

            desmontarLotePintura: function (oEvent) {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var id_tab = oEvent.getSource().getParent().getBindingContext().getObject().ID_TAB;
                var path = "MII/DatosTransaccionales/Produccion/Pintura/Transaction/LotePinturaDesmontar";
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "ID_TAB": id_tab,
                    "USUARIO": usuario
                };
                var postEx = DESMONTAR_LOTEPINTURA;
                var message = "¿Confirmar Desmontaje?";
                this.confirmarAccion(oData, path, message, postEx);
            }

        }
    }
);