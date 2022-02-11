var Personal = function(data){
	var self = this,
		storeName = "Personal",
		_DB_HANDLER = DB_HANDLER;

	this.dni = "";
	this.nombres_apellidos = "";
	this.rol = "";
	this.idplanilla = "";

	this.init = function(data){
		if (data){
			this.dni = data.dni ?? "";
			this.nombres_apellidos = data.nombres_apellidos ?? "";
			this.rol = data.rol ?? "";
			this.idplanilla = data.idplanilla ?? "";
		}

		this.idempresa = VARS.GET_EMPRESA();
	};

	this.obtenerRegistro = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {"indexes": "dni,idempresa" ,"values": [this.dni, this.idempresa]}));
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar(storeName, registros));
	};
	
	this.limpiar = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}));
	};

	this.listar = function(){
		$.when(_DB_HANDLER.listar(storeName))
			.done(function(e){
				console.log(e);
			})
			.fail(function(e){
				console.error(e);
			});
	};


	return this.init(data);
};