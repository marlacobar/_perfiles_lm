sap.ui.define([], function () {
	"use strict";
	return {
		statusText: function (sStatus) {
			if(Number(sStatus)<3){
				return "Warning"
			}else{
				return "Error"
			}
		}
	};
});