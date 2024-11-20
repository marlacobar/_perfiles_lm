jQuery.sap.declare("global.functions");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
var oCustomAtrrib = [];
var $sapmii
var aData = [];
var errorExists = false;
var oModelExport = new sap.ui.model.json.JSONModel()
sap.ui.getCore().setModel(oModelExport, "modelExport");
global.functions = {
	<!--#######-->
	dummy: function(oMsg) {
		alert(oMsg);
	},
	<!--#######-->
	getUserAttribs: function() {
		$.ajax({
			type: "GET",
			url: "/XMII/PropertyAccessServlet?mode=List&Content-type=text/json",
			dataType: "json",
			async: false,
			success: function(data) {
				_customAttributes = data;
				try {
					for (var i = 0; i < _customAttributes.Rowsets.Rowset[0].Row.length; i++) {
						var oProp = _customAttributes.Rowsets.Rowset[0].Row[i].Name;
						var oValue = _customAttributes.Rowsets.Rowset[0].Row[i].Value;
						oCustomAtrrib[oProp] = oValue;
					}
					$sapmii = oCustomAtrrib
				} catch (e) {
					alert(e.message);
				}
			},
			error: function(xhr, errorType, exception) { //Triggered if an error communicating with server
				var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText
				alert(errorMessage);
			}
		});
	},
	<!--#######-->
	getUserAttribsExtended: function(oUser) {
		$.ajax({
			type: "GET",
			url: "/XMII/Illuminator?service=admin&mode=FullProfile&Group=" + oUser + "&Content-type=text/json",
			dataType: "json",
			async: false,
			success: function(data) {
				_customAttributesEXT = data;
				try {
					for (var i = 0; i < _customAttributesEXT.Rowsets.Rowset[0].Row.length; i++) {
						var oProp = _customAttributesEXT.Rowsets.Rowset[0].Row[i].Name;
						var oValue = _customAttributesEXT.Rowsets.Rowset[0].Row[i].Value;
						oCustomAtrrib[oProp] = oValue;
					}
					$sapmii = oCustomAtrrib
				} catch (e) {
					alert(e.message);
				}
			},
			error: function(xhr, errorType, exception) { //Triggered if an error communicating with server
				var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText
				alert(errorMessage);
			}
		});
	},
	<!--#######-->
	validateEmail: function(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	},
	<!--#######-->
	doExport: function(oTable, oModel) {
		var aColumns = this.getColumns(oTable);
		var oExport = new sap.ui.core.util.Export({
			exportType: new sap.ui.core.util.ExportTypeCSV({
				separatorChar: ";",
				mimeType: "application/vnd.ms-excel",
				charset: "utf-8"
			}),
			models: oModel,
			rows: {
				path: "/"
			},
			columns: aColumns
		});
		oExport.saveFile().always(function() {
			this.destroy();
		});
	},
	<!--#######-->
	validateEmptyField: function(oInput) {
		if (oInput.getValue().trim() === "") {
			oInput.setValueState(sap.ui.core.ValueState.Error).focus();
			return true;
		}
		oInput.setValueState(sap.ui.core.ValueState.None);
		return false;
	},
	<!--#######-->
	validateEmptySelection: function(oSelect) {
		if (oSelect.getSelectedItem().getKey() === "-1") {
			oSelect.setValueState(sap.ui.core.ValueState.Error).focus();
			return true;
		}
		oSelect.setValueState(sap.ui.core.ValueState.None);
		return false;
	},
	<!--#######-->
	validateNumber: function(oInput) {
		if (!this.isNumberFieldValid(oInput.getValue())) {
			oInput.setValueState(sap.ui.core.ValueState.Error).focus();
			return true;
		}
		oInput.setValueState(sap.ui.core.ValueState.None);
		return false;
	},
	<!--#######-->
	isNumberFieldValid: function(testNumber) {
		var noSpaces = testNumber.replace(/ +/, ''); //Remove leading spaces
		var isNum = /^\d+$/.test(noSpaces); // test for integer numbers only and return true or false
		return isNum;
	},
	<!--#######-->
	isValid: function(oInput) {
		if (oInput.getValueState() == "Error") {
			oInput.setValueState(sap.ui.core.ValueState.Error).focus();
			return false;
		}
		oInput.setValueState(sap.ui.core.ValueState.None);
		return true;
	},
	<!--#######-->
	validateDecimal: function(oInput) {
		if (!this.isDecimal(oInput.getValue())) {
			oInput.setValueState(sap.ui.core.ValueState.Error).focus();
			return true;
		}
		oInput.setValueState(sap.ui.core.ValueState.None);
		return false;
	},
	<!--#######-->
	isDecimal: function(testNumber) {
		var noSpaces = testNumber.replace(/ +/, ''); //Remove leading spaces
		noSpaces = noSpaces.replace(/,/g, ''); //Remove grouping separator
		var isNum = /^\d+(\.\d{1,3})?$/.test(noSpaces); // test for decimal numbers only and return true or false
		return isNum;
	},
	<!--#######-->
	strToDate: function(dateString) {
		let reggie = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
			[, day, month, year, hours, minutes, seconds] = reggie.exec(dateString),
			dateObject = new Date(year, month - 1, day, hours, minutes, seconds);
		return dateObject;
	},
	<!--#######-->
	formattedDate: function(date) {
		var year = date.getFullYear();
		var month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;
		var day = date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;
		var hour = date.getHours().toString();
		hour = hour.length > 1 ? hour : '0' + hour;
		var min = date.getMinutes().toString();
		min = min.length > 1 ? min : '0' + min;
		var sec = date.getSeconds().toString();
		sec = sec.length > 1 ? sec : '0' + sec;
		return day + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec;
	},
	<!--#######-->
	onMessageErrorFragment: function(pFragment, pMessage, pType) {
		sap.ui.getCore().byId(pFragment + "--oMessageError").setText("")
		sap.ui.getCore().byId(pFragment + "--oMessageError").setVisible(false);
		sap.ui.getCore().byId(pFragment + "--oMessageError").setType(pType);
		sap.ui.getCore().byId(pFragment + "--oMessageError").setText(pMessage)
		sap.ui.getCore().byId(pFragment + "--oMessageError").setVisible(true);
	},
	<!--#######-->
	formattedDate2SAP: function(date) {
		var year = date.getFullYear();
		var month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;
		var day = date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;
		var hour = date.getHours().toString();
		hour = hour.length > 1 ? hour : '0' + hour;
		var min = date.getMinutes().toString();
		min = min.length > 1 ? min : '0' + min;
		var sec = date.getSeconds().toString();
		sec = sec.length > 1 ? sec : '0' + sec;
		return year + '-' + month + '-' + day + 'T' + hour + ':' + min + ':' + sec;
	},
	<!--#######-->
	uuidv4: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},
	<!--#######-->
	onMessage: function(pType, pMessage) {
		var localMessage = pMessage.replace('com.sap.xmii.Illuminator.logging.LHException: ', '')
		switch (pType) {
			case 'I':
				new sap.m.MessageBox.information(localMessage);
				break;
			case 'E':
				new sap.m.MessageBox.error(localMessage);
				break;
			case 'W':
				new sap.m.MessageBox.warning(localMessage);
				break;
			case 'S':
				new sap.m.MessageBox.success(localMessage);
				break;
			default:
				new sap.m.MessageBox.information(localMessage);
				break;
		}
	},
	<!--#######-->
}