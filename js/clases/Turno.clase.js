var Turno = function(data){
	var self = this,
		storeName = "Turno",
		_DB_HANDLER = DB_HANDLER;

	this.id_turno = null;
	this.descripcion = "";
	this.hora_entrada = "";
	this.hora_salida = "";
	this.idempresa = "";

	this.init = function(data){
		if (data){
			this.id_turno = data.id_turno ?? null;
			this.descripcion = data.descripcion ?? "";
			this.hora_entrada = data.hora_entrada ?? "";
			this.hora_salida = data.hora_salida ?? "";
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