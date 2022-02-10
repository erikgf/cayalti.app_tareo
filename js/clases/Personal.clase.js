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

		this.idempresa = new CacheComponente("_empresa").get();
	};

	this.obtenerRegistro = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {"indexes": "dni,idempresa" ,"values": [this.dni, this.idempresa]}));
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar(storeName, registros));
	};
	
	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar(storeName));
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