var Campo = function(data){
	var self = this,
		storeName = "Campo",
		_DB_HANDLER = DB_HANDLER;

	this.idcampo = null;
	this.descripcion = "";

	this.init = function(data){
		if (data){
			this.idcampo = data.idcampo ?? null;
			this.descripcion = data.descripcion ?? "";	
		}
	};

	this.getCampo = function() {
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idcampo", values: this.idcampo}));
	};

	this.getCampos = function(){
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