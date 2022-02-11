var Usuario = function(data){
	var self = this,
		storeName = "Usuario",
		_DB_HANDLER = DB_HANDLER;

	this.idresponsable = null;
	this.nombres_apellidos = "";
	this.numero_documento = "";
	this.idempresa = "";

	this.init = function(data){
		if (data){
			this.idresponsable = data.idresponsable ?? null;
			this.nombres_apellidos = data.nombres_apellidos ?? "";	
			this.numero_documento = data.numero_documento ?? "";	
		}

		this.idempresa = VARS.GET_EMPRESA();
	};

	this.iniciarSesion = function(usuario, password){
		return $.when(_DB_HANDLER.listarFiltro(storeName, 
							{indexes: "usuario,clave,idempresa", values: [usuario.toUpperCase(),password.toUpperCase(),this.idempresa]}
					)
				);
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar(storeName, registros));
	};

	this.limpiar = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}));
	};

	return this.init(data);
};