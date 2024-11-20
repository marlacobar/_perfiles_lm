sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/export/Spreadsheet'

], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator,Export,ExportTypeCSV,Spreadsheet) {
    "use strict";
    var xml_tipo="";
    return BaseController.extend("sap.ui.demo.webapp.controller.Mantenimiento.Ordenes.verOrdenes", {
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("verOrdenes").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
        this._getUsuario("username", "Ver_ordenes");

            var 
                oArgs = oEvent.getParameter("arguments"),
                oView = this.getView(),
                oTable = oView.byId('PMOrdersList'),
                oStats = oView.byId('IconTabBar_Orders'),
	    inputOrden = oView.byId("num_orden_input"),
                oModel_empty = new sap.ui.model.json.JSONModel();                

	var fnValidator = function(args){
				var text = args.text;

				return new Token({key: text, text: text});
			};
	inputOrden.addValidator(fnValidator);
            //clear table
            oModel_empty.setData({});
            oTable.setModel(oModel_empty);
            oStats.setModel(oModel_empty);

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ "PlantaUri": oArgs.idPlanta });
            oView.setModel(oModel,"Cabecera");

            console.log(oModel);
            oView.bindElement({
                path: "/"
            });
            var aData={
                'ID_PLANTA':this.getView().getModel("Cabecera").getProperty("/PlantaUri")
             };
             console.log(aData);
            this._base_onloadCOMBO("listPMProceso", aData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/proceso_select_CEMH", "", "Proceso");
        },  

        onPMOrderDetail: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("detalleOrdenPM", {
                id: oCtx.getProperty("order")
            });

        },

        onChangePMProceso: function (oEvent) {
            var oData = {
                "ID_PROCESO": oEvent.getParameter("selectedItem").getKey()
            };
            this._base_onloadCOMBO("listPMSubProceso", oData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/subproceso_select_CEMH","","SubProcesos");
        },

        onChangePMSubProceso: function (oEvent) {
            var oData = {
                "ID_SUBPROCESO": oEvent.getParameter("selectedItem").getKey()
            };
            this._base_onloadCOMBO("listPMFunction", oData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/funcion_select_CEMH","","Funciones");   
        },

        onShowNoti: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("avisoDetalle", {
                id: oCtx.getProperty("notification")
            });

        },
        handleSelectionFinish : function(oEvent){
                    xml_tipo="";
                    var selectedItems = oEvent.getParameter("selectedItems");
                        for (var i = 0; i < selectedItems.length; i++) {
                                xml_tipo += '<FILTER>\n';
                                xml_tipo += '<FIELD_NAME>OPTIONS_FOR_DOC_TYPE</FIELD_NAME>\n';
                                xml_tipo += '<LOW_VALUE>'+selectedItems[i].getKey()+'</LOW_VALUE>\n';
                                xml_tipo += '<HIGH_VALUE/>\n';
                                xml_tipo += '<OPTION>EQ</OPTION>\n';
                                xml_tipo += '</FILTER>\n';
                            }
        },
        onShowView: function (oEvent) {
            var 
                oItem = oEvent.getSource(),
                oCtx = oItem.getBindingContext(),
                oComboProcess = this.byId("listPMProceso"),
                oComboSubProcess = this.byId("listPMSubProceso"),
                oComboFunction = this.byId("listPMFunction"),
                oInputStartDate = this.byId("start_date"),
                oInputEndDate = this.byId("end_date"),
                oCOR = this.byId("PMCorrective"),
                oCPV = this.byId("PMCorrectivePre"),
                User_MII = this.byId("username").getText(),

                oPRV = this.byId("PMPrevent"),
                start_date = '',
                end_date = '',
                send_start_date = '',
                send_end_date = '',
                xml_data = '',
	   orden = this.byId("num_orden_input").getValue();

                xml_data += '<FILTERS>\n';

                xml_data += '<FILTER>\n';
                xml_data += '<FIELD_NAME>OPTIONS_FOR_PLANPLANT</FIELD_NAME>\n';
                xml_data += '<LOW_VALUE>' + this.getView().getModel("Cabecera").getProperty("/PlantaUri") + '</LOW_VALUE>\n';  //yyyyMMdd
                xml_data += '<HIGH_VALUE />\n';
                xml_data += '<OPTION>EQ</OPTION>\n';
                xml_data += '</FILTER>\n';

            if (oComboProcess.getSelectedKey() !== "" || oComboSubProcess.getSelectedKey() !== "" || oComboFunction.getSelectedKey() !== "") {
                xml_data += '<FILTER>\n';
                xml_data += '<FIELD_NAME>OPTIONS_FOR_FUNCLOC</FIELD_NAME>\n';

                if (oComboFunction.getSelectedKey() !== '')
                    xml_data += '<LOW_VALUE>' + oComboFunction.getSelectedKey() + '</LOW_VALUE>\n';
                else if (oComboSubProcess.getSelectedKey() !== "")
                    xml_data += '<LOW_VALUE>' + oComboSubProcess.getSelectedKey() + '*</LOW_VALUE>\n';
                else if (oComboProcess.getSelectedKey() !== "")
                    xml_data += '<LOW_VALUE>' + oComboProcess.getSelectedKey() + '*</LOW_VALUE>\n';

                xml_data += '<HIGH_VALUE />\n';
                xml_data += '<OPTION>CP</OPTION>\n';                
                xml_data += '</FILTER>\n';
            }

            //GALV-SGEN-OFIC-OP2

            start_date = oInputStartDate.getValue();

            if (start_date !== "") {
                start_date = start_date.split('-');
                send_start_date = start_date[2] + start_date[1] + start_date[0];
            }
                

                xml_data += '<FILTER>\n';
                xml_data += '<FIELD_NAME>SHOW_DOCS_WITH_FROM_DATE</FIELD_NAME>\n';
                xml_data += '<LOW_VALUE>' + send_start_date + '</LOW_VALUE>\n';  //yyyyMMdd
                xml_data += '<HIGH_VALUE />\n';
                xml_data += '<OPTION>EQ</OPTION>\n';
                xml_data += '</FILTER>\n';

                end_date = oInputEndDate.getValue();
                if (end_date !== "") {
                    end_date = end_date.split('-');
                    send_end_date = end_date[2] + end_date[1] + end_date[0];
                }
                

                xml_data += '<FILTER>\n';
                xml_data += '<FIELD_NAME>SHOW_DOCS_WITH_TO_DATE</FIELD_NAME>\n';
                xml_data += '<LOW_VALUE>' + send_end_date + '</LOW_VALUE>\n';  //yyyyMMdd
                xml_data += '<HIGH_VALUE />\n';
                xml_data += '<OPTION>EQ</OPTION>\n';
                xml_data += '</FILTER>\n';
                xml_data += xml_tipo;

            xml_data += '<FILTER>\n';
            xml_data += '<FIELD_NAME>SHOW_COMPLETED_DOCUMENTS</FIELD_NAME>\n';
            xml_data += '<LOW_VALUE>X</LOW_VALUE>\n';  //yyyyMMdd
            xml_data += '<HIGH_VALUE />\n';
            xml_data += '<OPTION>EQ</OPTION>\n';
            xml_data += '</FILTER>\n';


            xml_data += '</FILTERS>\n';

            console.log(xml_data);
            var oData = {
                "FILTERS": xml_data,
                "USER":User_MII,
	    "ORDERS" : orden    
            };

            this._base_onloadTable("PMOrdersList", oData, "MII/DatosTransaccionales/Mantenimiento/Ordenes/Transaction/get_orders", "Ordenes", "IconTabBar_Orders");
        },

        handleIconTabBarSelect: function (oEvent) {
            var aFilter = [],
                oTable = this.byId('PMOrdersList'),
                oBinding = oTable.getBinding('items'),
                sKey = oEvent.getParameter("key");

            if (sKey !== 'All') {
               if (sKey !== 'NOTP'){
                    aFilter.push(new Filter("status", FilterOperator.Contains, sKey));
	   }
                else{
                    aFilter.push(new Filter("status", FilterOperator.Contains, sKey));
	        aFilter.push(new Filter("status", FilterOperator.Contains, "NOTI"));
	     }
            }

            oBinding.filter(aFilter);
        },
onExport: function (oEvent) {
        var aCols, aProducts, oSettings, oSheet;

        var oView = this.getView();        
        
        aCols = this.ColumnConfig_RepOrd();
        aProducts = this.getView().byId("PMOrdersList").getModel().getProperty('/ITEMS');

        oSettings = {
            workbook: {
                columns: aCols,
                context: { sheetName: 'RepoerteOrdenesMtto' }
            },
            dataSource: aProducts,
            fileName: "ReporteOrdenesMtto.xlsx"
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
    ColumnConfig_RepOrd: function () {
            return [
                {
                    label: 'Orden',
                    type: 'string',
                    property: 'order',                    
                },
                {
                    label: 'Tipo',
                    property: 'order_type',
                    type: 'string',
                },                                
                {
                    label: 'Clave',
                    property: 'activity_type',
                    type: 'string',
                },
                {
                    label: 'Prioridad',
                    property: 'priority',
                    type: 'string',
                },
                {
                    label: 'Estado',
                    property: 'status',
                    type: 'string'
                },
                {
                    label: 'Descripcion',
                    property: 'description',
                    type: 'string'
                },
                {
                    label: 'Equipo',
                    type: 'string',
                    property: 'desc_equipo',
                },
                {
                    label: 'Ubicacion Tecnica',
                    type: 'string',
                    property: 'desc_funcLoc',
                },
                {
                    label: 'Fecha Inicio',
                    type: 'string',
                    property: 'start_date',
                },
                {
                    label: 'Fecha Fin',
                    type: 'string',
                    property: 'end_date',
                },
                {
                    label: 'Aviso',
                    type: 'string',
                    property: 'notification',
                },
                {
                    label: 'Puesto Trabajo',
                    type: 'string',
                    property: 'work_center',
                },                            
            ];
        },

    });
}
);