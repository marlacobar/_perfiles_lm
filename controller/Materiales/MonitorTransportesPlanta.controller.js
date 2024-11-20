sap.ui.define([
	'jquery.sap.global',
	"sap/ui/demo/webapp/controller/BaseController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	'sap/ui/model/Filter',
	"sap/ui/model/FilterOperator",
	"sap/ui/demo/webapp/model/formatter",
	'sap/ui/model/json/JSONModel',
	"sap/ui/demo/webapp/model/formatPods",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/export/Spreadsheet',
], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator, formatter, JSONModel, formatPods, Export, ExportTypeCSV, Spreadsheet) {
	"use strict";
	var oModel_empty = new sap.ui.model.json.JSONModel();
	var oView;
	return BaseController.extend("sap.ui.demo.webapp.controller.Materiales.MonitorTransportesPlanta", {
		formatPods: formatPods,

		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("MonitorTransporte").attachMatched(this._onRouteMatched, this);
			this.InitialGraph();
			oView = this.getView();
			oView.setModel(oModel_empty);
			this._onload("listTpUnidad", "", "MII/DatosTransaccionales/Transportes/Transaction/Get_Transporte_TipoCamion", "TipoCamion");
		},

		_onRouteMatched: function (oEvent) {
			var oArgs;
			oArgs = oEvent.getParameter("arguments");
			var oThis = this;
			this._getUsuario("username");
		},

		onConsultar: function () {
			var fechain = oView.byId("start_date").getValue(),
				fechafin = oView.byId("end_date").getValue(),
				tipocamion = oView.byId("listTpUnidad").getSelectedKey(),
				ciclo = oView.byId("listCiclo").getSelectedKey();
			var oData = {
				"FECHAIN": fechain,
				"FECHAFIN": fechafin,
				"TIPOCAMIONID": tipocamion,
				"CICLO": ciclo
			}
			this.loadData(oData, "MII/DatosTransaccionales/Transportes/Transaction/Get_Transportes_Monitor");
			this._base_onloadTable("TBLREP", oData, "MII/DatosTransaccionales/Transportes/Transaction/Get_Transportes_Monitor_Tabla", "", "");
		},

		InitialGraph: function () {
			var oVizGraphUnid = this.getView().byId("cd_unidades");
			oVizGraphUnid.setModel(oModel_empty);
			var oDatasetUnid = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Dia',
					value: "{DATE}"
				}],
				measures: [{
					name: 'Carga',
					value: '{CARGA}'
				}, {
					name: 'Descarga',
					value: '{DESCARGA}'
				}, {
					name: 'Chatarra',
					value: '{CONTENEDOR}'
				}, {
					name: 'Otro',
					value: '{OTRO}'
				}],
				data: {
					path: "data>/KPI_UNIDADES"
				}
			});
			oVizGraphUnid.setDataset(oDatasetUnid);
			oVizGraphUnid.setVizType('column');

			var aColorPalate = ["#5bbae7", "#b6da58", "#f9c463", "#935dd0"];
			oVizGraphUnid.setVizProperties({
				title: {
					text: "UNIDADES "
				},
				plotArea: {
					colorPalette: aColorPalate,
					dataLabel: {
						visible: true,
						position: 'inside'
					}
				}
			});

			var feedValueAxisUnid = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["Carga", "Descarga", "Chatarra", "Otro"]
			}),
				feedCategoryAxisUnid = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Dia"]
				});
			oVizGraphUnid.addFeed(feedValueAxisUnid);
			oVizGraphUnid.addFeed(feedCategoryAxisUnid);

			var oVizGraph = this.getView().byId("cd_toneladas");
			oVizGraph.setModel(oModel_empty);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Dia',
					value: "{DATE}"
				}],
				measures: [{
					name: 'Carga',
					value: "{CARGA}"
				}, {
					name: 'Descarga',
					value: "{DESCARGA}"
				}, {
					name: 'Chatarra',
					value: "{CONTENEDOR}"
				}, {
					name: 'Otro',
					value: "{OTRO}"
				}],
				data: {
					path: "data>/KPI_TONELADAS"
				}
			});
			oVizGraph.setDataset(oDataset);
			oVizGraph.setVizType('column');

			var aColorPalate = ["#5bbae7", "#b6da58", "#f9c463", "#935dd0"];
			oVizGraph.setVizProperties({
				title: {
					text: "TONELADAS CARGA / DESCARGA"
				},
				plotArea: {
					colorPalette: aColorPalate,
					dataLabel: {
						visible: true,
						position: 'inside'
					}
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["Carga", "Descarga", "Chatarra", "Otro"]
			}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Dia"]
				});
			oVizGraph.addFeed(feedValueAxis);
			oVizGraph.addFeed(feedCategoryAxis);

			var oVizGraph = this.getView().byId("cd_tiempo");
			oVizGraph.setModel(oModel_empty);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Estatus',
					value: "{ESTATUS}"
				}],
				measures: [{
					name: 'Tiempo (hrs)',
					value: "{TIEMPO_PROMEDIO}"
				}],
				data: {
					path: "data>/KPI_TIEMPO"
				}
			});
			oVizGraph.setDataset(oDataset);
			oVizGraph.setVizType('column');

			var aColorPalate = ["#5bbae7", "#b6da58", "#f9c463", "#935dd0"];
			oVizGraph.setVizProperties({
				title: {
					text: "TIEMPO PROMEDIO POR ESTATUS"
				},
				plotArea: {
					colorPalette: aColorPalate,
					dataLabel: {
						visible: true,
						position: 'inside'
					}
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["Tiempo (hrs)"]
			}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Estatus"]
				});
			oVizGraph.addFeed(feedValueAxis);
			oVizGraph.addFeed(feedCategoryAxis);

			var oVizGraph = this.getView().byId("cd_cpuerta");
			oVizGraph.setModel(oModel_empty);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Fecha',
					value: "{FECHA}"
				}],
				measures: [{
					name: 'Puerta 1',
					value: "{PUERTA1}"
				}, {
					name: 'Puerta 2',
					value: "{PUERTA2}"
				}, {
					name: 'Puerta 3',
					value: "{PUERTA3}"
				}, {
					name: 'Decapado',
					value: "{DECAPADO}"
				}, {
					name: 'Pintadora 2',
					value: "{PINTADORA2}"
				}, {
					name: 'Galvanizadora 2',
					value: "{GALVANIZADORA2}"
				}, {
					name: 'Molino',
					value: "{MOLINO}"
				}, {
					name: 'Por Definir',
					value: "{PORDEFINIR}"
				}],
				data: {
					path: "data>/KPI_PUERTA"
				}
			});
			oVizGraph.setDataset(oDataset);
			oVizGraph.setVizType('stacked_column');

			oVizGraph.setVizProperties({
				title: {
					text: "TONELADAS POR PUERTA CARGA / FECHA BRUTO"
				},
				plotArea: {
					dataLabel: {
						visible: false,
						showTotal: true
					}
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["Puerta 1", "Puerta 2", "Puerta 3", "Decapado", "Pintadora 2", "Galvanizadora 2", "Molino", "Por Definir"]
			}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Fecha"]
				});
			oVizGraph.addFeed(feedValueAxis);
			oVizGraph.addFeed(feedCategoryAxis);
		},

		_onload: function (Combo, oData, path, name) {
			var uri = "/XMII/Runner?Transaction=" + path +
				"&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oView = this.getView(),
				oCombo = oView.byId(Combo),
				oModel_empty = new sap.ui.model.json.JSONModel();

			oCombo.setModel(oModel_empty);
			oModel_empty.setData({});
			oCombo.setBusy(true);

			$.ajax({
				type: "GET",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
					if (opElement.firstChild != null) {
						var aData = JSON.parse(opElement.firstChild.data);
						if (aData !== undefined) {
							//Create the JSON model and set the data
							var oModel = new sap.ui.model.json.JSONModel();
							oCombo.setModel(oModel);
							oModel.setData(aData);
						} else {
							MessageToast.show("No se han recibido " + name);
						}
					} else {
						MessageToast.show("No se han recibido datos");
					}

					oCombo.setBusy(false);
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
					}
					oCombo.setBusy(false);
				});
		},

		loadData: function (oData, path) {
			var uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oView = this.getView(),
				oThis = this;

			$.ajax({
				type: "GET",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			}).done(function (xmlDOM) {
				var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
				//console.log(opElement);
				if (opElement.firstChild != null) {
					var aData = JSON.parse(opElement.firstChild.data);
					var dataModel = new JSONModel(aData);
					oView.setModel(dataModel, "data");
					//console.log(oView.getModel("data").getData());
					//oView.getModel().setProperty("/AVG", "abc");
				}
				else {
					MessageToast.show("No se han recibido datos");
				}
			})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: \u00BFHay conexi\u00F3n de red?");
					}
				});
		},

		onExport: function (oEvent) {
			var aCols, aProducts, oSettings, oSheet;
			var oView = this.getView();

			aCols = this.ColumnConfig_TransMonit();
			aProducts = this.getView().byId("TBLREP").getModel().getProperty('/ITEMS');

			oSettings = {
				workbook: {
					columns: aCols,
					context: { sheetName: 'RepoerteMonitorTransporte' }
				},
				dataSource: aProducts,
				fileName: "ReporteMonitorTransporte.xlsx"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					MessageToast.show('Se ha exportado reporte');
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		ColumnConfig_TransMonit: function () {
			return [
				{
					label: 'Transporte',
					type: 'string',
					property: 'TRANSPORTE',
				},
				{
					label: 'Tarjeton',
					property: 'TARJETON',
					type: 'string',
				},
				{
					label: 'Puerta',
					property: 'PUERTA',
					type: 'string',
				},
				{
					label: 'Tipo Carga',
					property: 'TIPOCARGA',
					type: 'string',
				},
				{
					label: 'Ciclo',
					property: 'CICLO',
					type: 'string',
				},
				{
					label: 'Chofer',
					property: 'CHOFER',
					type: 'string',
				},
				{
					label: 'Linea Transporte',
					property: 'LINEA',
					type: 'string',
				},
				{
					label: 'Proveedor',
					property: 'PROVEEDOR',
					type: 'string'
				},
				{
					label: 'Tipo Unidad',
					property: 'TIPOUNIDAD',
					type: 'string'
				},
				{
					label: 'Placas Tracto',
					type: 'string',
					property: 'TRACTO',
				},
				{
					label: 'Placas Plana',
					type: 'string',
					property: 'PLANA',
				},
				{
					label: 'Peso Tara',
					type: 'integer',
					property: 'PESO_TARA',
				},
				{
					label: 'Peso Bruto',
					type: 'integer',
					property: 'PESO_BRUTO',
				},
				{
					label: 'Peso Neto',
					type: 'integer',
					property: 'PESO',
				},
				{
					label: 'Fecha Registro',
					type: 'datetime',
					property: 'FECHA_LLEGO',
				},
				{
					label: 'Fecha Ingreso',
					type: 'datetime',
					property: 'FECHA_INGRESO',
				},
				,
				{
					label: 'Fecha Tara',
					type: 'datetime',
					property: 'FECHA_TARA',
				},
				{
					label: 'Fecha Carga',
					type: 'datetime',
					property: 'FECHA_CARGA',
				},
				{
					label: 'Fecha Descarga',
					type: 'datetime',
					property: 'FECHA_DESCARGA',
				},
				{
					label: 'Fecha Bruto',
					type: 'datetime',
					property: 'FECHA_BRUTO',
				},
				{
					label: 'Fecha Final',
					type: 'datetime',
					property: 'FECHA_FINAL',
				},
				{
					label: 'Fecha Salida',
					type: 'datetime',
					property: 'FECHA_SALIDA',
				},
				{
					label: 'TIEMPO',
					type: 'float',
					property: 'HORAS',
				},
				{
					label: 'TIEMPO C/D',
					type: 'float',
					property: 'HORAS_CARGA',
				},
			];
		},

		GeneraBoleta: function (oEvent) {
			var oSelectedItem = oEvent.getSource().getParent();
			var oBindingContext = oSelectedItem.getBindingContext();
			var transporte = oBindingContext.getProperty('TRANSPORTE');
			var path = 'MII/DatosTransaccionales/Transportes/Transaction/Get_BoletaBascula',
				uri = "/XMII/Runner?Transaction=" + path + "&OutputParameter=pdfString&Content-Type=text/xml";
			uri = uri.replace(/\s+/g, '');

			sap.ui.core.BusyIndicator.show(0);
			var oThis = this;
			$.ajax({
				type: "POST",
				dataType: "xml",
				cache: false,
				url: uri,
				data: {
					"TRANSPORTE": transporte
				}
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
					if (opElement.firstChild !== null) {
						var decodedPdfContent = atob(opElement.firstChild.data);
						var byteArray = new Uint8Array(decodedPdfContent.length)
						for (var i = 0; i < decodedPdfContent.length; i++) {
							byteArray[i] = decodedPdfContent.charCodeAt(i);
						}
						var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
						var blobUrl = URL.createObjectURL(blob);
						jQuery.sap.addUrlWhitelist("blob");

						oView.setModel(new sap.ui.model.json.JSONModel({
							data: blobUrl,
							tarjeton: transporte
						}), "test");
						oThis.onPDF();
					}
					else {
						MessageBox.alert("La solicitud ha fallado: �Hay conexi�n de red?");
					}
					sap.ui.core.BusyIndicator.hide();
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						MessageToast.show("La solicitud a fallado: " + textStatus);
					}
					sap.ui.core.BusyIndicator.hide();
				});
		},
		onCloseViewPdf: function () {
			this.oDialog.close();
		},
		onPDF: function () {
			if (!this.oDialog) {
				this.oDialog = oView.byId("ControlCargaPDF");
				// create dialog via fragment factory
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Transportes.ControlCarga", this);
				oView.addDependent(this.oDialog);
			}
			this.oDialog.open();
		},

	});
});