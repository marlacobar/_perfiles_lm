sap.ui.define(function(){
	"use strict";
	var Formatter = {

		fx_status :  function (p_Status, p_Tara){
			var w_tara = parseFloat(p_Tara);
			if ( isNaN(w_tara) ){
				return "None";
			} 
			if ( p_Status == "0" ){
				if (w_tara == 0){
					return "Error";
				} else {
					return "Warning";
				}
			} else {
				if (w_tara == 0){
					return "Warning";
				} else {
					return "Success";
				}
			}
		},		

        elementVisible: function (sState) {
            if (sState === "0")
                return false;
            else
                return true;
        },

		colorState: function (sStateValue) {
			
            switch (sStateValue) {
                case 1:
                    return 7;
                case 2:
                    return 3;
                case 0:
                    return 5;
                case 3:
                    return 6;
                default:
                    return 1;
			}
        },
        
        colorStateBatch: function (sStateValue) {
			
            switch (sStateValue) {
                case 1:
                    return 7;
                case 2:
                    return 3;
                case 3:
                    return 3;
	   case 4:
                    return 3;
                default:
                    return 1;
			}
		},
		
		statusText: function (sState) {
			
            switch (sState) {
                case 1:
                    return "Correcto";
                case 2:
                    return "Error";
                case 0:
                    return "No enviado";
                case 3:
                    return "Reintento";
                default:
                    return "Desconocido";
            }
        },
        
        statusBatch: function (sState) {
			
            switch (sState) {
                case 1:
                    return "Liberado";
                case 2:
                    return "Calidad";
                case 3:
                    return "Bloqueado";
                case 4:
                    return "Devolucion";
                default:
                    return "Desconocido";
            }
		},

		icon: function (sState) {
			
            switch (sState) {
                case 1:
                    return "sap-icon://complete";
                case 2:
                    return "sap-icon://error";
                case 0:
                    return "sap-icon://lateness";
                case 3:
                    return "sap-icon://refresh";
                default:
                    return "sap-icon://information";
            }
        },

        iconBatch: function (sState) {
			
            switch (sState) {
                case 1:
                    return "sap-icon://complete";
                case 2:
                    return "sap-icon://browse-folder";
                case 3:
                    return "sap-icon://cancel";
                case 4:
                    return "sap-icon://warning2";
                default:
                    return "sap-icon://information";
            }
        },

        statusInvoice: function(status){
            switch(status){
                case "1":
                    return "Correcto"
                case "2":
                    return "Info. Faltante"
                case "3":
                    return "Sin Info."
                case "0":
                    return "No Generado"
                default:
                    return "Desconocido"
            }
        },

        colourStatusInvoice: function(status){
            switch(status){
                case "1":
                    return 7;
                case "2":
                    return 3;
                case "3":
                    return 5;
                default:
                    return 1;
            }
        },

        invoiceIcon: function (sState) {
			
            switch (sState) {
                case "1":
                    return "sap-icon://complete";
                case "2":
                    return "sap-icon://error";
                case "0":
                    return "sap-icon://sys-help-2";
                case "3":
                    return "sap-icon://status-critical";
                default:
                    return "sap-icon://information";
            }
        },

       enableAction: function(status){
            switch(status){
                case "3":
                    return false
                default:
                    return true
            }
        },

	enabled_solc_basc:function(status){
		switch(status){
			case "X":
				return true;
			break;
			default:
				return false;
			break;
		}
	},
	enabled_ing_vig:function(status){
		switch(status){
			case "X":
				return true;
			break;
			default:
				return false;
			break;
		}
	},
	enabled_reimpresion:function(status){
		switch(status){
			case "EN_ESPERA":
				return false;
			break;
			default:
				return true;
			break;
		}
	},
	
	estatus_pesaje:function(ciclo,pesaje,peso){
		var respuesta="Falta ";
		switch(pesaje){
			case "TARA":
			case "BRUTO":
				if(peso>0){
					return "Completado";
				}else{
					return respuesta + pesaje;
				}
			break;
			case "FINAL":
				if(peso>0 && ciclo=="CARGA"){
					return "Completado";
				}else{
					return respuesta + "FINAL";
				}
			break;			
		}
	}

	};
	return Formatter;
}, /* bExport= */ true);
