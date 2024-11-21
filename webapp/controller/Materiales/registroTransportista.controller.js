sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Link",
    "../../formatter/fm_status",
    "sap/ui/core/Fragment",
    'sap/ui/model/json/JSONModel',
    "sap/ui/model/Filter",
    'sap/m/MessageStrip',
    'sap/ui/core/BusyIndicator',
    "sap/ui/core/Core",
    "sap/ui/core/library",
    "sap/ui/unified/library",
    "sap/ui/unified/DateTypeRange",
    "sap/ui/core/date/UI5Date"
], function (JQuery, BaseController, MessageToast, MessageBox, Link, formatter, Fragment, JSONModel, Filter, MessageStrip, BusyIndicator, Core, CoreLibrary, UnifiedLibrary, DateTypeRange, UI5Date) {
    "use strict";
    var DocumentoGlobal = '';
    var oView;
    var oModelUbic = new sap.ui.model.json.JSONModel();
    var ValidaRemision = 0;
    var RegInfoId = 0;
    var ChoferId = 0;
    var notifs = 0;
    var TotalUnidades = 0;
    var LimiteUnidades = 60;
    var EstatusTrn;

    var CalendarDayType = UnifiedLibrary.CalendarDayType,
        ValueState = CoreLibrary.ValueState;

    return BaseController.extend("sap.ui.demo.webapp.controller.Materiales.registroTransportista", {
        formatter: formatter,

        onInit: function () {
            //jQuery.sap.getUriParameters().get("Plant")
            var oRouter = this.getRouter();
            oRouter.getRoute("registroTransportista").attachMatched(this._onRouteMatched, this);
            oView = this.getView();
            this.on_load_ubic();
            this.IntervalKPI();
            this.getUnidadesSolicitadas();

            // create model
            var oModel = new JSONModel();
            oModel.setData({
                valueDP11: UI5Date.getInstance()
            });
            this.getView().setModel(oModel);
            this._iEvent = 0;
            // for the data binding example do not use the change event for check but the data binding parsing events
            this.getView().attachParseError(
                function (oEvent) {
                    var oElement = oEvent.getParameter("element");
                    if (oElement.setValueState) {
                        oElement.setValueState(ValueState.Error);
                    }
                });
            this.getView().attachValidationSuccess(
                function (oEvent) {
                    var oElement = oEvent.getParameter("element");

                    if (oElement.setValueState) {
                        oElement.setValueState(ValueState.None);
                    }
                });
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username");
        },

        onRegistro: function () {
            // info transportista
            var
                transportista = oView.byId("reg_transportista").getSelectedKey(),
                placas = oView.byId("reg_placas").getValue(),
                plana = oView.byId("reg_plana").getValue(),
                noeco = oView.byId("reg_noeco").getValue(),
                noeco2 = oView.byId("reg_eco2").getValue(),
                plana2 = oView.byId("reg_plana2").getValue(),
                tipocamion = oView.byId("reg_tipocamion").getSelectedKey(),
                long_plana = oView.byId("reg_longplana").getValue(),
                long_plana2 = oView.byId("reg_longplana2").getValue();
            // info operador
            var
                chofer = oView.byId("reg_chofer").getValue(),
                chofer_curp = oView.byId("reg_curp").getValue(),
                telefono = oView.byId("reg_tel").getValue(),
                wtasp = oView.byId("reg_wtsp").getSelected();
            // info proceso
            var
                ciclo = oView.byId("reg_ciclo").getSelectedItem().getText(),
                obs = oView.byId("reg_obs").getValue(),
                remision = oView.byId("reg_remision").getValue(),
                tipocarga = oView.byId("reg_tpcarga").getSelectedKey(),
                salida_contenedor = oView.byId("reg_salidacontenedor").getSelected(),
                contenedor = oView.byId("reg_nocontenedor").getValue();

            // info equipo
            var
                bases = oView.byId("reg_bases").getValue(),
                cadenas = oView.byId("reg_cadenas").getValue(),
                esquineros = oView.byId("reg_esquineros").getValue(),
                bandas = oView.byId("reg_bandas").getValue(),
                barrotes = oView.byId("reg_barrotes").getValue();

            var inserta = 1;
            switch (parseInt(ciclo)) {
                case 2: //"DESCARGA":
                    inserta = ValidaRemision;
                    break;
            }
            let pattern = /^([A-Za-z]{1})([A|E|I|O|U|X|a|e|i|o|u|x]{1})([A-Za-z]{2})([0-9]{2})(0[1-9]|1[0-2])([0|1|2][0-9]|3[01])([HM]|[hm]{1})(?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)([A-Za-z]{3})([A-Za-z0-9]{2})$/g;
            let result = pattern.test(chofer_curp);
            if (tipocamion == 0 || chofer == "" || placas == "" || result != true) {
                inserta = 0;
            }
            //inserta=0;
            if (inserta == 1) {
                var aData = {
                    TRANSPORTISTA: transportista,
                    CHOFER: chofer,
                    CURP_CHOFER: chofer_curp,
                    PLACAS: placas.replace("-", ""),
                    PLANA: plana.replace("-", ""),
                    PLANA2: plana2.replace("-", ""),
                    CICLO: ciclo,
                    REMISION: remision,
                    INFOID: RegInfoId,
                    NOECONOMICO: noeco,
                    NOECONOMICO2: noeco2,
                    LONG_PLANA: long_plana,
                    LONG_PLANA2: long_plana2,
                    TIPOCAMIONID: tipocamion,
                    TIPOCARGAID: tipocarga,
                    CONTENEDOR: contenedor,
                    SALIDA_CONTENEDOR: salida_contenedor,
                    BASES: bases,
                    CADENAS: cadenas,
                    ESQUINEROS: esquineros,
                    BANDAS: bandas,
                    BARROTES: barrotes,
                    OBSERVACIONES: obs,
                    TELEFONO: telefono.replace(/\D+/g, ''),
                    WHATSAPP: wtasp,
                };
                this.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_RegistroTransporte", "Registro");
            } else {
                MessageBox.alert("Favor de validar los datos a ingresar ");
            }
        },
        onViewAsignarPuerta: function () {
            var Othis = this;
            if (!this.oDialogAPT) {
                this.oDialogAPT = oView.byId("DGAsigPuerta");
                this.oDialogAPT = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.AsignaPuerta", this);
                oView.addDependent(this.oDialogAPT);
            }
            this.oDialogAPT.onAfterRendering = function () {
                Othis._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Puerta", "apt_puerta");
            }
            this.oDialogAPT.open();

        },
        onCloseAsignaPuerta: function () {
            this.oDialogAPT.close();
        },
        onAsignaPuerta: function () {
            var puerta = oView.byId("apt_puerta").getSelectedKey();
            var transporte = oView.byId("acc_tarj").getValue();
            var aData = {
                TRANSPORTE: transporte,
                PUERTA: puerta,
                DESTINO: "",
                CLIENTE: 0,
                MENOR5: 0,
                ENTRE5A10: 0,
                MAYOR10: 0,
                PAQUETES: 0,
                REASIGNACION: 0,
                USUARIO: "VIGILANCIA"
            };
            this.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_SolicitaLogistica");
            this.onCloseAsignaPuerta();
        },
        onRegAcceso: function () {
            var oThis = this;
            var transporte = oView.byId("acc_tarj").getValue();
            var aData = {
                TRANSPORTE: transporte,
                INGRESO: true,
                SALIDA: false
            };
            var tund = TotalUnidades + 1;
            TotalUnidades++;
            if (tund >= LimiteUnidades) {
                MessageBox.warning("Ya se encuentra al 100% la planta, ¿Deseas Continuar?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction == "OK") {
                            oThis.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_Transporte_IngresoSalida", "Ingreso");
                        }
                    }
                });
            } else {
                this.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_Transporte_IngresoSalida", "Ingreso");
            }
        },
        onAccesoLogistica: function (transporte) {
            var oThis = this;
            var aData = {
                TRANSPORTE: transporte,
                INGRESO: true,
                SALIDA: false
            };
            var tund = TotalUnidades + 1;
            TotalUnidades++;
            if (tund >= LimiteUnidades) {
                MessageBox.warning("Ya se encuentra al 100% la planta, ¿Deseas Continuar?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction == "OK") {
                            oThis.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_Transporte_IngresoSalida", "Logistica");
                        }
                    }
                });
            } else {
                this.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_Transporte_IngresoSalida", "Logistica");
            }
        },
        onReImprimirBoleta: function () {
            if (!this.oDialogRB) {
                this.oDialogRB = oView.byId("DGRIMPB");
                this.oDialogRB = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.ReImprimirBoleta", this);
                oView.addDependent(this.oDialogRB);
            }
            this.oDialogRB.open();
        },
        onCloseReimpimir: function () {
            this.oDialogRB.close();
        },
        onRegSalida: function () {
            var transporte = oView.byId("sal_tarj").getValue();
            var aData = {
                TRANSPORTE: transporte,
                INGRESO: false,
                SALIDA: true
            };
            this.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_Transporte_IngresoSalida", "Salida");
        },
        onValidaRemision: function () {
            var rem = oView.byId("reg_remision").getValue();
            var oThis = this;
            if (rem !== "") {
                BusyIndicator.show(0);
                var oData = {
                    REMISION: rem
                };
                var path = "MII/DatosTransaccionales/Transportes/Transaction/Validar_Remision_Pedido";
                var uri = "/XMII/Runner?Transaction=" + path +
                    "&OutputParameter=JsonOutput&Content-Type=text/xml";
                uri = uri.replace(/\s+/g, '');
                $.ajax({
                    type: "POST",
                    url: uri,
                    dataType: "xml",
                    cache: false,
                    data: oData,
                    success: function (xml) {
                        var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData.ERROR !== undefined) {
                            MessageBox.alert(aData.ERROR);
                            //oThis.getOwnerComponent().openHelloDialog();
                        } else {
                            if (aData.TIPO == "REMISION") {
                                oView.byId("reg_remision").setValue(aData.ORDCOMPRA);
                            }
                            oView.byId("reg_transportista").setSelectedKey(aData.PROVEEDOR);
                            //oView.byId("reg_placas").setValue(aData.PLACAS_TRACTO);
                            //oView.byId("reg_plana").setValue(aData.PLACAS_PLANA);
                            //oView.byId("reg_plana2").setValue(aData.PLACAS_PLANA2);
                            //oView.byId("reg_transportista").setSelectedKey(aData.PROVEEDOR);
                            //oView.byId("reg_chofer").setValue(aData.CHOFER);
                            //oView.byId("reg_tipocamion").setSelectedKey(aData.TIPOCAMION);
                            ValidaRemision = 1;
                        }
                        BusyIndicator.hide();
                        console.log(ValidaRemision);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log("ERROR");
                        BusyIndicator.hide();
                    }
                });
            } else {
                //oThis.getOwnerComponent().openHelloDialog("Favor de ingresar pedido o remision");
                //alert("");
                MessageBox.alert("Favor de ingresar pedido o remision");
            }
        },
        onValidaTelefono: function () {
            var tel = oView.byId("reg_tel").getValue();
            var oThis = this;
            if (tel !== "") {
                var oData = {
                    TELEFONO: tel.replace(/\D+/g, ''),
                    TIPO: "VALIDANUM"
                };
                var path = "MII/DatosTransaccionales/Transportes/Transaction/MensajeWhatsapp";
                var uri = "/XMII/Runner?Transaction=" + path +
                    "&OutputParameter=JsonOutput&Content-Type=text/xml";
                uri = uri.replace(/\s+/g, '');
                $.ajax({
                    type: "POST",
                    url: uri,
                    dataType: "xml",
                    cache: false,
                    data: oData,
                    success: function (xml) {
                        var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData.ERROR !== undefined) {
                            MessageBox.alert(aData.ERROR);
                            //oThis.getOwnerComponent().openHelloDialog();
                        } else {
                            console.log(aData);
                            if (aData.res.status == "valid") {
                                oView.byId("reg_wtsp").setSelected(true);
                                oView.byId("txt_wtsp").setText("");
                            } else {
                                oView.byId("reg_wtsp").setSelected(false);
                                oView.byId("txt_wtsp").setText("No tiene Whatsapp");
                            }
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log("ERROR");
                    }
                });
            } else {
                //oThis.getOwnerComponent().openHelloDialog("Favor de ingresar pedido o remision");
                //alert("");
                MessageBox.alert("Favor de ingresar telefono");
            }
        },

        onRegistrarUnidad: function () {
            var Othis = this;
            if (!this.oDialogRU) {
                this.oDialogRU = oView.byId("DGIngresoTransporte");
                this.oDialogRU = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Ingreso", this);
                oView.addDependent(this.oDialogRU);

                this.oDialogRU.onBeforeClose = function () {
                    this.oDialogRU.destroy();
                };

            }
            this.oDialogRU.onAfterRendering = function () {
                var oData = { "Param.1": "VT_C_PROCESO" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "ciclo");

                Othis.onChangeCiclo();
                oData = { "Param.1": "VT_C_TIPOCARGA" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "tipocarga");
                oData = { "Param.1": "VT_C_TVEHICULO" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "tipocamion");

                oData = { "Param.1": "VT_C_MARCAS" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "marcas");
                oData = { "Param.1": "VT_C_COLOR" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "color");


                oData = { "Param.1": "VT_C_LONG_REMOLQUE" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "long_plana");

                Othis._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Proveedor_v2", "transporte");

                Othis.onClearDialog();
                oView.byId("reg_placas").setValue("");
                oView.byId("reg_ciclo").setSelectedKey("1");
                Othis.onChangeCiclo();
            }

            this.oDialogRU.open();
        },

        onSearchPlaca: function (oEvent) {
            this.onClearDialog();
            var idObj = "reg_placas";
            var oInput = this.byId("reg_placas").getValue(),
                oData = { "Param.1": oInput },
                oThis = this,
                oPath = "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Info_list";

            oThis._LoadData(oData, oPath, "placas");
            oThis.byId(idObj).setValue(oInput);
        },
        onSelectPlaca: function (oEvent) {
            var oItem = oEvent.getParameter("selectedRow");
            if (oItem !== undefined || oItem !== null) {
                var oBindingContext = oItem.getBindingContext('placas');
                RegInfoId = oBindingContext.getProperty('INFOID');
                this.onSetDetail(oBindingContext);
            }
        },
        onSearchCurp: function (oEvent) {
            var idObj = "in_curp";
            var oInput = this.byId(idObj).getValue(),
                oData = { "Param.1": "UPPER(CURP) LIKE UPPER('" + oInput + "%')" },
                oThis = this,
                oPath = "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Chofer";

            oThis._LoadData(oData, oPath, "curp");
            oThis.byId(idObj).setValue(oInput);
            oView.byId("btn_validacurp").setVisible(true);
            oView.byId("in_chofer").setValue("");
            oView.byId("in_tel").setValue("");
            oView.byId("in_wtsp").setSelected(false);
        },
        onSelectCurp: function (oEvent) {
            var oItem = oEvent.getParameter("selectedRow");
            if (oItem !== undefined || oItem !== null) {
                var oBindingContext = oItem.getBindingContext('curp');
                ChoferId = oBindingContext.getProperty('OPERADORID');
                this.onSetDetailCurp(oBindingContext);
            }
        },
        NuevoTransporte: function () {
            oView.byId("reg_placas").setShowSuggestion(false);
            RegInfoId = 0;
        },
        onSetDetail(data) {
            //datos ciclo
            oView.byId("reg_ciclo").setSelectedKey(data.getProperty('PROCESOREALIZA'));
            this.onChangeCiclo();
            // datos transporte
            if (data.getProperty('PROCESOREALIZA') !== "CHATARRA") {
                oView.byId("reg_tipocamion").setSelectedKey(data.getProperty('TIPOCAMIONID'));
                this.onChangeTipoCamion();
            }
            if (data.getProperty('PROCESOREALIZA') == "CARGA") {
                /*   oView.byId("reg_tpcarga").setSelectedKey(data.getProperty('TIPOCARGAID')); */
                oView.byId("reg_tpcarga").setValue('');
                oView.byId("reg_bandas").setValue(data.getProperty('BANDAS'));
                oView.byId("reg_barrotes").setValue(data.getProperty('BARROTES'));
                oView.byId("reg_bases").setValue(data.getProperty('BASES'));
                oView.byId("reg_cadenas").setValue(data.getProperty('CADENAS'));
                oView.byId("reg_esquineros").setValue(data.getProperty('ESQUINEROS'));
            }
            //this.onRefreshTransport();
            oView.byId("reg_transportista").setSelectedKey(data.getProperty('LINEA'));
            oView.byId("reg_chofer").setValue(data.getProperty('CHOFER'));
            oView.byId("reg_plana").setValue(data.getProperty('PLACAS_PLANA'));
            oView.byId("reg_longplana").setValue(data.getProperty('LONG_PLANA'));
            oView.byId("reg_noeco").setValue(data.getProperty('NO_ECONOMICO'));
            oView.byId("reg_tel").setValue(data.getProperty('TELEFONO'));
            if (data.getProperty('WHATSAPP') == "1")
                oView.byId("reg_wtsp").setSelected(true);
            else
                oView.byId("reg_wtsp").setSelected(false);
            oView.byId("reg_transportista").setSelectedKey(data.getProperty('LINEA'));
            oView.byId("reg_curp").setValue(data.getProperty('CURP'));
        },
        onSetDetailCurp: function (data) {
            oView.byId("in_curp").setValue(data.getProperty('CURP'));
            oView.byId("in_chofer").setValue(data.getProperty('NOMBRE'));
            oView.byId("in_tel").setValue(data.getProperty('TELEFONO'));
            oView.byId("btn_vcurp").setVisible(false);
            if (data.getProperty('WHATSAPP') == "1")
                oView.byId("in_wtsp").setSelected(true);
            else
                oView.byId("in_wtsp").setSelected(false);
        },
        onCloseRegistroUnidad: function () {
            this.oDialogRU.close();
        },

        onTblRegistros: function (estatus) {
            var Othis = this;
            EstatusTrn = estatus;
            oView.getModel().setProperty('/TituloDetalle', "Detalle " + estatus.replace("_", " "));
            if (!this.oDialogR) {
                this.oDialogR = oView.byId("DGTBL");
                this.oDialogR = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Registros", this);
                oView.addDependent(this.oDialogR);
                this.oDialogR.onAfterRendering = function () {
                    oView.byId("KTVIG").setVisible(true);
                    var oData = {
                        "ESTATUS": EstatusTrn,
                        "PAGINA": "VIGILANCIA"
                    }
                    Othis._base_onloadTable("KTVIG", oData, "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Ubic", "Reporte", "");
                    oView.byId("rs_baja").setVisible(true);
                }
            }
            this.oDialogR.open();
        },
        CancelarRegistro: function (oEvent) {
            var oSelectedItem = oEvent.getSource().getParent();
            var oBindingContext = oSelectedItem.getBindingContext();
            var transporte = oBindingContext.getProperty('TRANSPORTE');
            var oThis = this;
            if (!this.oRejectDialog) {
                this.oRejectDialog = new sap.m.Dialog({
                    title: "Cancelacion Transporte",
                    type: sap.m.DialogType.Message,
                    content: [
                        new sap.m.Label({
                            text: "Se desea cancelar este transporte: " + transporte,
                            labelFor: "n_canc"
                        }),
                        new sap.m.TextArea("n_canc", {
                            width: "100%",
                            maxLength: 100,
                            rows: 4,
                            showExceededText: true,
                            placeholder: "Ingrese comentarios sobre la cancelacion"
                        })
                    ],
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Attention,
                        text: "Continuar",
                        press: function () {
                            var obs = Core.byId("n_canc").getValue();
                            var aData = {
                                TRANSPORTE: transporte,
                                COMENTARIO: obs,
                            };
                            if (obs != "") {
                                this.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Cancelar_Transporte", "Cancelar");
                                this.oRejectDialog.destroy();
                                this.oRejectDialog = null;
                            } else {
                                MessageBox.alert("Favor de agregar un comentario sobre la cancelacion");
                            }

                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancelar",
                        press: function () {
                            this.oRejectDialog.destroy();
                            this.oRejectDialog = null;
                        }.bind(this)
                    })
                });
            }

            this.oRejectDialog.open();
        },
        onTblContenedores: function () {
            var oThis = this;
            if (!this.oDialogCTN) {
                this.oDialogCTN = oView.byId("DGCTN");
                this.oDialogCTN = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Contenedores", this);
                oView.addDependent(this.oDialogCTN);
                this.oDialogCTN.onAfterRendering = function () {
                    oThis._base_onloadTable("KTCTN", "", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Contenedores", "Reporte", "");
                }
            }
            this.oDialogCTN.open();
        },

        onCloseTblRegistros: function () {
            this.oDialogR.close();
        },
        onCloseTblContenedores: function () {
            this.oDialogCTN.close();
        },

        onEntrada: function () {
            if (!this.oDialogA) {
                this.oDialogA = oView.byId("DGAccesoTransporte");
                this.oDialogA = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.AccesoTransporte", this);
            }
            this.oDialogA.open();
            this.byId("acc_tarj").setValue("");
        },
        onCloseEntrada: function () {
            this.oDialogA.close();
        },

        onSalida: function () {
            if (!this.oDialogS) {
                this.oDialogS = oView.byId("DGSalidaTransporte");
                this.oDialogS = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.SalidaTransporte", this);
            }
            this.oDialogS.open();
            this.byId("sal_tarj").setValue("");
        },
        onCloseSalida: function () {
            this.oDialogS.close();
        },
        onChangeCiclo: function () {
            var btnrem = oView.byId("btn_schrem");
            var ciclo = oView.byId("reg_ciclo").getSelectedKey();
            oView.getModel().setProperty('/EquipoVisible', false);
            oView.getModel().setProperty('/DescargaVisible', false);
            oView.getModel().setProperty('/Contenedor', false);
            oView.getModel().setProperty('/OtroVisible', false);
            oView.getModel().setProperty('/CargaVisible', false);
            switch (parseInt(ciclo)) {
                case 2: // "DESCARGA":
                    ValidaRemision = 0;
                    oView.getModel().setProperty('/DescargaVisible', true);
                    break;
                case 1: //"CARGA":
                    ValidaRemision = 1;
                    oView.getModel().setProperty('/EquipoVisible', true);
                    oView.getModel().setProperty('/CargaVisible', true);
                    break;
                case 3: //"CHATARRA":
                    ValidaRemision = 1;
                    oView.byId("reg_tipocamion").setSelectedKey(3);
                    oView.getModel().setProperty('/Contenedor', true);
                    break;
                case 4: //"OTRO":
                    ValidaRemision = 1;
                    oView.getModel().setProperty('/OtroVisible', true);
                    break;
            }
            this.onChangeTipoCamion();
        },
        onRefreshTransport() {
            var tpcm = oView.byId("reg_tipocamion").getSelectedKey();
            var tpcarga = oView.byId("reg_tpcarga").getSelectedKey();
            var ciclo = oView.byId("reg_ciclo").getSelectedKey();
            switch (parseInt(ciclo)) {
                case 4: //"CHATARRA":
                    var aData = {
                        CANAL: "80"
                    }
                    this._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Clientes", "transporte");
                    //this._onload("reg_transportista", aData, "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Clientes", "Proveedor");
                    break;
                case 1: //"CARGA":
                    if (tpcarga == "4") {
                        this._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Clientes", "transporte");
                        //this._onload("reg_transportista", "", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Clientes", "Proveedor");
                    } else {
                        this._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Proveedor", "transporte");
                        //this._onload("reg_transportista", "", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Proveedor", "Proveedor");
                    }
                    break;
                default:
                    this._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Proveedor", "transporte");
                    //this._onload("reg_transportista", "", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Proveedor", "Proveedor");
                    break;
            }
        },
        onViewContenedor: function () {
            if (!this.oDialogCTN) {
                this.oDialogCTN = oView.byId("DGCTN");
                this.oDialogCTN = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Contenedores", this);
                oView.addDependent(this.oDialogCTN);
            }
            this.oDialogCTN.open();
            oView.byId("rs_select").setVisible(true);
            oView.byId("cnt_nuevo").setVisible(true);
            var oData = {
                PRVID: oView.byId("reg_transportista").getSelectedKey(),
            };
            this._base_onloadTable("KTCTN", oData, "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Contenedores", "Reporte", "");
        },
        onSelCont: function (oEvent) {
            var oSelectedItem = oEvent.getSource().getParent();
            var oBindingContext = oSelectedItem.getBindingContext();
            var cont = oBindingContext.getProperty('CONTENEDOR');
            oView.byId("reg_nocontenedor").setValue(cont);
            oView.byId("reg_salidacontenedor").setSelected(true);
            this.oDialogCTN.close();
        },
        onNuevoContenedor: function () {
            oView.byId("reg_nocontenedor").setValue("");
            oView.byId("reg_nocontenedor").setEnabled(true);
            oView.byId("reg_salidacontenedor").setSelected(false);
            this.oDialogCTN.close();
        },

        onChangeTipoCamion: function () {
            var tpcm = oView.byId("reg_tipocamion").getSelectedKey();
            var tpcarga = oView.byId("reg_tpcarga").getSelectedKey();
            var ciclo = oView.byId("reg_ciclo").getSelectedKey();
            //oView.byId("reg_placas").setValue("");
            //oView.byId("reg_transportista").setValue("");
            //oView.byId("reg_chofer").setValue("");
            //oView.byId("reg_plana").setValue("");
            //oView.byId("reg_noeco").setValue("");
            oView.getModel().setProperty('/Full', false);
            oView.getModel().setProperty('/Contenedor', false);
            oView.getModel().setProperty('/PlacasPlana', true);
            //console.log(ciclo + "|||" + tpcm);	
            oView.byId("lblprov_cliente").setLabel("Linea Transporte");
            oView.byId("lblplacasplana").setLabel("Placas Plana");
            oView.byId("reg_plana").setPlaceholder("Ingresa Placas");
            oView.byId("NoEconomico").setLabel("No Economico");
            oView.byId("reg_noeco").setPlaceholder("Ingresa No Economico");
            oView.byId("reg_transportista").setPlaceholder("Selecciona Transportista / Proveedor");
            switch (tpcm) {
                case "3"://Contenedor
                    if (ciclo == "CHATARRA") {
                        oView.getModel().setProperty('/Contenedor', true);
                        oView.getModel().setProperty('/PlacasPlana', false);
                        oView.byId("lblprov_cliente").setLabel("Cliente");
                        oView.byId("reg_transportista").setPlaceholder("Ingresa Cliente");
                    } else {
                        oView.byId("lblplacasplana").setLabel("Placas Contenedor");
                        oView.byId("reg_plana").setPlaceholder("Ingresa Placa Contenedor");
                    }
                    break;
                case "4"://Camioneta
                case "2"://Torton
                    oView.getModel().setProperty('/PlacasPlana', false);
                    break;
                case "1"://Tractor
                    oView.getModel().setProperty('/Full', true);
                    break;
            }
            //this.onRefreshTransport();
        },
        EsFullChange: function (oEvent) {
            oView.byId("reg_plana2").setValue("");
            var checked = oEvent.getParameter("selected");
            oView.getModel().setProperty('/FullVisible', false);
            if (checked) {
                oView.getModel().setProperty('/FullVisible', true);
            }
        },
        on_load_ubic: function () {
            var path = "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Ubic_KPI";
            var uri = "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            oModelUbic.setData(null);
            var oThis = this;
            $.ajax({
                type: "POST",
                url: uri,
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                    var aData = JSON.parse(opElement.firstChild.data);
                    var total = 0;
                    var ocupacion = 0;
                    var espera = parseInt(oThis.filterJsonKPI(aData.ITEMS, "EN_ESPERA"));
                    var fila_bascula = parseInt(oThis.filterJsonKPI(aData.ITEMS, "FILA_BASCULA"));
                    var pend_carga = parseInt(oThis.filterJsonKPI(aData.ITEMS, "PEND_CARGA"));
                    var pend_descarga = parseInt(oThis.filterJsonKPI(aData.ITEMS, "PEND_DESCARGA"));
                    var pend_factura = parseInt(oThis.filterJsonKPI(aData.ITEMS, "PEND_FACTURA"));
                    var fila_salida = parseInt(oThis.filterJsonKPI(aData.ITEMS, "FILA_SALIDA"));
                    var contenedor = parseInt(oThis.filterJsonKPI(aData.ITEMS, "CONTENEDOR"));
                    var otro = parseInt(oThis.filterJsonKPI(aData.ITEMS, "OTRO"));
                    total = fila_bascula + pend_carga + pend_descarga + pend_factura + fila_salida + otro;
                    ocupacion = parseInt(Math.round((total / LimiteUnidades) * 100));
                    TotalUnidades = parseInt(total);
                    oModelUbic.setData({
                        TOTAL: total,
                        OCUPACION: ocupacion,
                        ESPERA: espera,
                        FILA_BASCULA: fila_bascula,
                        PEND_CARGA: pend_carga,
                        PEND_DESCARGA: pend_descarga,
                        PEND_FACTURA: pend_factura,
                        FILA_SALIDA: fila_salida,
                        CONTENEDOR: contenedor,
                        OTRO: otro,
                    });
                    oView.setModel(oModelUbic, "data");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },
        filterJsonKPI(JSON, UBIC) {
            var resp = JSON.filter(function (item) { return item.UBICACION == UBIC });
            var cantidad = (resp.length == 0 ? 0 : resp[0].CANTIDAD);
            return cantidad;
        },

        Realiza_registro(oData, path, tipo) {
            var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
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
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData.ERROR !== undefined && aData.ERROR !== "" && aData.ERROR !== "---") {
                            //oThis.getOwnerComponent().openHelloDialog(aData.ERROR);
                            switch (tipo) {
                                case "Ingreso":
                                    if (aData.ET == "W" && aData.ET !== undefined) {
                                        oThis.onViewAsignarPuerta();
                                    } else {
                                        MessageBox.alert(aData.ERROR);
                                    }
                                    break;
                                default:
                                    MessageBox.alert(aData.ERROR);
                                    break;
                            }
                        }
                        else {
                            //Create  the JSON model and set the data
                            //MessageToast.show(aData.MESSAGE);
                            oThis.on_load_ubic();
                            switch (tipo) {
                                case 'Registro':
                                    oThis.onCloseRegistroUnidad();
                                    break;
                                case 'Ingreso':
                                    oThis.onCloseEntrada();
                                    oThis.GeneraBoletaIngreso(oData.TRANSPORTE);
                                    break;
                                case 'Logistica':
                                    oThis.GeneraBoletaIngreso(oData.TRANSPORTE);
                                    break;
                                case 'Salida':
                                    oThis.onCloseSalida();
                                    break;
                                case 'Cancelar':
                                    oThis.onCloseTblRegistros();
                                    break;
                            }
                        }
                    } else {
                        MessageBox.alert("La solicitud ha fallado: ¿Hay conexión de red?");
                    }
                    sap.ui.core.BusyIndicator.hide();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud a fallado: " + textStatus);
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },
        onClearDialog: function () {
            oView.byId("reg_placas").setShowSuggestion(true);
            //oView.byId("reg_remision").setValue("");
            //oView.byId("reg_tarjeton").setValue("");
            oView.byId("reg_transportista").setValue("");
            oView.byId("reg_curp").setValue("");
            oView.byId("reg_chofer").setValue("");
            //oView.byId("reg_placas").setValue("");
            oView.byId("reg_plana").setValue("");
            //oView.byId("reg_longplana").setValue("");
            oView.byId("reg_longplana").setSelectedKey("");
            oView.byId("reg_plana2").setValue("");
            oView.byId("reg_longplana2").setValue("");
            oView.byId("reg_noeco").setValue("");
            oView.byId("reg_eco2").setValue("");
            //oView.byId("reg_bases").setValue("");
            //oView.byId("reg_cadenas").setValue("");
            //oView.byId("reg_esquineros").setValue("");
            //oView.byId("reg_bandas").setValue("");
            //oView.byId("reg_barrotes").setValue("");
            oView.byId("reg_tel").setValue("");
            oView.byId("reg_obs").setValue("");
            oView.byId("reg_ciclo").setSelectedKey("");
            oView.byId("reg_tipocamion").setSelectedKey("");
            oView.byId("reg_tipocamion").setEnabled(true);
            oView.byId("reg_full").setSelected(false);
            oView.byId("reg_wtsp").setSelected(false);
            //oView.byId("reg_nocontenedor").setValue("");
            //oView.byId("reg_nocontenedor").setEnabled(false);
            ValidaRemision = 0;
            RegInfoId = 0;
            oView.getModel().setProperty('/EquipoVisible', false);
            oView.getModel().setProperty('/DescargaVisible', false);
            oView.getModel().setProperty('/FullVisible', false);
            oView.getModel().setProperty('/Full', false);
            oView.getModel().setProperty('/OtroVisible', false);
            oView.getModel().setProperty('/Contenedor', false);
            oView.getModel().setProperty('/CargaVisible', false);
            //this._onload("reg_transportista", "", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Proveedor", "Proveedor");
            //this._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Proveedor", "transporte");
        },

        onClearCatDialog: function () {
            oView.byId("in_curp").setValue("");
            oView.byId("in_chofer").setValue("");
            oView.byId("in_wtsp").setSelected(false);
            oView.byId("in_tel").setValue("");
            oView.byId("ilicencia").setValue("");
            oView.byId("DP2").setValue("")
            oView.byId("DP2").setInitialFocusedDateValue(UI5Date.getInstance());
            oView.byId("iedo_lic").setValue("");
            oView.byId("inss").setValue("");

            oView.byId("in_transportista").setSelectedKey("");
            oView.byId("in_transportista").setEnabled(true);
            oView.byId("in_placas").setShowSuggestion(true);
            oView.byId("in_placas").setValue("");
            oView.byId("in_tipocamion").setSelectedKey("");
            oView.byId("in_tipocamion").setEnabled(true);
            oView.byId("Marca").setSelectedKey("");
            oView.byId("Marca").setEnabled(true);
            oView.byId("Color").setSelectedKey("");
            oView.byId("Color").setEnabled(true);
            oView.byId("DP11").setValue("")
            oView.byId("DP11").setInitialFocusedDateValue(UI5Date.getInstance());
            oView.byId("reg_Serie").setValue("");
            oView.byId("reg_Poliza").setValue("");
            oView.byId("DP1").setValue("")
            oView.byId("DP1").setInitialFocusedDateValue(UI5Date.getInstance());
            oView.byId("reg_gps").setSelected(false);

            oView.byId("in_trans_plana").setSelectedKey("");
            oView.byId("in_trans_plana").setEnabled(true);
            oView.byId("in_plana").setValue("");
            oView.byId("in_plataforma").setValue("");
            oView.byId("in_tipo").setSelectedKey("");
            oView.byId("in_tipo").setEnabled(true);
            oView.byId("reg_Polizap").setValue("");
            oView.byId("DP3").setValue("")
            oView.byId("DP3").setInitialFocusedDateValue(UI5Date.getInstance());
            oView.byId("in_longplana").setSelectedKey("");
            oView.byId("in_longplana").setEnabled(true);

            // oView.getModel().setProperty('/FcOperador', false);
            // oView.getModel().setProperty('/FcTransporte', false);
            // oView.getModel().setProperty('/FcRemolque', false);
            // oView.getModel().setProperty('/BtnBack', false);
            // oView.getModel().setProperty('/BtnACh', true);
            // oView.getModel().setProperty('/BtnACa', true);
            // oView.getModel().setProperty('/BtnARe', true);

            oView.getModel().setProperty('/FcOperador', true);
            oView.getModel().setProperty('/FcTransporte', true);
            oView.getModel().setProperty('/FcRemolque', true);
            oView.getModel().setProperty('/BtnBack', true);
            oView.getModel().setProperty('/BtnACh', true);
            oView.getModel().setProperty('/BtnACa', true);
            oView.getModel().setProperty('/BtnARe', true);

            // ValidaRemision = 0;
            // RegInfoId = 0;
            // oView.getModel().setProperty('/EquipoVisible', false);
            // oView.getModel().setProperty('/DescargaVisible', false);
            // oView.getModel().setProperty('/FullVisible', false);
            // oView.getModel().setProperty('/Full', false);
            // oView.getModel().setProperty('/OtroVisible', false);
            // oView.getModel().setProperty('/Contenedor', false);
            // oView.getModel().setProperty('/CargaVisible', false);
            //this._onload("reg_transportista", "", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_Proveedor", "Proveedor");
            //this._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Proveedor", "transporte");
        },

        IntervalKPI: function () {
            var oThis = this;
            this.KPIinterval = setInterval(function () {
                oThis.on_load_ubic();
            }, 60000);
            this.UnidSolct = setInterval(function () {
                oThis.getUnidadesSolicitadas();
            }, 40000);
        },

        getUnidadesSolicitadas: function () {
            oView.byId("Vmsg_solicitud").destroyContent();
            var path = "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_SolicitadosLogistica";
            var uri = "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            var Othis = this;
            $.ajax({
                async: false,
                type: "POST",
                crossDomain: true,
                url: uri,
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                    var aData = JSON.parse(opElement.firstChild.data);
                    $.each(aData.ITEMS, function (index, obj) {
                        var tarjetonlink = new Link({
                            text: obj.TRANSPORTE,
                            press: function (oEvent) {
                                Othis.onAccesoLogistica(obj.TRANSPORTE);
                            }
                        });
                        var sText = obj.AREA + " solicita el ingreso del transporte : ",
                            oVC = oView.byId("Vmsg_solicitud"),
                            oMsId = "msgStrip" + notifs,
                            oMsgStrip = new MessageStrip(oMsId, {
                                text: sText,
                                showCloseButton: false,
                                showIcon: true,
                                link: tarjetonlink,
                                type: "Information"
                            });
                        oVC.addContent(oMsgStrip);
                        notifs++;
                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        ReImprimirBoleta: function () {
            var transporte = oView.byId("rb_trans").getValue();
            this.GeneraBoletaIngreso(transporte);
        },
        GeneraBoletaIngreso: function (TRANSPORTE) {
            var path = 'MII/DatosTransaccionales/Transportes/Transaction/Get_BoletaCarga',
                uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=pdfString&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');

            sap.ui.core.BusyIndicator.show(0);
            var oThis = this;
            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: {
                    "TRANSPORTE": TRANSPORTE
                }
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    if (opElement.firstChild !== null) {
                        var decodedPdfContent = atob(opElement.firstChild.data);
                        var byteArray = new Uint8Array(decodedPdfContent.length)
                        for (var i = 0; i < decodedPdfContent.length; i++) {
                            byteArray[i] = decodedPdfContent.charCodeAt(i);
                        }
                        var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
                        var blobUrl = URL.createObjectURL(blob);
                        jQuery.sap.addUrlWhitelist("blob");

                        oView.setModel(new sap.ui.model.json.JSONModel({
                            data: blobUrl,
                            tarjeton: TRANSPORTE
                        }), "test");
                        oThis.onPDF();
                    }
                    else {
                        MessageBox.alert("La solicitud ha fallado: �Hay conexi�n de red?");
                    }
                    sap.ui.core.BusyIndicator.hide();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud a fallado: " + textStatus);
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        onCloseViewPdf: function () {
            this.oDialog.close();
        },

        onPDF: function () {
            if (!this.oDialog) {
                this.oDialog = oView.byId("ControlCargaPDF");
                // create dialog via fragment factory
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.ControlCarga", this);
                oView.addDependent(this.oDialog);
            }
            this.oDialog.open();
        },

        Penalizacion: function () {
            var oThis = this;
            if (!this.oPDialog) {
                this.oPDialog = new sap.m.Dialog({
                    contentWidth: "40%",
                    title: "Genera Penalizacion",
                    content: [
                        new sap.ui.layout.form.SimpleForm("sf_penalizacion", {
                            editable: true,
                            content: [
                                new sap.m.Label({
                                    text: "Transporte",
                                }),
                                new sap.m.Input("p_poc", {
                                    placeholder: "Ingresa Transporte"
                                }),
                                new sap.m.Label({
                                    text: "¿A quien se penalizara?",
                                }),
                                new sap.m.RadioButtonGroup("p_opcions", {
                                    columns: 2,
                                    buttons: [
                                        new sap.m.RadioButton("r_tracto", {
                                            text: "TRACTO"
                                        }),
                                        new sap.m.RadioButton("r_operador", {
                                            text: "OPERADOR"
                                        })
                                    ]
                                }),
                                new sap.m.Label({
                                    text: "Comentarios",
                                }),
                                new sap.m.Input("p_comentario", {
                                    placeholder: "Ingresa Comentarios"
                                }),
                            ]
                        })
                    ],
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: "Generar",
                        press: function () {
                            var poc = sap.ui.getCore().byId("p_poc").getValue(),
                                com = sap.ui.getCore().byId("p_comentario").getValue(),
                                rd = sap.ui.getCore().byId("p_opcions").getSelectedButton(),
                                user = oView.byId("username").getText();
                            console.log(rd);
                            var op = rd.getText();
                            if (poc != "" && com != "") {
                                var aData = {
                                    "POC": poc,
                                    "OPCION": op,
                                    "COMENTARIO": com,
                                    "USUARIO": user,
                                };
                                console.log(aData);
                                this.Realiza_registro(aData, "MII/DatosTransaccionales/Transportes/Transaction/Ins_Transporte_Penalizacion", "Genera_Penalizacion");
                            } else {
                                MessageBox.alert("¡Favor de ingresar la informacion completa para la penalizacion!");
                            }
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        icon: "sap-icon://sys-cancel-2",
                        type: sap.m.ButtonType.Reject,
                        press: function () {
                            this.oPDialog.destroy();
                            this.oPDialog = undefined;
                        }.bind(this)
                    })
                });
            }
            this.oPDialog.open();
        },

        onCatalogo: function () {
            var Othis = this;
            if (!this.oDialogCat) {
                this.oDialogCat = oView.byId("DGCatalogos");
                this.oDialogCat = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.Vehiculo", this);
                oView.addDependent(this.oDialogCat);
                this.oDialogCat.onBeforeClose = function () {
                    this.oDialogCat.destroy();
                };
            }

            this.oDialogCat.onAfterRendering = function () {
                var oData = { "Param.1": "VT_C_PROCESO" };

                oData = { "Param.1": "VT_C_TIPOCARGA" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "tipocarga");
                oData = { "Param.1": "VT_C_TVEHICULO" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "tipocamion");
                oData = { "Param.1": "VT_C_MARCAS" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "marcas");
                oData = { "Param.1": "VT_C_COLOR" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "color");
                oData = { "Param.1": "VT_C_TREMOLQUE" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "tiporemolque");
                oData = { "Param.1": "VT_C_LONG_REMOLQUE" };
                Othis._LoadData(oData, "MII/DatosTransaccionales/Transportes/Query/Get_catalogo", "long_plana");

                Othis._LoadData("", "MII/DatosTransaccionales/Transportes/Query/Get_Transporte_Proveedor_v2", "transporte");

                Othis.onClearCatDialog();

            }

            this.oDialogCat.open();
        },

        onCloseCat: function () {
            this.oDialogCat.close();
        },


        onAChofer: function () {
            oView.getModel().setProperty('/FcOperador', true);
            oView.getModel().setProperty('/FcTransporte', false);
            oView.getModel().setProperty('/FcRemolque', false);
            oView.getModel().setProperty('/BtnBack', true);
            oView.getModel().setProperty('/BtnACh', false);
            oView.getModel().setProperty('/BtnACa', true);
            oView.getModel().setProperty('/BtnARe', true);
        },
        onACamion: function () {
            oView.getModel().setProperty('/FcOperador', false);
            oView.getModel().setProperty('/FcTransporte', true);
            oView.getModel().setProperty('/FcRemolque', false);
            oView.getModel().setProperty('/BtnBack', true);
            oView.getModel().setProperty('/BtnACh', true);
            oView.getModel().setProperty('/BtnACa', false);
            oView.getModel().setProperty('/BtnARe', true);
        },
        onARemolque: function () {
            oView.getModel().setProperty('/FcOperador', false);
            oView.getModel().setProperty('/FcTransporte', false);
            oView.getModel().setProperty('/FcRemolque', true);
            oView.getModel().setProperty('/BtnBack', true);
            oView.getModel().setProperty('/BtnACh', true);
            oView.getModel().setProperty('/BtnACa', true);
            oView.getModel().setProperty('/BtnARe', false);
        },
        onBack: function () {
            oView.getModel().setProperty('/FcOperador', false);
            oView.getModel().setProperty('/FcTransporte', false);
            oView.getModel().setProperty('/FcRemolque', false);
            oView.getModel().setProperty('/BtnBack', false);
            oView.getModel().setProperty('/BtnACh', true);
            oView.getModel().setProperty('/BtnACa', true);
            oView.getModel().setProperty('/BtnARe', true);
        },


        handleChange: function (oEvent) {
            var //oText = this.byId("textResult"),
                oDP = oEvent.getSource(),
                //sValue = oEvent.getParameter("value"),
                bValid = oEvent.getParameter("valid");

            this._iEvent++;
            // oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

            if (bValid) {
                oDP.setValueState(ValueState.None);
            } else {
                oDP.setValueState(ValueState.Error);
            }
        },

        handleBtnPress: function (oEvent) {
            var oText = this.byId("textResult2"),
                oDP = this.byId("DP9");

           // oText.setText("Value is: " + ((oDP.isValidValue()) ? "valid" : "not valid"));
        },

        onValidaCurp: function () {
            var curp = oView.byId("in_curp").getValue();
            let pattern = /^([A-Za-z]{1})([A|E|I|O|U|X|a|e|i|o|u|x]{1})([A-Za-z]{2})([0-9]{2})(0[1-9]|1[0-2])([0|1|2][0-9]|3[01])([HM]|[hm]{1})(?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)([A-Za-z]{3})([A-Za-z0-9]{2})$/g;
            let result = pattern.test(curp);
            let token = this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/token_curp");
            if (result) {
                var uri = "https://api.valida-curp.com.mx/curp/obtener_datos/?token=" + token + "&curp=" + curp;
                var settings = {
                    "url": uri,
                    "method": "GET",
                    "timeout": 0,
                };

                sap.ui.core.BusyIndicator.show(0);
                var oThis = this;
                $.ajax(settings).done(function (response) {
                    let data = response.response;
                    console.log(response);
                    if (response.error !== true)
                        oView.byId("in_chofer").setValue(data.Solicitante.Nombres + " " + data.Solicitante.ApellidoPaterno + " " + data.Solicitante.ApellidoMaterno);
                    else
                        MessageToast.show("La solicitud a fallado: " + "No encontrado favor de validar el curp");

                    sap.ui.core.BusyIndicator.hide();
                })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        if (console && console.log) {
                            MessageToast.show("La solicitud a fallado: " + " No encontrado, favor de validar el curp");
                        }
                        sap.ui.core.BusyIndicator.hide();
                    });
            } else {
                MessageToast.show("Favor de validar el CURP ingresado");
            }
        }

    });
});