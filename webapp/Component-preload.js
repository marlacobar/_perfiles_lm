sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
  "sap/ui/demo/webapp/controller/HelloDialog",
	"sap/ui/demo/webapp/model/models"
], function (UIComponent, JSONModel, HelloDialog, models) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.webapp.Component-preload", {

		metadata : {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

      // create the views based on the url/hash
      this.getRouter().initialize();

			// set data model
			this.setModel(models.createDeviceModel(), "device");

			// set data model
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			// set dialog
            this._helloDialog = new HelloDialog(this.getRootControl());
		},

		exit : function() {
			this._helloDialog.destroy();
			delete this._helloDialog;
		},

		openHelloDialog : function (text) {
			this._helloDialog.open(text);
        },

	});

});
