sap.ui.define([
    "sap/ui/demo/webapp/controller/BaseController"

], function (BaseController) {
    "use strict";
    return BaseController.extend("sap.ui.demo.webapp.controller.Home", {

        onInit: function () {
            this._base_onloadCOMBO("ListPlanta", {}, "MII/DatosTransaccionales/Funciones/Plantas_Select", "", "Centros");
            this._getVersion()
        },

        onAfterRendering: function () {
            var oPlantFilter = this.byId("ListPlanta");
            //console.log(oPlantFilter.getFirstItem().getKey());
            if (oPlantFilter.getFirstItem() !== null) {
                if (oPlantFilter.getFirstItem().getKey() !== "") {
                    oPlantFilter.setSelectedItem(oPlantFilter.getFirstItem());
                } else {
                    oPlantFilter.setSelectedKey('LM00');
                }
            }
            this.getUsuario_login("username");
        },

        obtenerModeloVistaHome: function (planta, usuario) {
            var oData = {
                "CD_PLANTA": planta,
                "RUTA": "Home",
                "USUARIO": usuario.toLowerCase()
            };
            var path = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ModeloVista_Obtener";
            //this._setModeloObjetos(oData, path);
            this._setModelo(oData, path);
        },

        onRoles: function (path, oData) {

            var Othis = this;
            //            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=*&Content-Type=text/xml"
            var uri = "http://" + this.getServerHost() + "/XMII/Runner?Transaction=" + path + "&OutputParameter=*&Content-Type=text/xml"

            $.ajax({
                    type: "POST",
                    dataType: "xml",
                    cache: false,
                    url: uri,
                    data: oData
                })
                .done(function (xmlDOM) {
                    console.log(xmlDOM);
                    var tile;
                    $(xmlDOM).find('Row').each(function () {
                        tile = $(this).find('TILE_KEY').text();
                        if (Othis.byId(tile))
                            Othis.byId(tile).setVisible(true);
                    });


                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexion de red?");
                    }
                });

        },

        getUsuario_login: function (id) {
            var oThis = this,
                oPlantFilter = oThis.byId("ListPlanta");
            console.log(oPlantFilter.getFirstItem());
            if (oPlantFilter !== undefined) {
                var idPlanta = oThis.byId("ListPlanta").getSelectedKey();
                console.log(idPlanta);
            }
            $.ajax({
                type: "GET",
                //url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") +  "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                url: "http://" + this.getServerHost() + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",

                dataType: "xml",
                cache: false,
                success: function (xml) {
                    console.log(xml);
                    var nombre = $(xml).find('Profile').attr('firstname').toUpperCase();
                    var apellido = $(xml).find('Profile').attr('lastname').toUpperCase();
                    var usuario = $(xml).find('Profile').attr('uniquename').toUpperCase();
                    oThis.byId(id).setText(usuario + ' ' + nombre + ' ' + apellido);
                    var oData = {
                        "USER": usuario,
                        // "SITE": idPlanta
                    }
                    console.log(oData);
                    oThis.onRoles("MIIExtensions/General/Transaction/sel_tiles_user", oData);
                    oThis.obtenerModeloVistaHome(idPlanta, usuario)

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },

        logoff: function () {
            var oThis = this;
            $.ajax({
                type: "GET",
                async: false,
                url: "/XMII/Illuminator?service=Logout",
            }).done(function (data) {
                /*if (!document.execCommand("ClearAuthenticationCache")) {
                window.localStorage.clear()
                $.ajax({
                    type: "GET",
                    url: "/XMII/Illuminator?service=Logout", 
                    error: function () {
                    }
                });
                }*/
                location.reload();
            });

        },

        onPanelOperador() {
            this.getRouter().navTo("panelOperador");
        },

        //Mantenimiento
        onVerAvisos() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("verAvisos", {
                    "planta": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        onVerOrdenes() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("verOrdenes", {
                    "planta": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },

        onMantenimientoUsuarios() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("MantenimientoUsuarios", {
                    "planta": idPlanta
                });

            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }

        },
        onGotoConfiguracionObjetosMII() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("ConfiguracionObjetosMII", {
                    "planta": idPlanta
                });
            }
        },

        onAdminContenedor() {
            this.getRouter().navTo("AdminContenedor");
        },

        onListaCorreo() {
            this.getRouter().navTo("Correo");
        },

        onListaCorreoErrores() {
            this.getRouter().navTo("CorreoErrores");
        },

        onListaCorreoErrores() {
            this.getRouter().navTo("CorreoErrores");
        },

        onSupervisoresProd() {

            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("supervisoresProd", {
                    "planta": idPlanta
                });

            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }

        },

        onCaractPantOperador() {
            this.getRouter().navTo("caractPantOperador");
        },

        oncertificado_nuevo() {
            this.getRouter().navTo("certificado_nuevo");
        },

        onAvisosCalidadCrear() {
            this.getRouter().navTo("AvisosCalidadCrear");
        },
        OnInspeccionPT() {
            this.getRouter().navTo("InspeccionCalidadPT");
        },
        OnInspeccionMP() {
            this.getRouter().navTo("InspeccionCalidadMP");
        },
        onInspeccion03() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("InspeccionCalidad03", {
                    "planta": idPlanta
                });
            }

        },
        onInspeccion09() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("InspeccionCalidad09", {
                    "planta": idPlanta
                });
            }

        },
        on_ver_revision_lotes() {
            this.getRouter().navTo("revision_lotes");
        },

        onPenalizaciones() {
            this.getRouter().navTo("PenalizacionesTransporte");
        },
        onRegistroTransportista() {
            this.getRouter().navTo("registroTransportista");
        },
        onBasculaNuevo() {
            this.getRouter().navTo("BasculaNuevo");
        },
        on_revision_lotes_offline() {
            this.getRouter().navTo("revision_lotes_offline");
        },
        onTraduccion() {
            this.getRouter().navTo("traduccionValores");
        },
        onDefectos() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("Defectos_Rep");
            }
        },
        onReporteCali() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("ReporteCalidad", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        onCheckList_Act() {
            this.getRouter().navTo("CheckList_Actividades");
        },
        onCheckList() {
            this.getRouter().navTo("CheckList");
        },
        onCheckList_Supervisor() {
            this.getRouter().navTo("CheckList_Supervisor");
        },
        onParos() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();

            if (idPlanta != "") {
                this.getRouter().navTo("verParos", {
                    "idPlanta": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        onMantenedorImpresoras() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("oImpresoras", {
                    "planta": idPlanta
                });
            }
        },
        onLogtsTransporte() {
            this.getRouter().navTo("logisticaTransportista");
        },
        onMonitorTransportesNuevo() {
            this.getRouter().navTo("MonitorTransporte");
        },
        onPizarraTransportes() {
            this.getRouter().navTo("PizarraTransportes");
        },
        onPizarraLogistica() {
            this.getRouter().navTo("PizarraTransportes_Logistica");
        }
    });
});