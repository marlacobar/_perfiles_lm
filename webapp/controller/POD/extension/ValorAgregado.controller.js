/**
 * Bayco Consulting : Proyecto Indalum SAP MII
 * 2023
 * Extension ValorAgregado.controller.js
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
        "sap/ui/Device",
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
        BusyIndicator,
        Device
    ) {
        "use strict";
        const TRX_CONFIRMAR = "CONFIRMAR";
        const CONFIRMA_INICIO_PROCESO = "CONFIRMA_INICIO_PROCESO";
        const CONFIRMA_FIN_PROCESO = "CONFIRMA_FIN_PROCESO";
        const IMPRESION_ETIQUETA_LOTE = "IMPRESION_ETIQUETA_LOTE";
        return {
            //<!--  Inicio Metodos Extension  -->

            //Inicio de proceso para amarre y valor agregado- Inicio de ordenes activas con relacion a canastas instaladas
            iniciarProcesoValorAgregado: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/ValorAgregado/Transaction/VA_Proceso_Iniciar";
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

            anularProcesoPrueba: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Temple_Proceso_Inicio_Anular";
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario
                };
                var postEx = CONFIRMA_INICIO_PROCESO;
                var message = "¿Confirmar Anulación de Inicio de proceso?";
                this.confirmarAccion(oData, path, message, postEx);
            },

            finalizarProcesoValorAgregado: function () {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var path = "MII/DatosTransaccionales/Produccion/ValorAgregado/Transaction/Proceso_Finalizar";
                var oData = {
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "USUARIO": usuario
                };
                var postEx = CONFIRMA_FIN_PROCESO;
                var message = "¿Confirmar Fin de proceso?";
                this.confirmarAccion(oData, path, message, postEx);
            },

            imprimirEtiquetaValorAgregado: function (params) {
                var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                var cantidad = params.cantidad;
                var id = params.id;
                var lote = params.lote;
                var material = params.material;
                var orden = params.orden;
                var um = params.um;
                var path = "MII/DatosTransaccionales/Produccion/ValorAgregado/Transaction/Etiqueta_Lote";
                var oData = {
                    "CANTIDAD": cantidad,
                    "CD_PLANTA": planta,
                    "CD_PUESTO": puesto,
                    "ID": id,
                    "LOTE": lote,
                    "MATERIAL": material,
                    "ORDEN": orden,
                    "UM": um,
                    "USUARIO": usuario
                }
                var postEx = IMPRESION_ETIQUETA_LOTE;
                this._ejecutarTransaccion(oData, path, postEx);
            },

            fnChange: function (oEvent) {
                var oItemPressed = oEvent.getParameter("itemPressed"),
                    sTargetSrc = oItemPressed.getTargetSrc();

                switch (sTargetSrc) {
                    case ("logoff"):
                        this.fnClose();
                        this.logoffPrincipal();
                        break;
                    case ("piso"):
                        this.fnClose();
                        this.onGotoMenuPiso();
                        break;
                }

                //MessageToast.show("Redirecting to " + sTargetSrc);

                // Open the targetSrc manually
                //URLHelper.redirect(sTargetSrc, true);
            },
            fnOpen: function (oEvent) {
                var oButton = this.getView().byId("pSwitchBtn");
                var oView = this.getView();
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.demo.webapp.fragment.ProductSwitchPopover",
                        controller: this
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        if (Device.system.phone) {
                            oPopover.setEndButton(new Button({ text: "Cerrar", type: "Reject", press: this.fnClose.bind(this) }));
                        }
                        return oPopover;
                    }.bind(this));
                }
                this._pPopover.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });
            },
            fnClose: function () {
                this._pPopover.then(function (oPopover) {
                    oPopover.close();
                });
            }

            // <!--  Fin Metodos Extension  -- >
        };
    }
);