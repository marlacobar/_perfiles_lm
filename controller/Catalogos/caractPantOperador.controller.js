sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "sap/ui/demo/webapp/model/formatter",
    'sap/m/SearchField',
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/Fragment",
    'sap/ui/core/util/Export',
    'sap/ui/export/Spreadsheet',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/m/Token',
], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, formatter,
    SearchField, JSONModel, Fragment, Export, Spreadsheet, ExportTypeCSV, Token) {
    "use strict";

    let idUs;

    return BaseController.extend("sap.ui.demo.webapp.controller.Catalogos.caractPantOperador", {

        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("caractPantOperador").attachMatched(this._onRouteMatched, this);
            this.getWC("username");
            this._base_onloadCOMBO("cmb_caracteristica", "", "MII/DatosMaestros/Transaction/get_caracteristicas", "", "Caracteristicas");
            //this._base_onloadTable("Table_areas", {}, "MII/DatosTransaccionales/Paros/Transaction/sel_areas_tabla_1_CEMH", "ÁREAS", "");
        },

        _onRouteMatched: function () {
            //this._getUsuario("username");
        },

        getWC: function (id) {
            var oThis = this;

            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var nombre = $(xml).find('Profile').attr('firstname');
                    var apellido = $(xml).find('Profile').attr('lastname');
                    idUs = $(xml).find('Profile').attr('uniquename');
                    idUs = idUs.toUpperCase();
                    oThis.byId(id).setText(nombre + ' ' + apellido);
                    var oData = {
                        "USER": idUs
                    };
                    oThis._base_onloadCOMBO("ListEstacion", oData, "MIIExtensions/Operation/Transaction/get_operations_with_prefix", "", "Centros");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        onAgregarCaracteristica: function () {

            let oView = this.getView();
            let path = "MII/DatosMaestros/Transaction/ins_caracteristicas_PantOperador";
            let WORK_CENTER, CODIGO;
            let funciones;

            WORK_CENTER = oView.byId("ListEstacion").getSelectedKey();
            CODIGO = oView.byId("cmb_caracteristica").getSelectedKey();

            let oData = {
                "WORK_CENTER": WORK_CENTER,
                "CODIGO": CODIGO
            };

            funciones = ["oThis.limpiaCampos();", "oThis.onChangeWC();"];

            this.llamadoTransaccion(oData, path, funciones);

        },

        llamadoTransaccion(oData, path, funciones) {
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');

            sap.ui.core.BusyIndicator.show(0);
            var oThis = this;

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
                            oThis.getOwnerComponent().openHelloDialog(aData[0].ERROR);
                        }
                        else {
                            MessageToast.show(aData[0].MESSAGE);

                            if (funciones.length > 0) {
                                for (let i = 0; i < funciones.length; i++) {
                                    eval(funciones[i]);
                                }
                            }

                        }
                    }
                    else {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: �Hay conexi�n de red?");
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

        limpiaCampos: function () {

            //this.byId("ListEstacion").setSelectedKey("");
            this.byId("cmb_caracteristica").setSelectedKey("");
        },

        onChangeWC: function () {

            let work_center = this.byId("ListEstacion").getSelectedKey();

            let oData = {
                "WORK_CENTER": work_center
            }

            this._base_onloadTable("Table_caracteristicas", oData, "MII/DatosMaestros/Transaction/sel_caracteristicas_PantOperador", "Caracteristicas", "");

        },

        onMoverArriba: function (oEvent) {

            let oThis = this;
            let oView = this.getView();
            let oModel = oView.byId("Table_caracteristicas").getModel();
            let oData = oModel.getData();
            let longitud = oData.ITEMS.length - 1;

            let oItem = oEvent.getSource().getParent();
            let oTable = oItem.getParent();
            let oIndex = oTable.indexOfItem(oItem);

            if (oIndex == 0) {
                oThis.getOwnerComponent().openHelloDialog("No se puede subir la primer caracteristica");
                return;
            }

            let temporal = oData.ITEMS[oIndex];

            oData.ITEMS[oIndex] = oData.ITEMS[oIndex - 1];
            oData.ITEMS[oIndex - 1] = temporal

            oModel.setData(oData);

        },

        onMoverAbajo: function (oEvent) {

            let oThis = this;
            let oView = this.getView();
            let oModel = oView.byId("Table_caracteristicas").getModel();
            let oData = oModel.getData();
            let longitud = oData.ITEMS.length - 1;

            let oItem = oEvent.getSource().getParent();
            let oTable = oItem.getParent();
            let oIndex = oTable.indexOfItem(oItem);

            if (oIndex == longitud) {
                oThis.getOwnerComponent().openHelloDialog("No se puede bajar la ultima caracteristica");
                return;
            }

            let temporal = oData.ITEMS[oIndex];

            oData.ITEMS[oIndex] = oData.ITEMS[oIndex + 1];
            oData.ITEMS[oIndex + 1] = temporal

            oModel.setData(oData);

        },

        onEliminarCaracteristica: function (oEvent) {

            let oThis = this;
            let oView = this.getView();
            let oModel = oView.byId("Table_caracteristicas").getModel();
            let oData = oModel.getData();
            let longitud = oData.ITEMS.length - 1;

            let oItem = oEvent.getSource().getParent();
            let oTable = oItem.getParent();
            let oIndex = oTable.indexOfItem(oItem);

            oData.ITEMS.splice(oIndex, 1);
            oModel.setData(oData);

        },

        onGuardarSecuencia: function () {

            let oThis = this;
            let oView = this.getView();
            let oModel = oView.byId("Table_caracteristicas").getModel();
            let xData = oModel.getJSON();
            let funciones = '';

            let oData = {
                "TABLA": xData
            };

            //funciones = ["oThis.onChangeWC();"];
            let path = "MII/DatosMaestros/Transaction/guardar_secuencia_caracteristicas";

            this.llamadoTransaccion(oData, path, funciones);

        },

        onBorrarSupervisor: function (oEvent) {

            let oItem, oBindingContext, oBindingObject, row, row_pressed, num_array;
            oItem = oEvent.getSource();
            oBindingContext = oItem.getBindingContext();
            oBindingObject = oBindingContext.getObject();
            //row_pressed = oEvent.getSource().sId;
            //num_array = row_pressed.match(/(\d+)(?!.*\d)/g);
            //oCtx.oModel.oData.ITEMS[num_array[0]].ID;              

            let id;

            id = oBindingObject.ID;

            let oData = {
                "ID": oBindingObject.ID
            };

            let funciones = ["oThis.onChangeWC();"];
            let path = "MII/DatosMaestros/Transaction/del_supervisor_prod";

            this.llamadoTransaccion(oData, path, funciones);

        },


    });
});