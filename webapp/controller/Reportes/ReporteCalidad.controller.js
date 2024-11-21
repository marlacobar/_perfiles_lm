sap.ui.define([
	'jquery.sap.global',
	"sap/ui/demo/webapp/controller/BaseController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	'sap/ui/model/Filter',
	"sap/ui/model/FilterOperator",
	"sap/ui/demo/webapp/model/formatter",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'sap/ui/model/BindingMode',
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/data/FlattenedDataset'
], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, formatter,
	ChartFormatter, Format, BindingMode, JSONModel, FlattenedDataset) {
	"use strict";

	var plant_gb = '';

	return BaseController.extend("sap.ui.demo.webapp.controller.Reportes.ReporteCalidad", {

		formatter: formatter,

		onInit: function () {
			const oView = this.getView();
			// Si no existe modelo con nombre "global"
			if (!oView.getModel("global"))
				oView.setModel(new JSONModel({ user: "" }), "global"); // Crea modelo en la vista llamado global con propiedad usuario
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;
			var oRouter = this.getRouter();
			oRouter.getRoute("ReporteCalidad").attachMatched(this._onRouteMatched, this);
			this.getWC("username");

			var oModel_empty = new sap.ui.model.json.JSONModel(),
				oThis = this;
			oModel_empty.setData({});
			var popoverProps = {};
			var chartPopover = new sap.viz.ui5.controls.Popover(popoverProps);



			//<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->			

			var oVizFrameUtilMensual = this.getView().byId("util_mes");
			oVizFrameUtilMensual.setModel(oModel_empty);

			var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'MES',
					//dataType: 'date',
					value: "{MES}"
				}],

				measures: [{
					name: '% Prod 1ra',
					value: '{PORC}'
				}, {
					name: '% Meta',
					value: '{META}'
				}],

				data: {
					path: "/"
				}
			});
			oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
			//oVizFramePnp.setModel(oModelPnp);	
			oVizFrameUtilMensual.setVizType('combination');

			//var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
			var aColorPalate = ["#b6da58", "#5bbae7", "#935dd0", "#5bbae7"];
			oVizFrameUtilMensual.setVizProperties({
				title: {
					text: "Mensual"
				},
				plotArea: {
					colorPalette: aColorPalate,
					//drawingEffect: "glossy",
					dataLabel: {
						visible: true,
						formatString: formatPattern.SHORTFLOAT_MFD2
					},
					dataShape: {
						primaryAxis: ["bar", "line"]
					}
				}
			});

			var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["% Prod 1ra", "% Meta"]
			}),
				feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["MES"]
				});
			oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
			oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);


			//<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->

			//<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->			

			var oVizFrameUtilSemanal = this.getView().byId("util_semana");
			oVizFrameUtilSemanal.setModel(oModel_empty);
			/*var oModelPnp = new sap.ui.model.json.JSONModel();
			var dataLine = {
					'Data' : [
						{"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"43"},
						{"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"71"},
						{"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"86"},
						{"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"90"},
					   ]};
			oModelPnp.setData(dataLine);*/

			var oDatasetUtilSemanal = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Semana',
					value: "{SEMANA}"
				}],

				measures: [{
					name: '% Prod 1ra',
					value: '{PORC}'
				}, {
					name: '% Meta',
					value: '{META}'
				}],

				data: {
					path: "/"
				}
			});
			oVizFrameUtilSemanal.setDataset(oDatasetUtilSemanal);
			//oVizFramePnp.setModel(oModelPnp);	
			oVizFrameUtilSemanal.setVizType('combination');

			var aColorPalate = ["#f9c463", "#b6da58", "#5bbae7", "#935dd0"];
			oVizFrameUtilSemanal.setVizProperties({
				title: {
					text: "Semanal"
				},
				plotArea: {
					colorPalette: aColorPalate,
					//drawingEffect: "glossy",
					dataLabel: {
						visible: true,
						formatString: formatPattern.SHORTFLOAT_MFD2
					},
					dataShape: {
						primaryAxis: ["bar", "line"]
					}
				}
			});

			var feedValueAxisUtilSemanal = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["% Prod 1ra", "% Meta"]
			}),
				feedCategoryAxisUtilSemanal = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Semana"]
				});
			oVizFrameUtilSemanal.addFeed(feedValueAxisUtilSemanal);
			oVizFrameUtilSemanal.addFeed(feedCategoryAxisUtilSemanal);
			//<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->

			//<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->			

			var oVizFrameUtilDiario = this.getView().byId("util_dia");
			oVizFrameUtilDiario.setModel(oModel_empty);
			/*var oModelPnp = new sap.ui.model.json.JSONModel();
			var dataLine = {
					'Data' : [
						{"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"43"},
						{"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"71"},
						{"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"86"},
						{"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"90"},
					   ]};
			oModelPnp.setData(dataLine);*/

			var oDatasetUtilDiario = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Dia',
					value: "{DIA}"
				}],

				measures: [{
					name: '% Prod 1ra',
					value: '{PORC}'
				}, {
					name: '% Meta',
					value: '{META}'
				}],

				data: {
					path: "/"
				}
			});
			oVizFrameUtilDiario.setDataset(oDatasetUtilDiario);
			//oVizFramePnp.setModel(oModelPnp);	
			oVizFrameUtilDiario.setVizType('combination');

			//var aColorPalate = ["#b6da58","#f9c463","#935dd0","#5bbae7"];
			var aColorPalate = ["#5bbae7", "#b6da58", "#f9c463", "#935dd0"];

			oVizFrameUtilDiario.setVizProperties({
				title: {
					text: "Diario"
				},
				plotArea: {
					colorPalette: aColorPalate,
					//drawingEffect: "glossy",
					dataLabel: {
						visible: true,
						formatString: formatPattern.SHORTFLOAT_MFD2
					},
					dataShape: {
						primaryAxis: ["bar", "line"]
					}

				}
			});

			var feedValueAxisUtilDiario = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["% Prod 1ra", "% Meta"]
			}),
				feedCategoryAxisUtilDiario = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Dia"]
				});
			oVizFrameUtilDiario.addFeed(feedValueAxisUtilDiario);
			oVizFrameUtilDiario.addFeed(feedCategoryAxisUtilDiario);
			//<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->

			//<----------------------------------------VIZFRAME STACKED COLUMN--------------------------------------------------------->			

			var oVizFrameLine = this.getView().byId("idVizFrame");
			oVizFrameLine.setModel(oModel_empty);
			//var oData={};
			//oThis.loadGraph("pp", oData, "MII/DatosTransaccionales/Paros/Transaction/Causas_horas_semanas_pp", "Datos a agraficar");

			//var oModelLine = new sap.ui.model.json.JSONModel();
			/*var dataLine = {
					'Data' : [
						{"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"10"},
						{"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"9"},
						{"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"8"},
						{"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"7"},
					   ]};*/
			//oModelLine.setData(dataLine);

			var oDatasetLine = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Defecto',
					value: "{Week}"
				},
				{
					name: 'Cantidad',
					value: "{Total}"
				}],

				measures: [{
					name: 'Sem1',
					value: '{Sem1}'
				}, {
					name: 'Sem2',
					value: '{Sem2}'
				}, {
					name: 'Sem3',
					value: '{Sem3}'
				}, {
					name: 'Sem4',
					value: '{Sem4}'
				}, {
					name: 'Sem5',
					value: '{Sem5}'
				}],

				data: {
					path: "/"
				}
			});
			oVizFrameLine.setDataset(oDatasetLine);
			//oVizFrameLine.setModel(oModelLine);	
			oVizFrameLine.setVizType('stacked_combination');
			//var  aColorPalate = ["#bae1ff",	"#baffc9","#ffffba","#ffdfba","#ffb3ba"];
			var aColorPalate = ["#5899DA", "#E8743B", "#19A979", "#ED4A7B", "#945ECF"];
			//"#b6da58", 98A9D7

			//var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0", "#F59186","#C63515"];
			oVizFrameLine.setVizProperties({
				title: {
					text: "Frecuencia No Calidades"
				},
				interaction: {
					behaviorType: null
				},
				plotArea: {
					colorPalette: aColorPalate,
					dataShape: {
						primaryAxis: ["bar", "bar", "bar", "bar", "bar"]
					},
					dataLabel: {
						visible: true
					}
				}
			});

			var feedValueAxisLine = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["Sem1", "Sem2", "Sem3", "Sem4", "Sem5"]
			}),
				feedCategoryAxisLine = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Defecto", "Cantidad"]
				});
			oVizFrameLine.addFeed(feedValueAxisLine);
			oVizFrameLine.addFeed(feedCategoryAxisLine);
			//<----------------------------------------VIZFRAME STACKED COLUMN--------------------------------------------------------->		


		},


		getWC: function (id) {
			var oThis = this;

			$.ajax({
				type: "GET",
				url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
				dataType: "xml",
				cache: false,
				success: function (xml) {
					var nombre = $(xml).find('Profile').attr('firstname');
					var apellido = $(xml).find('Profile').attr('lastname');
					var idUs = $(xml).find('Profile').attr('uniquename');
					idUs = idUs.toUpperCase();
					oThis.byId(id).setText(nombre + ' ' + apellido);
					oThis.getView().getModel("global").setProperty("/user", idUs); // Guardamos en el modelo global el usuario por si necesitamos consultarlo en otra función
					var oData = {
						"USER": idUs
					};
					oThis._base_onloadCOMBO("Puesto_Trabajo_select", oData, "MIIExtensions/Operation/Transaction/get_operations_Select_user", "", "Centros");
					oThis.validaAdmin(idUs);
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log("ERROR");
				}
			});
		},


		validaAdmin: function (idUs) {

			var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?QueryTemplate=MII/DatosTransaccionales/Reportes/Query/Calidad/get_user_group&IsTesting=T&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oThis = this;
			$.ajax({
				type: "POST",
				dataType: "xml",
				cache: false,
				url: uri,
				data:
				{
					'Param.1': idUs
				},
				success: function (xml) {
					console.log(xml);
					$(xml).find('Row').each(function () {
						var admin = $(this).find('USER_ID').text();
						if (admin == idUs) {
							oThis.byId('meta').setProperty('visible', true);
							oThis.byId('crea_meta').setProperty('visible', true);
						} else {
							oThis.byId('meta').setProperty('visible', false);
							oThis.byId('crea_meta').setProperty('visible', false);
						}

					});
				}
			});

		},




		getWC_: function (id) {
			var oThis = this;

			$.ajax({
				type: "GET",
				url: "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Illuminator?service=SystemInfo&mode=CurrentProfile&Content-Type=text%2Fxml",
				dataType: "xml",
				cache: false,
				success: function (xml) {
					var nombre = $(xml).find('Profile').attr('firstname');
					var apellido = $(xml).find('Profile').attr('lastname');
					var idUs = $(xml).find('Profile').attr('uniquename');
					idUs = idUs.toUpperCase();
					oThis.byId(id).setText(nombre + ' ' + apellido);
					var oData = {
						"USER": idUs
					};
					oThis._base_onloadCOMBO("Puesto_Trabajo_selec", oData, "MIIExtensions/Operation/Transaction/get_operations_Select_user", "", "Centros");
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log("ERROR");
				}
			});
		},

		_onRouteMatched: function (oEvent) {
			this._getUsuario("username", "id_reporte_calidad");
			// this.onCalidad();

		},

		onGuardar_PTP: function (oData, path) {
			var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oThis = this;
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				async: false,
				crossDomain: true,
				type: "POST",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
					if (opElement.firstChild !== null) {
						var aData = opElement.firstChild.data.replace(/\n/ig, '');
						aData = eval(aData);
						if (aData[0].error !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							aData = aData[0];
							oThis.getOwnerComponent().openHelloDialog(aData.message);
							oThis.onTbSelRow_PTP_01();
						}
					} else {
						oThis.getOwnerComponent().openHelloDialog("No se recibio informacion");
					}
					sap.ui.core.BusyIndicator.hide();
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
					}
					sap.ui.core.BusyIndicator.hide();
				});
		},

		onCreate: function (oData, path) {
			var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oThis = this;
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				async: false,
				crossDomain: true,
				type: "POST",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
					if (opElement.firstChild !== null) {
						var aData = opElement.firstChild.data.replace(/\n/ig, '');
						aData = eval(aData);
						if (aData[0].error !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							aData = aData[0];
							oThis.getOwnerComponent().openHelloDialog(aData.message);
							//oThis.onTbSelRow_PTP_01();
						}
					} else {
						oThis.getOwnerComponent().openHelloDialog("No se recibio informacion");
					}
					sap.ui.core.BusyIndicator.hide();
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
					}
					sap.ui.core.BusyIndicator.hide();
				});
		},

		onTbSelRow_PTP_02: function (oEvent) {
			this.byId("btnAsignaAsignar").setEnabled(false);
			this.byId("btnAsignaEliminar").setEnabled(true);
			this.byId("oInputValorPorc").setValue("");
			var w_row = false;
			var oItem = oEvent.getParameter("listItem");
			var oBindContext = oItem.getBindingContext();
			var oModel = oBindContext.getModel();
			var w_Path = oBindContext.getPath();
			var w_replace = "/Rowsets/Rowset/0/Row/";
			var w_Path_i = parseInt(w_Path.replace(w_replace, ""));
			if (w_Path_i == null) {
				w_Path_i == 0;
			}
			if (w_Path_i >= 0) {
				w_row = oModel.getData(oBindContext.getPath()).Rowsets.Rowset[0].Row[w_Path_i];
			} else {
				w_Path_i = parseInt(w_Path.replace("/ITEMS/", ""));
				w_row = oModel.getData(oBindContext.getPath()).ITEMS[w_Path_i];
			}
			if (!w_row == false) {
				this.byId("oInputValorPorc").setValue(w_row.META);
			} else {
				this.byId("btnAsignaEliminar").setEnabled(false);
				this.getOwnerComponent().openHelloDialog("Posici�n seleccionada sin informaci�n");
			}
		},

		onTbSelRow_PTP_XX: function () {
			var oCombo_01 = this.byId("Puesto_Trabajo_selec").getSelectedKey();
			var oInputValorPorc = this.byId("oInputValorPorc").getValue();
			if (oCombo_01 != "" && oInputValorPorc > 0) {
				this.byId("btnAsignaAsignar").setEnabled(true);
			} else {
				this.byId("btnAsignaAsignar").setEnabled(false);
			}
			this.byId("btnAsignaEliminar").setEnabled(false);
		},

		onBorrarPorcentaje: function () {
			var oCombo_01_01 = this.byId("Puesto_Trabajo_selec").getSelectedKey();
			var oCombo_01_02 = this.byId('Puesto_Trabajo_selec').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ext_OBJTY").value; // 20200424
			var id_row = this.byId("oTb_Cnf_PTP").getSelectedItem().mAggregations.cells[0].getProperty("text");
			if (oCombo_01_01 != "") {
			} else {
				this.byId("btnAsignaEliminar").setEnabled(false);
				this.getOwnerComponent().openHelloDialog("Posici�n seleccionada sin informaci�n");
				return;
			}
			var oData = {
				"ID": id_row
			};
			this.onGuardar_PTP(oData, 'MII/DatosTransaccionales/Reportes/Transaction/Produccion/delete_meta'); // 20200428
			this.byId("oInputValorPorc").setValue("");
		},

		onAsignarPorcentaje: function () {
			var oCombo_01_01 = this.byId("Puesto_Trabajo_selec").getSelectedKey();
			var oCombo_01_02 = this.byId('Puesto_Trabajo_selec').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ID").value; // 20200424
			var oCombo_02 = this.byId("oInputValorPorc").getValue();
			var id_row = this.byId("oTb_Cnf_PTP").getSelectedItem().mAggregations.cells[0].getProperty("text");
			oCombo_02 = eval(oCombo_02);
			oCombo_02 = parseFloat(oCombo_02).toFixed(3);
			var w_user_login = this.byId('username').getText(); // 20200418
			var oData = {
				"WC": oCombo_01_01,
				"ID": id_row,
				"USER": w_user_login,
				"META": oCombo_02
			};
			console.log(oData);
			this.onGuardar_PTP(oData, 'MII/DatosTransaccionales/Reportes/Transaction/Produccion/set_meta'); // 20200428
		},

		onKeyCode_porc: function (oEvent) {
			var w_dato = oEvent.getParameter("newValue");
			if (w_dato.length >= 6) { // 20200428
				this.byId("oInputValorPorc").setValue("");
			}
			this.onTbSelRow_PTP_XX();
		},

		onCloseDialogonCnfPorcentaje: function () {
			this.getView().byId("metas_prod").close();
			this.getView().byId("metas_prod").destroy();
		},

		onCloseDialogonCrear: function () {
			this.getView().byId("crear_meta").close();
			this.getView().byId("crear_meta").destroy();
		},


		cnf_porc_upuetra: function () {
			var oView = this.getView();
			var oDialog = oView.byId("metas_prod");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.metas_prod", this);
				oView.addDependent(oDialog);
			}
			aData = {
				"p_in_01_mandt": "220",
				"p_in_02_werks": "2010"
			};
			var aData = { 'USER': oView.getModel("global").getProperty("/user") }; // Se llama al usuario está en el modelo de la vista (Guardado en función getWC())
			this._base_onloadCOMBO("Puesto_Trabajo_selec", aData, "MIIExtensions/Operation/Transaction/get_operations_Select_user", "", "Centros");

			this.onTbSelRow_PTP_01();
			oDialog.open();
		},

		onCrear: function () {
			var oView = this.getView();
			var oDialog = oView.byId("crear_meta");

			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.crearMeta", this);
				oView.addDependent(oDialog);
			}

			var aData = { 'USER': oView.getModel("global").getProperty("/user") }; // Se llama al usuario está en el modelo de la vista (Guardado en función getWC())
			this._base_onloadCOMBO("Puesto_Trabajo", aData, "MIIExtensions/Operation/Transaction/get_operations_Select_user", "", "Centros");
			oDialog.open();
		},

		onCrearMeta: function () {
			var wc = this.byId("Puesto_Trabajo").getSelectedKey();
			var meta = this.byId("new_meta").getValue();
			var fecha = this.byId("start").getValue();
			var w_user_login = this.byId('username').getText(); // 20200418
			var oData = {
				"WC": wc,
				"FECHA": fecha,
				"USER": w_user_login,
				"META": meta
			};
			console.log(oData);
			this.onCreate(oData, 'MII/DatosTransaccionales/Reportes/Transaction/Produccion/ins_meta'); // 20200428
		},

		onClickOnColumnaSemana: function (oEvent) {
			var dataSelected = oEvent.getParameter("data")[0];
			var semana = dataSelected.data.Semana;

			var oView = this.getView();
			var wc = oView.byId("Puesto_Trabajo_select").getSelectedKey();
			var fec_in = oView.byId("DP10").getValue();


			var oData = {
				"MES": fec_in,
				"SEMANA": semana,
				"WC": wc,
				"TIPO_MAT": this.byId("tipo_material_select").getSelectedKey()
			};
			this._base_onloadTable("tab_dia", oData, "MII/DatosTransaccionales/Reportes/Transaction/Calidad/tab_calc_dia", "Comparativa Diaria", "");
			this.loadGraph("util_dia", oData, "MII/DatosTransaccionales/Reportes/Transaction/Calidad/calc_dia", "DatosUtilDiario");
		},



		onTbSelRow_PTP_01: function () {
			var oCombo_01 = this.byId("Puesto_Trabajo_selec").getSelectedKey();
			var w_OBJTY = "";
			if (oCombo_01 != "") {
				w_OBJTY = this.byId('Puesto_Trabajo_selec').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ext_OBJTY").value; // 20200424
			}
			var oData = {
				"WC": oCombo_01
			};
			this._base_onloadTable("oTb_Cnf_PTP", oData, "MII/DatosTransaccionales/Reportes/Transaction/Produccion/sel_meta", "oTb_Cnf_PTP", ""); // 20200428
			this.byId("oInputValorPorc").setValue("");
			this.onTbSelRow_PTP_XX();

		},



		onConsultar: function () {
			var oThis = this;
			//var anio = this.getView().byId("DP2").getValue();
			//var mes = this.getView().byId("mes").getSelectedKey();
			var mes2 = this.getView().byId("DP10").getValue();
			var wc = this.getView().byId("Puesto_Trabajo_select").getSelectedKey();
			var check = this.getView().byId("check").getProperty("selected");
			var tipo_mat = this.getView().byId("tipo_material_select").getSelectedKey();

			var oData = {
				"CHECK": check,
				"MES": mes2,
				"WC": wc,
				"TIPO_MAT": this.getView().byId("tipo_material_select").getSelectedKey()
			};

			console.log(oData);
			//            
			oThis.loadGraph("idVizFrame", oData, "MII/DatosTransaccionales/Reportes/Transaction/Calidad/get_reporte", "NoCalidad");
			oThis.loadGraph("util_mes", oData, "MII/DatosTransaccionales/Reportes/Transaction/Calidad/calc_mes", "DatosUtilMensual");
			oThis.loadGraph("util_semana", oData, "MII/DatosTransaccionales/Reportes/Transaction/Calidad/calc_semanas", "DatosUtilSemanal");
			oThis._base_onloadTable("tab_mes", oData, "MII/DatosTransaccionales/Reportes/Transaction/Calidad/tab_calc_mes", "Comparativa Mensual", "");
			oThis._base_onloadTable("tab_sem", oData, "MII/DatosTransaccionales/Reportes/Transaction/Calidad/tab_calc_semanas", "Comparativa Semanal", "");
		},

		loadGraph: function (id, oData, path, name) {
			var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');

			var oView = this.getView(),
				oElement = oView.byId(id),
				oModel_empty = new sap.ui.model.json.JSONModel(),
				oThis = this;

			oElement.setModel(oModel_empty);
			oModel_empty.setData({});

			oElement.setBusy(true);

			$.ajax({
				type: "GET",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
					console.log(opElement);
					if (opElement.firstChild != null) {
						var aData = eval(opElement.firstChild.data);
						if (aData[0] !== undefined) {
							if (aData[0].error !== undefined) {
								oThis.getOwnerComponent().openHelloDialog(aData[0].error);
							}
							else {
								//Create  the JSON model and set the data                                                                                                
								var oModel = new sap.ui.model.json.JSONModel();

								oElement.setModel(oModel);
								oElement.getModel().setSizeLimit(aData.length);
								oModel.setData(aData);
							}
						}
						else {
							MessageToast.show("No se han recibido " + name);
						}
					}
					else {
						MessageToast.show("No se han recibido datos");
					}

					oElement.setBusy(false);

				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
					}
					oElement.setBusy(false);
				});
		},


		onNCalidad: function () {
			this.onConsultar();

		},


		grafica: function (xData) {
			console.log(xData);
			var settingsModel = {
				dataset: {
					name: "Dataset",
					defaultSelected: 2,
					values: [{
						name: "xData",
						value: xData
					}]
				},
				dataLabel: {
					name: "Value Label",
					defaultState: true
				},
				sumLabel: {
					name: "Sum Value Label",
					defaultState: false
				},
				axisTitle: {
					name: "Axis Title",
					defaultState: false
				},
				type: {
					name: "Stacked Type",
					defaultSelected: 0,
					values: [{
						name: "Regular",
						vizType: "stacked_column",
						vizProperties: {
							plotArea: {
								dataLabel: {
									formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2
								}
							}
						}
					}, {
						name: "100%",
						vizType: "100_stacked_column",
						vizProperties: {
							plotArea: {
								mode: "percentage",
								dataLabel: {
									type: "percentage",
									formatString: ChartFormatter.DefaultPattern.STANDARDPERCENT_MFD2
								}
							}
						}
					}]
				},
				additionalColumn: {
					name: "Additional Column",
					defaultState: false
				},
				dimensions: {
					xData: [{
						name: 'Defecto',
						value: "{Week}"
					},
					{
						name: 'Cantidad',
						value: "Prueba"
					}]
				},
				measures: [{
					name: 'Sem1',
					value: '{Sem1}'
				}, {
					name: 'Sem2',
					value: '{Sem2}'
				}, {
					name: 'Sem3',
					value: '{Sem3}'
				}, {
					name: 'Sem4',
					value: '{Sem4}'
				}, {
					name: 'Sem5',
					value: '{Sem5}'
				}]
			}

			oVizFrame = null;

			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;
			// set explored app's demo model on this sample
			var oModel = new JSONModel(this.settingsModel);
			oModel.setDefaultBindingMode(BindingMode.OneWay);
			this.getView().setModel(oModel);

			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true,
						showTotal: true
					}
				},
				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				valueAxis2: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: false,
					text: 'Revenue by City and Store Name'
				}
			});
			var dataModel = new JSONModel(xData);
			oVizFrame.setModel(dataModel);


			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(formatPattern.STANDARDFLOAT);

			this.initPageSettingsNCal(this.getView());
			var that = this;
			dataModel.attachRequestCompleted(function () {
				that.dataSort(this.getData());
			});

			var oView = this.getView(),
				viz = oView.byId("idVizFrame");
			viz.setBusy(false);
		},

		onTipoMaterial: function (oEvent) {
			var key = this.byId("Puesto_Trabajo_select").getSelectedKey();
			if (key === 'CGL1-010' || key === 'CGL2-010')
				this.byId("layout_tipo_material").setVisible(true)
			else
				this.byId("layout_tipo_material").setVisible(false)
		},


		initPageSettingsNCal: function (oView) {

			var libraries = sap.ui.getVersionInfo().libraries || [];
			var bSuiteAvailable = libraries.some(function (lib) {
				return lib.name.indexOf("sap.suite.ui.commons") > -1;
			});
			if (bSuiteAvailable) {
				jQuery.sap.require("sap/suite/ui/commons/ChartContainer");
				var vizframe = oView.byId("idVizFrame");
				var oChartContainerContent = new sap.suite.ui.commons.ChartContainerContent({
					icon: "sap-icon://vertical-stacked-chart",
					title: "vizFrame Stacked Column Chart Sample",
					content: [vizframe]
				});
				var oChartContainer = new sap.suite.ui.commons.ChartContainer({
					content: [oChartContainerContent]
				});
				oChartContainer.setShowFullScreen(true);
				oChartContainer.setAutoAdjustHeight(true);
				oView.byId('chartFixFlex').setFlexContent(oChartContainer);
			}
		},
	});
});