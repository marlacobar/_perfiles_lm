sap.ui.define([
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
    "use strict";
    return BaseController.extend("sap.ui.demo.webapp.controller.BlockLayout", {
        onInit: function () {
            this.getUserInfo();
        },

        getUserInfo: function () {
            var oThis = this;
            jQuery.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
                dataType: "xml",
                cache: false,
                success: function (xml) { // results ready from lookup of current status details in CCstatus
                    var operador = $(xml).find('Profile').attr('IllumLoginName');
                    var nombrecompleto = $(xml).find('Profile').attr('FullName');
                    var CadenaNombre = nombrecompleto.split(',');
                    var Nombre = CadenaNombre[1];
                    var Apellido = CadenaNombre[0];
                    var roles = $(xml).find('Profile').attr('IllumLoginRoles');

                    var oData = {
                        "user": operador,
                        "nombre": Nombre,
                        "apellido": Apellido,
                        "FILTRO": '',
                        "TIPO_FILTRO": "CE"
                    };

                    oThis.insert_user(oData, 'EquipandoXXI/DatosMaestros/Users/Transaction/ins_user');
                }
            });
        },

        insert_user: function (oData, path) {
            var oThis = this;
            console.log(oData)
            jQuery.ajax({
                type: "GET",
                url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml",
                dataType: "xml",
                cache: false,
                data: oData,
                success: function (xml) { // results ready from lookup of current status details in CCstatus
                    //oThis._base_onloadCOMBO("listPMPlantaBlock", oData, "EquipandoXXI/DatosMaestros/Plant/Transaction/get_func_loc_user", "");
                    oThis._base_onloadCOMBO("listPMPlantaBlock", oData, "EquipandoXXI/DatosTransaccionales/UbicacionesTecnicas/Transaction/Ubicaciones_CEMH", "");
                }
            });
        },

        onDisplayOil: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            if (oKey != 'PA00-2030')
                this.getOwnerComponent().openHelloDialog("Este proceso s\u00F3lo est\u00E1 disponible en Almanzara");
            else {
                this.getRouter().navTo("ViewOrdersOil", { "Plant": oKey });
            }
        },

        onDisplayCreatePMOrder: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            if (oKey != 'PA00-2110' && oKey != 'PA00-2120' && oKey != 'PA00-2130')
                this.getOwnerComponent().openHelloDialog("Crear una orden sin aviso solo est\u00E1 disponible en Ranchos");
            else {
                this.getRouter().navTo("createPMOrderAGRO", { "plant": oKey });
            }
        },

        onDisplayBarricas: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            if (oKey != 'PA00-2010' && oKey != 'PA00-2030')
                this.getOwnerComponent().openHelloDialog("La creaci\u00F3n de contenedores no est\u00E1 disponible para este centro");
            else {
                this.getRouter().navTo("PPBarricas", { "plant": oKey });
            }
        },

        onDisplayCreatePMNotification: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            if (oKey == '')
                this.getOwnerComponent().openHelloDialog("No hay planta seleccionada");
            else {
                this.getRouter().navTo("createPMNotification", { "Plant": oKey });
            }
        },
        onDisplayViewPMNotification: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            if (oKey == '')
                this.getOwnerComponent().openHelloDialog("No hay planta seleccionada");
            else {
                this.getRouter().navTo("viewPMNotification", { "Plant": oKey });
            }
        },
        onDisplayViewPMOrder: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            if (oKey == 'PA00-2110' || oKey == 'PA00-2130' || oKey == 'PA00-2120')
                this.getRouter().navTo("viewPMOrdersAGRO", { "Plant": oKey });
            else {
                this.getRouter().navTo("viewPMOrders", { "Plant": oKey });
            }
        },
        //PRODUCCION
        onDisplayViewPPNotification: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            this.getRouter().navTo("PPNotificationVIN", { "Plant": oKey });
        },

        onDisplayDesembarricados: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            this.getRouter().navTo("PPDesembarricado", { "plant": oKey });
        },

        onDisplayStageAceites: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            if (oKey != 'PA00-2030')
                this.getOwnerComponent().openHelloDialog("Est\u00E1 opci\u00F3n s\u00F3lo est\u00E1 disponible para Almanzara");
            else {
                this.getRouter().navTo("PPStageOIL", { "plant": oKey });
            }
        },

        onDisplayContainers: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            this.getRouter().navTo("PPContainers", { "plant": oKey });
        }
        ,
        onDisplayOEE: function () {
            var oList = this.byId("listPMPlantaBlock");
            var oKey = oList.getSelectedKey();
            this.getRouter().navTo("OEEview", { "Plant": oKey });
        },
        onQMModule: function () {
          var oList = this.byId("listPMPlantaBlock");
          var oKey = oList.getSelectedKey();
           if(oKey!=""){
              this.getRouter().navTo("QMModule");

           }else{
               MessageToast.show("Debe de seleccionar una planta");
           }
       }
        ,
        onShowPrint: function () {
	window.location.href = "http://"+this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") +"/XMII/CM/EquipandoXXI/Funciones/index.html";
        }

    });
});
