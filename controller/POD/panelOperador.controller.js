jQuery.sap.registerModulePath("root", "/XMII/CM/MII/App/Piso/MII-Launchpad/");
jQuery.sap.registerModulePath("global", "/XMII/CM/MII/js/");
jQuery.sap.registerModulePath(
  "funciones",
  "/XMII/CM/MII/App/Piso/MII-Launchpad/js/"
);
jQuery.sap.require("global.functions");

sap.ui.define(
  [
    "sap/m/Button",
    "sap/ui/core/mvc/Controller",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/library",
    "/../../model/formatter",
    "sap/ui/core/BusyIndicator",
    "sap/ui/demo/webapp/controller/POD/extension/Extrusion.controller",
    "sap/ui/demo/webapp/controller/POD/extension/Amarre.controller",
    "sap/ui/demo/webapp/controller/POD/extension/Anodizado.controller",
    "sap/ui/demo/webapp/controller/POD/extension/Instalacion.controller",
    "sap/ui/demo/webapp/controller/POD/extension/Templado.controller",
    "sap/ui/demo/webapp/controller/POD/extension/ValorAgregado.controller",
    "sap/ui/demo/webapp/controller/POD/extension/fragments_pod.controller",
    "sap/ui/demo/webapp/controller/POD/extension/_common.controller",
    "sap/ui/export/library",
  ],
  function (
    Button,
    ControllerSAP,
    ColumnListItem,
    Label,
    Dialog,
    Text,
    BaseController,
    MessageToast,
    Fragment,
    MessageBox,
    JSONModel,
    Filter,
    mobileLibrary,
    formatter,
    BusyIndicator,
    Extrusion,
    Amarre,
    Anodizado,
    Instalacion,
    Templado,
    ValorAgregado,
    FragmentsPod,
    Common,
    exportLibrary
  ) {
    "use strict";

    var gView;
    var salida = "PT";
    var server = "";
    var ButtonType = mobileLibrary.ButtonType;

    var DECAPADO,
      MOLINO,
      GALVANIZADO_1,
      GALVANIZADO_2,
      PAILA_GALVANIADO_1,
      PAILA_ZINC_1,
      PAILA_GALVANIADO_2,
      PAILA_ZINC_2,
      PINTADORA_2,
      SLITTER_1,
      GALVAMIX_1,
      GALVAMIX_2;

    GALVAMIX_1 = "GVX1-010";
    GALVAMIX_2 = "GVX2-010";

    var g_planta = "LM00";
    var user = "";
    var user_nombre = "";
    var via_sfc = 1;
    var g_orderseleccionada = "";
    var isafter = "";
    var orden_caracteristicas, work_center_caracteristicas;
    var g_frg_clear_data_material = true;

    const w_blanco = "";
    const w_cero = 0;
    const w_uno = 1;
    const w_inches_to_cm = 2.54;
    const w_densidad = 2.6984; // g/cm³
    const w_PI = 3.141592654; // Pi

    var ZCT_DIAMETRO_BILLET_PULGADAS = 0;
    var ZCT_LONGITUD_LINGOTE_PLG = 0;
    var IR_CANTIDAD_RESTANTE = 0;
    var ZCT_LONGITUD_PERFIL_M = 0;
    var ZCT_PESO_PIEZA = 0;
    var ZCT_PESO_PIEZA_X = 0; // 202406

    return BaseController.extend(
      "sap.ui.demo.webapp.controller.POD.panelOperador",
      {
        //Extension Procesos
        ...Extrusion,
        ...Amarre,
        ...Anodizado,
        ...Instalacion,
        ...Templado,
        ...ValorAgregado,
        ...FragmentsPod,
        ...Common,
        ...ControllerSAP,
        //Extension Procesos
        formatter: formatter,

        onInit: function () {
          gView = this.getView();
          var Page = this.byId("dpPantallaOperador");

          Page.setShowFooter(true);

          this._WC = this.getView().byId("inputWC");
          this._Orden = this.getView().byId("inputOrden");

          // Obtiene Atributos de usuario y lo deja en objeto $sapmii
          global.functions.getUserAttribs();

          this.oColModel = new JSONModel(
            sap.ui.require.toUrl("sap/ui/demo/webapp/model/PantallaOperador") +
            "/columnsOperationModel.json"
          );
          this.oColModel_orders = new JSONModel(
            sap.ui.require.toUrl("sap/ui/demo/webapp/model/PantallaOperador") +
            "/columnsOrdersModel.json"
          );

          this._getUsuario("username");

          user = this.getView()
            .getModel("ModeloPrincipal")
            .getProperty("/USUARIO");
        },

        onAfterRendering: function () {

        },

        onBeforeRendering: function () {
          var oDataModeloObjeto = {};

          var pathModeloObjeto = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ModeloPOD_Template_Obtener";

          this._setModelo(oDataModeloObjeto, pathModeloObjeto, "CNF_OBJ");
        },

        onCerrarSesion: function () {
          this._cerrarSesion();
        },

        // #region Fragment Puestos de Trabajo
        onValueHelp_WC: function () {
          var aCols = this.oColModel.getData().cols,
            oThis = this;
          sap.ui.core.BusyIndicator.show(0);
          var uri = "/XMII/Runner?Transaction=MIIExtensions/Operation/Transaction/get_work_center_user&OutputParameter=JsonOutput&Content-Type=text/xml";
          this._WC.setSelectedKey("");

          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: {
              USER: user,
            },
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              var aData = JSON.parse(opElement.firstChild.data);
              oThis.oProductsModel = new JSONModel(aData);
              oThis
                .loadFragment({
                  name: "sap.ui.demo.webapp.fragment.PantallaOperador.puestosTrabajo",
                })
                .then(
                  function (oDialog) {
                    oThis._oValueHelp_WC = oDialog;
                    oThis.getView().addDependent(oDialog);

                    oDialog.getTableAsync().then(
                      function (oTable) {
                        oTable.setModel(oThis.oProductsModel);
                        oTable.setModel(oThis.oColModel, "columns");
                        if (oTable.bindRows) {
                          oTable.bindAggregation("rows", "/ITEMS");
                        }
                        if (oTable.bindItems) {
                          oTable.bindAggregation(
                            "items",
                            "/ITEMS",
                            function () {
                              return new ColumnListItem({
                                cells: aCols.map(function (column) {
                                  return new Label({
                                    text: "{" + column.template + "}",
                                  });
                                }),
                              });
                            }
                          );
                        }
                        oDialog.update();
                      }.bind(this)
                    );
                    sap.ui.core.BusyIndicator.hide();
                    oThis.getView().addDependent(oDialog);
                    oDialog.open();
                  }.bind(this)
                );
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                oThis
                  .getOwnerComponent()
                  .openHelloDialog(
                    "La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?"
                  );
              }
              sap.ui.core.BusyIndicator.hide();
            });
        },

        onValueHelpCancelar: function () {
          this._oValueHelp_WC.close();
        },
        onValueHelpAfterClose: function () {
          this._oValueHelp_WC.destroy();
        },

        onValueHelpOK: function (oEvent) {
          var aTokens = oEvent.getParameter("tokens"),
            workCenter = aTokens[0].getKey(),
            oView = this.getView();

          var oData = {
            WORK_CENTER: workCenter,
          };
          var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");

          // Cargar Data de WorkCenter
          this.onGetDataWC(workCenter);

          var oDataModeloObjeto = {
            CD_WORK_CENTER: workCenter,
            USUARIO: usuario,
          };

          var pathModeloObjeto = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ModeloPOD_Obtener";
          this._setModelo(oDataModeloObjeto, pathModeloObjeto, "CNF_OBJ");

          this.getView().getModel("ModeloPrincipal").setProperty("/WORK_CENTER", aTokens[0].getKey());
          this.getView().getModel("ModeloPrincipal").setProperty("/WORK_CENTER_TEXT", aTokens[0].getText());

          this._WC.setSelectedKey(aTokens[0].getKey());
          this._WC.setValue(aTokens[0].getText());
          this.onValueHelpCancelar();
          this._base_onloadTable("OrdersList", oData, "MIIExtensions/Orders/Transaction/get_started_ordenes", "Ordenes", "");
        },

        onGetDataWC: function (oPuestoTrabajo) {
          oPuestoTrabajo = oPuestoTrabajo;
          let oView = this.getView();
          let oModelWCData = new sap.ui.model.json.JSONModel();
          oModelWCData.setSizeLimit(10000);
          var oPath = "MII/DatosTransaccionales/Sistema/Objetos/Query/workCenter_byID_selectQuery";
          var url = "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" + oPath + "&Content-Type=text/json";
          var parameters = {
            "Param.1": oPuestoTrabajo,
          };
          oModelWCData.loadData(url, parameters, true, "POST");
          oModelWCData.attachRequestCompleted(function () {
            // IF Fatal Error input
            if (oModelWCData.getData().Rowsets.FatalError) {
              global.functions.onMessage(
                "E",
                oModelWCData.getData().Rowsets.FatalError
              );
              return;
            }
            oView.setModel(oModelWCData, "modelWCData");
          });
        },

        //#endregion Fragment Puestos de Trabajo

        // #region Ordenes de Trabajo

        onIniciarOrden: function () {
          if (this._Orden.getSelectedKey() === "") {
            this.handleInfoMessageBoxPress("Selecciona una orden del listado");
            return;
          }

          var w_puesto_trabajo = this._WC.getSelectedKey();
          var w_orden = this._Orden.getSelectedKey();

          var oData = {
            ORDER: w_orden,
            WORK_CENTER: w_puesto_trabajo,
          };

          this.startOrder(oData, "MIIExtensions/Orders/Transaction/start_order");
        },

        startOrder(oData, path) {
          var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  var xData = {
                    WORK_CENTER: oThis._WC.getSelectedKey(),
                  };

                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable("OrdersList", xData, "MIIExtensions/Orders/Transaction/get_started_ordenes", "Ordenes", "");
                  oThis._Orden.setSelectedKey("");
                  oThis._Orden.setValue("");
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onActivarDesactivarOrden: function () {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            order = "",
            estatus = "",
            WC = this._WC.getSelectedKey();

          if (oitems[0] === undefined) {
            this.handleWarningMessageBoxPress("Selecciona una orden");
            return;
          }

          order = oitems.getBindingContext().getProperty("SHOP_ORDER");
          estatus = oitems.getBindingContext().getProperty("ACTIVA");

          var oData = {
            ORDER: order,
            WORK_CENTER: WC,
            ESTATUS: estatus,
          };
          this.ActivarOrden(oData, "MIIExtensions/Orders/Transaction/activeDeactivate_order", WC
          );
        },

        ActivarOrden(oData, path, WC) {
          var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;

          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  var xData = {
                    WORK_CENTER: WC,
                  };
                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable("OrdersList", xData, "MIIExtensions/Orders/Transaction/get_started_ordenes", "Ordenes", "");
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onRefreshOrders: function () {
          var oData = {
            WORK_CENTER: this._WC.getSelectedKey(),
          };
          this._base_onloadTable("OrdersList", oData, "MIIExtensions/Orders/Transaction/get_started_ordenes", "Ordenes", "");
        },

        onPendiente: function () {
          var oView = this.getView(),
            oitems_orders = oView.byId("OrdersList").getSelectedItems(),
            order = "";
            
          oitems_orders.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (order === "")
            this.handleInfoMessageBoxPress("Selecciona una orden");
          else this.onApprovePendiente("\u00BFDesea pausar la orden?");
        },

        onApprovePendiente: function (message) {
          var oThis = this;
          var oDialog = new Dialog({
            title: "Confirm",
            type: "Message",
            content: new Text({
              text: message,
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Aceptar",
              press: function () {
                oThis.SetPendiente();
                oDialog.close();
              },
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () {
                oDialog.close();
              },
            }),
            afterClose: function () {
              oDialog.destroy();
            },
          });
          oDialog.open();
        },

        SetPendiente: function () {
          var oView = this.getView(),
            oitems_orders = oView.byId("OrdersList").getSelectedItems(),
            order = "";

          if (oitems_orders[0] === undefined) {
            this.handleWarningMessageBoxPress("Selecciona una orden");
            return;
          }

          order = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");

          var oData = {
            ORDER: order,
            WORK_CENTER: this._WC.getSelectedKey(),
            USER: user,
          };
          this.sendPendiente(
            oData,
            "MIIExtensions/Orders/Transaction/set_hold"
          );
        },

        sendPendiente(oData, path) {
          var uri =
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  var xData = {
                    WORK_CENTER: oThis._WC.getSelectedKey(),
                  };
                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable(
                    "OrdersList",
                    xData,
                    "MIIExtensions/Orders/Transaction/get_started_ordenes",
                    "Ordenes",
                    ""
                  );
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        //#endregion Ordenes de Trabajo

        //#region Instalacion Lotes

        onComponentesList: function () {
          var oThis = this;
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            order = "";

          if (oitems[0] === undefined) {
            this.handleWarningMessageBoxPress("Selecciona una orden");
            return;
          }

          order = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");

          var oData = {
            ORDER: order,
          };
          if (!this.byId("listaComponenteDialog")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.ComponentList",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              oThis.open_onComponentesList(oData);
            });
          } else {
            this.byId("listaComponenteDialog").open();
            this.open_onComponentesList(oData);
          }
        },

        onValidaDatosInstalacion: function (data_row) {
          var oView = this.getView(),
            orden = "",
            oModel_Warning = "";

          orden = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");

          let oData = {
            ORDEN: orden,
          };

          oModel_Warning = this.evalua_OFARecuperacion(oData);

          if (oModel_Warning.oData.CHECK[0].TIPO_CHECK != "OK") {
            this._handleMessageBoxOrdenRecuperacion(
              oModel_Warning.oData.CHECK[0].MENSAJE_WARNING,
              "warning",
              this
            );
          } else {
            this.onDatosInstalacion();
          }
        },

        _handleMessageBoxOrdenRecuperacion: function (
          sMessage,
          sMessageBoxType,
          oThis
        ) {
          MessageBox[sMessageBoxType](sMessage, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                oThis.onDatosInstalacion();
              } else {
                oThis.onCancelarListaComponentes();
              }
            }.bind(this),
          });
        },

        evalua_OFARecuperacion: function (oData) {
          let oModel_return = new sap.ui.model.json.JSONModel();
          var path =
            "MIIExtensions/Consumption/Transaction/check_orden_warnings";

          var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            async: false,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = JSON.parse(opElement.firstChild.data);
                if (aData !== undefined) {
                  if (aData.error !== undefined) {
                    oThis.handleErrorMessageBoxPress(aData.error);
                  } else {
                    oModel_return.setData(aData);
                  }
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          return oModel_return;
        },

        onDatosInstalacion: function () {
          var oView = this.getView(),
            WORK_CENTER = this._WC.getSelectedKey();

          if (!this.byId("InstalacionDialog")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.ComponentInstall",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("InstalacionDialog").open();
          }
        },

        onCancelarConsumo: function () {
          this.byId("InstalacionDialog").close();
          this.byId("InstalacionDialog").destroy();
        },

        onKeyCode: function (oEvent) {
          var codeqr = oEvent.getParameter("newValue"),
            oThis = this,
            WORK_CENTER = this._WC.getSelectedKey();

          if (codeqr == "") {
            oThis.handleErrorMessageBoxPress(
              "No se leyo etiqueta correctamente"
            );
          }

          if (codeqr.split("!").length >= 6) {
            setTimeout(function () {
              var centro = codeqr.split("!")[0];
              var almacen = codeqr.split("!")[1];
              var material = codeqr.split("!")[2];
              var lote = codeqr.split("!")[3];
              var ctd = codeqr.split("!")[4];
              var um = codeqr.split("!")[5];
              oThis.byId("input_lote").setValue(lote);
              oThis.byId("input_material").setValue(material);
              oThis.byId("input_cantidad").setValue(ctd);
              oThis.byId("input_um").setValue(um);
              oThis.byId("input_centro").setValue(centro);
              oThis.byId("input_almacen").setValue(almacen);

              var oData = {
                BATCH: lote,
              };

              oThis.getObservaciones(
                oData,
                "MIIExtensions/Components/Transaction/get_observacion",
                "area_observacion"
              );
              /*
                    if(WORK_CENTER === PINTADORA_2){
                    var oData = {
                    "BATCH" : lote
                    };
                    oThis.getChars_batch(oData,'MEINTExtensions/Consumption/Transaction/get_chars_batch');
                    }
                    */
            }, 500);
          }
        },

        onAgregarConsumos: function () {
          var oView = this.getView(),
            material = oView.byId("input_material").getValue(),
            lote = oView.byId("input_lote").getValue().toUpperCase(),
            cantidad = oView.byId("input_cantidad").getValue(),
            um = oView.byId("input_um").getValue().toUpperCase(),
            centro = oView.byId("input_centro").getValue(),
            almacen = oView.byId("input_almacen").getValue().toUpperCase(),
            order = oView.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER"),
            WC = this._WC.getSelectedKey();


          if (
            material === "" ||
            lote === "" ||
            cantidad === "" ||
            centro === "" ||
            almacen === "" ||
            um === ""
          ) {
            this.handleWarningMessageBoxPress("Llene todos los campos");
            return;
          } else {
            var oData = {
              MATERIAL: material,
              WORK_CENTER: this._WC.getSelectedKey(),
              BATCH: lote,
              NUM_ORDEN: order,
            };

            this.checkRollo(
              oData,
              "MIIExtensions/Consumption/Transaction/check_rollo"
            );
            //
          }
        },

        checkRollo(oData, path) {
          var uri =
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  if (aData[0].TYPE === "W")
                    oThis.onApproveInstall(aData[0].ERROR);
                  else oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  oThis.installComponent();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onApproveInstall: function (message) {
          var oThis = this;
          var oDialog = new Dialog({
            title: "Confirmar acci\u00F3n",
            type: "Message",
            content: new Text({
              text: message,
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Montar",
              press: function () {
                oThis.installComponent();
                oDialog.close();
              },
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () {
                oDialog.close();
              },
            }),
            afterClose: function () {
              oDialog.destroy();
            },
          });
          oDialog.open();
        },

        installComponent: function () {
          var oView = this.getView(),
            material = oView.byId("input_material").getValue(),
            lote = oView.byId("input_lote").getValue().toUpperCase(),
            cantidad = oView.byId("input_cantidad").getValue(),
            um = oView.byId("input_um").getValue().toUpperCase(),
            centro = oView.byId("input_centro").getValue().toUpperCase(),
            almacen = oView.byId("input_almacen").getValue().toUpperCase(),
            order = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");

          var w_WORK_CENTER = this._WC.getSelectedKey();

          var oData = {
            MATERIAL: material,
            LOTE: lote,
            CANTIDAD: cantidad,
            UM: um,
            CENTRO: centro,
            ALMACEN: almacen,
            NUM_ORDEN: order,
            WORK_CENTER: w_WORK_CENTER,
            USER: user,
          };

          this.onCancelarConsumo();

          this.onComponentInstall(
            oData,
            "MIIExtensions/Consumption/Transaction/install_component"
          );
        },

        onRollosInstalados: function () {
          var oThis = this;
          var operation = this._WC.getSelectedKey();
          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            var oView = this.getView(),
              order = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");

            var oData = {
              ORDER: order,
              WORK_CENTER: operation
            };

            if (!this.byId("installedComponentFragment")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.ComponentesInstalados",
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                oThis.open_onRollosInstalados(oData);
              });
            } else {
              this.byId("installedComponentFragment").open();
              oThis.open_onRollosInstalados(oData);
            }


          }
        },

        onRefreshInstall: function () {
          var oView = this.getView(),
            order = this.byId("OrdersList").getSelectedItem().getBindingContext().getProperty("SHOP_ORDER");

          var oData = {
            ORDER: order,
            WORK_CENTER: this._WC.getSelectedKey(),
          };

          this._base_onloadTable(
            "installedComponentTable",
            oData,
            "MIIExtensions/Components/Transaction/get_installed_components",
            "Componentes instalados",
            ""
          );
        },

        open_onRollosInstalados: function (oData) { // 202309
          //
          var oView = this.getView();
          var oThis = this;
          //
          this._base_onloadTable("installedComponentTable", oData, "MIIExtensions/Components/Transaction/get_installed_components", "Componentes instalados", "");
          //
          var oTable = oView.byId("installedComponentTable");
          var oColumns = oTable.getColumns();
          //
          /*oColumns[6].setVisible( false );
          if (	oThis._oInput.getSelectedKey() === GALVANIZADO_1 || 
            oThis._oInput.getSelectedKey() === GALVANIZADO_2 || 
            oThis._oInput.getSelectedKey() === MOLINO || 
            oThis._oInput.getSelectedKey() === PINTADORA_2) {
            oColumns[6].setVisible( true );
          }*/
          //
        },

        onActiveComponent: function () {
          var oView = this.getView(),
            oitems_component = oView.byId("installedComponentTable").getSelectedItem(),
            component = oitems_component.getBindingContext().getProperty("MATERIAL"),
            batch = oitems_component.getBindingContext().getProperty("BATCH"),
            pid_inst = oitems_component.getBindingContext().getProperty("PID_INST");

          if (component === "")
            this.handleWarningMessageBoxPress("Selecciona un componente");
          else {
            var oData = {
              COMPONENT: component,
              BATCH: batch,
              PID_INST: pid_inst,
              WORK_CENTER: this._WC.getSelectedKey(),
              USER: user,
            };
            this.ActiveComponent(
              oData,
              "MIIExtensions/Components/Transaction/active_component",
              1
            );
          }
        },

        desmontarComponente: function () {
          var oView = this.getView(),
            oitems_component = oView.byId('installedComponentTable').getSelectedItem(),
            component = oitems_component.getBindingContext().getProperty("MATERIAL"),
            batch = oitems_component.getBindingContext().getProperty("BATCH"),
            pid_inst = oitems_component.getBindingContext().getProperty("PID_INST");

          if (component === '')
            this.handleWarningMessageBoxPress("Selecciona un componente");
          else {
            var oData = {
              "COMPONENT": component,
              "BATCH": batch,
              "PID_INST": pid_inst,
              "WORK_CENTER": this._WC.getSelectedKey(),
              "USER": user
            };
            this.ActiveComponent(oData, "MIIExtensions/Components/Transaction/desmontar_rollo", 1);
          }
        },

        desactivarComponente: function () {
          var oView = this.getView(),
            oitems_component = oView.byId("installedComponentTable").getSelectedItems(),
            component = "",
            batch = "";
          oitems_component.forEach(function (item) {
            component = item.getCells()[0].getText();
            batch = item.getCells()[3].getText();
          });
          if (component === "")
            this.handleWarningMessageBoxPress("Selecciona un componente");
          else {
            var oData = {
              COMPONENT: component,
              BATCH: batch,
              WORK_CENTER: this._oInput.getSelectedKey(),
              USER: user,
            };
            console.log(oData);
            this.ActiveComponent(
              oData,
              "MIIExtensions/Components/Transaction/deactive_component",
              1
            );
          }
        },

        ActiveComponent(oData, path, reloadTable) {
          var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml";

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  if (reloadTable) {
                    var oView = oThis.getView(),
                      oitems_orders = oView.byId("OrdersList").getSelectedItems(),
                      order;
                    oitems_orders.forEach(function (item) {
                      order = item.getCells()[0].getText();
                    });
                    var xData = {
                      ORDER: order,
                      WORK_CENTER: oThis._oInput.getSelectedKey(),
                    };
                    oThis._base_onloadTable("installedComponentTable", xData, "MIIExtensions/Components/Transaction/get_installed_components", "Componentes instalados", "");
                  }
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        //#endregion  Instalacion Lotes

        Realiza_ajax(path, Data, tipo) {
          var oThis = this;
          var oView = this.getView();
          BusyIndicator.show(0);

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            url:
              "/XMII/Runner?Transaction=" +
              path +
              "&OutputParameter=JsonOutput&Content-Type=text/xml",
            dataType: "xml",
            cache: false,
            data: Data,
            success: function (xml) {
              var opElement = xml.getElementsByTagName("Row")[0].firstChild;
              switch (tipo) {
                case "SetColumnas":
                  var aData = JSON.parse(opElement.firstChild.data);
                  console;
                  aData["ITEMS"].forEach(function (value, i) {
                    if (value.VISIBLE == "false") {
                      oView.byId(value.ID).setVisible(false);
                    } else {
                      oView.byId(value.ID).setVisible(true);
                    }
                  });
                  break;
                case "GuardarColumnas":
                  oThis.onCloseColumnas();
                  oThis.onSetViewColumnas();
                  break;
              }
              BusyIndicator.hide();
            },
            error: function () {
              BusyIndicator.hide();
            },
          });
        },

        get_row_mb52_lote(lote) {
          // 202309

          var oData = lote;

          var path =
            "MIIExtensions/Components/Transaction/get_mb52_matnr_charg__0";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          var w_row = {
            MANDT: "ERROR",
          };

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData.length != 0) {
                  if (aData[0].ERROR !== undefined) {
                    oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                  } else {
                    //Create  the JSON model and set the data
                    w_row = aData[0];
                  }
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          return w_row;
        },

        get_row_puesto_trabajo(centro, puesto_trabajo) {
          // 202309

          var oData = {
            CENTRO: centro,
            PUESTO_TRABAJO: puesto_trabajo,
          };

          var path = "MII/DatosMaestros/Transaction/puesto_trabajo_sel_0";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");

          // sap.ui.core.BusyIndicator.show();

          var oThis = this;
          var w_row = {
            AREA_ID: "ERROR",
          };

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  w_row = aData[0];
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }

              // sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }

              // sap.ui.core.BusyIndicator.hide();
            });

          return w_row;
        },

        get_row261(oData) {
          // 202311

          var path = "MIIExtensions/SFC/Transaction/get_consumos_1to1_declarar";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          var w_row = {
            AREA_ID: "ERROR",
          };

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  w_row = aData[0];
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          return w_row;
        },

        onPrensas_close_Paso_0_Ok: function (oEvent) {
          // 202309

          var oView = this.getView();
          var oModel_dado_in_presa = new sap.ui.model.json.JSONModel();
          oModel_dado_in_presa.setSizeLimit(10000);
          var index = oEvent.getSource().getParent().getIndex();
          var rowContext = oView
            .byId("oTable_prensas_dados")
            .getContextByIndex(index);
          var objRow = rowContext.getObject();

          // debugger

          if (objRow.BOTON_VISIBLE) {
            var oData = {
              ORDER: objRow.NUM_ORDEN,
              WORK_CENTER: objRow.SITE,
            };

            // debugger
            this.startOrder(
              oData,
              "MIIExtensions/Orders/Transaction/start_order"
            );
            this.onPrensas_close_Paso_0();
            this.onRefreshOrders();
            this._oInput_orders.setSelectedKey(""); // 202309
            // debugger
          }
        },

        find_dados_in_puesto_trabajo: function (oData, oView) {
          // 202309

          // debugger
          var oModel_data = new sap.ui.model.json.JSONModel();
          oModel_data.setSizeLimit(10000);
          var oPath =
            "MII/DatosTransaccionales/Herramentales/Dados/Query/herramental_byId_centro_puesto_flags__0";
          var url =
            "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" +
            oPath +
            "&Content-Type=text/json";
          var parameters = {
            "Param.1": oData.CENTRO,
            "Param.2": oData.PUESTO_TRABAJO,
            "Param.20": oData.NUM_ORDEN,
          };
          // debugger

          oModel_data.loadData(url, parameters, true, "POST");
          oModel_data.attachRequestCompleted(function () {
            // IF Fatal Error input
            if (oModel_data.getData().Rowsets.FatalError) {
              global.functions.onMessage(
                "E",
                oModel_data.getData().Rowsets.FatalError
              );
              return;
            }
            oView.setModel(oModel_data, "data_dados_in_puesto_trabajo");
          });
        },

        onPrensas_close_Paso_0: function () {
          // 202309
          this.byId("prensas_paso0").close();
        },

        onPrensas_open_Paso_0: function (centro, puesto_trabajo, w_orden) {
          // 202309

          var oThis = this;
          var oView = this.getView(),
            oData = {
              CENTRO: centro,
              PUESTO_TRABAJO: puesto_trabajo,
              NUM_ORDEN: w_orden,
            };

          // debugger
          if (!this.byId("prensas_paso0")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.prensas_paso0", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              oThis.find_dados_in_puesto_trabajo(oData, oView);
            });
          } else {
            this.byId("prensas_paso0").open();
            this.find_dados_in_puesto_trabajo(oData, oView);
          }
        },

        fx_sw_m261matnr_lote: function (oEvent) {
          // 20240108

          var oThis = this; // 202406
          var oView = this.getView(); // 202406

          var w_sw_sql_suma = 0;
          var w_sw_m261matnr_lote = this.byId("sw_m261matnr_lote").getState();
          var oData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
          };
          if (w_sw_m261matnr_lote == true) {
          } else {
            w_sw_sql_suma = 1;
          }
          oData.SW_SQL_SUMA = w_sw_sql_suma;

          // 202406
          var order = "";
          if (oView.byId("OrdersList") !== undefined) {
            var oitems = oView.byId("OrdersList").getSelectedItems();
            oitems.forEach(function (item) {
              order = item.getCells()[0].getText();
            });
          }
          oData.NUM_ORDER = order;

          var w_trx =
            "MIIExtensions/Components/Transaction/get_rollos_consumidos";
          this._base_onloadTable(
            "RollosConsumidosTable",
            oData,
            w_trx,
            "Rollos cosumidos",
            ""
          );
        },

        fx_row_clear: function () {
          // 202309

          this.byId("input_centro").setValue(w_blanco);
          this.byId("input_almacen").setValue(w_blanco);
          this.byId("input_lote").setValue(w_blanco);
          this.byId("desc_material").setValue(w_blanco);
          this.byId("input_cantidad").setValue(w_cero);
          this.byId("input_um").setValue(w_blanco);
          this.byId("area_observacion").setValue(w_blanco);
        },

        fx_sw_clasificacion: function (oEvent) {
          // 202309

          this.fx_row_clear();

          this.byId("input_material").setValue(w_blanco);

          var w_sw_tag_x_clasificacion = this.byId(
            "sw_tag_x_clasificacion"
          ).getState();
          if (w_sw_tag_x_clasificacion == true) {
          } else {
          }
          this.byId("input_material").setEnabled(w_sw_tag_x_clasificacion);
        },

        get_row_orden_componente(data) {
          // 202309

          var oData = data;

          var path =
            "MIIExtensions/Consumption/Transaction/get_component_by_material__v2";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          var w_row = {
            MANDT: "ERROR",
          };

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  w_row = aData[0];
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          return w_row;
        },

        open_onDatosInstalacion: function (WORK_CENTER, data_row) {
          var oView = this.getView();

          oView.byId("input_material").setValue();
          oView.byId("desc_material").setValue(); // 202309
          oView.byId("input_lote").setValue();
          oView.byId("input_cantidad").setValue();
          oView.byId("input_um").setValue();
          oView.byId("input_centro").setValue();
          oView.byId("input_almacen").setValue();
          oView.byId("input_diametro").setValue();
          oView.byId("combo_mandrel").setSelectedKey(610);

          if (WORK_CENTER != MOLINO) {
            if (
              WORK_CENTER != GALVANIZADO_1 &&
              WORK_CENTER != GALVANIZADO_2
              /*	&& WORK_CENTER != PINTADORA_2 */
            ) {
              oView.byId("input_diametro").setVisible(false);
              oView.byId("label_diametro").setVisible(false);
            }
            oView.byId("combo_mandrel").setVisible(false);
            oView.byId("label_mandrel").setVisible(false);
          } else {
            oView.byId("label_diametro").setVisible(true);
            oView.byId("input_diametro").setVisible(true);
            if (WORK_CENTER != GALVANIZADO_1 && WORK_CENTER != GALVANIZADO_2) {
              oView.byId("combo_mandrel").setVisible(true);
              oView.byId("label_mandrel").setVisible(true);
            }
          }

          if (data_row != undefined) {
            // 202309

            g_frg_clear_data_material = false;
            oView.byId("input_material").setValue(data_row.MATERIAL);
            g_frg_clear_data_material = true;

            oView.byId("desc_material").setValue(data_row.DESCRIPTION);
            oView.byId("input_um").setValue(data_row.UNIT_OF_MEASURE);
            oView.byId("input_centro").setValue(data_row.SITE);
            oView.byId("input_almacen").setValue(data_row.STORAGE_LOCATION);

            if (data_row.MATERIAL == undefined) {
              oView.byId("input_material").setEnabled(true);
              oView.byId("sw_tag_x_clasificacion").setState(true); // 202309*

              if (WORK_CENTER != undefined) {
                // 202310Q

                switch (
                WORK_CENTER // 202310Q
                ) {
                  case "EMPAPRUE":
                  case "HORFUN01": // 202310Q
                  case "HORFUN02": // 202310Q
                  case "EMPPINTA": // 202310Q
                  case "EMPTUBOC":
                    oView.byId("input_cantidad").setEnabled(true);
                    break;

                  case "CHAROLAS":
                    oView.byId("input_cantidad").setEnabled(true);
                    break;

                  case "BARREN01":
                    oView.byId("input_cantidad").setEnabled(true);
                    break;

                  default:
                    oView.byId("input_cantidad").setEnabled(false);
                    break;
                }
              }
            } else {
              oView.byId("input_material").setEnabled(false);
              oView.byId("sw_tag_x_clasificacion").setState(false); // 202309*

              if (WORK_CENTER != undefined) {
                // 202310Q

                switch (
                WORK_CENTER // 202310Q
                ) {
                  case "EMPAPRUE":
                  case "HORFUN01": // 202310Q
                  case "HORFUN02": // 202310Q
                  case "EMPPINTA": // 202310Q
                  case "EMPTUBOC":
                    oView.byId("input_cantidad").setEnabled(true);
                    break;

                  case "CHAROLAS":
                    oView.byId("input_cantidad").setEnabled(true);
                    break;

                  case "BARREN01":
                    oView.byId("input_cantidad").setEnabled(true);
                    break;

                  default:
                    oView.byId("input_cantidad").setEnabled(false);
                    break;
                }
              }
            }

            oView.byId("input_cantidad").setValue("0"); // 202310*
          } else {
            oView.byId("input_material").setEnabled(true);
          }
        },

        onDatosInstalacion_full_inventario: function (data_row) {
          var oView = this.getView(),
            operation = this._oInput.getSelectedKey(),
            oitems_components = oView
              .byId("TablaListaComponentes")
              .getSelectedItems(),
            WORK_CENTER = this._oInput.getSelectedKey(),
            item_selected = "",
            oData = {
              WORK_CENTER: operation,
            };

          var oThis = this;

          if (!this.byId("InstalacionDialog")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.ComponentInstall", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              oThis.open_onDatosInstalacion(WORK_CENTER, data_row);
            });
          } else {
            this.byId("InstalacionDialog").open();
            this.open_onDatosInstalacion(WORK_CENTER, data_row);
          }
        },

        _handleMessageBoxOrdenRecuperacion: function (
          sMessage,
          sMessageBoxType,
          oThis
        ) {
          MessageBox[sMessageBoxType](sMessage, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                oThis.onDatosInstalacion();
              } else {
                oThis.onCancelarListaComponentes();
              }
            }.bind(this),
          });
        },

        onValidaDatosInstalacion_v2: function (oEvent) {
          // 202309

          var oView = this.getView();
          var index = 0;
          var rowContext = "";
          var objRow = "";

          //	index = oEvent.getSource().getParent().getIndex(); // libreria_table
          //	rowContext = oView.byId("TablaListaComponentes").getContextByIndex(index); // libreria_table
          //	objRow = rowContext.getObject();

          index = oEvent.getSource().getBindingContext().getPath();
          index = index.replace("/ITEMS/", "") * 1;
          rowContext = oView.byId("TablaListaComponentes").getModel().getData()
            .ITEMS[index];
          objRow = rowContext;

          // debugger
          this.onValidaDatosInstalacion(objRow);
          // debugger
        },

        /*--##################################################################################################--*/

        onAdjust: function () {
          var operation = this._oInput.getSelectedKey();
          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            var oView = this.getView(),
              oitems_orders = oView.byId("OrdersList").getSelectedItems(),
              order = "";
            oitems_orders.forEach(function (item) {
              order = item.getCells()[0].getText();
            });
            if (order === "")
              this.handleWarningMessageBoxPress("Selecciona una orden");
            else {
              g_orderseleccionada = order;

              if (!this.byId("AdjustFragment")) {
                Fragment.load({
                  id: oView.getId(),
                  name: "sap.ui.demo.webapp.fragment.PantallaOperador.AjustarStock",
                  controller: this,
                }).then(function (oDialog) {
                  oView.addDependent(oDialog);
                  oDialog.open();
                });
              } else {
                this.byId("AdjustFragment").open();
              }

              var oTable = oView.byId("AdjustComponentTable"),
                oColumns = oTable.getColumns();
              var path =
                "MIIExtensions/SFC/Transaction/trx_AjusteStock_ObtenerDatos";
              var url =
                server +
                "/XMII/Runner?Transaction=" +
                path +
                "&OutputParameter=JsonOutput&Content-Type=text/xml";

              sap.ui.core.BusyIndicator.show(0);

              //Create  the JSON model and set the data
              var xData = {
                im_num_order: order,
              };
              this._base_onloadTable(
                "AdjustComponentTable",
                xData,
                "MIIExtensions/SFC/Transaction/trx_AjusteStock_ObtenerDatos",
                "Ajustar Stock",
                ""
              );
              this.onGetDiferenciaStock(order);

              sap.ui.core.BusyIndicator.hide();
            } //if order
          }
        },

        onApproveAjusteStockDialogPress: function () {
          if (!this.oApproveDialog) {
            this.oApproveDialog = new Dialog({
              type: DialogType.Message,
              title: "Confirmar",
              content: new Text({
                text: "Confirma ajuste de stock?",
              }),
              beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Confirmar",
                press: function () {
                  this.onAdjustFragment();
                  this.oApproveDialog.close();
                }.bind(this),
              }),
              endButton: new Button({
                text: "Cancel",
                press: function () {
                  this.oApproveDialog.close();
                }.bind(this),
              }),
            });
          }
          this.oApproveDialog.open();
        },

        onGetDiferenciaStock: function (order) {
          var path =
            "MIIExtensions/SFC/Transaction/trx_AjusteStock_ObtenerDatos";
          var url =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=EX_AJUSTE&Content-Type=text/xml";
          var oView = this.getView();
          var oLabel = oView.byId("dataAdjust");
          var oLabelCantidad = oView.byId("dataAdjustCantidad");
          var oThis = this;
          var oData = {
            im_num_order: order,
          };
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: url,
            data: oData,
          })
            .done(function (xmlDOM) {
              var diferencia = $(xmlDOM.getElementsByTagName("Row")[0])
                .find("EX_AJUSTE")
                .text();
              oLabelCantidad.setText(diferencia);
              oLabel.setText("La diferencia es de : ");
              sap.ui.core.BusyIndicator.hide();
              if (Number(diferencia) > 0) {
                oView.byId("button_AdjustFragment").setEnabled(true);
              } else {
                oView.byId("button_AdjustFragment").setEnabled(false);
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

        onAdjustFragment: function () {
          var path =
            "MIIExtensions/SFC/Transaction/trx_AjusteStock_GrabarDatos";
          var url =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=ex_salida&Content-Type=text/xml";
          var oView = this.getView();
          var oLabelCantidad = oView.byId("dataAdjustCantidad");
          var cantidad = oLabelCantidad.getText();
          Number(cantidad);
          Math.abs(cantidad);
          var oData = {
            im_numOrder: g_orderseleccionada,
            im_cantidad: cantidad,
            im_usuario: this._getUsuario("username"),
          };
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: url,
            data: oData,
          })
            .done(function (xmlDOM) {
              MessageBox.success("Ajuste realizado con \u00E9xito.");
              oView.byId("AdjustFragment").close();
              oView.byId("AdjustFragment").destroy();
              g_orderseleccionada = "";
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });
        },

        onValueOrdersRequested: function () {
          var aCols = this.oColModel_orders.getData().cols,
            othis = this,
            oData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
          var uri =
            server +
            "/XMII/Runner?Transaction=MIIExtensions/Orders/Transaction/get_ordenes&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              var aData = JSON.parse(opElement.firstChild.data);
              othis.oOrdersModel = new JSONModel(aData);
              othis._oValueHelpDialogOrders = sap.ui.xmlfragment(
                "sap.ui.demo.webapp.fragment.PantallaOperador.ValueHelpDialogOrders",
                othis
              );
              othis._oValueHelpDialogOrders.getTableAsync().then(
                function (oTable) {
                  oTable.setModel(othis.oOrdersModel);
                  oTable.setModel(othis.oColModel_orders, "columns");
                  if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/ITEMS");
                  }
                  if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/ITEMS", function () {
                      return new ColumnListItem({
                        cells: aCols.map(function (column) {
                          return new Label({
                            text: "{" + column.template + "}",
                          });
                        }),
                      });
                    });
                  }
                  var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true,
                    filterBarExpanded: false,
                    showGoOnFB: !sap.ui.Device.system.phone,
                    filterGroupItems: [
                      new sap.ui.comp.filterbar.FilterGroupItem({
                        groupTitle: "foo",
                        groupName: "gn1",
                        name: "clave",
                        label: "Clave",
                        control: new sap.m.Input(),
                      }),
                      new sap.ui.comp.filterbar.FilterGroupItem({
                        groupTitle: "foo",
                        groupName: "gn1",
                        name: "aleacion",
                        label: "Aleacion",
                        control: new sap.m.Input(),
                      }),
                      new sap.ui.comp.filterbar.FilterGroupItem({
                        groupTitle: "foo",
                        groupName: "gn1",
                        name: "largo",
                        label: "Largo",
                        control: new sap.m.Input(),
                      }),
                    ],
                    search: function (oEvt) {
                      var oBinding = othis._oValueHelpDialogOrders
                        .getTable()
                        .getBinding("rows");
                      var oParams = oEvt.getParameter("selectionSet");
                      var oClave = oParams[0].getValue();
                      var oAleacion = oParams[1].getValue();
                      var oLargo = oParams[2].getValue();
                      console.log(oClave + "/" + oAleacion + "/" + oLargo);
                      if (oClave != "" || oAleacion != "" || oLargo != "") {
                        var oFilter1 = [
                          new sap.ui.model.Filter("CLAVE", "EQ", oClave),
                          new sap.ui.model.Filter(
                            "LARGO_PERFIL",
                            "EQ",
                            oAleacion
                          ),
                          new sap.ui.model.Filter("LARGO", "EQ", oLargo),
                        ];
                        var allFilters = new sap.ui.model.Filter(
                          oFilter1,
                          false
                        );
                        oBinding.filter(allFilters);
                      } else {
                        var oFilter = new sap.ui.model.Filter(
                          "CLAVE",
                          sap.ui.model.FilterOperator.Contains,
                          oClave
                        );
                        oBinding.filter(oFilter);
                      }
                    },
                  });
                  var oSearch = new sap.m.SearchField({
                    search: function (oEvent) {
                      var sQuery = oEvent.getParameter("query");
                      var oBinding = othis._oValueHelpDialogOrders
                        .getTable()
                        .getBinding("rows");
                      if (sQuery) {
                        var oFilter1 = [
                          new sap.ui.model.Filter("CLAVE", "EQ", sQuery),
                          new sap.ui.model.Filter("LARGO_PERFIL", "EQ", sQuery),
                          new sap.ui.model.Filter("ALEACION", "EQ", sQuery),
                        ];
                        var allFilters = new sap.ui.model.Filter(
                          oFilter1,
                          false
                        );
                        oBinding.filter(allFilters);
                      } else {
                        var oFilter = new sap.ui.model.Filter(
                          "CLAVE",
                          sap.ui.model.FilterOperator.Contains,
                          sQuery
                        );
                        oBinding.filter(oFilter);
                      }
                    },
                  });
                  oFilterBar.setBasicSearch(oSearch);
                  othis._oValueHelpDialogOrders.setFilterBar(oFilterBar);
                  othis._oValueHelpDialogOrders.update();
                }.bind(this)
              );
              sap.ui.core.BusyIndicator.hide();
              othis.getView().addDependent(othis._oValueHelpDialogOrders);
              othis._oValueHelpDialogOrders.open();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                othis
                  .getOwnerComponent()
                  .openHelloDialog(
                    "La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?"
                  );
              }
              oTable.setBusy(false);
              sap.ui.core.BusyIndicator.hide();
            });
        },

        getStats(path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          var oData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
          };
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
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
                    oThis.getView().setModel(oModel, "STATS");
                  }
                } else {
                  MessageToast.show("No se han recibido " + "Datos");
                }
              } else {
                MessageToast.show("No se han recibido datos");
              }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
            });
        },



        velocidad_meta(path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          var oData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
          };
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = JSON.parse(opElement.firstChild.data);
                if (aData !== undefined) {
                  if (aData.error !== undefined) {
                    oThis.getOwnerComponent().openHelloDialog(aData.error);
                  } else {
                    //Create the JSON model and set the data
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(aData);
                    // Assign the model object to the SAPUI5 core
                    oThis.getView().setModel(oModel, "META");
                  }
                } else {
                  MessageToast.show("No se han recibido " + "Datos");
                }
              } else {
                MessageToast.show("No se han recibido datos");
              }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
            });
        },

        pesoDespuntesDecapado(path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          var oData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
          };
          if (this._oInput.getSelectedKey() === DECAPADO) {
            this.byId("despunte_entrada").setVisible(true);
            this.byId("despunte_salida").setVisible(true);
          } else {
            this.byId("despunte_entrada").setVisible(false);
            this.byId("despunte_salida").setVisible(false);
          }
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
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
                    oThis.getView().setModel(oModel, "DESPUNTES_DECAPADO");
                  }
                } else {
                  MessageToast.show("No se han recibido " + "Datos");
                }
              } else {
                MessageToast.show("No se han recibido datos");
              }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
            });
        },

        onValueHelpOrdersOkPress: function (oEvent) {
          var aTokens = oEvent.getParameter("tokens");
          this._oInput_orders.setSelectedKey(aTokens[0].getKey());
          this._oInput_orders.setValue(aTokens[0].getText());
          this._oValueHelpDialogOrders.close();
        },
        onValueHelpOrdersCancelPress: function () {
          this._oValueHelpDialogOrders.close();
        },
        onValueHelpOrdersAfterClose: function () {
          this._oValueHelpDialogOrders.destroy();
        },

        onIniciarSfc: function (oEvent) {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            order;
          oitems.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          var oData = {
            ORDER: order,
            OPERATION: this._oInput.getSelectedKey(),
            USER: user,
          };
          this.createSFC(oData, "MIIExtensions/SFC/Transaction/create_sfc");
          console.log(oData);
        },

        createSFC(oData, path) {
          // debugger
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        open_onComponentesList: function (oData) {
          // 202309

          var oThis = this;
          var oView = this.getView();
          var oTable = oView.byId("TablaListaComponentes");
          var oColumns = oTable.getColumns();
          this._base_onloadTable(
            "ComponentList",
            oData,
            "MIIExtensions/Consumption/Transaction/get_components",
            "Componentes",
            ""
          );
        },

        // FC - 20231209 -- begin
        onComponentesBtnAgregarBillet: function () {
          var oView = this.getView();
          var oTable = oView.byId("TablaListaComponentes");
          const botonAddBillet = oView.byId("btn_addBillet");
          const registros = oTable.getModel();
          var x;
          //ocultar boton addbillet
          botonAddBillet.setVisible(false);
          for (x of registros.oData.ITEMS) {
            if (x.PERMITEMATERIALSUSTITUTO == "1") {
              // habiiltar boton AddBilet
              botonAddBillet.setVisible(true);
            }
          }
        },

        ObtenerCaracteristicasOrdenBillet: function () {
          var oView = this.getView();
          var oTable = oView.byId("TablaListaComponentes");
          const registros = oTable.getModel();
          var x;
          var w_row = {
            ZCT_ALEACION: "",
            ZCT_DIAMETRO_BILLET_PULGADAS: "",
          };
          for (x of registros.oData.ITEMS) {
            if (x.PERMITEMATERIALSUSTITUTO == "1") {
              // asignar ZCT_ALEACION y ZCT_DIAMETRO_BILLET_PULGADAS
              w_row.ZCT_ALEACION = x.ZCT_ALEACION;
              w_row.ZCT_DIAMETRO_BILLET_PULGADAS =
                x.ZCT_DIAMETRO_BILLET_PULGADAS;
            }
          }
          return w_row;
        },
        onAbrirPopupAddBillet: function (oEvent) {
          var oThis = this;
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            WORK_CENTER = this._oInput.getSelectedKey(),
            order = "";
          oitems.forEach(function (item) {
            order = item.getCells()[0].getText();
          });

          if (
            order === "" &&
            WORK_CENTER !== GALVAMIX_1 &&
            order === "" &&
            WORK_CENTER !== GALVAMIX_2
          )
            this.handleWarningMessageBoxPress("Selecciona una orden activa");
          else {
            var oData = {
              ORDER: order,
            };
            // Abrir fragmento AgregarBilletCortoPorLote
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.ComponentInstallBilletCorto",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              //oThis.open_onComponentesList ( oData );
            });
          }
        },
        onKeyCodeLote: function (oEvent) {
          var codeqr = oEvent.getParameter("value"),
            oThis = this,
            WORK_CENTER = this._oInput.getSelectedKey(),
            centro = "",
            almacen = "",
            material = "",
            matDesc = "",
            lote = "",
            ctd = "",
            um = "",
            w_row;
          // si cargo menos de 6 digitos, no es entrada valida.
          if (codeqr.length <= 5) {
            oThis.byId("input_lote").setValue(lote);
            oThis.byId("input_material").setValue(material);
            oThis.byId("desc_material").setValue(matDesc);
            oThis.byId("input_cantidad").setValue(ctd);
            oThis.byId("input_um").setValue(um);
            oThis.byId("input_centro").setValue(centro);
            oThis.byId("input_almacen").setValue(almacen);
            return;
          }
          var mb52 = {
            MANDT: "ERROR",
          };
          // Obtener ZCT_ALEACION y ZCT_DIAMETRO_BILLET_PULGADAS del componente de la orden para enviar a validar.
          w_row = oThis.ObtenerCaracteristicasOrdenBillet();
          setTimeout(function () {
            lote = codeqr;
            var oData = {
              BATCH: lote,
            };
            //oThis.getObservaciones( oData, 'MIIExtensions/Components/Transaction/get_observacion', 'area_observacion' );
            //oData = { "CHARG" : "#$%&/()?¡" , "WERKS" : w_blanco , "LGORT" : w_blanco , "MATNR" : w_blanco };
            oData = {
              CHARG: lote,
              WERKS: g_planta,
              LGORT: "0103",
              MATNR: w_blanco,
              ZCT_ALEACION: w_row.ZCT_ALEACION,
              ZCT_DIAMETRO_BILLET_PULGADAS: w_row.ZCT_DIAMETRO_BILLET_PULGADAS,
            };
            // se hardcodea el LGORT porque no hay definicion de almacen configurado que se pueda obtener por configuracion.
            mb52 = oThis.get_row_mb52_lote_billetCorto(oData); // 20230918
            if (mb52.MANDT == "ERROR") {
              lote = "";
            } else {
              material = mb52.MATNR;
              ctd = mb52.LABST;
              um = mb52.MEINS;
              centro = mb52.WERKS;
              almacen = mb52.LGORT;
              matDesc = mb52.MAT_DESC;
            }
            oThis.byId("input_lote").setValue(lote);
            oThis.byId("input_material").setValue(material);
            oThis.byId("desc_material").setValue(matDesc);
            oThis.byId("input_cantidad").setValue(ctd);
            oThis.byId("input_um").setValue(um);
            oThis.byId("input_centro").setValue(centro);
            oThis.byId("input_almacen").setValue(almacen);
          }, 500);
        },
        get_row_mb52_lote_billetCorto: function (lote) {
          var oData = lote;
          var path =
            "MIIExtensions/Components/Transaction/get_mb52_matnr_charg_billetCorto";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          var w_row = {
            MANDT: "ERROR",
          };
          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData.length != 0) {
                  if (aData[0].ERROR !== undefined) {
                    oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                  } else {
                    //Create  the JSON model and set the data
                    w_row = aData[0];
                  }
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });
          return w_row;
        },
        // FC - 20231209 -- end

        onVerCaracteristicas: function (oEvent) {
          var oView = this.getView();
          var oButton = oEvent.getSource(); // ThumbsUp Button in the row
          // Get binding context of the button to identify the row where the event is originated
          var oBindingContext = oButton.getBindingContext(); // <<<-- If you have model name pass it here as string
          var oBindingObject = oBindingContext.getObject();
          orden_caracteristicas = oBindingObject.SHOP_ORDER;
          work_center_caracteristicas = this._oInput.getSelectedKey();
          var oData = {
            ORDER: orden_caracteristicas,
            WORK_CENTER: work_center_caracteristicas,
          };
          if (!this.byId("CharacteristicsFragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.Characteristics", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("CharacteristicsFragment").open();
          }
          this._base_onloadTable(
            "TableCharacteristics",
            oData,
            "MIIExtensions/Orders/Transaction/get_characteristics_ordenadas",
            "Componentes",
            ""
          );
        },

        onVerDefectos: function () {
          var oView = this.getView();
          var oData = {
            BATCH: this.byId("input_lote").getValue(),
          };
          if (!this.byId("DefectosFragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.Defectos",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("DefectosFragment").open();
          }
          this._base_onloadTable(
            "TableDefectos",
            oData,
            "MIIExtensions/Components/Transaction/get_defectos",
            "Defectos",
            ""
          );
          this.getObservaciones(
            oData,
            "MIIExtensions/Components/Transaction/get_observacion",
            "area_observacion_disponible"
          );
        },

        onVerDefectosDisponibles: function (oEvent) {
          var oView = this.getView(),
            oModel_oData = new sap.ui.model.json.JSONModel();
          var oButton = oEvent.getSource(); // ThumbsUp Button in the row
          // Get binding context of the button to identify the row where the event is originated
          var oBindingContext = oButton.getBindingContext(); // <<<-- If you have model name pass it here as string
          var oBindingObject = oBindingContext.getObject();
          var oData = {
            BATCH: oBindingObject.BATCH,
          };
          if (!this.byId("DefectosFragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.Defectos",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("DefectosFragment").open();
          }
          this._base_onloadTable(
            "TableDefectos",
            oData,
            "MIIExtensions/Components/Transaction/get_defectos",
            "Defectos",
            ""
          );
          this.getObservaciones(
            oData,
            "MIIExtensions/Components/Transaction/get_observacion",
            "area_observacion_disponible"
          );
        },

        onVerCaracteristicas_lote: function (oEvent) {
          var oView = this.getView(),
            oModel_oData = new sap.ui.model.json.JSONModel();
          var oButton = oEvent.getSource(); // ThumbsUp Button in the row
          // Get binding context of the button to identify the row where the event is originated
          var oBindingContext = oButton.getBindingContext(); // <<<-- If you have model name pass it here as string
          var oBindingObject = oBindingContext.getObject();
          var oData = {
            MATERIAL: oBindingObject.MATERIAL,
            LOTE: oBindingObject.BATCH,
          };
          oModel_oData.setData(oData);
          oView.setModel(oModel_oData, "characteristics_params");
          if (!this.byId("CharacteristicsFragmentBatch")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.Characteristics_batch", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("CharacteristicsFragmentBatch").open();
          }
          var oTable = oView.byId("TableCharacteristicsBatch");
          var oColumns = oTable.getColumns();
          oColumns[0].setVisible(false);
          oColumns[1].setVisible(false);
          this._base_onloadTable(
            "TableCharacteristicsBatch",
            oData,
            "MIIExtensions/Characteristics/Transaction/batch_get_chars_v2",
            "Caracteristicas",
            ""
          );
        },

        onDeclararSfc: function () {
          var oView = this.getView();
          salida = "PT";
          if (!this.byId("NotificationBascula")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("NotificationBascula").open();
          }
        },

        get_longitud(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          this.byId("input_longitud").setValue("");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;

          // debugger

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  oThis.byId("input_longitud").setValue(aData[0].VALUE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexión de red?"
                );
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

        onConsumptionComponent_open: function (oData, oThis) {
          // 202309

          // debugger
          var oView = oThis.getView();

          if (oView.byId("input_IR_ID_TAB") != undefined) {
            oView.byId("input_IR_ID_TAB").setValue("");
            if (oData.ID_TAB != undefined) {
              oView.byId("input_IR_ID_TAB").setValue(oData.ID_TAB);
            }
          }

          if (oData != undefined) {
            if (oData.WORK_CENTER != undefined) {
              switch (
              oData.WORK_CENTER // 2023092*
              ) {
                case "MESAVAC1": // 202310Q
                  oView.byId("inputCantidadComponent").setValue("");
                  oView.byId("inputCantidadComponent").setEnabled(true);
                  break;

                case "HORFUN01":
                case "HORFUN02":
                case "HORNOFD1":
                case "HORNOFD2":
                case "HORHOM01":
                case "CORLIN01":
                case "PINVER01": // 20231218
                  oView.byId("inputCantidadComponent").setValue(oData.CANTIDAD);
                  oView.byId("inputCantidadComponent").setEnabled(false);
                  break;

                case "PRENSA01":
                case "PRENSA02": // AMGC
                case "PRENSA03": // AMGC
                case "PRENSA04": // AMGC
                case "PRENSA05": // AMGC
                case "PRENSA06": // AMGC
                case "PRENSA07": // AMGC
                case "PRENSA08": // AMGC
                case "PRENSA09": // AMGC
                case "PRENSA10": // AMGC
                case "PRENSA11": // AMGC
                  oView.byId("inputCantidadComponent").setValue(oData.CANTIDAD);
                  //oView.byId("inputCantidadComponent").setEnabled( false );
                  oView.byId("inputCantidadComponent").setEnabled(true); // AGSG*******
                  break;

                default:
                  oView.byId("inputCantidadComponent").setValue("");
                  oView.byId("inputCantidadComponent").setEnabled(true);
                  break;
              }
            }
          }
        },
        onConsumptionComponent: function (oData) {
          // 202309 ---> oData

          var oView = this.getView();
          var oThis = this;

          if (!this.byId("ConsumptionComponent")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.ConsumptionComponent", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oThis.onConsumptionComponent_open(oData, oThis); // 202309
              oDialog.open();
            });
          } else {
            oThis.onConsumptionComponent_open(oData, oThis); // 202309
            this.byId("ConsumptionComponent").open();
          }
        },

        consumptionComponent: function () {
          var oView = this.getView();

          var cantidad = this.byId("inputCantidadComponent").getValue();
          if (cantidad === "0" || cantidad === "") {
            // 20240306
            this.handleInfoMessageBoxPress("Ingresa la cantidad");
            return;
          }

          var cantidad_auxiliar = 0;

          var oitems_component = oView
            .byId("installedComponentTable")
            .getSelectedItems(),
            oitems = oView.byId("OrdersList").getSelectedItems();
          var component = "";
          var batch = "";
          var order = "";
          var w_order_pod = "";
          var almacen = "";
          var um = "";
          var w_WORK_CENTER = this._oInput.getSelectedKey();

          var w_id_tab = ""; // 20231124 ; AGSG***
          if (oView.byId("input_IR_ID_TAB") != undefined) {
            w_id_tab = this.byId("input_IR_ID_TAB").getValue();
          }

          oitems_component.forEach(function (item) {
            component = item.getCells()[0].getText();
            batch = item.getCells()[3].getText();
            order = item.getCells()[6].getText(); // 20240214

            if (item.getBindingContext().getObject().ALMACEN !== undefined) {
              // 20240306
              almacen = item.getBindingContext().getObject().ALMACEN; // 20240306
              cantidad_auxiliar = item
                .getBindingContext()
                .getObject().CANTIDAD_RESTANTE; // 20240306
              um = item.getBindingContext().getObject().UNIT_OF_MEASURE; // 20240306
            }
          });

          // 20240306
          oitems.forEach(function (item) {
            w_order_pod = item.getCells()[0].getText();
          });
          if (
            w_order_pod === "" ||
            w_order_pod == "0" ||
            w_order_pod == "00000000"
          ) {
            this.handleWarningMessageBoxPress("Selecciona una orden activa");
            return;
          }

          if (order === "" || order == "0" || order == "00000000") {
            // 20240306
          } else {
            if (order === w_order_pod) {
              // 20240306
            } else {
              // AGSG ; 20240306
              var w_centro = g_planta;
              var w_sw_instalar = false;

              var w_dato = this.get_row_puesto_trabajo(w_centro, w_WORK_CENTER);
              switch (w_dato.AREA_ID) {
                case "ERROR":
                case "":
                  break;

                case "PRENSAS":
                  w_sw_instalar = true;
                  break;

                default:
                  break;
              }

              if (w_sw_instalar) {
                // 20240306

                cantidad = cantidad_auxiliar; // 20240306

                var oData = {
                  MATERIAL: component,
                  LOTE: batch,
                  CANTIDAD: cantidad,
                  CENTRO: w_centro,
                  ALMACEN: almacen,
                  NUM_ORDEN: w_order_pod,
                  MANDREL: "",
                  DIAMETRO: "",
                  UM: um,
                  WORK_CENTER: w_WORK_CENTER,
                  VIA: via_sfc,
                  USER: user,
                };

                this.onComponentInstall(
                  oData,
                  "MIIExtensions/Consumption/Transaction/install_component"
                ); // 20240306

                cantidad = this.byId("inputCantidadComponent").getValue(); // 20240306

                var w_sw_consumir = false;
                var w_new_id_tab = this.get_IR_maxID(oData); // 20240306
                switch (w_new_id_tab.MESSAGE) {
                  case "ERROR":
                  case "":
                    this.handleWarningMessageBoxPress(
                      "Error: Instalación de Componente en la Orden Seleccionada"
                    );
                    break;

                  case "OK":
                    w_id_tab = w_new_id_tab.ID_TAB;
                    w_sw_consumir = true;
                    break;

                  default:
                    break;
                }

                if (w_sw_consumir) {
                  // 20230306
                  order = w_order_pod;
                } else {
                  return;
                }
              } else {
                return;
              }
            }
          }

          // 20240214 ; ARIVERA ; SI EL LOTE YA TIENE ORDEN EN INSTALACION_ROLLOS, YA NO BUSCO LA ORDEN SELECCIONA EN EL POD YA QUE NO ES NECESARIO
          if (order === "" || order == "0" || order == "00000000") {
            oitems.forEach(function (item) {
              order = item.getCells()[0].getText();
            });
          }

          if (order === "") {
            this.handleWarningMessageBoxPress("Selecciona una orden activa");
            return;
          }

          if (cantidad === "0" || cantidad === "") {
            this.handleInfoMessageBoxPress("Ingresa la cantidad");
          } else {
            var oData = {
              BATCH: batch,
              CANTIDAD: cantidad,
              COMPONENT: component,
              ID_TAB: w_id_tab,
              NUM_ORDER: order,
              USER: user,
              WORK_CENTER: this._oInput.getSelectedKey(),
            };

            console.log(oData);

            //debugger
            this.sendConsumptionComponent(
              oData,
              "MIIExtensions/Consumption/Transaction/send_consumption_component_v2"
            );
            //debugger
          }
        },

        sendConsumptionComponent(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  var oView = oThis.getView(),
                    oitems_orders = oView.byId("OrdersList").getSelectedItems(),
                    order = "";
                  oitems_orders.forEach(function (item) {
                    order = item.getCells()[0].getText();
                  });
                  var xData = {
                    ORDER: order,
                    WORK_CENTER: oThis._oInput.getSelectedKey(),
                  };
                  oThis._base_onloadTable(
                    "installedComponentTable",
                    xData,
                    "MIIExtensions/Components/Transaction/get_installed_components",
                    "Componentes instalados",
                    ""
                  );
                  oThis.onCancelComponentConsumption();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onSaveCharacteristicsBatch: function () {
          var oView = this.getView(),
            oItems = oView.byId("TableCharacteristicsBatch").getItems(),
            xml_completo = "",
            char_params = oView.getModel("characteristics_params");
          xml_completo = "<Rowsets>\n";
          xml_completo += "<Rowset>\n";
          oItems.forEach(function (item) {
            xml_completo += "<Row>\n";
            xml_completo +=
              "<CHARACT>" +
              item.getCells()[0].getProperty("text") +
              "</CHARACT>\n";
            xml_completo +=
              "<DESC>" + item.getCells()[2].getProperty("text") + "</DESC>\n";
            xml_completo +=
              "<VALUE>" +
              item.getCells()[3].getProperty("value") +
              "</VALUE>\n";
            xml_completo +=
              "<TYPE>" + item.getCells()[1].getProperty("text") + "</TYPE>\n";
            xml_completo += "</Row>\n";
          });
          xml_completo += "</Rowset>\n";
          xml_completo += "</Rowsets>\n";
          var oData = {
            MATERIAL: char_params.getProperty("/MATERIAL"),
            BATCH: char_params.getProperty("/LOTE"),
            CHARS: xml_completo,
          };
          console.log(oData);
          console.log(xml_completo);
          this.sendCharacteristicsBatch(
            oData,
            "MIIExtensions/Characteristics/Transaction/change_char"
          );
        },

        sendCharacteristicsBatch(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].error !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].error);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].message);
                  oThis.onCloseFragmentCharacteristicsBatch();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        getChars_batch(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          this.byId("input_ancho").setValue("");
          this.byId("input_espesor").setValue("");
          this.byId("input_diametro").setValue("");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  oThis.byId("input_ancho").setValue(aData[0].ANCHO);
                  oThis.byId("input_espesor").setValue(aData[0].ESPESOR);
                  console.log(aData);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexión de red?"
                );
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

        checkViasEntrada: function (oData, path) {
          var uri =
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  if (aData[0].MESSAGE != "1") {
                    oThis.onModalSeleccionarViaEntrada();
                  } else {
                    oThis.checkRollo(
                      oData,
                      "MIIExtensions/Consumption/Transaction/check_rollo"
                    );
                  }
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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



        onCerrarOrden: function () {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          var oData = {
            ORDER: order,
          };
          if (order === "")
            this.handleInfoMessageBoxPress("Selecciona una orden activa");
          else
            this.onApproveCerrar(
              "Al terminar una orden ya no podr\u00E1 ser visualizada. \u00BFDesea continuar?"
            );
        },

        setCerrarOrden: function () {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          var oData = {
            ORDER: order,
            WORK_CENTER: this._oInput.getSelectedKey(),
            USER: user,
          };
          this.CerrarOrder(
            oData,
            "MIIExtensions/Orders/Transaction/close_order"
          );
        },

        CerrarOrder: function (oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  var xData = {
                    WORK_CENTER: oThis._oInput.getSelectedKey(),
                  };
                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable(
                    "OrdersList",
                    xData,
                    "MIIExtensions/Orders/Transaction/get_started_ordenes",
                    "Ordenes",
                    ""
                  );
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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



        evalua_TipoWC: function (work_center) {
          //Arivera
          //evalua el tipo de puesto de trabajo, para saber si es necesario que se muestre un fragment para que agregue el porque del desmontaje del billet
          let oModel_return = new sap.ui.model.json.JSONModel();
          let tipoWC_return = "";
          var path =
            "MIIExtensions/Components/Transaction/chk_tipoWC_CausaDesmontaje";
          let oData = {
            WORK_CENTER: work_center,
          };
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            async: false,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = JSON.parse(opElement.firstChild.data);
                if (aData !== undefined) {
                  if (aData.error !== undefined) {
                    oThis.handleErrorMessageBoxPress(aData.error);
                  } else {
                    oModel_return.setData(aData);
                  }
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });
          return oModel_return;
        },
        onCancelDefectoDesmontaje: function () {
          //Arivera
          this.byId("defectoDesmontaje_fragment").close();
        },

        onCreateSFC_late: function () {
          var oView = this.getView(),
            oitems_component = oView
              .byId("RollosConsumidosTable")
              .getSelectedItems(),
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            component = "",
            batch = "",
            order = "";
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (order === "")
            this.handleWarningMessageBoxPress("Selecciona una orden Activa");
          else {
            oitems_component.forEach(function (item) {
              component = item.getCells()[0].getText();
              batch = item.getCells()[3].getText();
            });
            if (component === "")
              this.handleWarningMessageBoxPress("Selecciona un componente");
            else {
              var oData = {
                COMPONENT: component,
                BATCH: batch,
                WORK_CENTER: this._oInput.getSelectedKey(),
                SITE: g_planta,
                USER: user,
                ORDER: order,
              };
              this.ActiveComponent(
                oData,
                "MIIExtensions/SFC/Transaction/generate_sfc",
                0
              );
            }
          }
        },

        onCreateSFC: function () {
          var oView = this.getView(),
            oitems_component = oView
              .byId("installedComponentTable")
              .getSelectedItems(),
            component = "",
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            batch = "",
            order = "";
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (order === "")
            this.handleWarningMessageBoxPress("Selecciona una orden Activa");
          else {
            oitems_component.forEach(function (item) {
              component = item.getCells()[0].getText();
              batch = item.getCells()[3].getText();
            });
            if (component === "" || oitems_component.length !== 1)
              this.handleWarningMessageBoxPress("Selecciona un componente");
            else {
              var oData = {
                WORK_CENTER: this._oInput.getSelectedKey(),
              };
              this.checkViasSalida(
                oData,
                "MIIExtensions/SFC/Transaction/check_vias_salida"
              );
            }
          }
        },

        checkViasSalida: function (oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  oThis.createSFC_2(1);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        createSFC_2: function (via) {
          // debugger
          console.log("SFC_2");
          var oView = this.getView(),
            oitems_component = oView
              .byId("installedComponentTable")
              .getSelectedItems(),
            component = "",
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            batch = "",
            order = "";
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (order === "")
            this.handleWarningMessageBoxPress("Selecciona una orden Activa");
          else {
            oitems_component.forEach(function (item) {
              component = item.getCells()[0].getText();
              batch = item.getCells()[3].getText();
            });
            if (component === "")
              this.handleWarningMessageBoxPress("Selecciona un componente");
            else {
              var oData = {
                WORK_CENTER: this._oInput.getSelectedKey(),
              };
              var oData = {
                COMPONENT: component,
                BATCH: batch,
                WORK_CENTER: this._oInput.getSelectedKey(),
                SITE: g_planta,
                USER: user,
                ORDER: order,
                VIA: via,
                SECTOR: w_sector_aluminio,
              };
              console.log(oData);

              // debugger
              this.ActiveComponent(
                oData,
                "MIIExtensions/SFC/Transaction/generate_sfc",
                1
              );
              // debugger
            }
          }
        },

        onModalSeleccionarVia: function () {
          var oView = this.getView(),
            operation = this._oInput.getSelectedKey(),
            oData = {
              WORK_CENTER: operation,
            };
          if (!this.byId("SelectVia_galvanizado")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.SelectVia",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("SelectVia_galvanizado").open();
          }
          this._base_onloadCOMBO(
            "Vias_Select_SFC",
            oData,
            "MIIExtensions/Components/Transaction/get_vias",
            "1",
            "Vias"
          );
        },

        onModalSeleccionarViaEntrada: function () {
          var oView = this.getView(),
            operation = this._oInput.getSelectedKey(),
            oData = {
              WORK_CENTER: operation,
            };
          if (!this.byId("SelectVia_entrada")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.SelectViaEntrada",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("SelectVia_entrada").open();
          }
          this._base_onloadCOMBO(
            "Vias_Select_entrada",
            oData,
            "MIIExtensions/Components/Transaction/get_vias",
            "1",
            "Vias"
          );
        },

        onInstallVia: function () {
          var via = this.byId("Vias_Select_entrada").getSelectedKey(),
            oView = this.getView(),
            oitems_orders = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems_orders.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (via === "") {
            this.handleErrorMessageBoxPress("Selecciona la via");
            return;
          } else {
            this.onCloseSelectViasEntrada();
            via_sfc = via;
            var oView = this.getView(),
              material = oView.byId("input_material").getValue(),
              lote = oView.byId("input_lote").getValue();
            var oData = {
              MATERIAL: material,
              WORK_CENTER: this._oInput.getSelectedKey(),
              BATCH: lote,
              NUM_ORDEN: order,
            };
            console.log(oData);
            this.checkRollo(
              oData,
              "MIIExtensions/Consumption/Transaction/check_rollo"
            );
          }
        },

        onValidateCreateSFC_alone: function () {
          var oView = this.getView(),
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (order === "")
            this.handleWarningMessageBoxPress("Selecciona una orden Activa");
          else {
            var oData = {
              ORDER: order,
            };
            this.ValidateCreateSFC_alone(
              oData,
              "MIIExtensions/SFC/Transaction/check_create_sfc"
            );
          }
        },

        ValidateCreateSFC_alone(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  oThis.onDataSFC_alone();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onDataSFC_alone: function () {
          var oView = this.getView(),
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (order === "")
            this.handleWarningMessageBoxPress("Selecciona una orden Activa");
          else {
            var oData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
              USER: user,
            };
            this.CreateSFC_alone(
              oData,
              "MIIExtensions/SFC/Transaction/generate_sfc_alone"
            );
          }
        },

        CreateSFC_alone(oData, path, reloadTable) {
          // debugger
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onCancelarCP: function () {
          var oView = this.getView(),
            oitems_components = oView
              .byId("NotificationComponent_Table")
              .getSelectedItems(),
            lote = "";
          oitems_components.forEach(function (item) {
            lote = item.getCells()[3].getText();
          });
          if (lote === "") {
            this.handleWarningMessageBoxPress("Seleccione un CP");
            return;
          }
          var oData = {
            BATCH: lote,
            USER: user,
          };
          this.onApproveAnularCP(oData);
          console.log(oData);
        },

        anularCP(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  var oView = oThis.getView(),
                    oitems = oView.byId("OrdersList").getSelectedItems(),
                    order = "";
                  oitems.forEach(function (item) {
                    order = item.getCells()[0].getText();
                  });
                  var xData = {
                    ORDER: order,
                  };
                  oThis._base_onloadTable(
                    "NotificationComponent_Table",
                    xData,
                    "MIIExtensions/SFC/Transaction/get_pending_notification",
                    "CP",
                    ""
                  );
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        getPesoBascula(oEvent) {
          var notification_type = oEvent.getParameter("selectedItem").getKey(),
            oData = {
              TAG_TYPE: notification_type,
            };
          console.log(notification_type);
          this.getPeso_bascula(
            oData,
            "MIIExtensions/PCoTags/Transaction/get_peso"
          );
        },

        getPeso_bascula(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          if (salida === "PT") this.byId("inputPesoBascula").setValue("");
          else if (salida == "PAILA")
            this.byId("input_peso_dross").setValue("");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  if (salida === "PT")
                    oThis.byId("inputPesoBascula").setValue(aData[0].VALUE);
                  else if (salida === "PAILA")
                    oThis.byId("input_peso_dross").setValue(aData[0].VALUE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexión de red?"
                );
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

        get_tagType(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          this.byId("inputPesoBascula").setValue("");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  var xData = {
                    TAG_TYPE: aData[0].VALUE,
                  };
                  console.log(aData[0].VALUE);
                  oThis.byId("combo_basculas").setSelectedKey(aData[0].VALUE);
                  oThis.getPeso_bascula(
                    xData,
                    "MIIExtensions/PCoTags/Transaction/get_peso"
                  );
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        getPeso_declaracion(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          this.byId("inputPesoBascula").setValue("");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  oThis.byId("inputPesoBascula").setValue(aData[0].VALUE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        consumirMateriales(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  var oView = oThis.getView(),
                    oitems_orders = oView.byId("OrdersList").getSelectedItems(),
                    order = "";
                  oitems_orders.forEach(function (item) {
                    order = item.getCells()[0].getText();
                  });
                  var xData = {
                    ORDER: order,
                    WORK_CENTER: oThis._oInput.getSelectedKey(),
                  };
                  oThis._base_onloadTable(
                    "installedComponentTable",
                    xData,
                    "MIIExtensions/Components/Transaction/get_installed_components",
                    "Componentes instalados",
                    ""
                  );
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: ¿Hay conexion de red?"
                );
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

        onComponentInstall(oData, path) {
          console.log("INSTALL");
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;

          //<!-- type: "GET", -->

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              console.log(xmlDOM);
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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
        onConsumirRollo: function () {
          var oView = this.getView(),
            oitems_component = oView
              .byId("installedComponentTable")
              .getSelectedItems(),
            component = "",
            batch = "";
          oitems_component.forEach(function (item) {
            component = item.getCells()[0].getText();
            batch = item.getCells()[3].getText();
          });
          if (component === "")
            this.handleWarningMessageBoxPress("Selecciona un componente");
          else {
            var oData = {
              COMPONENT: component,
              BATCH: batch,
              WORK_CENTER: this._oInput.getSelectedKey(),
              USER: user,
            };
            console.log(oData);
            this.consumirMateriales(
              oData,
              "MIIExtensions/Consumption/Transaction/send_consumption"
            );
          }
        },

        onVerRollosDisponibles: function () {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (order === "")
            this.handleWarningMessageBoxPress("Selecciona una orden activa");
          else {
            this.onRollosDisponibles();
          }
        },
        onRollosDisponibles: function () {
          var operation = this._oInput.getSelectedKey();
          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            var oView = this.getView(),
              oitems_orders = oView.byId("OrdersList").getSelectedItems(),
              order = "";
            oitems_orders.forEach(function (item) {
              order = item.getCells()[0].getText();
            });
            var oData = {
              ORDER: order,
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
            console.log(oData);
            if (!this.byId("availableComponentFragment")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.RollosDisponibles", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
              });
            } else {
              this.byId("availableComponentFragment").open();
            }
            this._base_onloadTable(
              "availableComponentTable",
              oData,
              "MIIExtensions/Consumption/Transaction/sel_rollos_disponibles",
              "Componentes disponibles",
              ""
            );
          }
        },

        //JERO CERRAR FRAGMENTO MASIVO
        cerrarComponentesMasivo: function () {
          this.byId("componentesInstaladosMasivo").destroy();
        },
        onRollosConsumidos: function () {
          var oThis = this;
          var oView = this.getView();

          var oData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
          };

          // 20240627
          var order = "";
          if (oView.byId("OrdersList") !== undefined) {
            var oitems = oView.byId("OrdersList").getSelectedItems();
            oitems.forEach(function (item) {
              order = item.getCells()[0].getText();
            });
          }
          oData.NUM_ORDER = order;
          if (order == "") {
            // 20240627
            this.handleWarningMessageBoxPress(
              "Selecciona una Orden de Producci\u00F3n"
            );
            return;
          }

          var operation = this._oInput.getSelectedKey();

          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            if (!this.byId("RollosConsumidosFragment")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.RollosConsumidos", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                oThis._base_onloadTable(
                  "RollosConsumidosTable",
                  oData,
                  "MIIExtensions/Components/Transaction/get_rollos_consumidos",
                  "Rollos cosumidos",
                  ""
                );
              });
            } else {
              this.byId("RollosConsumidosFragment").open();
              this._base_onloadTable(
                "RollosConsumidosTable",
                oData,
                "MIIExtensions/Components/Transaction/get_rollos_consumidos",
                "Rollos cosumidos",
                ""
              );
            }
          }
        },


        onApproveCerrar: function (message) {
          var oThis = this;
          var oDialog = new Dialog({
            title: "Confirmar acci\u00F3n",
            type: "Message",
            content: new Text({
              text: message,
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Aceptar",
              press: function () {
                oThis.setCerrarOrden();
                oDialog.close();
              },
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () {
                oDialog.close();
              },
            }),
            afterClose: function () {
              oDialog.destroy();
            },
          });
          oDialog.open();
        },

        //JERO : Consumo masivo para Horno HOM **
        consumirComponentesMasivo: function () {
          if (this.byId("OrdersList").getSelectedItem() === null) {
            MessageBox.error("Debe indicar una order de fabricación");
            return;
          }
          var tbl_items = this.byId(
            "installedComponentTable"
          ).getSelectedItems();
          var items = "";
          var elemento, errores;
          var batch, cantidad, component, id_tab, num_order, user, work_center;
          if (tbl_items.length === 0) {
            MessageBox.error("Debes seleccionar AL MENOS un registro");
            return;
          }
          items = "<Rowsets>\n";
          items += "<Rowset>\n";
          for (var i = 0; i < tbl_items.length; i++) {
            elemento = tbl_items[i];
            batch = elemento.getBindingContext().getProperty("BATCH");
            cantidad = elemento
              .getBindingContext()
              .getProperty("CANTIDAD_RESTANTE");
            component = elemento.getBindingContext().getProperty("MATERIAL");
            id_tab = elemento.getBindingContext().getProperty("ID_TAB");
            num_order = this.byId("OrdersList")
              .getSelectedItem()
              .getBindingContext()
              .getProperty("SHOP_ORDER");
            user = this.getView()
              .getModel("ModeloPrincipal")
              .getProperty("/USUARIO");
            work_center = this.getView()
              .getModel("ModeloPrincipal")
              .getProperty("/WORK_CENTER");
            items += "<Row>\n";
            items += "<BATCH>" + batch + "</BATCH>\n";
            items += "<CANTIDAD>" + cantidad + "</CANTIDAD>\n";
            items += "<COMPONENT>" + component + "</COMPONENT>\n";
            items += "<ID_TAB>" + id_tab + "</ID_TAB>\n";
            items += "<NUM_ORDER>" + num_order + "</NUM_ORDER>\n";
            items += "<USER>" + user + "</USER>\n";
            items += "<WORK_CENTER>" + work_center + "</WORK_CENTER>\n";
            items += "</Row>\n";
            if (cantidad.trim() === "" || isNaN(cantidad)) {
              errores = true;
            }
          }
          items += "</Rowset>\n";
          items += "</Rowsets>\n";
          console.log(items);
          if (errores) {
            MessageBox.error("Debe validar las cantidades escritas");
            return;
          }
          var usuario = this.getView()
            .getModel("ModeloPrincipal")
            .getProperty("/USUARIO");
          var path =
            "MII/DatosTransaccionales/Produccion/Fundicion/Horno/Transaction/ConsumoMasivo";
          var oData = {
            ITEMS: items,
            USUARIO: usuario,
          };
          var message = "¿Confirmar Consumos?";
          var postEx = "CONSUMO_MASIVO";
          this.confirmarAccion(oData, path, message, postEx);
          //this.recuperarComponentesInstalados();
        },
        dataCheckComponent: function () {
          var oView = this.getView(),
            oitems_component = oView
              .byId("installedComponentTable")
              .getSelectedItems(),
            component = "",
            batch = "";
          var cantidad = "0"; // 202309
          var w_id_tab = "0"; // 202311
          var w_doc_m261 = ""; // 20231231
          let sQtyPendiente = 0; // 20240102 DPR

          oitems_component.forEach(function (item) {
            component = item.getCells()[0].getText();
            batch = item.getCells()[3].getText();
            cantidad = item.getCells()[5].getText();
            w_id_tab = item.getCells()[11].getText(); // AGSG***
            if (item.getBindingContext().getObject().DOCUMENTO !== undefined) {
              // 20231231
              w_doc_m261 = item.getBindingContext().getObject().DOCUMENTO; // 20231231
              sQtyPendiente = parseFloat(
                item.getBindingContext().getObject().CANTIDAD_RESTANTE
              );
            }
          });

          if (w_doc_m261 != "" && sQtyPendiente == 0) {
            // 20240102 DPR
            this.handleWarningMessageBoxPress(
              "Componente seleccionado [consumo previamente realizado]"
            );
            return;
          } else {
            if (component === "")
              this.handleWarningMessageBoxPress("Selecciona un componente");
            else {
              var oData = {
                BATCH: batch,
                CANTIDAD: cantidad,
                ID_TAB: w_id_tab,
                MATERIAL: component,
                WORK_CENTER: this._oInput.getSelectedKey(),
              };
              console.log(oData);
              this.checkComponent(
                oData,
                "MIIExtensions/Components/Transaction/check_component"
              );
            }
            console.log(oData);
          }
        },
        checkComponent(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;

          //	type: "GET",

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  console.log(aData[0]);
                  //Create  the JSON model and set the data
                  if (aData[0].TYPE === "R")
                    oThis.onApproveConsumption(oData); // 202309 --> oData
                  else if (aData[0].TYPE === "NR")
                    oThis.onConsumptionComponent(oData); // 202309 --> oData
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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
        onApproveConsumption: function (oData) {
          // 202309* --> oData
          var oThis = this;
          var oDialog = new Dialog({
            title: "Confirmar acci\u00F3n",
            type: "Message",
            content: new Text({
              text: "Antes de consumir el componente, asegurese de declarar todos los productos resultantes",
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Aceptar",
              press: function () {
                oThis.onConsumirRollo();
                oDialog.close();
              },
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () {
                oDialog.close();
              },
            }),
            afterClose: function () {
              oDialog.destroy();
            },
          });
          oDialog.open();
        },

        onApproveAnular101: function (oData) {
          var oThis = this;
          var oDialog = new Dialog({
            title: "Confirmar acci\u00F3n",
            type: "Message",
            content: new Text({
              text: "Confirme que desea anular el lote. Una vez realizada la anulaci\u00F3n, el lote ya no podr\u00E1 se visualizado",
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Confirmar",
              press: function () {
                oThis.anular101(
                  oData,
                  "MIIExtensions/SFC/Transaction/anular_movimiento"
                );
                oDialog.close();
              },
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () {
                oDialog.close();
              },
            }),
            afterClose: function () {
              oDialog.destroy();
            },
          });
          oDialog.open();
        },
        onApproveAnularCP: function (oData) {
          var oThis = this;
          var oDialog = new Dialog({
            title: "Confirmar acci\u00F3n",
            type: "Message",
            content: new Text({
              text: "Una vez cancelado el CP, su numero de serie ya no podrá ser utilizado",
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Confirmar",
              press: function () {
                oThis.anularCP(
                  oData,
                  "MIIExtensions/SFC/Transaction/cancel_SFC_0"
                );
                oDialog.close();
              },
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () {
                oDialog.close();
              },
            }),
            afterClose: function () {
              oDialog.destroy();
            },
          });
          oDialog.open();
        },

        /*+++++++++++++++++ INICIO CAMBIAR ORDERN ++++++++++++++*/
        onCambiarOrden: function () {
          var oView = this.getView(),
            oitems_component = oView
              .byId("ProductionReport_Table")
              .getSelectedItems(),
            orden = "";
          if (oitems_component.length === 0) {
            this.handleWarningMessageBoxPress("Selecciona un registro");
            return;
          } else {
            oitems_component.forEach(function (item) {
              orden = item.getCells()[0].getText();
            });
            if (!this.byId("CambiarOrden")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.CambiarOrden", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
              });
            } else {
              this.byId("CambiarOrden").open();
            }
            var xData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
            console.log(xData);
            this.byId("inputOrdenActual").setValue(orden);
            this._base_onloadCOMBO(
              "combo_nuevaOrden",
              xData,
              "MIIExtensions/Orders/Transaction/get_started_ordenes_combo",
              "",
              "Ordenes Disponibles"
            );
          }
        },
        CambiarOrden: function () {
          var nueva_orden = this.byId("combo_nuevaOrden").getSelectedKey();
          if (nueva_orden === "") {
            this.handleInfoMessageBoxPress("Selecciona una orden");
            return;
          } else {
            var oView = this.getView(),
              oitems_component = oView
                .byId("ProductionReport_Table")
                .getSelectedItems(),
              order = "",
              lote = "",
              documento = "";
            oitems_component.forEach(function (item) {
              order = item.getCells()[0].getText();
              documento = item.getCells()[7].getText();
              lote = item.getCells()[5].getText();
            });
          }
          var oData = {
            DOCUMENTO: documento,
            USER: user,
            BATCH: lote,
            ORDER: order,
            NEW_ORDER: nueva_orden,
          };
          console.log(oData);
          this.cambiar_orden(
            oData,
            "MIIExtensions/SFC/Transaction/change_order"
          );
        },
        cambiar_orden(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  oThis.onReporteProduccion();
                  oThis.onCancelCambiarOrden();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
                sap.ui.core.BusyIndicator.hide();
              }
            });
        },
        /* ++++++++++++++++ FIN CAMBIAR ORDEN +++++++++++++++++ */
        /*+++++++++++++++++ INICIO CAMBIAR PADRE +++++++++ */
        onCambiarPadre: function () {
          var oView = this.getView(),
            oitems_component = oView
              .byId("ProductionReport_Table")
              .getSelectedItems(),
            lote = "";
          if (oitems_component.length === 0) {
            this.handleWarningMessageBoxPress("Selecciona un registro");
            return;
          } else {
            oitems_component.forEach(function (item) {
              lote = item.getCells()[4].getText();
            });
            if (!this.byId("CambiarMaster")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.CambiarPadre", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
              });
            } else {
              this.byId("CambiarMaster").open();
            }
            var xData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
            console.log(xData);
            this.byId("inputRolloActual").setValue(lote);
            this._base_onloadCOMBO(
              "combo_rolloMaster",
              xData,
              "MIIExtensions/Components/Transaction/get_rollos_activos_consumidos",
              "",
              "Rollos Disponibles"
            );
          }
        },
        CambiarMaster: function () {
          var nuevo_master = this.byId("combo_rolloMaster").getSelectedKey();
          if (nuevo_master === "") {
            this.handleInfoMessageBoxPress("Selecciona un rollo master");
            return;
          } else {
            var oView = this.getView(),
              oitems_component = oView
                .byId("ProductionReport_Table")
                .getSelectedItems(),
              lote = "",
              documento = "";
            oitems_component.forEach(function (item) {
              lote = item.getCells()[5].getText();
              documento = item.getCells()[7].getText();
            });
          }
          var oData = {
            DOCUMENTO: documento,
            BATCH: lote,
            USER: user,
            ROLLO_MASTER: nuevo_master,
          };
          console.log(oData);
          this.cambiar_master(
            oData,
            "MIIExtensions/SFC/Transaction/change_master"
          );
        },
        cambiar_master(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  oThis.onReporteProduccion();
                  oThis.onCancelCambiarMaster();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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
        /*+++++++++++++++++ FIN CAMBIAR PADRE ++++++++++++*/
        /*+++++++++++++++++  INICIO ANULACIONES +++++++++++*/
        onAnular101: function () {
          var oView = this.getView(),
            oitems_component = oView
              .byId("ProductionReport_Table")
              .getSelectedItems(),
            lote = "",
            documento = "",
            order = "",
            Id;
          if (oitems_component.length === 0) {
            this.handleWarningMessageBoxPress("Selecciona un registro");
            return;
          } else {
            oitems_component.forEach(function (item) {
              order = item.getCells()[0].getText();
              lote = item.getCells()[5].getText();
              documento = item.getCells()[7].getText();
              //Id = item.getCells()[18].getText();
              Id = item.getBindingContext().getObject().ID;
            });
          }
          var oData = {
            DOCUMENTO: documento,
            CHARG: lote,
            USER: user,
            MOVIMIENTO: 101,
            NUM_ORDER: order,
            ID: Id,
          };
          console.log(oData);
          this.onApproveAnular101(oData);
        },
        anular101(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  var xData = {
                    WORK_CENTER: oThis._oInput.getSelectedKey(),
                  };
                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable(
                    "OrdersList",
                    xData,
                    "MIIExtensions/Orders/Transaction/get_started_ordenes",
                    "Ordenes",
                    ""
                  );
                  oThis.onReporteProduccion();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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
        /*+++++++++++++++++  FIN ANULACIONES +++++++++++*/
        /*+++++++++++++++++  INICIO DROSS +++++++++++++++++*/
        onModalDross: function () {
          var oView = this.getView(),
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          salida = "PAILA";
          if (order === "")
            this.handleWarningMessageBoxPress("Selecciona una orden");
          else {
            if (!this.byId("ModalDeclararDross")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.DeclararDross", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
              });
            } else {
              this.byId("ModalDeclararDross").open();
            }
            var xData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
            this._base_onloadCOMBO(
              "combo_basculas_dross",
              xData,
              "MIIExtensions/Operation/Transaction/get_basculas",
              "",
              "Basculas"
            );
            this._base_onloadCOMBO(
              "material_dross",
              xData,
              "MIIExtensions/Mermas/Transaction/get_dross_materials",
              "",
              "Materiales dross"
            );
          }
        },
        onDeclararDross: function () {
          var oView = this.getView(),
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            order = "",
            material = this.byId("material_dross").getSelectedKey(),
            peso = this.byId("input_peso_dross").getValue();
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          if (material === "") {
            this.handleInfoMessageBoxPress("Selecciona el material");
            return;
          }
          if (peso === "" || peso === "0") {
            this.handleInfoMessageBoxPress("Ingresa el peso");
            return;
          }
          var oData = {
            MATERIAL: material,
            PESO: peso,
            ORDEN: order,
            WORK_CENTER: this._oInput.getSelectedKey(),
            USER: user,
          };
          this.sendDross(
            oData,
            "MIIExtensions/Mermas/Transaction/declare_dross"
          );
        },
        sendDross(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  oThis.onCancelDeclararDross();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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
        /*+++++++++++++++++  FIN DROSS ++++++++++++++++++++*/
        onUpdateLX03: function () {
          var oData = {
            BATCH: this.byId("input_lote").getValue(),
          };
          this.UpdateLX03(
            oData,
            "MIIExtensions/Components/Transaction/upd_lx03_single"
          );
        },
        UpdateLX03(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        getObservaciones(oData, path, area_id) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  oThis.byId(area_id).setValue(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        desinstalar_componente(oData, path, reloadTable) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  if (reloadTable) {
                    var oView = oThis.getView(),
                      oitems_orders = oView
                        .byId("OrdersList")
                        .getSelectedItems(),
                      order;
                    oitems_orders.forEach(function (item) {
                      order = item.getCells()[0].getText();
                    });
                    var xData = {
                      ORDER: order,
                      WORK_CENTER: oThis._oInput.getSelectedKey(),
                    };
                    console.log(xData);
                    oThis._base_onloadTable(
                      "installedComponentTable",
                      xData,
                      "MIIExtensions/Components/Transaction/get_installed_components",
                      "Componentes instalados",
                      ""
                    );
                  }
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onPrintPT(oEvent) {
          var oButton = oEvent.getSource(); // ThumbsUp Button in the row
          // Get binding context of the button to identify the row where the event is originated
          var oBindingContext = oButton.getBindingContext(); // <<<-- If you have model name pass it here as string
          var oBindingObject = oBindingContext.getObject();
          var lote = oBindingObject.BATCH;

          if (oBindingObject.IMPRESIONES > 0) {
            MessageBox.warning(
              "Ya se imprimio una etiqueta¿Seguro deseas re-imprimirla?",
              {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                  if (oAction === MessageBox.Action.YES) {
                    this.onImprimirEtiqueta(oBindingObject.BATCH);
                  } else {
                    return;
                  }
                }.bind(this),
              }
            );
          } else {
            this.onImprimirEtiqueta(lote);
          }
        },

        onImprimirEtiqueta: function (Lote) {
          var w_trx =
            "MII/DatosTransaccionales/ZebraPrinting/Transaction/ImprimirEtiquetaFundicion";
          var oData = {
            inLote: Lote,
          };
          this._Realiza_ajax(w_trx, oData, null);
        },

        getUniqueName: function () {
          var user;
          var oThis = this;
          $.ajax({
            type: "GET",
            //url: "http://" + oThis.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
            url:
              server +
              "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
            dataType: "xml",
            async: false,
            cache: false,
            success: function (xml) {
              user = $(xml).find("Profile").attr("uniquename");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              console.log("ERROR");
            },
          });
          return user.toUpperCase();
        },

        onCompletarSfc_cancel: function () {
          this.byId("listaRollosDialog").close();
        },
        onCancelCambiarMaster: function () {
          this.byId("CambiarMaster").close();
        },
        onCancelNotificationOrder: function () {
          if (this.byId("NotificationBascula") != undefined) {
            this.byId("NotificationBascula").close();
            this.byId("NotificationBascula").destroy();
          }
          if (this.byId("NotificationBascula_Fundicion_Hornos") != undefined) {
            this.byId("NotificationBascula_Fundicion_Hornos").close();
            this.byId("NotificationBascula_Fundicion_Hornos").destroy();
          }
          if (this.byId("NotificationBascula_Prensas") != undefined) {
            this.byId("NotificationBascula_Prensas").close();
            this.byId("NotificationBascula_Prensas").destroy();
          }
        },
        onCancelNotificationOrder_fundicion_hornos: function () {
          // 202309
          this.onCancelNotificationOrder();
        },
        onCancelNotificationOrder_prensas: function () {
          // 202311
          this.onCancelNotificationOrder();
        },
        onCancelarListaComponentes: function () {
          this.byId("listaComponenteDialog").close();
        },
        // Begin - FC - 20231211
        onCancelarMontarBilletCorto: function () {
          this.byId("ComponentInstallBilletCorto").close();
          //this.byId("ComponentInstallBilletCorto").destroy(true);
        },
        onCloseDestroy: function (oEvent) {
          if (this.byId("ComponentInstallBilletCorto")) {
            this.byId("ComponentInstallBilletCorto").destroy(true);
          } else if (this.byId("InstalacionDialog")) {
            this.byId("InstalacionDialog").destroy(true);
          }
          //			debugger;
        },
        // END - FC - 20231211
        onCloseInstalledComponents: function () {
          this.byId("installedComponentFragment").destroy();
        },
        onCloseAdjust: function () {
          var oView = this.getView();
          oView.byId("AdjustFragment").close();
          oView.byId("AdjustFragment").destroy();
          sap.ui.core.BusyIndicator.hide();
          g_orderseleccionada = "";
        },
        onCloseSelectViaSFC: function () {
          this.byId("SelectVia_galvanizado").close();
        },
        onCloseFragmentCharacteristics: function () {
          orden_caracteristicas = "";
          work_center_caracteristicas = "";
          this.byId("CharacteristicsFragment").close();
        },
        onCloseSelectViasEntrada: function () {
          this.byId("SelectVia_entrada").close();
        },
        onCloseFragmentCharacteristicsBatch: function () {
          this.byId("CharacteristicsFragmentBatch").close();
        },
        onCancelCambiarOrden: function () {
          this.byId("CambiarOrden").close();
        },
        onCloseReporteProduccion: function (oEvent) {
          if (
            this.byId("Reporte_generar_atados_unifica_menudeo_frg") != undefined
          ) {
            // 20231222
            this.byId("Reporte_generar_atados_unifica_menudeo_frg").close();
            this.byId("Reporte_generar_atados_unifica_menudeo_frg").destroy();
          }
          if (this.byId("Reporte_generar_atados__frg") != undefined) {
            this.byId("Reporte_generar_atados__frg").close();
            this.byId("Reporte_generar_atados__frg").destroy();
          }
          if (this.byId("ProductionReport_Fragment") != undefined) {
            this.byId("ProductionReport_Fragment").close();
            this.byId("ProductionReport_Fragment").destroy();
          }
        },
        onCloseReporte_generar_atados_unifica_menudeo: function (oEvent) {
          // 20231222
          this.onCloseReporteProduccion();
        },
        onCloseReporte_generar_atados: function (oEvent) {
          this.onCloseReporteProduccion();
        },
        onCloseReporteMermas: function () {
          this.byId("ReporteMermas_fragment").close();
        },
        onClosePendingNotificacions: function () {
          this.byId("NotificationComponent_Fragment").close();
        },
        onCloseRollosConsumidos: function () {
          this.byId("RollosConsumidosFragment").close();
        },
        onCancelComponentConsumption: function () {
          this.byId("ConsumptionComponent").close();
        },
        onCloseFragmentDefectos: function () {
          this.byId("DefectosFragment").close();
        },
        onCloseRollosDisponibles: function () {
          this.byId("availableComponentFragment").close();
        },
        onCancelDeclararDross: function () {
          this.byId("ModalDeclararDross").close();
        },

        handleErrorMessageBoxPress: function (message) {
          MessageBox.error(message);
        },
        handleWarningMessageBoxPress: function (message) {
          MessageBox.warning(message);
        },
        handleInfoMessageBoxPress: function (message) {
          MessageBox.information(message);
        },
        onReAbrirOrden: function () {
          var oView = this.getView();
          var w_wc = this._oInput.getSelectedKey();
          if (w_wc === "")
            this.handleInfoMessageBoxPress("Seleccione un Puesto de Trabajo");
          else this.onOrdenesCerradas();
        },
        onOrdenesCerradas: function () {
          var w_wc = this._oInput.getSelectedKey();
          if (w_wc === "")
            this.handleWarningMessageBoxPress(
              "Seleccione un Puesto de Trabajo"
            );
          else {
            this.onValueOrdersRequested_C();
          }
        },
        onValueOrdersRequested_C: function () {
          var aCols = this.oColModel_orders.getData().cols,
            othis = this,
            oData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
          var w_trx = "MIIExtensions/Orders/Transaction/get_ordenes_cerradas";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            w_trx +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");

          sap.ui.core.BusyIndicator.show(0);

          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              var aData = JSON.parse(opElement.firstChild.data);
              othis.oOrdersModel = new JSONModel(aData);
              othis._oValueHelpDialogOrdersC = sap.ui.xmlfragment(
                "sap.ui.demo.webapp.fragment.PantallaOperador.ValueHelpDialogOrdersC",
                othis
              ); // 202310_D*
              othis._oValueHelpDialogOrdersC.getTableAsync().then(
                function (oTable) {
                  oTable.setModel(othis.oOrdersModel);
                  oTable.setModel(othis.oColModel_orders, "columns");
                  if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/ITEMS");
                  }
                  if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/ITEMS", function () {
                      return new ColumnListItem({
                        cells: aCols.map(function (column) {
                          return new Label({
                            text: "{" + column.template + "}",
                          });
                        }),
                      });
                    });
                  }
                  othis._oValueHelpDialogOrdersC.update();
                }.bind(this)
              );

              sap.ui.core.BusyIndicator.hide();

              othis.getView().addDependent(othis._oValueHelpDialogOrdersC);
              othis._oValueHelpDialogOrdersC.open();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                othis
                  .getOwnerComponent()
                  .openHelloDialog(
                    "La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?"
                  );
              }
              sap.ui.core.BusyIndicator.hide();
              oTable.setBusy(false);
            });
        },
        onValueHelpOrdersCancelPress_C: function () {
          this._oValueHelpDialogOrdersC.close();
        },
        onValueHelpOrdersAfterClose_C: function () {
          this._oValueHelpDialogOrdersC.destroy();
        },
        onValueHelpOrdersOkPress_C: function (oEvent) {
          var aTokens = oEvent.getParameter("tokens");
          var w_oInput_orders_c_key = aTokens[0].getKey();
          var w_oInput_orders_c_text = aTokens[0].getText();
          var oData = {
            ORDER: w_oInput_orders_c_key,
          };
          this._handleMessageBoxConfirm_ReAbrirOrden_C(
            "¿Confirmar Re-Abrir Orden ?",
            "warning",
            oData,
            this
          );
        },
        _handleMessageBoxConfirm_ReAbrirOrden_C: function (
          sMessage,
          sMessageBoxType,
          oData,
          oThis
        ) {
          MessageBox[sMessageBoxType](sMessage, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                oThis.setReAbrirOrden_C(oData);
              } else {
                oThis._oValueHelpDialogOrdersC.close();
              }
            }.bind(this),
          });
        },
        setReAbrirOrden_C: function (oData) {
          var oView = this.getView(),
            order = oData.ORDER;
          var oData = {
            ORDER: order,
            WORK_CENTER: this._oInput.getSelectedKey(),
            USER: user,
          };
          this.ReAbrirOrder_C(
            oData,
            "MIIExtensions/Orders/Transaction/set_hold_reabrir"
          );
          this._oValueHelpDialogOrdersC.close();
        },
        ReAbrirOrder_C: function (oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        onRefreshReporteProduccion: function () {
          var oData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
          };
          var oTable = gView.byId("ProductionReport_Table");
          var oColumns = oTable.getColumns();
          oColumns[16].setVisible(false);
          this._base_onloadTable(
            "ProductionReport_Table",
            oData,
            "MIIExtensions/Reports/Transaction/get_production_report_active",
            "Reporte Produccion",
            ""
          );
        },
        /*******   Oscar Jiménez 29-12-2020   OCULTAR COLUMNAS ***********/
        onSelectionChange: function (oEvent) {
          this._selectionColumn(oEvent, "ProductionReport_Table");
        },
        _selectionColumn: function (oEvent, table) {
          var oTable = this.byId(table),
            index = oEvent
              .getParameter("listItem")
              .getBindingContext()
              .sPath.split("/")[2];
          if (oEvent.getParameter("selected")) {
            oTable.getColumns()[index].setVisible(true);
          } else {
            oTable.getColumns()[index].setVisible(false);
          }
        },
        _openModalColumn: function () {
          var oView = this.getView();

          var oThis = this;
          if (!this.DGCOLUMNS) {
            this.DGCOLUMNS = oView.byId("DGCOLUMNS");
            this.DGCOLUMNS = sap.ui.xmlfragment(
              oView.getId(),
              "sap.ui.demo.webapp.fragment.Reportes.Columns",
              this
            );
            oView.addDependent(this.DGCOLUMNS);
            this.DGCOLUMNS.onBeforeClose = function () {
              this.DGCOLUMNS.destroy();
            };
          }
          this.DGCOLUMNS.onAfterRendering = function () {
            var oData = {
              USER: user,
              REPORTE: "OP_REPORTEPRD",
            };
            oThis._base_onloadTable(
              "t_columns",
              oData,
              "MII/DatosMaestros/Transaction/get_config_columns",
              "COLUMNS",
              ""
            );
          };
          this.DGCOLUMNS.open();
        },
        report_visible: function (status) {
          if (status == "true") return true;
          else return false;
        },
        onCloseColumnas: function () {
          this.DGCOLUMNS.close();
        },
        onCheckChange: function (oEvent) {
          var oView = this.getView();
          var omodel = oView.byId("t_columns").getModel();
          var sel = oEvent.getSource().getSelected();
          var path = oEvent.getSource().getBindingContext().getPath();
          omodel.setProperty(path + "/VISIBLE", sel);
        },
        onGuardarColumnas: function () {
          var oThis = this;
          var oView = this.getView();
          var oTable = oView.byId("t_columns");
          var aColumns = '{"Columns":[';
          var item;
          for (item of oTable.getItems()) {
            aColumns +=
              '{"text":"' +
              item.getBindingContext().getProperty("COLUMNA") +
              '",';
            aColumns +=
              '"id":"' + item.getBindingContext().getProperty("ID") + '",';
            aColumns +=
              '"visible":"' +
              item.getBindingContext().getProperty("VISIBLE") +
              '"},';
          }
          aColumns = aColumns.substr(aColumns, aColumns.length - 1) + "]}";
          var oData = {
            USER: user,
            REPORTE: "OP_REPORTEPRD",
            COLUMNS: aColumns,
          };
          this.Realiza_ajax(
            "MII/DatosMaestros/Transaction/save_config_columns",
            oData,
            "GuardarColumnas"
          );
        },
        onSetViewColumnas: function () {
          var oData = {
            USER: user,
            REPORTE: "OP_REPORTEPRD",
          };
          this.Realiza_ajax(
            "MII/DatosMaestros/Transaction/get_config_columns",
            oData,
            "SetColumnas"
          );
        },
        _setColumns: function (columns, List, Table) {
          var oView = this.getView(),
            oDialog = oView.byId("hideColumns_fragment");
          // create dialog lazily
          if (!oDialog) {
            // create dialog via fragment factory
            oDialog = sap.ui.xmlfragment(
              oView.getId(),
              "sap.ui.demo.webapp.fragment.PantallaOperador.HideColumns",
              this
            ); // 202310_D*
            oView.addDependent(oDialog);
          }
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(columns);
          this.byId("hideColumns_fragment").setModel(oModel);

          var oList = this.byId(List);
          var oTable = this.byId(Table);
          var oItems = oList.getItems();
          var oColumns = "";
          if (oTable == undefined) {
            // 202310_G*
          } else {
            oColumns = oTable.getColumns();
          }

          $.each(columns.columns, function (index) {
            if (this.Visible) {
              oList.setSelectedItem(oItems[index]);
            } else {
              if (oTable == undefined) {
                // 202310_G*
                oList.setSelectedItem(oItems[index]);
              } else {
                if (oColumns[index] == undefined) {
                  // 202312_G*
                } else {
                  oColumns[index].setVisible(false);
                }
              }
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
        // ## Fragment MATERIALES
        onOpenDialogMateriales: function (oData) {
          this.dialogMateriales = sap.ui.xmlfragment(
            "materiales",
            "sap.ui.demo.webapp.fragment.PantallaOperador.MaterialList",
            this
          ); // 202310_D*
          this.getView().addDependent(this.dialogMateriales);
          this.dialogMateriales.open();
          sap.ui
            .getCore()
            .byId("materiales--oMaterialDescOrigen")
            .setValue(oData.inMaterialDesc);
        },
        onCloseDialogMateriales: function () {
          this.dialogMateriales.destroy();
        },
        onSearchMaterial: function () {
          sap.ui.getCore().byId("materiales--oMaterialSearch").setBusy(true);
          sap.ui
            .getCore()
            .byId("materiales--oMaterialSearch")
            .setValue(
              sap.ui
                .getCore()
                .byId("materiales--oMaterialSearch")
                .getValue()
                .toUpperCase()
            );
          var oInput = sap.ui
            .getCore()
            .byId("materiales--oMaterialSearch")
            .getValue();
          var oModelMAT = new sap.ui.model.json.JSONModel();
          oModelMAT.setSizeLimit(10000);
          var oPath =
            "MIIExtensions/Components/Query/getMaterialesByDescripcion";
          var url =
            "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" +
            oPath +
            "&Content-Type=text/json";
          var parameters = {
            "Param.1": oInput,
          };
          oModelMAT.loadData(url, parameters, true, "POST");
          oModelMAT.attachRequestCompleted(function () {
            // IF Fatal Error
            if (oModelMAT.getData().Rowsets.FatalError) {
              sap.ui
                .getCore()
                .byId("materiales--oMaterialSearch")
                .setBusy(false);
              return;
            }
            sap.ui.getCore().byId("materiales--oMaterialSearch").setBusy(false);
            gView.setModel(oModelMAT, "materialModel");
          });
        },

        /******************     OSCAR JIMENEZ 27-ago-2021   Ordenes combinadas ++++++++++++++++*/
        changeCombined: function (oEvent) {
          var swt = oEvent.getSource(),
            value = swt.getState(),
            oView = this.getView(),
            oItems = oView.byId("OrdersList").getItems();
          if (oItems.length < 2 && value) {
            this.handleErrorMessageBoxPress(
              "Debe tener al menos 2 órdenes iniciadas"
            );
            swt.setState(false);
            return;
          }
          var oData = {
            STATUS: value ? "1" : "0",
            WORK_CENTER: this._oInput.getSelectedKey(),
            USER: user,
          };
          this.setCombined(
            oData,
            "MIIExtensions/Orders/Transaction/set_combined"
          );
        },
        setCombined(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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
        /******************     OSCAR JIMENEZ 27-ago-2021   Ordenes combinadas ++++++++++++++++*/
        /******************     ADOLFO RIVERA Mayo-2022   Galvamix Dromont ++++++++++++++++*/
        onOrdenMisura: function () {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            orden = "";
          oitems.forEach(function (item) {
            orden = item.getCells()[0].getText();
          });
          if (orden === "")
            this.handleWarningMessageBoxPress("Selecciona una orden");
          else {
            var oData = {
              ORDEN: orden,
              USUARIO: user,
            };
            this.enviaOrdenMisura(
              oData,
              "MIIExtensions/Orders/Transaction/ins_order_misura"
            );
          }
        },
        onOrdenMicro: function () {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            orden = "";
          oitems.forEach(function (item) {
            orden = item.getCells()[0].getText();
          });
          if (orden === "")
            this.handleWarningMessageBoxPress("Selecciona una orden");
          else {
            if (!this.byId("cantidadPruebaPintura_Fragment")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.CantidadPruebaPintura",
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
              });
            } else {
              this.byId("cantidadPruebaPintura_Fragment").open();
            }
            let oData = {};
            this._base_onloadCOMBO(
              "comboMenuM",
              oData,
              "MIIExtensions/Orders/Transaction/get_tipoContenedores",
              "M",
              "Contenedores"
            );
          }
        },
        enviaOrdenMisura(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
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

        onImprimirEtqGalvamix: function (DocumentoMat, User_MII) {
          var path =
            "MII/DatosTransaccionales/Pedidos/Transaction/datos_etiqueta_pts";
        },

        onVerConsumos_preSAP: function () {
          var oView = this.getView(),
            oitems_components = oView
              .byId("NotificationComponent_Table")
              .getSelectedItems(),
            lote = "",
            WORK_CENTER = this._oInput.getSelectedKey();
          oitems_components.forEach(function (item) {
            lote = item.getCells()[3].getText();
          });
          if (lote === "") {
            this.handleWarningMessageBoxPress("Debes seleccionar un lote");
            return;
          }
          (isafter = false), this.onVerConsumos(WORK_CENTER, lote);
        },
        onVerConsumos: function (work_center, lote) {
          var oView = this.getView();
          var oData = {
            WORK_CENTER: work_center,
            LOTE: lote,
          };
          if (!this.byId("viewConsumos")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.Consumos", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("viewConsumos").open();
          }
          if (isafter === true) {
            this.byId("btnReenvioConsumo").setVisible(true);
          } else {
            this.byId("btnReenvioConsumo").setVisible(false);
          }
          this._base_onloadTable(
            "Consumos_Table",
            oData,
            "MIIExtensions/SFC/Transaction/get_consumos_byLotegvx",
            "Consumos",
            ""
          );
        },
        onVerConsumos_afterSAP: function () {
          var oView = this.getView(),
            oitems_components = oView
              .byId("ProductionReport_Table")
              .getSelectedItems(),
            lote = "",
            WORK_CENTER = this._oInput.getSelectedKey();
          oitems_components.forEach(function (item) {
            lote = item.getCells()[5].getText();
          });
          if (lote === "") {
            this.handleWarningMessageBoxPress("Debes seleccionar un lote");
            return;
          }
          (isafter = true), this.onVerConsumos(WORK_CENTER, lote);
        },
        onCloseConsumos: function () {
          this.byId("viewConsumos").close();
          this.byId("viewConsumos").destroy();
        },
        onReenvioComp: function () {
          var oView = this.getView(),
            oitems_components = oView
              .byId("NotificationComponent_Table")
              .getSelectedItems(),
            lote = "",
            WORK_CENTER = this._oInput.getSelectedKey();
          oitems_components.forEach(function (item) {
            lote = item.getCells()[3].getText();
          });
          if (lote === "") {
            this.handleWarningMessageBoxPress("Debes seleccionar un lote");
            return;
          }
          if (isafter === true) {
            this.handleWarningMessageBoxPress(
              "No es posible enviar componentes faltantes a un lote ya declarado"
            );
            return;
          }
          var oData = {
            WORK_CENTER: WORK_CENTER,
            LOTE: lote,
          };
          var path =
            "MIIExtensions/Orders/Transaction/ins_reenvio_ofa_incompleta_misura";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  this.handleInfoMessageBoxPress(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
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
        onUpdateConsumos: function (lote, orden) {
          var oView = this.getView(),
            //oitems_components = oView.byId('ProductionReport_Table').getSelectedItems(),
            lote = "",
            orden = "",
            work_center = this._oInput.getSelectedKey();
          if (isafter === true) {
            var oView = (oitems_components = oView
              .byId("ProductionReport_Table")
              .getSelectedItems());
            oitems_components.forEach(function (item) {
              lote = item.getCells()[5].getText();
              orden = item.getCells()[0].getText();
            });
            if (lote === "") {
              this.handleWarningMessageBoxPress("Debes seleccionar un lote");
              return;
            }
          }
          if (isafter === false) {
            var oitems_components = oView
              .byId("NotificationComponent_Table")
              .getSelectedItems();
            oitems_components.forEach(function (item) {
              lote = item.getCells()[3].getText();
              orden = item.getCells()[6].getText();
            });
            if (lote === "") {
              this.handleWarningMessageBoxPress("Debes seleccionar un lote");
              return;
            }
          }
          var oData = {
            WORK_CENTER: work_center,
            LOTE: lote,
            NUM_ORDEN: orden,
            AUT_MANUAL: "M",
          };
          var xData = {
            WORK_CENTER: work_center,
            LOTE: lote,
          };
          if (work_center == GALVAMIX_1) {
            var path = "MIIExtensions/SFC/Transaction/consumo_galvamix1";
          } else {
            var path = "MIIExtensions/SFC/Transaction/consumo_galvamix2";
          }
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  oThis.handleInfoMessageBoxPress(aData[0].MESSAGE);
                  oThis._base_onloadTable(
                    "Consumos_Table",
                    xData,
                    "MIIExtensions/SFC/Transaction/get_consumos_byLotegvx",
                    "Consumos",
                    ""
                  );
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
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
        onReenvioConsumos: function () {
          var oView = (oitems_components = oView
            .byId("ProductionReport_Table")
            .getSelectedItems()),
            lote = "",
            orden = "";
          oitems_components.forEach(function (item) {
            lote = item.getCells()[5].getText();
            orden = item.getCells()[0].getText();
          });
          if (lote === "") {
            this.handleWarningMessageBoxPress("Debes seleccionar un lote");
            return;
          }
          var oData = {
            LOTE: lote,
          };
          var path = "MIIExtensions/SFC/Transaction/send_upd_consumos_gvx_SAP";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  this.handleInfoMessageBoxPress(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
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
        /******************     ADOLFO RIVERA Mayo-2022   Galvamix Dromont ++++++++++++++++*/
        /******************     ADOLFO RIVERA Noviembre-2022   Galvamix HMJ ++++++++++++++++*/
        onTransaccion: function (path, oData) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //this.handleInfoMessageBoxPress(aData[0].MESSAGE);
                  MessageToast.show(aData[0].MESSAGE, {
                    duration: 2500,
                  });
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
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
        onDensidadesGvx2: function () {
          var oView = this.getView();
          var oData = {};
          if (!this.byId("DensidadesComponentes_Fragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.DensidadesComponentes", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("DensidadesComponentes_Fragment").open();
          }
          this._base_onloadTable(
            "DensidadesComponentes_Table",
            oData,
            "MII/DatosMaestros/Galvamix/Transaction/sel_densidades_recetas",
            "Consumos",
            ""
          );
        },
        onCloseDensidadesComponentes: function () {
          this.byId("DensidadesComponentes_Fragment").close();
          this.byId("DensidadesComponentes_Fragment").destroy();
        },
        onModDensidad: function (oEvent) {
          let receta = "",
            densidad = "";
          var oView = this.getView();
          var oButton = oEvent.getSource(); // ThumbsUp Button in the row
          // Get binding context of the button to identify the row where the event is originated
          var oBindingContext = oButton.getBindingContext(); // <<<-- If you have model name pass it here as string
          var oBindingObject = oBindingContext.getObject();
          receta = oBindingObject.RECETA;
          densidad = oBindingObject.DENSIDAD;
          if (!this.byId("DensidadesModificar_Fragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.DensidadesModificar", // 202310_D*
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("DensidadesModificar_Fragment").open();
          }
          this.byId("txtReceta").setText("Receta: " + receta);
          this.byId("inputReceta").setValue(receta);
          this.byId("inputDensidad").setValue(densidad);
        },
        onCloseDensidadesModificar: function () {
          this.byId("DensidadesModificar_Fragment").close();
          this.byId("DensidadesModificar_Fragment").destroy();
        },
        onActualizarDensidad: function () {
          let densidad, receta, oThis;
          oThis = this;
          receta = this.byId("inputReceta").getValue();
          densidad = this.byId("inputDensidad").getValue();
          let oData = {
            DENSIDAD: densidad,
            RECETA: receta,
            USUARIO: user,
          };
          this.onTransaccion(
            "MII/DatosMaestros/Galvamix/Transaction/ins_upd_Densidades_Recetas",
            oData
          );
          this.onCloseDensidadesModificar();
          this._base_onloadTable(
            "DensidadesComponentes_Table",
            oData,
            "MII/DatosMaestros/Galvamix/Transaction/sel_densidades_recetas",
            "Consumos",
            ""
          );
        },
        onCloseCantidadPruebaPintura: function () {
          this.byId("cantidadPruebaPintura_Fragment").close();
          this.byId("cantidadPruebaPintura_Fragment").destroy();
        },
        onEnviarPruebaGvx: function () {
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            orden = "";
          var oThis = this;
          let tipo_dosificacion = this.byId("comboMenuM").getSelectedKey(),
            cantidad = this.byId("inputCantPrueba").getValue();
          oitems.forEach(function (item) {
            orden = item.getCells()[0].getText();
          });
          if (cantidad == "" || cantidad < 0) {
            oThis.handleErrorMessageBoxPress("Favor ingresar una cantidad");
            return;
          }
          var oData = {
            ORDEN: orden,
            USUARIO: user,
            CANTIDAD: cantidad,
            TIPO_DOSIFICACION: tipo_dosificacion,
          };
          let path = "MIIExtensions/Orders/Transaction/ins_order_misura_micro";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //this.handleInfoMessageBoxPress(aData[0].MENSAJE);
                  MessageToast.show(aData[0].MESSAGE, {
                    duration: 2500,
                  });
                  oThis.onCloseCantidadPruebaPintura();
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: Hay conexion de red?"
                );
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
        onValidaGenerarLoteGVX: function () {
          var oView = this.getView(),
            oitems_order = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems_order.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          var oData = {
            USUARIO: user,
            ORDEN: order,
          };
          this._handleMessageBoxConfirm_CrearLote(
            "¿Confirmar crear lote para la orden " + order + " ?",
            "warning",
            oData,
            order,
            this
          );
        },
        _handleMessageBoxConfirm_CrearLote: function (
          sMessage,
          sMessageBoxType,
          oData,
          orden,
          oThis
        ) {
          MessageBox[sMessageBoxType](sMessage, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                oThis.crearLoteGVX(
                  oData,
                  orden,
                  "MIIExtensions/SFC/Transaction/generate_sfc_manual_GVX"
                );
              }
            }.bind(this),
          });
        },
        crearLoteGVX: function (oData, orden, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  var xData = {
                    ORDER: orden,
                    WORK_CENTER: oThis._oInput.getSelectedKey(),
                  };
                  oThis._base_onloadTable(
                    "NotificationComponent_Table",
                    xData,
                    "MIIExtensions/SFC/Transaction/get_pending_notification",
                    "CP",
                    ""
                  );
                  MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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
        /******************     ADOLFO RIVERA Noviembre-2022   Galvamix HMJ ++++++++++++++++*/
        /******************     ADOLFO RIVERA Febrero-2023   Supervisores en Lotes ++++++++++++++++*/
        onChangeSupervisor: function (oEvent) {
          let oItem,
            oBindingContext,
            oBindingObject,
            row,
            row_pressed,
            num_array;
          oItem = oEvent.getSource();
          oBindingContext = oItem.getBindingContext();
          oBindingObject = oBindingContext.getObject();
          row = oItem.getParent();
          let id, idUsuario;
          id = oBindingObject.ID;
          idUsuario = row.getCells()[13].getSelectedKey();
          let oData = {
            ID: id,
            ID_USUARIO: idUsuario,
          };
          console.log(oData);
          let path = "MIIExtensions/SFC/Transaction/upd_SupervisorLote";
          let uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          $.ajax({
            type: "GET",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          });
          this.onReporteProduccion();
        },
        onVerDefectoPT: function (oEvent) {
          //this.onCloseFragmentDefectos();
          let oItem,
            oBindingContext,
            oBindingObject,
            row,
            row_pressed,
            num_array;
          oItem = oEvent.getSource();
          oBindingContext = oItem.getBindingContext();
          oBindingObject = oBindingContext.getObject();
          row = oItem.getParent();
          let batch = oBindingObject.BATCH;
          var oView = this.getView();
          var oData = {
            BATCH: batch,
          };
          if (!this.byId("DefectosFragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.Defectos", // 202310_D
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("DefectosFragment").open();
          }
          this._base_onloadTable(
            "TableDefectos",
            oData,
            "MIIExtensions/Components/Transaction/get_defectos",
            "Defectos",
            ""
          );
          this.getObservaciones(
            oData,
            "MIIExtensions/Components/Transaction/get_observacion",
            "area_observacion_disponible"
          );
        },

        /******************     ADOLFO RIVERA Abril-2023   Validar Ordenes Recuperacion ++++++++++++++++*/
        /******************     ADOLFO RIVERA Mayo-2023   Caracteristicas Sugeridas ++++++++++++++++*/
        onTodasCaracteristicas: function () {
          var oData = {
            ORDER: orden_caracteristicas,
            WORK_CENTER: work_center_caracteristicas,
          };
          this._base_onloadTable(
            "TableCharacteristics",
            oData,
            "MIIExtensions/Orders/Transaction/get_characteristics",
            "Componentes",
            ""
          );
        },
        onSugeridasCaracteristicas: function () {
          var oData = {
            ORDER: orden_caracteristicas,
            WORK_CENTER: work_center_caracteristicas,
          };
          this._base_onloadTable(
            "TableCharacteristics",
            oData,
            "MIIExtensions/Orders/Transaction/get_characteristics_ordenadas",
            "Componentes",
            ""
          );
        },
        /******************     ADOLFO RIVERA Mayo-2023   Caracteristicas Sugeridas ++++++++++++++++*/

        open_onVerCaracteristicas_sec: function (oData, oThis) {
          // 202310

          console.log(oData);
          oThis._base_onloadTable(
            "TableCharacteristics",
            oData,
            "MIIExtensions/Orders/Transaction/get_characteristics_ordenadas",
            "Componentes",
            ""
          );
        },

        onVerCaracteristicas_sec: function (oEvent) {
          var oView = this.getView();
          var oThis = this;

          var oButton = oEvent.getSource(); // ThumbsUp Button in the row
          // Get binding context of the button to identify the row where the event is originated
          var oBindingContext = oButton.getBindingContext("secuencia"); // <<<-- If you have model name pass it here as string
          var oBindingObject = oBindingContext.getObject();
          orden_caracteristicas = oBindingObject.ORDEN;
          work_center_caracteristicas = this._oInput.getSelectedKey();

          var oData = {
            ORDER: orden_caracteristicas,
            WORK_CENTER: work_center_caracteristicas,
          };

          if (!this.byId("CharacteristicsFragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.Characteristics", // 202310_D
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              oThis.open_onVerCaracteristicas_sec(oData, oThis); // 202310
            });
          } else {
            this.byId("CharacteristicsFragment").open();
            this.open_onVerCaracteristicas_sec(oData, oThis);
          }
        },
        onCloseSecuenciacion: function () {
          this.byId("SecuenciacionFragment").close();
        },

        dialogAfterclose: function (oEvent) {
          oEvent.getSource().destroy();
        },

        onReporteMermas: function () {
          var operation = this._oInput.getSelectedKey();
          if (operation === "") {
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
            return;
          }
          var oData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
          },
            oView = this.getView();
          if (!this.byId("ReporteMermas_fragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.PantallaOperador.ReporteMermas", // 202310_D
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("ReporteMermas_fragment").open();
          }
          console.log(oData);
          this._base_onloadTable(
            "ReporteMermas_Table",
            oData,
            "MIIExtensions/Reports/Transaction/get_production_report_active_merma",
            "Reporte Merma",
            ""
          );
        },

        onReporteInsumos: function () {
          var operation = this._oInput.getSelectedKey();
          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            var oData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            },
              oView = this.getView();
            if (!this.byId("ReporteInsumos_fragment")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.ReporteInsumos", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
              });
            } else {
              this.byId("ReporteInsumos_fragment").open();
            }
            console.log(oData);
            this._base_onloadTable(
              "ReporteInsumos_Table",
              oData,
              "MIIExtensions/Reports/Transaction/get_production_report_active_merma",
              "Reporte Insumos",
              ""
            );
          }
        },

        open_ReporteProduccion: function (oData) {
          // 202310

          var WORK_CENTER = "";
          if (oData.WORK_CENTER !== undefined) {
            WORK_CENTER = oData.WORK_CENTER;
          }
          var oView = this.getView();
          var oThis = this;

          var columns = {
            columns: [
              {
                Column: "Orden",
                Visible: 1,
              },
              {
                Column: "Material",
                Visible: 1,
              },
              {
                Column: "Descripción",
                Visible: 1,
              },
              {
                Column: "Almacén",
                Visible: 0,
              },
              {
                Column: "Rollo Master",
                Visible: 1,
              },
              {
                Column: "Lote de Salida",
                Visible: 1,
              },
              {
                Column: "Lote de Salida [MII]",
                Visible: 0,
              },
              {
                Column: "Cantidad",
                Visible: 1,
              },
              {
                Column: "Documento",
                Visible: 1,
              },
              {
                Column: "Fecha Inicio",
                Visible: 0,
              },
              {
                Column: "Fecha Fin",
                Visible: 1,
              },
              {
                Column: "Ancho",
                Visible: 0,
              },
              {
                Column: "Espesor",
                Visible: 0,
              },
              {
                Column: "Longitud",
                Visible: 0,
              },
              {
                Column: "Supervisor",
                Visible: 0,
              },
              {
                Column: "Inspección",
                Visible: 1,
              },
              {
                Column: "Tipo",
                Visible: 0,
              },
              {
                Column: "Calidad",
                Visible: 0,
              },
              {
                Column: "ID",
                Visible: 0,
              },
              {
                Column: "Defecto",
                Visible: 0,
              },
              {
                Column: "Imprimir",
                Visible: 1,
              },
            ],
          };

          //this._setColumns(columns, "columnList", "ProductionReport_Table");
          this._VwReporte = "POD_REPORTEPRD";
          this._onSetViewColumnas();

          var oTable = oView.byId("ProductionReport_Table");
          var oColumns = oTable.getColumns();

          //oColumns[18].setVisible( false );

          this._base_onloadTable(
            "ProductionReport_Table",
            oData,
            "MIIExtensions/Reports/Transaction/get_production_report_active",
            "Reporte Produccion",
            ""
          );

          if (WORK_CENTER == GALVAMIX_1 || WORK_CENTER == GALVAMIX_2) {
            oView.byId("btn_consumos_2").setVisible(true);
          } else {
            oView.byId("btn_consumos_2").setVisible(false);
          }
        },

        onReporteProduccion: function () {
          var operation = this._oInput.getSelectedKey();
          var WORK_CENTER = this._oInput.getSelectedKey();

          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            var oData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
            var oView = this.getView();
            var oThis = this;

            if (!this.byId("ProductionReport_Fragment")) {
              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.ReporteProduccion", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.onBeforeClose = function () {
                  oDialog.destroy();
                };
                oDialog.open();
                oThis.open_ReporteProduccion(oData); // 202310
              });
            } else {
              this.byId("ProductionReport_Fragment").open();
              this.open_ReporteProduccion(oData); // 202310
            }
          }
        },

        get_wc_control_peso(datos) {
          // 202406

          var oData = {
            WORK_CENTER: datos.WORK_CENTER,
            ORDER: datos.ORDER,
          };

          var path = "MIIExtensions/SFC/Transaction/WC_ControlPeso";
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");

          var oThis = this;
          var w_rows = [
            {
              CP: "ERROR",
            },
          ];

          //debugger

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  // oThis.handleErrorMessageBoxPress(aData[0].ERROR); // 20240610
                } else {
                  //Create  the JSON model and set the data
                  w_rows = aData;
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
            });

          return w_rows;
        },

        getLongitud(lote) {
          var oView = this.getView(),
            oitems_orders = oView.byId("OrdersList").getSelectedItems(),
            order = "";
          oitems_orders.forEach(function (item) {
            order = item.getCells()[0].getText();
          });
          var w_WORK_CENTER = this._oInput.getSelectedKey();
          var oData = {
            WORK_CENTER: w_WORK_CENTER,
            ORDER: order,
            LOTE: lote,
          };
          console.log(oData);

          var w_seguir = true; // 202310***
          switch (w_WORK_CENTER) {
            case "MESAVAC1": // 202310***
            case "CORDES01": // 202310***
            case "CORLIN01": // 202311
              w_seguir = false;
              break;

            default:
              break;
          }

          if (w_seguir) {
            this.get_longitud(
              oData,
              "MIIExtensions/PCoTags/Transaction/get_longitud_manual"
            );
          }
        },

        SFC_create_bajo_demanda(oData, path) {
          // 202310***

          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          var oThis = this;
          var w_lote = "ERROR";

          sap.ui.core.BusyIndicator.show(0);

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                } else {
                  w_lote = aData[0].MESSAGE; // 202310***
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
              }
              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          return w_lote;
        },

        declararSFC(oData, path) {
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;

          $.ajax({
            async: false,
            crossDomain: true,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  oThis.handleErrorMessageBoxPress(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  var xData = {
                    WORK_CENTER: oThis._oInput.getSelectedKey(),
                  };
                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable(
                    "OrdersList",
                    xData,
                    "MIIExtensions/Orders/Transaction/get_started_ordenes",
                    "Ordenes",
                    ""
                  );
                }
              } else {
                oThis.handleErrorMessageBoxPress(
                  "La solicitud ha fallado: �Hay conexi�n de red?"
                );
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

        addRowPedaceria: function (oEvent) {
          if (ZCT_PESO_PIEZA === 0) {
            this.getOwnerComponent().openHelloDialog(
              "Kilos por piezas no definido [Error] "
            );
            return;
          }

          var oItem = oEvent.getSource().getParent();
          var oTable = oItem.getParent();
          var oIndex = oTable.indexOfItem(oItem);
          var oModel = oTable.getModel();
          var oModelData = oModel.getProperty("/ITEMS");
          var row = oModelData[oIndex];

          // debugger

          var w_null = "";
          var items = [];
          items = [
            {
              MATERIAL: row.MATERIAL,
              DESCRIPTION: row.DESCRIPTION,
              CANTIDAD: w_null,
              STORAGE_LOCATION: row.STORAGE_LOCATION,
              UNIT_OF_MEASURE: row.UNIT_OF_MEASURE,
              SITE: row.SITE,
              MOTIVO_TEXTO: w_null,
              MOTIVO_ID: w_null,
            },
          ];

          // debugger

          if (items.length > 0) {
            var w_Data_01 = [];
            var w_Data_02 = [];
            var Json = {};

            var oTable = this.getView().byId("table_rows_list01");
            w_Data_01 = oTable.getModel().oData;

            items.forEach(function (item) {
              Json = {
                MATERIAL: item.MATERIAL,
                DESCRIPTION: item.DESCRIPTION,
                CANTIDAD: item.CANTIDAD,
                STORAGE_LOCATION: item.STORAGE_LOCATION,
                UNIT_OF_MEASURE: item.UNIT_OF_MEASURE,
                SITE: item.SITE,
                MOTIVO_TEXTO: item.MOTIVO_TEXTO,
                MOTIVO_ID: item.MOTIVO_ID,
              };

              if (w_Data_01.ITEMS != undefined) {
                w_Data_01.ITEMS.push(Json);
              } else {
                w_Data_02.push(Json);
                w_Data_01 = {
                  ITEMS: w_Data_02,
                };
              }
            });

            var w_Data_destino = [];
            var oTable_destino = this.getView().byId("table_rows_list01");
            w_Data_destino = oTable_destino.getModel().oData;

            var w_Model = new sap.ui.model.json.JSONModel();
            var oModel_empty = new sap.ui.model.json.JSONModel();
            oModel_empty.setData({});
            oTable_destino.setModel(oModel_empty);

            w_Model.setData(w_Data_01);
            oTable_destino.setModel(w_Model);
          }
        },

        deleteRow: function (oEvent) {
          var oItem = oEvent.getSource().getParent();
          var oTable = oItem.getParent();
          var oIndex = oTable.indexOfItem(oItem);
          var oModel = oTable.getModel();
          var oModelData = oModel.getProperty("/ITEMS");
          oModelData.splice(oIndex, 1);
          oModel.setProperty("/ITEMS", oModelData);
        },

        confirmarSelQPCD_x_nivel: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem"),
            oInput = this.byId(tb_input_id);

          tb_input_id = tb_input_id.replace("defecto_texto", "defecto_c1");
          var oInput_c1 = this.byId(tb_input_id);

          tb_input_id = tb_input_id.replace("defecto_c1", "defecto_c2");
          var oInput_c2 = this.byId(tb_input_id);

          tb_input_id = tb_input_id.replace("defecto_c2", "defecto_c3");
          var oInput_c3 = this.byId(tb_input_id);

          if (!oSelectedItem) {
            oInput.resetProperty("value");
            return;
          }

          var w_codigo = oSelectedItem.getTitle();
          var w_texto = oSelectedItem.getDescription();

          oInput.setValue(w_texto);
          oInput_c1.setValue(w_codigo.split("#")[0]);
          oInput_c2.setValue(w_codigo.split("#")[1]);
          oInput_c3.setValue(w_codigo.split("#")[2]);
        },

        filtro_SelQPCD_x_nivel: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter({
            filters: [
              new Filter(
                "KURZTEXT",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
            ],
          });
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([oFilter]);
        },

        handleValueHelp_QPCD_x_nivel_null: function (oEvent) {
          tb_input_id = oEvent.getParameter("id");
          tb_input_id = tb_input_id.replace("webapp---panelOperador--", "");
          var oInput_1 = this.byId(tb_input_id);
          oInput_1.setValue("");

          tb_input_id = tb_input_id.replace("defecto_texto", "defecto_c1");
          oInput_1 = this.byId(tb_input_id);
          oInput_1.setValue("");

          tb_input_id = tb_input_id.replace("defecto_c1", "defecto_c2");
          oInput_1 = this.byId(tb_input_id);
          oInput_1.setValue("");

          tb_input_id = tb_input_id.replace("defecto_c2", "defecto_c3");
          oInput_1 = this.byId(tb_input_id);
          oInput_1.setValue("");
        },

        open_onCompletarSfc: function (WORK_CENTER, oData) {
          // 202309

          console.log(WORK_CENTER);
          var oView = this.getView();

          var w_trx_get_pending_notification =
            "MIIExtensions/SFC/Transaction/get_pending_notification";
          var w_centro = g_planta;
          var w_puesto_trabajo = WORK_CENTER;

          var w_dato = this.get_row_puesto_trabajo(w_centro, w_puesto_trabajo);

          switch (w_dato.AREA_ID) {
            case "ERROR":
            case "":
              break;

            case "FUNDICION":
              switch (
              WORK_CENTER // 202311
              ) {
                case "HORHOM01":
                  w_trx_get_pending_notification =
                    "MIIExtensions/SFC/Transaction/get_pending_notification_HornoHomog"; // AGSG
                  break;

                default:
                  break;
              }

              break;

            case "PRENSAS":
              w_trx_get_pending_notification =
                "MIIExtensions/SFC/Transaction/get_pending_notification_Prensas"; // AGSG
              break;

            case "ANODIZADO":
              break;

            case "AMARRES":
              w_trx_get_pending_notification =
                "MIIExtensions/SFC/Transaction/get_pending_notification_Amarres"; // AGSG
              break;

            case "VALOR_AGREGADO":
              //if(WORK_CENTER === "SIERRVCT"){
              w_trx_get_pending_notification =
                "MIIExtensions/SFC/Transaction/get_pending_notification"; // AGSG
              //}
              break;

            default:
              break;
          }

          this._base_onloadTable(
            "NotificationComponent_Table",
            oData,
            w_trx_get_pending_notification,
            "CP",
            ""
          );

          if (WORK_CENTER == GALVAMIX_1 || WORK_CENTER == GALVAMIX_2) {
            oView.byId("btn_consumos").setVisible(true);
            oView.byId("btn_CrearLote").setVisible(true);
          } else {
            oView.byId("btn_consumos").setVisible(false);
            oView.byId("btn_CrearLote").setVisible(false);
          }
        },

        onCompletarSfc: function (oEvent) {
          var oThis = this;
          var oView = this.getView(),
            oitems = oView.byId("OrdersList").getSelectedItems(),
            WORK_CENTER = this._oInput.getSelectedKey(),
            order = "";

          console.log(WORK_CENTER);
          g_canasta_activa_en_puesto = 0;

          oitems.forEach(function (item) {
            order = item.getCells()[0].getText();
          });

          switch (WORK_CENTER) {
            case "HORFUN01":
            case "HORFUN02":
            case "HORNOFD1":
            case "HORNOFD2":
              this.handleWarningMessageBoxPress(
                "Este puesto de trabajo no aplica proceso de declarar producto"
              );
              return;
              break;

            default:
              break;
          }

          var w_seguir = true;
          var w_centro = g_planta;
          var w_puesto_trabajo = WORK_CENTER;
          var w_canasta = "0";
          var w_trx = "";

          var fragmento_ruta =
            "sap.ui.demo.webapp.fragment.PantallaOperador.ComponenteNotificar";
          var w_dato = oThis.get_row_puesto_trabajo(w_centro, w_puesto_trabajo);

          switch (w_dato.AREA_ID) {
            case "ERROR":
              w_seguir = 0;
              break;

            case "":
              w_seguir = 0;
              break;

            case "FUNDICION":
              switch (WORK_CENTER) {
                case "HORHOM01":
                  fragmento_ruta =
                    "sap.ui.demo.webapp.fragment.PantallaOperador.ComponenteNotificar_Fund_Horno_Homogenizado"; // 20231117
                  break;

                default:
                  break;
              }

              break;

            case "AMARRES":
              // fragmento_ruta = "sap.ui.demo.webapp.fragment.PantallaOperador.ComponenteNotificar_Amarres"; // 20231112

              break;

            case "PRENSAS":
              var oData_Canasta = {
                WORK_CENTER: w_puesto_trabajo,
              };

              w_trx =
                "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/canasta_activa_en_puesto";
              w_canasta = oThis.row_find_canasta_activa_in_puesto(
                oData_Canasta,
                w_trx
              );

              if (w_canasta == "0") {
                this.handleWarningMessageBoxPress(
                  "Puesto de Trabajo no cuenta con Canasta [Fijada]"
                );
                w_seguir = 0;
                return;
                break;
              } else {
                g_canasta_activa_en_puesto = w_canasta;
              }
              break;

            default:
              break;
          }

          if (!w_seguir) {
          } else {
            if (order === "")
              this.handleWarningMessageBoxPress("Selecciona una orden activa");
            else {
              var oData = {
                ORDER: order,
                WORK_CENTER: WORK_CENTER,
              };
              if (!this.byId("NotificationComponent_Fragment")) {
                Fragment.load({
                  id: oView.getId(),
                  name: fragmento_ruta,
                  controller: this,
                }).then(function (oDialog) {
                  oView.addDependent(oDialog);
                  oDialog.open();
                  oThis.open_onCompletarSfc(WORK_CENTER, oData);
                });
              } else {
                this.byId("NotificationComponent_Fragment").open();
                this.open_onCompletarSfc(WORK_CENTER, oData);
              }
            }
          }
        },

        validar_tb_malas: function () {
          var oView = this.getView();

          var order = "";
          var oitems_orders = oView.byId("OrdersList").getSelectedItems();
          oitems_orders.forEach(function (item) {
            order = item.getCells()[0].getText();
          });

          var WORK_CENTER = this._oInput.getSelectedKey();

          g_pza_bm_m261m531 = 0; // 20240625

          var sw_malas = 0;
          var w_ok = {
            OK: 0,
            XML: "",
          };

          var w_pos_malas = oView.byId("table_rows_list01").getItems().length; // 202311
          if (w_pos_malas > 0) {
            w_ok.OK = 1;

            var c_kilo = "";
            var c_d1 = "";
            var c_d2 = "";
            var c_d3 = "";
            var rows_pzas_malas = oView.byId("table_rows_list01").getItems();

            sw_malas = 1;

            rows_pzas_malas.forEach(function (item) {
              if (!sw_malas) {
                return;
              }

              c_kilo = item.getCells()[3].getValue();
              c_d1 = item.getCells()[7].getValue();
              c_d2 = item.getCells()[8].getValue();
              c_d3 = item.getCells()[9].getValue();

              if (c_kilo === "" || c_kilo === "0") sw_malas = 0;
              if (c_d1 === "") sw_malas = 0;
              if (c_d2 === "") sw_malas = 0;
              if (c_d3 === "") sw_malas = 0;
            });

            if (!sw_malas) {
              this.handleWarningMessageBoxPress(
                "Información de sección Pzas Malas inconsistente"
              );
            } else {
              var w_ctd_kilos_one = 0;
              var w_ctd_kilos_sum = 0;

              var w_ctd_pza_one = 0; // 202406
              var w_ctd_pza_sum = 0; // 202406

              var w_mov_type = "531";
              var w_motivo_id = 1;
              var w_motivo_texto = "";
              var w_order_format = order.toString().padStart(12, "0");

              var xml_completo = "<Rowsets>\n";
              xml_completo += "<Rowset>\n";

              xml_completo += "<Columns>\n";
              xml_completo +=
                '<Column Description="CATALOGO" MaxRange="1" MinRange="0" Name="CATALOGO" SQLDataType="1" SourceColumn="CATALOGO"/>\n';
              xml_completo +=
                '<Column Description="GRUPO" MaxRange="1" MinRange="0" Name="GRUPO" SQLDataType="1" SourceColumn="GRUPO"/>\n';
              xml_completo +=
                '<Column Description="CODIGO" MaxRange="1" MinRange="0" Name="CODIGO" SQLDataType="1" SourceColumn="CODIGO"/>\n';
              xml_completo +=
                '<Column Description="WORK_CENTER" MaxRange="1" MinRange="0" Name="WORK_CENTER" SQLDataType="1" SourceColumn="WORK_CENTER"/>\n';
              xml_completo +=
                '<Column Description="ORDER" MaxRange="1" MinRange="0" Name="ORDER" SQLDataType="1" SourceColumn="ORDER"/>\n';
              xml_completo +=
                '<Column Description="MATERIAL" MaxRange="1" MinRange="0" Name="MATERIAL" SQLDataType="1" SourceColumn="MATERIAL"/>\n';
              xml_completo +=
                '<Column Description="ALMACEN" MaxRange="1" MinRange="0" Name="ALMACEN" SQLDataType="1" SourceColumn="ALMACEN"/>\n';
              xml_completo +=
                '<Column Description="PLANTA" MaxRange="1" MinRange="0" Name="PLANTA" SQLDataType="1" SourceColumn="PLANTA"/>\n';
              xml_completo +=
                '<Column Description="MOV_TYPE" MaxRange="1" MinRange="0" Name="MOV_TYPE" SQLDataType="1" SourceColumn="MOV_TYPE"/>\n';
              xml_completo +=
                '<Column Description="CANTIDAD" MaxRange="1" MinRange="0" Name="CANTIDAD" SQLDataType="2" SourceColumn="CANTIDAD"/>\n';
              xml_completo +=
                '<Column Description="CANT_PZ" MaxRange="1" MinRange="0" Name="CANT_PZ" SQLDataType="2" SourceColumn="CANT_PZ"/>\n'; // 202406
              xml_completo +=
                '<Column Description="MOTIVO_ID" MaxRange="1" MinRange="0" Name="MOTIVO_ID" SQLDataType="1" SourceColumn="MOTIVO_ID"/>\n';
              xml_completo +=
                '<Column Description="MOTIVO_TEXTO" MaxRange="1" MinRange="0" Name="MOTIVO_TEXTO" SQLDataType="1" SourceColumn="MOTIVO_TEXTO"/>\n';
              xml_completo +=
                '<Column Description="USUARIO" MaxRange="1" MinRange="0" Name="USUARIO" SQLDataType="1" SourceColumn="USUARIO"/>\n';
              xml_completo += "</Columns>\n";

              rows_pzas_malas.forEach(function (item) {
                var w_material = item
                  .getBindingContext()
                  .getProperty("MATERIAL");
                var w_alma = item
                  .getBindingContext()
                  .getProperty("STORAGE_LOCATION");
                var w_planta = item.getBindingContext().getProperty("SITE");

                w_ctd_kilos_one = 1 * item.getCells()[10].getValue();
                w_ctd_kilos_sum = w_ctd_kilos_sum + w_ctd_kilos_one;

                w_ctd_pza_one = 1 * item.getCells()[3].getValue(); // 202406
                w_ctd_pza_sum = w_ctd_pza_sum + w_ctd_pza_one; // 202406

                g_pza_bm_m261m531 = g_pza_bm_m261m531 + w_ctd_pza_one; // 20240625

                c_d1 = item.getCells()[7].getValue();
                c_d2 = item.getCells()[8].getValue();
                c_d3 = item.getCells()[9].getValue();

                xml_completo += "<Row>\n";
                xml_completo += "<CATALOGO>" + c_d1 + "</CATALOGO>\n";
                xml_completo += "<GRUPO>" + c_d2 + "</GRUPO>\n";
                xml_completo += "<CODIGO>" + c_d3 + "</CODIGO>\n";
                xml_completo +=
                  "<WORK_CENTER>" + WORK_CENTER + "</WORK_CENTER>\n";
                xml_completo += "<ORDER>" + w_order_format + "</ORDER>\n";
                xml_completo += "<MATERIAL>" + w_material + "</MATERIAL>\n";
                xml_completo += "<ALMACEN>" + w_alma + "</ALMACEN>\n";
                xml_completo += "<PLANTA>" + w_planta + "</PLANTA>\n";
                xml_completo += "<MOV_TYPE>" + w_mov_type + "</MOV_TYPE>\n";
                xml_completo +=
                  "<CANTIDAD>" + w_ctd_kilos_one + "</CANTIDAD>\n"; // 20240627
                xml_completo += "<CANT_PZ>" + w_ctd_pza_one + "</CANT_PZ>\n"; // 20240627
                xml_completo += "<MOTIVO_ID>" + w_motivo_id + "</MOTIVO_ID>\n";
                xml_completo +=
                  "<MOTIVO_TEXTO>" + w_motivo_texto + "</MOTIVO_TEXTO>\n";
                xml_completo += "<USUARIO>" + user + "</USUARIO>\n";
                xml_completo += "</Row>\n";
              });

              xml_completo += "</Rowset>\n";
              xml_completo += "</Rowsets>\n";
              w_ok.XML = xml_completo;

              // debugger // 202406
            }

            w_ok.OK = sw_malas;
          } else {
            w_ok.OK = 1;
          }

          //debugger
          return w_ok;
        },

        handleValueHelp_QPCD_x_nivel: function (oEvent) {
          tb_input_id = oEvent.getParameter("id");
          tb_input_id = tb_input_id.replace("webapp---panelOperador--", "");

          var oItem, oCtx;
          oItem = oEvent.getSource();
          oCtx = oItem.getBindingContext();

          var sInputValue = oEvent.getSource().getValue();

          var oView = this.getView();
          var oThis = this;

          var WORK_CENTER = this._oInput.getSelectedKey();
          var w_centro = g_planta;
          var w_puesto_trabajo = WORK_CENTER;

          var nivel_area = 0;

          var w_dato = this.get_row_puesto_trabajo(w_centro, w_puesto_trabajo);

          switch (w_dato.AREA_ID) {
            case "ERROR":
            case "":
              break;

            case "FUNDICION":
              nivel_area = 1;
              break;

            case "PRENSAS":
              nivel_area = 2;
              break;

            case "ANODIZADO":
              nivel_area = 4;
              break;

            case "PINTURA": // 20231204
              nivel_area = 5;
              break;

            case "AMARRES": // 20231111
            case "EMPAQUE": // 20240708
              nivel_area = 4;
              break;

            case "VALOR_AGREGADO": // 20231111
              nivel_area = 4;
              break;

            default:
              break;
          }

          var oData = {
            NIVEL_AREA: nivel_area,
          };

          var path =
            "MII/DatosMaestros/Transaction/qpcd/catalogo_qpcd_x_nivel___sel_01";
          this.onload_motivos(oData, path, "motivos");

          if (!this._valueHelpDialog_08) {
            this._valueHelpDialog_08 = sap.ui.xmlfragment(
              "sap.ui.demo.webapp.fragment.PantallaOperador.cat_defectos_nivel",
              this
            );
            this.getView().addDependent(this._valueHelpDialog_08);
          }
          this._valueHelpDialog_08.open(sInputValue);
        },

        onNotificationOrder: function (params) {
          // console.log(params)

          var oView = this.getView(),
            oitems_notification = oView
              .byId("NotificationComponent_Table")
              .getSelectedItems(),
            oitems_orders = oView.byId("OrdersList").getSelectedItems(),
            lote = "",
            order = "";

          var w_material_x101 = "";
          var xml_x101 = ""; // 202311

          if (oitems_notification.length > 1) {
            // 20231117
            order = "n";
          } else {
            /*
                                oitems_notification.forEach(function (item) {
                                    w_material_x101 = item.getCells()[0].getText();
                                    lote = item.getCells()[3].getText();
                                });
                */

            w_material_x101 = oitems_notification[0]
              .getBindingContext()
              .getObject().MATERIAL; // 20240625 ; es_un_array
            lote = oitems_notification[0].getBindingContext().getObject().BATCH; // 20240625 ; es_un_array
            order = oitems_notification[0]
              .getBindingContext()
              .getObject().NUM_ORDER; // 20240625 ; es_un_array
          }

          /*
                        oitems_orders.forEach(function (item) {
                            order = item.getCells()[0].getText();
                        });
            */

          g_xml_x531 = "";

          var oThis = this;

          var WORK_CENTER = this._oInput.getSelectedKey();
          var w_centro = g_planta;
          var w_puesto_trabajo = WORK_CENTER;

          var w_dato = oThis.get_row_puesto_trabajo(w_centro, w_puesto_trabajo);
          var sw_buenas = 1;
          var sw_malas = 0;

          var w_trx_x101 = "MIIExtensions/SFC/Transaction/notification_SFC";

          var w_sw_exe_validar_malas = 0; // 20240717

          switch (
          w_dato.AREA_ID // 2023092*
          ) {
            case "ERROR":
            case "":
              return;
              break;

            case "FUNDICION":
              switch (
              WORK_CENTER // 2023092*
              ) {
                case "CORDES01": // 202310Q
                case "CORLIN01":
                case "EMPAPRUE":
                case "EMPPINTA": // 202310Q
                  break;

                case "HORHOM01":
                  w_trx_x101 =
                    "MIIExtensions/SFC/Transaction/notification_SFC__XML"; // AGSG***
                  break;

                default:
                  if (
                    this.byId("input_longitud").getValue() === "" ||
                    this.byId("input_longitud").getValue() === "0"
                  ) {
                    this.handleWarningMessageBoxPress("Ingresa la longitud");
                    return;
                  }

                  break;
              }

              break;

            case "PRENSAS":
              //debugger
              var exe_validar_malas = this.validar_tb_malas();
              //debugger
              sw_malas = exe_validar_malas.OK;
              if (!sw_malas) {
                return;
              } else {
                g_xml_x531 = exe_validar_malas.XML;
              }

              //					debugger
              var w_valor = oView.byId("inputPesoBascula").getValue();
              var sw_isInteger = this.isNumber(w_valor); // 20240822
              //					debugger

              if (
                oView.byId("inputPesoBascula").getValue() === "" ||
                oView.byId("inputPesoBascula").getValue() === "0"
              ) {
                sw_buenas = 0;
              } else {
                if (sw_isInteger && 1 * w_valor > 0) {
                  // 20240822
                  sw_buenas = 1;
                } else {
                  sw_buenas = 0;
                }
              }

              break;

            case "PINTURA": // 20231204
              if (WORK_CENTER === "EMPTUBOC") {
                w_trx_x101 =
                  "MIIExtensions/SFC/Transaction/notification_SFC_EMPTUBOC";
              }
              var exe_validar_malas = this.validar_tb_malas(); // 20240614
              sw_malas = exe_validar_malas.OK;
              if (!sw_malas) {
                return;
              } else {
                g_xml_x531 = exe_validar_malas.XML;
              }
              var w_pza_sum = 1 * oView.byId("input_piezas_sum").getValue(); // 20240625
              var w_pza_total = 1 * oView.byId("TC_PT").getValue(); // 20240625
              if (w_pza_total > w_pza_sum) {
                // 20240625
                sw_buenas = 0;
                this.handleWarningMessageBoxPress(
                  "Cantidad [Total] mayor a Cantidad [Instalada]"
                );
                return;
              } else {
                if (w_pza_total < w_pza_sum) {
                  // 20240627
                  sw_buenas = 0;
                  this.handleWarningMessageBoxPress(
                    "Cantidad [Total] menor a Cantidad [Instalada]"
                  );
                  return;
                }
              }
              break;
            case "EMPAQUE":
              if (WORK_CENTER === "EMPTUBOC") {
                w_trx_x101 =
                  "MIIExtensions/SFC/Transaction/notification_SFC_EMPTUBOC";
              }
              var exe_validar_malas = this.validar_tb_malas(); // 20240614
              sw_malas = exe_validar_malas.OK;
              if (!sw_malas) {
                return;
              } else {
                g_xml_x531 = exe_validar_malas.XML;
              }
              var w_pza_sum = 1 * oView.byId("input_piezas_sum").getValue(); // 20240625
              var w_pza_total = 1 * oView.byId("TC_PT").getValue(); // 20240625

              if (WORK_CENTER === "EMPTUBOC") {
                // 20240710
              } else {
                if (w_pza_total > w_pza_sum) {
                  // 20240625
                  sw_buenas = 0; // 20240709
                  this.handleWarningMessageBoxPress(
                    "Cantidad [Total] mayor a Cantidad [Instalada]"
                  );
                  return;
                } else {
                  if (w_pza_total < w_pza_sum) {
                    // 20240627
                    sw_buenas = 0; // 20240709
                    this.handleWarningMessageBoxPress(
                      "Cantidad [Total] menor a Cantidad [Instalada]"
                    );
                    return;
                  }
                }
              }

              break;

            case "AMARRES": // 20240111
              //debugger
              var exe_validar_malas = this.validar_tb_malas();
              //debugger
              sw_malas = exe_validar_malas.OK;
              if (!sw_malas) {
                return;
              } else {
                g_xml_x531 = exe_validar_malas.XML;
              }

              //					debugger
              var w_valor = oView.byId("inputPesoBascula").getValue();
              var sw_isInteger = this.isNumber(w_valor); // 20240822
              //					debugger

              if (
                oView.byId("inputPesoBascula").getValue() === "" ||
                oView.byId("inputPesoBascula").getValue() === "0"
              ) {
                sw_buenas = 0;
              } else {
                if (sw_isInteger && 1 * w_valor > 0) {
                  // 20240822
                  sw_buenas = 1;
                } else {
                  sw_buenas = 0;
                }
              }

              var w_pza_sum = 1 * oView.byId("input_piezas_sum").getValue(); // 20240625
              var w_pza_total = 1 * oView.byId("TC_PT").getValue(); // 20240625
              if (w_pza_total > w_pza_sum) {
                // 20240625
                sw_buenas = 0;
                this.handleWarningMessageBoxPress(
                  "Cantidad [Total] mayor a Cantidad [Instalada]"
                );
                return;
              } else {
                if (w_pza_total < w_pza_sum) {
                  // 20240627
                  sw_buenas = 0;
                  this.handleWarningMessageBoxPress(
                    "Cantidad [Total] menor a Cantidad [Instalada]"
                  );
                  return;
                }
              }

              break;

            case "AMARRES_NONE": // 20240111
              w_trx_x101 =
                "MIIExtensions/SFC/Transaction/notification_SFC_Amarres";

              break;

            case "VALOR_AGREGADO":
              if (WORK_CENTER.startsWith("SIERR")) {
                w_trx_x101 = "MIIExtensions/SFC/Transaction/notification_SFC";
              }
              if (WORK_CENTER.startsWith("TCONDU")) {
                // 20240703

                w_sw_exe_validar_malas = 1; // 20240717
              }

              switch (
              WORK_CENTER // 20240717
              ) {
                case "COPLE01":
                case "BARREN01":
                case "CNCVAG01":
                case "PRETRO01":
                case "PRETRO02":
                  w_sw_exe_validar_malas = 1; // 20240717
                  break;
                default:
                  break;
              }

              if (w_sw_exe_validar_malas) {
                // 20240717*

                var exe_validar_malas = this.validar_tb_malas(); // 20240704
                sw_malas = exe_validar_malas.OK;
                if (!sw_malas) {
                  return;
                } else {
                  g_xml_x531 = exe_validar_malas.XML;
                }

                var w_pza_sum = 1 * oView.byId("input_piezas_sum").getValue();
                var w_pza_total = 1 * oView.byId("TC_PT").getValue();
                if (w_pza_total > w_pza_sum) {
                  // 20240704

                  switch (
                  WORK_CENTER // 20240717
                  ) {
                    case "COPLE01": // 20240718
                      break;
                    default:
                      sw_buenas = 0;
                      this.handleWarningMessageBoxPress(
                        "Cantidad [Total] mayor a Cantidad [Instalada]"
                      );
                      return;
                      break;
                  }
                } else {
                  if (w_pza_total < w_pza_sum) {
                    // 20240704

                    switch (
                    WORK_CENTER // 20240717
                    ) {
                      case "COPLE01": // 20240718
                        break;
                      default:
                        sw_buenas = 0;
                        this.handleWarningMessageBoxPress(
                          "Cantidad [Total] menor a Cantidad [Instalada]"
                        );
                        return;
                        break;
                    }
                  }
                }
              }

              break;

            default:
              break;
          }

          var w_seguir = 1;
          if (this.byId("notification_type").getSelectedKey() === "") {
            this.byId("notification_type").setSelectedKey("1"); // 20240627
            /* //20240627
                w_seguir = 0;
                this.handleWarningMessageBoxPress("Selecciona el tipo de notificaci\u00F3n");
                return;
                */
          }
          if (
            oView.byId("inputPesoBascula").getValue() === "" ||
            oView.byId("inputPesoBascula").getValue() === "0"
          ) {
            if (sw_malas == 0) {
              w_seguir = 0;
              this.handleWarningMessageBoxPress("Ingrese un peso");
              return;
            }
          }

          if (w_seguir) {
            if (order === "") {
              this.handleWarningMessageBoxPress("Selecciona una orden activa");
              return;
            }

            var w_order_format = order.toString().padStart(12, "0");
            var w_cantidad_x1 = oView.byId("inputPesoBascula").getValue();
            var w_cantidad_x2 = oView.byId("input_piezas").getValue();
            var w_cantidad_x3 = oView.byId("input_longitud").getValue();
            var piezas_pendientes = 0;
            if (oView.byId("input_piezas_sum") != undefined) {
              // 20231117
              piezas_pendientes = oView.byId("input_piezas_sum").getValue();
            }
            //debugger

            var sw_multiple = 0;
            g_xml_multiple_x101 = ""; // 20231121
            g_xml_multiple_x101 = "<Rowsets>\n";
            g_xml_multiple_x101 += "<Rowset>\n";

            var xml_completo = "<Rowsets>\n";
            xml_completo += "<Rowset>\n";

            if (oitems_notification.length > 1) {
              // 20231117

              sw_multiple = 1;
              oitems_notification.forEach(function (item) {
                /*
                                                w_material_x101 = item.getCells()[0].getText();
                                                lote = item.getCells()[3].getText();
                                                w_cantidad_x1 = 1 * item.getCells()[10].getText();
                        */

                w_material_x101 = item.getBindingContext().getObject().MATERIAL;
                lote = item.getBindingContext().getObject().BATCH;
                w_cantidad_x1 =
                  1 * item.getBindingContext().getObject().CANTIDAD;

                var orden = item.getBindingContext().getObject().NUM_ORDER; // 202407

                xml_completo += "<Row>\n";
                //						xml_completo += '<ID_ORDEN>' + w_order_format + '</ID_ORDEN>\n';
                xml_completo +=
                  "<ID_ORDEN>" +
                  orden.toString().padStart(12, "0") +
                  "</ID_ORDEN>\n";
                xml_completo +=
                  "<CD_MATERIAL>" + w_material_x101 + "</CD_MATERIAL>\n";
                xml_completo += "<LOTE>" + lote + "</LOTE>\n";
                xml_completo += "<CANTIDAD>" + w_cantidad_x1 + "</CANTIDAD>\n";
                xml_completo += "</Row>\n";

                g_xml_multiple_x101 += "<Row>\n";
                g_xml_multiple_x101 += "<BATCH>" + lote + "</BATCH>\n";
                g_xml_multiple_x101 +=
                  "<LONGITUD>" + w_cantidad_x3 + "</LONGITUD>\n";
                g_xml_multiple_x101 +=
                  "<NOTIFICATION_TYPE>" +
                  oThis.byId("notification_type").getSelectedKey() +
                  "</NOTIFICATION_TYPE>\n";
                g_xml_multiple_x101 += "<ORDER>" + orden + "</ORDER>\n";
                g_xml_multiple_x101 += "<PESO>" + w_cantidad_x1 + "</PESO>\n";
                g_xml_multiple_x101 +=
                  "<PIEZAS>" + w_cantidad_x2 + "</PIEZAS>\n";
                g_xml_multiple_x101 +=
                  "<PIEZAS_PENDIENTE>" +
                  piezas_pendientes +
                  "</PIEZAS_PENDIENTE>\n";
                g_xml_multiple_x101 +=
                  "<SUPERVISOR>" +
                  oView.byId("supervisor_noti").getSelectedKey() +
                  "</SUPERVISOR>\n";
                g_xml_multiple_x101 += "<USER>" + user + "</USER>\n";
                g_xml_multiple_x101 +=
                  "<WORK_CENTER>" +
                  oThis._oInput.getSelectedKey() +
                  "</WORK_CENTER>\n";
                g_xml_multiple_x101 += "</Row>\n";
              });
            } else {
              switch (WORK_CENTER) {
                case "HORHOM01":
                  w_trx_x101 = "MIIExtensions/SFC/Transaction/notification_SFC";
                  break;

                default:
                  break;
              }

              // ya seteado variables: w_material_x101 ; lote

              xml_completo += "<Row>\n";
              xml_completo += "<ID_ORDEN>" + w_order_format + "</ID_ORDEN>\n";
              xml_completo +=
                "<CD_MATERIAL>" + w_material_x101 + "</CD_MATERIAL>\n";
              xml_completo += "<LOTE>" + lote + "</LOTE>\n";
              xml_completo += "<CANTIDAD>" + w_cantidad_x1 + "</CANTIDAD>\n";
              xml_completo += "</Row>\n";
            }

            g_xml_multiple_x101 += "</Rowset>\n";
            g_xml_multiple_x101 += "</Rowsets>\n";

            xml_completo += "</Rowset>\n";
            xml_completo += "</Rowsets>\n";
            xml_x101 = xml_completo;

            //debugger

            var oData = {};
            if (sw_multiple) {
              // 20231122

              oData = {
                XML_COMPLETO: g_xml_multiple_x101,
              };
            } else {
              //	w_trx_x101 = "MIIExtensions/SFC/Transaction/notification_SFC";

              oData = {
                APLICA_UC:
                  this.byId("btn_fijarBase").getVisible() === true ? "X" : "",
                APLICA_CANASTA:
                  this.byId("btn_asignarCanastillaPrensa").getVisible() === true
                    ? "X"
                    : "",
                NOTIFICATION_TYPE:
                  this.byId("notification_type").getSelectedKey(),
                ORDER: order,
                BATCH: lote,
                PESO: w_cantidad_x1,
                USER: user,
                WORK_CENTER: this._oInput.getSelectedKey(),
                SUPERVISOR: oView.byId("supervisor_noti").getSelectedKey(),
                PIEZAS: w_cantidad_x2,
                LONGITUD: w_cantidad_x3,
                PIEZAS_PENDIENTE: piezas_pendientes,
                PZA_M261_M531_BM: g_pza_bm_m261m531, // 20240624
              };
            }

            var oData_add_items_canasta = {
              SW_NO_STOCK: true,
              CD_PLANTA: g_planta,
              CODIGO: g_canasta_activa_en_puesto,
              ITEMS: xml_x101,
              USUARIO: user,
            };

            var mData = {
              BATCH: lote,
              LITROS: oView.byId("inputPesoBascula").getValue(),
              NUM_ORDEN: order,
              USER: user,
            };

            var oData_X531 = {
              NOTIFICATION_TYPE:
                this.byId("notification_type").getSelectedKey(),
              XML_531: g_xml_x531,
            };
            console.log(oData);

            //	this.onCancelNotificationOrder(); // 20240809
            //	this.onClosePendingNotificacions(); // 20240809

            var w_info_msj = "";

            // 20240809
            switch (w_dato.AREA_ID) {
              case "EMPAQUE":
              case "AMARRES":
                //debugger

                if (this.byId("inp_piezasXatado_frg") != undefined) {
                  var valor_nuevo = this.byId(
                    "inp_piezasXatado_frg"
                  ).getValue();
                  if (
                    isNaN(valor_nuevo) ||
                    valor_nuevo.trim() === "" ||
                    valor_nuevo.indexOf(".") > 0
                  ) {
                    MessageBox.error("Debes ingresar un número entero");
                    return;
                  }
                  if (+valor_nuevo <= 0) {
                    MessageBox.error("Debes ingresar un número entero");
                    return;
                  }
                  w_info_msj =
                    "Todos los atados/etiquetas se van a notificar con " +
                    valor_nuevo +
                    " piezas, ES CORRECTO?";
                }

                break;

              default:
                break;
            }

            if (WORK_CENTER === "EMPTUBOC") {
              w_info_msj =
                "Todos los lotes se van a notificar con " +
                w_cantidad_x1 +
                " piezas, ES CORRECTO?";
            } else {
              if (w_info_msj == "") {
                // 20240809
                w_info_msj = "Confirmar notificación ?";
              }
            }

            this.onCancelNotificationOrder(); // 20240809
            this.onClosePendingNotificacions(); // 20240809

            var w_opcion = 1;
            if (w_opcion) {
              // 20231128 ; AGSG***

              //debugger

              this._handleMessageBoxConfirm_m101(
                w_info_msj,
                "warning",
                this,
                w_dato,
                oData,
                w_trx_x101,
                oData_add_items_canasta,
                sw_malas,
                oData_X531,
                sw_buenas
              );
            }
          }
        },

        m101x_execution: function (
          oThis,
          w_dato,
          oData_m101,
          trx_m101,
          oData_add_items_canasta,
          sw_malas,
          oData_X531,
          sw_buenas
        ) {
          //debugger
          var sw_add_canasta = false;

          var m101 = false;
          var m101 = false;
          if (sw_buenas) {
            // 20231204
            m101 = oThis.declararSFC___return_sw(oData_m101, trx_m101);
          } else {
            m101 = true;
          }

          //debugger
          if (m101 == false) {
            sw_malas = false;
          } else {
            switch (
            w_dato.AREA_ID // 202311
            ) {
              case "PINTURA": // 20231204
              case "AMARRES":
              case "FUNDICION": // 20231212
              case "VALOR_AGREGADO":
                break;

              default:
                var w_trx =
                  "MII/DatosTransaccionales/Produccion/Canastillas/Transaction/CanastillaDetalle_Agregar";
                sw_add_canasta = oThis.declararSFC___return_sw(
                  oData_add_items_canasta,
                  w_trx
                );
                break;
            }
          }

          if (sw_malas) {
            if (oData_X531.XML_531.length > 0) {
              // 202406*
              var w_trx = "MIIExtensions/SFC/Transaction/notification_531_v1";
              var m531 = oThis.declararSFC___return_sw(oData_X531, w_trx);
              //debugger
              if (m531 == false) {
              }
            }
          }
        },
        _handleMessageBoxConfirm_m101: function (
          sMessage,
          sMessageBoxType,
          oThis,
          w_dato,
          oData_m101,
          trx_m101,
          oData_add_items_canasta,
          sw_malas,
          oData_X531,
          sw_buenas
        ) {
          //debugger

          MessageBox[sMessageBoxType](sMessage, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                //	oThis.onCancelNotificationOrder(); // 20240809
                //	oThis.onClosePendingNotificacions(); // 20240809

                //debugger
                oThis.m101x_execution(
                  oThis,
                  w_dato,
                  oData_m101,
                  trx_m101,
                  oData_add_items_canasta,
                  sw_malas,
                  oData_X531,
                  sw_buenas
                );
                //debugger
              } else {
              }
            }.bind(this),
          });

          //debugger
        },

        open_generar_atados: function (oData) {
          // 202310_G*

          var WORK_CENTER = "";
          if (oData.WORK_CENTER !== undefined) {
            WORK_CENTER = oData.WORK_CENTER;
          }

          var oView = this.getView();
          var oThis = this;

          var columns = {
            columns: [
              {
                Column: "Orden",
                Visible: 1,
              },
              {
                Column: "Material",
                Visible: 1,
              },
              {
                Column: "Descripción",
                Visible: 1,
              },
              {
                Column: "Almacén",
                Visible: 0,
              },
              {
                Column: "Rollo Master",
                Visible: 1,
              },
              {
                Column: "Lote de Salida",
                Visible: 1,
              },
              {
                Column: "Lote de Salida [MII]",
                Visible: 0,
              },
              {
                Column: "Cantidad",
                Visible: 1,
              },
              {
                Column: "Documento",
                Visible: 1,
              },
              {
                Column: "Fecha Inicio",
                Visible: 0,
              },
              {
                Column: "Fecha Fin",
                Visible: 1,
              },
              {
                Column: "Ancho",
                Visible: 0,
              },
              {
                Column: "Espesor",
                Visible: 0,
              },
              {
                Column: "Longitud",
                Visible: 0,
              },
              {
                Column: "Supervisor",
                Visible: 0,
              },
              {
                Column: "Inspección",
                Visible: 1,
              },
              {
                Column: "Tipo",
                Visible: 0,
              },
              {
                Column: "Calidad",
                Visible: 0,
              },
              {
                Column: "ID",
                Visible: 0,
              },
              {
                Column: "Defecto",
                Visible: 0,
              },
              {
                Column: "Imprimir",
                Visible: 1,
              },
            ],
          };

          // this._setColumns(columns, "columnList", "ProductionReport_Table_2");

          var oTable = oView.byId("ProductionReport_Table_2");
          var oColumns = oTable.getColumns();

          // oColumns[17].setVisible( false );

          this._base_onloadTable(
            "ProductionReport_Table_2",
            oData,
            "MIIExtensions/Reports/Transaction/get_production_report_active___atados__v1",
            "Reporte Produccion",
            ""
          );
        },

        on_generar_atados: function () {
          // 202310

          var operation = this._oInput.getSelectedKey();
          var WORK_CENTER = this._oInput.getSelectedKey();

          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            var oData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
            var oView = this.getView();
            var oThis = this;

            debugger;
            this.onCloseReporte_generar_atados(); // 20231228
            var w_open_frg = 1; // 20231228
            debugger;

            //	if (!this.byId( "Reporte_generar_atados__frg" )) {
            if (w_open_frg) {
              if (this.byId("ProductionReport_List_2") !== undefined)
                this.byId("ProductionReport_List_2").destroy(); // 20231222
              if (this.byId("ProductionReport_Table_2") !== undefined)
                this.byId("ProductionReport_Table_2").destroy(); // 20231222
              if (this.byId("comBox_Supervisor_2") !== undefined)
                this.byId("comBox_Supervisor_2").destroy(); // 20231222

              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.Reporte_generar_atados", // 202310_D*
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                oThis.open_generar_atados(oData);
              });
            } else {
              this.byId("Reporte_generar_atados__frg").open();
              this.open_generar_atados(oData);
            }
          }
        },

        open_generar_atados_unifica_menudeo: function (oData) {
          // 20231221

          var WORK_CENTER = "";
          if (oData.WORK_CENTER !== undefined) {
            WORK_CENTER = oData.WORK_CENTER;
          }

          var oView = this.getView();
          var oThis = this;

          var columns = {
            columns: [
              {
                Column: "Orden",
                Visible: 1,
              },
              {
                Column: "Material",
                Visible: 1,
              },
              {
                Column: "Descripción",
                Visible: 1,
              },
              {
                Column: "Almacén",
                Visible: 0,
              },
              {
                Column: "Rollo Master",
                Visible: 1,
              },
              {
                Column: "Lote de Salida",
                Visible: 1,
              },
              {
                Column: "Lote de Salida [MII]",
                Visible: 0,
              },
              {
                Column: "Cantidad",
                Visible: 1,
              },
              {
                Column: "Documento",
                Visible: 1,
              },
              {
                Column: "Fecha Inicio",
                Visible: 0,
              },
              {
                Column: "Fecha Fin",
                Visible: 1,
              },
              {
                Column: "Ancho",
                Visible: 0,
              },
              {
                Column: "Espesor",
                Visible: 0,
              },
              {
                Column: "Longitud",
                Visible: 0,
              },
              {
                Column: "Supervisor",
                Visible: 0,
              },
              {
                Column: "Inspección",
                Visible: 1,
              },
              {
                Column: "Tipo",
                Visible: 0,
              },
              {
                Column: "Calidad",
                Visible: 0,
              },
              {
                Column: "ID",
                Visible: 0,
              },
              {
                Column: "Defecto",
                Visible: 0,
              },
              {
                Column: "Imprimir",
                Visible: 1,
              },
            ],
          };

          // this._setColumns(columns, "columnList", "tb_atados_unifica_x02");

          var oTable = oView.byId("tb_atados_unifica_x02");
          var oColumns = oTable.getColumns();

          // oColumns[17].setVisible( false );

          var w_trx =
            "MIIExtensions/Reports/Transaction/get_production_report_active___atados__unifica__v1";
          this._base_onloadTable(
            "tb_atados_unifica_x02",
            oData,
            w_trx,
            "Reporte Produccion",
            ""
          );
        },

        on_generar_atados_unifica_menudeo: function () {
          // 20231221

          var operation = this._oInput.getSelectedKey();
          var WORK_CENTER = this._oInput.getSelectedKey();

          if (operation === "")
            this.handleWarningMessageBoxPress("Selecciona una operaci\u00F3n");
          else {
            var oData = {
              WORK_CENTER: this._oInput.getSelectedKey(),
            };
            var oView = this.getView();
            var oThis = this;

            debugger;
            this.onCloseReporte_generar_atados(); // 20231228
            var w_open_frg = 1; // 20231228
            debugger;

            //	if (!this.byId( "Reporte_generar_atados_unifica_menudeo_frg" )) {
            if (w_open_frg) {
              if (this.byId("ProductionReport_List_2") !== undefined)
                this.byId("ProductionReport_List_2").destroy(); // 20231222
              if (this.byId("tb_atados_unifica_x02") !== undefined)
                this.byId("tb_atados_unifica_x02").destroy(); // 20231222
              if (this.byId("comBox_Supervisor_2") !== undefined)
                this.byId("comBox_Supervisor_2").destroy(); // 20231222
              if (
                this.byId("webapp---panelOperador--comBox_Supervisor_z3") !==
                undefined
              )
                this.byId(
                  "webapp---panelOperador--comBox_Supervisor_z3"
                ).destroy(); // 20240114

              Fragment.load({
                id: oView.getId(),
                name: "sap.ui.demo.webapp.fragment.PantallaOperador.Reporte_generar_atados_unificacion_menudeo", // 20231221
                controller: this,
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                oThis.open_generar_atados_unifica_menudeo(oData);
              });
            } else {
              this.byId("Reporte_generar_atados_unifica_menudeo_frg").open();
              this.open_generar_atados_unifica_menudeo(oData);
            }
          }
        },

        _onPrint_Etiq_Atados_unifica_menudeo() {
          // 20231225

          var oView = this.getView();
          var oThis = this;
          var oitems_notification = oView
            .byId("tb_atados_unifica_x02")
            .getSelectedItems();
          var oTable = oView.byId("tb_atados_unifica_x02");
          var oModel = oTable.getModel();
          var oModelData = oModel.getProperty("/ITEMS");

          var xml_completo = "<Rowsets>\n";
          xml_completo += "<Rowset>\n";

          if (oitems_notification.length > 0) {
            // 20231225

            oitems_notification.forEach(function (item) {
              var oItem = item;
              var oIndex = oTable.indexOfItem(oItem);
              var row = oModelData[oIndex];

              var w_order_format = row.NUM_ORDER.toString().padStart(12, "0");
              var w_material_x101 = row.MATERIAL.toString().padStart(18, "0");
              var lote = row.BATCH != "" ? row.BATCH : row.BATCH_MII;

              row.PZAS_X_UNIFICAR = 1 * row.PZAS_X_UNIFICAR;
              row.CHARACTERISTIC_VALUE = 1 * row.CHARACTERISTIC_VALUE;
              row.CUANTOS_ATADOS = 1 * row.CUANTOS_ATADOS;
              row.CUANTOS_PIEZAS = 1 * row.CUANTOS_PIEZAS;

              if (row.CHARACTERISTIC_VALUE == 0) {
                return;
              }

              var w_cantidad_x1 = row.PZAS_X_UNIFICAR;
              var w_cantidad_x2 = row.CHARACTERISTIC_VALUE;
              xml_completo += "<Row>\n";
              xml_completo += "<ID>" + row.ID + "</ID>\n";
              xml_completo += "<ARBPL>" + row.ARBPL + "</ARBPL>\n";
              xml_completo +=
                "<WORK_CENTER>" + row.WORK_CENTER + "</WORK_CENTER>\n";
              xml_completo += "<ACABADO>" + row.ACABADO + "</ACABADO>\n";
              xml_completo += "<ALEACION>" + row.ALEACION + "</ALEACION>\n";
              xml_completo += "<CLAVE>" + row.CLAVE + "</CLAVE>\n";
              xml_completo +=
                "<LARGO_PERFIL>" + row.LARGO_PERFIL + "</LARGO_PERFIL>\n";
              xml_completo += "<TEMPLE>" + row.TEMPLE + "</TEMPLE>\n";
              xml_completo += "<BATCH>" + lote + "</BATCH>\n";
              xml_completo += "<MATERIAL>" + w_material_x101 + "</MATERIAL>\n";
              xml_completo += "<NUM_ORDER>" + w_order_format + "</NUM_ORDER>\n";
              xml_completo +=
                "<PZAS_X_ATADO>" + w_cantidad_x2 + "</PZAS_X_ATADO>\n";
              xml_completo +=
                "<PZAS_X_UNIFICAR>" + w_cantidad_x1 + "</PZAS_X_UNIFICAR>\n";
              xml_completo += "<UM>" + row.UM + "</UM>\n";
              xml_completo += "<CUSTOMER>" + row.CUSTOMER + "</CUSTOMER>\n";
              xml_completo += "<PEDIDO>" + row.PEDIDO + "</PEDIDO>\n";
              xml_completo +=
                "<PEDIDO_POSICION>" +
                row.PEDIDO_POSICION +
                "</PEDIDO_POSICION>\n";
              xml_completo += "</Row>\n";
            });

            xml_completo += "</Rowset>\n";
            xml_completo += "</Rowsets>\n";
          } else {
            return;
          }

          var w_info_msj = "Confirma imprimir etiqueta de Atados ?";

          var w_null = "";
          var oData = {
            NUM_ORDEN: w_null,
            MATERIAL: w_null,
            LOTE: w_null,
            UM: w_null,
            Q_PZAS_X_ATADO: w_null,
            ETIQ_PENDIENTES: w_null,
            _USER_MII: user,
            _XML: xml_completo,
          };
          debugger;

          this._handleMessageBoxOpen__imprimir_Etiq_Atados_unifica(
            w_info_msj,
            "warning",
            oData,
            this
          );

          debugger;
        },

        _handleMessageBoxOpen__imprimir_Etiq_Atados_unifica: function (
          sMessage,
          sMessageBoxType,
          oData,
          oThis
        ) {
          // 20231226

          MessageBox[sMessageBoxType](sMessage, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                var w_trx =
                  "MII/DatosTransaccionales/Produccion/Etiquetar_Atados/Transaction/etiquetar_atados_unifica";
                debugger;
                var w_opcion = "2";
                oThis.BD_MII__exe_data_Etiq_Atados(oData, w_trx, w_opcion);
                debugger;
              }
            }.bind(this),
          });
        },
        _handleMessageBoxOpen__imprimir_Etiq_Atados: function (
          sMessage,
          sMessageBoxType,
          oData,
          oThis
        ) {
          // 202310_G*

          MessageBox[sMessageBoxType](sMessage, {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                var w_trx =
                  "MII/DatosTransaccionales/Produccion/Etiquetar_Atados/Transaction/etiquetar_atados";
                // debugger
                var w_opcion = "1";
                oThis.BD_MII__exe_data_Etiq_Atados(oData, w_trx, w_opcion);
                // debugger
              }
            }.bind(this),
          });
        },

        onPrint_Etiq_Atados(oEvent) {
          // 202310_G*

          var oItem = oEvent.getSource().getParent();
          var oTable = oItem.getParent();
          var oIndex = oTable.indexOfItem(oItem);
          var oModel = oTable.getModel();
          var oModelData = oModel.getProperty("/ITEMS");
          var row = oModelData[oIndex];

          row.CANTIDAD = 1 * row.CANTIDAD;
          row.CHARACTERISTIC_VALUE = 1 * row.CHARACTERISTIC_VALUE;
          row.CUANTOS_ATADOS = 1 * row.CUANTOS_ATADOS;
          row.CUANTOS_PIEZAS = 1 * row.CUANTOS_PIEZAS;

          if (row.CHARACTERISTIC_VALUE == 0) {
            return;
          }

          var w_cant_x_etiquetar = 0;

          if (row.CUANTOS_PIEZAS >= row.CANTIDAD) {
            w_cant_x_etiquetar = 1;
          } else {
            w_cant_x_etiquetar =
              (row.CANTIDAD - row.CUANTOS_PIEZAS) / row.CHARACTERISTIC_VALUE;
          }

          // debugger
          var w_cant_x_etiquetar_aux = Math.floor(w_cant_x_etiquetar);
          if (w_cant_x_etiquetar_aux == 0) {
            row.CHARACTERISTIC_VALUE = row.CANTIDAD - row.CUANTOS_PIEZAS;
            w_cant_x_etiquetar = 1;
          }

          var oData = {
            NUM_ORDEN: row.NUM_ORDER,
            MATERIAL: row.MATERIAL,
            LOTE: row.BATCH_MII,
            UM: row.UM,
            Q_PZAS_X_ATADO: row.CHARACTERISTIC_VALUE,
            ETIQ_PENDIENTES: w_cant_x_etiquetar,
            _USER_MII: user,
          };

          var w_info_msj = "Confirma imprimir etiqueta de Atados ?";
          // debugger
          this._handleMessageBoxOpen__imprimir_Etiq_Atados(
            w_info_msj,
            "warning",
            oData,
            this
          );
        },

        BD_MII__exe_data_Etiq_Atados: function (oData, path, w_opcion) {
          // 202310_G*

          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          var oThis = this;
          sap.ui.core.BusyIndicator.show(0);

          // debugger

          $.ajax({
            crossDomain: true,
            async: false,
            type: "POST",
            dataType: "xml",
            cache: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

              if (opElement.firstChild != null) {
                var aData = eval(opElement.firstChild.data);

                if (aData[0].error !== undefined) {
                  oThis.getOwnerComponent().openHelloDialog(aData[0].error);
                } else {
                  //Create  the JSON model and set the data
                  oThis.getOwnerComponent().openHelloDialog(aData[0].message);

                  if (w_opcion == "1") {
                    oThis.on_generar_atados();
                  }
                  if (w_opcion == "2") {
                    // 20231226
                    oThis.on_generar_atados_unifica_menudeo();
                  }
                }
              } else {
                oThis
                  .getOwnerComponent()
                  .openHelloDialog("No se recibio informacion");
              }

              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                oThis
                  .getOwnerComponent()
                  .openHelloDialog(
                    "La solicitud a fallado: Hay conexion de red?"
                  );
              }
              sap.ui.core.BusyIndicator.hide();
            });

          //debugger
        },

        open_onDeclarar_anodizado: function (
          WORK_CENTER,
          lote,
          cantidad,
          w_caracteristicas_of_orden_pp
        ) {
          var oView = this.getView();
          var oThis = this;

          var oitems_orders = oView.byId("OrdersList").getSelectedItems();
          var order = "";

          oitems_orders.forEach(function (item) {
            order = item.getCells()[0].getText();
          });

          //	var w_WORK_CENTER = this._oInput.getSelectedKey();

          var w_centro = g_planta;
          var w_puesto_trabajo = WORK_CENTER;

          var w_dato = oThis.get_row_puesto_trabajo(w_centro, w_puesto_trabajo);

          switch (w_dato.AREA_ID) {
            case "ERROR":
            case "":
            case "FUNDICION":
            case "PRENSAS":
              break;

            case "ANODIZADO":
              ZCT_PESO_PIEZA = this.getView()
                .getModel("ModeloChar_ANODIZADO")
                .getProperty("/ZCT_PESO_PIEZA");
              g_canasta_activa_en_puesto = this.getView()
                .getModel("Modelo_CANASTA_ANODIZADO")
                .getProperty("/CANASTA_ACTIVA");
              oView.byId("TC_NRO_CANASTA").setValue(g_canasta_activa_en_puesto); // nro_canasta_activa_en_puesto // 202311

              var zData = {
                ORDER: order,
              };

              var w_trx =
                "MIIExtensions/Consumption/Transaction/get_components___TYPE_eq_B";
              this._base_onloadTable(
                "table_rows_list00",
                zData,
                w_trx,
                "Pedacerias",
                ""
              );

              break;

            default:
              break;
          }
        },

        onUpdateQtyOrdenesByWC: function () {
          let oView = this.getView();
          let oThis = this;
          let sSelectedWorkCenter = this._oInput.getSelectedKey();
          // WorkCenter Seleccionado
          if (sSelectedWorkCenter != "") {
            console.log(
              "Actualizando datos Ordenes para Puesto " + sSelectedWorkCenter
            );
            this.onUpdateDataOrdenes(sSelectedWorkCenter);
          } else {
            console.log("Sin puesto de trabajo seleccionado");
            return;
          }
        },

        onUpdateDataOrdenes: function (oPuestoTrabajo) {
          oPuestoTrabajo = oPuestoTrabajo;
          let oThis = this;
          let oView = this.getView();
          let oModelOrdenes = new sap.ui.model.json.JSONModel();
          oModelOrdenes.setSizeLimit(10000);
          var oPath =
            "MII/DatosTransaccionales/Ordenes/Transaction/actualizaDatoOrdenByWC_xacuteQuery";
          var url =
            "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" +
            oPath +
            "&Content-Type=text/json";
          var parameters = {
            "Param.1": oPuestoTrabajo,
          };
          oModelOrdenes.loadData(url, parameters, true, "POST");
          oModelOrdenes.attachRequestCompleted(function () {
            // IF Fatal Error input
            if (oModelOrdenes.getData().Rowsets.FatalError) {
              global.functions.onMessage(
                "E",
                oModelOrdenes.getData().Rowsets.FatalError
              );
              return;
            }
            console.log(
              "Datos de Ordenes de Puesto " +
              oPuestoTrabajo +
              " actualizados..."
            );
          });
        },

        open_onDeclarar: function (
          WORK_CENTER,
          lote,
          cantidad,
          w_caracteristicas_of_orden_pp
        ) {
          // 202309

          var oView = this.getView();
          var oThis = this;

          if (oView.byId("label_piezas") !== undefined) {
            oView.byId("label_piezas").setVisible(false);
            oView.byId("input_piezas").setVisible(false);
          }

          if (oView.byId("label_longitud") !== undefined) {
            oView.byId("label_longitud").setVisible(true);
          }

          if (oView.byId("input_longitud") !== undefined) {
            oView.byId("input_longitud").setVisible(true);
            oView.byId("input_longitud").setValue("0");
          }

          if (oView.byId("label_bascula") !== undefined) {
            oView.byId("label_bascula").setVisible(true);
          }

          if (oView.byId("combo_basculas") !== undefined) {
            oView.byId("combo_basculas").setVisible(true);
          }

          if (oView.byId("notification_type") !== undefined) {
            oView.byId("notification_type").setSelectedKey("");
          }

          if (oView.byId("inputPesoBascula") !== undefined) {
            oView.byId("inputPesoBascula").setValue("");
          }

          if (oView.byId("input_kilo_x_pieza2") !== undefined) {
            // 202406
            oView.byId("input_kilo_x_pieza2").setValue("0");
          }

          var w_centro = g_planta;
          var w_puesto_trabajo = WORK_CENTER;
          var sw_load_combo_basculas = 0;

          var w_dato = oThis.get_row_puesto_trabajo(w_centro, w_puesto_trabajo);

          switch (
          w_dato.AREA_ID // 2023092*
          ) {
            case "ERROR":
              oView.byId("label_peso").setText("Piezas");
              break;

            case "":
              oView.byId("label_peso").setText("Piezas");
              break;

            case "FUNDICION":
              switch (
              WORK_CENTER // 2023092*
              ) {
                case "HORFUN01":
                case "HORFUN02":
                case "HORNOFD1":
                case "HORNOFD2":
                case "MESAVAC1": // 202310Q
                  oView.byId("label_peso").setText("Altura [ Pulgadas ]");

                  oView.byId("label_bascula").setVisible(false);
                  oView.byId("combo_basculas").setVisible(false);

                  oView.byId("label_piezas").setVisible(true);
                  oView.byId("input_piezas").setVisible(true);

                  if (WORK_CENTER == "MESAVAC1") {
                    // 202310***

                    oView
                      .byId("input_piezas")
                      .setValue(ZCT_LONGITUD_LINGOTE_PLG); // Altura [ Pulgadas ]
                    oView
                      .byId("input_longitud")
                      .setValue(ZCT_DIAMETRO_BILLET_PULGADAS); // Diámetro [ Pulgadas ]
                    oView.byId("input_longitud").setEnabled(false); // Diámetro [ Pulgadas ] ; 20231129

                    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                    ZCT_PESO_PIEZA = 0;

                    var w_piezas = 1;

                    var w_altura = oView.byId("input_piezas").getValue();
                    var w_diametro = this.byId("input_longitud").getValue();

                    w_altura = w_inches_to_cm * w_altura; // altura en cm
                    w_diametro = w_inches_to_cm * w_diametro; // diámetro en cm
                    var w_radio = w_diametro / 2; // radio en cm
                    var w_area = w_PI * w_radio * w_radio; // en cm²
                    var w_volumen = w_altura * w_area; // en cm³
                    var w_masa = w_volumen * w_densidad; // en gramos
                    w_masa = w_masa / 1000; // en Kilos
                    var w_peso = w_piezas * w_masa;

                    w_altura = w_altura / 100; // de cm a mts

                    ZCT_PESO_PIEZA = w_peso;
                    oView.byId("input_kilo_x_pieza").setValue(ZCT_PESO_PIEZA); // peso_x_pieza // 20231129
                    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                  }

                  break;

                case "HORHOM01":
                  oView.byId("label_peso").setText("Kilos [por cada Billet]");
                  oView.byId("label_longitud").setVisible(false);
                  oView.byId("input_longitud").setVisible(false);
                  oView.byId("input_longitud").setValue("1"); // dato_dummy

                  oView.byId("notification_type").setSelectedKey("1"); // 202311
                  oView.byId("label_bascula").setVisible(false); // 202311
                  oView.byId("combo_basculas").setVisible(false); // 202311
                  //	oView.byId("inputPesoBascula").setValue( IR_CANTIDAD_RESTANTE ); // 202311
                  oView.byId("inputPesoBascula").setValue(cantidad); // 20231117
                  oView.byId("inputPesoBascula").setEnabled(false); // 20231117

                  break;

                case "CORLIN01":
                  oView
                    .byId("label_peso")
                    .setText("Kilos [por cada corte de Billet]");

                  oView.byId("label_bascula").setVisible(false); // 202311
                  oView.byId("combo_basculas").setVisible(false); // 202311

                  // oView.byId("label_longitud").setVisible( false );
                  // oView.byId("input_longitud").setVisible( false );
                  // oView.byId("input_longitud").setValue( '1' ); // dato_dummy
                  oView.byId("input_longitud").setEnabled(false); // 202311

                  oView.byId("label_piezas").setVisible(true); // 202311
                  oView.byId("input_piezas").setVisible(true); // 202311
                  oView.byId("input_piezas").setEnabled(false); // 202311

                  oView.byId("input_piezas").setValue(ZCT_LONGITUD_LINGOTE_PLG); // Altura [ Pulgadas ]
                  oView
                    .byId("input_longitud")
                    .setValue(ZCT_DIAMETRO_BILLET_PULGADAS); // Diámetro [ Pulgadas ]

                  break;

                case "CORDES01": // 202310Q
                  oView.byId("label_peso").setText("Peso");
                  oView.byId("label_peso").setVisible(true);
                  oView.byId("inputPesoBascula").setVisible(true);

                  oView.byId("label_bascula").setVisible(false); // 202310***
                  oView.byId("combo_basculas").setVisible(false); // 202310***

                  // oView.byId("label_longitud").setVisible( false );
                  // oView.byId("input_longitud").setVisible( false );
                  // oView.byId("input_longitud").setValue( '1' ); // dato_dummy
                  oView.byId("input_longitud").setEnabled(false); // 202310***

                  oView.byId("label_piezas").setVisible(true);
                  oView.byId("input_piezas").setVisible(true);
                  oView.byId("input_piezas").setEnabled(true); // 202310***

                  oView.byId("input_piezas").setValue(ZCT_LONGITUD_LINGOTE_PLG); // Altura [ Pulgadas ]
                  oView
                    .byId("input_longitud")
                    .setValue(ZCT_DIAMETRO_BILLET_PULGADAS); // Diámetro [ Pulgadas ]
                  this.PesoTot(
                    ZCT_LONGITUD_LINGOTE_PLG,
                    ZCT_DIAMETRO_BILLET_PULGADAS
                  );

                  break;

                default:
                  oView.byId("label_peso").setText("Piezas");
                  break;
              }

              break;

            case "PRENSAS":
            case "AMARRES":
            case "PINTURA": // 20231204
              oView.byId("label_bascula").setVisible(false); // 202311
              oView.byId("combo_basculas").setVisible(false); // 202311

              oView.byId("input_longitud").setValue(ZCT_LONGITUD_PERFIL_M); // Largo del perfil en metros // 202311
              oView.byId("input_kilo_x_pieza").setValue(ZCT_PESO_PIEZA); // peso_x_pieza // 202311

              oView.byId("TC_NRO_CANASTA").setValue(g_canasta_activa_en_puesto); // nro_canasta_activa_en_puesto // 202311

              oView.byId("label_peso").setText("Piezas");

              break;

            case "VALOR_AGREGADO": // 20231111
            case "EMPAQUE": // 20240708
              oView.byId("label_bascula").setVisible(false); // 202311
              oView.byId("combo_basculas").setVisible(false); // 202311

              oView.byId("input_longitud").setValue(ZCT_LONGITUD_PERFIL_M); // Largo del perfil en metros // 202311
              oView.byId("input_kilo_x_pieza").setValue(ZCT_PESO_PIEZA); // peso_x_pie // 202311

              //	oView.byId("TC_NRO_CANASTA").setValue( g_canasta_activa_en_puesto ); // nro_canasta_activa_en_puesto // 202311

              oView.byId("label_peso").setText("Piezas");

              break;

            default:
              oView.byId("label_peso").setText("Piezas");
              break;
          }

          switch (w_dato.AREA_ID) {
            case "ERROR":
            case "":
              break;

            case "PRENSAS": // 202406
              var w_valor_1 = ZCT_PESO_PIEZA;
              var w_valor_2 = ZCT_PESO_PIEZA_X;
              ZCT_PESO_PIEZA = w_valor_2;
              ZCT_PESO_PIEZA_X = w_valor_1;

              oView.byId("input_kilo_x_pieza").setValue(ZCT_PESO_PIEZA); // peso_x_pieza // 202406
              oView.byId("input_kilo_x_pieza2").setValue(ZCT_PESO_PIEZA_X); // peso_x_pieza // 202406

              break;

            case "AMARRES":
            case "PINTURA": // 20231204
              oView.byId("input_piezas_sum").setValue(cantidad);
              oView.byId("label_longitud").setVisible(false);
              oView.byId("input_longitud").setVisible(false);

              //	oView.byId("inputPesoBascula").setEnabled( false ); // 20231130
              oView.byId("inputPesoBascula").setValue(cantidad); // 20231130

              var w_param = oView.byId("inputPesoBascula"); // línea_10903
              oThis.liveChange_isNumber(w_param); // 20240702*

              break;

            case "VALOR_AGREGADO": // 20231111
            case "EMPAQUE": // 20240708
              oView.byId("input_piezas_sum").setValue(cantidad);
              oView.byId("label_longitud").setVisible(false);
              oView.byId("input_longitud").setVisible(false);
              break;

            default:
              break;
          }

          var xData = {
            WORK_CENTER: this._oInput.getSelectedKey(),
            SERVER: server,
          };

          this._base_onloadCOMBO(
            "supervisor_noti",
            xData,
            "MIIExtensions/SFC/Transaction/get_supervisores",
            "1",
            "Supervisores"
          );

          if (sw_load_combo_basculas) {
            // 202311 ; activar sw en los puestos donde aplique cargar ---> combo_basculas
            this._base_onloadCOMBO(
              "combo_basculas",
              xData,
              "MIIExtensions/Operation/Transaction/get_basculas",
              "",
              "Basculas"
            );
          }

          var w_seguir = true; // 202310***
          var order = "";

          switch (
          w_dato.AREA_ID // 2023092*
          ) {
            case "FUNDICION":
              switch (WORK_CENTER) {
                case "MESAVAC1": // 20231129 ; AGSG
                  w_seguir = false;

                  var oitems_orders = oView
                    .byId("OrdersList")
                    .getSelectedItems();

                  oitems_orders.forEach(function (item) {
                    order = item.getCells()[0].getText();
                  });

                  var zData = {
                    ORDER: order,
                  };

                  var w_trx =
                    "MIIExtensions/Consumption/Transaction/get_components___TYPE_eq_B";
                  this._base_onloadTable(
                    "table_rows_list00",
                    zData,
                    w_trx,
                    "Pedacerias",
                    ""
                  );

                  break;

                case "CORDES01": // 202310***
                case "HORHOM01": // 202311
                case "CORLIN01": // 202311
                  w_seguir = false;
                  break;

                default:
                  break;
              }
              break;

            case "PRENSAS": // 202311
            case "AMARRES": // 20231111
            case "PINTURA": // 20231204
            case "VALOR_AGREGADO": // 20240708
            case "EMPAQUE": // 20240708
              w_seguir = false;
              var oitems_orders = oView.byId("OrdersList").getSelectedItems();

              oitems_orders.forEach(function (item) {
                order = item.getCells()[0].getText();
              });

              var zData = {
                ORDER: order,
              };

              var w_trx =
                "MIIExtensions/Consumption/Transaction/get_components___TYPE_eq_B";
              this._base_onloadTable(
                "table_rows_list00",
                zData,
                w_trx,
                "Pedacerias",
                ""
              );

              break;

            case "VALOR_AGREGADO___Z": // 20231111 ; 20240708
              w_seguir = false;
              var oitems_orders = oView.byId("OrdersList").getSelectedItems();

              oitems_orders.forEach(function (item) {
                order = item.getCells()[0].getText();
              });

              var zData = {
                ORDER: order,
              };

              var w_trx =
                "MIIExtensions/Consumption/Transaction/get_components___TYPE_eq_B";
              this._base_onloadTable(
                "table_rows_list00",
                zData,
                w_trx,
                "Pedacerias",
                ""
              );

              break;

            default:
              break;
          }

          switch (
          w_dato.AREA_ID // 20240809
          ) {
            case "AMARRES":
            case "EMPAQUE":
              // debugger

              var oData = {
                ORDER: order,
                OPERATION: w_puesto_trabajo,
                WORK_CENTER: w_puesto_trabajo,
              };
              var rows_caracteristicas_of_orden_pp = [
                {
                  SHOP_ORDER: "ERROR",
                },
              ];

              rows_caracteristicas_of_orden_pp =
                this.get_rows_chars_of_orden_pp(oData);

              var piezasPorAtado = rows_caracteristicas_of_orden_pp.find(
                (i) => i.CHARACTERISTIC_NAME === "ZCT_PIEZAS_ATADO"
              );
              piezasPorAtado =
                piezasPorAtado === undefined
                  ? piezasPorAtado
                  : piezasPorAtado.CHARACTERISTIC_VALUE.split(" ")[0];
              this.byId("inp_piezasXatado_frg").setValue(piezasPorAtado);

              break;

            default:
              break;
          }

          if (w_seguir) {
            this.getLongitud(lote);
          }
        },

        onDeclarar: function () {
          var oThis = this;
          var oView = this.getView(),
            lote = "",
            lote_master = "",
            order = "",
            cantidad = "";
          var rows_caracteristicas_of_orden_pp = [
            {
              SHOP_ORDER: "ERROR",
            },
          ]; // 202310***

          var oitems_components = oView
            .byId("NotificationComponent_Table")
            .getSelectedItem();
          var WORK_CENTER = this._oInput.getSelectedKey();

          if (oitems_components.length == 0) {
            // 20240702
            this.handleWarningMessageBoxPress(
              "Debes seleccionar un CP o crear uno"
            );
            return;
          }

          if (oitems_components.length == undefined) {
            // 20240702*
            lote = oitems_components.getBindingContext().getObject().BATCH; // 20240702
            lote_master = oitems_components
              .getBindingContext()
              .getObject().ROLLO_MASTER;
            order = oitems_components.getBindingContext().getObject().NUM_ORDER;
            cantidad = oitems_components
              .getBindingContext()
              .getObject().CANTIDAD;
          } else {
            lote = oitems_components[0].getBindingContext().getObject().BATCH; // 20240702 ; array
            lote_master = oitems_components[0]
              .getBindingContext()
              .getObject().ROLLO_MASTER;
            order = oitems_components[0]
              .getBindingContext()
              .getObject().NUM_ORDER;
            cantidad = oitems_components[0]
              .getBindingContext()
              .getObject().CANTIDAD;
          }

          var oData = {
            ORDER: order,
            OPERATION: this._oInput.getSelectedKey(),
            WORK_CENTER: WORK_CENTER, // 202310***
          };
          var oData261 = {
            ORDER: order,
            OPERATION: this._oInput.getSelectedKey(),
            WORK_CENTER: WORK_CENTER,
            LOTE_101: lote,
            LOTE_261: lote_master,
          };

          var sw_fragmento_declarar = false; // 20240702

          var w_centro = g_planta;
          var w_puesto_trabajo = WORK_CENTER;
          var w_orden = order;

          var w_dato = oThis.get_row_puesto_trabajo(w_centro, w_puesto_trabajo);

          var w_data_row_to_declarar = {
            AREA_ID: "ERROR",
          };
          if (lote_master == "") {
          } else {
            w_data_row_to_declarar = oThis.get_row261(oData261); // 202311
          }

          rows_caracteristicas_of_orden_pp =
            oThis.get_rows_chars_of_orden_pp(oData); // 202310***

          ZCT_DIAMETRO_BILLET_PULGADAS = 0;
          ZCT_LONGITUD_LINGOTE_PLG = 0;
          IR_CANTIDAD_RESTANTE = 0;

          if (
            rows_caracteristicas_of_orden_pp[0].SHOP_ORDER == "ERROR" ||
            rows_caracteristicas_of_orden_pp[0].SHOP_ORDER == ""
          ) {
            // 20240702
            this.handleWarningMessageBoxPress(
              "No se encontraron las caracteristicas de la orden, Favor de validar con admin. MII"
            );
            //				return; // 20240702
          }

          switch (w_dato.AREA_ID) {
            case "PRENSAS":
              ZCT_LONGITUD_PERFIL_M = oThis.filterJsonCHARS(
                rows_caracteristicas_of_orden_pp,
                "ZCT_LONGITUD_PERFIL_M",
                "m",
                ""
              );
              ZCT_PESO_PIEZA = oThis.filterJsonCHARS(
                rows_caracteristicas_of_orden_pp,
                "ZCT_CONTROL_PESO",
                "kg",
                ""
              );

              if (ZCT_PESO_PIEZA == "") {
                // 20240703
                ZCT_PESO_PIEZA = oThis.filterJsonCHARS(
                  rows_caracteristicas_of_orden_pp,
                  "ZCT_PESO_PIEZA",
                  "kg",
                  ""
                );
              }
              ZCT_PESO_PIEZA_X = oThis.get_wc_control_peso(oData); // 20240703
              if (ZCT_PESO_PIEZA_X[0].LOG_CTRL_QTY == undefined) {
                // ZCT_PESO_PIEZA_X = ZCT_PESO_PIEZA * 1;

                MessageBox.error(
                  " Registrar Control de Peso en [ Puesto de Trabajo & Orden ]"
                ); // 20240703*
                return;
              } else {
                ZCT_PESO_PIEZA_X =
                  ZCT_PESO_PIEZA_X[0].LOG_CTRL_QTY * ZCT_LONGITUD_PERFIL_M * 1;
                ZCT_PESO_PIEZA_X = ZCT_PESO_PIEZA_X.toFixed(4);
              }

              break;
            case "AMARRES":
            case "PINTURA": // 20231204
            case "VALOR_AGREGADO":
            case "EMPAQUE": // 20240708
              ZCT_LONGITUD_PERFIL_M = oThis.filterJsonCHARS(
                rows_caracteristicas_of_orden_pp,
                "ZCT_LONGITUD_PERFIL_M",
                "m",
                ""
              );
              ZCT_PESO_PIEZA = oThis.filterJsonCHARS(
                rows_caracteristicas_of_orden_pp,
                "ZCT_PESO_PIEZA",
                "kg",
                ""
              );
              if (WORK_CENTER == "CHAROLAS") {
                ZCT_LONGITUD_PERFIL_M = oThis.filterJsonCHARS(
                  rows_caracteristicas_of_orden_pp,
                  "ZCT_LONGITUD_TRAVESANO",
                  "m",
                  ""
                );
              }
              break;
            case "FUNDICION":
              switch (WORK_CENTER) {
                case "HORHOM01": // 202311
                  if (
                    w_data_row_to_declarar.IR_CANTIDAD_RESTANTE !== undefined
                  ) {
                    IR_CANTIDAD_RESTANTE =
                      1 * w_data_row_to_declarar.IR_CANTIDAD_RESTANTE;
                  }
                  break;

                case "MESAVAC1": // 202310***
                case "CORDES01": // 202310***
                case "CORLIN01": // 202311
                  ZCT_DIAMETRO_BILLET_PULGADAS = oThis.filterJsonCHARS(
                    rows_caracteristicas_of_orden_pp,
                    "ZCT_DIAMETRO_BILLET_PULGADAS",
                    ",",
                    "."
                  );
                  ZCT_LONGITUD_LINGOTE_PLG = oThis.filterJsonCHARS(
                    rows_caracteristicas_of_orden_pp,
                    "ZCT_LONGITUD_LINGOTE_PLG",
                    ",",
                    "."
                  );
                  break;
              }
              break;
            default:
              break;
          }
          //	debugger

          var w_fragmento_ruta =
            "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder"; // 202310_D*
          var w_fragmento_id = "NotificationBascula";

          switch (
          w_dato.AREA_ID // 2023092*
          ) {
            case "ERROR":
              break;

            case "":
              break;

            case "AMARRES":
            case "PINTURA": // 20231204
            case "EMPAQUE": // 20231204
              w_fragmento_ruta =
                "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder_Amarres"; // 202311
              w_fragmento_id = "NotificationBascula_Prensas";
              sw_fragmento_declarar = true;
              break;

            case "VALOR_AGREGADO":
              if (WORK_CENTER.startsWith("SIERR")) {
                w_fragmento_ruta =
                  "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder_VA"; // 202311
                w_fragmento_id = "NotificationBascula_Prensas";
                sw_fragmento_declarar = true;
              }
              if (WORK_CENTER.startsWith("TCONDU")) {
                // 20240703
                w_fragmento_ruta =
                  "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder_Amarres"; // 20240703
                w_fragmento_id = "NotificationBascula_Prensas";
                sw_fragmento_declarar = true;
              }

              switch (
              WORK_CENTER // 20240717
              ) {
                case "BARREN01":
                case "CNCVAG01":
                case "COPLE01":
                case "PRETRO01":
                case "PRETRO02":
                  w_fragmento_ruta =
                    "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder_Amarres"; // 20240703
                  w_fragmento_id = "NotificationBascula_Prensas";
                  sw_fragmento_declarar = true;
                  break;
                default:
                  break;
              }

              break;

            case "PRENSAS":
              sw_fragmento_declarar = true;
              w_fragmento_ruta =
                "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder_Prensas"; // 202311
              w_fragmento_id = "NotificationBascula_Prensas";
              break;

            case "FUNDICION":
              switch (WORK_CENTER) {
                case "HORFUN01":
                case "HORFUN02":
                case "HORNOFD1":
                case "HORNOFD2":
                case "MESAVAC1": // 202310*
                  w_fragmento_ruta =
                    "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder_Fundicion_Hornos"; // 20240627
                  w_fragmento_id = "NotificationBascula_Fundicion_Hornos"; // 20240627
                  sw_fragmento_declarar = true;
                  break;
                case "CORDES01": // 202310***
                case "CORLIN01": // 202311
                  w_fragmento_ruta =
                    "sap.ui.demo.webapp.fragment.PantallaOperador.NotificationOrder_Fundicion_Corte_01"; // 202310***
                  w_fragmento_id = "NotificationBascula_Fundicion_Hornos";
                  sw_fragmento_declarar = true;
                  break;
                default:
                  break;
              }

              break;

            default:
              break;
          }

          if (this.byId("btn_fijarBase").getVisible()) {
            if (
              this.getView()
                .getModel("ModeloUC")
                .getProperty("/NUMERO_UC")
                .toString().length !== 8
            ) {
              MessageBox.error("Debe tener al menos una UC Fijada");
              return;
            }
          }

          this.onCancelNotificationOrder(); // 202309

          var w_load = false;
          if (!this.byId(w_fragmento_id)) {
            w_load = true;
          }

          if (this.byId(w_fragmento_id) == undefined) {
            w_load = true;
          }
          if (sw_fragmento_declarar) {
            // 20240702

            if (this.byId("cantidad_input00") !== undefined)
              this.byId("cantidad_input00").destroy();
            if (this.byId("TC_NRO_CANASTA") !== undefined)
              this.byId("TC_NRO_CANASTA").destroy();
            //	if ( this.byId("NotificationComponent_List") !== undefined ) this.byId("NotificationComponent_List").destroy(); // 20231112
            if (this.byId("label_nro_canasta") !== undefined)
              this.byId("label_nro_canasta").destroy();

            //	if ( this.byId("NotificationComponent_Table") !== undefined ) this.byId("NotificationComponent_Table").destroy();
            if (this.byId("supervisor_noti") !== undefined)
              this.byId("supervisor_noti").destroy(); // 20240625
            if (this.byId("TC_PB") !== undefined) this.byId("TC_PB").destroy();
            if (this.byId("TC_PM") !== undefined) this.byId("TC_PM").destroy();
            if (this.byId("TC_PT") !== undefined) this.byId("TC_PT").destroy();
            if (this.byId("cantidad_input01") !== undefined)
              this.byId("cantidad_input01").destroy();
            if (this.byId("cantidad_input02") !== undefined)
              this.byId("cantidad_input02").destroy();
            if (this.byId("defecto_texto") !== undefined)
              this.byId("defecto_texto").destroy();
            if (this.byId("defecto_c1") !== undefined)
              this.byId("defecto_c1").destroy();
            if (this.byId("defecto_c2") !== undefined)
              this.byId("defecto_c2").destroy();
            if (this.byId("defecto_c3") !== undefined)
              this.byId("defecto_c3").destroy();
          }

          if (w_load) {
            Fragment.load({
              id: oView.getId(),
              name: w_fragmento_ruta,
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              oThis.open_onDeclarar(WORK_CENTER, lote, cantidad);
            });
          } else {
            this.byId(w_fragmento_id).open();
            this.open_onDeclarar(WORK_CENTER, lote, cantidad);
          }
        },

        filterJsonCHARS: function (JSON, CHAR, CHAR_SEARCH, CHAR_REPLACE) {
          var resp = JSON.filter(function (item) {
            return (
              item.CHARACTERISTIC_NAME == CHAR &&
              item.CHARACTERISTIC_VALUE != ""
            );
          });
          console.log(resp);
          var value = resp.length == 0 ? "1" : resp[0].CHARACTERISTIC_VALUE;
          value = value.replace(CHAR_SEARCH, CHAR_REPLACE).replace(" ", "");
          return value;
        },
      }
    );
  }
);
