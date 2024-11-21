

sap.ui.define
    ([
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
        function
            (
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
            const CD_ESTATUS_TERMINO_CARGA = "3";
            const DS_ESTATUS_TERMINO_CARGA = "Fin de carga";
            return {
                //<!--  Inicio Metodos Extension  -->

                onVerDados: function () {
                    let oThis = this;
                    let oView = this.getView();
                    oThis.onGetListadoDados();
                    if (!this.byId("DadosListPrensa")) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.DadosListPrensa",
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            oDialog.onBeforeClose = function () {
                                oDialog.destroy();
                            };
                            oDialog.open();
                        });
                    } else {
                        this.byId("DadosListPrensa").open();
                    }
                },
                onMontarDado: function () {
                    let oThis = this;
                    let oView = this.getView();
                    let oInputPuesto = oView.byId("input").getSelectedKey()
                    if (oInputPuesto == "") {
                        MessageToast.show("Para Montar un Dado debe seleccionar un Puesto de Trabajo");
                        return false;
                    }
                    let oitems_orders = oView.byId('OrdersList').getSelectedItems(),
                        order = '';
                    oitems_orders.forEach(function (item) {
                        order = item.getCells()[0].getText();
                    });
                    if (order === '') {
                        MessageToast.show("Debe seleccionar una orden para Montar Dado");
                        return false;
                    }
                    this.orden = order;
                    // Get MAF By Orden + Dados disponibles
                    this.onGetMAF(order, oInputPuesto);
                    if (!this.byId("DadosList")) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.DadosList",
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            oDialog.open();
                        });
                    } else {
                        this.byId("DadosList").open();
                    }
                },
                onDesMontarDado: function () {
                    let oThis = this;
                    let oView = this.getView();
                    let oInputPuesto = oView.byId("input").getSelectedKey()
                    if (oInputPuesto == "") {
                        MessageToast.show("Para Desmontar un Dado debe seleccionar un Puesto de Trabajo");
                        return false;
                    }
                    let oitems_orders = oView.byId('OrdersList').getSelectedItems(),
                        order = '';
                    oitems_orders.forEach(function (item) {
                        order = item.getCells()[0].getText();
                    });
                    if (!this.dialogDesmontarDADO) {
                        this.dialogDesmontarDADO = Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.desmontarDADO",
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this.dialogDesmontarDADO.then(function (oDialog) {
                        this.dialogControlPeso = oDialog;
                        oDialog.open();
                    }.bind(this));
                },
                onControlarPeso: function () {
                    let oThis = this;
                    let oView = this.getView();
                    let oInputPuesto = oView.byId("input").getSelectedKey();
                    if (oInputPuesto == "") {
                        MessageToast.show("Para Controlar Peso debe seleccionar un Puesto de Trabajo");
                        return false;
                    }
                    /*
                                    var oitems_orders = oView.byId('OrdersList').getSelectedItem();
                                    console.log(oitems_orders);
                                    var order = oitems_orders.getBindingContext().getObject().SHOP_ORDER;
                    */
                    let oitems_orders = oView.byId('OrdersList').getSelectedItems(),
                        order = '';
                    oitems_orders.forEach(function (item) {
                        order = item.getCells()[0].getText();
                    });
                    if (order === '') {
                        MessageToast.show("Selecciona una orden");
                        return false;
                    } else {
                        this.orden = order;
                    }
                    if (!this.modalControlPeso) {
                        this.modalControlPeso = Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.controlPeso_2",
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog); // 202407
                            oView.byId('inOrden').setText(oThis.orden); // 202407
                            oView.byId('ptoTrabajo').setText(oInputPuesto); // 202407
                            oThis.GetDados_Montados(oThis.orden); // 202407
                            oThis.GetBasculas(); // 202407
                            oView.byId('inputPeso').setValue("0"); // 202407
                            return oDialog;
                        });
                    }
                    this.modalControlPeso.then(function (oDialog) {
                        this.dialogControlPeso = oDialog;
                        oView.byId('inOrden').setText(oThis.orden);
                        oView.byId('ptoTrabajo').setText(oInputPuesto);
                        oThis.GetBasculas();
                        oThis.GetDados_Montados(order);
                        oView.byId('inputPeso').setValue("0");
                        oDialog.open();
                    }.bind(this));
                },
                onDataDadoMontado: function (sPuestoTrabajo) {
                    let oThis = this;
                    let oView = this.getView();
                    if (oView.byId("oTagSerie") != undefined) {
                        // Limpia Tags
                        oView.byId("oTagSerie").setText("Serie: ").setVisible(false);
                        oView.byId("oTagEquipo").setText("Equipo: ").setVisible(false);
                        oView.byId("oTagEstado").setText("Estado: " + "Sin Dado Montado").setVisible(false);
                        oView.byId("oTagAlertaCtrlPeso").setText("Debe Controlar Peso").setVisible(false);
                        oView.byId("oTagPorcentajeDado").setText("0 %").setVisible(false);
                        // Estructura de Parametros de entrada - Filtros
                        var parameters = {
                            "Param.1": sPuestoTrabajo
                        };
                        var oModelSync = new sap.ui.model.json.JSONModel();
                        oModelSync.setSizeLimit(100000)
                        var //oPath = "MII/DatosTransaccionales/Herramentales/Dados/Query/herramental_Header_selectQuery_byPuestoTrabajo"
                            oPath = "MII/DatosTransaccionales/Herramentales/Dados/Transaction/GetDadoActivo_xacuteQuery";
                        var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                        oModelSync.loadData(url, parameters, true, "POST");
                        oModelSync.attachRequestCompleted(function () {
                            // IF Fatal Error - Catch
                            if (oModelSync.getData().Rowsets.FatalError) {
                                return;
                            }
                            //<!---->
                            if (oModelSync.getData().Rowsets.Rowset == undefined) { // 202406*
                            } else {
                                if (oModelSync.getData().Rowsets.Rowset[0].Row == undefined) { // 202311
                                } else {
                                    var res = oModelSync.getData().Rowsets.Rowset[0].Row[0];
                                    console.log(res);
                                    var controlpeso = (res.CONTROL_PESO != "NA" ? "PESO 1M:" + res.CONTROL_PESO : "Alerta: Debe Controlar Peso");
                                    oView.byId("oTagSerie").setText("Serie: " + res.SERIE).setVisible(true);
                                    oView.byId("oTagEquipo").setText("Equipo: " + res.DADO).setVisible(true);
                                    oView.byId("oTagEstado").setText("Estado: " + res.ESTADO).setVisible(true);
                                    oView.byId("oTagPorcentajeDado").setText("Utilización : " + res.UTILIZACION).setVisible(true);
                                    oView.byId("oTagAlertaCtrlPeso").setText(controlpeso).setVisible(true);
                                }
                            }
                            //<!---->
                        });
                    }
                },
                onCloseDialogDados: function () {
                    this.byId("DadosList").close();
                },
                onCloseDialogDadosPrensa: function () {
                    this.byId("DadosListPrensa").close();
                },
                onGetListadoDadosDisponibles: function (oPuestoTrabajo, oMaterialMAF) {
                    let oThis = this;
                    let oView = this.getView();
                    const zeroPad = (num, places) => String(num).padStart(places, '0')
                    var oModel_data = new sap.ui.model.json.JSONModel();
                    oModel_data.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/MontajeDesmontaje/Query/getHerramental_sinMontar_byPuestoTrabajo_selectQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": oPuestoTrabajo,
                        "Param.2": zeroPad(oMaterialMAF, 18)
                    };
                    oModel_data.loadData(url, parameters, true, "POST");
                    oModel_data.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModel_data.getData().Rowsets.FatalError) {
                            global.functions.onMessage("E", oModel_data.getData().Rowsets.FatalError);
                            return;
                        }
                        oView.setModel(oModel_data, "dadosListModel");
                    });
                },
                onGetListadoDados: function () {
                    let oThis = this;
                    let oView = this.getView();
                    var wc = this._oInput.getSelectedKey();
                    var oModel_data = new sap.ui.model.json.JSONModel();
                    oModel_data.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/MontajeDesmontaje/Query/getHerramental_byPuestoTrabajo_selectQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": wc
                    };
                    oModel_data.loadData(url, parameters, true, "POST");
                    oModel_data.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModel_data.getData().Rowsets.FatalError) {
                            global.functions.onMessage("E", oModel_data.getData().Rowsets.FatalError);
                            return;
                        }
                        oView.setModel(oModel_data, "dadosListModelPrensa");
                    });
                },
                onGetMAF: function (sOrden, oPuestoTrabajo) {
                    let oThis = this;
                    let oView = this.getView();
                    let sPuesto = oPuestoTrabajo;
                    var oModelMAF = new sap.ui.model.json.JSONModel();
                    oModelMAF.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/Dados/Transaction/getMAFOrden_xacuteQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": sOrden
                    };
                    oModelMAF.loadData(url, parameters, true, "POST");
                    oModelMAF.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModelMAF.getData().Rowsets.FatalError) {
                            global.functions.onMessage("E", oModelMAF.getData().Rowsets.FatalError);
                            return;
                        }
                        let oRow = oModelMAF.getData().Rowsets.Rowset[0].Row;
                        let sListaMaterialMAF = "";

                        oRow.forEach(function (value, i) {
                            sListaMaterialMAF += value.MATERIAL + ","
                        });

                        console.log(sListaMaterialMAF);

                        let sMaterialMAF = oRow[0].PRT_NUMBER;
                        //oThis.onGetListadoDadosDisponibles(sPuesto, sMaterialMAF);

                        oThis.onGetListadoDadosDisponiblesMultiple(sPuesto, sListaMaterialMAF);
                    });
                },
                visible_precalentado: function (precalentado) {
                    console.log(precalentado);
                    var enable = true;
                    if (precalentado == 1)
                        enable = false;
                    return enable;
                },
                visible_cancprecalentado: function (precalentado) {
                    console.log(precalentado);
                    var enable = true;
                    if (precalentado == 0)
                        enable = false;
                    return enable;
                },
                onPrecalentarDadoButton: function (oEvent) {
                    let oView = this.getView();
                    var oSelectedItem = oEvent.getSource().getParent();
                    var oBindingContext = oSelectedItem.getBindingContext("dadosListModelPrensa");
                    let herrGuid = oBindingContext.getProperty('HER_ID');
                    let precalentado = oBindingContext.getProperty('PRECALENTADO');
                    let puesto = oView.byId("input").getSelectedKey();
                    this.precalentar(herrGuid, puesto, $sapmii.IllumLoginName, precalentado);
                },
                precalentar: function (inGuid, inPuesto, inUsuario, precalentado) {
                    let oView = this.getView();
                    let that = this;
                    var oModelPrecalentado = new sap.ui.model.json.JSONModel();
                    oModelPrecalentado.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/Precalentado/PrecalentadoDado_xacuteQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": inPuesto,
                        "Param.2": inGuid,
                        "Param.3": inUsuario,
                        "Param.4": precalentado
                    };
                    oModelPrecalentado.loadData(url, parameters, true, "POST");
                    oModelPrecalentado.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModelPrecalentado.getData().Rowsets.FatalError) {
                            MessageToast.show(oModelPrecalentado.getData().Rowsets.FatalError);
                            return;
                        }
                        let oRows = oModelPrecalentado.getData().Rowsets.Rowset[0].Row[0];
                        that.onGetListadoDados();
                    });
                },
                onMontarDadoButton: function (oEvent) {
                    let oView = this.getView();
                    let index = oEvent.getSource().getParent().getIndex();
                    let rowContext = oView.byId("oTableDados").getContextByIndex(index);
                    let objRow = rowContext.getObject();
                    let herrGuid = objRow.HER_ID;
                    let puesto = oView.byId("input").getSelectedKey()
                    this.montarDesmontar(herrGuid, puesto, $sapmii.IllumLoginName, "MONTAJE");
                },
                montarDesmontar: function (inGuid, inPuesto, inUsuario, inModo) {
                    let oView = this.getView();
                    let that = this;
                    var oModelMontarDesmontar = new sap.ui.model.json.JSONModel();
                    oModelMontarDesmontar.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/MontajeDesmontaje/Transaction/MontajeDesmontajeDispatcher_xacuteQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": inGuid,
                        "Param.2": inPuesto,
                        "Param.3": inUsuario,
                        "Param.4": inModo
                    };
                    oModelMontarDesmontar.loadData(url, parameters, true, "POST");
                    oModelMontarDesmontar.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModelMontarDesmontar.getData().Rowsets.FatalError) {
                            MessageToast.show(oModelMontarDesmontar.getData().Rowsets.FatalError);
                            return;
                        }
                        let oRows = oModelMontarDesmontar.getData().Rowsets.Rowset[0].Row[0];
                        // Cierra Modal Dados
                        that.onCloseDialogDados();
                        // Cargar Data de Datos
                        that.onDataDadoMontado(inPuesto);
                        MessageToast.show(oRows.ERR_DES);
                    });
                },
                desmontarDADO: function () {
                    let tipoDesmontado = (this.oView.byId('switchDesmontado').getState() ? 'DESMONTADOOK' : 'DESMONTADOERR'),
                        inParteJSON = [],
                        inSintomaJSON = [],
                        boxListaParte = this.oView.byId('boxListParte'),
                        boxListaSintoma = this.oView.byId('boxListSintoma');
                    boxListaParte = boxListaParte.getSelectedItems();
                    boxListaSintoma = boxListaSintoma.getSelectedItems();
                    boxListaParte.forEach(function (item) {
                        inParteJSON.push({
                            "GRUPO": item.getAdditionalText(),
                            "CODIGO": item.getKey(),
                            "DESCRIPCION": item.getText()
                        });
                    });
                    boxListaSintoma.forEach(function (item) {
                        inSintomaJSON.push({
                            "GRUPO": item.getAdditionalText(),
                            "CODIGO": item.getKey(),
                            "DESCRIPCION": item.getText()
                        });
                    });
                    let swAviso = this.oView.byId('switchGeneraAviso').getState() ? "1" : "0";
                    let swOrden = this.oView.byId('switchGeneraOrden').getState() ? "1" : "0";
                    let puestoTrabajo = this.oView.byId('input').getSelectedKey();
                    let oView = this.getView();
                    let that = this;
                    var oModelMontarDesmontar = new sap.ui.model.json.JSONModel();
                    oModelMontarDesmontar.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/MontajeDesmontaje/Transaction/MontajeDesmontajeDispatcher_xacuteQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": "",
                        "Param.2": puestoTrabajo,
                        "Param.3": $sapmii.IllumLoginName,
                        "Param.4": tipoDesmontado,
                        "Param.5": JSON.stringify(inParteJSON),
                        "Param.6": JSON.stringify(inSintomaJSON),
                        "Param.7": swAviso,
                        "Param.8": swOrden
                    };
                    oModelMontarDesmontar.loadData(url, parameters, true, "POST");
                    oModelMontarDesmontar.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModelMontarDesmontar.getData().Rowsets.FatalError) {
                            MessageToast.show(oModelMontarDesmontar.getData().Rowsets.FatalError);
                            return;
                        }
                        let oRows = oModelMontarDesmontar.getData().Rowsets.Rowset[0].Row[0];
                        // Cierra Modal Dados
                        that.onCloseMDADO();
                        // Mensaje
                        MessageToast.show(oRows.ERR_DES);
                        // Cargar Data de Datos
                        that.onDataDadoMontado(puestoTrabajo);
                    });
                },
                onCloseMDADO: function () {
                    var oView = this.getView();
                    oView.byId("crearTagsDialog").close();
                },
                controlPesoSave: function () {
                    let cantidad = this.getView().byId('inputPeso').getValue();
                    let puestoTrabajo = this.getView().byId('input').getSelectedKey();
                    let dado = this.getView().byId('inDados').getSelectedKey();
                    //					"Param.3": cantidad.replace(".",","),
                    var parameters = {
                        "Param.1": puestoTrabajo,
                        "Param.2": this.orden,
                        "Param.3": cantidad,
                        "Param.4": $sapmii.IllumLoginName,
                        "Param.5": dado
                    };
                    let oThis = this;
                    let oView = this.getView();
                    var oModelCtrlPeso = new sap.ui.model.json.JSONModel();
                    oModelCtrlPeso.setSizeLimit(5000)
                    var oPath = "MII/DatosTransaccionales/Herramentales/PuntosMedida/Transaction/controlarPeso_xacuteQuery"
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    oModelCtrlPeso.loadData(url, parameters, true, "POST");
                    oModelCtrlPeso.attachRequestCompleted(function () {
                        // IF Fatal Error
                        if (oModelCtrlPeso.getData().Rowsets.FatalError) {
                            MessageToast.show(oModelCtrlPeso.getData().Rowsets.FatalError.replace('com.sap.xmii.Illuminator.logging.LHException: ', ''), {
                                duration: 2500
                            })
                            return;
                        }
                        let oRow = oModelCtrlPeso.getData().Rowsets.Rowset[0].Row[0];
                        MessageToast.show(oRow.ERR_DES, {
                            duration: 5000
                        });
                        oThis.dialogControlPeso.close();
                    });
                    this.dialogControlPeso.close();
                },
                onClosecontrolPeso: function () {
                    this.dialogControlPeso.close();
                },
                _estadoDesmontado: function (oEvent) {
                    let estadoDesmontado = '';
                    let switchDesmontado = this.oView.byId('switchDesmontado');
                    let desmontado = this.oView.byId('Desmontado');
                    if (switchDesmontado.getState()) {
                        estadoDesmontado = 'Desmontaje Normal';
                        this.oView.byId('boxListParte').setEnabled(false);
                        this.oView.byId('boxListSintoma').setEnabled(false);

                        // Setea DADO y Tratamiento SOSA
                        this.oView.byId('boxListParte').setSelectedKeys('P001');
                        this.oView.byId('boxListSintoma').setSelectedKeys('S045');

                    } else {
                        estadoDesmontado = 'Desmontaje con Error';
                        this.oView.byId('boxListParte').setEnabled(true);
                        this.oView.byId('boxListSintoma').setEnabled(true);
                        this.oView.byId('boxListParte').setSelectedKeys(null);
                        this.oView.byId('boxListSintoma').setSelectedKeys(null);

                    }


                    desmontado.setText(estadoDesmontado);
                },
                onCargaParteList: function () {
                    let oThis = this;
                    let oView = this.getView();
                    var oModelParteList = new sap.ui.model.json.JSONModel();
                    oModelParteList.setSizeLimit(5000)
                    var oPath = "MII/DatosTransaccionales/Herramentales/Causas/Query/CatalogoParteDados_selectQuery"
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {};
                    oModelParteList.loadData(url, parameters, true, "POST");
                    oModelParteList.attachRequestCompleted(function () {
                        // IF Fatal Error
                        if (oModelParteList.getData().Rowsets.FatalError) {
                            oView.getController().onMessageError(oModelParteList.getData().Rowsets.FatalError, "Error")
                            return;
                        }
                        oView.setModel(oModelParteList, "parteListModel");
                    });
                },
                onCargaSintomaAveriaList: function () {
                    let oThis = this;
                    let oView = this.getView();
                    var oModelSintomaList = new sap.ui.model.json.JSONModel();
                    oModelSintomaList.setSizeLimit(5000)
                    var oPath = "MII/DatosTransaccionales/Herramentales/Causas/Query/CatalogoSintomaAveriaDados_selectQuery"
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {};
                    oModelSintomaList.loadData(url, parameters, true, "POST");
                    oModelSintomaList.attachRequestCompleted(function () {
                        // IF Fatal Error
                        if (oModelSintomaList.getData().Rowsets.FatalError) {
                            oView.getController().onMessageError(oModelSintomaList.getData().Rowsets.FatalError, "Error")
                            return;
                        }
                        oView.setModel(oModelSintomaList, "sintomaListModel");
                    });
                },
                onCalcBillets: function (oEvent) {
                    var oView = this.getView();
                    var oThis = this;
                    var oButton = oEvent.getSource(); // ThumbsUp Button in the row
                    // Get binding context of the button to identify the row where the event is originated
                    var oBindingContext = oButton.getBindingContext(); // <<<-- If you have model name pass it here as string
                    var oBindingObject = oBindingContext.getObject();
                    oThis.SHOP_ORDER = oBindingObject.SHOP_ORDER;
                    var work_center_caracteristicas = this._oInput.getSelectedKey();
                    var oData = {
                        "inOrden": oThis.SHOP_ORDER,
                        "inFLSolicitar": '0',
                        "inUsuario": $sapmii.IllumLoginName
                    };
                    oThis.oDataBullets = oData;

                    if (!oThis.DgCalculadoraFragment) {
                        oThis.DgCalculadoraFragment = oView.byId("CalculadoraExtrusionFragment");
                        oThis.DgCalculadoraFragment = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.CalculadoraExtrusion", this);
                        oView.addDependent(oThis.DgCalculadoraFragment);
                    }
                    oView.byId("oInput_Orden").setValue(oThis.SHOP_ORDER);
                    oThis.DgCalculadoraFragment.open();
                },
                onViewCalcBillets: function (oEvent) {
                    var oView = this.getView();
                    var oThis = this;
                    var work_center_caracteristicas = this._oInput.getSelectedKey();
                    var oData = {
                        "inFLSolicitar": '0',
                        "inUsuario": $sapmii.IllumLoginName
                    };
                    oThis.oDataBullets = oData;
                    if (!oThis.DgCalculadoraFragment) {
                        oThis.DgCalculadoraFragment = oView.byId("CalculadoraExtrusionFragment");
                        oThis.DgCalculadoraFragment = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.CalculadoraExtrusion", this);
                        oView.addDependent(oThis.DgCalculadoraFragment);
                    }
                    oThis.DgCalculadoraFragment.open();
                },

                ongetCalc: function (oEvent) {
                    let calcularManual = this.byId("chk_getCalc").getState(),
                        oView = this.getView(),
                        oThis = this;
                    oThis.oDataBullets.inOrden = oView.byId("oInput_Orden").getValue();
                    oThis.oDataBullets.inPesoReal = oView.byId("oInput_UltimoPesoReal").getValue();
                    oThis.oDataBullets.inCavidades = oView.byId("oInput_Cavidades").getValue();
                    oThis.oDataBullets.inCortes = oView.byId("oInput_Cortes").getValue();
                    if (calcularManual) {
                        oThis.oDataBullets.inFLManual = 1;
                    } else {
                        oThis.oDataBullets.inFLManual = 0;
                    }
                    oThis._base_XMLonloadTable_EXT("TableCalculadoraExtrusion", oThis.oDataBullets, "MII/DatosTransaccionales/Produccion/Calculadora/Transaction/CalculadoraExtrusion", "Componentes", "");
                },
                onlyNumeric: function (oEvent) {
                    var _oInput = oEvent.getSource();
                    var val = _oInput.getValue();
                    val = val.replace(/[^\d]/g, '');
                    _oInput.setValue(val);
                },
                _base_XMLonloadTable_EXT: function (Table, oData, path, name, stats_bar) {

                    var oView = this.getView(),
                        oTable = oView.byId(Table),
                        oTableII = oView.byId('TableCalculadoraExtrusionII'),
                        oModel_empty = new sap.ui.model.json.JSONModel(),
                        oThis = this;
                    let server = this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/protocol") + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server");
                    //clear table
                    oModel_empty.setData({});
                    oTable.setModel(oModel_empty);
                    oTableII.setModel(oModel_empty);
                    var uri = server + "/XMII/Runner?Transaction=" + path + "&OutputParameter=outputXML&Content-Type=text/xml";
                    uri = uri.replace(/\s+/g, '');
                    oTable.setBusy(false);
                    oTableII.setBusy(false);

                    $.ajax({
                        async: false,
                        crossDomain: true,
                        type: "POST",
                        dataType: "xml",
                        cache: false,
                        url: uri,
                        data: oData
                    }).done(function (xmlDOM) {
                        let jsonTry = oThis.parseXmlToJson(xmlDOM.documentElement.innerHTML);
                        if (jsonTry.FatalError) {
                            oThis.handleErrorMessageBoxPress(jsonTry.FatalError);
                            return false;
                        }
                        console.log(jsonTry);
                        if (jsonTry !== null) {
                            var aData = jsonTry;
                            if (aData !== undefined) {
                                if (aData.COD_ERR != '0') {
                                    oThis.handleErrorMessageBoxPress(aData.DES_ERR);
                                } else {
                                    //Create  the JSON model and set the data
                                    var oModel = new sap.ui.model.json.JSONModel();
                                    var oModelII = new sap.ui.model.json.JSONModel();
                                    aData = [aData];
                                    oModel.setData(aData);
                                    oModelII.setData(aData);
                                    //check if exist a header element
                                    if (stats_bar !== '') {
                                        var oModel_stats = new sap.ui.model.json.JSONModel();
                                        var oSTATS = oThis.byId(stats_bar);
                                        oModel_stats.setData(aData.STATS);
                                        oSTATS.setModel(oModel_stats);
                                    }
                                    oTable.setModel(oModel);
                                    oTableII.setModel(oModelII);
                                    oView.byId("largoLingote").setValue(aData[0].LAR_LING_RESULTADO);
                                    oView.byId("billetsRequeridos").setValue(aData[0].BILL_REQ_RESULTADO);
                                    oView.byId("inputLargoLingote").setValue(aData[0].LAR_LING_RESULTADO);
                                    oView.byId("inputBilletsRequeridos").setValue(aData[0].BILL_REQ_RESULTADO);
                                }
                            } else {
                                MessageToast.show("No se han recibido " + name);
                            }
                        } else {
                            MessageToast.show("No se han recibido datos");
                        }
                        oTable.setBusy(false);
                        oTableII.setBusy(false);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        if (console && console.log) {
                            oThis.handleErrorMessageBoxPress("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                        }
                        oTable.setBusy(false);
                        oTableII.setBusy(false);
                    });

                },
                parseXmlToJson: function (xml) {
                    const json = {};
                    for (const res of xml.matchAll(/(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm)) {
                        const key = res[1] || res[3];
                        const value = res[2]; // && parseXmlToJson(res[2]);
                        json[key] = ((value && Object.keys(value).length) ? value : res[2]) || null;
                    }
                    return json;
                },
                onModificarSolicitud: function () {
                    var oView = this.getView();
                    oView.byId("inputLargoLingote").setVisible(true);
                    oView.byId("inputBilletsRequeridos").setVisible(true);
                    oView.byId("inputObservacion").setValue("");
                    oView.byId("inputObservacion").setVisible(true);
                    oView.byId("textObs").setVisible(true);
                },
                onSolicitarAreaCorte: function () {
                    var oView = this.getView(),
                        orden = oView.byId("oInput_Orden").getValue(),
                        obs = oView.byId("inputObservacion").getValue(),
                        largo = oView.byId("inputLargoLingote").getValue(),
                        billet = oView.byId("inputBilletsRequeridos").getValue(),
                        calcularManual = this.byId("chk_getCalc").getState();
                    var oData = {
                        "inOrden": orden,
                        "inFLSolicitar": '1',
                        "inUsuario": $sapmii.IllumLoginName,
                        "inObservacion": obs,
                        "inLargo_definitivo": largo,
                        "inBillets_Definitivo": billet,
                        "inFLManual": (calcularManual ? 1 : 0)
                    };
                    this._base_XMLonload_EXT("TableCalculadoraExtrusion", oData, "MII/DatosTransaccionales/Produccion/Calculadora/Transaction/CalculadoraExtrusion", "Componentes", "");
                },
                onlyNumeric: function (oEvent) {
                    var _oInput = oEvent.getSource();
                    var val = _oInput.getValue();
                    val = val.replace(/[^\d.]/g, '');
                    _oInput.setValue(val);
                },
                onCloseFragmentCalculadoraExtrusion: function () {
                    this.getView().byId("inputObservacion").setValue('');
                    this.getView().byId("inputLargoLingote").setValue('');
                    this.getView().byId("inputBilletsRequeridos").setValue('');
                    this.getView().byId("inputObservacion").setVisible(false);
                    this.getView().byId("inputLargoLingote").setVisible(false);
                    this.getView().byId("inputBilletsRequeridos").setVisible(false);
                    this.getView().byId("textObs").setVisible(false);

                    this.getView().byId("oInput_Orden").setValue("");
                    this.getView().byId("oInput_Cortes").setValue("");
                    this.getView().byId("oInput_Cavidades").setValue("");
                    this.getView().byId("oInput_UltimoPesoReal").setValue("");
                    this.DgCalculadoraFragment.close();
                },
                _base_XMLonload_EXT: function (Table, oData, path, name, stats_bar) {

                    var oView = this.getView(),
                        oThis = this;
                    //clear table
                    let server = "";
                    var uri = server + "/XMII/Runner?Transaction=" + path + "&OutputParameter=outputXML&Content-Type=text/xml";
                    uri = uri.replace(/\s+/g, '');

                    $.ajax({
                        async: false,
                        crossDomain: true,
                        type: "POST",
                        dataType: "xml",
                        cache: false,
                        url: uri,
                        data: oData
                    }).done(function (xmlDOM) {
                        let jsonTry = oThis.parseXmlToJson(xmlDOM.documentElement.innerHTML);
                        console.log(jsonTry);
                        if (jsonTry !== null) {
                            var aData = jsonTry;
                            if (aData !== undefined) {
                                if (aData.COD_ERR != '0') {
                                    oThis.handleErrorMessageBoxPress(aData.DES_ERR);
                                } else {
                                    MessageBox.information(xmlDOM.getElementsByTagName("DES_ERR")[0].innerHTML);
                                    oThis.onCloseFragmentCalculadoraExtrusion();
                                }
                            } else {
                                MessageToast.show("No se han recibido " + name);
                            }
                        } else {
                            MessageToast.show("No se han recibido datos");
                        }
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        if (console && console.log) {
                            oThis.handleErrorMessageBoxPress("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                        }
                    });
                },
                cargarFragmentoFijarCanasta: function () {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var oView = this.getView();
                    var oThis = this;
                    var planta = planta;
                    var oData = {
                        "CD_PLANTA": planta,
                        "CD_PUESTO": puesto
                    };
                    if (!this.byId("dlg_FijarCanasta")) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.FijarCanasta",
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            oDialog.open();
                            oThis.enlistarCanastillaAsignadaExtrusion();
                            oThis.enlistarCanastillasDisponibleExtrusion();
                        });
                    } else {
                        this.byId("dlg_FijarCanasta").open();
                        this.enlistarCanastillaAsignadaExtrusion();
                        this.enlistarCanastillasDisponibleExtrusion();
                    }
                },
                destruirFragmentoFijarCanasta: function () {
                    this.byId("dlg_FijarCanasta").destroy();
                },
                enlistarCanastillasDisponibleExtrusion: function () {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var oData = {
                        "CD_PLANTA": planta,
                        "CD_PUESTO": puesto,
                        "USUARIO": usuario
                    }
                    var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Canastillas_Disponibles_Extrusion";
                    var tabla = "tbl_canastillasDisponiblesExtrusion";
                    var nombre = "Canastillas_Disponibles_Extrusion";
                    this._base_onloadTable(tabla, oData, path, nombre, "");
                },
                enlistarCanastillaAsignadaExtrusion: function () {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var oData = {
                        "CD_PLANTA": planta,
                        "CD_PUESTO": puesto,
                        "USUARIO": usuario
                    }
                    var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Canastillas_Asignadas_Extrusion";
                    var tabla = "tbl_canastillaAsignada";
                    var nombre = "Canastillas_Asignadas_Extrusion";
                    this._base_onloadTable(tabla, oData, path, nombre, "");
                },
                fijarCanastillaPrensa: function (oEvent) {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var tipo = "LECTURA";
                    if (oEvent.length === undefined) {
                        if (this.byId("tbl_canastillasDisponiblesExtrusion").getSelectedItem() === null) {
                            MessageBox.error("Debe seleccionar una canasta");
                            return;
                        } else {
                            var canasta = this.byId("tbl_canastillasDisponiblesExtrusion").getSelectedItem().getBindingContext().getProperty("CANASTILLA");
                        }
                    } else {
                        var canasta = oEvent;
                    }
                    if (puesto === undefined) {
                        MessageBox.error("Debe seleccionar un puesto");
                        return;
                    }
                    if (isNaN(canasta) || canasta === "") {
                        MessageBox.error("Código de canasta no válida");
                        return;
                    }
                    var oData = {
                        "CD_PLANTA": planta,
                        "CD_PUESTO": puesto,
                        "USUARIO": usuario,
                        "CODIGO": canasta,
                        "TIPO": tipo
                    }
                    var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Extrusion_Fijar";
                    var postEx = "FIJAR_CANASTA";
                    var message = "¿Asignar canasta " + canasta + " a " + puesto + " ?";
                    this.confirmarAccion(oData, path, message, postEx);
                },
                anularAsignacionCanasta: function (oEvent) {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    if (puesto === undefined) {
                        MessageBox.error("Debe seleccionar un puesto");
                        return;
                    }
                    var canasta = oEvent.getSource().getBindingContext().getProperty("CANASTILLA");
                    var oData = {
                        "CD_PLANTA": planta,
                        "CD_PUESTO": puesto,
                        "USUARIO": usuario,
                        "CODIGO": canasta
                    }
                    var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Extrusion_Fijar_Anular";
                    var postEx = "ANULAR_FIJAR_CANASTA";
                    var message = "Anular  canasta " + canasta + "en " + puesto + " ?";
                    this.confirmarAccion(oData, path, message, postEx);
                },
                asignarAuxiliarCanasta: function (oEvent) {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var codigo = this.byId("tbl_canastillaAsignada").getItems()[0].getBindingContext().getProperty("CANASTILLA");
                    var elemento = oEvent.getSource().getBindingContext().getProperty("CANASTILLA")
                    var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Auxiliar_Asignar";
                    var oData = {
                        "CD_PLANTA": planta,
                        "CODIGO": codigo,
                        "AUXILIAR": elemento,
                        "USUARIO": usuario
                    };
                    var message = "Confirmar asignación de canastilla " + elemento;
                    var postEx = "ASIGNAR_AUXILIAR_EXTRUSION";
                    this.confirmarAccion(oData, path, message, postEx)
                },
                desmontarCanastaExtrusion: function (oEvent) {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var codigo = oEvent.getSource().getBindingContext().getProperty("CANASTILLA");
                    var inp_alm = "";
                    var destino = "";
                    var almacen = "";
                    var accion = CD_ESTATUS_TERMINO_CARGA
                    var ds_accion = DS_ESTATUS_TERMINO_CARGA
                    var oData = {
                        "ACCION": accion,
                        "ALMACEN": almacen,
                        "CD_PLANTA": planta,
                        "CODIGO": codigo,
                        "DESTINO": destino,
                        "PUESTO": puesto,
                        "USUARIO": usuario
                    };
                    var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/CanastillaEstatus_Cambiar";
                    var postEx = "DESMONTAR_CANASTA";
                    var message = "Confirmar los sigiuentes datos: " + "\n\n" + "Acción: " + ds_accion + "\n" + "Canastilla: " + codigo;
                    this.confirmarAccion(oData, path, message, postEx)
                },
                onKeyCodeFijarCanasta: function (oEvent) {
                    var escaneo = oEvent.getParameter("newValue");
                    if (escaneo.length === 4) {
                        this.limpiarInputCanastaExtrusion();
                        this.fijarCanastillaPrensa(escaneo);
                    } else {
                        return;
                    }
                },
                limpiarInputCanastaExtrusion: function () {
                    this.byId("inp_FijarCanastaExtrusion").setValue("");
                },
                anularAsignacionCanastaAuxiliar: function (oEvent) {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var codigo = oEvent.getSource().getBindingContext().getProperty("CANASTILLA");
                    var elemento = oEvent.getSource().getBindingContext().getProperty("CD_AUXILIAR");
                    var path = "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/Auxiliar_Asignar_Anular";
                    var oData = {
                        "CD_PLANTA": planta,
                        "CODIGO": codigo,
                        "AUXILIAR": elemento,
                        "USUARIO": usuario
                    };
                    var message = "Confirmar DESasignación de canasta " + elemento;
                    var postEx = "ASIGNAR_AUXILIAR_EXTRUSION";
                    this.confirmarAccion(oData, path, message, postEx)
                },

                enlistarDetalleCanastilla: function (codigo) {

                    var oView = this.getView();
                    var oThis = this;

                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var puesto = this.getView().getModel("ModeloPrincipal").getProperty("/WORK_CENTER");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var oData = {
                        "CD_PLANTA": planta,
                        "CODIGO": codigo,
                        "USUARIO": usuario
                    }

                    var path = "MII/DatosTransaccionales/Produccion/Temple/Transaction/Canastilla_Items_Lista";
                    var tabla = "tbl_canastillasDetalle";
                    var nombre = "Canasta_Detalle";

                    this._base_onloadTable(tabla, oData, path, nombre, "");

                },
                cargarFragmentodetalleCanasta: function (oEvent) {

                    var oView = this.getView();
                    var oThis = this;
                    var codigo = oEvent.getSource().getBindingContext().getProperty("CANASTILLA");

                    if (!this.byId("dlg_DetalleCanasta")) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.DetalleCanasta",
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            oDialog.open();
                            oThis.enlistarDetalleCanastilla(codigo);
                        });
                    } else {
                        this.byId("dlg_DetalleCanasta").open();
                        this.enlistarDetalleCanastilla(codigo);
                    }

                },
                destruirFragmento_DetalleCanasta: function () {
                    this.byId("dlg_DetalleCanasta").destroy();
                },

                onGetListadoDadosDisponiblesMultiple: function (oPuestoTrabajo, oMaterialMAF) {
                    oPuestoTrabajo = oPuestoTrabajo;



                    let oThis = this;
                    let oView = this.getView();
                    const zeroPad = (num, places) => String(num).padStart(places, '0')
                    var oModel_data = new sap.ui.model.json.JSONModel();
                    oModel_data.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/MontajeDesmontaje/Transaction/getHerramental_sinMontar_byPuestoTrabajo_xacuteQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": oPuestoTrabajo,
                        "Param.2": oMaterialMAF
                    };
                    oModel_data.loadData(url, parameters, true, "POST");
                    oModel_data.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModel_data.getData().Rowsets.FatalError) {
                            global.functions.onMessage("E", oModel_data.getData().Rowsets.FatalError);
                            return;
                        }
                        oView.setModel(oModel_data, "dadosListModel");
                    });

                },


                //Funcion para desmontar dado del puesto de trabajo sin Mantenimiento
                onDesMontarDadosinMantenimiento: function () {
                    let oThis = this;
                    let oView = this.getView();
                    let oInputPuesto = oView.byId("input").getSelectedKey()
                    if (oInputPuesto == "") {
                        MessageToast.show("Para Desmontar un Dado debe seleccionar un Puesto de Trabajo");
                        return false;
                    }
                    let oitems_orders = oView.byId('OrdersList').getSelectedItems(),
                        order = '';
                    oitems_orders.forEach(function (item) {
                        order = item.getCells()[0].getText();
                    });
                    if (!this.dialogDesmontarDADOsinMantenimiento) {
                        this.dialogDesmontarDADOsinMantenimiento = Fragment.load({
                            id: oView.getId(),
                            name: "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.desmontarDADOsinMantenimiento",
                            controller: this
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this.dialogDesmontarDADOsinMantenimiento.then(function (oDialog) {
                        oDialog.open();
                    }.bind(this));
                },



                onCloseMDADOsinMantenimiento: function () {
                    var oView = this.getView();
                    oView.byId("desmontarDadosSinMantDialog").close();
                },


                //Funcion de la accion de desmontar dado 
                desmontarDADOsinMantenimiento: function () {
                    let tipoDesmontado = 'DESMONTADOSINMANT';
                    let inParteJSON = [];
                    let inSintomaJSON = [];

                    let puestoTrabajo = this.oView.byId('input').getSelectedKey();
                    let oView = this.getView();
                    let that = this;
                    var oModelMontarDesmontar = new sap.ui.model.json.JSONModel();
                    oModelMontarDesmontar.setSizeLimit(10000);
                    var oPath = "MII/DatosTransaccionales/Herramentales/MontajeDesmontaje/Transaction/MontajeDesmontajeDispatcher_xacuteQuery";
                    var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
                    var parameters = {
                        "Param.1": "",
                        "Param.2": puestoTrabajo,
                        "Param.3": $sapmii.IllumLoginName,
                        "Param.4": tipoDesmontado,
                        "Param.5": JSON.stringify(inParteJSON),
                        "Param.6": JSON.stringify(inSintomaJSON),
                        "Param.7": '0',
                        "Param.8": '0'
                    };

                    //return false;

                    oModelMontarDesmontar.loadData(url, parameters, true, "POST");
                    oModelMontarDesmontar.attachRequestCompleted(function () {
                        // IF Fatal Error input
                        if (oModelMontarDesmontar.getData().Rowsets.FatalError) {
                            MessageToast.show(oModelMontarDesmontar.getData().Rowsets.FatalError);
                            return;
                        }
                        let oRows = oModelMontarDesmontar.getData().Rowsets.Rowset[0].Row[0];
                        // Cierra Modal Dados
                        that.onCloseMDADOsinMantenimiento();
                        // Mensaje
                        MessageToast.show(oRows.ERR_DES);
                        // Cargar Data de Datos
                        that.onDataDadoMontado(puestoTrabajo);
                    });
                },
                get_ExtLngCorBil: function () {
                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    let puestoTrabajo = this.oView.byId('input').getSelectedKey();
                    let oitems_orders = this.getView().byId('OrdersList').getSelectedItems(),
                        order = '';
                    oitems_orders.forEach(function (item) {
                        order = item.getCells()[0].getText();
                    });
                    if (order === '') {
                        return false;
                    }
                    var oData = {
                        "Param.1": planta,
                        "Param.2": puestoTrabajo,
                        "Param.3": order
                    };
                    this._LoadData(oData, "MII/DatosTransaccionales/Produccion/Query/LongCortBillExtru___sel_0", "LngCorte");
                },
                grabar_ExtLngCorBil: function () { // 20240315

                    var valor_nuevo = this.byId("inp_ExtLngCorBil").getValue();

                    var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
                    var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
                    var path = "MII/DatosTransaccionales/Produccion/Transaction/Extrusion_LongCortBill_mod";
                    let oitems_orders = this.getView().byId('OrdersList').getSelectedItems(),
                        order = '';
                    oitems_orders.forEach(function (item) {
                        order = item.getCells()[0].getText();
                    });
                    if (order === '') {
                        MessageToast.show("Debe seleccionar una orden para Actualizar Largo");
                        return false;
                    }

                    if (isNaN(valor_nuevo) || valor_nuevo.trim() === "" || valor_nuevo.indexOf(".") > 0) {
                        MessageBox.error("Debes ingresar un número válido");
                        return;
                    }
                    if (+valor_nuevo <= 0) {
                        MessageBox.error("Debes ingresar un número válido");
                        return;
                    }

                    let oView = this.getView();
                    let puestoTrabajo = this.oView.byId('input').getSelectedKey();

                    var oData = {
                        "CD_PLANTA": planta,
                        "CD_WORK_CENTER": puestoTrabajo,
                        "CD_ORDEN": order,
                        "VALOR_NUEVO": valor_nuevo,
                        "USUARIO": usuario
                    };
                    var postEx = "MOD_LCBE_MODEL"; // LongCortBillExtr
                    var message = "¿Confirmar Cambio?";
                    this.confirmarAccion(oData, path, message, "");
                },
                onValidaConsumo: function (oEvent) {
                    var oView = this.getView();
                    var oThis = this;
                    var oButton = oEvent.getSource(); // ThumbsUp Button in the row
                    // Get binding context of the button to identify the row where the event is originated
                    var oBindingContext = oButton.getBindingContext(); // <<<-- If you have model name pass it here as string
                    var oBindingObject = oBindingContext.getObject();
                    oThis.SHOP_ORDER = oBindingObject.SHOP_ORDER;
                    var work_center_caracteristicas = this._oInput.getSelectedKey();
                    var oData = {
                        "Param.1": oThis.SHOP_ORDER
                    };
                    this._LoadData(oData, "MII/DatosTransaccionales/Produccion/Extrusion/Transaction/Get_ValidacionConsumo_xacuteQuery", "validaconsumo");

                    if (!oThis.DgValidaConsumo) {
                        oThis.DgValidaConsumo = oView.byId("controlConsumo");
                        oThis.DgValidaConsumo = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.PantallaOperador.extrusion.control_consumo", this);
                        oView.addDependent(oThis.DgValidaConsumo);
                    }
                    oView.byId("ccOrden").setText(oThis.SHOP_ORDER);
                    oThis.DgValidaConsumo.open();
                },
                onCloseControlConsumo: function () {
                    this.DgValidaConsumo.close();
                },
                ValorConsumo: function (data, tipo) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].TIPO === tipo) {
                            return data[i].VALOR;
                        }
                    }
                },
                onCancSolicitud: function (oEvent) {
                    var oThis = this;
                    var oSelectedItem = oEvent.getSource().getParent().getBindingContext("ms_asig").getObject();
                    var oData = {
                        "inSolID": oSelectedItem.SOL_ID,
                        "inEstatus": "4",
                        "inUser": $sapmii.IllumLoginName
                    };
                    console.log(oData);
                    MessageBox.warning("Se cancelara la solicitud, ¿Desea continuar?", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction == "OK") {
                                var path = "MII/DatosTransaccionales/Produccion/Calculadora/Transaction/Ins_CambiaEstatus_Solicitud";
                                oThis._Realiza_ajax(path, oData, "InstalacionAsig");
                            }
                        }
                    });
                },
                onDesintalarBillet: function (oEvent) {
                    var oThis = this;
                    var estatus = oEvent.getSource().data("estatus");
                    var oSelectedItem = oEvent.getSource().getParent().getBindingContext("ms_asig").getObject();
                    var workc = oThis._oInput.getSelectedKey();
                    var oData = {
                        "inSolAID": oSelectedItem.SBS_ID,
                        "inSolID": oSelectedItem.SOL_ID,
                        "inLote": oSelectedItem.LOTE,
                        "inUser": $sapmii.IllumLoginName,
                        "inDelete": true,
                        "inWORK_CENTER": workc
                    };
                    console.log(oData);
                    MessageBox.warning("Se desactivara el lote de la solicitud, ¿Desea continuar?", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction == "OK") {
                                var path = "MII/DatosTransaccionales/Produccion/Calculadora/Transaction/Ins_Lote_SolicitudBillet";
                                oThis._Realiza_ajax(path, oData, "InstalacionAsig");
                            }
                        }
                    });
                },


            };
        });