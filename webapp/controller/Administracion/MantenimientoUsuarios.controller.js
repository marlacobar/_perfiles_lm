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
    "sap/ui/core/Item",
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
    ExportTypeCSV,
    Item
  ) {
    "use strict";
    var oModelBsc = new sap.ui.model.json.JSONModel();
    var USER = "";
    var SITE = "";
    var USER_GROUP = "";
    var USER_GROUP_BO = "";
    var USER_OR_GROUP_GBO = "";
    var ID_TILE = "";
    var ACTIVO = "";
    var WORK_CENTER = "";

    return BaseController.extend(
      "sap.ui.demo.webapp.controller.Administracion.MantenimientoUsuarios",
      {
        formatter: formatter,

        onInit: function () {
          var oThis = this,
            oView = oThis.getView(),
            oRouter = oThis.getRouter();
          oRouter
            .getRoute("MantenimientoUsuarios")
            .attachMatched(this._onRouteMatched, this);
          oModelBsc.setData(null);
          oView = oThis.getView();
          oView.setModel(oModelBsc, "data");
          this.onInitView();
        },

        _onRouteMatched: function (oEvent) {
          var oArgs = oEvent.getParameter("arguments");
          SITE = oArgs.planta;
        },

        onPressNavToUsuarios: function () {
          var oThis = this;

          this.getSplitAppObj().to(this.createId("detailUsuarios"));
        },

        onPressNavToRoles: function () {
          var oThis = this;
          var oData = {
            SITE: SITE,
          };

          this.getSplitAppObj().to(this.createId("detailRoles"));

          oThis._base_onloadTable(
            "tableUsuarios",
            oData,
            "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios",
            "Usuarios",
            ""
          );
          oThis._base_onloadTable(
            "tableInterfaces",
            oData,
            "MII/DatosTransaccionales/Pedidos/Transaction/get_tiles",
            "Interfaces",
            ""
          );
        },

        onPressNavToCentros: function () {
          var oThis = this;
          var oData = {
            SITE: SITE,
          };

          this.getSplitAppObj().to(this.createId("detailCentros"));

          this._base_onloadTable(
            "tableUsuariosCentro",
            oData,
            "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios",
            "Usuarios",
            ""
          );
        },

        onPressNavToInterfaces: function () {
          var oThis = this;
          var oData = {
            SITE: SITE,
          };

          this.getSplitAppObj().to(this.createId("detailInterfaces"));

          oThis._base_onloadTable(
            "tableRolesInterfaz",
            oData,
            "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
            "Grupos Disponibles",
            ""
          );
        },

        onCopiaNuevoUsuario: function (oEvent) {
          var oThis = this,
            oView = oThis.getView();

          var usuario = oView.byId("input_usuario_buscar").getValue();
          if (usuario === "") {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Ingresar un Usuario"
            );
            return;
          }
          oView.byId("button_recuperar_usuario").setEnabled(false);
          oView.byId("button_grabar_usuario").setText("Grabar");
          oView.byId("input_usuario").setEnabled(true);
          oView.byId("input_usuario").setValue("");
          oView.byId("input_apellido").setValue("");
          oView.byId("input_nombre").setValue("");
          oView.byId("input_direccion").setValue("");
          oView.byId("input_empleado").setValue("");
        },

        onRefreshRoles: function (oEvent) {
          var oData = {
            SITE: SITE,
          };

          this._base_onloadTable(
            "tableRoles",
            oData,
            "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
            "Grupos Disponibles",
            ""
          );
        },

        onRefreshCentrosTrabajo: function (oEvent) {
          var oData = {
            SITE: SITE,
          };

          this._base_onloadTable(
            "tableCentros",
            oData,
            "MII/DatosTransaccionales/Administracion/Transaction/Get_Centros",
            "Centros de Trabajo",
            ""
          );
        },

        onRefreshUsuarios: function (oEvent) {
          var oThis = this;
          var oData = {
            SITE: SITE,
          };

          oThis._base_onloadTable(
            "tableUsuarios",
            oData,
            "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios",
            "Usuarios",
            ""
          );
        },

        onRefreshInterfaces: function (oEvent) {
          var oThis = this;
          var oData = {
            SITE: SITE,
          };

          oThis._base_onloadTable(
            "tableRolesInterfaz",
            oData,
            "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
            "Grupos Disponibles",
            ""
          );
        },

        onLiveChangeUsuarioBuscar: function (oEvent) {
          var oThis = this,
            oView = oThis.getView();

          var sNewValue = oEvent.getParameter("value");
          var valueMayusc = sNewValue.toUpperCase();
          oView.byId("input_usuario_buscar").setValue(valueMayusc);
          oView.byId("input_usuario").setValue(valueMayusc);

          this.byId("button_grabar_usuario").setText("Grabar");
          if (sNewValue != "") {
            this.getView().byId("button_recuperar_usuario").setEnabled(true);
          } else {
            this.getView().byId("button_recuperar_usuario").setEnabled(false);

            oThis.initComboStatusUsuario();
          }
        },

        onLiveChangeUsuario: function (oEvent) {
          var oThis = this,
            oView = oThis.getView();

          var sNewValue = oEvent.getParameter("value");
          var valueMayusc = sNewValue.toUpperCase();
          oView.byId("input_usuario").setValue(valueMayusc);
        },

        onLiveChangeCentro: function (oEvent) {
          var oThis = this,
            oView = oThis.getView();

          var oData = {
            SITE: SITE,
          };

          var sNewValue = oEvent.getParameter("value");
          var valueMayusc = sNewValue.toUpperCase();
          oView.byId("input_centro").setValue(valueMayusc);

          this.byId("button_grabar_centro").setText("Grabar");
          if (sNewValue != "") {
            this.getView().byId("button_recuperar_centro").setEnabled(true);
          } else {
            this.getView().byId("input_descripcion_centro").setValue("");

            this.getView().byId("button_recuperar_centro").setEnabled(false);
          }
        },

        onLiveChangeRol: function (oEvent) {
          var oThis = this,
            oView = oThis.getView();

          var oData = {
            SITE: SITE,
          };

          var sNewValue = oEvent.getParameter("value");
          var valueMayusc = sNewValue.toUpperCase();
          oView.byId("input_rol").setValue(valueMayusc);

          this.byId("button_grabar_rol").setText("Grabar");
          if (sNewValue != "") {
            this.getView().byId("button_recuperar_rol").setEnabled(true);
          } else {
            this.getView().byId("button_recuperar_rol").setEnabled(false);
          }
        },

        onLiveChangeInterfaz: function (oEvent) {
          var oThis = this,
            oView = oThis.getView();

          var oData = {
            SITE: SITE,
          };

          var sNewValue = oEvent.getParameter("value");
          //var valueMayusc = sNewValue.toUpperCase();
          //oView.byId("input_interfaz").setValue(valueMayusc);

          this.byId("button_grabar_interfaz").setText("Grabar");
          if (sNewValue != "") {
            oThis.getView().byId("button_recuperar_interfaz").setEnabled(true);
          } else {
            oView.byId("button_recuperar_interfaz").setEnabled(false);
            oView.byId("button_desactivar_interfaz").setEnabled(false);

            oThis.initComboStatusInterfaz();
          }
        },

        getSplitAppObj: function () {
          var result = this.byId("SplitAppDemo");
          if (!result) {
            Log.info("SplitApp object can't be found");
          }
          return result;
        },

        onValidaUsuario: function () {
          var oView = this.getView();
          var usuario = oView.byId("input_usuario").getValue();
          if (usuario === "") {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Ingresar un Usuario"
            );
            return;
          } else {
            return usuario;
          }
        },

        onValidaCentro: function () {
          var oView = this.getView();
          var centro = oView.byId("input_centro").getValue();
          if (centro === "") {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Ingresar un Centro de Trabajo"
            );
            return;
          } else {
            return centro;
          }
        },

        onValidaRol: function () {
          var oView = this.getView();
          var rol = oView.byId("input_rol").getValue();
          if (rol === "") {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Ingresar un Rol"
            );
            return;
          } else {
            return rol;
          }
        },

        onValidaInterfaz: function () {
          var oView = this.getView();
          var interfaz = oView.byId("input_interfaz").getValue();
          if (interfaz === "") {
            this.getOwnerComponent().openHelloDialog(
              "Favor de Ingresar una Interfaz"
            );
            return;
          } else {
            return interfaz;
          }
        },

        onInitView: function () {
          var oThis = this,
            oView = oThis.getView();

          oView.byId("input_usuario").setValue("");
          oView.byId("input_usuario_buscar").setValue("");
          oView.byId("input_rol").setValue("");
          oView.byId("input_centro").setValue("");
          oView.byId("input_interfaz").setValue("");

          oView.byId("input_apellido").setValue("");
          oView.byId("input_nombre").setValue("");
          oView.byId("input_direccion").setValue("");
          oView.byId("input_empleado").setValue("");

          oView.byId("input_descripcion_rol").setValue("");
          oView.byId("input_descripcion_centro").setValue("");
          oView.byId("input_descripcion_interfaz").setValue("");
          oView.byId("inp_prefijo").setValue("");
          oView.byId("inp_area").setValue("");
          oView.byId("inp_almacenes").setValue("");

          oView.byId("button_grabar_usuario").setText("Grabar");
          oView.byId("button_grabar_rol").setText("Grabar");
          oView.byId("button_grabar_interfaz").setText("Grabar");

          oView.byId("button_recuperar_usuario").setEnabled(false);
          oView.byId("button_recuperar_rol").setEnabled(false);
          oView.byId("button_recuperar_centro").setEnabled(false);
          oView.byId("button_recuperar_interfaz").setEnabled(false);
          oView.byId("button_desactivar_interfaz").setEnabled(false);
          oView.byId("button_desactivar_usuario").setEnabled(false);

          //Limpiar tablas de datos
          var oView = this.getView(),
            oModel_empty = new sap.ui.model.json.JSONModel();
          var Table = [
            "tableRoles",
            "tableUsuarios",
            "tableInterfaces",
            "tableCentros",
            "tableRolesInterfaz",
            "tableUsuariosCentro",
          ];
          for (let i = 0; i < Table.length; i++) {
            eval(oThis.byId(Table[i]).setModel(oModel_empty));
          }

          oThis.initComboStatusUsuario();
          oThis.initComboStatusInterfaz();
        },

        initComboStatusUsuario: function () {
          var oThis = this;
          var itemCombo = new Item();
          itemCombo.setKey("1");
          itemCombo.setText("Activado.");
          oThis.byId("input_status").removeAllItems();
          oThis.byId("input_status").addItem(itemCombo);
          oThis.byId("input_status").setValueState("Success");
          oThis.byId("input_status").setValueStateText("Activado");
          oThis.byId("input_status").setSelectedKey(1);
        },

        initComboStatusInterfaz: function () {
          var oThis = this;
          var itemCombo = new Item();
          itemCombo.setKey("0");
          itemCombo.setText("Activado.");
          oThis.byId("input_status_interfaz").removeAllItems();
          oThis.byId("input_status_interfaz").addItem(itemCombo);
          oThis.byId("input_status_interfaz").setValueState("Success");
          oThis.byId("input_status_interfaz").setValueStateText("Activado");
          oThis.byId("input_status_interfaz").setSelectedKey(0);
        },

        onRecuperar: function () {
          var usuario = this.onValidaUsuario();
          oModelBsc.setData(null);
          var oThis = this,
            oView = oThis.getView();

          if (usuario !== undefined && SITE !== "") {
            var oData = {
              USUARIO: usuario,
              CENTRO: SITE,
            };
            console.log(oData);
            /* var path =
                "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuario";*/
            var path =
              "MII/DatosTransaccionales/Administracion/Transaction/Buscar_Usuario_Illuminator_and_Insert";
            var uri =
              "http://" +
              this.getOwnerComponent().getManifestEntry(
                "/sap.ui5/initData/server"
              ) +
              "/XMII/Runner?Transaction=" +
              path +
              "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, "");

            $.ajax({
              async: false,
              type: "POST",
              crossDomain: true,
              url: uri,
              dataType: "xml",
              cache: false,
              data: oData,
              success: function (xml) {
                var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  MessageBox.error(aData[0].ERROR);
                } else {
                  var res = JSON.parse(opElement.firstChild.data);
                  console.log(res);
                  oModelBsc.setData(res[0]);
                  USER = res[0].USER;
                  oThis.activadoDesactivadoUsuario(res[0].ESTATUS);
                  //DATOS DE USUARIOS

                  oView.byId("input_usuario").setValue(res[0].USER);
                  oView.byId("input_apellido").setValue(res[0].APELLIDO);
                  oView.byId("input_nombre").setValue(res[0].NOMBRE);
                  oView.byId("input_direccion").setValue(res[0].DIRECCION);
                  oView.byId("input_empleado").setValue(res[0].EMPLEADO);

                  SITE = res[0].SITE;
                  USER_OR_GROUP_GBO = res[0].USER_OR_GROUP_GBO;
                  if (USER !== "") {
                    oView.setModel(oModelBsc, "data");
                    var xData = {
                      USER_OR_GROUP_GBO: USER_OR_GROUP_GBO,
                      USER: USER,
                      SITE: SITE,
                    };
                    oThis._base_onloadTable(
                      "tableRoles",
                      xData,
                      "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos_Asignados",
                      "Grupos Disponibles",
                      ""
                    );
                    oThis._base_onloadTable(
                      "tableCentros",
                      xData,
                      "MII/DatosTransaccionales/Administracion/Transaction/Get_Centros_Asignados",
                      "Centros de Trabajo",
                      ""
                    );
                    oView.byId("button_grabar_usuario").setText("Actualizar");
                    oView.byId("button_copia_nuevo_usuario").setEnabled(true);
                  } else {
                    MessageBox.error(
                      "No se encontraron registros de usuarios " + usuario
                    );
                  }
                }
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("ERROR");
              },
            });
          }
        },

        activadoDesactivadoUsuario: function (ACTIVO) {
          var oThis = this;
          oThis.getView().byId("button_desactivar_usuario").setEnabled(true);
          var itemCombo = new Item();
          oThis.byId("input_status").removeAllItems();

          if (ACTIVO === "1") {
            itemCombo.setKey("1");
            itemCombo.setText("Activado.");
            oThis.byId("input_status").addItem(itemCombo);
            oThis.byId("input_status").setValueState("Success");
            oThis.byId("input_status").setValueStateText("Activado");
            oThis.byId("button_desactivar_usuario").setText("Desactivar");
            oThis.byId("button_desactivar_usuario").setType("Attention");
            oThis.byId("input_status").setSelectedKey(1);
          } else {
            itemCombo.setKey("0");
            itemCombo.setText("Desactivado.");
            oThis.byId("input_status").addItem(itemCombo);
            oThis.byId("input_status").setValueState("Warning");
            oThis.byId("input_status").setValueStateText("Desactivado");
            oThis.byId("button_desactivar_usuario").setText("Activar");
            oThis.byId("button_desactivar_usuario").setType("Accept");
            oThis.byId("input_status").setSelectedKey(0);
          }
        },

        onRecuperarCentro: function () {
          var centro = this.onValidaCentro();
          oModelBsc.setData(null);
          var oThis = this,
            oView = oThis.getView();

          oView.setModel(oModelBsc, "dataCentro");

          if (centro !== undefined) {
            var oData = {
              WORK_CENTER: centro,
            };
            console.log(oData);
            var path =
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Centro_Trabajo";
            var uri =
              "http://" +
              this.getOwnerComponent().getManifestEntry(
                "/sap.ui5/initData/server"
              ) +
              "/XMII/Runner?Transaction=" +
              path +
              "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, "");

            $.ajax({
              async: false,
              type: "POST",
              crossDomain: true,
              url: uri,
              dataType: "xml",
              cache: false,
              data: oData,
              success: function (xml) {
                var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  MessageBox.alert(aData[0].ERROR);
                } else {
                  var res = JSON.parse(opElement.firstChild.data);
                  console.log(res);
                  oModelBsc.setData(res[0]);
                  console.log(res[0]);

                  WORK_CENTER = res[0].WORK_CENTER;
                  if (WORK_CENTER !== "") {
                    oView.setModel(oModelBsc, "dataCentro");
                    var xData = {
                      WORK_CENTER: WORK_CENTER,
                      SITE: SITE,
                    };
                    oThis._base_onloadTable(
                      "tableUsuariosCentro",
                      xData,
                      "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios_Asignados_Centro",
                      "Usuarios",
                      ""
                    );
                    oView.byId("button_grabar_centro").setText("Actualizar");
                  } else {
                    MessageBox.error(
                      "No se encontraron registros de centros de trabajo " +
                        centro
                    );
                  }
                }
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("ERROR");
              },
            });
          }
        },

        onRecuperarRol: function () {
          var rol = this.onValidaRol();
          oModelBsc.setData(null);
          var oThis = this;
          var oView = oThis.getView();
          oView.setModel(oModelBsc, "dataGrupo");

          if (rol !== undefined) {
            var oData = {
              USER_GROUP: rol,
            };
            console.log(oData);
            var path =
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupo_Usuario";
            var uri =
              "http://" +
              this.getOwnerComponent().getManifestEntry(
                "/sap.ui5/initData/server"
              ) +
              "/XMII/Runner?Transaction=" +
              path +
              "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, "");

            $.ajax({
              async: false,
              type: "POST",
              crossDomain: true,
              url: uri,
              dataType: "xml",
              cache: false,
              data: oData,
              success: function (xml) {
                var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  MessageBox.alert(aData[0].ERROR);
                } else {
                  var res = JSON.parse(opElement.firstChild.data);
                  console.log(res);
                  oModelBsc.setData(res[0]);

                  console.log(res[0]);

                  USER_GROUP_BO = res[0].USER_GROUP_BO;
                  USER_GROUP = res[0].USER_GROUP;
                  console.log(USER_GROUP);
                  if (USER_GROUP_BO !== "") {
                    oView.setModel(oModelBsc, "dataGrupo");
                    var xData = {
                      USER_GROUP_BO: USER_GROUP_BO,
                      USER_GROUP: USER_GROUP,
                      SITE: SITE,
                    };
                    oThis._base_onloadTable(
                      "tableUsuarios",
                      xData,
                      "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios_Asignados",
                      "Usuarios",
                      ""
                    );
                    oThis._base_onloadTable(
                      "tableInterfaces",
                      xData,
                      "MII/DatosTransaccionales/Administracion/Transaction/Get_Interfaces_Asignadas",
                      "Interfaces",
                      ""
                    );
                    oView.byId("button_grabar_rol").setText("Actualizar");
                  } else {
                    MessageBox.error(
                      "No se encontraron registros de roles " + rol
                    );
                  }
                }
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("ERROR");
              },
            });
          }
        },

        onRecuperarInterfaz: function () {
          var interfaz = this.onValidaInterfaz();
          oModelBsc.setData(null);
          var oThis = this,
            oView = oThis.getView();

          if (interfaz !== undefined) {
            var oData = {
              TILE_KEY: interfaz,
            };
            console.log(oData);
            var path =
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Interfaz";
            var uri =
              "http://" +
              this.getOwnerComponent().getManifestEntry(
                "/sap.ui5/initData/server"
              ) +
              "/XMII/Runner?Transaction=" +
              path +
              "&OutputParameter=JsonOutput&Content-Type=text/xml";
            uri = uri.replace(/\s+/g, "");

            $.ajax({
              async: false,
              type: "POST",
              crossDomain: true,
              url: uri,
              dataType: "xml",
              cache: false,
              data: oData,
              success: function (xml) {
                var opElement = xml.getElementsByTagName("Row")[0].firstChild;
                var aData = eval(opElement.firstChild.data);
                if (aData[0].ERROR !== undefined) {
                  MessageBox.alert(aData[0].ERROR);
                } else {
                  var res = JSON.parse(opElement.firstChild.data);
                  console.log(res);
                  oModelBsc.setData(res[0]);
                  ID_TILE = res[0].ID_TILE;
                  ACTIVO = res[0].ACTIVO;
                  oThis.activadoDesactivadoInterfaz(ACTIVO);

                  if (ID_TILE !== "") {
                    oView.setModel(oModelBsc, "dataInterfaz");
                    var xData = {
                      ID_TILE: ID_TILE,
                      SITE: SITE,
                    };
                    oThis._base_onloadTable(
                      "tableRolesInterfaz",
                      xData,
                      "MII/DatosTransaccionales/Administracion/Transaction/Get_Roles_Asignados_Interfaz",
                      "Roles",
                      ""
                    );
                    oView.byId("button_grabar_interfaz").setText("Actualizar");
                  } else {
                    MessageBox.error(
                      "No se encontraron registros de roles " + interfaz
                    );
                  }
                }
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("ERROR");
              },
            });
          }
        },

        activadoDesactivadoInterfaz: function (ACTIVO) {
          var oThis = this;
          oThis.getView().byId("button_desactivar_interfaz").setEnabled(true);
          var itemCombo = new Item();
          oThis.byId("input_status_interfaz").removeAllItems();

          if (ACTIVO === "1") {
            itemCombo.setKey("0");
            itemCombo.setText("Activado.");
            oThis.byId("input_status_interfaz").addItem(itemCombo);
            oThis.byId("input_status_interfaz").setValueState("Success");
            oThis.byId("input_status_interfaz").setValueStateText("Activado");
            oThis.byId("button_desactivar_interfaz").setText("Desactivar");
            oThis.byId("button_desactivar_interfaz").setType("Attention");
          } else {
            itemCombo.setKey("0");
            itemCombo.setText("Desactivado.");
            oThis.byId("input_status_interfaz").addItem(itemCombo);
            oThis.byId("input_status_interfaz").setValueState("Warning");
            oThis
              .byId("input_status_interfaz")
              .setValueStateText("Desactivado");
            oThis.byId("button_desactivar_interfaz").setText("Activar");
            oThis.byId("button_desactivar_interfaz").setType("Accept");
          }
          oThis.byId("input_status_interfaz").setSelectedKey(0);
        },

        handleValueHelp: function (oEvent) {
          var oThis = this,
            oData,
            oButton = oEvent.getSource(),
            oView = this.getView();

          if (!this._pDialog) {
            this._pDialog = Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Administracion.ValueHelpDialogUsuarios",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._pDialog.then(
            function (oDialog) {
              console.log("SITE" + SITE);

              if (SITE !== "") {
                oData = {
                  SITE: SITE,
                };
              } else {
                MessageBox.error("Debe seleccionar un centro");
                return;
              }
              oThis._base_onloadTable(
                "pDialog",
                oData,
                "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios",
                "Usuarios",
                ""
              );
              oDialog.open();
            }.bind(this)
          );
        },

        handleValueHelpRoles: function (oEvent) {
          var oThis = this,
            oData,
            oButton = oEvent.getSource(),
            oView = this.getView();

          if (!this._gDialog) {
            this._gDialog = Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Administracion.ValueHelpDialogRoles",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._gDialog.then(
            function (oDialog) {
              if (SITE !== "") {
                oData = {
                  SITE: SITE,
                };
              } else {
                MessageBox.error("Debe seleccionar un rol");
                return;
              }
              oThis._base_onloadTable(
                "gDialog",
                oData,
                "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
                "Grupos de Usuario",
                ""
              );
              oDialog.open();
            }.bind(this)
          );
        },

        handleValueHelpCentros: function (oEvent) {
          var oThis = this,
            oData,
            oButton = oEvent.getSource(),
            oView = this.getView();

          if (!this._cDialog) {
            this._cDialog = Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Administracion.ValueHelpDialogCentros",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._cDialog.then(
            function (oDialog) {
              if (SITE !== "") {
                oData = {
                  SITE: SITE,
                };
              } else {
                MessageBox.error("Debe seleccionar un centro");
                return;
              }
              oThis._base_onloadTable(
                "cDialog",
                oData,
                "MII/DatosTransaccionales/Administracion/Transaction/Get_Centros",
                "Centros de Trabajo",
                ""
              );
              oDialog.open();
            }.bind(this)
          );
        },

        handleValueHelpInterfaces: function (oEvent) {
          var oThis = this;
          var xData;
          var oButton = oEvent.getSource(),
            oView = this.getView();

          if (!this._iDialog) {
            this._iDialog = Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Administracion.ValueHelpDialogInterfaces",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }

          this._iDialog.then(
            function (oDialog) {
              oThis._base_onloadTable(
                "iDialog",
                xData,
                "MII/DatosTransaccionales/Pedidos/Transaction/get_tiles",
                "Interfaces",
                ""
              );
              oDialog.open();
            }.bind(this)
          );
        },

        onSelectionChangeUsuario: function (oEvent) {
          if (SITE !== "") {
            var oData = {
              SITE: SITE,
            };
            oThis._base_onloadTable(
              "tableRoles",
              oData,
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
              "Grupos Disponibles",
              ""
            );
            oThis._base_onloadTable(
              "tableCentros",
              oData,
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Centros",
              "Centros de Trabajo",
              ""
            );
            oThis.byId("button_grabar_usuario").setText("Grabar");
            oThis.getView().byId("button_recuperar_usuario").setEnabled(true);
          } else {
            MessageBox.error("Debe seleccionar un centro");
          }
        },

        onSelectionChangeRol: function (oEvent) {
          if (SITE !== "") {
            var oData = {
              SITE: SITE,
            };
            oThis._base_onloadTable(
              "tableUsuarios",
              oData,
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios",
              "Usuarios",
              ""
            );
            oThis._base_onloadTable(
              "tableInterfaces",
              oData,
              "MII/DatosTransaccionales/Pedidos/Transaction/get_tiles",
              "Interfaces",
              ""
            );
            oThis.byId("button_grabar_rol").setText("Grabar");
            oThis.getView().byId("button_recuperar_rol").setEnabled(true);
          } else {
            MessageBox.error("Debe seleccionar un centro");
          }
        },

        onSelectionChangeCentro: function (oEvent) {
          if (SITE !== "") {
            var oData = {
              SITE: SITE,
            };
            oThis._base_onloadTable(
              "tableUsuariosCentro",
              oData,
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios_Asignados_Centro",
              "Usuarios",
              ""
            );
            oThis.byId("button_grabar_centro").setText("Grabar");
            oThis.getView().byId("button_recuperar_centro").setEnabled(true);
          } else {
            MessageBox.error("Debe seleccionar un centro");
          }
        },

        onSelectionChangeInterfaz: function (oEvent) {
          if (SITE !== "") {
            var oData = {
              SITE: SITE,
            };

            oThis._base_onloadTable(
              "tableRolesInterfaz",
              oData,
              "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
              "Grupos Disponibles",
              ""
            );
            oThis.byId("button_grabar_interfaz").setText("Grabar");
            oThis.getView().byId("button_recuperar_interfaz").setEnabled(true);
          } else {
            MessageBox.error("Debe seleccionar un centro");
          }
        },

        handleSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("USER_ID", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([oFilter]);
        },

        handleSearchRoles: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter(
            "USER_GROUP",
            FilterOperator.Contains,
            sValue
          );
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([oFilter]);
        },

        handleSearchInterfaces: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("TILE_KEY", FilterOperator.Contains, sValue); //Por Alias
          var oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([oFilter]);
        },

        handleClose: function (oEvent) {
          var oThis = this;
          var oBinding = oEvent.getSource().getBinding("items");
          console.log(oBinding);
          oBinding.filter([]);

          var aContexts = oEvent.getParameter("selectedContexts");
          console.log(aContexts);
          if (aContexts && aContexts.length) {
            MessageToast.show(
              "Se ha elegido " +
                aContexts
                  .map(function (oContext) {
                    return oContext.getObject().USER_ID;
                  })
                  .join(", ")
            );
            oThis
              .getView()
              .byId("input_usuario")
              .setValue(
                aContexts.map(function (oContext) {
                  return oContext.getObject().USER_ID;
                })
              );

            if (SITE !== "") {
              oThis.onRecuperar();
            } else {
              MessageToast.show("Debe seleccionar un centro");
              return;
            }
          }
        },

        handleCloseRoles: function (oEvent) {
          var oThis = this;
          var oBinding = oEvent.getSource().getBinding("items");
          console.log(oBinding);
          oBinding.filter([]);

          var aContexts = oEvent.getParameter("selectedContexts");
          console.log(aContexts);
          if (aContexts && aContexts.length) {
            MessageToast.show(
              "Se ha elegido " +
                aContexts
                  .map(function (oContext) {
                    return oContext.getObject().USER_GROUP;
                  })
                  .join(", ")
            );
            oThis
              .getView()
              .byId("input_rol")
              .setValue(
                aContexts.map(function (oContext) {
                  return oContext.getObject().USER_GROUP;
                })
              );
            oThis.onRecuperarRol();
          }
        },

        handleCloseCentros: function (oEvent) {
          var oThis = this;
          var oBinding = oEvent.getSource().getBinding("items");
          console.log(oBinding);
          oBinding.filter([]);

          var aContexts = oEvent.getParameter("selectedContexts");
          console.log(aContexts);
          if (aContexts && aContexts.length) {
            MessageToast.show(
              "Se ha elegido " +
                aContexts
                  .map(function (oContext) {
                    return oContext.getObject().WORK_CENTER;
                  })
                  .join(", ")
            );
            oThis
              .getView()
              .byId("input_centro")
              .setValue(
                aContexts.map(function (oContext) {
                  return oContext.getObject().WORK_CENTER;
                })
              );
            oThis.onRecuperarCentro();
          }
        },

        handleCloseInterfaces: function (oEvent) {
          var oThis = this;
          var oBinding = oEvent.getSource().getBinding("items");
          console.log(oBinding);
          oBinding.filter([]);

          var aContexts = oEvent.getParameter("selectedContexts");
          console.log(aContexts);
          if (aContexts && aContexts.length) {
            MessageToast.show(
              "Se ha elegido " +
                aContexts
                  .map(function (oContext) {
                    return oContext.getObject().TILE_KEY;
                  })
                  .join(", ")
            );
            oThis
              .getView()
              .byId("input_interfaz")
              .setValue(
                aContexts.map(function (oContext) {
                  return oContext.getObject().TILE_KEY;
                })
              );
            oThis.onRecuperarInterfaz();
          }
        },

        onGrabarUsuario() {
          var oThis = this;
          if (
            this.getView().byId("button_grabar_usuario").getText() === "Grabar"
          ) {
            console.log("Nuevo");
            oThis.onAgregarUsuario();
          } else {
            console.log("Actualizar");
            oThis.onUpdateUsuario();
          }
        },

        onGrabarRol() {
          var oThis = this;
          if (this.getView().byId("button_grabar_rol").getText() === "Grabar") {
            console.log("Nuevo");
            oThis.onAgregarRol();
          } else {
            console.log("Actualizar");
            oThis.onUpdateRol();
          }
        },

        onGrabarCentro() {
          var oThis = this;
          if (
            this.getView().byId("button_grabar_centro").getText() === "Grabar"
          ) {
            console.log("Nuevo");
            oThis.onAgregarCentro();
          } else {
            console.log("Actualizar");
            oThis.onUpdateCentro();
          }
        },

        onGrabarInterfaz() {
          var oThis = this;
          if (
            this.getView().byId("button_grabar_interfaz").getText() === "Grabar"
          ) {
            console.log("Nuevo");
            oThis.onAgregarInterfaz();
          } else {
            console.log("Actualizar");
            oThis.onUpdateInterfaz();
          }
        },

        onAgregarUsuario: function () {
          var oThis = this,
            oView = oThis.getView(),
            xData,
            usuario = oView.byId("input_usuario").getValue(),
            apellido = oView.byId("input_apellido").getValue(),
            nombre = oView.byId("input_nombre").getValue(),
            direccion = oView.byId("input_direccion").getValue(),
            noEmpleado = oView.byId("input_empleado").getValue();

          if (SITE == "") {
            MessageBox.error("Debe seleccionar un centro");
            return;
          }

          if (usuario == "") {
            MessageBox.error("Debe ingresar un nombre de usuario");
            return;
          }
          var items = this.getView().byId("tableRoles").getSelectedItems();
          var itemsCentros = this.getView()
            .byId("tableCentros")
            .getSelectedItems();

          console.log(itemsCentros);
          console.log(itemsCentros.length);

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un rol");
            return;
          }
          var xml_grupos = "<Rowsets>\n";
          xml_grupos += "<Rowset>\n";
          items.forEach(function (item) {
            xml_grupos += "<Row>\n";
            xml_grupos +=
              "<GRUPO>" + item.getCells()[0].getProperty("text") + "</GRUPO>\n";
            xml_grupos += "</Row>\n";
          });
          xml_grupos += "</Rowset>\n";
          xml_grupos += "</Rowsets>\n";
          console.log(xml_grupos);

          var xml_centros = "<Rowsets>\n";
          xml_centros += "<Rowset>\n";
          itemsCentros.forEach(function (item) {
            xml_centros += "<Row>\n";
            xml_centros +=
              "<CENTRO>" +
              item.getCells()[0].getProperty("text") +
              "</CENTRO>\n";
            xml_centros += "</Row>\n";
          });
          xml_centros += "</Rowset>\n";
          xml_centros += "</Rowsets>\n";
          console.log(xml_centros);
          //}

          //Se envían los datos del usuario
          var oData = {
            USUARIO: usuario,
            NOMBRE: nombre,
            APELLIDO: apellido,
            DIRECCION: direccion,
            EMPLEADO: noEmpleado,
            CENTRO: SITE,
            XML_GRUPOS: xml_grupos,
            XML_CENTROS: xml_centros,
          };

          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Insert_Usuario";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  sap.ui.core.BusyIndicator.hide();
                  oThis._base_onloadTable(
                    "tableUsuarios",
                    xData,
                    "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios",
                    "Usuarios",
                    ""
                  );
                  oThis._base_onloadTable(
                    "tableUsuariosCentro",
                    xData,
                    "MII/DatosTransaccionales/Administracion/Transaction/Get_Usuarios",
                    "Usuarios",
                    ""
                  );
                  oThis.onRecuperar();
                  oView.byId("input_usuario_buscar").setValue("");

                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onUpdateUsuario: function () {
          var oThis = this,
            oView = oThis.getView(),
            xData,
            usuario = oView.byId("input_usuario").getValue(),
            nombre = oView.byId("input_nombre").getValue(),
            apellido = oView.byId("input_apellido").getValue(),
            direccion = oView.byId("input_direccion").getValue(),
            estatus = oView.byId("input_status").getSelectedKey(),
            noEmpleado = oView.byId("input_empleado").getValue();

          if (SITE == "") {
            MessageBox.error("Debe seleccionar un centro");
            return;
          }

          if (usuario == "") {
            MessageBox.error("Debe ingresar un nombre de usuario");
            return;
          }
          var items = this.getView().byId("tableRoles").getSelectedItems();
          var itemsCentros = this.getView()
            .byId("tableCentros")
            .getSelectedItems();

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un rol");
            return;
          }

          var xml_grupos = "<Rowsets>\n";
          xml_grupos += "<Rowset>\n";
          items.forEach(function (item) {
            xml_grupos += "<Row>\n";
            xml_grupos +=
              "<GRUPO>" + item.getCells()[0].getProperty("text") + "</GRUPO>\n";
            xml_grupos += "</Row>\n";
          });
          xml_grupos += "</Rowset>\n";
          xml_grupos += "</Rowsets>\n";
          console.log(xml_grupos);

          var xml_centros = "<Rowsets>\n";
          xml_centros += "<Rowset>\n";
          itemsCentros.forEach(function (item) {
            xml_centros += "<Row>\n";
            xml_centros +=
              "<CENTRO>" +
              item.getCells()[0].getProperty("text") +
              "</CENTRO>\n";
            xml_centros += "</Row>\n";
          });
          xml_centros += "</Rowset>\n";
          xml_centros += "</Rowsets>\n";
          console.log(xml_centros);
          //}

          //Se envían los datos del usuario
          var oData = {
            USUARIO: usuario,
            CENTRO: SITE,
            NOMBRE: nombre,
            APELLIDO: apellido,
            DIRECCION: direccion,
            ESTATUS: estatus,
            EMPLEADO: noEmpleado,
            XML_GRUPOS: xml_grupos,
            XML_CENTROS: xml_centros,
          };

          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Update_Usuario";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  sap.ui.core.BusyIndicator.hide();
                  oThis.onRecuperar();
                  oView.byId("input_usuario_buscar").setValue("");
                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onAgregarRol: function () {
          var oThis = this,
            oView = this.getView(),
            rol = oView.byId("input_rol").getValue(),
            descripcion_rol = oView.byId("input_descripcion_rol").getValue();

          if (SITE == "") {
            MessageBox.error("Debe seleccionar un centro");
            return;
          }

          if (rol == "") {
            MessageBox.error("Debe ingresar un rol");
            return;
          }
          var items = this.getView().byId("tableUsuarios").getSelectedItems();

          var itemsInterfaz = this.getView()
            .byId("tableInterfaces")
            .getSelectedItems();

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un usuario");
            return;
          } else if (itemsInterfaz.length == 0) {
            MessageBox.error("Debe seleccionar una interfaz");
            return;
          } else {
            var xml_usuarios = "<Rowsets>\n";
            xml_usuarios += "<Rowset>\n";
            items.forEach(function (item) {
              xml_usuarios += "<Row>\n";
              xml_usuarios +=
                "<USUARIO>" +
                item.getCells()[0].getProperty("text") +
                "</USUARIO>\n";
              xml_usuarios += "</Row>\n";
            });
            xml_usuarios += "</Rowset>\n";
            xml_usuarios += "</Rowsets>\n";

            var xml_interfaces = "<Rowsets>\n";
            xml_interfaces += "<Rowset>\n";
            itemsInterfaz.forEach(function (item) {
              xml_interfaces += "<Row>\n";
              xml_interfaces +=
                "<ID_TILE>" +
                item.getCells()[0].getProperty("text") +
                "</ID_TILE>\n";
              xml_interfaces += "</Row>\n";
            });
            xml_interfaces += "</Rowset>\n";
            xml_interfaces += "</Rowsets>\n";
            console.log(xml_interfaces);
          }

          //Se envían los datos del usuario
          var oData = {
            GRUPO: rol,
            SITE: SITE,
            DESCRIPCION: descripcion_rol,
            XML_USUARIOS: xml_usuarios,
            XML_INTERFACES: xml_interfaces,
          };
          console.log(oData);
          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Insert_Grupo";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable(
                    "tableRoles",
                    oData,
                    "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
                    "Roles",
                    ""
                  );
                  oThis._base_onloadTable(
                    "tableRolesInterfaz",
                    oData,
                    "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
                    "Roles",
                    ""
                  );
                  sap.ui.core.BusyIndicator.hide();
                  oThis.onRecuperarRol();
                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onUpdateRol: function () {
          var oThis = this,
            oView = this.getView(),
            rol = oView.byId("input_rol").getValue(),
            descripcion_rol = oView.byId("input_descripcion_rol").getValue();

          console.log(descripcion_rol);

          if (SITE.trim() === "") {
            MessageBox.error("Debe seleccionar una planta");
            return;
          }

          if (rol == "") {
            MessageBox.error("Debe ingresar un rol");
            return;
          }
          var items = this.getView().byId("tableUsuarios").getSelectedItems();
          console.log(items);
          console.log(items.length);

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un usuario");
            return;
          } else {
            var xml_usuarios = "<Rowsets>\n";
            xml_usuarios += "<Rowset>\n";
            items.forEach(function (item) {
              xml_usuarios += "<Row>\n";
              xml_usuarios +=
                "<USUARIO>" +
                item.getCells()[0].getProperty("text") +
                "</USUARIO>\n";
              xml_usuarios += "</Row>\n";
            });
            xml_usuarios += "</Rowset>\n";
            xml_usuarios += "</Rowsets>\n";
            console.log(xml_usuarios);
          }

          var items2 = this.getView()
            .byId("tableInterfaces")
            .getSelectedItems();
          console.log(items2);
          console.log(items2.length);

          if (items2.length == 0) {
            MessageBox.error("Debe seleccionar una interfaz");
            return;
          } else {
            var xml_tiles = "<Rowsets>\n";
            xml_tiles += "<Rowset>\n";
            items2.forEach(function (item) {
              xml_tiles += "<Row>\n";
              xml_tiles +=
                "<ID_TILE>" +
                item.getCells()[0].getProperty("text") +
                "</ID_TILE>\n";
              xml_tiles += "</Row>\n";
            });
            xml_tiles += "</Rowset>\n";
            xml_tiles += "</Rowsets>\n";
            console.log(xml_tiles);
          }

          //Se envían los datos del usuario
          var oData = {
            GRUPO: rol,
            SITE: SITE,
            DESCRIPCION: descripcion_rol,
            XML_USUARIOS: xml_usuarios,
            XML_TILES: xml_tiles,
          };

          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Update_Grupo";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  sap.ui.core.BusyIndicator.hide();
                  oThis.onRecuperarRol();
                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onAgregarCentro: function () {
          var oThis = this,
            oView = this.getView(),
            centro = oView.byId("input_centro").getValue(),
            xData;

          if (centro == "") {
            MessageBox.error("Debe ingresar un Centro de trabajo");
            return;
          }
          var items = this.getView()
            .byId("tableUsuariosCentro")
            .getSelectedItems();
          console.log(items);
          console.log(items.length);

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un usuario");
            return;
          } else {
            var xml_usuarios = "<Rowsets>\n";
            xml_usuarios += "<Rowset>\n";
            items.forEach(function (item) {
              xml_usuarios += "<Row>\n";
              xml_usuarios +=
                "<USUARIO>" +
                item.getCells()[0].getProperty("text") +
                "</USUARIO>\n";
              xml_usuarios += "</Row>\n";
            });
            xml_usuarios += "</Rowset>\n";
            xml_usuarios += "</Rowsets>\n";
            console.log(xml_usuarios);
          }

          //Se envían los datos del usuario
          var oData = {
            GRUPO: centro,
            XML_USUARIOS: xml_usuarios,
          };

          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Insert_Centro_Trabajo";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  sap.ui.core.BusyIndicator.hide();
                  oThis.onRecuperarCentro();
                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onUpdateCentro: function () {
          var oThis = this,
            oView = this.getView(),
            centro = oView.byId("input_centro").getValue(),
            descripcion_centro = oView
              .byId("input_descripcion_centro")
              .getValue(),
            almacen = oView.byId("inp_almacenes").getValue(),
            area = oView.byId("inp_area").getValue(),
            prefijo = oView.byId("inp_prefijo").getValue(),
            xData;

          if (centro == "") {
            MessageBox.error("Debe ingresar un centro de trabajo");
            return;
          }
          var items = this.getView()
            .byId("tableUsuariosCentro")
            .getSelectedItems();
          console.log(items);
          console.log(items.length);

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un usuario");
            return;
          } else {
            var xml_usuarios = "<Rowsets>\n";
            xml_usuarios += "<Rowset>\n";
            items.forEach(function (item) {
              xml_usuarios += "<Row>\n";
              xml_usuarios +=
                "<USUARIO>" +
                item.getCells()[0].getProperty("text") +
                "</USUARIO>\n";
              xml_usuarios += "</Row>\n";
            });
            xml_usuarios += "</Rowset>\n";
            xml_usuarios += "</Rowsets>\n";
            console.log(xml_usuarios);
          }

          //Se envían los datos del usuario
          var oData = {
            CENTRO: centro,
            DESCRIPCION: descripcion_centro,
            ALMACEN: almacen,
            AREA: area,
            PREFIJO: prefijo,
            XML_USUARIOS: xml_usuarios,
          };

          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Update_Centro";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  sap.ui.core.BusyIndicator.hide();
                  oThis.onRecuperarCentro();
                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onAgregarInterfaz: function () {
          var oThis = this,
            oView = this.getView(),
            interfaz = oView.byId("input_interfaz").getValue(),
            descripcion_interfaz = oView
              .byId("input_descripcion_interfaz")
              .getValue(),
            xData;

          if (interfaz == "") {
            MessageBox.error("Debe ingresar una interfaz");
            return;
          }
          var items = this.getView()
            .byId("tableRolesInterfaz")
            .getSelectedItems();
          console.log(items);
          console.log(items.length);

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un rol");
            return;
          } else {
            var xml_roles = "<Rowsets>\n";
            xml_roles += "<Rowset>\n";
            items.forEach(function (item) {
              xml_roles += "<Row>\n";
              xml_roles +=
                "<ROL>" + item.getCells()[0].getProperty("text") + "</ROL>\n";
              xml_roles += "</Row>\n";
            });
            xml_roles += "</Rowset>\n";
            xml_roles += "</Rowsets>\n";
            console.log(xml_roles);
          }

          //Se envían los datos de la interfaz
          var oData = {
            INTERFAZ: interfaz,
            DESCRIPCION: descripcion_interfaz,
            XML_ROLES: xml_roles,
          };

          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Insert_Interfaz";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  oThis._base_onloadTable(
                    "tableRoles",
                    xData,
                    "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
                    "Roles",
                    ""
                  );
                  oThis._base_onloadTable(
                    "tableRolesInterfaz",
                    xData,
                    "MII/DatosTransaccionales/Administracion/Transaction/Get_Grupos",
                    "Roles",
                    ""
                  );
                  sap.ui.core.BusyIndicator.hide();
                  oThis.onRecuperarInterfaz();
                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onUpdateInterfaz: function () {
          var oThis = this,
            oView = this.getView(),
            interfaz = oView.byId("input_interfaz").getValue(),
            descripcion_interfaz = oView
              .byId("input_descripcion_interfaz")
              .getValue(),
            xData;

          if (interfaz == "") {
            MessageBox.error("Debe ingresar una interfaz");
            return;
          }
          var items = this.getView()
            .byId("tableRolesInterfaz")
            .getSelectedItems();
          console.log(items);
          console.log(items.length);

          if (items.length == 0) {
            MessageBox.error("Debe seleccionar un rol");
            return;
          } else {
            var xml_roles = "<Rowsets>\n";
            xml_roles += "<Rowset>\n";
            items.forEach(function (item) {
              xml_roles += "<Row>\n";
              xml_roles +=
                "<ROL>" + item.getCells()[0].getProperty("text") + "</ROL>\n";
              xml_roles += "</Row>\n";
            });
            xml_roles += "</Rowset>\n";
            xml_roles += "</Rowsets>\n";
            console.log(xml_roles);
          }

          //Se envían los datos de la interfaz
          var oData = {
            INTERFAZ: interfaz,
            DESCRIPCION: descripcion_interfaz,
            XML_ROLES: xml_roles,
          };

          sap.ui.core.BusyIndicator.show(0);

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Update_Interfaz";
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
                  MessageBox.error(aData[0].ERROR);
                  sap.ui.core.BusyIndicator.hide();
                  return;
                } else {
                  //Create  the JSON model and set the data
                  MessageToast.show(aData[0].MESSAGE);
                  sap.ui.core.BusyIndicator.hide();
                  oThis.onRecuperarInterfaz();
                  return;
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
                MessageToast.show("La solicitud a fallado: " + textStatus);
              }
              sap.ui.core.BusyIndicator.hide();
            });

          sap.ui.core.BusyIndicator.hide();
        },

        onDeleteCentro: function () {
          var oThis = this,
            oView = oThis.getView();
          var centro = oView.byId("input_centro").getValue();

          if (centro == "") {
            MessageBox.error("Debe ingresar un nombre de Centro de Trabajo");
            return;
          }

          var oTRX =
            "MII/DatosTransaccionales/Administracion/Transaction/Delete_Centro";

          var oParams = "&centro=" + centro;

          var oURL =
            "/XMII/Runner?Transaction=" +
            oTRX +
            oParams +
            "&OutputParameter=OutputXML";

          $.ajax({
            type: "POST",
            url: oURL,
            crossDomain: true,
            contentType: "application/json;",
            dataType: "xml",
            error: function (ajaxError) {
              oView.getController().onDeleteUserResponse(ajaxError);
            },
            success: function (xmlDOM) {
              var status =
                xmlDOM.getElementsByTagName("ERR_COD")[0].firstChild.data;
              var dsStatus =
                xmlDOM.getElementsByTagName("ERR_MSG")[0].firstChild.data;
              if (status == "0") {
                MessageBox.success(dsStatus);
                oThis.onInitView();
              } else {
                MessageBox.error(dsStatus);
              }
            },
          });
        },

        onDeleteUsuario: function () {
          var oThis = this,
            oView = oThis.getView();
          var usuario = oView.byId("input_usuario").getValue();

          if (usuario == "") {
            MessageBox.error("Debe ingresar un nombre de usuario");
            return;
          }

          var oTRX =
            "MII/DatosTransaccionales/Administracion/Transaction/Delete_Usuario";

          var oParams = "&usuario=" + usuario + "&centro=" + SITE;

          var oURL =
            "/XMII/Runner?Transaction=" +
            oTRX +
            oParams +
            "&OutputParameter=OutputXML";

          $.ajax({
            type: "POST",
            url: oURL,
            crossDomain: true,
            contentType: "application/json;",
            dataType: "xml",
            error: function (ajaxError) {
              oView.getController().onDeleteUserResponse(ajaxError);
            },
            success: function (xmlDOM) {
              var status =
                xmlDOM.getElementsByTagName("ERR_COD")[0].firstChild.data;
              var dsStatus =
                xmlDOM.getElementsByTagName("ERR_MSG")[0].firstChild.data;
              if (status == "0") {
                MessageBox.success(dsStatus);
                oThis.onInitView();
              } else {
                MessageBox.error(dsStatus);
              }
            },
          });
        },

        onDeleteRol: function () {
          var oThis = this,
            oView = oThis.getView(),
            rol = oView.byId("input_rol").getValue();

          var oData = {
            GRUPO: rol,
            SITE: SITE,
          };

          if (rol == "") {
            MessageBox.error("Debe ingresar un nombre de rol");
            return;
          }

          var path =
            "MII/DatosTransaccionales/Administracion/Transaction/Delete_Grupo";

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
                xmlDOM.getElementsByTagName("Message")[0].firstChild.data;
              console.log(opElement);

              if (opElement !== null) {
                if (opElement !== "TRANSACTION EXECUTED OK") {
                  MessageBox.error(opElement);
                } else {
                  MessageToast.show("Rol eliminado");
                }
                oThis.onInitView();
              } else {
                MessageToast.show("No se han recibido datos");
              }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              oView.getController().onDeleteRolResponse(errorThrown);
            });
        },

        onDeleteRolResponse: function (responseDEL) {
          var oView = this.getView(),
            oRowsets = responseDEL.getElementsByTagName("Rowsets")[0],
            oFatalError = oRowsets.getElementsByTagName("FatalError")[0];

          if (oFatalError) {
            if (oFatalError.firstChild !== undefined) {
              oView
                .getController()
                .onMessageError(oFatalError.firstChild.data, "Error");
              return;
            } else {
              oView
                .getController()
                .onMessageError("Rol eliminado Correctamente", "Information");
              this.onInitView();
              return;
            }
          }
        },

        onMessageError: function (pMessage, pType) {
          MessageToast.show(pMessage);
        },

        onActivarDesactivarUsuario: function () {
          var oThis = this;
          var oView = this.getView();
          var usuario = oView.byId("input_usuario").getValue();

          if (usuario == "") {
            MessageBox.error("Debe ingresar un usuario");
            return;
          }

          var oTRX =
            "MII/DatosTransaccionales/Administracion/Transaction/Activar_Desactivar_Usuario";

          var oParams = "&usuario=" + usuario + "&site" + SITE;

          var oURL =
            "/XMII/Runner?Transaction=" +
            oTRX +
            oParams +
            "&OutputParameter=OutputXML";

          $.ajax({
            type: "POST",
            url: oURL,
            crossDomain: true,
            contentType: "application/json;",
            dataType: "xml",
            error: function (ajaxError) {
              oView.getController().onDesactivarUsuarioResponse(ajaxError);
            },
            success: function (xmlDOM) {
              var status =
                xmlDOM.getElementsByTagName("ERR_COD")[0].firstChild.data;
              var dsStatus =
                xmlDOM.getElementsByTagName("ERR_MSG")[0].firstChild.data;
              if (status == "0") {
                MessageBox.success(dsStatus);
                oThis.onRecuperar();
              } else {
                MessageBox.error(dsStatus);
              }
            },
          });
        },

        onDesactivarUsuarioResponse: function (responseDEL) {
          var oView = this.getView();

          if (responseDEL.FatalError) {
            oView
              .getController()
              .onMessageError(responseDEL.FatalError, "Error");
            return;
          }

          oView
            .getController()
            .onMessageError("Usuario desactivado Correctamente", "Information");
          this.onInitView();
        },

        onActivarDesactivarInterfaz: function () {
          var oThis = this;
          var oView = this.getView();
          var interfaz = oView.byId("input_interfaz").getValue();

          if (interfaz == "") {
            MessageBox.error("Debe ingresar una interfaz");
            return;
          }

          var oTRX =
            "MII/DatosTransaccionales/Administracion/Transaction/Activar_Desactivar_Interfaz";

          var oParams = "&interfaz=" + interfaz;

          var oURL =
            "/XMII/Runner?Transaction=" +
            oTRX +
            oParams +
            "&OutputParameter=OutputXML";

          $.ajax({
            type: "POST",
            url: oURL,
            crossDomain: true,
            contentType: "application/json;",
            dataType: "xml",
            error: function (ajaxError) {
              oView.getController().onDesactivarInterfazResponse(ajaxError);
            },
            success: function (xmlDOM) {
              var status =
                xmlDOM.getElementsByTagName("ERR_COD")[0].firstChild.data;
              var dsStatus =
                xmlDOM.getElementsByTagName("ERR_MSG")[0].firstChild.data;
              if (status == "0") {
                MessageBox.success(dsStatus);
                oThis.onRecuperarInterfaz();
              } else {
                MessageBox.error(dsStatus);
              }
            },
          });
        },

        onDesactivarInterfazResponse: function (responseDEL) {
          var oView = this.getView();

          if (responseDEL.FatalError) {
            oView
              .getController()
              .onMessageError(responseDEL.FatalError, "Error");
            return;
          }

          oView
            .getController()
            .onMessageError(
              "Interfaz desactivada Correctamente",
              "Information"
            );
          this.onInitView();
        },

        obtenerAlmacenes: function (oEvent) {
          var oView = this.getView();
          var oThis = this;
          var oData = {
            CD_PLANTA: SITE,
          };
          if (!this.byId("tsd_almacenes")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Administracion.Almacenes",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              oThis.enlistarAlmacenes(oData);
            });
          } else {
            this.byId("tsd_almacenes").open();
            this.enlistarAlmacenes(oData);
          }
        },

        enlistarAlmacenes: function (oData) {
          var path =
            " MII/DatosTransaccionales/Administracion/Transaction/Almacenes_Lista";
          var tabla = "tsd_almacenes";
          var nombre = "Almacenes";
          this._base_onloadTable(tabla, oData, path, nombre, "");
        },

        confirmarAlmacen: function (oEvent) {
          var aContexts = oEvent.getParameter("selectedContexts");
          if (aContexts && aContexts.length) {
            var elemento = aContexts.map(function (oContext) {
              return {
                codigo: oContext.getObject().CD_ALMACEN,
                descripcion: oContext.getObject().DS_ALMACEN,
              };
            });
            this.byId("inp_almacenes").setValue(elemento[0].codigo);
            oEvent.getSource().destroy();
          }
        },

        cancelarTSD: function (oEvent) {
          oEvent.getSource().destroy();
        },

        filtroAlmacen: function (oEvent) {
          var aFilters = [];
          var sQuery = oEvent.getParameter("value");
          if (sQuery && sQuery.length > 0) {
            aFilters = new Filter({
              filters: [
                new Filter(
                  "CD_ALMACEN",
                  sap.ui.model.FilterOperator.Contains,
                  sQuery
                ),
                new Filter(
                  "DS_ALMACEN",
                  sap.ui.model.FilterOperator.Contains,
                  sQuery
                ),
              ],
            });
          }

          var list = this.byId(oEvent.getSource().getId().split("--")[2]);
          var binding = list.getBinding("items");
          binding.filter(aFilters, "Application");
        },

        obtenerAreas: function (oEvent) {
          var oView = this.getView();
          var oThis = this;
          var oData = {
            CD_PLANTA: SITE,
          };
          if (!this.byId("tsd_areas")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Administracion.Areas",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              oThis.enlistarAreas(oData);
            });
          } else {
            this.byId("tsd_areas").open();
            this.enlistarAreas(oData);
          }
        },

        enlistarAreas: function (oData) {
          var path =
            " MII/DatosTransaccionales/Administracion/Transaction/Areas_Lista";
          var tabla = "tsd_areas";
          var nombre = "Areas";
          this._base_onloadTable(tabla, oData, path, nombre, "");
        },

        confirmarArea: function (oEvent) {
          var aContexts = oEvent.getParameter("selectedContexts");
          if (aContexts && aContexts.length) {
            var elemento = aContexts.map(function (oContext) {
              return {
                codigo: oContext.getObject().CD_AREA,
                descripcion: oContext.getObject().DS_AREA,
              };
            });
            this.byId("inp_area").setValue(elemento[0].codigo);
            oEvent.getSource().destroy();
          }
        },

        filtroArea: function (oEvent) {
          var aFilters = [];
          var sQuery = oEvent.getParameter("value");
          if (sQuery && sQuery.length > 0) {
            aFilters = new Filter({
              filters: [
                new Filter(
                  "CD_AREA",
                  sap.ui.model.FilterOperator.Contains,
                  sQuery
                ),
                new Filter(
                  "DS_AREA",
                  sap.ui.model.FilterOperator.Contains,
                  sQuery
                ),
              ],
            });
          }

          var list = this.byId(oEvent.getSource().getId().split("--")[2]);
          var binding = list.getBinding("items");
          binding.filter(aFilters, "Application");
        },
        onlyNumeric: function (oEvent) {
          var _oInput = oEvent.getSource();
          var val = _oInput.getValue();
          val = val.replace(/[^\d]/g, "");
          _oInput.setValue(val);
        },

        onlyNumericDecimal: function (oEvent) {
          var _oInput = oEvent.getSource();
          var val = _oInput.getValue();
          var arrayVal = val.split(".");
          val = arrayVal[0].replace(/[^\d]/g, "");

          if (arrayVal.length > 0)
            val += "." + arrayVal[1].replace(/[^\d]/g, "");

          if (arrayVal.length > 1) val += arrayVal[2].replace(/[^\d]/g, "");

          _oInput.setValue(val);
        },
      }
    );
  }
);
