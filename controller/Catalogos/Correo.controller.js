var gView;
var gController;
var gUsername;
var gObjRow;

jQuery.sap.registerModulePath("root", "/XMII/CM/MII/App/Piso/MII-Launchpad/");
jQuery.sap.registerModulePath(
  "global",
  "/XMII/CM/MII/App/Piso/MII-Launchpad/js/"
);
jQuery.sap.require("global.xml2json");

jQuery.sap.registerModulePath("global", "/XMII/CM/MII/js/");
jQuery.sap.require("global.functions");

sap.ui.define(
  [
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../../model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    Fragment,
    Filter,
    FilterOperator,
    formatter,
    MessageBox,
    MessageToast
  ) {
    "use strict";
    return BaseController.extend(
      "sap.ui.demo.webapp.controller.Catalogos.Correo",
      {
        formatter: formatter,

        onInit: function () {
          var oRouter = this.getRouter();
          oRouter.getRoute("Correo").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {},
        onBeforeRendering: function () {
          global.functions.getUserAttribs();
        },

        onAfterRendering: function () {
          gView = this.getView();
          gController = gView.getController();
          gController.onGetEmailCatalog();
        },

        onGetEmailCatalog: function () {
          var oModelMailCatalog = new sap.ui.model.json.JSONModel();
          var oPath = "MII/DatosMaestros/Correo/Query/EMAIL_CATALOG_SELECT";
          var url =
            "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" +
            oPath +
            "&Content-Type=text/json";
          var parameters = {};
          oModelMailCatalog.loadData(url, parameters, true, "POST");
          oModelMailCatalog.attachRequestCompleted(function () {
            // IF Fatal Error
            if (oModelMailCatalog.getData().Rowsets.FatalError) {
              // oView.getController().onMessageError(oModelMailCatalog.getData().Rowsets.FatalError, "Error")
              return;
            }

            gView.setModel(oModelMailCatalog, "emailCatalogModel");
            //oView.byId("oBtnModificar").setEnabled(false);
            // oView.byId("oBtnAgregar").setEnabled(false);
            // oView.getController().onEmptyCatalogDetail();
          });
        },

        onAgregarDestinatario: function () {
          alert("onAgregarDestinatario");
        },

        // ## Fragment NUEVO CATALOGO EMAIL
        onOpenDialogNuevoCatalogoEmail: function (oEvent) {
          this.dialogNuevoCatalogoEmail = sap.ui.xmlfragment(
            "nuevoCatalogoEmail",
            "root.fragment.Catalogos.nuevoCatalogoEmail",
            this
          );
          this.getView().addDependent(this.dialogNuevoCatalogoEmail);
          this.dialogNuevoCatalogoEmail.open();

          sap.ui.getCore().byId("nuevoCatalogoEmail--oIdCatalogo").setValue("");
          sap.ui
            .getCore()
            .byId("nuevoCatalogoEmail--oInputDescCatalogo")
            .setValue("");
          sap.ui
            .getCore()
            .byId("nuevoCatalogoEmail--oInputTituloCorreo")
            .setValue("Ejemplo #PARAM.1# Ejemplo #PARAM.2#");
          sap.ui
            .getCore()
            .byId("nuevoCatalogoEmail--oInputGlosaCorreo")
            .setValue("Ejemplo #PARAM.1# Ejemplo #PARAM.2#");
          sap.ui
            .getCore()
            .byId("nuevoCatalogoEmail--oInputPieCorreo")
            .setValue(
              "Este Mensaje fué enviado y creado automáticamente, por favor no responder."
            );
        },

        onCloseDialogNuevoCatalogoEmail: function () {
          this.dialogNuevoCatalogoEmail.destroy();
        },

        onGuardarCatalogoMail: function (oEvent) {
          gView = this.getView();

          // Validaciones
          if (
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oIdCatalogo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("ID de catalogo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oInputDescCatalogo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Descripción Catálogo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oInputTituloCorreo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Título Correo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oInputGlosaCorreo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Glosa Correo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oInputPieCorreo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Pié de Correo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oInputIdIcon")
              .getValue() == ""
          ) {
            gView.getController().onMessageError("Icono es Requerido", "Error");
            return;
          }

          var oTRX =
            "MII/DatosMaestros/Correo/Transaction/EMAIL_CATALOG_INSERT";

          var oParams =
            "&inIdKeyCatalog=" +
            sap.ui.getCore().byId("nuevoCatalogoEmail--oIdCatalogo").getValue();
          oParams +=
            "&inDsKeyCatalog=" +
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oInputDescCatalogo")
              .getValue();
          oParams +=
            "&inDsSubject=" +
            encodeURIComponent(
              sap.ui
                .getCore()
                .byId("nuevoCatalogoEmail--oInputTituloCorreo")
                .getValue()
            );
          oParams +=
            "&inDsBody=" +
            encodeURIComponent(
              sap.ui
                .getCore()
                .byId("nuevoCatalogoEmail--oInputGlosaCorreo")
                .getValue()
            );
          oParams +=
            "&inDsFooter=" +
            encodeURIComponent(
              sap.ui
                .getCore()
                .byId("nuevoCatalogoEmail--oInputPieCorreo")
                .getValue()
            );
          oParams +=
            "&InIdIcon=" +
            sap.ui
              .getCore()
              .byId("nuevoCatalogoEmail--oInputIdIcon")
              .getValue();

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
              gView.getController().onGrabarCatalogoMailResponse(ajaxError);
            },
            success: function (responseUPD) {
              try {
                gView
                  .getController()
                  .onGrabarCatalogoMailResponse($.xml2json(responseUPD));
              } catch (e) {
                var oError = { fatalError: e };
                gView.getController().onGrabarCatalogoMailResponse(oError);
              }
            },
          });
        },

        onGrabarCatalogoMailResponse: function (responseUPD) {
          var objRow = gObjRow;

          if (responseUPD.FatalError) {
            gView
              .getController()
              .onMessageError(responseUPD.FatalError, "Error");
            gView.getController().onGetEmailCatalog();
            return;
          }
          gView
            .getController()
            .onMessageError("Catálogo Guardado Correctamente", "Information");
          gView.getController().onGetEmailCatalog();
          gView.getController().onCloseDialogNuevoCatalogoEmail();
        },

        onOpenDialogDeleteCatalogoEmail: function (oEvent) {
          var index = oEvent.getSource().getParent().getIndex();
          var rowContext = gView
            .byId("oTablaCatalogo")
            .getContextByIndex(index);
          var objRow = rowContext.getObject();
          gObjRow = objRow;

          gView = this.getView();

          var oTRX =
            "MII/DatosMaestros/Correo/Transaction/EMAIL_CATALOG_DELETE";

          var oParams = "&inIdKeyCatalog=" + gObjRow.ID_KEY_CATALOG;

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
              gView.getController().onEliminarCatalogoMailResponse(ajaxError);
            },
            success: function (responseUPD) {
              try {
                gView
                  .getController()
                  .onEliminarCatalogoMailResponse($.xml2json(responseUPD));
              } catch (e) {
                var oError = { fatalError: e };
                gView.getController().onEliminarCatalogoMailResponse(oError);
              }
            },
          });
        },

        onEliminarCatalogoMailResponse: function (responseUPD) {
          var objRow = gObjRow;

          if (responseUPD.FatalError) {
            gView
              .getController()
              .onMessageError(responseUPD.FatalError, "Error");
            gView.getController().onGetEmailCatalog();
            return;
          }
          gView
            .getController()
            .onMessageError("Catalogo eliminado Correctamente", "Information");
          gView.getController().onGetEmailCatalog();
          //gView.getController().onCloseDialogNuevoCatalogoEmail();
        },

        // ## Fragment EDITAR CATALOGO EMAIL
        onOpenDialogEditCatalogoEmail: function (oEvent) {
          var index = oEvent.getSource().getParent().getIndex();
          var rowContext = gView
            .byId("oTablaCatalogo")
            .getContextByIndex(index);
          var objRow = rowContext.getObject();
          gObjRow = objRow;

          this.dialogEditCatalogoEmail = sap.ui.xmlfragment(
            "editarCatalogoEmail",
            "root.fragment.Catalogos.editCatalogoEmail",
            this
          );
          this.getView().addDependent(this.dialogEditCatalogoEmail);
          this.dialogEditCatalogoEmail.open();

          sap.ui
            .getCore()
            .byId("editarCatalogoEmail--oIdCatalogo")
            .setValue(objRow.ID_KEY_CATALOG);
          sap.ui
            .getCore()
            .byId("editarCatalogoEmail--oInputDescCatalogo")
            .setValue(objRow.DS_KEY_CATALOG);
          sap.ui
            .getCore()
            .byId("editarCatalogoEmail--oInputTituloCorreo")
            .setValue(objRow.DS_SUBJECT);
          sap.ui
            .getCore()
            .byId("editarCatalogoEmail--oInputGlosaCorreo")
            .setValue(objRow.DS_BODY);
          sap.ui
            .getCore()
            .byId("editarCatalogoEmail--oInputPieCorreo")
            .setValue(objRow.DS_FOOTER);
        },
        onCloseDialogEditCatalogoEmail: function () {
          this.dialogEditCatalogoEmail.destroy();
        },

        onMessageError: function (pMessage, pType) {
          MessageToast.show(pMessage);
        },

        onActualizarCatalogoMail: function (oEvent) {
          var objRow = gObjRow;

          // Validaciones

          if (
            sap.ui
              .getCore()
              .byId("editarCatalogoEmail--oInputDescCatalogo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Descripción Catálogo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("editarCatalogoEmail--oInputTituloCorreo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Título Correo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("editarCatalogoEmail--oInputGlosaCorreo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Glosa Correo es Requerido", "Error");
            return;
          }
          if (
            sap.ui
              .getCore()
              .byId("editarCatalogoEmail--oInputPieCorreo")
              .getValue() == ""
          ) {
            gView
              .getController()
              .onMessageError("Pié de Correo es Requerido", "Error");
            return;
          }

          var oTRX =
            "MII/DatosMaestros/Correo/Transaction/EMAIL_CATALOG_UPDATE";

          var oParams = "&inIdKeyCatalog=" + objRow.ID_KEY_CATALOG;
          oParams +=
            "&inDsKeyCatalog=" +
            sap.ui
              .getCore()
              .byId("editarCatalogoEmail--oInputDescCatalogo")
              .getValue();
          oParams +=
            "&inDsSubject=" +
            encodeURIComponent(
              sap.ui
                .getCore()
                .byId("editarCatalogoEmail--oInputTituloCorreo")
                .getValue()
            );
          oParams +=
            "&inDsBody=" +
            encodeURIComponent(
              sap.ui
                .getCore()
                .byId("editarCatalogoEmail--oInputGlosaCorreo")
                .getValue()
            );
          oParams +=
            "&inDsFooter=" +
            encodeURIComponent(
              sap.ui
                .getCore()
                .byId("editarCatalogoEmail--oInputPieCorreo")
                .getValue()
            );

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
              gView.getController().onActualizarCatalogoMailResponse(ajaxError);
            },
            success: function (responseUPD) {
              try {
                gView
                  .getController()
                  .onActualizarCatalogoMailResponse($.xml2json(responseUPD));
              } catch (e) {
                var oError = { fatalError: e };
                gView.getController().onActualizarCatalogoMailResponse(oError);
              }
            },
          });
        },

        onActualizarCatalogoMailResponse: function (responseUPD) {
          var objRow = gObjRow;

          if (responseUPD.FatalError) {
            gView
              .getController()
              .onMessageError(responseUPD.FatalError, "Error");
            gView.getController().onGetEmailCatalog();
            return;
          }
          gView
            .getController()
            .onMessageError(
              "Catálogo Actualizado Correctamente",
              "Information"
            );
          gView.getController().onGetEmailCatalog();
          gView.getController().onCloseDialogEditCatalogoEmail();
        },

        // ## Fragment DESTINATARIOS
        onOpenDialogAgregarEmail: function (oEvent) {
          var index = oEvent.getSource().getParent().getIndex();
          var rowContext = gView
            .byId("oTablaCatalogo")
            .getContextByIndex(index);
          var objRow = rowContext.getObject();
          gObjRow = objRow;
          gView.getController().onGetEmailCatalogDetail(gObjRow);

          this.dialogAgregarEmail = sap.ui.xmlfragment(
            "addEmail",
            "root.fragment.Catalogos.agregarEmail",
            this
          );
          this.getView().addDependent(this.dialogAgregarEmail);
          this.dialogAgregarEmail.open();

          sap.ui
            .getCore()
            .byId("addEmail--oDialogEmailDestinatario")
            .setTitle("Lista de distribución :  " + objRow.DS_KEY_CATALOG);
        },
        onCloseDialogAgregarEmail: function () {
          this.dialogAgregarEmail.destroy();
        },

        // ## Fragment MULTIPLES REGISTROS DESTINATARIOS
        onAsignarDestinatarios: function (objRow) {
          var oView = this.getView();

          var oTable = this.getView().byId("oTablaCatalogo");
          var selectedRows = oTable.getSelectedIndices();

          if (selectedRows.length <= 0) {
            MessageToast.show("Debe seleccionar algún catálogo");
            return;
          }

          if (!this.byId("oDialogAsignarDestinatarios")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Catalogos.asignarDestinatarios",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("oDialogAsignarDestinatarios").open();
          }

          this._data = {
            ITEMS: [],
          };

          this.jModel = new sap.ui.model.json.JSONModel();

          for (var i = 0; i < selectedRows.length; i++) {
            var id = selectedRows[i];
            var id_key = oTable.getRows()[id].getCells()[1].getText();
            console.log("id_key" + id_key);

            this._data.ITEMS.push({ DS_KEY_CATALOG: id_key });
          }

          this.jModel.setData(this._data);
          this.byId("oTablaCatalogosSeleccionados").setModel(this.jModel);
          this.jModel.refresh(); //which will add the new record
        },

        onAsignarDestinatarios: function (objRow) {
          var oView = this.getView();
          var othis = this;

          var oTable = this.getView().byId("oTablaCatalogo");
          var selectedRows = oTable.getSelectedIndices();

          if (selectedRows.length <= 0) {
            MessageToast.show("Debe seleccionar algún catálogo");
            return;
          }
          

          if (!this.byId("oDialogAsignarDestinatarios")) {
            Fragment.load({
              id: oView.getId(),
              name: "sap.ui.demo.webapp.fragment.Catalogos.asignarDestinatarios",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
              //invocar funcion
              othis.onDataDestinatarios(oTable,selectedRows);
            });
          } else {
            this.byId("oDialogAsignarDestinatarios").open();
          }
        },
        onDataDestinatarios: function (oTable,selectedRows) {
          
          this._data = {
            ITEMS: [],
          };
          var jModel = new sap.ui.model.json.JSONModel();

          for (var i = 0; i < selectedRows.length; i++) {
            var id = selectedRows[i];
            var id_key = oTable.getRows()[id].getCells()[1].getText();
            console.log("text:" + id_key);
            this._data.ITEMS.push({ DS_KEY_CATALOG: id_key });
            
          }
          jModel.setData(this._data);
          this.byId("oTablaCatalogosSeleccionados").setModel(jModel);
          jModel.refresh(); //which will add the new record
        },

        onCloseDialogAsignarDestinatarios: function () {
          this.byId("oDialogAsignarDestinatarios").destroy();
        },

        onCloseDialogAsignarDestinatarios: function () {
          this.byId("oDialogAsignarDestinatarios").destroy();
        },

        onGetEmailCatalogDetail: function (objRow) {
          var oRow = objRow;

          var oKeyCatalog = oRow.ID_KEY_CATALOG;

          var oModelMailCatalogDetail = new sap.ui.model.json.JSONModel();
          var oPath =
            "MII/DatosMaestros/Correo/Query/EMAIL_CATALOG_DETAIL_SELECT";
          var url =
            "/XMII/Illuminator?service=CombineQueryRowsets&QueryTemplate=" +
            oPath +
            "&Content-Type=text/json";
          var parameters = {
            "Param.2": oKeyCatalog,
          };
          oModelMailCatalogDetail.loadData(url, parameters, true, "POST");
          oModelMailCatalogDetail.attachRequestCompleted(function () {
            // IF Fatal Error
            if (oModelMailCatalogDetail.getData().Rowsets.FatalError) {
              return;
            }

            gView.setModel(oModelMailCatalogDetail, "emailCatalogDetailModel");
          });
        },

        onAsignarEmail: function () {
          if (
            !global.functions.validateEmail(
              sap.ui.getCore().byId("addEmail--oInputEmail").getValue()
            )
          ) {
            gView
              .getController()
              .onMessageError("El Formato de Email no es válido", "Error");
          } else {
            var objRow = gObjRow;

            var oTRX =
              "MII/DatosMaestros/Correo/Transaction/EMAIL_CATALOG_DETAIL_INSERT";

            var oParams = "&inIdKeyCatalog=" + objRow.ID_KEY_CATALOG;
            oParams +=
              "&inDesEmail=" +
              sap.ui.getCore().byId("addEmail--oInputEmail").getValue();

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
                gView.getController().onAsignarEmailResponse(ajaxError);
              },
              success: function (responseINS) {
                try {
                  gView
                    .getController()
                    .onAsignarEmailResponse($.xml2json(responseINS));
                } catch (e) {
                  var oError = { fatalError: e };
                  gView.getController().onAsignarEmailResponse(oError);
                }
              },
            });
          }
        },

        onAgregarDestinatarios: function () {
          var oTable = this.getView().byId("oTablaCatalogo");
          var selectedRows = oTable.getSelectedIndices();
          var cadenaMensajes = "";
          var aSelectedItems = [];

          if (selectedRows.length <= 0) {
            MessageToast.show("Debe seleccionar algún mensaje");
            return;
          }

          for (var i = 0; i < selectedRows.length; i++) {
            var id = selectedRows[i];
            var id_key = oTable.getRows()[id].getCells()[8].getText();
            console.log("id_key 8:" + id_key);
            aSelectedItems.push(id_key);
          }

          //ASIGNA MAIL POR MENSAJE SELECCIONADO
          for (var i = 0; i < aSelectedItems.length; i++) {
            if (
              !global.functions.validateEmail(
                this.getView().byId("InputEmail").getValue()
              )
            ) {
              gView
                .getController()
                .onMessageError("El Formato de Email no es válido", "Error");
            } else {
              var objRow = gObjRow;

              var oTRX =
                "MII/DatosMaestros/Correo/Transaction/EMAIL_CATALOG_DETAIL_INSERT";

              var oParams = "&inIdKeyCatalog=" + aSelectedItems[i];
              oParams +=
                "&inDesEmail=" + this.getView().byId("InputEmail").getValue();

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
                  gView.getController().onAgregarEmailResponse(ajaxError);
                },
                success: function (responseINS) {
                  try {
                    gView
                      .getController()
                      .onAgregarEmailResponse($.xml2json(responseINS));
                  } catch (e) {
                    var oError = { fatalError: e };
                    gView.getController().onAgregarEmailResponse(oError);
                  }
                },
              });
            }
          } // FIN DEL FOR
        },

        onAsignarEmailResponse: function (responseINS) {
          var objRow = gObjRow;

          if (responseINS.FatalError) {
            gView
              .getController()
              .onMessageError(responseINS.FatalError, "Error");
            return;
          }
          gView.getController().onMessageError("Email Asignado", "Error");
          sap.ui.getCore().byId("addEmail--oInputEmail").setValue("");
          gView.getController().onGetEmailCatalogDetail(objRow);
        },

        onAgregarEmailResponse: function (responseINS) {
          if (responseINS.FatalError) {
            gView
              .getController()
              .onMessageError(responseINS.FatalError, "Error");
            return;
          }
          gView.getController().onMessageError("Email Asignado", "Error");
          this.getView().byId("InputEmail").setValue("");
        },

        onDeleteMail: function (oEvent) {
          var index = oEvent.getSource().getParent().getIndex();
          var rowContext = sap.ui
            .getCore()
            .byId("addEmail--oTablaCatalogoDetalle")
            .getContextByIndex(index);
          var objRow = rowContext.getObject();
          objRow = objRow;

          var oTRX =
            "MII/DatosMaestros/Correo/Transaction/EMAIL_CATALOG_DETAIL_DELETE";

          var oParams = "&inIdCatalogoDetalle=" + objRow.ID_CAT_DET;

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
              gView.getController().onDeleteMailResponse(ajaxError);
            },
            success: function (responseDEL) {
              try {
                gView
                  .getController()
                  .onDeleteMailResponse($.xml2json(responseDEL));
              } catch (e) {
                var oError = { fatalError: e };
                gView.getController().onDeleteMailResponse(oError);
              }
            },
          });
        },

        onDeleteMailResponse: function (responseDEL) {
          var objRow = gObjRow;

          if (responseDEL.FatalError) {
            gView
              .getController()
              .onMessageError(responseDEL.FatalError, "Error");
            gView.getController().onGetEmailCatalogDetail(objRow);
            return;
          }

          gView
            .getController()
            .onMessageError("Email eliminado Correctamente", "Information");
          gView.getController().onGetEmailCatalogDetail(objRow);
        },

        onDeleteMailMultiples: function (oEvent) {
          /*
			var oTable = this.getView().byId("oTablaCatalogo");
			var selectedRows = oTable.getSelectedIndices();
			var cadenaMensajes ="";			
			var aSelectedItems = [];
			
			if(selectedRows.length<=0){
				MessageToast.show("Debe seleccionar algún mensaje");
				return;
			};

			for (var i=0; i<selectedRows.length;i++) {

				var id = selectedRows[i];
				var id_key = oTable.getRows()[id].getCells()[6].getText();
					  aSelectedItems.push(id_key);

			}


			//ASIGNA MAIL POR MENSAJE SELECCIONADO
			for(var i=0; i<aSelectedItems.length; i++){

	         var index = oEvent.getSource().getParent().getIndex();
 	         var rowContext = sap.ui.getCore().byId("addEmail--oTablaCatalogoDetalle").getContextByIndex(index);
	         var objRow = rowContext.getObject();
	         objRow = objRow;

		var oTRX = "MII/DatosMaestros/Correo/Transaction/EMAIL_CATALOG_DETAIL_DELETE"

	            var oParams =   "&inIdCatalogoDetalle=" + objRow.ID_CAT_DET

		var oURL = "/XMII/Runner?Transaction=" + oTRX + oParams + "&OutputParameter=OutputXML"

	           $.ajax({	    
				 type: 'POST',       
				 url: oURL,		
				 crossDomain: true,
				 contentType: 'application/json;',
				 dataType: 'xml',
				 error: function (ajaxError){
					gView.getController().onDeleteMailMultipleResponse(ajaxError);
				},
				 success: function(responseDEL) {
          		                      	           try {
						gView.getController().onDeleteMailMultipleResponse($.xml2json(responseDEL) );
                                 	  		       } catch (e) {          
                                   	         			     var oError = {"fatalError":e}
						     gView.getController().onDeleteMailMultipleResponse(oError);
                                  		        }    
				 }	   
			  });   	

			}// FIN DEL FOR
*/
        },

        onDeleteMailMultipleResponse: function (responseDEL) {
          var objRow = gObjRow;

          if (responseDEL.FatalError) {
            gView
              .getController()
              .onMessageError(responseDEL.FatalError, "Error");
            gView.getController().onGetEmailCatalogDetail(objRow);
            return;
          }

          gView
            .getController()
            .onMessageError("Email eliminado Correctamente", "Information");
          gView.getController().onGetEmailCatalogDetail(objRow);
        },
      }
    );
  }
);
