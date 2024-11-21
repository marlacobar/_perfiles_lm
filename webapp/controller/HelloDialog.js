sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObject) {
	"use strict";

	return ManagedObject.extend("sap.ui.demo.webapp.controller.HelloDialog", {

		constructor : function (oView) {
			this._oView = oView;
		},

		exit : function () {
			delete this._oView;
		},

		open : function (text) {
			var oView = this._oView;
            var oDialog = oView.byId("helloDialog");
            console.log("TEXT:" + text);

			// create dialog lazily
			if (!oDialog) {
				var oFragmentController = {
					onCloseDialog : function () {
						oDialog.close();
					}
				};
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.view.HelloDialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
                oView.addDependent(oDialog);
            }
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ message: text });
            oView.setModel(oModel);
			oDialog.open();
		}

	});

});