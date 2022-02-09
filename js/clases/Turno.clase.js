var Turno = function(data){
	var self = this,
		storeName = "Turno",
		_DB_HANDLER = DB_HANDLER;

	this.id_turno = null;
	this.descripcion = "";
	this.hora_entrada = "";
	this.hora_salida = "";

	this.init = function(data){
		if (data){
			this.id_turno = data.id_turno ?? null;
			this.descripcion = data.descripcion ?? "";
			this.hora_entrada = data.hora_entrada ?? "";
			this.hora_salida = data.hora_salida ?? "";
		}
	};

	this.getTurno = function() {
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "id_turno", values: this.id_turno}));
	};

	this.getTurnos = function(){
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