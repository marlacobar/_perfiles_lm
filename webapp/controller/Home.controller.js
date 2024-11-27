sap.ui.define([
    "sap/ui/demo/webapp/controller/BaseController"

], function (BaseController) {
    "use strict";
    return BaseController.extend("sap.ui.demo.webapp.controller.Home", {

        onInit: function () {
            this.getUsuario_login("username");
            this._base_onloadCOMBO("ListPlanta", {}, "GALVASID/DatosTransaccionales/Funciones/Plantas_Select", "", "Centros");

        },
        onRoles: function (path, oData) {

            var oThis = this;
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=*&Content-Type=text/xml"

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
                        if (oThis.byId(tile))
                            oThis.byId(tile).setVisible(true);
                    });


                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
                    }
                });

        },

        getUsuario_login: function (id) {
            var oThis = this;
            $.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") +
                    "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
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
                        // "SITE": 2010
                    }

                    oThis.onRoles("MEINTExtensions/General/Transaction/sel_tiles_user", oData);

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

        onOpenDialog: function () {
            this.getOwnerComponent().openHelloDialog();
        },

        onMermas() {
            this.getRouter().navTo("mermas");
        },
        onReporteMermas: function () {
            this.getRouter().navTo("reporteMerma");
        },
        onRolesPerfiles() {
            this.getRouter().navTo("RolesAdmin");
        },
        //cmolar
        onRolesPerfilesV2() {
            this.getRouter().navTo("RolesAdminV2");
        },
        //cmolar
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
        onCatalogos() {
            this.getRouter().navTo("CatParos");
        },
        onBasculaEntrega() {
            this.getRouter().navTo("recibirMaterialEntrega");
        },
        onBascula() {
            this.getRouter().navTo("Bascula");
        },
        onPlanificacionTransporte() {
            this.getRouter().navTo("planificacionTransporte");
        },
        onInspeccionReimpresion() {
            this.getRouter().navTo("inspeccionReimpresion");
        },
        onWorkCenters() {
            this.getRouter().navTo("WorkCenters");
        },
        onReporteDecapadoSH() {
            this.getRouter().navTo("reporteDecapadoSH");
        },
        onInspeccion() {
            this.getRouter().navTo("materiaprima");
        },
        onVerAvisos() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();

            if (idPlanta != "") {
                this.getRouter().navTo("verAvisos", {
                    "idPlanta": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        onVerMAF() {
            this.getRouter().navTo("verMAF");
        },
        onVerMAF() {
            this.getRouter().navTo("verMAF");
        },
        OnMe() {
            this.getRouter().navTo("me");
        },
        onCrearAviso() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("crearAviso", {
                    "idPlanta": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        onVerOrdenes() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("verOrdenes", {
                    "idPlanta": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },

        //MMARTINEZ
        onCertificados: function () {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("viewQMOrders", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },

        onPlan() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("viewPlan", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },

        onMetas() {
            this.getRouter().navTo("metasIndicadoresWC");
        },

        onReporteUtil() {
            this.getRouter().navTo("ReporteUtilizacion");
        },

        onReporteMacro() {
            this.getRouter().navTo("reporteNumeroParos");
        },

        onReporteEficiencia() {
            this.getRouter().navTo("ReporteEficiencia");
        },

        onReporteOEE() {
            this.getRouter().navTo("ReporteOEE");
        },

        onReporteProd() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("ReporteProduccion", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
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
        onConsumo() {
            this.getRouter().navTo("Consumo201");
        },
        onConsumo261() {
            this.getRouter().navTo("Consumo261");
        },
        onWm() {
            this.getRouter().navTo("ReporteWM");
        },
        onIm() {
            this.getRouter().navTo("ReporteIM");
        },
        onConsumos() {
            this.getRouter().navTo("ReporteConsumos");
        },


        onAvance() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("viewAvance", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        onReporteProdOrd() {
            //var idPlanta = this.byId("ListPlanta").getSelectedKey();
            //if (idPlanta != "") {
            //    this.getRouter().navTo("ReporteProdOrd", { "plant": idPlanta });
            this.getRouter().navTo("ReporteProdOrd_v2");
            //} else {
            //    this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            //}
        },

        // FCICERCHIA
        onReporteLotesMod() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("ReporteLotesMod", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },

        // FCICERCHIA
        onConsultaOrdenesFabricacion() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("ConsultaOrdenesFabricacion", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },

        onDefectos() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("Defectos_Rep");
            }
        },

        onStatusOrdenesFabricacion() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("StatusOrdenesFabricacion", {
                    "plant": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        //MMARTINEZ

        on_navTo_mermasR1: function () {
            this.getRouter().navTo("mermasR1");
        },
        on_navTo_mermasR2: function () {
            this.getRouter().navTo("mermasR2");
        },
        onReporte_Traza_01() {
            this.getRouter().navTo("Reporte_Traza_01");
        },
        onReporte_Tarjeta_Kilo() {
            this.getRouter().navTo("Reporte_TKILO_01");
        },

        //25 AGOSTO REPORTES DE MANTENIMIENTO
        onReporteTMEA() {
            this.getRouter().navTo("ReporteTMEA");
        },
        onReporteMtoPreventivo() {
            this.getRouter().navTo("ReporteMtoPreventivo");
        },
        onReporteCalibracion() {
            this.getRouter().navTo("ReporteCalibracion");
        },
        onProgramaMto() {
            this.getRouter().navTo("ReporteProgramaMto");
        },

        onVerOEE() {
            this.getRouter().navTo("OperacionOEE");
        },

        onDefectos() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("Defectos_Rep");
            }
        },

        onVerPerdidasDiario() {
            this.getRouter().navTo("PerdidasDiario");
        },
        onVerParosLinea() {
            this.getRouter().navTo("OperacionParos");
        },
        onVerEstatusLote() {
            this.getRouter().navTo("EstatusLote");
        },
        onVerTrabajando() {
            this.getRouter().navTo("OperacionTrabajando");
        },
        onMonitorTransportes() {
            this.getRouter().navTo("Monitor_Transportes");
        },
        onAdmonSalida() {
            this.getRouter().navTo("AdmonSalida");
        },
        onVerProduccionLinea() {
            this.getRouter().navTo("OperacionProduccion");
        },
        onEditor() {
            this.getRouter().navTo("GestorMensajes");
        },
        onVerLineas(oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("Lineas", {
                pantalla: oItem.getHeader()
            });
            //this.getRouter().navTo("Lineas");
        },
        onVerAndon() {
            this.getRouter().navTo("Andon");
        },
        onVerAlarma() {
            this.getRouter().navTo("CreacionAlarmas");
        },
        onJustificarVR() {
            this.getRouter().navTo("JustificarVR");
        },
        onCapturaReserva() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("CapturaReserva", {
                    "idPlanta": idPlanta
                });
            } else {
                this.getOwnerComponent().openHelloDialog("Debe  seleccionar  un centro.");
            }
        },
        on_verGoods_mvt() {
            this.getRouter().navTo("monitorGoodsMvt");
        },

        on_verInherit_chars() {
            this.getRouter().navTo("monitorInheritChars");
        },

        on_verNoPrimera() {
            this.getRouter().navTo("monitorNoPrimera");
        },

        onListaCorreo() {
            this.getRouter().navTo("Correo");
        },

        onListaCorreoErrores() {
            this.getRouter().navTo("CorreoErrores");
        },

        oncertificado_nuevo() {
            this.getRouter().navTo("certificado_nuevo");
        },

        onReporteInventario() {
            this.getRouter().navTo("ReporteInventario");
        },

        onReporteProduccionXCaracteristica() {
            this.getRouter().navTo("ReporteProduccionXCaracteristica");
        },

        on_sig_acceso() {
            window.open("http://192.168.6.200:8088/Acceso/Login");
        },

        on_pog_acceso() {
            window.open("http://192.168.7.83:50100/XMII/CM/GALVASID/SingleSelect/index.html");
        },

        on_hh_acceso() {
            window.open("http://192.168.7.83:50100/XMII/CM/GALVASID/Gvd_Hh/MII-Launchpad/Launchpad.html");
        },

        on_optimizador() {
            window.open("http://192.168.7.83:50100/XMII/CM/GALVASID/Optimizador/index.html");
        },

        onMonitorDocumento() {
            this.getRouter().navTo("monitor_inventario");
        },

        on_ver_revision_lotes() {
            this.getRouter().navTo("revision_lotes");
        },
        on_proveedor_acero() {
            this.getRouter().navTo("proveedorAcero");
        },
        on_facturas() {
            this.getRouter().navTo("facturas");
        },
        onBasculaExt() {
            this.getRouter().navTo("BasculaExt");
        },
        onTraduccion() {
            this.getRouter().navTo("traduccionValores");
        },
        onLogtsTransporte() {
            this.getRouter().navTo("logisticaTransportista");
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
        onMonitorTransportesNuevo() {
            this.getRouter().navTo("MonitorTransporte");
        },
        //AMEDINA 07/11/2024
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
        on_revision_lotes_offline() {
            this.getRouter().navTo("revision_lotes_offline");
        },
        onCambioMaterial() {
            this.getRouter().navTo("cambio_material");
        },
        //3May23 ARivera Caracteristicas Personalizables OFAs Pantalla Operador
        onCaractPantOperador() {
            this.getRouter().navTo("caractPantOperador");
        },
        //14-06-2023 JGarcia Checklist Mtto
        onCheckList_Act() {
            this.getRouter().navTo("CheckList_Actividades");
        },
        onCheckList() {
            this.getRouter().navTo("CheckList");
        },
        onCheckList_Supervisor() {
            this.getRouter().navTo("CheckList_Supervisor");
        },

        //16Jun23 JGarcia Pizarras 
        onPizarraTransportes() {
            this.getRouter().navTo("PizarraTransportes");
        },
        onPizarraLogistica() {
            this.getRouter().navTo("PizarraTransportes_Logistica");
        },
        //21Jun23 JGarcia Pizarras 
        onAdminUbicaciones() {
            this.getRouter().navTo("AdminUbicacionTraspasos");
        },
        //26Jun23 JGarcia DrShenk
        onReporteDrShenk() {
            this.getRouter().navTo("ReporteDrShenk");
        },
        //4Oct23 ARivera Bitacora Molino
        onBitacoraMolino() {
            this.getRouter().navTo("bitacoraMolino");
        },
        //2Nov23 ARivera Reporte Emulsion Molino
        onReporteEmulsiónMFR() {
            this.getRouter().navTo("reporteEmulsionMFR");
        },
        //22Abr24 CSandoval Reporte SKU Maquila
        onReporteSKUMaquila() {
            this.getRouter().navTo("ReporteSKUMaquila");
        },

        //18Jun24 JRIOS Reporte de Consumos Cromatadora
        onReporteCromatadora() {
            this.getRouter().navTo("reporteCromatadora");
        },
        //06Ago24 CSandoval Reporte Cambio Cuchillas
        onReporteCambioCuchillas() {
            this.getRouter().navTo("reporteCambioCuchillas");
        },
        //09Sep24 Arivera Trazabilidad
        onReporteTrazabilidad() {
            this.getRouter().navTo("reporteTrazabilidad");
        },
        onReportePintura() {
            this.getRouter().navTo("reportePintura");
        },
        //JRIOS 12/09/2024
        onReporteTQLavado() {
            this.getRouter().navTo("reporteTQLavado");
        },
        //CMOLAR 24/10/2024
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
        onInspeccion03() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("InspeccionCalidad03", {
                    "planta": idPlanta
                });
            }
        },
        onMantenedorImpresoras() {
            var idPlanta = this.byId("ListPlanta").getSelectedKey();
            if (idPlanta != "") {
                this.getRouter().navTo("oImpresoras", {
                    "planta": idPlanta
                });
            }
        }
    });
});