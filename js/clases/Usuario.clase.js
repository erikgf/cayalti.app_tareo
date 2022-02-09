var Usuario = function(data){
	var self = this,
		_DB_HANDLER = DB_HANDLER;

	this.idresponsable = null;
	this.nombres_apellidos = "";
	this.numero_documento = "";

	this.init = function(data){
		if (data){
			this.idresponsable = data.idresponsable ?? null;
			this.nombres_apellidos = data.nombres_apellidos ?? "";	
			this.numero_documento = data.numero_documento ?? "";	
		}
	};

	this.iniciarSesion = function(usuario, password){
		return $.when(_DB_HANDLER.listarFiltro("Usuario", 
							{indexes: "usuario,clave", values: [usuario.toUpperCase(),password.toUpperCase()]}
					)
				);
	};

	this.insertarPorSincronizacion = function(registros){
		return $.when(_DB_HANDLER.registrar("Usuario", registros));
	};

	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar("Usuario"));
	};

	return this.init(data);
};