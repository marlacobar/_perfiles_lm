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
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/m/Token",
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
    Spreadsheet,
    ExportTypeCSV,
    Token
  ) {
    "use strict";

    let idUs;
    var SITE = "";

    return BaseController.extend(
      "sap.ui.demo.webapp.controller.Catalogos.supervisoresProd",
      {
        formatter: formatter,

        onInit: function () {
          var oRouter = this.getRouter();
          oRouter
            .getRoute("supervisoresProd")
            .attachMatched(this._onRouteMatched, this);
          this.getWC("username");
          //this._base_onloadTable("Table_areas", {}, "MII/DatosTransaccionales/Paros/Transaction/sel_areas_tabla_1_CEMH", "ÁREAS", "");
        },

        _onRouteMatched: function (oEvent) {
          var oArgs = oEvent.getParameter("arguments");
          SITE = oArgs.planta;
        },

        getWC: function (id) {
          var oThis = this;

          $.ajax({
            type: "GET",
            url:
              "http://" +
              this.getOwnerComponent().getManifestEntry(
                "/sap.ui5/initData/server"
              ) +
              "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
            dataType: "xml",
            cache: false,
            success: function (xml) {
              var nombre = $(xml).find("Profile").attr("firstname");
              var apellido = $(xml).find("Profile").attr("lastname");
              idUs = $(xml).find("Profile").attr("uniquename");
              idUs = idUs.toUpperCase();
              oThis.byId(id).setText(nombre + " " + apellido);
              var oData = {
                USER: idUs,
                SITE: SITE,
              };
              oThis._base_onloadCOMBO(
                "ListEstacion",
                oData,
                "MIIExtensions/Operation/Transaction/get_operations_with_prefix",
                "",
                "Centros"
              );
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              console.log("ERROR");
            },
          });
        },

        onGuardaSupervisor: function () {
          let oView = this.getView();
          let path = "MII/DatosMaestros/Transaction/ins_supervisor_prod";
          let ID_USUARIO, NOMB_USUARIO, WORK_CENTER;
          let funciones;

          WORK_CENTER = oView.byId("ListEstacion").getSelectedKey();
          ID_USUARIO = oView.byId("inputIdSupervisor").getValue().toUpperCase();
          NOMB_USUARIO = oView
            .byId("inputNombSupervisor")
            .getValue()
            .toUpperCase();

          if (WORK_CENTER == "" || WORK_CENTER == null) {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Seleccionar una Estación de Trabajo"
            );
            return;
          }

          if (ID_USUARIO == "" || ID_USUARIO == null) {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Capturar ID Supervisor"
            );
            return;
          }

          if (NOMB_USUARIO == "" || NOMB_USUARIO == null) {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Capturar Nombre Supervisor"
            );
            return;
          }

          let oData = {
            ID_USUARIO: ID_USUARIO,
            NOMB_USUARIO: NOMB_USUARIO,
            WORK_CENTER: WORK_CENTER,
            USUARIO_REG: idUs,
          };

          funciones = ["oThis.limpiaCampos();oThis.onChangeWC();"];

          this.llamadoTransaccion(oData, path, funciones);
        },

        llamadoTransaccion(oData, path, funciones) {
          var uri =
            "http://" +
            this.getOwnerComponent().getManifestEntry(
              "/sap.ui5/initData/server"
            ) +
            "/XMII/Runner?Transaction=" +
            path +
            "&OutputParameter=JsonOutput&Content-Type=text/xml";
          uri = uri.replace(/\s+/g, "");

          sap.ui.core.BusyIndicator.show(0);
          var oThis = this;

          $.ajax({
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
                  oThis.getOwnerComponent().openHelloDialog(aData[0].ERROR);
                } else {
                  MessageToast.show(aData[0].MESSAGE);

                  if (funciones.length > 0) {
                    for (let i = 0; i < funciones.length; i++) {
                      eval(funciones[i]);
                    }
                  }
                }
              } else {
                oThis
                  .getOwnerComponent()
                  .openHelloDialog(
                    "La solicitud ha fallado: �Hay conexi�n de red?"
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

        limpiaCampos: function () {
          //this.byId("ListEstacion").setSelectedKey("");
          this.byId("inputIdSupervisor").setValue("");
          this.byId("inputNombSupervisor").setValue("");
        },

        onChangeWC: function () {
          let work_center = this.byId("ListEstacion").getSelectedKey();

          let oData = {
            WORK_CENTER: work_center,
            SITE: SITE,
          };

          this._base_onloadTable(
            "Table_supervisores",
            oData,
            "MII/DatosMaestros/Transaction/sel_supervisor_prod",
            "Supervisores",
            ""
          );
        },

        onGuardarCambios: function (oEvent) {
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

          let id, idUsuario, nombUsuario, workCenter, activo;

          id = oBindingObject.ID;
          idUsuario = row.getCells()[0].getValue();
          nombUsuario = row.getCells()[1].getValue();
          workCenter = row.getCells()[2].getSelectedKey();
          activo = row.getCells()[3].getState();

          let oData = {
            ID: id,
            ID_USUARIO: idUsuario,
            NOMB_USUARIO: nombUsuario,
            WORK_CENTER: workCenter,
            ACTIVO: activo,
            USUARIO_MOD: idUs,
          };

          let funciones = ["oThis.onChangeWC();"];
          let path = "MII/DatosMaestros/Transaction/upd_supervisor_prod";

          this.llamadoTransaccion(oData, path, funciones);
        },

        onBorrarSupervisor: function (oEvent) {
          let oItem,
            oBindingContext,
            oBindingObject,
            row,
            row_pressed,
            num_array;
          oItem = oEvent.getSource();
          oBindingContext = oItem.getBindingContext();
          oBindingObject = oBindingContext.getObject();

          let id;

          id = oBindingObject.ID;

          let oData = {
            ID: id,
          };

          let funciones = ["oThis.onChangeWC();"];
          let path = "MII/DatosMaestros/Transaction/del_supervisor_prod";

          this.llamadoTransaccion(oData, path, funciones);
        },
      }
    );
  }
);
