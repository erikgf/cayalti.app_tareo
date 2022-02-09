var RegistroLaborPersonal = function(data){
	var self = this,
		_DB_HANDLER = DB_HANDLER;

	var storeName = "RegistroLaborPersonal";
	this.fecha_dia = "";
	this.idempresa = "";
	this.idcampo = "";
	this.dni_personal = "";
	this.estado_envio = "";

	this.init = function(data){
		if (data){
			this.fecha_dia = data.fecha_dia ?? "";
		}

		this.idempresa = new CacheComponente("_empresa").get();
	};

	this.getRegistrosDia = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,idempresa", 
															values: [this.fecha_dia, this.idempresa]}));
	};

	/*

	this.verificarExisteFecha = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {"indexes": "fecha_dia,idempresa" ,"values": [this.fecha_dia, this.idempresa]}));
	};

	this.eliminarRegistroDia = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, "=", "fecha_dia", this.fecha_dia));
	};

	this.eliminarRegistroDiaHasta = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, "<=", "fecha_dia", this.fecha_dia));
	};

	this.addNuevaFechaDia = function(){
		var objNuevoRegistro = [];

		objNuevoRegistro.push({
			fecha_dia: this.fecha_dia,
			idempresa : this.idempresa
		});

		return $.when(_DB_HANDLER.registrar(storeName, objNuevoRegistro));
	};
	*/

	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar(storeName));
	};

	return this.init(data);
};