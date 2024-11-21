sap.ui.define([
	"sap/ui/demo/webapp/controller/BaseController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	'sap/ui/model/json/JSONModel',
	"../../model/formatter",
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format'
], function (BaseController, MessageToast, MessageBox, JSONModel, formatter,
	FlattenedDataset, ChartFormatter, Format) {
	"use strict";
	var xml_completo = '';
	var lote_inspeccion = '';
	var g_tieneDE;
	var lote_material = '';
	var g_material = '';
	var DocumentoGlobal = '';
	var inspeccion = '';
	var error_QM = 0;
	var validacion_echa = 1;
	var centro;
	return BaseController.extend("sap.ui.demo.webapp.controller.Calidad.InspeccionesPeriodicas", {

		formatter: formatter,

		//Funcion de inicializacion del controlador
		onInit: function () {
			const oView = this.getView();
			if (!oView.getModel("global"))
				oView.setModel(new JSONModel({ decision_Accept: false, expiryDate: "" }), "global")
			var oRouter = this.getRouter();
			oRouter.getRoute("InspeccionesPeriodicas").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function (oEvent) {
			/**
			 * @param {Event} oEvent funcion de evento manejador
			 */
			this._getUsuario("username", "inspeccion09");
			var tablaQm = this.byId("charListQM");

			var
				oArgs = oEvent.getParameter("arguments"),
				oView = this.getView();
			lote_inspeccion = oArgs.lote;
			DocumentoGlobal = oArgs.documento;
			lote_material = oArgs.producido;
			inspeccion = oArgs.tipo;
			centro = oArgs.centro;
			g_material = oArgs.material;
			g_tieneDE = oArgs.de == "Success";

			var oTable = oView.byId("charListQM"),
				oModel_empty = new sap.ui.model.json.JSONModel(),
				oThis = this;
			//clear table
			oModel_empty.setData({});
			oTable.setModel(oModel_empty);

			var aData = {
				"LOTE_INSPECCION": oArgs.lote,
				"DOCUMENTO": oArgs.documento,
				"LOTE": oArgs.producido,
				"TIPO": inspeccion,
				"MATERIAL": oArgs.material,
				"CENTRO": centro
			};

			this._base_onloadHeader(aData, "MII/DatosTransaccionales/Pedidos/Transaction/get_info_lote_v2", "Cabecera", "");

			var xData = {
				"LOTE_INSPECCION": oArgs.lote,
				"DOCUMENTO": oArgs.documento,
				"LOTE": lote_material,
				"TIPO": inspeccion,
				"OPERACION": "0010"
			};

			this.byId("btnInspeccionar").setProperty("enabled", false);
			this.byId("btnDE").setProperty("enabled", false);
			this.byId("btnInspeccionarMulti").setProperty("enabled", false);
			this.byId("btnDEMulti").setProperty("enabled", false);

			//this._base_onloadCOMBO("listOperation", xData, "MII/DatosTransaccionales/Calidad/Transaction/get_operation_QM", "","Operaciones");
			this._base_onloadCOMBO("listOperation", xData, "MII/DatosTransaccionales/Pedidos/Transaction/get_operation_QM", "", "Operaciones");
		},

		//Funcion que verifica las operaciones y los valores de las carateristicas 
		onVerifyAutomatico: function () {
			var oTable = this.byId("charListQM");
			var items = this.byId("charListQM").getItems(),
				oCtx;
			var operacion = this.byId("listOperation").getValue();
			var input = this.byId("inputValue");
			var combo = this.byId("comboMenu");

			oTable.setBusy(true);
			items.forEach(function (item) {

				oCtx = item.getBindingContext();
				//console.log(oCtx.getProperty("CHAR_TYPE"));

				xml_completo += '<Row>\n';
				xml_completo += '<DESCRIPCION>' + item.getCells()[1].getProperty("text") + '</DESCRIPCION>\n';
				xml_completo += "</Row>\n";

				/*var oItem = oEvent.getSource(),
					oCtx = oItem.getBindingContext();
					console.log(oCtx.getProperty("CHAR_TYPE"));*/

				if (oCtx.getProperty("CHAR_TYPE") === '01' || oCtx.getProperty("CHAR_TYPE") === '03') {
					//if(oCtx.getProperty("UP_TOL_LMT")>1000){
					//  var up_tol_lmt = oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.') == "" ?  0 :  oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.');
					//}else{
					var up_tol_lmt = oCtx.getProperty("UP_TOL_LMT").toString().replace(".", '');
					up_tol_lmt = new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.'))) ==
						"" ? new Intl.NumberFormat('de-DE').format(parseFloat(0)) : new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty(
							"UP_TOL_LMT").toString().replace(/\,/g, '.')));
					if (up_tol_lmt == "NaN") {
						up_tol_lmt = "9999";
					}
					//}
					var lw_to_lmt = oCtx.getProperty("LW_TO_LMT").toString().replace(".", '');
					lw_to_lmt = new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("LW_TO_LMT").toString().replace(/\,/g, '.'))) ==
						"" ? new Intl.NumberFormat('de-DE').format(parseFloat(-1000)) : new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty(
							"LW_TO_LMT").toString().replace(/\,/g, '.')));
					if (lw_to_lmt == "NaN") {
						lw_to_lmt = "-9999";
					}
					var value = oCtx.getProperty("VALOR").toString().replace(".", ''); /////////////
					value = new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("VALOR").toString().replace(/\,/g, '.')));

					var up, low, valor;

					up = up_tol_lmt.replace(".", "");
					up = up.replace(",", ".");
					up = parseFloat(up);
					low = lw_to_lmt.replace(".", "");
					low = low.replace(",", ".");
					low = parseFloat(low);
					valor = value.replace(".", "");
					valor = valor.replace(",", ".");
					valor = parseFloat(valor);

					if (!isNaN(valor)) {
						if (up == 0) {
							if (valor >= low) {
								item.getCells()[7].setSelectedKey("A");
								//oItem.getParent().getParent().getCells()[7].setSelectedKey("A");
								//oEvent.getSource().setValueState('Success');
								//oItem.getParent().getParent().getCells()[7].setValueState('Success');
								item.getCells()[7].setValueState('Success');
							} else {
								//oItem.getParent().getParent().getCells()[7].setSelectedKey("R");
								item.getCells()[7].setSelectedKey("R");
								//oEvent.getSource().setValueState('Error');
								//oItem.getParent().getParent().getCells()[7].setValueState('Error');
								item.getCells()[7].setValueState('Error');
							}
						} else {
							if (valor >= low && valor <= up) {
								item.getCells()[7].setSelectedKey("A");
								//oItem.getParent().getParent().getCells()[7].setSelectedKey("A");
								//  oEvent.getSource().setValueState('Success');
								//oItem.getParent().getParent().getCells()[7].setValueState('Success');
								item.getCells()[7].setValueState('Success');
							} else {
								item.getCells()[7].setSelectedKey("R");
								//oItem.getParent().getParent().getCells()[7].setSelectedKey("R");
								//oEvent.getSource().setValueState('Error');
								//oItem.getParent().getParent().getCells()[7].setValueState('Error');
								item.getCells()[7].setValueState('Error');
							}
						}
					}
				} else if (oCtx.getProperty("CHAR_TYPE") === '02') {

					if (oCtx.getProperty("sel_KEY").split(";")[0] == "A") {
						item.getCells()[7].setSelectedKey(oCtx.getProperty("sel_KEY").split(";")[0]);
						item.getCells()[7].setValueState('Success');
					} else if (oCtx.getProperty("sel_KEY").split(";")[0] == "R") {
						item.getCells()[7].setSelectedKey(oCtx.getProperty("sel_KEY").split(";")[0]);
						item.getCells()[7].setValueState('Error');
					}
				}
			});
			oTable.setBusy(false);
		},

		onVerifyValue: function (oEvent) {
			/////
			/*var testPreCalibration = sap.ui.getCore().byId("idNumCreate").getValue();
							   var noSpaces = testPreCalibration.replace(/ +/, '');
							   var isNum = /^\d+$/.test(noSpaces);
							   if(testPreCalibration !==isNum){
				  sap.ui.getCore().byId("idNumCreate").setValueState(sap.ui.core.ValueState.Error);
			  }*/

			var oItem = oEvent.getSource(),
				oCtx = oItem.getBindingContext();
			console.log(oCtx.getProperty("CHAR_TYPE"));
			up_tol_lmt = 999999999;
			lw_to_lmt = -999999999;
			var up_tol_lmt;
			var lw_to_lmt;
			var up, low, valor;

			if (oCtx.getProperty("CHAR_TYPE") === '01' || oCtx.getProperty("CHAR_TYPE") === '03') {
				//if(oCtx.getProperty("UP_TOL_LMT")>1000){
				//  var up_tol_lmt = oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.') == "" ?  0 :  oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.');
				//}else{
				if (oCtx.getProperty("UP_TOL_LMT") !== "") {
					up_tol_lmt = oCtx.getProperty("UP_TOL_LMT"); //.toString().replace(".", '');
					//up=up_tol_lmt.replace(".","");
					//up=up.replace(",",".");
					up = up_tol_lmt;
				} else {
					up = up_tol_lmt;
				}

				var a = new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.'))) == "" ?
					new Intl.NumberFormat('de-DE').format(parseFloat(0)) : new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty(
						"UP_TOL_LMT").toString().replace(/\,/g, '.')));
				//up_tol_lmt= new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.'))) == "" ?  new Intl.NumberFormat('de-DE').format(parseFloat(0)) :  new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("UP_TOL_LMT").toString().replace(/\,/g, '.')));
				if (a !== "NaN") {
					up_tol_lmt = a;
				}
				//}
				if (oCtx.getProperty("LW_TO_LMT") !== "") {
					lw_to_lmt = oCtx.getProperty("LW_TO_LMT"); //.toString().replace(".", '');
					//low=lw_to_lmt.replace(".","");
					//low=low.replace(",",".");
					low = lw_to_lmt;
				} else {
					low = lw_to_lmt;
				}

				var b = new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("LW_TO_LMT").toString().replace(/\,/g, '.'))) == "" ?
					new Intl.NumberFormat('de-DE').format(parseFloat(-1000)) : new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty(
						"LW_TO_LMT").toString().replace(/\,/g, '.')));
				//lw_to_lmt = new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("LW_TO_LMT").toString().replace(/\,/g, '.')))== "" ? new Intl.NumberFormat('de-DE').format(parseFloat(-1000)) :  new Intl.NumberFormat('de-DE').format(parseFloat(oCtx.getProperty("LW_TO_LMT").toString().replace(/\,/g, '.')));
				if (b !== "NaN") {
					lw_to_lmt = b;
				}
				var value = oItem.getValue().toString().replace(".", '');
				value = new Intl.NumberFormat('de-DE').format(parseFloat(oItem.getValue().toString().replace(/\,/g, '.')));

				up = parseFloat(up);

				low = parseFloat(low);
				valor = value.replace(".", "");
				valor = valor.replace(",", ".");
				valor = parseFloat(valor);

				// console.log(new Intl.NumberFormat('en-IN').format(up)+"  "+new Intl.NumberFormat('en-IN').format(low)+"  "+new Intl.NumberFormat('en-IN').format(valor));

				if (up === 0) {
					if (valor >= low) {
						oItem.getParent().getParent().getCells()[7].setSelectedKey("A");
						oEvent.getSource().setValueState('Success');
						oItem.getParent().getParent().getCells()[7].setValueState('Success');
					} else {
						oItem.getParent().getParent().getCells()[7].setSelectedKey("R");
						oEvent.getSource().setValueState('Error');
						oItem.getParent().getParent().getCells()[7].setValueState('Error');
					}
				} else {
					if (valor >= low && valor <= up) {
						oItem.getParent().getParent().getCells()[7].setSelectedKey("A");
						oEvent.getSource().setValueState('Success');
						oItem.getParent().getParent().getCells()[7].setValueState('Success');
					} else {
						oItem.getParent().getParent().getCells()[7].setSelectedKey("R");
						oEvent.getSource().setValueState('Error');
						oItem.getParent().getParent().getCells()[7].setValueState('Error');
					}
				}

			}
		},

		// Funcion de evento (press) para habilitar combobox de 'valor' de las caracteristicas 
		onEditar: function () {
			var oThis = this;
			var items = oThis.byId("charListQM").getItems();

			setTimeout(function () {
				items.forEach(function (item) {

					var elementos = item.getCells()[3].mAggregations;
					elementos.items.forEach(function (item) {
						item.setProperty("enabled", !g_tieneDE);
						item.setProperty("editable", !g_tieneDE);
					})

					var elementosStatus = item.getCells()[7];
					elementosStatus.setProperty("enabled", !g_tieneDE);
					elementosStatus.setProperty("editable", !g_tieneDE);

				});
			}, 1000);
		},

		//Funcion para abrir el fragment de inspeccion multiple
		onInspeccionMultiple: function (oEvent) {
			/**
			 * @param {Event} oEvent objecto de evento 
			 */

			var oView = this.getView(),
				oThis = this,
				oDialog = oView.byId("InsplotDisponible");

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Calidad.InsplotDisponible", oThis);
				oView.addDependent(oDialog);
			}
			oDialog.open();

			var operacion = this.byId("listOperation").getSelectedKey();

			var oData = {
				"LOTE_INSPECCION": lote_inspeccion,
				"OPERACION": operacion,
				"INSPECCION": true,
				"MATERIAL": g_material
			}
			console.log(oData);

			this._base_onloadTable("insplot_multiple", oData, "MII/DatosTransaccionales/Calidad/Transaction/get_insplot_multiple_09", "lotes", "");

		},

		// Envia inspeccion multiple
		onConfirmInspeccionMasiva: function () {
			if (xml_completo == "") {
				this.getOwnerComponent().openHelloDialog("Debes haber inspeccionado el lote.");
			} else {
				var combooperacion = this.byId('listOperation'),
					User_MII = this.byId("username").getText();
				if (combooperacion.getSelectedKey() == "") {
					this.getOwnerComponent().openHelloDialog("Debes seleccionar  una operacion.");
				} else {
					var items = this.getView().byId("insplot_multiple").getSelectedItems();
					var xml_lotes = '<Rowsets>\n';
					xml_lotes += '<Rowset>\n';

					items.forEach(function (item) {
						xml_lotes += "<Row>\n";
						// xml_lotes += '<DOCUMENTO>' + item.getCells()[2].getProperty("text") + '</DOCUMENTO>\n';
						// xml_lotes += '<LOTE>' + item.getCells()[3].getProperty("text") + '</LOTE>\n';
						xml_lotes += '<LOTE_INSPECCION>' + item.getCells()[0].getProperty("text") + '</LOTE_INSPECCION>\n';
						xml_lotes += '<OPERATION>' + combooperacion.getSelectedKey() + '</OPERATION>\n';
						xml_lotes += '<USER>' + User_MII + '</USER>\n';
						xml_lotes += '<USUARIO>' + User_MII + '</USUARIO>\n';
						xml_lotes += "</Row>\n";
					});
					xml_lotes += "</Rowset>\n";
					xml_lotes += "</Rowsets>\n";
					var oData = {
						"CHARS_QM": xml_completo,
						"XML_LOTES": xml_lotes
					};
					console.log(oData)
					this._handleMessageBoxConfirmInspeccionMultp("¿Confirmar envió de inspección multiple?", "warning", oData, this);
					//this.onSaveInspeccionMultiple("MII/DatosTransaccionales/Pedidos/Transaction/change_char_inspeccion_multiple",oData);
				}

			}
		},

		// Dialog de confirmación para inspección multiple
		_handleMessageBoxConfirmInspeccionMultp: function (sMessage, sMessageBoxType, oData, oThis) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						oThis.onSaveInspeccionMultiple('MII/DatosTransaccionales/Calidad/Transaction/change_char_inspeccion_multiple',
							oData);
					}
				}.bind(this)
			});
		},

		//Funcion del evento press para inspeccionar 
		onInspeccion: function (oEvent) {
			/**
			 * @param {Event} oEvent funcion de evento manejador
			 */
			var oThis = this;
			// validar si hay caracteristicas.
			var items = this.byId("charListQM").getItems();
			if (items.length > 0) {
				//Si no Tiene desicion de empleo permite inspeccionar
				if (!g_tieneDE) {
					var items = oThis.getView().byId("charListQM").getItems(),
						combooperacion = oThis.byId('listOperation'),
						//comboconsecutivo = this.byId('listOperationConsecutivo'),
						flag_OK = 0,
						char_missing = '';
					var resourceModel = oThis.getView().getModel("i18n");
					xml_completo = '<Rowsets>\n';
					xml_completo += '<Rowset>\n';
					error_QM = 0;
					var leyenda = "";
					items.forEach(function (item) {
						//console.log(!item.getProperty("title"))
						//console.log (item.getMetadata());

						if (item.getCells()[7].getProperty('enabled') == true) {

							if (item.getBindingContext().getProperty("sel_KEY_des") == "R" && inspeccion == "04") {
								error_QM++;
							}
							if (item.getBindingContext().getProperty("sel_KEY_des") == "R" && inspeccion == "03") {
								leyenda = "Hay caracteristicas del material Producido rechazadas";
								error_QM++;
							}
							if (!flag_OK) {
								xml_completo += '<Row>\n';
								xml_completo += '<SECUENCIA>' + item.getBindingContext().getProperty("INSPCHAR") + '</SECUENCIA>\n';
								xml_completo += '<TIPO>' + item.getBindingContext().getProperty("CHAR_TYPE") + '</TIPO>\n';
								if (item.getBindingContext().getProperty("CHAR_TYPE") === '02') {
									var key = item.getBindingContext().getProperty("sel_KEY");
									if (key !== undefined) {
										key = key.split(';');
										if (key[1] != "") {
											console.log(key[1]);
											xml_completo += '<MEAN_VALUE/>\n';
											xml_completo += '<SAMPLES/>\n';
											xml_completo += '<CODIGO>' + key[1] + '</CODIGO>\n';
											xml_completo += '<DESCRIPCION>' + item.getBindingContext().getProperty("CHAR_DESCR") + '</DESCRIPCION>\n';
											xml_completo += '<LIMT_INF>' + item.getBindingContext().getProperty("LW_TO_LMT") + '</LIMT_INF>\n';
											xml_completo += '<LIMT_SUP>' + item.getBindingContext().getProperty("UP_TOL_LMT") + '</LIMT_SUP>\n';
											xml_completo += '<UM>' + item.getBindingContext().getProperty("UNIT") + '</UM>\n';
											xml_completo += '<GRUPO>' + key[2] + '</GRUPO>\n';
											xml_completo += '<EVALUATION>' + item.getBindingContext().getProperty("sel_KEY_des") + '</EVALUATION>\n';
											xml_completo += '<MSTR_CHAR>' + item.getBindingContext().getProperty("MSTR_CHAR") + '</MSTR_CHAR>\n';
											// xml_completo += '<ID>' + item.getBindingContext().getProperty("ID_PDA") + '</ID>\n';
										}
									}

								} else if (item.getBindingContext().getProperty("CHAR_TYPE") === '03') {
									xml_completo += '<MEAN_VALUE/>\n';
									xml_completo += '<SAMPLES>' + item.getBindingContext().getProperty("VALOR") + '</SAMPLES>\n';
									xml_completo += '<CODIGO/>\n';
									xml_completo += '<DESCRIPCION>' + item.getBindingContext().getProperty("CHAR_DESCR") + '</DESCRIPCION>\n';
									xml_completo += '<LIMT_INF>' + item.getBindingContext().getProperty("LW_TO_LMT") + '</LIMT_INF>\n';
									xml_completo += '<LIMT_SUP>' + item.getBindingContext().getProperty("UP_TOL_LMT") + '</LIMT_SUP>\n';
									xml_completo += '<UM>' + item.getBindingContext().getProperty("UNIT") + '</UM>\n';
									xml_completo += '<GRUPO/>\n';
									xml_completo += '<EVALUATION>' + item.getBindingContext().getProperty("sel_KEY_des") + '</EVALUATION>\n';
									xml_completo += '<MSTR_CHAR>' + item.getBindingContext().getProperty("MSTR_CHAR") + '</MSTR_CHAR>\n';
									// xml_completo += '<ID>' + item.getBindingContext().getProperty("ID_PDA") + '</ID>\n';

								} else if (item.getBindingContext().getProperty("CHAR_TYPE") === '01') {
									xml_completo += '<MEAN_VALUE>' + item.getBindingContext().getProperty("VALOR") + '</MEAN_VALUE>\n';
									xml_completo += '<SAMPLES/>\n';
									xml_completo += '<CODIGO/>\n';
									xml_completo += '<DESCRIPCION>' + item.getBindingContext().getProperty("CHAR_DESCR") + '</DESCRIPCION>\n';
									xml_completo += '<LIMT_INF>' + item.getBindingContext().getProperty("LW_TO_LMT") + '</LIMT_INF>\n';
									xml_completo += '<LIMT_SUP>' + item.getBindingContext().getProperty("UP_TOL_LMT") + '</LIMT_SUP>\n';
									xml_completo += '<UM>' + item.getBindingContext().getProperty("UNIT") + '</UM>\n';
									xml_completo += '<GRUPO/>\n';
									xml_completo += '<EVALUATION>' + item.getBindingContext().getProperty("sel_KEY_des") + '</EVALUATION>\n';
									xml_completo += '<MSTR_CHAR>' + item.getBindingContext().getProperty("MSTR_CHAR") + '</MSTR_CHAR>\n';
									// xml_completo += '<ID>' + item.getBindingContext().getProperty("ID_PDA") + '</ID>\n';

								}
								xml_completo += "</Row>\n";
							}
						}

					});
					xml_completo += "</Rowset>\n";
					xml_completo += "</Rowsets>\n";
					if (1 == 1) {

						//if (error_QM != 0 && inspeccion == "04") {
						//   this.onPuestoTrabajoAfectar();
						// } else {
						if (validacion_echa != 1 && inspeccion == "01") {
							oThis.getOwnerComponent().openHelloDialog('Debe validar  primero el lote de proveedor.');
						} else {
							// console.log(xml_completo);
							var oData = {
								"CHARS_QM": xml_completo,
								"CODE": "",
								"DOCUMENTO": DocumentoGlobal,
								"CODE_GROUPE": "",
								"OPERATION": combooperacion.getSelectedKey(),
								"LOTE_INSPECCION": lote_inspeccion,
								"USUARIO": oThis.byId("username").getText(),
								"LOTE": lote_material,
								"USER": oThis.byId("username").getText(),

							};
							console.log(oData);
							console.log(error_QM);
							oThis._handleMessageBoxConfirm(resourceModel.getResourceBundle().getText(" ¿Confirma inspección?"), "warning", oData, this);
						}
						//}

					} else
						oThis.getOwnerComponent().openHelloDialog("La caracter\u00EDstica " + char_missing + ' esta vac\u00EDa');

				} else {
					this.getOwnerComponent().openHelloDialog("El lote ya tiene decisión de empleo");
				}
			} else {
				this.getOwnerComponent().openHelloDialog("No hay caracteristicas que reportar");
			}
		},

		// Dialog de confirmación para envío de inspecciones
		_handleMessageBoxConfirm: function (sMessage, sMessageBoxType, oData, oThis) {
			/**
			 * @param {string} sMessage - Mensaje que se mostrara en el cuadro de dialogo.
			 * @param {string} sMessageBoxType - Tipo de cuadro de dialogo, como "confirm", "warning", etc.
			 * @param {object} oData - Datos que se utilizaran en la accion en caso de confirmacion.
			 * @param {object} oThis - Referencia al contexto actual (this).
			 */
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {

					if (oAction === MessageBox.Action.YES) {
						oThis.saveInspection(oData, 'MII/DatosTransaccionales/Calidad/Transaction/change_char_inspeccion');
					}
				}.bind(this)
			});
		},

		//Funcion para cerrar el fragment de inspeccion de lotes multiple
		onCloseDialogInsplot: function () {
			this.getView().byId("InsplotDisponible").close();
		},

		//Funcion para recuperar las caracteristicas al seleccionar una operacion
		onChangeOperations: function (oEvent) {
			/**
			 * @param {Event} oEvent objecto de evento 
			 */

			var oThis = this;
			this.byId("btnInspeccionar").setProperty("enabled", true);
			this.byId("btnDE").setProperty("enabled", true);
			this.byId("btnInspeccionarMulti").setProperty("enabled", true);
			this.byId("btnDEMulti").setProperty("enabled", true);
			this.byId("comboMenu").setProperty("enabled", false);
			this.byId("inputValue").setProperty("enabled", false);

			var operacion = this.byId("listOperation").getSelectedKey();
			var aData = {
				"LOTE_INSPECCION": lote_inspeccion,
				"OPERACION": operacion,
				"DOCUMENTO": DocumentoGlobal,
				"LOTE": lote_material,
				"TIPO": inspeccion,
				"MATERIAL": g_material,
				"CENTRO": centro
			};

			sap.ui.core.BusyIndicator.show(0);
			oThis.sleep(500).then(() => {
				oThis._base_onloadHeader(aData, "MII/DatosTransaccionales/Pedidos/Transaction/get_info_lote", "Cabecera");

				oThis._base_onloadTable("charListQM", aData, "MII/DatosTransaccionales/Pedidos/Transaction/get_chars", "Chars", "", function () {
					sap.ui.core.BusyIndicator.hide();

				});

			});
			oThis.onVerifyAutomatico();
			oThis.onEditar();
		},

		// Cerrar dialog de inspeccion multiple
		onCloseDialogLotes: function () {
			this.getView().byId("InsplotDisponible").close();
			this.getView().byId("InsplotDisponible").destroy();
		},
		/*
				onChangeOperationsInspeccion: function (oEvent) {
					var oData = {
							"LOTE_INSPECCION": lote_inspeccion,
							"OPERACION": this.byId("listOperation").getSelectedKey(),
							"USERC1": oEvent.getParameter("selectedItem").getKey()
						}
						//his._base_onloadTable_post("charListQM", oData, "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/get_chars", "Chars inspecionadas", "");
					if (centro === "3000") {
						this._base_onloadTable_post("charListQM", oData, "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/get_chars_LASSO",
							"Chars", "");
					} else {
						this._base_onloadTable_post("charListQM", oData, "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/get_chars", "Chars", "");
					}

					setTimeout(function () {
						oThis.onVerifyAutomatico();
					}, 2000);
				},
		*/

		// Evento al modificar el item seleccionado en combo Valor de características
		changeCombo: function (oEvent) {
			var oItem = oEvent.getSource(),
				key = oItem.getSelectedKey();
			key = key.split(';');
			oItem.getParent().getParent().getCells()[7].setSelectedKey(key[0]);
			if (key[0] == "A") {
				oEvent.getSource().setValueState('Success');
				oItem.getParent().getParent().getCells()[7].setValueState('Success');
			} else {
				oEvent.getSource().setValueState('Error');
				oItem.getParent().getParent().getCells()[7].setValueState('Error');
			}
		},

		//Funcion para cerrar el dialogo de Desición de empleo 
		onCloseModal: function () {
			this.getView().byId("decisionEmpleo").close();
			this.getView().byId("decisionEmpleo").destroy();
		},

		//Funcion para cerrar el dialogo de defectos 
		onCloseDialogDefectos: function () {
			this.getView().byId("DefectosDialog").close();
			this.getView().byId("DefectosDialog").destroy();
		},

		// Ejecuta trx para inspeccion masiva
		onSaveInspeccionMultiple: function (path, oData) {
			var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
				"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
				"/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');

			var oThis = this;
			sap.ui.core.BusyIndicator.show(0);

			$.ajax({
				type: "POST",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

					if (opElement.firstChild != null) {
						var aData = eval(opElement.firstChild.data);
						if (aData[0].error !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							oThis.getOwnerComponent().openHelloDialog(aData[0].message);
							oThis.onCloseDialogLotes();
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

		/*
			SendDefecto: function (oData, path) {
				var User_MII = this.byId("username").getText();
				var combooperacion = this.byId('listOperation')
				var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
						"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
					"/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
				uri = uri.replace(/\s+/g, '');

				var oThis = this;

				sap.ui.core.BusyIndicator.show(0);

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
							var aData = eval(opElement.firstChild.data);
							if (aData[0].error !== undefined) {
								oThis.getOwnerComponent().openHelloDialog(aData[0].error);
							} else {
								//Create  the JSON model and set the data                                                                                                
								oThis.getOwnerComponent().openHelloDialog(aData[0].message);
								oThis.cleanFragmentDefectos();
								var oDataX = {
									"LOTE_INSPECCION": lote_inspeccion
								};
								oThis._base_onloadTable("Tabla_Defectos", oDataX,
									"CUERO_CENTRO/DatosTransaccionales/Recepcion/Transaction/defectos_lote_inspeccion", "Defectos registrados", "");
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
		*/
		/*
			onAnularRechazo: function () {
				var oData = {
					"DOCUMENTO": DocumentoGlobal,
					"LOTE_INSPECCION": lote_inspeccion
				};
				var resourceModel = this.getView().getModel("i18n");

				this._handleMessageBoxConfirmAnular(resourceModel.getResourceBundle().getText("¿Anular rechazo del material ?"), "warning", oData,
					this);
			},
		*/

		// Dialog de confirmación para anular rechazo
		_handleMessageBoxConfirmAnular: function (sMessage, sMessageBoxType, oData, oThis) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						oThis.saveAnulacionRechazo(oData, 'CUERO_CENTRO/DatosTransaccionales/Recepcion/Transaction/anular_rechazo_calidad');
					}
				}.bind(this)
			});
		},
		//Funcion para rechazar la informacion 
		saveAnulacionRechazo: function (oData, path) {

			/**
			 *  @param {object} oData - Datos que se utilizaran en la accion en caso de confirmacion.
			 * @param {string} path - Ruta para la accion a realizar en caso de confirmacion.
			 */
			var User_MII = this.byId("username").getText();
			var combooperacion = this.byId('listOperation')
			var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
				"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
				"/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');

			var oThis = this;

			sap.ui.core.BusyIndicator.show(0);

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
						var aData = eval(opElement.firstChild.data);
						if (aData[0].error !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							//Create  the JSON model and set the data                                                                                                
							oThis.getOwnerComponent().openHelloDialog(aData[0].message);
							var aDataX = {
								"LOTE_INSPECCION": lote_inspeccion,
								"OPERACION": combooperacion.getSelectedKey(),
								"DOCUMENTO": DocumentoGlobal,
								"LOTE": lote_material,
								"TIPO": inspeccion,
								"MATERIAL": g_material,
								"CENTRO": centro

							};

							oThis._base_onloadHeader(aDataX, "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/get_info_lote_inspeccion",
								"Cabecera");
							if (inspeccion == "04") {
								oThis.onImprimirEtiqueta(DocumentoGlobal, User_MII);

							}
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

		charBatch: function (oEvent) {
			/**
			 * @param {Event} oEvent objecto de evento 
			 */
			var cod_material = this.byId("material").getText();
			var material = cod_material.split(" ")[0],
				lote = this.byId("Lote").getText();

			var oView = this.getView(),
				oButton = oEvent.getSource();
			this._onOpenPopoverBatchChar(oView, oView.getId(), oButton, this, material, lote)
		},

		//Funcion para cerrar el dialog de Error de puesto de trabajo 
		onCancelar: function () {
			this.getView().byId("Error_puesto").close();
			this.getView().byId("Error_puesto").destroy();
		},

		// Funcion que abre el fragment DE unico 
		onDe: function () {
			var items = this.byId("charListQM").getItems();

			if (items.length > 0) {
				// si no tiene tiene DE
				if (!g_tieneDE) {
					var oView = this.getView(),
						oDialog = oView.byId("decisionEmpleo");
					oView.getModel("global").setProperty("/expiryDate", "")
					oView.getModel("global").setProperty("/decision_Accept", false)

					if (!oDialog) {
						// create dialog via fragment factory
						oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.De", this);
						oView.addDependent(oDialog);
					}

					var oData = {
						"LOTE_INSPECCION": lote_inspeccion
					};

					this._base_onloadCOMBO("Combo_decision", oData, "MII/DatosTransaccionales/Calidad/Transaction/get_codes_desition",
						"Catálogo Desicion de Empleo");

					oDialog.open();
				} else {
					this.getOwnerComponent().openHelloDialog("El lote ya tiene decisión de empleo");
				}
			} else {
				this.getOwnerComponent().openHelloDialog("No hay caracteristicas que reportar");
			}
		},

		// Funcion para enviar los datos de calidad 
		onSendDE: function () {
			const oView = this.getView();
			var combo = this.byId('Combo_decision');

			//var material = this.getView().getModel().getProperty("/MATERIAL");
			var lote = lote_material;
			var operacion = this.byId("listOperation").getSelectedKey();
			var items = this.byId("charListQM").getItems();
			var muestra = this.byId("tam_muestra").getText();
			var orden = this.byId("orden").getText();
			muestra = parseInt(muestra);
			var inspeccion = "";
			var valida = 0;

			items.forEach(function (item) {
				if (muestra >= 1) {
					inspeccion = item.getCells()[10].getProperty("text");
					inspeccion = parseInt(inspeccion);
					if (inspeccion < muestra) {
						valida++
					}
				}

			})

			if (combo.getSelectedItem() === null)
				this.getOwnerComponent().openHelloDialog("Selecciona una valoraci\u00F3n");
			else {
				var key = combo.getSelectedKey();
				var text = combo.getSelectedItem().getText();
				var code = combo.getSelectedItem().getAdditionalText();

				var oData = {
					"LOTE_INSPECCION": lote_inspeccion,
					"CENTRO": centro,
					"ORDEN": orden,
					"UD_CODE": String(code).trim(),
					"UD_CODE_GROUP": String(key).trim(),
					"UD_SELECTED_SET": String(key).trim(),
					"UD_TEXT": text,
					"MATERIAL": g_material,
					"LOTE": lote,
					"OPERACION": operacion,
					"FECHA_VENCIMIENTO": oView.getModel("global").getProperty("/expiryDate")
				};
				if (valida === 0) {
					this.saveDE(oData, 'MII/DatosTransaccionales/Calidad/Transaction/calidad_DE');
				} else {
					this._handleMessageDE("Aun hay caracteristicas sin inspeccionar desea continuar con la Desición de Empleo?", "warning", oData,
						this);
				}
			}
		},

		// Dialog de confirmación para registrar DE
		_handleMessageDE: function (sMessage, sMessageBoxType, oData, oThis) {
			/**
			 * @param {string} sMessage - Mensaje que se mostrara en el cuadro de dialogo.
			 * @param {string} sMessageBoxType - Tipo de cuadro de dialogo, como "confirm", "warning", etc.
			 * @param {object} oData - Datos que se utilizaran en la accion en caso de confirmacion.
			 * @param {object} oThis - Referencia al contexto actual (this).
			 */
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						oThis.saveDE(oData, 'MII/DatosTransaccionales/Calidad/Transaction/calidad_DE');
					}
				}.bind(this)
			});
		},
		/*
				onSendInspection: function () {
					var oView = this.getView(),
						combooperacion = oView.byId('listOperation'),
						combo = oView.byId('lote_decision');
					if (combo.getSelectedKey() === "")
						this.getOwnerComponent().openHelloDialog("Selecciona una valoraci\u00F3n");
					else {
						var key = combo.getSelectedKey().split(';'),
							oData = {
								"CHARS": xml_completo,
								"CODE": key[1],
								"CODE_GROUPE": key[2],
								"LOTE_INSPECCION": lote_inspeccion,
								"OPERATION": combooperacion.getSelectedKey(),
							};
						console.log(oData)
						this.onCloseModalInspection();
						this.saveInspection(oData, 'CUERO_CENTRO/DatosTransaccionales/Recepcion/Transaction/inspeccion_calidad');
					}

				},
		*/

		// Ejecuta transaccion para registrar DE 
		saveDE: function (oData, path) {
			/**
			 *  @param {object} oData - Datos de entrada para la transaccion.
			 * @param {string} path - Ruta de la transaccion.
			 */

			var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
				"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
				"/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oThis = this;
			sap.ui.core.BusyIndicator.show(0);

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
						var aData = eval(opElement.firstChild.data);
						if (aData[0].error !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							//Create  the JSON model and set the data                                                                                                
							oThis.getOwnerComponent().openHelloDialog(aData[0].message);
							oThis.onCloseModal();

							var aData = {
								"LOTE_INSPECCION": lote_inspeccion,
								"DOCUMENTO": DocumentoGlobal,
								"TIPO": inspeccion,
								"MATERIAL": g_material,
								"CENTRO": centro
							};

							oThis._base_onloadHeader(aData, "MII/DatosTransaccionales/Pedidos/Transaction/get_info_lote", "Cabecera");
							g_tieneDE = true;
							sap.ui.core.BusyIndicator.hide();
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

		onDEMultiInspeccionar: function () {
			var oView = this.getView(),
				oDialog = oView.byId("InspeccionarDialogDE");
			var oData = {
				"LOTE_INSPECCION": lote_inspeccion,
				"INSPECCION": false,
				"MATERIAL": g_material
			};
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Calidad.DEMultiple", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			this._base_onloadCOMBO("Combo_decisionMULTI", oData, "MII/DatosTransaccionales/Calidad/Transaction/get_codes_desition", "");
			this._base_onloadTable("Tabla_LotesDE", oData, "MII/DatosTransaccionales/Calidad/Transaction/get_insplot_multiple_09", "lotes", "");
		},

		// Crea array para enviar a transaccion de DE Masiva
		onConfirmDEMasiva: function () {
			let combo = this.byId("Combo_decisionMULTI");
			let key = combo.getSelectedKey();
			let User_MII = this.byId("username").getText();
			var operacion = this.byId("listOperation").getSelectedKey();
			var oThis = this,
				oView = this.getView();

			if (combo.getSelectedKey() === "") {
				oView.getController().getOwnerComponent().openHelloDialog("Selecciona una valoraci\u00F3n");
				return;
			}

			let text = combo.getSelectedItem().getText();
			let code = combo.getSelectedItem().getAdditionalText();

			var items = this.getView().byId("Tabla_LotesDE").getSelectedItems();
			var xml_lotes = '<Rowsets>\n';
			xml_lotes += '<Rowset>\n';

			items.forEach(function (item) {
				xml_lotes += "<Row>\n";
				xml_lotes += '<CENTRO>' + centro + '</CENTRO>\n';
				xml_lotes += '<LOTE_INSPECCION>' + item.getCells()[0].getProperty("text") + '</LOTE_INSPECCION>\n';
				xml_lotes += '<MATERIAL>' + item.getCells()[3].getProperty("text") + '</MATERIAL>\n';
				xml_lotes += '<OPERACION>' + operacion + '</OPERACION>\n';
				xml_lotes += '<UD_CODE>' + code + '</UD_CODE>\n';
				xml_lotes += '<UD_CODE_GROUP>' + key + '</UD_CODE_GROUP>\n';
				xml_lotes += '<UD_SELECTED_SET>' + key + '</UD_SELECTED_SET>\n';
				xml_lotes += '<UD_TEXT>' + text + '</UD_TEXT>\n';
				xml_lotes += '<LOTE>' + lote_material + '</LOTE>\n';
				xml_lotes += '<FECHA_VENCIMIENTO>' + oView.getModel("global").getProperty("/expiryDate") + '</FECHA_VENCIMIENTO>\n';
				xml_lotes += "</Row>\n";
			});
			xml_lotes += "</Rowset>\n";
			xml_lotes += "</Rowsets>\n";

			var oData = {
				"inXML_DE": xml_lotes,
				"USUARIO": User_MII
			};
			console.log(oData);

			oView.getController().saveDEMultiple(oData, 'MII/DatosTransaccionales/Calidad/Transaction/calidad_DE_multiples');
		},

		// Ejecuta trx para registrar DE Masiva
		saveDEMultiple: function (oData, path) {
			var combooperacion = this.byId('listOperation')
			var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server")) + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oThis = this;

			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: "POST",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
					console.log(opElement)

					if (opElement.firstChild != null) {
						var aData = eval(opElement.firstChild.data);
						if (aData[0].error !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							//Create  the JSON model and set the data                                                                                                
							oThis.getOwnerComponent().openHelloDialog(aData[0].message);
							oThis.onCloseDialogLotesDE();
						}
					} else {
						oThis.getOwnerComponent().openHelloDialog("No se recibio informacion");
					}
					sap.ui.core.BusyIndicator.hide();
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexion de red?");
					}
					sap.ui.core.BusyIndicator.hide();
				});
		},

		// Cierra dialog DE Masiva
		onCloseDialogLotesDE: function () {
			this.getView().byId("InspeccionarDialogDE").close();
			this.getView().byId("InspeccionarDialogDE").destroy();
		},

		// Registra inspecciones
		saveInspection: function (oData, path) {
			/**
			 *  @param {object} oData - Datos de entrada para la transaccion.
			 * @param {string} path - Ruta de la transaccion.
			 */
			var User_MII = this.byId("username").getText();
			var combooperacion = this.byId('listOperation');
			var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
				"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
				"/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');

			var oThis = this;

			sap.ui.core.BusyIndicator.show(0);

			$.ajax({
				type: "POST",
				dataType: "xml",
				cache: false,
				url: uri,
				data: oData
			})
				.done(function (xmlDOM) {
					var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

					if (opElement.firstChild != null) {
						var aData = eval(opElement.firstChild.data);
						if (aData[0].error !== undefined) {
							//REVISAR SI SE DEBE PONER DE NUEVO EL ERROR "El lote de inspeccion tiene algunas caracteristicas rechazadas."     oThis.getOwnerComponent().openHelloDialog(aData[0].error); 
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							//Create  the JSON model and set the data                                                                                                
							oThis.getOwnerComponent().openHelloDialog(aData[0].message);
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

		//Funcion para la pausa de la recopilacion de datos asyncronas 
		sleep: function (ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},

		// **** Observaciones ****
		//Funcion para abrir el fragmento de observaciones 
		onObservacion: function (oEvent) {
			/**
			 * @param {Event} oEvent objecto de evento 
			 */
			var oView = this.getView();
			var oDialog = oView.byId("ObservacionQM");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.Observacion", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},

		//Funcion para cerrar el fragmento de observaciones 
		onCloseModalObservacion: function () {
			this.getView().byId("ObservacionQM").close();
			this.getView().byId("ObservacionQM").destroy();
		},

		//Funcion para guardar observaciones
		onSave: function () {
			var Observacion = this.byId('observacion_qm').getValue();
			if (Observacion == "") {
				this.getOwnerComponent().openHelloDialog("Debe llenar  campo de observacion.");

			} else {
				var
					oData = {
						"LOTE_INSPECCION": lote_inspeccion,
						"OBSERVACION": this.byId('observacion_qm').getValue()
					};
				var path = "CUERO_CENTRO/DatosTransaccionales/Recepcion/Transaction/observacion_lote_inspeccion";
				var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
					"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
					"/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
				uri = uri.replace(/\s+/g, '');

				var oThis = this;

				sap.ui.core.BusyIndicator.show(0);

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
							var aData = eval(opElement.firstChild.data);
							if (aData[0].error !== undefined) {
								oThis.getOwnerComponent().openHelloDialog(aData[0].error);
							} else {
								oThis.getOwnerComponent().openHelloDialog(aData[0].message);
								oThis.onCloseModalObservacion();
								oThis.byId('observacion_qm').setValue("");
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
			}

		},

		// **** Defectos ****
		//Funcion que limpia el fragmento de defectos 
		cleanFragmentDefectos: function () {
			var idGrupo = this.byId("listPadres");
			var idDefecto = this.byId("listHijos");
			idDefecto.setSelectedKey("");
			idGrupo.setSelectedKey("");
			this.byId("observacion_defecto").setValue("");
		},

		// Registrar defecto
		onSaveDefecto: function () {
			var resourceModel = this.getView().getModel("i18n");
			var idGrupo = this.byId("listPadres");
			var idDefecto = this.byId("listHijos");
			if (idGrupo.getSelectedKey() != "" && idDefecto.getSelectedKey() != "") {
				var oData = {
					"ID_DEFECTO": idDefecto.getSelectedKey(),
					"LOTE_INSPECCION": lote_inspeccion,
					"DESCRIPCION": this.byId("observacion_defecto").getValue(),
					"USUARIO": this.byId("username").getText()
				};
				this._handleMessageBoxConfirmDefecto(resourceModel.getResourceBundle().getText("¿Confirma registro de un defecto ?"), "warning",
					oData, this);

			} else {
				this.getOwnerComponent().openHelloDialog("Debes seleccionar una clase y defecto a  registrar.");

			}
		},

		// Dialog de confirmación para registrar defecto
		_handleMessageBoxConfirmDefecto: function (sMessage, sMessageBoxType, oData, oThis) {
			/**
			 * @param {string} sMessage - Mensaje que se mostrara en el cuadro de dialogo.
			 * @param {string} sMessageBoxType - Tipo de cuadro de dialogo, como "confirm", "warning", etc.
			 * @param {object} oData - Datos que se utilizaran en la accion en caso de confirmacion.
			 * @param {object} oThis - Referencia al contexto actual (this).
			 */
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						oThis.SendDefecto(oData, 'CUERO_CENTRO/DatosTransaccionales/Recepcion/Transaction/registrar_defecto_lote');
					}
				}.bind(this)
			});
		},

		//Funcion para cerrar el fragmento del dialogo de defectos 
		onCloseDialogDefectos: function () {
			this.getView().byId("DefectosDialog").close();
		},

		onChangePadres: function (oEvent) {
			/**
			 * @param {Event} oEvent objecto de evento 
			 */
			var oData = {
				"ID_GRUPO_DEFECTO": oEvent.getParameter("selectedItem").getKey()
			};
			this._base_onloadCOMBO("listHijos", oData, "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/get_defectos", "");
		},

		//Funcion para recuperar registros de defectos 
		OnDefectos: function (oEvent) {
			/**
			 * @param {Event} oEvent objecto de evento 
			 */
			var oView = this.getView();
			var oDialog = oView.byId("DefectosDialog");
			var mat = this.byId("material").getText();
			var material = mat.split(" ")[2];
			console.log(mat)
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.RegistroDefectos", this);
				oView.addDependent(oDialog);
			}
			var oData = {
				"LOTE_INSPECCION": lote_inspeccion,
				"MATERIAL": material
			};
			this._base_onloadTable("Tabla_Defectos", oData, "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/defectos_lote_inspeccion",
				"Defectos registrados", "");
			this._base_onloadCOMBO("listPadres", oData, "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/get_grupo_defectos", "");

			var path = "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/GET_CANTIDAD_PROGRAMADA_POR_ORDEN";
			var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
				"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
				"/XMII/Runner?Transaction=" + path +
				"&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');
			var oThis = this;

			oThis._base_onloadCOMBO("listHijos", "", "DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/get_defectos", "");

			console.log(oView.getModel().getData().ORDEN)

			$.ajax({
				type: "GET",
				dataType: "xml",
				cache: false,
				url: uri,
				data: {
					"ORDEN": oView.getModel().getData().ORDEN
				}
			})
				.done(function (xmlDOM) {
					console.log(xmlDOM)

					if (xmlDOM.getElementsByTagName("Row")[0].firstChild) {
						var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;
						var aData = JSON.parse(opElement.firstChild.data);
						var aModelData = oThis.getView().getModel().getData();
						console.log(aModelData)

						if (aData.ITEMS.length > 0) {
							aModelData.CANTIDAD_PROGRAMADA = aData.ITEMS[0].CANTIDAD_PROGRAMADA;
						} else {
							aModelData.CANTIDAD_PROGRAMADA = "0";
						}

						oThis.getView().getModel().setData(aModelData);
						oThis.byId("cantidad").setValue(aModelData.CANTIDAD_PROGRAMADA);
					}
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					if (console && console.log) {
						oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: Hay conexion de red?");
					}
				});

			oDialog.open();
		},

		//Funcion para guardar el registro de un defecto 
		onSaveDefecto: function () {
			var resourceModel = this.getView().getModel("i18n");
			var idGrupo = this.byId("listPadres");
			var idDefecto = this.byId("listHijos");
			var cantidad = this.byId("cantidad").getValue();
			if (idGrupo.getSelectedKey() != "" && idDefecto.getSelectedKey() != "") {
				if (cantidad !== "") {
					var oData = {
						"ID_DEFECTO": idDefecto.getSelectedKey(),
						"CANTIDAD": cantidad,
						"LOTE_INSPECCION": lote_inspeccion,
						"DESCRIPCION": this.byId("observacion_defecto").getValue(),
						"USUARIO": this.byId("username").getText()
					};
					this._handleMessageBoxConfirmDefecto(resourceModel.getResourceBundle().getText("¿Confirma registro de un defecto ?"), "warning",
						oData, this);
				} else {
					this.getOwnerComponent().openHelloDialog("Es necesario ingresar la cantidad de unidades con defecto");
				}
			} else {
				this.getOwnerComponent().openHelloDialog("Debes seleccionar una clase y defecto a  registrar");

			}
		},

		// Funcion para limpiar el fragmento de registro de defectos 
		cleanFragmentDefectos: function () {
			var idGrupo = this.byId("listPadres");
			var idDefecto = this.byId("listHijos");
			idDefecto.setSelectedKey("");
			idGrupo.setSelectedKey("");
			this.byId("observacion_defecto").setValue("");
		},

		// Dialog de confirmación
		_handleMessageBoxConfirmDefecto: function (sMessage, sMessageBoxType, oData, oThis) {
			/**
			 * @param {string} sMessage - Mensaje que se mostrara en el cuadro de dialogo.
			 * @param {string} sMessageBoxType - Tipo de cuadro de dialogo, como "confirm", "warning", etc.
			 * @param {object} oData - Datos que se utilizaran en la accion en caso de confirmacion.
			 * @param {object} oThis - Referencia al contexto actual (this).
			 */
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						oThis.SendDefecto(oData, 'DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/registrar_defecto_lote');
					}
				}.bind(this)
			});
		},

		//Funcion para registrar defectos
		SendDefecto: function (oData, path) {
			/**
			 *  @param {object} oData - Datos de entrada para la transaccion.
			 * @param {string} path - Ruta de la transaccion.
			 */
			var User_MII = this.byId("username").getText();
			var combooperacion = this.byId('listOperation')
			var uri = window.location.protocol + "//" + (window.location.hostname === "localhost" ? "localhost:8010/proxy" : (window.location.hostname ===
				"localhost" ? "localhost:8010/proxy" : this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server"))) +
				"/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
			uri = uri.replace(/\s+/g, '');

			var oThis = this;

			sap.ui.core.BusyIndicator.show(0);

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
						var aData = eval(opElement.firstChild.data);
						if (aData[0].error !== undefined) {
							oThis.getOwnerComponent().openHelloDialog(aData[0].error);
						} else {
							//Create  the JSON model and set the data                                                                                                
							oThis.getOwnerComponent().openHelloDialog(aData[0].message);
							oThis.cleanFragmentDefectos();
							var oDataX = {
								"LOTE_INSPECCION": lote_inspeccion
							};
							oThis.byId("cantidad").setValue("");
							oThis._base_onloadTable("Tabla_Defectos", oData,
								"DMCe/NOVACERO/DatosTransaccionales/Calidad/Transacction/defectos_lote_inspeccion", "Defectos registrados", "");
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
		onDEChange: function (oEvent) {
			let oView = this.getView(),
				oSource = oEvent.getSource(),
				oItem = oSource.getSelectedItem(),
				oAdditionalTxt = oItem.getProperty("additionalText"),
				oDatePicker = oView.byId("expiryDatePicker"),
				oDateLabel = oView.byId("dateExpLabel");
			let bState = oAdditionalTxt.startsWith("A");
			oView.getModel("global").setProperty("/decision_Accept", bState);
			if (!bState)
				oView.getModel("global").setProperty("/expiryDate", "");
			oDatePicker.setVisible(bState);
			oDateLabel.setVisible(bState);
		}
	});
});