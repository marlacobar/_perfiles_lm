sap.ui.define(
	[], 
	function() {
	"use strict";
	return {
		date: function(sDate) {
			// var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			try {
				if (sDate !== null) {
					if (sDate === "TimeUnavailable") return '';
					else {
						var sDate_aux,
							sDate_format = '';
						if (sDate !== null) {
							sDate_aux = sDate.split('T');
							sDate_format = sDate_aux[0] + ' ' + (sDate_aux[1]=='undefined'?sDate_aux[1]:"");
						}
						return sDate_format;
					}
				} else {
					return sDate;
				}
			} catch (err) {
				console.log("ERROR");
			}
		},
		statusfabricacionText: function(sState) {
			switch (sState) {
				case "0":
					return "";
				case "1":
					return "Liberada";
				case "2":
					return "Abierta";
				case "3":
					return "En proceso";
				case "4":
					return "Pendiente";
				case "5":
					return "Cerrada";
				default:
					return "";
			}
		},
		statusfabricacionColor: function(sStateValue) {
			switch (sStateValue) {
				case "0":
					return 9;
				case "1":
					return 5;
				case "2":
					return 2;
				case "3":
					return 7;
				case "4":
					return 1;
				case "5":
					return 3;
				default:
					return 9;
			}
		},
		TextoStateColorStandarVR: function(sState) {
			switch (sState) {
				case "NOK":
					return "Error";
				default:
					return "None";
			}
		},
		TextoStateTile: function(sState) {
			switch (sState) {
				case "1":
					return "Success";
				case "0":
					return "Warning";
			}
		},
		TextoTile: function(sState) {
			switch (sState) {
				case "1":
					return "Activado.";
				case "0":
					return "Desactivado.";
			}
		},
		TextoId: function(sState) {
			switch (sState) {
				case "MFR1-010":
					return "LAMINACION EN FRIO 1";
				case "ACA1-010":
					return "ACANALADO 1";
				case "ACA2-010":
					return "ACANALADO 2";
				case "ACA3-010":
					return "ACANALADO 3";
				case "CCL2-010":
					return "PINTADO 2";
				case "CGL1-010":
					return "GALVANIZADO 1";
				case "CGL2-010":
					return "GALVANIZADO 2";
				case "DEC1-010":
					return "DECAPADO 1";
				case "MB01-010":
					return "MULTIBLANKING 1";
				case "SL01-010":
					return "SLITER 1";
			}
		},
		TextoStateColor: function(sState) {
			switch (sState) {
				case "1":
					return "Success";
				case "2":
					return "Warning";
			}
		},
		TextoState: function(sState) {
			switch (sState) {
				case "1":
					return "Justificado.";
				case "2":
					return "Sin justificar";
			}
		},
		TextoStatePesaje: function(sState) {
			switch (sState) {
				case "3":
					return "Error";
				case "2":
					return "None";
				case "1":
					return "Success";
				default:
					return "Warning";
			}
		},
		TextoStatePesajeText: function(sState) {
			switch (sState) {
				case "3":
					return "Sin Salida - Reintento";
				case "2":
					return "Salida en proceso";
				case "1":
					return "Salida completada";
				default:
					return "Sin Salida";
			}
		},
		TextoStateColorOt: function(sState) {
			switch (sState) {
				case "1":
					return "Success";
				case "0":
					return "Warning";
				case "3":
					return "Error";
			}
		},
		TextoStat: function(sState) {
			switch (sState) {
				case "1":
					return "Terminado";
				case "0":
					return "Merma";
				case "3":
					return "Retorno";
			}
		},
		StatColor: function(sState) {
			switch (sState) {
				case "1":
					return 0;
				case "0":
					return 2;
				case "3":
					return 3;
			}
		},
		TextoStateColorTransportes: function(sState) {
			switch (sState) {
				case "1":
					return "Success";
				case "0":
					return "Warning";
			}
		},
		TextoStateOtTransportes: function(sState) {
			switch (sState) {
				case "1":
					return "Salida completada";
				case "0":
					return "Sin Salida";
			}
		},
		TextoColorTransportes: function(sState) {
			switch (sState) {
				case "1":
					return "Success";
				case "2":
					return "Warning";
				case "3":
					return "Error";
			}
		},
		TextoTransportes: function(sState) {
			switch (sState) {
				case "1":
					return "Solo tractor";
				case "2":
					return "Vehiculo  de carga vació";
				case "3":
					return "Vehiculo de carga con producto";
			}
		},
		TextoWM: function(sState) {
			switch (sState) {
				case "0":
					return "Sin ubicar";
				case "1":
					return "Ubicado";
			}
		},
		TextoWMEstado: function(sState) {
			switch (sState) {
				case "0":
					return "Error";
				case "1":
					return "Success";
			}
		},
		TextoLote: function(sState) {
			switch (sState) {
				case "Q":
					return "Stock en ctrl calidad";
				case "S":
					return "Stock bloqueado";
				default:
					return "Stock en  libre";
			}
		},
		TextoLoteEstado: function(sState) {
			switch (sState) {
				case "Q":
					return "Warning";
				case "S":
					return "Error";
				default:
					return "Success";
			}
		},
		TextoStateOt: function(sState) {
			switch (sState) {
				case "1":
					return "Confirmada";
				case "0":
					return "Sin confirmar";
				case "3":
					return "Sin ot";
			}
		},
		conditionColor: function(sState) {
			switch (sState) {
				case "0":
					return "Success";
				case "1":
					return "Warning";
				case "3":
					return "Error";
			}
		},
		causaParo: function(sData) {
			if (sData === '---') return 'Sin Causa';
			else return sData;
		},
		turno: function(sTurno) {
			switch (sTurno) {
				case "1":
					return "Mañana";
				case "2":
					return "Tarde";
				case "3":
					return "Noche";
				default:
					return "DESCONOCIDO";
			}
		},
		tipoCreacion: function(sTurno) {
			switch (sTurno) {
				case "A":
					return "Automático";
				case "M":
					return "Manual";
				default:
					return "DESCONOCIDO";
			}
		},
		caracteristica: function(sData) {
			if (sData == ' / 0') return '';
			else return sData;
		},
		tipoParo: function(sData) {
			switch (sData) {
				case "P":
					return "TP";
				case "V":
					return "TNP";
			}
		},
		codCalidad: function(sState) {
			switch (sState) {
				case "A":
					return "A-Aceptado";
				case "A1":
					return "A1-Aceptado";
				case "R":
					return "R-Rechazado";
				case "R1":
					return "R1-Bloqueado";
				case "R3":
					return "R3-Reproceso";
				case "TOTAL":
					return "TOTAL";
			}
		},
		estatusWmColor: function(sEstatus) {
			switch (sEstatus) {
				case "Contado":
					return "Success";
				case "Sin Documento":
					return "Error";
				case "Borrado":
					return "Error";
				case "Abierto":
					return "Warning";
				case "En Proceso":
					return "Information";
			}
		},
		invtHdrActText: function(sActivo) {
			switch (sActivo) {
				case "0":
					return "Borrado";
				case "1":
					return "Activo";
				case "2":
					return "Cerrado";
				default:
					return "";
			}
		},
		invtHdrActColor: function(sActivo) {
			switch (sActivo) {
				case "0":
					return "Error";
				case "1":
					return "Information";
				case "2":
					return "Success";
			}
		},
		datePlan: function(sDate) {
			//var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			try {
				if (sDate !== null) {
					if (sDate === "TimeUnavailable") return '';
					else {
						var sDate_aux,
							sDate_format = '';
						if (sDate !== null) {
							sDate_aux = sDate.split('T');
							sDate_format = sDate_aux[0];
						}
						return sDate_format;
					}
				} else {
					return sDate;
				}
			} catch (err) {
				console.log("ERROR");
			}
		},
		report_visible: function(status) {
			switch (status) {
				case "true":
					return true;
					break;
				default:
					return false;
					break;
			}
		},
		stripLeadingZeros: function(sState) {
			if (sState == "") {
				return "";
			} else {
				return isNaN(sState) ? sState : parseInt(sState);
			}
		},
// #################################################
		orderText: function(sState) {
			switch (sState) {
				case "1":
					return "Activa";
				case "---":
					return "Inactiva";
				default:
					return "Inactiva";
			}
		},
		availableState: function(sStateValue) {
			switch (sStateValue) {
				case "1":
					return 8;
				case "":
					return 8;
				case "---":
					return 3;
				case "2":
					return 5;
				case "Q":
					return 3;
				case "S":
					return 5;
				default:
					return 9;
			}
		},
		elementVisible: function(sState) {
			if (sState === "0") return false;
			else return true;
		},
		_elementVisible: function(sState) {
			if (sState === "X") return true;
			else return false;
		},
// #################################################
		emptyText: function(sStatus) {
			switch (sStatus) {
				case "---":
					return "";
				default:
					return sStatus;
			}
		},
		componentText: function(sState) {
			switch (sState) {
				case "1":
					return "Activo";
				case "---":
					return "Inactivo";
				case "2":
					return "Terminado";
				default:
					return "Inactivo";
			}
		},
		activateText: function(sState) {
			switch (sState) {
				case "1":
					return "Trabajando";
				case "0":
					return "Detenida";
				default:
					return "Detenida";
			}
		},
		availableStateR: function(sStateValue) {
			switch (sStateValue) {
				case "X":
					return 9;
				case "---":
					return 8;
				default:
					return 8;
			}
		},
		lineStop: function(sStateValue) {
			switch (sStateValue) {
				case "1":
					return 8;
				case "0":
					return 3;
				default:
					return 9;
			}
		},
		availableStateSFC: function(sStateValue) {
			switch (sStateValue) {
				case "---":
					return 8;
				case "2":
					return 5;
				default:
					return 3;
			}
		},
		inspeccionadoText: function(sState) {
			switch (sState) {
				case "1":
					return "Inspeccionado";
				case "":
					return "Inspeccionado";
				case "---":
					return "Pendiente";
				case "S":
					return "Bloqueado";
				default:
					return "Pendiente";
			}
		},
		SFCText: function(sState) {
			switch (sState) {
				case "---":
					return "Iniciado";
				case "2":
					return "Terminado";
				default:
					return "Desconocido";
			}
		},
		rangoDias: function(sDias) {
			if (sDias <= 60) {
				return 3;
			}
			if (sDias >= 60 && sDias <= 90) {
				return 1;
			}
			if (sDias > 90) {
				return 8;
			}
			return 1;
		},
		retornoText: function(sState) {
			switch (sState) {
				case "X":
					return "Retorno";
				case "---":
					return "Terminado";
				default:
					return "Terminado";
			}
		},
		PorcentajeTexto: function(sState) {
			switch (sState) {
				case "N":
					return "No cumple";
				case "Y":
					return "Cumple";
				default:
					return "Pendiente";
			}
		},
		PorcentajeState: function(sStateValue) {
			switch (sStateValue) {
				case "N":
					return 3;
				case "Y":
					return 5;
				default:
					return 1;
			}
		},
		EstatusGvxConsumoTexto: function(sState) {
			switch (sState) {
				case "0":
					return "Error MII";
				case "1":
					return "OK MII";
				case "5":
					return "Procesando";
				case "8":
					return "Error SAP";
				case "9":
					return "OK SAP";
				default:
					return "Revisar";
			}
		},
		EstatusGvxConsumoState: function(sStateValue) {
			switch (sStateValue) {
				case "0":
					return 3;
				case "1":
					return 6;
				case "5":
					return 5;
				case "8":
					return 4;
				case "9":
					return 8;
				default:
					return 10;
			}
		},
		isReleaseOrderEnabled: function(sStatus) {
			if(sStatus && sStatus.includes("LIB.")) {
				return false
			}

			return true;
		}		
// #################################################
	};
});