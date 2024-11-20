sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/export/Spreadsheet',
], function (JQuery, BaseController, MessageToast, MessageBox, Filter, FilterOperator,Export,ExportTypeCSV,Spreadsheet) {
    "use strict";
    return BaseController.extend("sap.ui.demo.webapp.controller.Mantenimiento.Avisos.verAvisos", {
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("verAvisos").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username","ver_avisos");

            var 
                oArgs = oEvent.getParameter("arguments"),
                oView = this.getView(),
                oTable = oView.byId('PMNotificationList'),
                oStats = oView.byId('IconTabBar_Notifications'),
                oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;

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
            this._base_onloadCOMBO("listPMProceso", aData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/proceso_select_CEMH", "", "Proceso");
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

        onPMNotificationDetail: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("avisoDetalle", {
                id: oCtx.getProperty("id")
            });

        },

        onShowOrder: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();
            this.getRouter().navTo("PMOrderDetail", {
                id: oCtx.getProperty("order")
            });

        },

        onFilterSearch: function (oEvent) {   
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext();

            var oComboProcess = this.byId("listPMProceso");
            var oComboSubProcess = this.byId("listPMSubProceso");
            var oComboFunction = this.byId("listPMFunction");
            var oCheckStop = this.byId("PMStop"); 
            var oInputStarDate = this.byId("start_date"); 
            var oInputEndDate = this.byId("end_date");
            var User_MII = this.byId("username").getText();
	var num_aviso = this.byId("num_aviso_input").getValue();

            var oStop = 0;
            if (oCheckStop.getSelected() == true)
                oStop = 'X';
            else
                oStop = '';


            var oData = 
            {
                "BREAKDOWN": oStop,
                "END_DATE": oInputEndDate.getValue(),
                "FUNCTION": oComboFunction.getSelectedKey(),
                "PLANT": this.getView().getModel("Cabecera").getProperty("/PlantaUri"),
                "PROCESS": oComboProcess.getSelectedKey(),
                "START_DATE": oInputStarDate.getValue(),
                "SUBPROCESS": oComboSubProcess.getSelectedKey(),
                "VARIANT":"ZBAYCO2",
	    "AVISO": num_aviso,
                "USER":User_MII
            };
            console.log(oData);
            this._base_onloadTable("PMNotificationList", oData, "MII/DatosTransaccionales/Mantenimiento/Avisos/Transaction/get_avisos", "Avisos","IconTabBar_Notifications");
        },

        onClear: function () {
            console.log("CLEAR");
        },

        handleIconTabBarSelect: function (oEvent) {
            var aFilter = [],
                oTable = this.byId('PMNotificationList'),
                oBinding = oTable.getBinding('items'),
                sKey = oEvent.getParameter("key");

            if (sKey !== 'All') {

                if (sKey !== 'NORAS')
                    aFilter.push(new Filter("status", FilterOperator.Contains, sKey));
                else
                    aFilter.push(new Filter("noras", FilterOperator.Contains, sKey));
            }                
            
            oBinding.filter(aFilter);
        },
onExport: function (oEvent) {
        var aCols, aProducts, oSettings, oSheet;

        var oView = this.getView();        
        
        aCols = this.ColumnConfig_RepAvisos();
        aProducts = this.getView().byId("PMNotificationList").getModel().getProperty('/ITEMS');

        oSettings = {
            workbook: {
                columns: aCols,
                context: { sheetName: 'RepoerteAvisosMtto' }
            },
            dataSource: aProducts,
            fileName: "ReporteAvisosMtto.xlsx"
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
    ColumnConfig_RepAvisos: function () {
            return [
                {
                    label: 'Aviso',
                    type: 'string',
                    property: 'id',                    
                },
                {
                    label: 'Tipo',
                    property: 'type',
                    type: 'string',
                },                                
                {
                    label: 'Descripcion',
                    property: 'description',
                    type: 'string',
                },
                {
                    label: 'Reportado Por',
                    property: 'reportedby',
                    type: 'string',
                },
                {
                    label: 'Fecha Creacion',
                    property: 'date',
                    type: 'string'
                },
                {
                    label: 'Orden',
                    property: 'order',
                    type: 'string'
                },
                {
                    label: 'Estado',
                    type: 'string',
                    property: 'status',
                },
                {
                    label: 'Parada',
                    type: 'string',
                    property: 'stop',
                },
                {
                    label: 'Puesto Trabajo',
                    type: 'string',
                    property: 'work_cntr',
                },               
            ];
        },

    });
}
);

