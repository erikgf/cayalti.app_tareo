var RegistroDia = function(data){
	var self = this,
		_DB_HANDLER = DB_HANDLER;

	var storeName = "RegistroDia";
	this.fecha_dia = "";
	this.idempresa = "";

	this.init = function(data){
		if (data){
			this.fecha_dia = data.fecha_dia ?? "";
		}

		this.idempresa = VARS.GET_EMPRESA();
	};

	this.getRegistroDias = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idempresa", values: this.idempresa}));
	};

	this.verificarExisteFecha = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {"indexes": "fecha_dia,idempresa" ,"values": [this.fecha_dia, this.idempresa]}));
	};

	this.eliminarRegistroDia = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}, 
				(objRegistro)=>{
					return 	objRegistro.fecha_dia === this.fecha_dia;		
				})
			);
	};

	this.eliminarRegistroDiaHasta = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}, 
			(objRegistro)=>{
				return 	objRegistro.fecha_dia < this.fecha_dia
			})
		);
	};

	this.addNuevaFechaDia = function(){
		var objNuevoRegistro = [];

		objNuevoRegistro.push({
			fecha_dia: this.fecha_dia,
			idempresa : this.idempresa
		});

		return $.when(_DB_HANDLER.registrar(storeName, objNuevoRegistro));
	};

	this.limpiar = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}));
	};

	return this.init(data);
};