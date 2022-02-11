var Actividad = function(data){
	var self = this,
		storeName = "Actividad",
		_DB_HANDLER = DB_HANDLER;

	this.idactividad = null;
	this.descripcion = "";
	this.idempresa = "";

	this.init = function(data){
		if (data){
			this.idactividad = data.idactividad ?? null;
			this.descripcion = data.descripcion ?? "";	
		}

		this.idempresa = VARS.GET_EMPRESA();
	};

	this.consultar = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idempresa", values: this.idempresa}));
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar(storeName, registros));
	};
	
	this.limpiar = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}));
	};

	return this.init(data);
};