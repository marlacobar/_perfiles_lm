var gView;

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, History, MessageToast, MessageBox, Fragment) {
    "use strict";
    const ERROR_MSG = "ERROR_MSG";
    var salir = "";

    return Controller.extend("sap.ui.demo.webapp.controller.BaseController", {

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        getServerHost: function () {
            /**
         * Validates and returns the right host
              */
            const hostname = window.location.hostname,
                sPort = window.location.port,
                sServer = hostname === "localhost" ? "localhost:8010/proxy" : hostname + ":" + sPort;

            return sServer;
        },

        onNavBack: function (oEvent) {
            var oHistory, sPreviousHash;
            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();
            this.OnBack();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
                console.log("History");
            } else {
                this.getRouter().navTo("appHome", {}, true /*no history*/);
                console.log("no History");
            }
        },

        OnBack: function () {
            for (var i = 0; i < 1000; i++) {
                window.clearInterval(i);
            }
            $.ajaxSetup({
            });
        },

        goToHome: function () {
            this.getRouter().navTo("appHome", {}, true /*no history*/);
        },

        _getUser: function (id) {
            // 20200415
            var oThis = this;
            $.ajax({
                async: false,
                type: "POST",
                crossDomain: true,
                url: "http://" + this.getServerHost() +
                    "/XMII/Illuminator?service=PropertyAccessService&mode=retrieve&content-type=text/xml&PropName=IllumLoginName",
                dataType: "xml",
                cache: false,
                success: function (xml) {
                    var w_user = $(xml).find('Value').text();
                    w_user = w_user.toUpperCase();
                    oThis.byId(id).setText(w_user);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        _onTile_user: function (path, oData) {
            console.log(path);
            console.log(oData);
            var Othis = this;
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path + "&OutputParameter=*&Content-Type=text/xml"

            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    if ($(xmlDOM).find('Row').length === 0) {

                        //Othis.goToHome(); 
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexion de red?");
                    }
                });

        },

        _getUsuario: function (id, id_tile) {
            var oThis = this;
            var oModel = new sap.ui.model.json.JSONModel({
                USUARIO: ""
            });
            this.getView().setModel(oModel, "ModeloPrincipal");

            $.ajax({
                type: "GET",
                url: "http://" + this.getServerHost() +
                    "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                async: false,
                success: function (xml) {
                    console.log(xml);
                    var nombre = $(xml).find('Profile').attr('firstname').toUpperCase(),
                        apellido = $(xml).find('Profile').attr('lastname').toUpperCase(),
                        usuario = $(xml).find('Profile').attr('uniquename').toUpperCase(),
                        oData = {
                            "USER": usuario,
                            "SITE": 'LM00',
                            "id_tile": id_tile
                        };
                    oThis.byId(id).setText(usuario + ' ' + nombre + ' ' + apellido);
                    oThis._onTile_user("MIIExtensions/General/Transaction/sel_tiles_user_single", oData);
                    oThis.getView().getModel("ModeloPrincipal").setProperty("/USUARIO", usuario)
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        _base_onloadTable_BK: function (Table, oData, path, name, stats_bar) {
            var oView = this.getView(),
                oTable = oView.byId(Table),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;

            //clear table
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);

            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            console.log(uri);
            oTable.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);

                        if (aData.ITEMS.length > 0) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                //check if exist a header element
                                if (stats_bar !== '') {
                                    var oModel_stats = new sap.ui.model.json.JSONModel();
                                    var oSTATS = oThis.byId(stats_bar);

                                    oModel_stats.setData(aData.STATS);
                                    oSTATS.setModel(oModel_stats);
                                }
                                if (aData.ITEMS.length > 100)
                                    oModel.setSizeLimit(aData.ITEMS.length);
                                oTable.setModel(oModel);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    oTable.setBusy(false);

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?");
                    }
                    oTable.setBusy(false);
                });
        },

        _base_onloadTable_: function (Table, oData, path, name, stats_bar) {
            var oView = this.getView(),
                oTable = oView.byId(Table),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;

            //clear table
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);

            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            console.log(uri);
            oTable.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);

                        if (aData.ITEMS.length > 0) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                //check if exist a header element
                                if (stats_bar !== '') {
                                    var oModel_stats = new sap.ui.model.json.JSONModel();
                                    var oSTATS = oThis.byId(stats_bar);

                                    oModel_stats.setData(aData.STATS);
                                    oSTATS.setModel(oModel_stats);
                                }
                                if (aData.ITEMS.length > 100)
                                    oModel.setSizeLimit(aData.ITEMS.length);
                                oTable.setModel(oModel);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }
                    oTable.setBusy(false);
                    var items = oThis.getView().byId(Table).getItems();
                    items.forEach(function (item) {
                        item.getCells()[2].getModel().setSizeLimit(999);
                        console.log(item.getCells()[2].getModel());

                    });



                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?");
                    }
                    oTable.setBusy(false);
                });
        },

        _base_onloadCOMBO2: function (Combo, oData, path, setKey, name) {
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this.getView(),
                oCombo = oView.byId(Combo),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this; //save this

            oCombo.setModel(oModel_empty);
            oModel_empty.setData({});

            oCombo.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    if (opElement.firstChild != null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0] !== undefined) {
                            if (aData[0].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create the JSON model and set the data
                                var oModel = new sap.ui.model.json.JSONModel();

                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData.length);
                                oModel.setData(aData);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }
                    if (setKey != "")
                        oCombo.setSelectedKey(setKey);

                    oCombo.setBusy(false);

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    oCombo.setBusy(false);
                });
        },

        _base_onloadHeader: function (oData, path, name) {
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this;
            var oThis = this;

            sap.ui.core.BusyIndicator.show(0);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);

                                // Assign the model object to the SAPUI5 core
                                oView.getView().setModel(oModel);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red??");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        _base_onloadCOMBO: function (Combo, oData, path, setKey, name) {
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this.getView(),
                oCombo = oView.byId(Combo),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this; //save this

            gView = oView;

            //oCombo.setModel(oModel_empty);
            //oModel_empty.setData({});

            //oCombo.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    var oCombo = gView.byId(Combo);


                    //	console.log(opElement, oCobo);
                    if (opElement.firstChild != null) {
                        var aData = opElement.firstChild.data.replace(/\n/ig, ''); // 20200420
                        aData = eval(aData);
                        if (aData[0] !== undefined) {
                            if (aData[0].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                oModel.setSizeLimit(aData.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }
                    if (setKey != "")
                        oCombo.setSelectedKey(setKey);

                    oCombo.setBusy(false);

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    oCombo.setBusy(false);
                });
        },
        _selectionColumn: function (oEvent, table) {
            var oTable = this.byId(table),
                index = oEvent.getParameter("listItem").getBindingContext().sPath.split('/')[2];

            if (oEvent.getParameter("selected")) {
                oTable.getColumns()[index].setVisible(true);
            } else {
                oTable.getColumns()[index].setVisible(false);
            }
        },

        _base_onloadMULTICOMBO: function (Combo, oData, path, setKey, name) {
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this.getView(),
                oCombo = oView.byId(Combo),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this; //save this

            oCombo.setModel(oModel_empty);
            oModel_empty.setData({});

            oCombo.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    //	console.log(opElement);
                    if (opElement.firstChild != null) {
                        var aData = opElement.firstChild.data.replace(/\n/ig, ''); // 20200420
                        aData = eval(aData);
                        if (aData[0] !== undefined) {
                            if (aData[0].error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                oModel.setSizeLimit(aData.length); // 20200825 ; GAST
                                oCombo.setModel(oModel);
                                oCombo.getModel().setSizeLimit(aData.length);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }
                    if (setKey != "")
                        oCombo.setSelectedKeys(setKey);

                    oCombo.setBusy(false);

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    oCombo.setBusy(false);
                });
        },
        _selectionColumn: function (oEvent, table) {
            var oTable = this.byId(table),
                index = oEvent.getParameter("listItem").getBindingContext().sPath.split('/')[2];

            if (oEvent.getParameter("selected")) {
                oTable.getColumns()[index].setVisible(true);
            } else {
                oTable.getColumns()[index].setVisible(false);
            }
        },

        _openModalColumn: function () {
            var oView = this.getView(),
                oDialog = oView.byId("hideColumns_fragment");
            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.hideColumns", this);
                oView.addDependent(oDialog);
            }
            oDialog.open();
        },

        _setColumns: function (columns, List, Table) {
            var oView = this.getView(),
                oDialog = oView.byId("hideColumns_fragment");
            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.hideColumns", this);
                oView.addDependent(oDialog);
            }

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(columns);
            this.byId("hideColumns_fragment").setModel(oModel);

            var oList = this.byId(List),
                oTable = this.byId(Table),
                oItems = oList.getItems(),
                oColumns = oTable.getColumns();

            $.each(columns.columns, function (index) {
                if (this.Visible) {
                    oList.setSelectedItem(oItems[index]);
                } else {
                    oColumns[index].setVisible(false);
                }
            });
        },

        _selectColumnsAll: function () {
            var oList = this.byId("columnList"),
                oItems = oList.getItems();

            $.each(oList.getItems(), function (index) {
                oList.setSelectedItem(oItems[index], true, true);
            });
        },

        _base_onloadHeader_changed: function (oData, path, name, oModel) {
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this;
            var oThis = this;

            sap.ui.core.BusyIndicator.show(0);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                oModel.setData(aData);

                                // Assign the model object to the SAPUI5 core
                                oView.getView().setModel(oModel);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red??");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        logoff: function () {
            var oThis = this;
            $.ajax({
                type: "GET",
                async: false,
                url: "/XMII/Illuminator?service=Logout",
            }).done(function (data) {
                if (!document.execCommand("ClearAuthenticationCache")) {
                    window.localStorage.clear()
                    $.ajax({
                        type: "GET",
                        url: "/XMII/Illuminator?service=Logout",
                        error: function () {
                        }
                    });
                }
                location.reload();
            });

        },

        onCheck_alarma_activa: function () {
            var oThis = this;
            // CONSULTAR SI HAY UNO ACTIVO Y DESACTIVARLO.
            var oData = {};
            var path = "MIIExtensions/Operation/Transaction/check_alarma_activa";
            var server = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server");
            var uri = server + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            $.ajax({
                type: "POST",
                dataType: "xml",
                cache: false,
                async: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    if (opElement.firstChild !== null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].ERROR !== undefined) {
                            MessageBox.error(aData[0].ERROR);
                        } else {
                            //Create  the JSON model and set the data 


                            if (aData[0].MESSAGE == "ACTIVA") {
                                salir = 'X';
                                var viewname = "";
                                viewname = oThis.getView().getViewName();
                                viewname = viewname.substr(viewname.length - 6, 6)
                                if (viewname != 'Alarma') {
                                    oThis.getRouter().navTo("Alarma");
                                } else {
                                    oThis.onObtiene_last_id(oData, "MIIExtensions/Operation/Transaction/get_alarma_activa");
                                }

                            } else {
                                if (salir == 'X') {
                                    salir = "";
                                    oThis.onNavBack();
                                } else {
                                }
                            }
                        }
                    } else {
                        MessageBox.error("La solicitud ha fallado: ¿Hay conexión de red?");
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
        onObtiene_last_id: function (oData, path) {
            var oView = this.getView(),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;
            //clear table
            oModel_empty.setData({});
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            console.log(uri);
            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData.ITEMS.length > 0) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                //ASIGNA VALORES
                                oThis.getView().byId("Alarma").setText(aData.ITEMS[0].TIPO_DESC);
                                oThis.getView().byId("msg1").setText(aData.ITEMS[0].DESCRIPCION.toUpperCase());
                                oThis.getView().byId("lblUsuario").setText("REPORTO: " + aData.ITEMS[0].USUARIO.toUpperCase());
                                oThis.byId("Alarma").removeStyleClass("valorEstatusA");
                                oThis.byId("Alarma").removeStyleClass("valorEstatusS");
                                oThis.byId("Alarma").removeStyleClass("valorEstatusD");
                                switch (aData.ITEMS[0].TIPO) {
                                    case "1":
                                        oThis.byId("Alarma").addStyleClass("valorEstatusA");
                                        oThis.byId("msg1").addStyleClass("descriptionAlarma");
                                        break;
                                    case "2":
                                        oThis.byId("Alarma").addStyleClass("valorEstatusS");
                                        oThis.byId("msg1").addStyleClass("descriptionAlarma");
                                        break;
                                    default:
                                        oThis.byId("Alarma").addStyleClass("valorEstatusD");
                                        oThis.byId("msg1").addStyleClass("descriptionAlarma");
                                }

                            }
                        } else {
                            MessageToast.show("No se han recibido ");
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?");
                    }

                });
        },

        _base_onloadTable_items: function (Table, oData, path, name, stats_bar) {
            var oView = this.getView(),
                oTable = oView.byId(Table),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;

            //clear table
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);

            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            console.log(uri);
            oTable.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);

                        if (aData.items.length > 0) {
                            if (aData.error !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.error);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);
                                //check if exist a header element
                                if (stats_bar !== '') {
                                    var oModel_stats = new sap.ui.model.json.JSONModel();
                                    var oSTATS = oThis.byId(stats_bar);

                                    oModel_stats.setData(aData.STATS);
                                    oSTATS.setModel(oModel_stats);
                                }
                                if (aData.items.length > 100)
                                    oModel.setSizeLimit(aData.items.length);
                                oTable.setModel(oModel);
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    oTable.setBusy(false);

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?");
                    }
                    oTable.setBusy(false);
                });
        },


        _getVersion: function () {
            var oView = this;

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.attachEventOnce("requestCompleted", function (oEvent) {

                let oVersion = oEvent.getSource().getData()._version;
                let oAmbiente = oEvent.getSource().getData()._ambiente;

                oView.byId("version").setText(oAmbiente + " / " + oVersion)

            }, this).loadData("/XMII/CM/MII/App/Piso/MII-Launchpad/version.json?&__=" + Date.now());

        }
        ,
        //APP Configurar Etiquetas 15 de agosto 2023 - JERO
        onHide: function () {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        //JERO 23 AGOSTO 2023 SETEAR MODELO INICIAL
        _setModeloObjetos(oData, path) {
            var oThis = this;
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');

            $.ajax({
                async: false,
                cache: false,
                data: oData,
                dataType: "xml",
                type: "GET",
                url: uri
            })
                .done(function (xmlDOM) {
                    try {
                        var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                        if (opElement.firstChild !== null) {
                            var aData = JSON.parse(opElement.firstChild.data);
                            if (aData !== undefined) {
                                if (aData.error !== undefined) {
                                    oThis.getOwnerComponent().openHelloDialog(aData.error);
                                } else {
                                    var oModel = new sap.ui.model.json.JSONModel();
                                    oModel.setData(aData);
                                    oThis.getView().setModel(oModel, "CNF_OBJ");//CNF_OBJ CONFIGURACION DE VISIBILIDAD DE OBJETO
                                }
                            } else {
                                MessageToast.show("No se han recibido " + "Datos");
                            }
                        } else {
                            MessageToast.show("No se han recibido datos");
                        }
                    } catch {
                        oThis.handleOpenDialog();
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.handleOpenDialog();
                    }
                });
        },

        _ejecutarTransaccion: function (oData, path, postEx) {
            var oThis = this;
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            sap.ui.core.BusyIndicator.show(0);
            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    try {
                        var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                        if (opElement.firstChild !== null) {
                            var aData = eval(opElement.firstChild.data);
                            if (aData[0].status === "E") {
                                MessageBox.error(aData[0].message);
                                var params = {
                                    mensaje: aData[0].message,
                                    referencia: aData[0].reference,
                                    wildcard: aData[0].wildcard
                                };
                                //Advertencia: Rutina de ejecucion local
                                oThis.onAfterEjecutarTransaccion(ERROR_MSG, params);
                            } else {
                                var params = {
                                    mensaje: aData[0].message,
                                    referencia: aData[0].reference,
                                    wildcard: aData[0].wildcard
                                };
                                //Advertencia: Rutina de ejecucion local
                                oThis.onAfterEjecutarTransaccion(postEx, params);
                            }
                        } else {
                            oThis.getOwnerComponent().openHelloDialog("No se recibió información");
                        }
                        sap.ui.core.BusyIndicator.hide();
                    } catch (e) {
                        oThis.handleOpenDialog();
                        console.log("Error", e.stack);
                        console.log("Error", e.name);
                        console.log("Error", e.message);
                    } finally {
                        sap.ui.core.BusyIndicator.hide();
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.handleOpenDialog();
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        onAfterEjecutarTransaccion: function (postEx, params) {
            switch (postEx) {
                case ERROR_MSG:
                    break;
                default:
                    MessageToast.show(params.mensaje);
                    break;
            }
        },

        //JERO 4 DE SEPTIEMBRE TRY CATCH - BETA
        _base_onloadTable: function (Table, oData, path, name, stats_bar) {
            var oView = this.getView(),
                oTable = oView.byId(Table),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);

            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            oTable.setBusy(true);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    try {
                        var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                        if (opElement.firstChild !== null) {
                            var aData = JSON.parse(opElement.firstChild.data);
                            if (aData.ITEMS.length > 0) {
                                if (aData.error !== undefined) {
                                    oThis.getOwnerComponent().openHelloDialog(aData.error);
                                } else {
                                    var oModel = new sap.ui.model.json.JSONModel();
                                    oModel.setData(aData);
                                    if (stats_bar !== '') {
                                        var oModel_stats = new sap.ui.model.json.JSONModel();
                                        var oSTATS = oThis.byId(stats_bar);
                                        oModel_stats.setData(aData.STATS);
                                        oSTATS.setModel(oModel_stats);
                                    }
                                    if (aData.ITEMS.length > 100)
                                        oModel.setSizeLimit(aData.ITEMS.length);
                                    oTable.setModel(oModel);
                                }
                            } else {
                                MessageToast.show("No se han recibido " + name);
                            }
                        } else {
                            MessageToast.show("No se han recibido datos");
                        }
                        oTable.setBusy(false);
                    } catch (e) {
                        //MessageBox.error("Hubo un error al procesar los datos en la consulta");
                        oThis.handleOpenDialog();
                        console.log("Error", e.stack);
                        console.log("Error", e.name);
                        console.log("Error", e.message);
                    } finally {
                        oTable.setBusy(false);
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.handleOpenDialog();
                    }
                    oTable.setBusy(false);
                });
        },

        handleOpenDialog: function () {
            if (!this._oDialog) {
                Fragment.load({
                    name: "sap.ui.demo.webapp.fragment.Base.ErrorLoad",
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(this._oDialog);
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._oDialog.open();
            }
        },

        onDialogClose: function () {
            this._oDialog.close();
        },

        //JERO 7 DE SEPTIEMBRE 
        _setModelo(oData, path, nombre) {
            var oThis = this;
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');

            $.ajax({
                cache: false,
                data: oData,
                dataType: "xml",
                type: "GET",
                url: uri
            })
                .done(function (xmlDOM) {
                    try {
                        var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                        if (opElement.firstChild !== null) {
                            var aData = JSON.parse(opElement.firstChild.data);
                            if (aData !== undefined) {
                                if (aData.error !== undefined) {
                                    oThis.getOwnerComponent().openHelloDialog(aData.error);
                                } else {
                                    var oModel = new sap.ui.model.json.JSONModel();
                                    oModel.setData(aData);
                                    oThis.getView().setModel(oModel, nombre);
                                }
                            } else {
                                MessageToast.show("No se han recibido " + "Datos");
                            }
                        } else {
                            MessageToast.show("No se han recibido datos");
                        }
                    } catch {
                        MessageToast.show("No se han recibido datos");
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        MessageToast.show("La solicitud ha fallado: " + textStatus);
                    }
                });
        },

        _LoadData: function (oData, oPath, id) {
            var oThis = this;
            var oModelMAT = new sap.ui.model.json.JSONModel();
            var data = new sap.ui.model.json.JSONModel();
            var empty = new sap.ui.model.json.JSONModel();
            var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
            var parameters = oData;
            oModelMAT.loadData(url, parameters, true, "POST");

            oModelMAT.attachRequestCompleted(function () {
                // IF Fatal Error
                if (oModelMAT.getData().Rowsets.FatalError) {
                    console.log("Fatal Error");
                    return;
                }
                if (oModelMAT.getData().Rowsets.Rowset[0].Row) {
                    data.setData(oModelMAT.getData().Rowsets.Rowset[0].Row);
                    oThis.getView().setModel(data, id);
                } else {
                    empty.setData({});
                    oThis.getView().setModel(empty, id);
                }
            });
        },

        _onLoadCOMBO: function (Combo, oData, path, setKey, name) {
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oView = this.getView(),
                oCombo = oView.byId(Combo),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;

            oModel_empty.setData({});

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    try {
                        var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                        if (opElement.firstChild != null) {
                            var aData = opElement.firstChild.data.replace(/\n/ig, '');
                            aData = eval(aData);
                            if (aData[0] !== undefined) {
                                if (aData[0].error !== undefined) {
                                    oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                                } else {
                                    var oModel = new sap.ui.model.json.JSONModel();
                                    oModel.setData(aData);
                                    oModel.setSizeLimit(aData.length);
                                    oCombo.setModel(oModel);
                                    oCombo.getModel().setSizeLimit(aData.length);
                                }
                            } else {
                                oCombo.setModel(oModel_empty);
                                MessageToast.show("No se han recibido " + name);
                            }
                        } else {
                            MessageToast.show("No se han recibido datos");
                        }
                        if (setKey != "")
                            oCombo.setSelectedKey(setKey);

                        oCombo.setBusy(false);

                    } catch {
                        oCombo.setBusy(false);
                    }

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
                    }
                    oCombo.setBusy(false);
                });
        },

        _base_onloadTable_post: function (Table, oData, path, name, stats_bar) {
            var oView = this.getView(),
                oTable = oView.byId(Table),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;
            //clear table
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, '');
            console.log(uri);
            oTable.setBusy(true);
            $.ajax({
                crossDomain: true,
                async: false,
                type: "POST",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            }).done(function (xmlDOM) {
                try {
                    if (xmlDOM.getElementsByTagName("Row")[0] != undefined) {
                        var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
                        if (opElement.firstChild !== null) {
                            var w_data = opElement.firstChild.data;
                            w_data = w_data.replace(/\n/ig, '');
                            var aData = w_data;
                            aData = JSON.parse(w_data);
                            //  aData = eval( aData );
                            if (aData.ITEMS.length > 0) {
                                if (aData.error !== undefined) {
                                    oThis.getOwnerComponent().openHelloDialog(aData.error);
                                } else {
                                    //Create  the JSON model and set the data                                                                                                
                                    var oModel = new sap.ui.model.json.JSONModel();
                                    oModel.setData(aData);
                                    //check if exist a header element
                                    if (stats_bar !== '') {
                                        var oModel_stats = new sap.ui.model.json.JSONModel();
                                        var oSTATS = oThis.byId(stats_bar);
                                        oModel_stats.setData(aData.STATS);
                                        oSTATS.setModel(oModel_stats);
                                    }
                                    //oModel.setSizeLimit(aData.ITEMS.length + 10);
                                    //  console.log("modelo ultimo");
                                    //  console.log(oModel);
                                    oTable.setModel(oModel);
                                }
                            } else {
                                MessageToast.show("No se han recibido " + name);
                            }
                        } else {
                            MessageToast.show("No se han recibido datos");
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
                oTable.setBusy(false);

            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                    oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?");
                }
                oTable.setBusy(false);
            });
        },

        ViewClaveFigure: function (clave) {
            var oThis = this;
            if (!this.oDViewClaveFig) {
                this.oDViewClaveFig = new sap.m.Dialog({
                    title: "Figura Clave:" + clave,
                    type: sap.m.DialogType.Message,
                    content: [
                        new sap.m.Image("img_clave", {
                            alt: "Figura no encontrada",
                            src: "/XMII/CM/Default/Claves/" + clave + ".png",
                        }),
                    ],
                    endButton: new sap.m.Button({
                        text: "Cerrar",
                        press: function () {
                            this.oDViewClaveFig.destroy();
                            this.oDViewClaveFig = null;
                        }.bind(this)
                    })
                });
            }

            this.oDViewClaveFig.open();
        },


    });
});