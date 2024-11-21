/**
 * Bayco Consulting : Proyecto Indalum SAP MII
 * 2023
 * Extension Anodizado.controller.js
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
    "sap/ui/model/Filter",
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
    Filter,
    mobileLibrary,
    Text,
    TextArea,
    formatter,
    BusyIndicator
) {
    "use strict";

    const ERROR_MSG = "ERROR_MSG";
    const ERROR_FLOAT = "ERROR_FLOAT";
    const ERROR_NEGATIVO = "ERROR_NEGATIVO";
    const ERROR_CTD = "ERROR_CTD";

    return {

        onVigaDialog: function () {
            var tbl_componente = this.byId("TablaListaComponentes").getSelectedItem();
            if (tbl_componente === null) {
                MessageBox.error("Debe seleccionar un componente");
                return;
            }
            var componente_pedido = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("COMP_PEDIDO");
            var componente_pos = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("COMP_PEDIDO_POS");
            var material = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("MATERIAL");
            var almacen = this.byId("TablaListaComponentes").getSelectedItem().getBindingContext().getProperty("STORAGE_LOCATION");
            var oThis = this;
            var oView = this.getView(),
                oitems = oView.byId('OrdersList').getSelectedItems(),
                WORK_CENTER = this._oInput.getSelectedKey(),
                order = '';
            oitems.forEach(function (item) {
                order = item.getCells()[0].getText();
            });
            if (order === '') {
                this.handleWarningMessageBoxPress("Selecciona una orden activa para visualizar Vigas");
            } else {
                var oData = {
                    "ORDER": order
                };
                var atributosModelo = {
                    "COMP_PEDIDO": componente_pedido,
                    "COMP_POS": componente_pos,
                    "MATERIAL": material,
                    "ALMACEN": almacen,
                    "ORDEN": order
                };
                if (!this.byId("listaVigasDialog")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.PantallaOperador.Anodizado.VigasList",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oThis.asignarModelo(atributosModelo);
                    });
                } else {
                    this.byId("listaVigasDialog").open();
                    oThis.asignarModelo(atributosModelo);
                }
                this.byId("listaVigasDialog");
            }
        },
        obtenerInfoOrder: function (order) {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oData = {
                "CD_PLANTA": planta,
                "ORDEN": order,
                "USUARIO": usuario
            };
            var path_modelo = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/Orden_Info_Obtener";
            var nombre_modelo = "ORDEN";
            this._setModelo(oData, path_modelo, nombre_modelo);
        },
        mostrarFragmentoInventarioAnodizado: function () {
            //<!---->
            var viga = this.byId("inp_viga").getValue();
            var viga_cabecera = this.byId("tbl_vigas").getItems()[0].getBindingContext().getProperty("ID_CANASTILLA");
            var viga_estatus = this.byId("tbl_vigas").getItems()[0].getBindingContext().getProperty("CD_ESTATUS");
            //<!---->
            if (viga !== viga_cabecera) {
                MessageBox.error("Escanear de nuevo la viga");
                return;
            }
            //<!---->
            if (viga_estatus !== "2") {
                MessageBox.error("Estatus no permite cargar en Viga")
                return;
            }
            //<!---->
            var viga_acabado = this.byId("tbl_vigas").getItems()[0].getBindingContext().getProperty("ACABADO");
            var orden_acabado = this.byId("inp_acabdo").getValue();
            if (viga_acabado !== orden_acabado) {
                MessageBox.error("No se pueder cargar en la viga un acabado diferente");
                return;
            }
            //<!---->
            var oView = this.getView();
            var oThis = this;
            //<!---->
            //<!---->
            if (!this.byId("dlg_inventarioPuesto")) {
                //<!---->
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PantallaOperador.Anodizado.InventarioPuesto",
                    controller: this
                }).then(function (oDialog) {
                    //<!---->
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.enlistarInventarioAnodizado();
                    //<!---->
                });
                //<!---->
            } else {
                //<!---->
                this.byId("dlg_inventarioPuesto").open();
                this.enlistarInventarioAnodizado();
                //<!---->
            }
            //<!---->
        },
        enlistarInventarioAnodizado: function (oData) {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            planta = "IN01";
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var codigo = this.byId("inp_viga").getValue();
            var orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");
            var pedido = this.getView().getModel("ModeloAnodizado").getProperty("/COMP_PEDIDO");
            var pedido_pos = this.getView().getModel("ModeloAnodizado").getProperty("/COMP_POS");
            var almacen = this.getView().getModel("ModeloAnodizado").getProperty("/ALMACEN");
            var material = this.getView().getModel("ModeloAnodizado").getProperty("/MATERIAL");
            var acabado = this.getView().getModel("ModeloAnodizado").getProperty("/ACABADO");
            var oData = {
                "ACABADO": acabado,
                "CD_PLANTA": planta,
                "CODIGO": codigo,
                "ORDEN": orden,
                "USUARIO": usuario,
                "PEDIDO": pedido,
                "PEDIDO_POS": pedido_pos,
                "ALMACEN": almacen,
                "MATERIAL": material
            };
            var path = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/InventarioDisponible_CanastillaOnline_Lista";
            var tabla = "tbl_inventario_viga";
            var nombre = "Inventario";
            this._base_onloadTable(tabla, oData, path, nombre, "");
        },
        onCancelarListaVigas: function () {
            this.byId("listaVigasDialog").close();
        },
        onAceptarViga: function () {
            this.byId("listaVigasDialog").close();
        },
        recuperarViga: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var codigo = this.byId("inp_viga").getValue();
            var oData = {
                "CD_PLANTA": planta,
                "CODIGO": codigo,
                "USUARIO": usuario
            };
            //var path_crear = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Canastilla_Agregar";
            var path_crear = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/Viga_Agregar";
            var postEx = "RECUPERAR_VIGA";
            this._ejecutarTransaccion(oData, path_crear, postEx);
        },
        cambiarEstatus: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var puesto = this.byId("inp_puestoTrabajo").getValue();
            var codigo = this.byId("inp_viga").getValue();
            var inp_alm = this.byId("inp_almacenes").getValue().split("|");
            var destino = inp_alm[1] === undefined ? "" : inp_alm[1].split(":")[0].trim();
            var almacen = inp_alm[0] === undefined ? "" : inp_alm[0].split(":")[0].trim();
            var accion = this.byId("inp_accion").getValue().split(":")[0];
            var ds_accion = this.byId("inp_accion").getValue().split(":")[1];
            var acabado = this.byId("inp_acabdo").getValue();
            var oData = {
                "ACCION": accion,
                "ALMACEN": almacen,
                "CD_PLANTA": planta,
                "CODIGO": codigo,
                "DESTINO": destino,
                "PUESTO": puesto,
                "USUARIO": usuario,
                "ACABADO": acabado
            };
            // var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/CanastillaEstatus_Cambiar";
            // TEMP
            planta = "IN01";
            var path = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/VigaEstatus_Cambiar";
            var postEx = "REFRESH_FRAGMENT_VIGAS";
            if (accion.trim() === "" || planta.trim() === "" || codigo.trim() === "" || usuario.trim() === "") {
                MessageBox.error("Todos los campos son requeridos");
                return;
            }
            var message = "Confirmar los sigiuentes datos: " + "\n\n" + "Acción: " + ds_accion + "\n" + "Viga: " + codigo;
            this.confirmarAccion(oData, path, message, postEx)
        },
        //25 OCTUBRE : ATADOS PARA ANODIZADO, TBD TEMPLE
        obtenerPuestoTrabajo: function (oEvent) {
            var oView = this.getView();
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oData = {
                "CD_PLANTA": planta,
                "USUARIO": usuario
            };
            if (!this.byId("tsd_puestosTrabajo")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PantallaOperador.PuestosTrabajo",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.enlistarPuestosTrabajo(oData);
                });
            } else {
                this.byId("tsd_puestosTrabajo").open();
                this.enlistarPuestosTrabajo(oData);
            }
        },
        //25 OCTUBRE : ATADOS PARA ANODIZADO, TBD TEMPLE
        enlistarPuestosTrabajo: function (oData) {
            var path = " MII/DatosTransaccionales/Produccion/Canastillas/Transaction/PuestosTrabajo_Lista";
            var tabla = "tsd_puestosTrabajo";
            var nombre = "Puestos";
            this._base_onloadTable(tabla, oData, path, nombre, "");
        },
        confirmarPuesto: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts && aContexts.length) {
                var elemento = aContexts.map(function (oContext) {
                    return oContext.getObject().CODIGO;
                });
                this.byId("inp_puestoTrabajo").setValue(elemento);
            }
        },
        filtroTSD: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getParameter("value");
            if (sQuery && sQuery.length > 0) {
                aFilters = new Filter({
                    filters: [
                        new Filter("CODIGO", sap.ui.model.FilterOperator.Contains, sQuery),
                        new Filter("DESCRIPCION", sap.ui.model.FilterOperator.Contains, sQuery)
                    ]
                });
            }
            var list = this.byId(oEvent.getSource().getId().split("--")[2]);
            var binding = list.getBinding("items");
            binding.filter(aFilters, "Application");
        },
        confirmarEstatusViga: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts && aContexts.length) {
                var elemento = aContexts.map(function (oContext) {
                    return {
                        codigo: oContext.getObject().CODIGO,
                        descripcion: oContext.getObject().DESCRIPCION
                    };
                });
                this.byId("inp_accion").setValue(elemento[0].codigo + ":" + elemento[0].descripcion);
                oEvent.getSource().destroy();
                /*
                switch(elemento[0].codigo){
                case "2":
                this.byId("fme_puesto").setVisible(true);
                this.byId("fme_almacen").setVisible(false);
                break;
                case "4":
                this.byId("fme_puesto").setVisible(false);
                this.byId("fme_almacen").setVisible(true);
                break;
                default:
                this.byId("fme_puesto").setVisible(false);
                this.byId("fme_almacen").setVisible(false);
                break;
                }
                */
            }
        },
        cancelarTSD: function (oEvent) {
            oEvent.getSource().destroy();
        },
        cancelarEstatusViga: function () {
            this.byId("cancelarEstatusViga").destroy();
        },
        obtenerAcciones: function (oEvent) {
            var oView = this.getView();
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var codigo = this.byId("inp_viga").getValue();
            var oData = {
                "CD_PLANTA": planta,
                "CODIGO": codigo,
                "USUARIO": usuario
            };
            if (!this.byId("tsd_estatusViga")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PantallaOperador.Anodizado.EstatusViga",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.enlistarEstatusCanastillas(oData);
                });
            } else {
                this.byId("tsd_estatusViga").open();
                this.enlistarEstatusCanastillas(oData);
            }
        },
        enlistarEstatusCanastillas: function (oData) {
            var path = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/VigaEstatus_Lista";
            var tabla = "tsd_estatusViga";
            var nombre = "Estatus";
            this._base_onloadTable(tabla, oData, path, nombre, "");
        },
        cancelarInventarioAnodizado: function (oEvent) {
            this.byId("dlg_inventarioPuesto").destroy();
        },
        agregarItemsAnodizado: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var codigo = this.byId("inp_viga").getValue();
            var material = "";
            var lote = "";
            var cantidad = "";
            var orden = this.getView().getModel("ModeloAnodizado").getProperty("/ORDEN_FABRICA")
            var tbl_items = this.byId("tbl_inventario_viga").getSelectedItems();
            var elemento = "";
            var error = "";
            var canastilla = "";
            var canastilla_pid = "";
            var canastilla_det_id = "";
            var pedido = "";
            var posicion = "";
            var items = '<Rowsets>\n';
            items += '<Rowset>\n';
            if (tbl_items.length === 0) {
                MessageBox.error("Debes seleccionar AL MENOS un registro")
                return;
            }
            for (var i = 0; i < tbl_items.length; i++) {
                elemento = tbl_items[i];
                material = elemento.getBindingContext().getProperty("CD_MATERIAL");
                lote = elemento.getBindingContext().getProperty("LOTE");
                canastilla = elemento.getBindingContext().getProperty("CANASTILLA");
                canastilla_pid = elemento.getBindingContext().getProperty("CANASTILLA_PID");
                canastilla_det_id = elemento.getBindingContext().getProperty("CANASTILLA_DET_ID");
                pedido = elemento.getBindingContext().getProperty("PEDIDO");
                posicion = elemento.getBindingContext().getProperty("POSICION");
                //orden = elemento.getBindingContext().getProperty("ORDEN");
                cantidad = elemento.getCells()[4].getItems()[0].getValue();
                if (isNaN(cantidad) || cantidad.trim() === "") {
                    error = ERROR_CTD;
                }
                if (+cantidad <= 0) {
                    error = ERROR_NEGATIVO;
                }
                if (cantidad.indexOf(".") > 0) {
                    error = ERROR_FLOAT;
                }
                items += "<Row>\n";
                items += '<CD_MATERIAL>' + material + '</CD_MATERIAL>\n';
                items += '<LOTE>' + lote + '</LOTE>\n';
                items += '<ID_ORDEN>' + orden + '</ID_ORDEN>\n';
                items += '<CANTIDAD>' + cantidad + '</CANTIDAD>\n';
                items += '<CANASTILLA>' + canastilla + '</CANASTILLA>\n';
                items += '<CANASTILLA_PID>' + canastilla_pid + '</CANASTILLA_PID>\n';
                items += '<CANASTILLA_DET_ID>' + canastilla_det_id + '</CANASTILLA_DET_ID>\n';
                items += '<PEDIDO>' + pedido + '</PEDIDO>\n';
                items += '<POSICION>' + posicion + '</POSICION>\n';
                items += "</Row>\n";
            }
            if (error == ERROR_CTD) {
                MessageBox.error("Debes ingresar una CANTIDAD válida");
                return;
            }
            if (error === ERROR_FLOAT || error === ERROR_NEGATIVO) {
                MessageBox.error("Solo se permiten cantidades ENTERAS");
                return;
            }
            items += "</Rowset>\n";
            items += "</Rowsets>\n";
            // TEMP 
            planta = 'IN01';
            var oData = {
                "CD_PLANTA": planta,
                "CODIGO": codigo,
                "ITEMS": items,
                "USUARIO": usuario
            };
            //var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/CanastillaDetalle_Agregar";
            var path = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/VigaDetalle_Agregar";
            var postEx = "AGREGAR_ITEMS_ANODIZADO"
            this._ejecutarTransaccion(oData, path, postEx);
        },
        recuperarDetalleViga: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var codigo = this.byId("inp_viga").getValue();
            // TEMP
            planta = 'IN01';
            var oData = {
                "CD_PLANTA": planta,
                "CODIGO": codigo,
                "USUARIO": usuario
            };
            //   var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/CanastillaDetalle_Obtener";
            var path = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/VigaDetalle_Obtener";
            var tabla_detalle = "tbl_detalle_viga";
            var nombre_detalle = "Items";
            this._base_onloadTable(tabla_detalle, oData, path, nombre_detalle, "");
        },
        onEliminarRegistrosAnodizado: function () {
            var tbl_items = this.byId("tbl_detalle_viga").getSelectedItems();
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
                id = elemento.getBindingContext().getProperty("ID");
                items += "<Row>\n";
                items += '<ID>' + id + '</ID>\n';
                items += "</Row>\n";
            }
            items += "</Rowset>\n";
            items += "</Rowsets>\n";
            var path = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/VigaDetalle_Eliminar";
            var oData = {
                "ITEMS": items
            };
            var message = "¿Confirmar eliminación?";
            var postEx = "POST_DELETE_ITEM_ANODIZADO";
            this.confirmarAccion(oData, path, message, postEx);
        },
        enlistarDeclaracionesAnodizado: function () {
            var orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var oData = {
                "ORDER": orden,
                "CD_PUESTO": puesto
            }
            var path = "MIIExtensions/SFC/Transaction/get_pending_notification_Anodizado";
            var tabla = "tbl_VigasAnodizado";
            var nombre = "CPS";
            this._base_onloadTable(tabla, oData, path, nombre, "");
        },
        cancelarDeclAnodizado: function () {
            this.byId("dlg_DeclararAnodizado").destroy();
        },
        limpiarFragmentoViga: function () {
            this.byId("inp_viga").setValue("");
            this.byId("inp_accion").setValue("");
            var tbl_cabecera = this.byId("tbl_vigas");
            var tbl_detalle = this.byId("tbl_detalle_viga");
            var modeloInicial = new sap.ui.model.json.JSONModel();
            modeloInicial.setData({});
            tbl_cabecera.setModel(modeloInicial);
            tbl_detalle.setModel(modeloInicial);
        },
        recuperarVigaSimple: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var codigo = this.byId("inp_viga").getValue();
            var oData = {
                "CD_PLANTA": planta,
                "CODIGO": codigo,
                "USUARIO": usuario
            };
            var path_cabecera = "MII/DatosTransaccionales/Produccion/Vigas/Transaction/Viga_Obtener";
            var tabla_cabecera = "tbl_vigas";
            var nombre_cabecera = "Vigas";
            this._base_onloadTable(tabla_cabecera, oData, path_cabecera, nombre_cabecera, "");
        },
        mostrarCaracteristicasItem: function (oEvent) {
            var material = oEvent.getSource().getParent().getBindingContext().getProperty("CD_MATERIAL");
            var lote = oEvent.getSource().getParent().getBindingContext().getProperty("LOTE");
            var oData = {
                "MATERIAL": material,
                "LOTE": lote
            };
            var oView = this.getView();
            var oThis = this;
            if (!this.byId("idCharsDialog")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PantallaOperador.Anodizado.CaracteristicasItem",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.enlistarCaracteristicasItems(oData);
                });
            } else {
                this.byId("idCharsDialog").open();
                this.enlistarCaracteristicasItems(oData);
            }
        },
        enlistarCaracteristicasItems: function (oData) {
            var tabla = "idCharsDialog";
            var path = "MII/DatosTransaccionales/Produccion/Anodizado/Transaction/ItemsChars_Lista";
            var name = "Caracteristicas"
            this._base_onloadTable(tabla, oData, path, name, "");
        },
        filtroCaracteristicas: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter({
                filters: [
                    new Filter("NOMBRE", sap.ui.model.FilterOperator.Contains, sValue)
                ]
            });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
        verificarCantidadAnodizado: function (oEvent) {
            var cantidad = oEvent.getSource().getValue();
            var cantidad_original = oEvent.getSource().getParent().getParent().getBindingContext().getProperty("CANTIDAD_ORIGINAL");
            if (+cantidad > +cantidad_original) {
                MessageBox.error("No se puede ingresar una cantidad mayor");
                oEvent.getSource().setValue("0");
            }
        },
        verificarCantidadGen: function (oEvent) {
            var cantidad = oEvent.getSource().getValue();
            var cantidad_original = oEvent.getSource().getParent().getBindingContext().getProperty("CANTIDAD_ORIGINAL");
            if (+cantidad > +cantidad_original) {
                MessageBox.error("No se puede ingresar una cantidad mayor");
                oEvent.getSource().setValue("0");
            }
        },
        mostrarFragmentoDeclaracionAnodizado: function () {
            var oView = this.getView();
            var oThis = this;
            var WORK_CENTER = this._oInput.getSelectedKey();
            var oitems_order = oView.byId('OrdersList').getSelectedItems();
            var order = '';
            oitems_order.forEach(function (item) {
                order = item.getCells()[0].getText();
            });
            var w_centro = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var w_puesto_trabajo = WORK_CENTER;
            var lote = "IND999999";
            var cantidad = 9999999;
            var w_seguir = 1;
            var w_canasta_activa_en_puesto = 0;
            var atributosModelo = {
                "ORDEN": order
            };
            this.asignarModelo_canasta_activa(atributosModelo);
            /*
            if (this.getView().getModel("Modelo_CANASTA_ANODIZADO") === undefined) {
                w_seguir = 0;
            } else {
                w_canasta_activa_en_puesto = this.getView().getModel("Modelo_CANASTA_ANODIZADO").getProperty("/CANASTA_ACTIVA");
                if (1 * w_canasta_activa_en_puesto == 0) {
                    w_seguir = 0;
                }
            }
            if (!w_seguir) {
                return
            }
            */
            this.asignarModelo_chars(atributosModelo);
            if (this.getView().getModel("ModeloChar_ANODIZADO") === undefined) {
                w_seguir = 0;
            }
            if (!w_seguir) {
                return
            }
            var tbl_componente = this.byId("OrdersList").getSelectedItem();
            if (tbl_componente === null) {
                MessageBox.error("Debe seleccionar una orden activa");
                return;
            }
            if (!this.byId("dlg_inventarioPuesto")) {
                //debugger
                if (this.byId("cantidad_input00") !== undefined) this.byId("cantidad_input00").destroy();
                if (this.byId("TC_NRO_CANASTA") !== undefined) this.byId("TC_NRO_CANASTA").destroy();
                if (this.byId("NotificationComponent_List") !== undefined) this.byId("NotificationComponent_List").destroy();
                //if (this.byId("label_nro_canasta") !== undefined) this.byId("label_nro_canasta").destroy();
                if (this.byId("TC_PB") !== undefined) this.byId("TC_PB").destroy();
                if (this.byId("TC_PM") !== undefined) this.byId("TC_PM").destroy();
                if (this.byId("TC_PT") !== undefined) this.byId("TC_PT").destroy();
                if (this.byId("cantidad_input01") !== undefined) this.byId("cantidad_input01").destroy();
                if (this.byId("cantidad_input02") !== undefined) this.byId("cantidad_input02").destroy();
                if (this.byId("defecto_texto") !== undefined) this.byId("defecto_texto").destroy();
                if (this.byId("defecto_c1") !== undefined) this.byId("defecto_c1").destroy();
                if (this.byId("defecto_c2") !== undefined) this.byId("defecto_c2").destroy();
                if (this.byId("defecto_c3") !== undefined) this.byId("defecto_c3").destroy();
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PantallaOperador.Anodizado.Declarar",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    oThis.enlistarDeclaracionesAnodizado();
                    oThis.open_onDeclarar_anodizado(WORK_CENTER, lote, cantidad);
                });
            } else {
                //debugger
                this.byId("dlg_inventarioPuesto").open();
                this.enlistarDeclaracionesAnodizado();
                this.open_onDeclarar_anodizado(WORK_CENTER, lote, cantidad);
            }
        },
        asignarModelo: function (atributosModelo) {
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            if (this.getView().getModel("ModeloAnodizado") === undefined) {
                var oModel = new sap.ui.model.json.JSONModel({
                    ORDEN_FABRICA: "",
                    COMP_PEDIDO: "",
                    COMP_POS: "",
                    MATERIAL: "",
                    ALMACEN: "",
                    ACABADO: ""
                });
                this.getView().setModel(oModel, "ModeloAnodizado");
            }
            var oData = {
                "ORDER": atributosModelo.ORDEN,
                "OPERATION": puesto,
                "WORK_CENTER": puesto
            };
            var rows_caracteristicas_of_orden_pp = [{
                "SHOP_ORDER": "ERROR"
            }];
            rows_caracteristicas_of_orden_pp = this.get_rows_chars_of_orden_pp(oData);
            var acabado = rows_caracteristicas_of_orden_pp.find(i => i.CHARACTERISTIC_NAME === "ZCT_ACABADO");
            acabado = acabado === undefined ? acabado : acabado.CHARACTERISTIC_VALUE;
            if (acabado === undefined) {
                MessageBox.error("La orden no cuenta con característica de ACABADO");
                return;
            }
            this.getView().getModel("ModeloAnodizado").setProperty("/ORDEN_FABRICA", atributosModelo.ORDEN);
            this.getView().getModel("ModeloAnodizado").setProperty("/COMP_PEDIDO", atributosModelo.COMP_PEDIDO);
            this.getView().getModel("ModeloAnodizado").setProperty("/COMP_POS", atributosModelo.COMP_POS);
            this.getView().getModel("ModeloAnodizado").setProperty("/MATERIAL", atributosModelo.MATERIAL);
            this.getView().getModel("ModeloAnodizado").setProperty("/ALMACEN", atributosModelo.ALMACEN);
            this.getView().getModel("ModeloAnodizado").setProperty("/ACABADO", acabado);
            this.limpiarFragmentoViga()
        },
        asignarModelo_canasta_activa: function (atributosModelo) {
            var oView = this.getView();
            var oThis = this;
            var w_puesto_trabajo = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var w_canasta = "0";
            if (this.getView().getModel("Modelo_CANASTA_ANODIZADO") === undefined) {
                var oModel = new sap.ui.model.json.JSONModel({
                    CANASTA_ACTIVA: "0"
                });
                this.getView().setModel(oModel, "Modelo_CANASTA_ANODIZADO");
            } else {
                this.getView().getModel("Modelo_CANASTA_ANODIZADO").setProperty("/CANASTA_ACTIVA", w_canasta);
            }
            var oData_Canasta = {
                "WORK_CENTER": w_puesto_trabajo
            };
            /*
            var w_trx = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/canasta_activa_en_puesto";
            w_canasta = oThis.row_find_canasta_activa_in_puesto(oData_Canasta, w_trx);
            this.getView().getModel("Modelo_CANASTA_ANODIZADO").setProperty("/CANASTA_ACTIVA", w_canasta);
            if (w_canasta == "0") {
                this.handleWarningMessageBoxPress("Puesto de Trabajo no cuenta con Canasta [Fijada]");
            }
            */ //JERO ANODIZADO CANASTA
        },
        asignarModelo_chars: function (atributosModelo) {
            var oView = this.getView();
            var oThis = this;
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            if (this.getView().getModel("ModeloChar_ANODIZADO") === undefined) {
                var oModel = new sap.ui.model.json.JSONModel({
                    ZCT_ACABADO: "",
                    ZCT_DIAMETRO_BILLET_PULGADAS: 0,
                    ZCT_LONGITUD_LINGOTE_PLG: 0,
                    ZCT_LONGITUD_PERFIL_M: 0,
                    ZCT_PESO_PIEZA: 0,
                    CANASTA_ACTIVA: 0
                });
                this.getView().setModel(oModel, "ModeloChar_ANODIZADO");
            }
            var oData = {
                "ORDER": atributosModelo.ORDEN,
                "OPERATION": puesto,
                "WORK_CENTER": puesto
            };
            var rows_caracteristicas_of_orden_pp = [{
                "SHOP_ORDER": "ERROR"
            }];
            rows_caracteristicas_of_orden_pp = this.get_rows_chars_of_orden_pp(oData);
            var acabado = rows_caracteristicas_of_orden_pp.find(i => i.CHARACTERISTIC_NAME === "ZCT_ACABADO");
            acabado = acabado === undefined ? acabado : acabado.CHARACTERISTIC_VALUE;
            if (acabado === undefined) {
                MessageBox.error("La orden no cuenta con característica de ACABADO");
                return;
            }
            var w_ZCT_PESO_PIEZA = rows_caracteristicas_of_orden_pp.find(i => i.CHARACTERISTIC_NAME === "ZCT_PESO_PIEZA");
            w_ZCT_PESO_PIEZA = w_ZCT_PESO_PIEZA === undefined ? w_ZCT_PESO_PIEZA : w_ZCT_PESO_PIEZA.CHARACTERISTIC_VALUE;
            if (w_ZCT_PESO_PIEZA === undefined) {
                MessageBox.error("La orden no cuenta con característica de PESO_PIEZA");
                return;
            } else {
                var w_dato = w_ZCT_PESO_PIEZA;
                w_dato = w_dato.replace("kg", "");
                w_dato = w_dato.replace(" ", "");
                w_ZCT_PESO_PIEZA = w_dato * 1;
            }
            this.getView().getModel("ModeloChar_ANODIZADO").setProperty("/ZCT_ACABADO", acabado);
            this.getView().getModel("ModeloChar_ANODIZADO").setProperty("/ZCT_PESO_PIEZA", w_ZCT_PESO_PIEZA);
        },

        validarCantidadAnodizado: function (oEvent) {
            var input = oEvent.getSource()
            var cantidad = input.getValue();
            var cantidad_original = input.getParent().getBindingContext().getProperty("CANTIDAD_ORIGINAL");
            if (cantidad.trim() === "") {
                return;
            }
            if (+cantidad > +cantidad_original) {
                input.setValue("");
                return;
            }
            var w_isnumber = this.isNumber(cantidad);
            if (!w_isnumber) {
                input.setValue("");
            }
            this.data_sum_TC(input);
        },

        validarGrupo: function (oEvent) {
            var elemento = "";
            var estado = oEvent.getParameters().selected;
            if (oEvent.getParameters().listItem.getBindingContext() !== undefined) {
                var viga = oEvent.getParameters().listItem.getBindingContext().getProperty("VIGA")
                var tbl = this.byId("tbl_VigasAnodizado")
                for (var i = 0; i < tbl.getItems().length; i++) {
                    elemento = tbl.getItems()[i].getBindingContext() === undefined ? "NA" : tbl.getItems()[i].getBindingContext().getProperty("VIGA");
                    if (elemento === viga) {
                        tbl.getItems()[i].setSelected(estado);
                    }
                }
            } else { }
            this.data_sum_TC_resumen();
        },

        declararAnodizado: function () {
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
            var tbl_items = this.byId("tbl_VigasAnodizado").getSelectedItems();
            var id = "";
            var viga_pid = "";
            var orden = "";
            var lote = "";
            var elemento;
            var cantidad = "";
            var cantidad_original = "";
            var material = "";
            var padre;
            var token;
            var errores = false;
            var sw_buenas = 0;
            var sw_malas = 0;
            //debugger
            var items = "";
            var g_xml_x531 = "";
            var xml_x101 = "";
            //debugger
            var exe_validar_malas = this.validar_tb_malas();
            //debugger
            sw_malas = exe_validar_malas.OK;
            //debugger
            if (!sw_malas) {
                return;
            } else {
                g_xml_x531 = exe_validar_malas.XML;
            }
            //debugger
            var w_cantidad_x1 = 0;
            var w_material_x101 = "";
            var w_order_format = "";
            if (tbl_items.length === 0) {
                if (sw_malas) { // 20231204
                } else {
                    MessageBox.error("Debes seleccionar AL MENOS un registro")
                }
                sw_buenas = 0;
            } else {
                items = '<Rowsets>\n';
                items += '<Rowset>\n';
                for (var i = 0; i < tbl_items.length; i++) {
                    elemento = tbl_items[i];
                    id = elemento.getBindingContext().getProperty("VIGA");
                    viga_pid = elemento.getBindingContext().getProperty("VIGA_PID");
                    orden = elemento.getBindingContext().getProperty("NUM_ORDER");
                    lote = elemento.getBindingContext().getProperty("BATCH");
                    cantidad = elemento.getBindingContext().getProperty("CANTIDAD_NOTIFICAR");
                    cantidad_original = elemento.getBindingContext().getProperty("CANTIDAD_ORIGINAL");
                    material = elemento.getBindingContext().getProperty("MATERIAL");
                    padre = elemento.getBindingContext().getProperty("ROLLO_MASTER");
                    token = elemento.getBindingContext().getProperty("TOKEN_INSTALACION");
                    w_order_format = orden.toString().padStart(12, '0');
                    items += "<Row>\n";
                    items += '<VIGA>' + id + '</VIGA>\n';
                    items += '<VIGA_PID>' + viga_pid + '</VIGA_PID>\n';
                    items += '<ORDEN>' + orden + '</ORDEN>\n';
                    items += '<LOTE>' + lote + '</LOTE>\n';
                    items += '<PADRE>' + padre + '</PADRE>\n';
                    items += '<CANTIDAD_CONSUMO>' + cantidad_original + '</CANTIDAD_CONSUMO>\n';
                    items += '<CANTIDAD_NOTIFICAR>' + cantidad + '</CANTIDAD_NOTIFICAR>\n';
                    items += '<MATERIAL>' + material + '</MATERIAL>\n';
                    items += '<TOKEN>' + token + '</TOKEN>\n';
                    items += "</Row>\n";
                    if (cantidad.trim() === "" || isNaN(cantidad)) {
                        errores = true;
                    }
                }
                items += "</Rowset>\n";
                items += "</Rowsets>\n";
                console.log(" items ---> ");
                console.log(items);
                if (errores) {
                    sw_buenas = 0;
                    MessageBox.error("Debe validar las cantidades escritas");
                    return;
                } else {
                    sw_buenas = 1;
                    var xml_completo = '<Rowsets>\n';
                    xml_completo += '<Rowset>\n';
                    for (var i = 0; i < tbl_items.length; i++) {
                        elemento = tbl_items[i];
                        orden = elemento.getBindingContext().getProperty("NUM_ORDER");
                        w_order_format = orden.toString().padStart(12, '0');
                        w_material_x101 = elemento.getBindingContext().getProperty("MATERIAL");
                        w_cantidad_x1 = elemento.getBindingContext().getProperty("CANTIDAD_NOTIFICAR");
                        lote = elemento.getBindingContext().getProperty("BATCH");
                        xml_completo += '<Row>\n';
                        xml_completo += '<ID_ORDEN>' + w_order_format + '</ID_ORDEN>\n';
                        xml_completo += '<CD_MATERIAL>' + w_material_x101 + '</CD_MATERIAL>\n';
                        xml_completo += '<LOTE>' + lote + '</LOTE>\n';
                        xml_completo += '<CANTIDAD>' + w_cantidad_x1 + '</CANTIDAD>\n';
                        xml_completo += "</Row>\n";
                    }
                    xml_completo += "</Rowset>\n";
                    xml_completo += "</Rowsets>\n";
                    xml_x101 = xml_completo;
                }
            }
            //debugger
            if (sw_buenas) {
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "ITEMS": items,
                    "USUARIO": usuario
                };
                var w_canasta_activa_en_puesto = this.getView().getModel("Modelo_CANASTA_ANODIZADO").getProperty("/CANASTA_ACTIVA");
                var oData_add_items_canasta = {
                    "SW_NO_STOCK": true,
                    "CD_PLANTA": planta,
                    "CODIGO": w_canasta_activa_en_puesto,
                    "ITEMS": items,
                    "USUARIO": usuario
                };
                /*
                var path = "MII/DatosTransaccionales/Produccion/Anodizado/Transaction/Anodizado_Declarar";
                var postEx = "DECLARAR_ANODIZADO"
                var message = "Confirmar declaración"
                this.confirmarAccion(oData, path, message, postEx)
                */
                var sw_add_canasta = false;
                var w_trx = "MII/DatosTransaccionales/Produccion/Anodizado/Transaction/Anodizado_Declarar";
                //debugger
                var m101 = this.declararSFC___return_sw(oData, w_trx);
                //debugger
                if (m101 == false) {
                    sw_malas = false;
                } else {
                    w_trx = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/CanastillaDetalle_Agregar";
                    //debugger
                    //sw_add_canasta = this.declararSFC___return_sw(oData_add_items_canasta, w_trx); //JERO CANASTA-ANODIZADO
                    //debugger
                }
            }
            if (sw_malas) {
                var oData_X531 = {
                    "NOTIFICATION_TYPE": 1,
                    "XML_531": g_xml_x531
                };
                var w_trx = "MIIExtensions/SFC/Transaction/notification_531_v1";
                var m531 = this.declararSFC___return_sw(oData_X531, w_trx);
                if (m531 == false) { } else {
                    this.cancelarDeclAnodizado();
                }
            }
        },



    };
});