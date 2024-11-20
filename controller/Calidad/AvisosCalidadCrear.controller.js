sap.ui.define([
    "sap/ui/demo/webapp/controller/BaseController",
    'sap/ui/model/json/JSONModel'
], function(BaseController ,JSONModel) {
"use strict";
const name_view = "AvisosCalidadCrear";

return BaseController.extend("sap.ui.demo.webapp.controller.Calidad.AvisosCalidadCrear", {

    onInit: function () {

        // set explored app's demo model on this sample
        var datos = '{"TypesAvisos":[{"text": "Cliente","key": "1"},        {"text": "Clientes","key": "2"        }    ]}';
        var oModel = new JSONModel(JSON.parse(datos));
        this.getView().setModel(oModel);
    },
	
    onAfterRendering: function () {
            this._getUsuario("username","avatar", name_view);
    }
});
});