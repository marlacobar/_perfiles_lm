sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "sap/ui/demo/webapp/model/formatter",
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/util/Export',
    'sap/ui/export/Spreadsheet',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/m/Token',
], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, formatter,
    JSONModel, Export, Spreadsheet, ExportTypeCSV, Token) {
    "use strict";

    return BaseController.extend("sap.ui.demo.webapp.controller.Administracion.Contenedor.AdminContenedor", {
        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("AdminContenedor").attachMatched(this._onRouteMatched, this);

            this._base_onloadCOMBO("cbFilterWorkCenter", null, "MII/DatosTransaccionales/Administracion/Contenedor/Transaction/get_work_center_by_site", "", "Puestos");
            this._base_onloadCOMBO("cbWorkCenter", null, "MII/DatosTransaccionales/Administracion/Contenedor/Transaction/get_work_center_by_site", "", "Puestos");

        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username", "adminContenedor");
        },

        onLoadActualData: function () {
            const oWorkCenters = this.byId("cbWorkCenter").getModel().getData(),
                sSelectedWC = this.byId("cbFilterWorkCenter").getSelectedKey(),
                sContenedor = this.byId("inpFilterContenedor").getValue(),
                sProveedor = this.byId("inpFilterProveedor").getValue(),
                bWorkCenterExists = oWorkCenters.filter((wc) => wc.WORK_CENTER == sSelectedWC).length > 0,
                oParams = {
                    WORK_CENTER: sSelectedWC,
                    CONTENEDOR: sContenedor,
                    PROVEEDOR: sProveedor
                };

            if (sSelectedWC == "" || !bWorkCenterExists) {
                MessageToast.show("Favor de seleccionar un puesto de trabajo");
                return;
            }

            // Iguala combo de creación al combo del filtro
            this.byId("cbWorkCenter").setSelectedKey(sSelectedWC);

            this._base_onloadTable("tbContenedor", oParams, "MII/DatosTransaccionales/Administracion/Contenedor/Transaction/get_containers_by_wc", "Contenedores", "");
            this._base_onloadTable("tbHistorico", oParams, "MII/DatosTransaccionales/Administracion/Contenedor/Transaction/get_hist_containers_by_wc", "Histórico", "");
        },

        onSaveContenedor: function () {
            const oThis = this,
                oWorkCenters = this.byId("cbWorkCenter").getModel().getData(),
                sSelectedWC = this.byId("cbWorkCenter").getSelectedKey(),
                sContenedor = this.byId("inpContenedor").getValue(),
                sTara = this.byId("inpTara").getValue(),
                sProveedor = this.byId("inpProveedor").getValue(),
                sUsername = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO"),
                bWorkCenterExists = oWorkCenters.filter((wc) => wc.WORK_CENTER == sSelectedWC).length > 0;

            // Valida el puesto con datos
            if (sSelectedWC == '') {
                MessageToast.show("Seleccionar una estación de trabajo");
                return;
            }

            // Valida que el puesto exista en el listado
            if (!bWorkCenterExists) {
                MessageToast.show("La estación de trabajo seleccionada no existe");
                return;
            }

            // Valida inputs con datos
            if (sContenedor == '' || sTara == '' || sProveedor == '') {
                MessageToast.show("Ingresar " + (sContenedor == '' ? 'Contenedor' : sTara == '' ? 'Tara' : 'Proveedor'));
                return;
            }

            let oParams = {
                CONTENEDOR: sContenedor,
                WORK_CENTER: sSelectedWC,
                TARA: sTara,
                PROVEEDOR: sProveedor,
                USERNAME: sUsername
            };

            // Guardar Contenedor
            oThis._execTransaction(oParams, "MII/DatosTransaccionales/Administracion/Contenedor/Transaction/ins_container", null, this.getView(), function (oResponse) {
                // Limpiar Campos
                oThis.byId("inpContenedor").setValue('');
                oThis.byId("inpTara").setValue('');
                oThis.byId("inpProveedor").setValue('');

                oThis.onLoadActualData();
            });
        },

        onSaveChanges: function (oEvent) {
            const oThis = this,
                oView = this.getView(),
                oItem = oEvent.getSource().getParent(),
                sContenedor = oItem.getCells()[1].getValue(),
                sWorkCenter = oItem.getCells()[2].getValue(),
                sTara = oItem.getCells()[3].getValue(),
                sProveedor = oItem.getCells()[4].getValue(),
                sUsername = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");

            // Valida el puesto con datos
            if (sWorkCenter == '') {
                MessageToast.show("La estación de trabajo está vacía, favor de recargar los datos");
                return;
            }

            // Valida el contenedor con datos
            if (sContenedor == '') {
                MessageToast.show("El contenedor está vacío, favor de recargar los datos");
                return;
            }

            // Valida inputs con datos
            if (sTara == '' || sProveedor == '') {
                MessageToast.show("Ingresar " + (sTara == '' ? 'Tara' : 'Proveedor'));
                return;
            }

            let oParams = {
                CONTENEDOR: sContenedor,
                WORK_CENTER: sWorkCenter,
                TARA: sTara,
                PROVEEDOR: sProveedor,
                USERNAME: sUsername
            };

            oThis._execTransaction(oParams, "MII/DatosTransaccionales/Administracion/Contenedor/Transaction/ins_container", null, oView, function (oResponse) {
                // Limpiar Campos
                oThis.byId("inpContenedor").setValue('');
                oThis.byId("inpTara").setValue('');
                oThis.byId("inpProveedor").setValue('');

                oThis.onLoadActualData();
            });
        },

        onDeleteContainer: function (oEvent) {
            const oThis = this,
                oView = this.getView(),
                oItem = oEvent.getSource().getParent(),
                sIdReg = oItem.getCells()[0].getProperty('text'),
                sContenedor = oItem.getCells()[1].getValue(),
                sUsername = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");

            let oParams = {
                ID_REG: sIdReg,
                CONTENDOR: sContenedor,
                USERNAME: sUsername
            };

            oThis._execTransaction(oParams, "MII/DatosTransaccionales/Administracion/Contenedor/Transaction/upd_inactive_container", null, oView, function (oResponse) {
                oThis.onLoadActualData();
            });
        },

        onSearchHistorico: function (oEvent) {
            console.log(oEvent.getSource());
        },

        onExport: function (sArchivo) {
            let aCols, aProducts, oSettings, oSheet,
                sSheetName = sArchivo === 'ACTUAL' ? 'ContenedoresActua' : 'ContenedoresHistorico';

            if (sArchivo == 'ACTUAL') {
                aCols = this.createColumnConfigActual();
                aProducts = this.getView().byId("tbContenedor").getModel().getProperty('/ITEMS');
            }
            else {
                aCols = this.createColumnConfigHist();
                aProducts = this.getView().byId("tbHistorico").getModel().getProperty('/ITEMS');
            }

            if (!aProducts) {
                MessageToast.show('No hay datos que exportar');
                return;
            }

            oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                        sheetName: sSheetName
                    }
                },
                dataSource: aProducts,
                fileName: `${sSheetName}.xlsx`
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show('Excel exportado');
                })
                .finally(function () {
                    oSheet.destroy();
                });
        },

        createColumnConfigActual: function () {
            return [{
                    label: 'Estación de Trabajo',
                    property: 'WORK_CENTER',
                    type: 'string',
                },
                {
                    label: 'Contenedor',
                    property: 'CONTENEDOR',
                    type: 'string',
                },
                {
                    label: 'Tara (Kg)',
                    property: 'TARA',
                    type: 'number',
                },
                {
                    label: 'Proveedor',
                    property: 'PROVEEDOR',
                    type: 'string'
                }
            ];
        },

        createColumnConfigHist: function () {
            return [{
                label: 'Estación de Trabajo',
                property: 'WORK_CENTER',
                type: 'string',
            }, {
                label: 'Contenedor',
                property: 'CONTENEDOR',
                type: 'string',
            }, {
                label: 'Tara Actual (Kg)',
                property: 'TARA',
                type: 'number',
            }, {
                label: 'Tara Anterior (Kg)',
                property: 'TARA_ANTERIOR',
                type: 'number',
            }, {
                label: 'Proveedor Actual',
                property: 'PROVEEDOR',
                type: 'string'
            }, {
                label: 'Proveedor Anterior',
                property: 'PROVEEDOR_ANTERIOR',
                type: 'string'
            }, {
                label: 'Usuario Modificó',
                property: 'USER_INS',
                type: 'string'
            }, {
                label: 'Fecha Modificó',
                property: 'FECHA_INS',
                type: 'string'
            }];
        },

        _execTransaction: function (oParams, sPath, oControl = null, oBusyControl = null, fCallback = null) {
            const oThis = this,
                oEmptyModel = new JSONModel(),
                sUri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") +
                "/XMII/Runner?Transaction=" + sPath + "&OutputParameter=JsonOutput&Content-Type=text/xml";

            if (oControl)
                oControl.setModel(oEmptyModel);

            if (oBusyControl)
                oBusyControl.setBusy(true);

            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: sUri,
                data: oParams
            }).done(function (xmlDOM) {
                let opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                if (opElement.firstChild !== null) {
                    let oResponse = eval(opElement.firstChild.data);
                    oResponse = oResponse[0];

                    if (oResponse.ERROR !== undefined) {
                        if (oResponse.ERROR !== "TRANSACTION EXECUTED OK")
                            MessageBox.error(oResponse.ERROR);
                    } else {
                        if (oResponse.MESSAGE)
                            MessageBox.information(oResponse.MESSAGE);
                        if (oResponse.TOAST)
                            MessageToast.show(oResponse.TOAST);
                        if (oControl) {
                            oControl.setModel(new JSONModel(oResponse));
                            oControl.getModel().setSizeLimit(10000);
                        }
                        if (fCallback)
                            fCallback(oResponse);
                    }
                } else {
                    MessageToast.show("No se han recibido datos");
                }
                if (oBusyControl)
                    oBusyControl.setBusy(false);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (oBusyControl)
                    oBusyControl.setBusy(false);
                if (console && console.log) {
                    MessageBox.error("La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?");
                }
            });
        },
    });
});