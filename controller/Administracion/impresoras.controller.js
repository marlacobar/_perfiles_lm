sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    'sap/ui/export/Spreadsheet',
    'sap/ui/model/json/JSONModel',
    "sap/ui/demo/webapp/model/formatter",
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format',
    'sap/viz/ui5/data/FlattenedDataset',
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

], function (JQuery, BaseController, MessageToast, Fragment, MessageBox, Spreadsheet, JSONModel, formatter, ChartFormatter, Format, FlattenedDataset, Controller,
    Export, ExportTypeCSV, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("sap.ui.demo.webapp.controller.Administracion.impresoras", {
        islote: 0,
        formatter: formatter,

        onInit: function () {
            const oView = this.getView();
            if (!oView.getModel("ModeloPrincipal"))
                oView.setModel(new JSONModel({ PLANTA: "" }), "ModeloPrincipal")
            Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;
            var oRouter = this.getRouter();
            oRouter.getRoute("oImpresoras").attachMatched(this._onRouteMatched, this);

            // this._loadCombobox('MII/Integraciones/PCo/Administracion/tags_area', 'listTAGArea');
            // this._loadCombobox('MII/Integraciones/PCo/Administracion/tags_tipo_variable', 'listTAGTipoVar');
            // this._loadCombobox('MII/Integraciones/PCo/Administracion/tags_puesto_trabajo', 'listTAGPTrabajo');
            // this._loadCombobox('MII/Integraciones/PCo/Administracion/tags_id_tag', 'listTAGPCo');

        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._getUsuario("username", "idMantenedorImpresoras");
            this.centro = oArgs.planta;
            this.getView().getModel("ModeloPrincipal").setProperty("/PLANTA", this.centro)
        },
        _loadCombobox: function (_FullName, _ModelName) {
            let FullName = _FullName,
                ModelName = _ModelName,
                UUID = this.uuidv4();
            var that = this

            var oView = this.getView();


            var oModelFunc = new sap.ui.model.json.JSONModel();
            oModelFunc.setSizeLimit(10000);


            var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + FullName + "&Content-Type=text/json&UUID=" + UUID;

            var parameters = {};

            oModelFunc.loadData(url, parameters, true, "POST");
            oModelFunc.attachRequestCompleted(function (oController) {

                // IF Fatal Error input
                if (oModelFunc.getData().Rowsets.FatalError) {
                    MessageBox.error(oModelFunc.getData().Rowsets.FatalError);

                    return;
                } else {
                    let oDataRow = oModelFunc.oData.Rowsets.Rowset[0].Row;
                    oModelFunc.setData(oModelFunc.oData.Rowsets.Rowset[0].Row)
                    //
                    oView.setModel(oModelFunc, ModelName);

                    if (ModelName == "listTAGPTrabajo") {

                        var oModel = new JSONModel();
                        let variableList = []
                        let variable = []

                        for (variable of oDataRow) {
                            variableList.push({ "ProductId": variable.PUESTO_TRABAJO, "Name": variable.DESCRIPCION, "Category": variable.DESCRIPCION })
                        }

                        console.log(oModelFunc.oData);
                        oModel.setSizeLimit(10000);
                        //oModel.setData(variableList);
                        oModel.setProperty("/listPuestoTrabajo", oDataRow);

                        oView.setModel(oModel);

                    }

                    //     oView.setModel(oModelFunc.oData.Rowsets.Rowset[0].Row, "comboBoxPMHestado"); 
                }

            });

        },
        uuidv4: function () {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },

        onFilterSearchTags: function () {
            //  this.centro
            let PRN_ID = this.byId("iPRN_ID").getValue(),
                PRN_DESCRIPCION = this.byId("iPRN_DESCRIPCION").getValue(),
                FL_HABILITADO = this.byId("cFL_HABILITADO").getSelected() ? "X" : "",
                PRN_IP = this.byId("iPRN_IP").getValue(),
                PRN_PUERTO = this.byId("iPRN_PUERTO").getValue(),
                path = "MII/DatosTransaccionales/Administracion/Impresoras/impresoras_get",
                name = "TAGsPCo",
                model = "listaImpresorasMain";

            var param = {
                "Param.1": PRN_ID,
                "Param.2": PRN_DESCRIPCION,
                "Param.3": FL_HABILITADO,
                "Param.4": PRN_IP,
                "Param.5": PRN_PUERTO
            };

            this._onloadTable(model, param, path, name, "");
        },
        _onloadTable: function (_ModelName, _param, _FullName, name, stats_bar) {
            let FullName = _FullName,
                ModelName = _ModelName,
                param = _param,
                UUID = this.uuidv4();
            var oView = this.getView(),
                oModelFunc = new sap.ui.model.json.JSONModel();
            oModelFunc.setSizeLimit(10000);

            var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + FullName + "&Content-Type=text/json&UUID=" + UUID;

            oModelFunc.loadData(url, param, true, "POST");
            oModelFunc.attachRequestCompleted(function (oController) {

                // IF Fatal Error input
                if (oModelFunc.getData().Rowsets.FatalError) {
                    global.functions.onMessage("E", oModelFunc.getData().Rowsets.FatalError);
                    return;

                } else {

                    oView.setModel(oModelFunc, ModelName);

                }

            });
        },
        onExportHeader: function (oEvent) {

            var aCols, aProducts, oSettings, oSheet;

            var oView = this.getView();

            aCols = this.ColumnConfigExcel();
            aProducts = oView.byId("tbl_ImpresorasMII").getBinding("rows");
            oSettings = {
                workbook: {
                    columns: aCols,
                    context: { sheetName: 'Tags' }
                },
                dataSource: this.getView().getModel('listaImpresorasMain').oData.Rowsets.Rowset[0].Row,
                fileName: "RptoImpresorasMII.xlsx"
            };
            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show('Se ha exportado reporte');
                })
                .finally(function () {
                    oSheet.destroy();
                });
        },
        ColumnConfigExcel: function () {
            return [
                {
                    label: 'ID',
                    property: 'PRN_ID',
                    type: 'string',
                },
                {
                    label: 'Descripción',
                    property: 'PRN_DESCRIPCION',
                    type: 'string'
                }, {
                    label: 'Habilitado',
                    property: 'FL_HABILITADO',
                    type: 'string'
                }, {
                    label: 'IP',
                    property: 'PRN_IP',
                    type: 'string'
                },
                {
                    label: 'Puerto',
                    property: 'PRN_PUERTO',
                    type: 'string'
                }
            ];
        },
        handleCrearTag: function (oEvent) {
            var oThis = this,
                oData,
                oButton = oEvent.getSource(),
                oView = this.getView();
            //oPlantFilter = oThis.byId("planta_select_rol");

            if (!this._gDialog) {
                this._gDialog = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.Administracion.addImpresora",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._gDialog.then(function (oDialog) {

                this.dialogAgregarTags = oDialog;
                oDialog.open();
                // this._loadCombobox('MII/Integraciones/PCo/Administracion/tags_tipo_variable', 'comboBoxPOPTIPO_COD');
                // this._loadCombobox('MII/Integraciones/PCo/Administracion/tags_puesto_trabajo', 'comboBoxPOPARBPL');
                // this._loadCombobox('MII/Integraciones/PCo/Administracion/tags_area', 'comboBoxPOPAREA_ID');

            }.bind(this));
        },

        creaImpresora: function () {
            let PRN_ID = this.byId("ipPRN_ID").getValue(),
                PRN_DESCRIPCION = this.byId("ipPRN_DESCRIPCION").getValue(),
                FL_HABILITADO = this.byId("cpFL_HABILITADO").getSelected() ? "X" : "",
                PPRN_IP = this.byId("iPPRN_IP").getValue(),
                PRN_PUERTO = this.byId("ipPRN_PUERTO").getValue(),
                path = "MII/DatosTransaccionales/Administracion/Impresoras/impresoras_crea",
                message = "¿Confirmar creación?",
                postEx = "onCloseDialogAgregarTags";

            this.byId("ipPRN_ID").setEnabled(true);

            var param = {
                "Param.1": PRN_ID,
                "Param.2": PRN_DESCRIPCION,
                "Param.3": FL_HABILITADO,
                "Param.4": PPRN_IP,
                "Param.5": PRN_PUERTO
            };



            if (PRN_ID.trim() === "" || PRN_DESCRIPCION.trim() === "" || PPRN_IP.trim() === "" || PRN_PUERTO.trim() === "") {
                MessageBox.error("Todos los campos son requeridos");
                return;
            }
            this.confirmarAccion(param, path, message, postEx)
        },
        confirmarAccion: function (param, path, message, postEx) {
            let that = this;
            MessageBox["warning"](message, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        var oModelFunc = new sap.ui.model.json.JSONModel();
                        oModelFunc.setSizeLimit(10000);
                        // var FullName = "MII/Da";
                        var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + path + "&Content-Type=text/json&UUID=" + this.uuidv4();
                        oModelFunc.loadData(url, param, true, "POST");
                        oModelFunc.attachRequestCompleted(function (oController) {

                            // IF Fatal Error input
                            if (oModelFunc.getData().Rowsets.FatalError) {
                                MessageBox.error(oModelFunc.getData().Rowsets.FatalError);
                                return;
                            } else {
                                that.byId("ipPRN_ID").setValue(''),
                                    that.byId("ipPRN_DESCRIPCION").setValue(''),
                                    that.byId("cpFL_HABILITADO").setSelected(false),
                                    that.byId("iPPRN_IP").setValue(''),
                                    that.byId("ipPRN_PUERTO").setValue(''),
                                    that.onCloseDialog();
                                that.onFilterSearchTags();
                                MessageToast.show("Registro ingresado correctamente.");


                            }
                        })

                    }
                }.bind(this)
            });
        },
        onEditTag: function (oEvent) {

            var oThis = this,
                oData,
                oButton = oEvent.getSource(),
                oView = this.getView();
            //oPlantFilter = oThis.byId("planta_select_rol");

            if (!this._gDialogU) {
                this._gDialogU = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.Administracion.updateImpresora",
                    controller: this
                }).then(function (oDialogU) {
                    oView.addDependent(oDialogU);
                    return oDialogU;

                });
            }

            this._gDialogU.then(function (oDialogU) {

                this.dialogAgregarTagsU = oDialogU;
                oDialogU.open();
                let index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);
                let obj = oThis.getView().getModel("listaImpresorasMain").getData().Rowsets.Rowset[0].Row[index];

                this.byId("ipuPRN_ID").setEnabled(false);
                this.byId("ipuPRN_ID").setValue(obj.PRN_ID)
                this.byId("ipuPRN_DESCRIPCION").setValue(obj.PRN_DESCRIPCION)
                this.byId("cpuFL_HABILITADO").setSelected(obj.FL_HABILITADO == 'X' ? true : false)
                this.byId("ipuPRN_IP").setValue(obj.PRN_IP)
                this.byId("ipuPRN_PUERTO").setValue(obj.PRN_PUERTO)

            }.bind(this));




        },
        editImpresora: function () {
            let PRN_ID = this.byId("ipuPRN_ID").getValue(),
                PRN_DESCRIPCION = this.byId("ipuPRN_DESCRIPCION").getValue(),
                FL_HABILITADO = this.byId("cpuFL_HABILITADO").getSelected() ? "X" : "",
                PPRN_IP = this.byId("ipuPRN_IP").getValue(),
                PRN_PUERTO = this.byId("ipuPRN_PUERTO").getValue(),
                path = "MII/DatosTransaccionales/Administracion/Impresoras/impresoras_update",
                message = "¿Confirmar Modificación?",
                postEx = "onCloseDialogAgregarTags";


            var param = {
                "Param.1": PRN_ID,
                "Param.2": PRN_DESCRIPCION,
                "Param.3": FL_HABILITADO,
                "Param.4": PPRN_IP,
                "Param.5": PRN_PUERTO
            };

            if (PRN_ID.trim() === "" || PRN_DESCRIPCION.trim() === "" || PPRN_IP.trim() === "" || PRN_PUERTO.trim() === "") {
                MessageBox.error("Todos los campos son requeridos");
                return;
            }
            this.confirmarAccionUpdate(param, path, message, postEx)
        },
        confirmarAccionUpdate: function (param, path, message, postEx) {
            let that = this;
            MessageBox["warning"](message, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        var oModelFunc = new sap.ui.model.json.JSONModel();
                        oModelFunc.setSizeLimit(10000);
                        var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + path + "&Content-Type=text/json&UUID=" + this.uuidv4();
                        oModelFunc.loadData(url, param, true, "POST");
                        oModelFunc.attachRequestCompleted(function (oController) {

                            // IF Fatal Error input
                            if (oModelFunc.getData().Rowsets.FatalError) {
                                MessageBox.error(oModelFunc.getData().Rowsets.FatalError);
                                return;
                            } else {
                                that.byId("ipuPRN_DESCRIPCION").setValue(''),
                                    that.byId("cpuFL_HABILITADO").setSelected(false),
                                    that.byId("ipuPRN_IP").setValue(''),
                                    that.byId("ipuPRN_PUERTO").setValue(''),
                                    that.byId("ipuPRN_ID").setEnabled(true);
                                that.onCloseDialogU();
                                that.onFilterSearchTags();
                                MessageToast.show("Registro actualizado correctamente.");


                            }
                        })

                    }
                }.bind(this)
            });
        },
        onDeleteTag: function (oEvent) {
            let index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);
            let obj = this.getView().getModel("listaImpresorasMain").getData().Rowsets.Rowset[0].Row[index];
            let path = "MII/DatosTransaccionales/Administracion/Impresoras/impresoras_delete";


            let param = {
                "Param.1": obj.PRN_ID,
            }


            this.confirmaDelete(param, path)
        },
        confirmaDelete: function (param, path, message, postEx) {
            let that = this;
            MessageBox["warning"]("¿Confirmar eliminación?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        var oModelFunc = new sap.ui.model.json.JSONModel();
                        oModelFunc.setSizeLimit(10000);

                        var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + path + "&Content-Type=text/json&UUID=" + this.uuidv4();
                        oModelFunc.loadData(url, param, true, "POST");
                        oModelFunc.attachRequestCompleted(function (oController) {

                            // IF Fatal Error input
                            if (oModelFunc.getData().Rowsets.FatalError) {
                                MessageBox.error(oModelFunc.getData().Rowsets.FatalError);
                                return;
                            } else {
                                MessageBox.information("Registro eliminado");
                                that.onFilterSearchTags();
                            }
                        })

                    }
                }.bind(this)
            });
        },
        onlyNumeric: function (oEvent) {
            var _oInput = oEvent.getSource();
            var val = _oInput.getValue();
            val = val.replace(/[^\d]/g, '');
            _oInput.setValue(val);
        },
        onCloseDialogU: function () {
            this.dialogAgregarTagsU.close();
        },
        onCloseDialog: function () {
            this.dialogAgregarTags.close();
        },
        onValueHelpRequest: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();
            this.inputDialog = this.byId(oEvebnt.getSource().getId());

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.Administracion.addImpresora",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding
                oDialog.getBinding("items").filter([new Filter("PUESTO_TRABAJO", FilterOperator.Contains, sInputValue)]);
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open(sInputValue);
            });
        },

        onValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("PUESTO_TRABAJO", FilterOperator.Contains, sValue);

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            this.inputDialog.setValue(oSelectedItem.getTitle());
        },
        onUpperCase: function (oEvent) {

            var input = oEvent.getSource();

            input.setValue(input.getValue().toUpperCase());
        },
        handleCrearVariable: function () {

        },
        handleCrearVariable: function (oEvent) {
            var oThis = this,
                oData,
                oButton = oEvent.getSource(),
                oView = this.getView();
            //oPlantFilter = oThis.byId("planta_select_rol");

            if (!this._gDialogV) {
                this._gDialogV = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.webapp.fragment.PlantConnectivity.addTipoVariable",
                    controller: this
                }).then(function (oDialogV) {
                    oView.addDependent(oDialogV);
                    return oDialogV;
                });
            }

            this._gDialogV.then(function (oDialogV) {

                this.dialogAgregarVariable = oDialogV;
                oDialogV.open();


            }.bind(this));
        },

        creaTIPO: function () {
            let TIPO_COD = this.byId("inputPopTIPO_COD").getValue(),
                TIPO_DESC = this.byId("inputPopTIPO_DESC").getValue(),
                path = "MII/Integraciones/PCo/Administracion/tags_addVariablesTipos",
                message = "¿Confirmar creación?",
                postEx = "onCloseDialo";

            var param = {
                "Param.1": TIPO_COD,
                "Param.2": TIPO_DESC
            };

            if (TIPO_COD.trim() === "" || TIPO_DESC.trim() === "") {
                MessageBox.error("Todos los campos son requeridos");
                return;
            }
            this.confirmarAccionTIPOVARIABLE(param, path, message, postEx)
        },
        confirmarAccionTIPOVARIABLE: function (param, path, message, postEx) {
            let that = this;
            MessageBox["warning"](message, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        var oModelFunc = new sap.ui.model.json.JSONModel();
                        oModelFunc.setSizeLimit(10000);
                        var FullName = "MII/Da";
                        var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + path + "&Content-Type=text/json&UUID=" + this.uuidv4();
                        oModelFunc.loadData(url, param, true, "POST");
                        oModelFunc.attachRequestCompleted(function (oController) {

                            // IF Fatal Error input
                            if (oModelFunc.getData().Rowsets.FatalError) {
                                MessageBox.error(oModelFunc.getData().Rowsets.FatalError);
                                return;
                            } else {
                                that.byId("inputPopTIPO_COD").setValue(''),
                                    that.byId("inputPopTIPO_DESC").setValue(''),
                                    that.onCloseDialogTIPO();
                                MessageToast.show("Registro ingresado correctamente.");


                            }
                        })

                    }
                }.bind(this)
            });
        },
        onCloseDialogTIPO: function () {
            this.dialogAgregarVariable.close();
        },
        onlyIP: function (oEvent) {
            var _oInput = oEvent.getSource();
            var val = _oInput.getValue();
            var objIP = val.split('.')
            var ipTotal = '';

            objIP.forEach(function (element, index) {
                element = element.replace(/[^\d]/g, '');

                if (index < 4) {
                    if (element > 255)
                        element = 255;

                    if (ipTotal.length == 0) {
                        ipTotal = element;
                    } else {
                        ipTotal = ipTotal + '.' + element;
                    }
                }
            });

            _oInput.setValue(ipTotal);
        },
    });
});
