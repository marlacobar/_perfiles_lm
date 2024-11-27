sap.ui.define([
    'jquery.sap.global',
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/json/JSONModel',
    "sap/ui/demo/webapp/model/formatter",
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format',
    'sap/viz/ui5/data/FlattenedDataset',
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV'

], function (JQuery, BaseController, MessageToast, MessageBox, JSONModel, formatter, ChartFormatter, Format, FlattenedDataset, Controller,
    Export, ExportTypeCSV) {
    "use strict";

    return BaseController.extend("sap.ui.demo.webapp.controller.Produccion.consumo", {
        islote: 0,
        formatter: formatter,

        onInit: function () {
            Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;
            var oRouter = this.getRouter();
            oRouter.getRoute("Consumo201").attachMatched(this._onRouteMatched, this);

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
                    oThis.byId("usuario").setValue(idUs);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });

            oThis._base_onloadCOMBO("work_center", "", "MII/DatosTransaccionales/Produccion/Transaction/get_workCenter_Consumo201", "", "Centros");

            //<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->			

            var oModel_empty = new sap.ui.model.json.JSONModel(),
                oThis = this;
            oModel_empty.setData({ SEMANA: 0, PROD: 0, CONSUMIDO: 0 });
            var popoverProps = {};
            var chartPopover = new sap.viz.ui5.controls.Popover(popoverProps);

            var oVizFrameUtilMensual = this.getView().byId("idVizFrame");
            oVizFrameUtilMensual.setModel(oModel_empty);

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Semana',
                    //dataType: 'date',
                    value: "{SEMANA}"
                }],

                measures: [{
                    name: 'Producido',
                    value: '{PROD}'
                }, {
                    name: 'Consumido',
                    value: '{CONSUMIDO}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#19A979", "#ED4A7B"];
            oVizFrameUtilMensual.setVizProperties({
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
                        primaryAxis: ["bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Producido", "Consumido"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Semana"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //<----------------------------------------VIZFRAME COLUMN--------------------------------------------------------->


            var oVizFrameUtilMensual = this.getView().byId("vizMes");
            oVizFrameUtilMensual.setModel(oModel_empty);

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Mes',
                    //dataType: 'date',
                    value: "{MES}"
                }],

                measures: [{
                    name: 'Producido',
                    value: '{PROD}'
                }, {
                    name: 'Consumido',
                    value: '{CONSUMO}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#5bbae7", "#935dd0"];
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
                        primaryAxis: ["bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Producido", "Consumido"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Mes"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //<----------------------------------------VIZFRAME COLUMN MES--------------------------------------------------------->


            var oVizFrameUtilMensual = this.getView().byId("vizDia");
            oVizFrameUtilMensual.setModel(oModel_empty);

            /*var oModelPnp = new sap.ui.model.json.JSONModel();
            var dataLine = {
                    'Data' : [
                        {"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"43"},
                        {"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"71"},
                        {"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"86"},
                        {"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"90"},
                       ]};
            oModelPnp.setData(dataLine);*/

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Dia',
                    //dataType: 'date',
                    value: "{DIA}"
                }],

                measures: [{
                    name: 'Producido',
                    value: '{PRODUCIDO}'
                }, {
                    name: 'Consumido',
                    value: '{CONSUMIDO}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#FF9900", "#DB3A11"];
            oVizFrameUtilMensual.setVizProperties({
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
                        primaryAxis: ["bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Producido", "Consumido"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Dia"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //<----------------------------------------VIZFRAME COLUMN MES--------------------------------------------------------->


            //<----------------------------------------VIZFRAME ZINC MES--------------------------------------------------------->

            var oVizFrameUtilMensual = this.getView().byId("ZincMes");
            oVizFrameUtilMensual.setModel(oModel_empty);


            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Mes',
                    value: "{MES}"
                }],

                measures: [{
                    name: 'Teorico',
                    value: '{TEORICO}'
                }, {
                    name: 'Real',
                    value: '{REAL}'
                }, {
                    name: 'Dross',
                    value: '{DROSS}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#5899DA", "#E8743B", "#19A979"];
            oVizFrameUtilMensual.setVizProperties({
                title: {
                    text: "Zinc Mensual"
                },
                plotArea: {
                    colorPalette: aColorPalate,
                    //drawingEffect: "glossy",
                    dataLabel: {
                        visible: true,
                        formatString: formatPattern.SHORTFLOAT_MFD2
                    },
                    dataShape: {
                        primaryAxis: ["bar", "bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Teorico", "Real", "Dross"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Mes"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //---------------------------------------------------------------------------------------------------------------------                        
            //<---------------------------------VIZFRAME ZINC ALUMINIO MES--------------------------------------------------------->

            var oVizFrameUtilMensual = this.getView().byId("ZincAlMes");
            oVizFrameUtilMensual.setModel(oModel_empty);

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Mes',
                    value: "{MES}"
                }],

                measures: [{
                    name: 'Teorico',
                    value: '{TEORICO}'
                }, {
                    name: 'Real',
                    value: '{REAL}'
                }, {
                    name: 'Dross',
                    value: '{DROSS}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#5899DA", "#E8743B", "#19A979"];
            oVizFrameUtilMensual.setVizProperties({
                title: {
                    text: "Aluminio Zinc Mensual"
                },
                plotArea: {
                    colorPalette: aColorPalate,
                    //drawingEffect: "glossy",
                    dataLabel: {
                        visible: true,
                        formatString: formatPattern.SHORTFLOAT_MFD2
                    },
                    dataShape: {
                        primaryAxis: ["bar", "bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Teorico", "Real", "Dross"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Mes"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //---------------------------------------------------------------------------------------------------------------------                        

            //<---------------------------------VIZFRAME ZINC SEM--------------------------------------------------------->

            var oVizFrameUtilMensual = this.getView().byId("ZincSem");
            oVizFrameUtilMensual.setModel(oModel_empty);

            /*var oModelPnp = new sap.ui.model.json.JSONModel();
            var dataLine = {
                    'Data' : [
                        {"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"43"},
                        {"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"71"},
                        {"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"86"},
                        {"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"90"},
                    ]};
            oModelPnp.setData(dataLine);*/

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Semana',
                    value: "{SEMANA}"
                }],

                measures: [{
                    name: 'Teorico',
                    value: '{TEORICO}'
                }, {
                    name: 'Real',
                    value: '{REAL}'
                }, {
                    name: 'Dross',
                    value: '{DROSS}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#5899DA", "#E8743B", "#19A979"];
            oVizFrameUtilMensual.setVizProperties({
                title: {
                    text: "Zinc Semanal"
                },
                plotArea: {
                    colorPalette: aColorPalate,
                    //drawingEffect: "glossy",
                    dataLabel: {
                        visible: true,
                        formatString: formatPattern.SHORTFLOAT_MFD2
                    },
                    dataShape: {
                        primaryAxis: ["bar", "bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Teorico", "Real", "Dross"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Semana"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //---------------------------------------------------------------------------------------------------------------------                        
            //<---------------------------------VIZFRAME ZINC ALUM SEM--------------------------------------------------------->

            var oVizFrameUtilMensual = this.getView().byId("ZincAlSem");
            oVizFrameUtilMensual.setModel(oModel_empty);

            /*var oModelPnp = new sap.ui.model.json.JSONModel();
            var dataLine = {
                    'Data' : [
                        {"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"43"},
                        {"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"71"},
                        {"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"86"},
                        {"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"90"},
                    ]};
            oModelPnp.setData(dataLine);*/

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Semana',
                    value: "{SEMANA}"
                }],

                measures: [{
                    name: 'Teorico',
                    value: '{TEORICO}'
                }, {
                    name: 'Real',
                    value: '{REAL}'
                }, {
                    name: 'Dross',
                    value: '{DROSS}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#5899DA", "#E8743B", "#19A979"];
            oVizFrameUtilMensual.setVizProperties({
                title: {
                    text: "Aluminio Zinc Semanal"
                },
                plotArea: {
                    colorPalette: aColorPalate,
                    //drawingEffect: "glossy",
                    dataLabel: {
                        visible: true,
                        formatString: formatPattern.SHORTFLOAT_MFD2
                    },
                    dataShape: {
                        primaryAxis: ["bar", "bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Teorico", "Real", "Dross"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Semana"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //---------------------------------------------------------------------------------------------------------------------                        
            //<---------------------------------VIZFRAME ZINC DIA--------------------------------------------------------->

            var oVizFrameUtilMensual = this.getView().byId("ZincDia");
            oVizFrameUtilMensual.setModel(oModel_empty);

            /*var oModelPnp = new sap.ui.model.json.JSONModel();
            var dataLine = {
                    'Data' : [
                        {"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"43"},
                        {"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"71"},
                        {"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"86"},
                        {"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"90"},
                    ]};
            oModelPnp.setData(dataLine);*/

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Dia',
                    value: "{DIA}"
                }],

                measures: [{
                    name: 'Teorico',
                    value: '{TEORICO}'
                }, {
                    name: 'Real',
                    value: '{REAL}'
                }, {
                    name: 'Dross',
                    value: '{DROSS}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#5899DA", "#E8743B", "#19A979"];
            oVizFrameUtilMensual.setVizProperties({
                title: {
                    text: "Zinc Diario"
                },
                plotArea: {
                    colorPalette: aColorPalate,
                    //drawingEffect: "glossy",
                    dataLabel: {
                        visible: true,
                        formatString: formatPattern.SHORTFLOAT_MFD2
                    },
                    dataShape: {
                        primaryAxis: ["bar", "bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Teorico", "Real", "Dross"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Dia"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //---------------------------------------------------------------------------------------------------------------------                        
            //<---------------------------------VIZFRAME ZINC ALUM DIA--------------------------------------------------------->

            var oVizFrameUtilMensual = this.getView().byId("ZincAlDia");
            oVizFrameUtilMensual.setModel(oModel_empty);

            /*var oModelPnp = new sap.ui.model.json.JSONModel();
            var dataLine = {
                    'Data' : [
                        {"Mes": "ENE","Value": "50","Value2":"20", "Value3":"10", "Value4":"43"},
                        {"Mes": "FEB","Value": "40","Value2":"20", "Value3":"25", "Value4":"71"},
                        {"Mes": "MAR","Value": "30","Value2":"25", "Value3":"20", "Value4":"86"},
                        {"Mes": "ABR","Value": "20","Value2":"15", "Value3":"15", "Value4":"90"},
                    ]};
            oModelPnp.setData(dataLine);*/

            var oDatasetUtilMensual = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Dia',
                    value: "{DIA}"
                }],

                measures: [{
                    name: 'Teorico',
                    value: '{TEORICO}'
                }, {
                    name: 'Real',
                    value: '{REAL}'
                }, {
                    name: 'Dross',
                    value: '{DROSS}'
                }],

                data: {
                    path: "/"
                }
            });
            oVizFrameUtilMensual.setDataset(oDatasetUtilMensual);
            //oVizFramePnp.setModel(oModelPnp);	
            oVizFrameUtilMensual.setVizType('combination');

            //var aColorPalate = ["#5bbae7","#b6da58","#f9c463","#935dd0"];
            var aColorPalate = ["#5899DA", "#E8743B", "#19A979"];
            oVizFrameUtilMensual.setVizProperties({
                title: {
                    text: "Aluminio Zinc Semanal"
                },
                plotArea: {
                    colorPalette: aColorPalate,
                    //drawingEffect: "glossy",
                    dataLabel: {
                        visible: true,
                        formatString: formatPattern.SHORTFLOAT_MFD2
                    },
                    dataShape: {
                        primaryAxis: ["bar", "bar", "bar"]
                    }
                }
            });

            var feedValueAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Teorico", "Real", "Dross"]
            }),
                feedCategoryAxisUtilMensual = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Dia"]
                });
            oVizFrameUtilMensual.addFeed(feedValueAxisUtilMensual);
            oVizFrameUtilMensual.addFeed(feedCategoryAxisUtilMensual);
            //---------------------------------------------------------------------------------------------------------------------                        

        },

        _onRouteMatched: function (oEvent) {

            this._getUsuario("username", "id_consumo_201");
            this._base_onloadTable("table_consumos", "", "MII/DatosTransaccionales/Produccion/Transaction/get_consumos", "Consumos", ""); // 20200428

        },

        onClickOnColumnaSemana: function (oEvent) {
            var dataSelected = oEvent.getParameter("data")[0];
            var semana = dataSelected.data.Semana;

            var mes = this.getView().byId("DP10").getValue();
            var wc = this.getView().byId("Puesto_Trabajo_select").getSelectedKey();


            var oData = {
                "MES": mes,
                "SEMANA": semana,
                "WC": wc
            };
            console.log(oData);
            this.loadGraph("vizDia", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_dia", "Grafico Día");
            this._base_onloadTable("table_dia", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_dia_tab", "Tabla Día", ""); // 20200428
        },

        onClickOnColumnaSemana1: function (oEvent) {
            var dataSelected = oEvent.getParameter("data")[0];
            var semana = dataSelected.data.Semana;
            var mes = this.getView().byId("DP").getValue();
            var wc = this.getView().byId("Puesto_Trabajo_zinc").getSelectedKey();

            var oData = {
                "MATERIAL": "ZINC ",
                "MES": mes,
                "SEMANA": semana,
                "DROSS": "000000000030000016",
                "WC": wc
            };
            console.log(oData);
            this.loadGraph("ZincDia", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_zinc_dia", "Grafico Día");
            this._base_onloadTable("tab_zinc_dia", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_tab_zinc_dia", "Tabla Día Zinc", "");
        },

        onClickOnColumnaSemana2: function (oEvent) {
            var dataSelected = oEvent.getParameter("data")[0];
            var semana = dataSelected.data.Semana;
            var mes = this.getView().byId("DP").getValue();
            var wc = this.getView().byId("Puesto_Trabajo_zinc").getSelectedKey();

            var oData = {
                "MATERIAL": "ZINC/ALUMINIO",
                "MES": mes,
                "SEMANA": semana,
                "DROSS": "000000000030000017",
                "WC": wc
            };
            console.log(oData);
            this.loadGraph("ZincAlDia", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_zinc_dia", "Grafico Día");
            this._base_onloadTable("tab_al_zinc_dia", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_tab_zinc_dia", "Tabla Día Aluminio Zinc", "");
        },

        onKeyCode: function (oEvent) {

            var workCenter = oEvent.getParameter("selectedItem").getProperty("key");
            var lote = this.byId('elm_lote');

            let oData = {
                "WORK_CENTER": workCenter
            };

            this._base_onloadCOMBO("cmb_material", oData, "MII/DatosTransaccionales/Produccion/Transaction/get_materials", "", "Materiales");
            this.byId("um").setValue("");
            this.byId("inp_ceco").setValue("");

        },

        onAddMaterial: function () {

            var workCenter_key = this.byId('work_center').getProperty("selectedKey");

            if (workCenter_key == "") {
                this.getOwnerComponent().openHelloDialog("Seleccione un Puesto de Trabajo");
                return;
            }

            var oView = this.getView();
            var workCenter = this.byId('work_center').getSelectedItem().getText();

            let oData = {
                "WORK_CENTER": workCenter_key
            };

            var oDialog = oView.byId("add_material");
            if (!oDialog) {
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.add_material_combo", this);
                oView.addDependent(oDialog);
            }

            oDialog.open();
            oView.byId("Puesto_Trabajo").setValue(workCenter);
            oView.byId("lbl_esLote").setText("");
            oView.byId("inp_material").setValue("");
            oView.byId("inp_desc_material").setValue("");
            this._base_onloadCOMBO("cb_centroCostos", oData, "MII/DatosTransaccionales/Produccion/Transaction/get_ceco", "", "Materiales");

        },

        onSerchBatch: function (oEvent) {

            var material = this.byId('Material_input').getValue();
            var almacen = oEvent.getParameter("selectedItem").getKey();
            var wc = this.byId('work_center').getProperty("selectedKey");

            var oData = {
                "MATERIAL": material,
                "STORAGE": almacen,
                "WC": wc
            };

            this._base_onloadCOMBO("lote_select", oData, "MII/DatosTransaccionales/Produccion/Transaction/get_batch", "", "Lotes");

        },

        onDensidad: function () {
            var oView = this.getView();
            var oDialog = oView.byId("FactorDensidad");
            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.demo.webapp.fragment.FactorDensidad", this);
                oView.addDependent(oDialog);
            }
            var oData = "";
            oData = {
                "MATERIAL": "220"
            };
            //	this._base_onloadCOMBO("oCmbPueTra", oData, "MII/DatosMaestros/Inventario/Transaction/crhd/crhd_sel_00", "", "oCmbPueTra");
            //this._base_onloadCOMBO("oCmbPueTra", oData, "MII/DatosMaestros/Inventario/Transaction/crhd/crhd_sel_00_me", "", "oCmbPueTra"); // 20200427
            this.onTbSelRow_PTP_01();
            oDialog.open();
        },

        onTbSelRow_PTP_01: function () {

            this._base_onloadTable("oTb_Cnf_PTP", "", "MII/DatosTransaccionales/Reportes/Transaction/Calidad/get_factor", "Factores", ""); // 20200428
            this.byId("oInputValorPorc").setValue("");
            this.onTbSelRow_PTP_XX();

        },

        onTbSelRow_PTP_XX: function () {
            var oInputValorPorc = this.byId("oInputValorPorc").getValue();
            if (oInputValorPorc > 0) {
                this.byId("btnAsignaAsignar").setEnabled(true);
            } else {
                this.byId("btnAsignaAsignar").setEnabled(false);
            }
            this.byId("btnAsignaEliminar").setEnabled(false);
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
                console.log(w_row);
            } else {
                w_Path_i = parseInt(w_Path.replace("/ITEMS/", ""));
                w_row = oModel.getData(oBindContext.getPath()).ITEMS[w_Path_i];
            }
            if (!w_row == false) {
                this.byId("oInputValorPorc").setValue(w_row.FACTOR);
            } else {
                this.byId("btnAsignaEliminar").setEnabled(false);
                this.getOwnerComponent().openHelloDialog("Posición seleccionada sin información");
            }
        },

        onKeyCode_porc: function (oEvent) {
            var w_dato = oEvent.getParameter("newValue");
            if (w_dato.length >= 6) { // 20200428
                this.byId("oInputValorPorc").setValue("");
            }
            this.onTbSelRow_PTP_XX();
        },

        handleLoadItems: function (oControlEvent) {
            oControlEvent.getSource().getBinding("items").resume();
        },

        onCloseDialogonCnfPorcentaje: function () {
            this.getView().byId("FactorDensidad").close();
            this.getView().byId("FactorDensidad").destroy();
        },

        onCloseDialogoAddMaterial: function () {
            this.getView().byId("add_material").close();
            this.getView().byId("add_material").destroy();
        },

        onBorrarFactor: function () {
            var oCombo_01_01 = this.byId("oCmbPueTra").getSelectedKey();
            var oCombo_01_02 = this.byId('oCmbPueTra').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ext_OBJTY").value; // 20200424
            if (oCombo_01_01 != "") {
            } else {
                this.byId("btnAsignaEliminar").setEnabled(false);
                this.getOwnerComponent().openHelloDialog("Posición seleccionada sin información");
                return;
            }
            var oData = {
                "p_in_01_mandt": "220",
                "p_in_02_werks": "LM00",
                "p_in_objty": oCombo_01_02,
                "p_in_objid": oCombo_01_01
            };
            //this.onGuardar_PTP(oData, 'MII/DatosTransaccionales/Reportes/Transaction/Produccion/delete_meta'); // 20200428
            this.byId("oInputValorPorc").setValue("");
        },
        onAsignarFactor: function () {
            var oCombo_01_01 = this.byId("oCmbPueTra").getSelectedKey();
            var oCombo_01_02 = this.byId('oCmbPueTra').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ext_OBJTY").value; // 20200424
            var oCombo_02 = this.byId("oInputValorPorc").getValue();
            oCombo_02 = eval(oCombo_02);
            oCombo_02 = parseFloat(oCombo_02).toFixed(3);
            var w_user_login = this.byId('username').getText(); // 20200418
            var oData = {
                "p_in_32_user": w_user_login,
                "p_in_mandt": "220",
                "p_in_werks": "LM00",
                "p_in_objty": oCombo_01_02,
                "p_in_objid": oCombo_01_01,
                "p_in_porc": oCombo_02
            };
            //this.onGuardar_PTP(oData, 'MII/DatosTransaccionales/Reportes/Transaction/Produccion/set_meta'); // 20200428
        },


        onDataExport: function (oEvent) {

            var oTable = this.getView().byId("table_consumos").getModel().oData;

            var oModel = new JSONModel();
            oModel.setData(oTable);


            var oExport = new Export({

                // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                exportType: new ExportTypeCSV({
                    separatorChar: ";"
                }),

                // Pass in the model created above
                models: oModel,

                // binding information for the rows aggregation
                rows: {
                    path: '/ITEMS'
                },

                // column definitions with column name and binding info for the content

                columns: [{
                    name: "Usuario",
                    template: {
                        content: "{USER}"
                    }
                }, {
                    name: "Puesto de Trabajo",
                    template: {
                        content: "{WORK_CENTER}"
                    }
                }, {
                    name: "Fecha Registro",
                    template: {
                        content: {
                            parts: ["FECHA_INS"],
                            formatter: function (sDate) {
                                try {
                                    if (sDate !== null) {
                                        if (sDate === "TimeUnavailable")
                                            return '';
                                        else {
                                            var sDate_aux,
                                                sDate_format = '';
                                            if (sDate !== null) {
                                                sDate_aux = sDate.split('T');
                                                sDate_format = sDate_aux[0] + ' ' + sDate_aux[1];
                                            }
                                            return sDate_format;
                                        }
                                    } else {
                                        return sDate;
                                    }
                                } catch (err) {
                                    console.log("ERROR");
                                }
                            }
                        }
                    }
                }, {
                    name: "Material",
                    template: {
                        content: "{MATERIAL}"
                    }
                }, {
                    name: "Descripcion",
                    template: {
                        content: "{DESC}"
                    }
                }, {
                    name: "Cantidad",
                    template: {
                        content: "{QUANTITY}"
                    }
                }, {
                    name: "Documento",
                    template: {
                        content: "{DOCUMENT}"
                    }
                }, {
                    name: "Almacen",
                    template: {
                        content: "{ALMACEN}"
                    }
                }, {
                    name: "Lote",
                    template: {
                        content: "{LOTE}"
                    }
                }]
            });
            console.log(oExport.models);

            // download exported file
            oExport.saveFile().catch(function (oError) {
                MessageBox.error("Error durante la descarga. El buscador no puede ser soportado.\n\n" + oError);
            }).then(function () {
                oExport.destroy();
            });

        },

        onConsumo: function () {

            let cantidad = this.byId('ctd').getValue();
            let centro_costo = this.byId('cmb_material').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ext_centroCosto").value;
            let material = this.byId('cmb_material').getSelectedKey();
            let wc = this.byId('work_center').getSelectedKey();
            let um = this.byId('um').getValue();

            let es_lote = this.byId('cmb_material').getSelectedItem().mAggregations.customData[2].mProperties.valueOf("ext_esLote").value;
            let almacen = '', lote = '', spec_stock = '';

            if (es_lote == "1") {
                almacen = this.byId('lote_select').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ext_lgort").value;
                lote = this.byId('lote_select').getSelectedKey();
                spec_stock = this.byId('lote_select').getSelectedItem().getAdditionalText();
            } else {
                almacen = this.byId('cmb_almacen').getSelectedKey();
            }

            var oData = {
                "ALMACEN": almacen,
                "CANTIDAD": cantidad,
                "COST_CENTER": centro_costo,
                "LOTE": lote,
                "SPEC_STOCK": spec_stock,
                "MATERIAL": material,
                "PLANTA": "LM00",
                "USUARIO": this.byId('usuario').getValue(),
                "WORK_CENTER": wc,
                "UM": um,
                "VLTYP": spec_stock
            };

            var path = "MII/DatosTransaccionales/Produccion/Transaction/mov_201";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
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

                    if (opElement.firstChild !== null) {
                        var aData = eval(opElement.firstChild.data);
                        if (aData[0].error !== undefined) {
                            MessageToast.show(aData[0].error);
                        } else {
                            MessageToast.show(aData[0].message);
                            oThis.byId('ctd').setValue("");
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

        onChangeMat: function (oEvent) {

            let ceco_value = this.byId('cmb_material').getSelectedItem().mAggregations.customData[0].mProperties.valueOf("ext_centroCosto").value;
            let um_value = this.byId('cmb_material').getSelectedItem().mAggregations.customData[1].mProperties.valueOf("ext_um").value;
            let es_lote = this.byId('cmb_material').getSelectedItem().mAggregations.customData[2].mProperties.valueOf("ext_esLote").value;
            this.byId('um').setValue(um_value);
            let oThis = this;


            if (es_lote == "1") {
                this.byId("elm_lote").setVisible(true);
                this.byId("elm_almacen").setVisible(false);
                this.byId("lote_select").setSelectedKey("");
                this.byId("ctd").setValue("");
                let material = this.byId("cmb_material").getSelectedKey();
                let oData = {
                    "MATERIAL": material
                };
                this._base_onloadCOMBO("lote_select", oData, "MII/DatosTransaccionales/Produccion/Transaction/get_batch", "", "Lotes");
            } else {
                this.byId("elm_lote").setVisible(false);
                this.byId("elm_almacen").setVisible(true);
                this.byId("lote_select").setSelectedKey("");
                this.byId("ctd").setValue("");
                let material = this.byId("cmb_material").getSelectedKey();
                let oData = {
                    "MATERIAL": material
                };
                this._base_onloadCOMBO("cmb_almacen", oData, "MII/DatosTransaccionales/Produccion/Transaction/get_qty_materiales_NoLote", "", "Almacenes");
            }

            this.ceco_desc(ceco_value,oThis);

        },

        ceco_desc: function (ceco,oThis) {

            let oData = {
                CENTRO_COSTO: ceco
            };

            var path = "MII/DatosTransaccionales/Produccion/Transaction/get_ceco_nombre";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.ERROR !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.ERROR);
                            } else {

                                oThis.byId('inp_ceco').setValue(aData[0].CECO + " --- " + aData[0].DESCRIPCION);

                            }
                        } 
                    } 

                })

        },

        onChangeDesc: function () {
            this.byId('Material_input').setValue("");
            this.byId('um').setValue("");
        },

        onBuscaMaterial: function () {
            var descripcion = this.byId('desc_input').getValue().toUpperCase();
            var oData =
            {
                "MATERIAL": this.byId('Material_input').getValue(),
                "DESCRIPCION": descripcion
            };
            var path = "MII/DatosTransaccionales/Produccion/Transaction/get_material";
            console.log(oData);
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oThis = this;

            //sap.ui.core.BusyIndicator.show(0);

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.ERROR !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.ERROR);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);

                                // Assign the model object to the SAPUI5 core
                                //oView.getView().setModel(oModel);
                                oThis.byId('Material_input').setValue(aData.MATERIAL);
                                oThis.byId('desc_input').setValue(aData.DESCRIPCION);
                                oThis.byId('um').setValue(aData.UM);
                                oThis.islote = aData.ESLOTE;

                                var xData = {
                                    "MATERIAL": aData.MATERIAL
                                }

                                oThis._base_onloadCOMBO("Almacen_select", xData, "MII/DatosTransaccionales/Produccion/Transaction/get_storage", "", "Almacenes");
                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: \u00BFHay conexi\u00F3n de red??");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        onValidaMaterial: function () {

            var oData = {
                "MATERIAL": this.byId('inp_material').getValue()
            };

            var path = "MII/DatosTransaccionales/Produccion/Transaction/get_material";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
            uri = uri.replace(/\s+/g, '');

            var oThis = this;

            $.ajax({
                type: "GET",
                dataType: "xml",
                cache: false,
                url: uri,
                data: oData
            })
                .done(function (xmlDOM) {
                    var opElement = xmlDOM.getElementsByTagName("Row")[0].firstChild;

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData !== undefined) {
                            if (aData.ERROR !== undefined) {
                                oThis.getOwnerComponent().openHelloDialog(aData.ERROR);
                            } else {
                                //Create  the JSON model and set the data                                                                                                
                                var oModel = new sap.ui.model.json.JSONModel();
                                oModel.setData(aData);

                                oThis.byId('inp_material').setValue(aData.MATERIAL);
                                oThis.byId('inp_desc_material').setValue(aData.DESCRIPCION);
                                if (aData.ESLOTE == "0") {
                                    oThis.byId('lbl_esLote').setText("Material NO sujeto a lote");
                                } else {
                                    oThis.byId('lbl_esLote').setText("Material sujeto a lote");
                                }
                                oThis.byId('inp_esLote').setValue(aData.ESLOTE);
                                oThis.byId('inp_um').setValue(aData.UM);

                            }
                        } else {
                            MessageToast.show("No se han recibido " + name);
                        }
                    } else {
                        MessageToast.show("No se han recibido datos");
                    }

                    sap.ui.core.BusyIndicator.hide();

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (console && console.log) {
                        oThis.getOwnerComponent().openHelloDialog("La solicitud a fallado: \u00BFHay conexi\u00F3n de red??");
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        onCloseDialogonCrear: function () {
            this.getView().byId("add_material").close();
            this.getView().byId("add_material").destroy();
        },

        onAsignarMaterial: function () {

            var descripcion = this.byId('inp_desc_material').getValue(),
                material = this.byId('inp_material').getValue(),
                workCenter = this.byId('work_center').getProperty("selectedKey"),
                centroCosto = this.byId('cb_centroCostos').getProperty("selectedKey"),
                um = this.byId('inp_um').getValue(),
                es_lote = this.byId('inp_esLote').getValue();

            if (material == "" || descripcion == "" || centroCosto == "") {
                this.getOwnerComponent().openHelloDialog("Falta al menos 1 dato por llenar");
                return;
            }

            var oData = {
                "MATERIAL": material,
                "DESCRIPCION": descripcion,
                "WORK_CENTER": workCenter,
                "CENTRO_COSTOS": centroCosto,
                "UM": um,
                "ES_LOTE": es_lote
            };

            var path = "MII/DatosTransaccionales/Produccion/Transaction/set_material_combo";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
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

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData.ERROR !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData.ERROR);
                        } else {
                            MessageToast.show(aData.MESSAGE);
                            oThis.onCloseDialogonCrear();
                        }

                    } else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio información");
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

        onTest: function () {
            var combo_lotes = this.getView().byId("lote_select");
            var addText = combo_lotes.getSelectedItem().getAdditionalText();
            var text = combo_lotes.getSelectedItem().getText();
            var split_text = text.split(" ");

            this.byId("ctd").setValue(split_text[1]);
        },

        onReporte: function () {
            var oThis = this;
            //var anio = this.getView().byId("DP2").getValue();
            //var mes = this.getView().byId("mes").getSelectedKey();
            var mes2 = this.getView().byId("DP10").getValue();
            var wc = this.getView().byId("Puesto_Trabajo_select").getSelectedKey();

            var oData = {
                //"ANIO": anio,
                "MES": mes2,
                "WC": wc
            };
            //            
            oThis.loadGraph("idVizFrame", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_semanas", "Semanal");
            oThis.loadGraph("vizMes", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_mes", "Mensual");
            oThis._base_onloadTable("table_mes", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_mes_tab", "Tabla Mensual", ""); // 20200428
            oThis._base_onloadTable("table_semana", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_semanas_tab", "Tabla Semanal", ""); // 20200428

        },

        onReporteZinc: function () {
            var oThis = this;
            //var anio = this.getView().byId("DP2").getValue();
            //var mes = this.getView().byId("mes").getSelectedKey();
            var mes2 = this.getView().byId("DP").getValue();
            //var wc = this.getView().byId("Puesto_Trabajo_select").getSelectedKey();

            var oData = {
                "MATERIAL": "ZINC ",
                "DROSS": "000000000030000016",
                "MES": mes2,
                "WC": this.byId("Puesto_Trabajo_zinc").getSelectedKey()
            };

            var xData = {
                "MATERIAL": "ZINC/ALUMINIO",
                "DROSS": "000000000030000017",
                "MES": mes2,
                "WC": this.byId("Puesto_Trabajo_zinc").getSelectedKey()
            };
            //            
            oThis.loadGraph("ZincMes", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_zinc_mes", "Mensual Zinc");
            oThis.loadGraph("ZincAlMes", xData, "MII/DatosTransaccionales/Produccion/Transaction/calc_zinc_mes", "Mensual Aluminio Zinc");
            oThis.loadGraph("ZincSem", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_zinc_semanas", "Semanal Zinc");
            oThis.loadGraph("ZincAlSem", xData, "MII/DatosTransaccionales/Produccion/Transaction/calc_zinc_semanas", "Semanal Aluminio Zinc");
            oThis._base_onloadTable("tab_zinc_mes", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_tab_zinc_mes", "Tabla Mensual Zinc", "");
            oThis._base_onloadTable("tab_al_zinc_mes", xData, "MII/DatosTransaccionales/Produccion/Transaction/calc_tab_zinc_mes", "Tabla Mensual Aluminio Zinc", "");
            oThis._base_onloadTable("tab_zinc_sem", oData, "MII/DatosTransaccionales/Produccion/Transaction/calc_tab_zinc_semanas", "Tabla Semanal Zinc", "");
            oThis._base_onloadTable("tab_al_zinc_sem", xData, "MII/DatosTransaccionales/Produccion/Transaction/calc_tab_zinc_semanas", "Tabla Semanal Aluminio Zinc", "");

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

        onBorrarMaterial: function () {

            let work_center = this.byId("work_center").getSelectedKey();
            let material = this.byId("cmb_material").getSelectedKey();
            let desc_material = this.byId("cmb_material").getSelectedItem().getText();

            let oData = {
                "WORK_CENTER": work_center,
                "MATERIAL": material
            };

            this._handleMessageBoxConfirm_Baja("¿Confirma dar de baja el material " + desc_material + " ?", "warning", oData, this);

        },

        _handleMessageBoxConfirm_Baja: function (sMessage, sMessageBoxType, oData, oThis) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis.BorrarMaterial(oData, "MII/DatosTransaccionales/Produccion/Transaction/upd_material_consumo201");
                    }
                }.bind(this)
            });
        },

        BorrarMaterial: function (oData, path) {

            //var path = "MII/DatosTransaccionales/Produccion/Transaction/upd_material_consumo201";
            var uri = "http://" + this.getOwnerComponent().getManifestEntry("/sap.ui5/initData/server") + "/XMII/Runner?Transaction=" + path + "&OutputParameter=JsonOutput&Content-Type=text/xml"
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

                    if (opElement.firstChild !== null) {
                        var aData = JSON.parse(opElement.firstChild.data);
                        if (aData.ERROR !== undefined) {
                            oThis.getOwnerComponent().openHelloDialog(aData.ERROR);
                        } else {
                            MessageToast.show(aData.MESSAGE);
                            oThis._base_onloadCOMBO("cmb_material", oData, "MII/DatosTransaccionales/Produccion/Transaction/get_materials", "", "Materiales");
                            oThis.byId("um").setValue("");
                            oThis.byId("inp_ceco").setValue("");
                        }

                    } else {
                        oThis.getOwnerComponent().openHelloDialog("No se recibio información");
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


    });
});