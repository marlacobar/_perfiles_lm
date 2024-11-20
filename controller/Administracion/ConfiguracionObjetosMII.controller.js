sap.ui.define([
    "sap/ui/demo/webapp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../../model/formatter"
], function(BaseController, MessageToast, MessageBox,formatter) {
    "use strict";
    const RUTA_DELETE_OBJ = "RUTA_DELETE_OBJ";
    const RUTA_UPDATE_ROL = "RUTA_UPDATE_ROL";
    const RUTA_UPDATE_WC = "RUTA_UPDATE_WC";
    const RUTA_CREATE_OBJ = "RUTA_CREATE_OBJ";
    const RUTA_UPDATE_OBJ = "RUTA_UPDATE_OBJ";
    return BaseController.extend("sap.ui.demo.webapp.controller.Administracion.ConfiguracionObjetosMII", {
        formatter: formatter, 

        onInit: function() {
            var oRouter = this.getRouter();
            oRouter.getRoute("ConfiguracionObjetosMII").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            var oArgs = oEvent.getParameter("arguments");
			this._getUsuario("username","avatar");
            var planta = oArgs.planta;
            this.getView().getModel("ModeloPrincipal").setProperty("/PLANTA",planta)
        },

        buscarObjetosMII: function(){
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = this.byId("inp_idObjeto").getValue();
            var ds_objeto = this.byId("inp_dsObjeto").getValue();
            var vista = this.byId("inp_rutaObjeto").getValue();
            var oData = {
                "CD_PLANTA" :   planta,
                "USUARIO"   :   usuario,
                "ID_OBJETO" :   id_objeto,
                "DS_OBJETO" :   ds_objeto,
                "VISTA"     :   vista
            };
            var path = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Obtener";
            var tabla = "tbl_objetosMII";
            var name = "ObjetosMII";
            this._base_onloadTable(tabla, oData, path, name,"");
        },

        onRecuperarObjeto: function(oEvent){
            var id_objeto = oEvent.getSource().getSelectedItem().getBindingContext().getObject().ID_OBJETO;
            var cd_objeto = oEvent.getSource().getSelectedItem().getBindingContext().getObject().CD_OBJETO;
            var ds_objeto = oEvent.getSource().getSelectedItem().getBindingContext().getObject().DS_OBJETO;
            var vista = oEvent.getSource().getSelectedItem().getBindingContext().getObject().VISTA;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oData = {
                "CD_PLANTA" :   planta,
                "USUARIO"   :   usuario,
                "ID_OBJETO" :   id_objeto,
                "CD_OBJETO" :   cd_objeto,
                "DS_OBJETO" :   ds_objeto,
                "VISTA"     :   vista
            };
            var pathWC = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/WorkCenter_Obtener";
            var pathOWC = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_WC_Obtener";
            var pathR = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/Roles_Obtener";
            var pathOA = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Auth_Obtener";
            
            var tablaWC = "tbl_workCenter";
            var tablaOWC = "tbl_objetoWC";
            var tablaR = "tbl_roles";
            var tablaOA = "tbl_objetoAuth";

            var nameWC = "Puestos";
            var nameOWC = "Asigaciones";
            var nameR = "Roles";
            var nameOA = "Autorizaciones";
            this._base_onloadTable(tablaWC, oData, pathWC, nameWC,"");
            this._base_onloadTable(tablaOWC, oData, pathOWC, nameOWC,"");
            this._base_onloadTable(tablaR, oData, pathR, nameR,"");
            this._base_onloadTable(tablaOA, oData, pathOA, nameOA,"");
            this.cargarInformacionFormulario(oData);
        },

        agregarAutorizacion:function(){
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().ID_OBJETO;
            var cd_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().CD_OBJETO;
            var items = this.byId("tbl_roles").getSelectedItems();
            var xml_completo = '<Rowsets>\n';
            xml_completo += '<Rowset>\n';
            
            if (items.length > 0) {
                items.forEach(function(item) {
                    xml_completo += "<Row>\n";
                    xml_completo += '<CD_ROL>'+item.getBindingContext().getObject().CD_ROL+'</CD_ROL>\n';
					xml_completo += '<DS_ROL>'+item.getBindingContext().getObject().DS_ROL+'</DS_ROL>\n';
                    xml_completo += "</Row>\n";
                });
                xml_completo += "</Rowset>\n";
                xml_completo += "</Rowsets>\n";

				var oData = {
                    "CD_OBJETO" :   cd_objeto,
                    "CD_PLANTA" :   planta,
                    "ID_OBJETO"	:	id_objeto,
					"ROLES"	    :	xml_completo,
                    "USUARIO"   :   usuario
				};

				var path="MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Auth_Asignar";
                var postEx = RUTA_UPDATE_ROL;
                this._ejecutarTransaccion(oData,path,postEx)
            }
            else{ 
                oThis.getOwnerComponent().openHelloDialog(resourceModel.getResourceBundle().getText("Seleccione al menos una característica"));
            }
        },

        quitarAutorizacion:function(){
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().ID_OBJETO;
            var cd_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().CD_OBJETO;
            var items = this.byId("tbl_objetoAuth").getSelectedItems();
            var xml_completo = '<Rowsets>\n';
            xml_completo += '<Rowset>\n';
            
            if (items.length > 0) {
                items.forEach(function(item) {
                    xml_completo += "<Row>\n";
                    xml_completo += '<CD_ROL>'+item.getBindingContext().getObject().CD_ROL+'</CD_ROL>\n';
					xml_completo += '<DS_ROL>'+item.getBindingContext().getObject().DS_ROL+'</DS_ROL>\n';
                    xml_completo += "</Row>\n";
                });
                xml_completo += "</Rowset>\n";
                xml_completo += "</Rowsets>\n";

				var oData = {
                    "CD_OBJETO" :   cd_objeto,
                    "CD_PLANTA" :   planta,
                    "ID_OBJETO"	:	id_objeto,
					"ROLES"	    :	xml_completo,
                    "USUARIO"   :   usuario
				};

				var path="MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Auth_Quitar";
				var postEx = RUTA_UPDATE_ROL;
                this._ejecutarTransaccion(oData,path,postEx)
            }
            else{ 
                oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexión de red?");
            }
        },

        actualizarTablasRoles: function(){
            var id_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().ID_OBJETO;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oData = {
                "CD_PLANTA" :   planta,
                "USUARIO"   :   usuario,
                "ID_OBJETO" :   id_objeto
            };
            var pathR = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/Roles_Obtener";
            var pathOA = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Auth_Obtener";
            
            var tablaR = "tbl_roles";
            var tablaOA = "tbl_objetoAuth";

            var nameR = "Roles";
            var nameOA = "Autorizaciones";

            this._base_onloadTable(tablaR, oData, pathR, nameR,"");
            this._base_onloadTable(tablaOA, oData, pathOA, nameOA,"");            
        },

        asignarWorkCenter:function(){
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().ID_OBJETO;
            var cd_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().CD_OBJETO;
            var items = this.byId("tbl_workCenter").getSelectedItems();
            var xml_completo = '<Rowsets>\n';
            xml_completo += '<Rowset>\n';
            
            if (items.length > 0) {
                items.forEach(function(item) {
                    xml_completo += "<Row>\n";
                    xml_completo += '<CD_WORK_CENTER>'+item.getBindingContext().getObject().CD_WORK_CENTER+'</CD_WORK_CENTER>\n';
					xml_completo += '<DS_WORK_CENTER>'+item.getBindingContext().getObject().DS_WORK_CENTER+'</DS_WORK_CENTER>\n';
                    xml_completo += "</Row>\n";
                });
                xml_completo += "</Rowset>\n";
                xml_completo += "</Rowsets>\n";

				var oData = {
                    "CD_OBJETO" :   cd_objeto,
                    "CD_PLANTA" :   planta,
                    "ID_OBJETO"	:	id_objeto,
					"WC"	    :	xml_completo,
                    "USUARIO"   :   usuario
				};

				var path="MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_WC_Asignar";
				var postEx = RUTA_UPDATE_WC;
                this._ejecutarTransaccion(oData,path,postEx)
            }
            else{ 
                oThis.getOwnerComponent().openHelloDialog(resourceModel.getResourceBundle().getText("Seleccione al menos una característica"));
            }
        },

        desasignarWorkCenter:function(){
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().ID_OBJETO;
            var cd_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().CD_OBJETO;
            var items = this.byId("tbl_objetoWC").getSelectedItems();
            var xml_completo = '<Rowsets>\n';
            xml_completo += '<Rowset>\n';
            
            if (items.length > 0) {
                items.forEach(function(item) {
                    xml_completo += "<Row>\n";
                    xml_completo += '<CD_WORK_CENTER>'+item.getBindingContext().getObject().CD_WORK_CENTER+'</CD_WORK_CENTER>\n';
					xml_completo += '<DS_WORK_CENTER>'+item.getBindingContext().getObject().DS_WORK_CENTER+'</DS_WORK_CENTER>\n';
                    xml_completo += "</Row>\n";
                });
                xml_completo += "</Rowset>\n";
                xml_completo += "</Rowsets>\n";

				var oData = {
                    "CD_OBJETO" :   cd_objeto,
                    "CD_PLANTA" :   planta,
                    "ID_OBJETO"	:	id_objeto,
					"WC"	    :	xml_completo,
                    "USUARIO"   :   usuario
				};

				var path="MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_WC_Quitar";
				var postEx = RUTA_UPDATE_WC;
                this._ejecutarTransaccion(oData,path,postEx)
            }
            else{ 
                oThis.getOwnerComponent().openHelloDialog("La solicitud ha fallado: Hay conexión de red?");
            }
        },

        actualizarTablasWC: function(){
            var id_objeto = this.byId("tbl_objetosMII").getSelectedItem().getBindingContext().getObject().ID_OBJETO;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var oData = {
                "CD_PLANTA" :   planta,
                "USUARIO"   :   usuario,
                "ID_OBJETO" :   id_objeto
            };
            var pathWC = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/WorkCenter_Obtener";
            var pathOWC = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_WC_Obtener";
            
            var tablaWC = "tbl_workCenter";
            var tablaOWC = "tbl_objetoWC";

            var nameWC = "Puestos";
            var nameOWC = "Asigaciones";

            this._base_onloadTable(tablaWC, oData, pathWC, nameWC,"");
            this._base_onloadTable(tablaOWC, oData, pathOWC, nameOWC,"");            
        },

        crearNuevoObjetoMII:function(){
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = this.byId("inp_newIdObjetoMII").getValue();
            var ds_objeto = this.byId("inp_newDsObjeto").getValue();
            var vista = this.byId("inp_newVista").getValue();
            var path = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Agregar";
            var message = "¿Confirmar creación?"
            var postEx = RUTA_CREATE_OBJ;

            var oData = {
                "CD_PLANTA" :   planta,
                "DS_OBJETO" :   ds_objeto,
                "CD_OBJETO" :   id_objeto,
                "USUARIO"   :   usuario,
                "VISTA"     :   vista
            };

            if(planta.trim() === "" || ds_objeto.trim() === "" || id_objeto.trim() === "" || vista.trim() === "" || usuario.trim() === ""){
                MessageBox.error("Todos los campos son requeridos");
                return;
            }
            this.confirmarAccion(oData,path,message,postEx)
        },

        confirmarAccion: function(oData,path,message,postEx){
            var oThis = this;
            MessageBox["warning"](message, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        oThis._ejecutarTransaccion(oData,path,postEx);
                    }
                }.bind(this)
            });
        },

        recargarNuevoDato: function(){
            var cd_objeto = this.byId("inp_newIdObjetoMII").getValue();
            var vista = this.byId("inp_newVista").getValue();
            var oData = {
                "CD_OBJETO" :   cd_objeto,
                "VISTA"     :   vista
            };
            this.limpiarTablas();
            this.limpiarFormularioAgregar();
            this.setearNuevoDato(oData);
        },
        
        limpiarFormularioAgregar: function(){
            this.byId("inp_newIdObjetoMII").setValue("");
            this.byId("inp_newDsObjeto").setValue("");
            this.byId("inp_newVista").setValue("");
        },

        setearNuevoDato: function(oData){
            this.byId("inp_idObjeto").setValue(oData.CD_OBJETO);
            this.byId("inp_rutaObjeto").setValue(oData.VISTA);
            this.buscarObjetosMII();
        },

        cargarInformacionFormulario: function(oData){
            this.byId("inp_newIdObjetoMII").setValue(oData.CD_OBJETO);
            this.byId("inp_newDsObjeto").setValue(oData.DS_OBJETO);
            this.byId("inp_newVista").setValue(oData.VISTA);
        },

        eliminarObjetoMII: function(oEvent){
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = oEvent.getSource().getBindingContext().getObject().ID_OBJETO;
            var oData = {
                "CD_PLANTA" :   planta,
                "ID_OBJETO" :   id_objeto,
                "USUARIO"   :   usuario
            };
            var path = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Quitar";
            var postEx = RUTA_DELETE_OBJ;
            var message="¿Confirmar eliminación?";
            this.confirmarAccion(oData,path,message,postEx)
        },

        modficarObjetoMII: function(){
            var oThis = this;
            var planta = this.getView().getModel("ModeloPrincipal").getProperty("/PLANTA");
            var usuario = this.getView().getModel("ModeloPrincipal").getProperty("/USUARIO");
            var id_objeto = this.byId("inp_newIdObjetoMII").getValue();
            var ds_objeto = this.byId("inp_newDsObjeto").getValue();
            var vista = this.byId("inp_newVista").getValue();
            var path = "MII/DatosTransaccionales/Sistema/Objetos/Transaction/ObjetoMII_Modificar";
            var message = "¿Confirmar modificación?"
            var postEx = RUTA_UPDATE_OBJ;

            var oData = {
                "CD_PLANTA" :   planta,
                "DS_OBJETO" :   ds_objeto,
                "CD_OBJETO" :   id_objeto,
                "USUARIO"   :   usuario,
                "VISTA"     :   vista
            };

            if(planta.trim() === "" || ds_objeto.trim() === "" || id_objeto.trim() === "" || vista.trim() === "" || usuario.trim() === ""){
                MessageBox.error("Todos los campos son requeridos");
                return;
            }
            this.confirmarAccion(oData,path,message,postEx)
        },

        onAfterEjecutarTransaccion: function(postEx,params){
            switch(postEx){
                case RUTA_UPDATE_ROL:
                    this.actualizarTablasRoles();
                    MessageToast.show(params.mensaje);
                    break;
                case RUTA_UPDATE_WC:
                    this.actualizarTablasWC();
                    MessageToast.show(params.mensaje);
                    break;
                case RUTA_CREATE_OBJ:
                    this.recargarNuevoDato();
                    MessageToast.show(params.mensaje);
                    break;
                case RUTA_DELETE_OBJ:
                    this.buscarObjetosMII();
                    this.limpiarTablas();
                    MessageToast.show(params.mensaje);
                    break;
                default:
                    MessageToast.show(params.mensaje);
                    break;
            }
        },

        limpiarTablas: function(){
            var tablaWC = this.byId("tbl_workCenter");
            var tablaOWC = this.byId("tbl_objetoWC");
            var tablaR = this.byId("tbl_roles");
            var tablaOA = this.byId("tbl_objetoAuth");
            var modeloInicial = new sap.ui.model.json.JSONModel();

            modeloInicial.setData({});
            tablaWC.setModel(modeloInicial);
			tablaOWC.setModel(modeloInicial);
			tablaR.setModel(modeloInicial);
			tablaOA.setModel(modeloInicial);
        },

        limpiarVista: function(){
            var tablaWC = this.byId("tbl_workCenter");
            var tablaOWC = this.byId("tbl_objetoWC");
            var tablaR = this.byId("tbl_roles");
            var tablaOA = this.byId("tbl_objetoAuth");
            var modeloInicial = new sap.ui.model.json.JSONModel();

            modeloInicial.setData({});
            tablaWC.setModel(modeloInicial);
			tablaOWC.setModel(modeloInicial);
			tablaR.setModel(modeloInicial);
			tablaOA.setModel(modeloInicial);
		},

    });
});