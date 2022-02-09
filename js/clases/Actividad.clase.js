var Actividad = function(data){
	var self = this,
		storeName = "Actividad",
		_DB_HANDLER = DB_HANDLER;

	this.idactividad = null;
	this.descripcion = "";

	this.init = function(data){
		if (data){
			this.idactividad = data.idactividad ?? null;
			this.descripcion = data.descripcion ?? "";	
		}
	};

	this.getActividad = function() {
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idactividad", values: this.idactividad}));
	};

	this.getActividades = function(){
		return $.when(_DB_HANDLER.listar(storeName));
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar(storeName, registros));
	};
	
	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar(storeName));
	};

	return this.init(data);
};