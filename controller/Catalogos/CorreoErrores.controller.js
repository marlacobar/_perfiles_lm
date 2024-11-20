sap.ui.define(
  [
    "jquery.sap.global",
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/demo/webapp/model/formatter",
    "sap/m/SearchField",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
  ],
  function (
    JQuery,
    BaseController,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator,
    formatter,
    SearchField,
    JSONModel,
    Fragment,
    Export,
    ExportTypeCSV
  ) {
    "use strict";

    var plant_gb = "";
    var a = "";

    return BaseController.extend(
      "sap.ui.demo.webapp.controller.Catalogos.CorreoErrores",
      {
        formatter: formatter,

        onInit: function () {
          var oThis = this;
          var oRouter = this.getRouter();
          oRouter
            .getRoute("CorreoErrores")
            .attachMatched(this._onRouteMatched, this);

          var user = this.onGetUser();
          var oData = {
            USER: user
          };
          this._base_onloadMULTICOMBO(
            "Puesto_Trabajo_select",
            oData,
            "MIIExtensions/Operation/Transaction/get_work_center_user_mii",
            "",
            "Puestos_de_trabajo"
          );
          this._base_onloadCOMBO(
            "cboMensajeSAP",
            oData,
            "MIIExtensions/Operation/Transaction/get_id_msg_sap",
            "",
            "Mensajes SAP"
          );
          this._base_onloadCOMBO(
            "cboNumeroSAP",
            oData,
            "MIIExtensions/Operation/Transaction/get_id_num_sap",
            "",
            "Numero SAP"
          );
          this.onFilterSearch();
        },

        onGetUser: function () {
          var user;
          $.ajax({
            type: "GET",
            url:
              "http://" +
              this.getOwnerComponent().getManifestEntry(
                "/sap.ui5/initData/server"
              ) +
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
          return user;
        },

        ObtenerMensajes: function (oEvent) {
          var oData = {
            WORK_CENTER: "",
            ID_MSG_SAP: "",
            ID_NUM_SAP: "",
          };

          this.CargaTablaGeneral(
            "t_catalogo_errores",
            oData,
            "MII/DatosMaestros/Correo/Transaction/get_mensajes_error",
            "Mensajes",
            ""
          );
        },

        onFilterSearch: function (oEvent) {
          var oThis = this;

          var puesto = oThis
            .getView()
            .byId("Puesto_Trabajo_select")
            .getSelectedKeys();
          var id_msg_sap = oThis
            .getView()
            .byId("cboMensajeSAP")
            .getSelectedKey();
          var id_num_dap = oThis
            .getView()
            .byId("cboNumeroSAP")
            .getSelectedKey();

          var oData = {
            WORK_CENTER: puesto,
            ID_MSG_SAP: id_msg_sap,
            ID_NUM_SAP: id_num_dap,
          };

          //this._base_onloadTable("t_catalogo_errores", oData, "MII/DatosMaestros/Correo/Transaction/get_mensajes_error", "Mensajes", "");
          this.CargaTablaGeneral(
            "t_catalogo_errores",
            oData,
            "MII/DatosMaestros/Correo/Transaction/get_mensajes_error",
            "Mensajes",
            ""
          );
        },

        onActivo: function (oEvent) {
          var oItem, oCtx;
          oItem = oEvent.getSource();
          oCtx = oItem.getBindingContext();
          var id, estado;
          id = oCtx.getProperty("ID");
          estado = oCtx.getProperty("VISIBLE");

          if (estado == true) {
            estado = 1;
          } else {
            estado = 0;
          }

          //Se envían los paros a desagrupar.
          var oData = {
            ID: id,
            VISIBLE: estado,
          };

          var path =
            "MII/DatosMaestros/Correo/Transaction/id_Mensaje_error_update";
          var server =
            "http://" +
            this.getOwnerComponent().getManifestEntry(
              "/sap.ui5/initData/server"
            );
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");

          $.ajax({
            type: "POST",
            dataType: "xml",
            cache: false,
            async: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  //MessageBox.error(aData[0].ERROR);
                } else {
                  //Create  the JSON model and set the data
                  //MessageToast.show(aData[0].MESSAGE);
                }
              } else {
                MessageBox.error(
                  "La solicitud ha fallado: ¿Hay conexión de red?"
                );
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

        onAgregar: function () {
          var oThis = this;

          var puestos = oThis
            .getView()
            .byId("Puesto_Trabajo_select")
            .getSelectedKeys();
          var id_msg_sap = oThis
            .getView()
            .byId("cboMensajeSAP")
            .getSelectedKey();
          var id_num_dap = oThis
            .getView()
            .byId("cboNumeroSAP")
            .getSelectedKey();
          var puestos_desc = oThis
            .getView()
            .byId("Puesto_Trabajo_select")
            .getSelectedItems();
          var descripcion = "";

          if (puestos == "" || id_msg_sap == "" || id_num_dap == "") {
            MessageToast.show("Debe seleccionar todos los campos");
            return;
          }

          //SE ENVÍA PUESTO POR PUESTO.

          sap.ui.core.BusyIndicator.show(0);

          for (var i = 0; i < puestos.length; i++) {
            descripcion =
              puestos_desc[i].getText() +
              " + Monitor de mensajes: Cod.Msg: " +
              id_num_dap +
              " + Nro. SAP: " +
              id_msg_sap;

            //Se envían los codigos a guardar.
            var oData = {
              WORK_CENTER: puestos[i],
              WC_DESCRIPCION: descripcion,
              ID_MSG_SAP: id_msg_sap,
              ID_NUM_SAP: id_num_dap,
            };

            var path =
              "MII/DatosMaestros/Correo/Transaction/id_Mensaje_error_insert";
            var server =
              "http://" +
              this.getOwnerComponent().getManifestEntry(
                "/sap.ui5/initData/server"
              );
            var uri =
              server +
              "/XMII/Runner?Transaction=" +
              path +
              "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, "");

            $.ajax({
              type: "POST",
              dataType: "xml",
              cache: false,
              async: false,
              url: uri,
              data: oData,
            })
              .done(function (xmlDOM) {
                var opElement =
                  xmlDOM.getElementsByTagName("Row")[0].firstChild;

                if (opElement.firstChild !== null) {
                  var aData = eval(opElement.firstChild.data);
                  if (aData[0].ERROR !== undefined) {
                    //MessageBox.error(aData[0].ERROR);
                    //sap.ui.core.BusyIndicator.hide();
                    // return;
                  } else {
                    //Create  the JSON model and set the data

                    MessageToast.show(aData[0].MESSAGE);
                    //sap.ui.core.BusyIndicator.hide();
                    //return;
                  }
                } else {
                  MessageBox.error(
                    "La solicitud ha fallado: ¿Hay conexión de red?"
                  );
                }

                //sap.ui.core.BusyIndicator.hide();
              })
              .fail(function (jqXHR, textStatus, errorThrown) {
                if (console && console.log) {
                  MessageToast.show("La solicitud ha fallado: " + textStatus);
                }
                sap.ui.core.BusyIndicator.hide();
              });
          } //TERMINA EL FOR DE PUESTOS

          sap.ui.core.BusyIndicator.hide();
          this.ObtenerMensajes();
        },

        CargaTablaGeneral: function (Table, oData, path, name, stats_bar) {
          var oView = this.getView(),
            oTable = oView.byId(Table),
            oModel_empty = new sap.ui.model.json.JSONModel(),
            oThis = this;

          //clear table
          oModel_empty.setData({});
          oTable.setModel(oModel_empty);

          var uri =
            "http://" +
            this.getOwnerComponent().getManifestEntry(
              "/sap.ui5/initData/server"
            ) +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");
          console.log(uri);
          oTable.setBusy(true);

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

                if (aData.ITEMS.length > 0) {
                  if (aData.error !== undefined) {
                    oThis.getOwnerComponent().openHelloDialog(aData.error);
                  } else {
                    for (var i = 0; i < aData.ITEMS.length; i++) {
                      if (aData.ITEMS[i].VISIBLE == "0") {
                        aData.ITEMS[i].VISIBLE = false;
                      } else {
                        aData.ITEMS[i].VISIBLE = true;
                      }
                    }

                    //Create  the JSON model and set the data
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(aData);
                    //check if exist a header element
                    if (stats_bar !== "") {
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
                oThis
                  .getOwnerComponent()
                  .openHelloDialog(
                    "La solicitud ha fallado: \u00BFHay conexi\u00F3n con el servidor?"
                  );
              }
              oTable.setBusy(false);
            });
        },

        onBorrar: function () {
          var oThis = this;
          var oTable = this.byId("t_catalogo_errores");
          var id_reg;
          var work_center;
          var id_msg_sap;
          var id_num_sap;

          var id_seleccionado = this.getView()
            .byId("t_catalogo_errores")
            .getSelectedItems().length;

          if (id_seleccionado == 0) {
            MessageToast.show("Debe seleccionar un registro");
            return;
          } else {
            id_reg = oTable
              .getSelectedItem()
              .getBindingContext()
              .getProperty("ID");
            work_center = oTable
              .getSelectedItem()
              .getBindingContext()
              .getProperty("WORK_CENTER");
            id_msg_sap = oTable
              .getSelectedItem()
              .getBindingContext()
              .getProperty("ID_MSG_SAP");
            id_num_sap = oTable
              .getSelectedItem()
              .getBindingContext()
              .getProperty("ID_NUM_SAP");
          }

          //Se envían los paros a desagrupar.
          var oData = {
            ID: id_reg,
            WORK_CENTER: work_center,
            ID_MSG_SAP: id_msg_sap,
            ID_NUM_SAP: id_num_sap,
          };

          var path =
            "MII/DatosMaestros/Correo/Transaction/id_Mensaje_error_delete";
          var server =
            "http://" +
            this.getOwnerComponent().getManifestEntry(
              "/sap.ui5/initData/server"
            );
          var uri =
            server +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");

          sap.ui.core.BusyIndicator.show(0);

          $.ajax({
            type: "POST",
            dataType: "xml",
            cache: false,
            async: false,
            url: uri,
            data: oData,
          })
            .done(function (xmlDOM) {
              var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

              if (opElement.firstChild !== null) {
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data

                  MessageToast.show(aData[0].MESSAGE);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                }
              } else {
                MessageBox.error(
                  "La solicitud ha fallado: ¿Hay conexión de red?"
                );
              }

              sap.ui.core.BusyIndicator.hide();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              if (console && console.log) {
                MessageToast.show("La solicitud ha fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });
          this.onFilterSearch();
        },
      }
    );
  }
);
