var Labor = function(data){
	var self = this,
		storeName = "Labor",
		_DB_HANDLER = DB_HANDLER;

	this.idlabor = null;
	this.idactividad = null;
	this.descripcion = "";

	this.init = function(data){
		if (data){
			this.idlabor = data.idlabor ?? null;
			this.idactividad = data.idactividad ?? null;
			this.descripcion = data.descripcion ?? "";	
		}
	};

	this.getLabor = function() {
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idlabor", values: this.idlabor}));
	};

	this.getLabores = function(){
		return $.when(_DB_HANDLER.listar(storeName));
	};

	this.getLaboresPorActividad = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idactividad", values: this.idactividad}));
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar(storeName, registros));
	};
	
	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar(storeName));
	};

	return this.init(data);
};