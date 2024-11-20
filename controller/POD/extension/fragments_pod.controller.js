/**
 * Indalum : Proyecto Indalum SAP MII
 * 2023
 * Extension Fragments.controller.js
 */
sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/BusyIndicator',
    "sap/ui/core/Core",
], function (
    Controller,
    JSONModel,
    BusyIndicator,
    Core
) {
    "use strict";
    return {
        onViewOrders: function () {
            var othis = this,
                oView = this.getView(),
                wc = othis._WC.getSelectedKey(),
                oData = {
                    "Param.1": wc
                };
            othis._LoadData(oData, "MIIExtensions/Orders/Query/get_orders_pod", "orders");
            if (!othis._oViewOrder) {
                othis._oViewOrder = oView.byId("order_pod");
                othis._oViewOrder = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PantallaOperador.ViewOrders", this);
                oView.addDependent(othis._oViewOrder);
                othis._oViewOrder.onBeforeClose = function () {
                    othis._oViewOrder.destroy();
                };
            }
            othis._VwReporte = "POD_ORDERS";
            othis._onSetViewColumnas();
            othis._oViewOrder.open();
        },
        onCloseViewOrders: function () {
            this._oViewOrder.close();
        },
        _report_visible: function (status) {
            if (status == "true")
                return true;
            else
                return false;
        },
        cellclick: function (oEvent) {
            var context = oEvent.getParameters().rowBindingContext.getObject();
            let orden = context.SHOP_ORDER;
            this._Orden.setSelectedKey(orden);
            this._Orden.setValue(orden);
            this.onCloseViewOrders();
        },
        ClearFiltersTable: function () {
            var oTableO = this.getView().byId("tblOrders");
            var aColumns = oTableO.getColumns();
            for (var i = 0; i < aColumns.length; i++) {
                oTableO.filter(aColumns[i], null);
                oTableO.sort(aColumns[i], null);
            }
            oTableO.getModel().refresh(true);
        },
        __openModalColumn: function (reporte) {
            var oView = this.getView();
            var oThis = this;
            oThis._VwReporte = reporte;
            if (!this.DGCOLUMNS) {
                this.DGCOLUMNS = oView.byId("DGCOLUMNS");
                this.DGCOLUMNS = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PantallaOperador.Reportes.Columns", this);
                oView.addDependent(this.DGCOLUMNS);
                this.DGCOLUMNS.onBeforeClose = function () {
                    this.DGCOLUMNS.destroy();
                };
            }
            this.DGCOLUMNS.onAfterRendering = function () {
                var oData = {
                    USER: $sapmii.IllumLoginName,
                    REPORTE: oThis._VwReporte,
                }
                oThis._base_onloadTable("t_columns", oData, "MII/DatosMaestros/Transaction/get_config_columns", "COLUMNS", "");
            }
            this.DGCOLUMNS.open();
        },

        _onCloseColumnas: function () {
            this.DGCOLUMNS.close();
        },

        _onCheckChange: function (oEvent) {
            var oView = this.getView();
            var omodel = oView.byId("t_columns").getModel();
            var sel = oEvent.getSource().getSelected();
            var path = oEvent.getSource().getBindingContext().getPath();
            omodel.setProperty(path + '/VISIBLE', sel);
        },

        _onGuardarColumnas: function () {
            var oThis = this;
            var oView = this.getView();
            var oTable = oView.byId("t_columns");
            var aColumns = '{"Columns":[';
            var item;
            for (item of oTable.getItems()) {
                aColumns += '{"text":"' + item.getBindingContext().getProperty("COLUMNA") + '",';
                aColumns += '"id":"' + item.getBindingContext().getProperty("ID") + '",';
                aColumns += '"visible":"' + item.getBindingContext().getProperty("VISIBLE") + '"},';
            }
            aColumns = aColumns.substr(aColumns, aColumns.length - 1) + "]}";
            var oData = {
                USER: $sapmii.IllumLoginName,
                REPORTE: this._VwReporte,
                COLUMNS: aColumns,
            };
            this._Realiza_ajax("MII/DatosMaestros/Transaction/save_config_columns", oData, "GuardarColumnas");
        },

        _onSetViewColumnas: function () {
            var oData = {
                USER: $sapmii.IllumLoginName,
                REPORTE: this._VwReporte,
            };
            this._Realiza_ajax("MII/DatosMaestros/Transaction/get_config_columns", oData, "SetColumnas");
        },

        _Realiza_ajax(path, Data, tipo) {
            var oThis = this;
            var oView = this.getView();
            BusyIndicator.show(0);
            $.ajax({
                type: "POST",
                url: "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml",
                dataType: "xml",
                cache: false,
                data: Data,
                success: function (xml) {
                    if (xml.getElementsByTagName("Row").length > 0) {
                        var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                        switch (tipo) {
                            case 'SetColumnas':
                                var aData = JSON.parse(opElement.firstChild.data);
                                aData["ITEMS"].forEach(function (value, i) {
                                    //console.log(value.ID);
                                    if (value.VISIBLE == "false") {
                                        oView.byId(value.ID).setVisible(false);
                                    } else {
                                        oView.byId(value.ID).setVisible(true);
                                    }
                                });
                                break;
                            case 'GuardarColumnas':
                                oThis._onCloseColumnas();
                                oThis._onSetViewColumnas();
                                break;
                            case 'ScanCamera':
                                oThis.CloseScanDialog();
                                break;
                            case 'InstalacionAsig':
                                var aData = JSON.parse(opElement.firstChild.data);
                                if (aData.ERROR == "1") {
                                    oThis.handleInfoMessageBoxPress(aData.MESSAGE);
                                }

                                var wc = oThis._oInput.getSelectedKey(),
                                    oData = {
                                        "Param.1": wc,
                                        "Param.10": $sapmii.IllumLoginName
                                    };
                                oThis._LoadData(oData, "MII/DatosTransaccionales/Produccion/Calculadora/Query/workcenter_solicitudBillets_detalle_selectQuery", "ms_asig");
                                break;
                        }
                    } else {
                        oThis.handleInfoMessageBoxPress("Favor de validar los datos");
                    }
                    BusyIndicator.hide();
                },
                error: function () {
                    BusyIndicator.hide();
                }
            });
        },

        onComponentMonitorSol_asig: function () {
            var othis = this,
                oView = this.getView(),
                wc = this._oInput.getSelectedKey(),
                oData = {
                    "Param.1": wc,
                    "Param.10": $sapmii.IllumLoginName
                };
            othis._LoadData(oData, "MII/DatosTransaccionales/Produccion/Calculadora/Query/workcenter_solicitudBillets_detalle_selectQuery", "ms_asig");
            if (!othis._oViewMS_billets) {
                othis._oViewMS_billets = oView.byId("MS_Asignados");
                othis._oViewMS_billets = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.MonitorLotes_Asignados", this);
                oView.addDependent(othis._oViewMS_billets);
                othis._oViewMS_billets.onBeforeClose = function () {
                    othis._oViewMS_billets.destroy();
                };
            }
            othis._oViewMS_billets.open();
        },

        onInstalarLoteMS: function (oEvent) {
            let oView = this.getView();
            var oSelectedItem = oEvent.getSource().getParent();
            var oBindingContext = oSelectedItem.getBindingContext("ms_asig");
            let sol_id = oBindingContext.getProperty('SOL_ID');
            let sasig_id = oBindingContext.getProperty('SBS_ID');
            let user = $sapmii.IllumLoginName;
            var oData = {
                "inSolID": sol_id,
                "inSolAID": sasig_id,
                "inUser": user
            };
            this._Realiza_ajax("MII/DatosTransaccionales/Produccion/Calculadora/Transaction/Ins_Instalar_Lote_SolicitudBillet", oData, "InstalacionAsig");
        },

        onCloseAsigMonitorSol: function () {
            this._oViewMS_billets.close();
        },

        onValidateErrorCamera: function () {
            let oThis = this;
            let oView = this.getView();
            let oModelCamera = new sap.ui.model.json.JSONModel();
            let oPuestoTrabajoTag = this._oInput.getSelectedKey();
            oModelCamera.setSizeLimit(10000);
            let oPath = "MII/DatosTransaccionales/Produccion/Marcaje_Lectura/Query/get_lastvalue_wc_camera";
            let url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
            var parameters = {
                "Param.1": oPuestoTrabajoTag,
                "Param.2": " AND RESULT>1 AND ATTENDED=false"
            };
            console.log(oPuestoTrabajoTag);
            if (oPuestoTrabajoTag == "") {
                return false;
            }
            oModelCamera.loadData(url, parameters, true, "POST");
            oModelCamera.attachRequestCompleted(function () {
                // IF Fatal Error input
                if (oModelCamera.getData().Rowsets.FatalError) {
                    global.functions.onMessage("E", oModelCamera.getData().Rowsets.FatalError);
                    return;
                }
                let oRow = oModelCamera.getData().Rowsets.Rowset[0].Row;
                if (oRow != undefined) {
                    oThis.onScanCamera(oRow[0]);
                }
            });
        },

        onScanCamera: function (data) {
            var oView = this.getView();
            if (!this.oScanCamDialog) {
                this.oScanCamDialog = oView.byId("DGLecturaCamara");
                this.oScanCamDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.LecturaCamara", this);
                oView.addDependent(this.oScanCamDialog);
                this.oScanCamDialog.onBeforeClose = function () {
                    this.oScanCamDialog.destroy();
                };
            }
            this.oScanCamDialog.onAfterRendering = function () {
                oView.getModel().setProperty('/ErrorLectura', false);
                oView.getModel().setProperty('/Compatibilidad', false);
                oView.getModel().setProperty('/Sistemas', false);
                oView.byId("reg_lote").setValue("");
                switch (data.RESULT) {
                    case 2:
                        oView.getModel().setProperty('/ErrorLectura', true);
                        break;
                    case 3:
                        oView.byId("reg_lote_leido").setValue(data.LASTVALUE);
                        oView.getModel().setProperty('/Compatibilidad', true);
                        break;
                    case 9:
                        oView.getModel().setProperty('/Sistemas', true);
                        break;
                }
            }
            this.oScanCamDialog.open();
        },

        CloseScanDialog: function () {
            this.oScanCamDialog.close();
        },

        EjecutarEscaneo: function (manual) {
            var oView = this.getView(),
                lote = oView.byId("reg_lote").getValue(),
                wc = this._oInput.getSelectedKey();
            console.log(lote);
            if (manual && lote == "") {
                this.handleInfoMessageBoxPress("Favor de ingresar el lote");
                return false;
            }
            var oData = {
                "inWC": wc,
                "inManual": (manual == 1 ? true : false),
                "inLote": lote,
                "inUser": $sapmii.IllumLoginName
            };
            this._Realiza_ajax("MII/DatosTransaccionales/Produccion/Marcaje_Lectura/Transaction/Valida_Error_Escaneo", oData, "ScanCamera");
        },

        Compatibilidad: function (respuesta) {
            var oView = this.getView(),
                lote = oView.byId("reg_lote_leido").getValue(),
                wc = this._oInput.getSelectedKey();
            var oData = {
                "inWC": wc,
                "inRespuesta": (respuesta == 1 ? true : false),
                "inLote": lote,
                "inUser": $sapmii.IllumLoginName
            };
            this._Realiza_ajax("MII/DatosTransaccionales/Produccion/Marcaje_Lectura/Transaction/Valida_Error_Escaneo", oData, "ScanCamera");
        },

        GetDados_Montados: function (orden) {
            var oData = {
                "Param.1": String(orden).padStart(12, '0'),
            };
            this._LoadData(oData, "MII/DatosTransaccionales/Herramentales/Dados/Query/herramental_Utilizacion_byOrden_selectQuery", "hist_dados");
        },

        GetBasculas: function () {
            var oData = {
                "Param.1": this._oInput.getSelectedKey()
            };
            this._LoadData(oData, "MII/DatosTransaccionales/Produccion/Basculas/Query/get_basculas", "basculas");
        },

        onGetPesoBascula: function (id) {
            var oView = this.getView();
            var bascula = oView.byId("inBascula").getSelectedKey();
            console.log(id);
            var id_input = id;
            let oThis = this;
            let oModelPeso = new sap.ui.model.json.JSONModel();
            oModelPeso.setSizeLimit(10000);
            let oPath = "MII/DatosTransaccionales/Produccion/Basculas/Transaction/Get_Peso_Bascula_xacuteQuery";
            let url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
            var parameters = {
                "Param.1": this._oInput.getSelectedKey(),
                "Param.2": bascula
            };
            oModelPeso.loadData(url, parameters, true, "POST");
            oModelPeso.attachRequestCompleted(function () {
                // IF Fatal Error input
                if (oModelPeso.getData().Rowsets.FatalError) {
                    global.functions.onMessage("E", oModelPeso.getData().Rowsets.FatalError);
                    return;
                }
                let oRow = oModelPeso.getData().Rowsets.Rowset[0].Row;
                console.log(oRow);
                switch (oRow[0]['PESO']) {
                    case "99999":
                        oView.byId(id_input).setEnabled(true);
                        oView.byId(id_input).setValue(0);
                        oThis.handleInfoMessageBoxPress("Favor de ingresar el peso manualmente");
                        break;
                    case "88888":
                        oView.byId(id_input).setEnabled(false);
                        oView.byId(id_input).setValue(0);
                        oThis.handleInfoMessageBoxPress("Peso negativo, favor de resetear a cero la bascula");
                        break;
                    default:
                        oView.byId(id_input).setValue(oRow[0]['PESO']);
                        oView.byId(id_input).setEnabled(false);
                        break;
                }
                /*			if(oRow!=undefined && oRow[0]['PESO']!=="99999" && oRow[0]['PESO']!=="99999"){
                                oView.byId("inputPeso").setValue(oRow[0]['PESO']);
                                oView.byId("inputPeso").setEnabled(false);
                            }else{
                                oView.byId("inputPeso").setValue(0);
                                oView.byId("inputPeso").setEnabled(true);
                            }
                */
            });
        },
        toString: function (sValue) { return "" + sValue; },
    };
});