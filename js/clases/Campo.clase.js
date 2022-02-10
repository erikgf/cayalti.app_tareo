var Campo = function(data){
	var self = this,
		storeName = "Campo",
		_DB_HANDLER = DB_HANDLER;

	this.idcampo = null;
	this.descripcion = "";
	this.idempresa = "";

	this.init = function(data){
		if (data){
			this.idcampo = data.idcampo ?? null;
			this.descripcion = data.descripcion ?? "";	
		}

		this.idempresa = new CacheComponente("_empresa").get();
	};

	this.consultar = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idempresa", values: this.idempresa}));
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar(storeName, registros));
	};
	
	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar(storeName));
	};

	return this.init(data);
};