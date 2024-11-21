sap.ui.define([
    "sap/ui/demo/webapp/controller/BaseController",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "../../model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    'sap/ui/core/util/Export',
    'sap/ui/export/Spreadsheet',
    'sap/ui/model/json/JSONModel'
], function (BaseController, Filter, FilterOperator, formatter, Fragment, MessageBox, Export, Spreadsheet, JSONModel) {
    "use strict";

    var plant_gb = '';

    return BaseController.extend("sap.ui.demo.webapp.controller.Reportes.ReporteWM", {

        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("ReporteWM").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this._getUsuario("username", "id_reporte_wm");
            this._base_onloadCOMBO("Almacen_select", "", "MII/DatosTransaccionales/Pedidos/Transaction/get_storage_wm", "", "Almacenes WM");
            this._base_onloadCOMBO("gpo_articulo", "", "MII/DatosTransaccionales/Pedidos/Transaction/get_groups_article", "", "Grupos Articulos");
            this._base_onloadCOMBO("ubicacion_mat", "", "MII/DatosTransaccionales/Pedidos/Transaction/get_ubicaciones_lx03", "", "Ubicaciones");
        },

        onSearch: function (oEvent) {
            var resourceModel = this.getView().getModel("i18n");
            var oData = {
                "NUM_ALMACEN": this.byId("Almacen_select").getSelectedKey(),
                "LOTE": this.byId("lote_input").getValue(),
                "MATERIAL": this.byId("material_input").getValue(),
                "ARTICULO": this.byId("gpo_articulo").getValue(),
                "UBICACION": this.byId("ubicacion_mat").getValue()
            };
            console.log(oData);
            this._base_onloadTable("t_lotes_WM", oData, "MII/DatosTransaccionales/Pedidos/Transaction/reporte_LX03", "Lotes de proceso", "");
        },

        UbicacionesAlmacen: function () {
            var oData = {
                "NUM_ALMACEN": this.byId("Almacen_select").getSelectedKey()
            };
            this._base_onloadCOMBO("ubicacion_mat", oData, "MII/DatosTransaccionales/Pedidos/Transaction/get_ubicaciones_lx03", "", "Ubicaciones");
        },

        createColumnConfig_WM: function () {
            return [
                {
                    label: 'Lote',
                    property: 'lote',
                    type: 'string',
                },
                {
                    label: 'Almacen - Num Almacen',
                    property: ['almacen', 'num_almacen'],
                    type: 'string',
                    template: '{0}  {1}'
                },
                {
                    label: 'Tipo Almacen',
                    property: 'tipo_almacen',
                    type: 'string'
                },
                {
                    label: 'Ubicacion',
                    property: 'ubicacion',
                    type: 'string'
                },
                {
                    label: 'Material',
                    property: 'material',
                    type: 'string'
                },
                {
                    label: 'Desc Material',
                    property: 'desc_material',
                    type: 'string'
                },
                {
                    label: 'Ctd',
                    property: 'ctd',
                    type: 'string'
                },
                {
                    label: 'UM',
                    property: 'um',
                    type: 'string'
                },
                {
                    label: "Estatus Lote",
                    type: 'Enumeration',
                    property: 'estatus',
                    valueMap: {
                        'Q': 'Stock en ctrl calidad',
                        'S': 'Stock bloqueado',
                        '': 'Stock en  libre'
                    }
                },
                {
                    label: 'Tipo Stock',
                    property: 'stock',
                    type: 'string'
                },
                {
                    label: 'Ped.Cliente/Posicion',
                    property: 'no_necesidad',
                    type: 'string'
                },
                {
                    label: "Estado WM",
                    type: 'Enumeration',
                    property: 'ubicado',
                    valueMap: {
                        '0': 'Stock en ctrl calidad',
                        '1': 'Stock bloqueado'
                    }
                },
                {
                    label: 'Num Orden',
                    property: 'num_orden',
                    type: 'string'
                },
                {
                    label: 'Canal',
                    property: 'canal',
                    type: 'string'
                },
                {
                    label: 'Cliente',
                    property: 'cliente',
                    type: 'string'
                },
                {
                    label: 'Grupo Articulo',
                    property: 'gpo_articulo',
                    type: 'string'
                },
                {
                    label: 'Calidad Lote',
                    property: 'calidad_lote',
                    type: 'string'
                },
                {
                    label: 'Defecto Descripcion',
                    property: 'desc_defecto',
                    type: 'string'
                },
                {
                    label: 'Proveedor',
                    property: 'proveedor',
                    type: 'string'
                },
                {
                    label: 'Num Proveedor',
                    property: 'num_proveedor',
                    type: 'string'
                },
                {
                    label: 'Fecha Caducidad',
                    property: 'fecha_caducidad',
                    type: 'string'
                }

            ];
        },

        onDataExport: function (oEvent) {
            var aCols, aProducts, oSettings, oSheet;

            aCols = this.createColumnConfig_WM();
            aProducts = this.getView().byId("t_lotes_WM").getModel().getProperty('/ITEMS');
            oSettings = {
                workbook: {
                    columns: aCols,
                    context: { sheetName: 'ReporteWM' }
                },
                dataSource: aProducts,
                fileName: "ReporteWM.xlsx"
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show('Spreadsheet export has finished');
                })
                .finally(function () {
                    oSheet.destroy();
                });
        },

    });
});


