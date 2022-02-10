var RegistroLaborPersonal = function(data){
	var self = this,
		_DB_HANDLER = DB_HANDLER;

	var storeName = "RegistroLaborPersonal";
	this.fecha_dia = "";
	this.idempresa = "";
	this.idcampo = "";
	this.dni_usuario = "";
	this.dni_personal = "";
	this.estado_envio = "";

	this.init = function(data){
		if (data){
			this.fecha_dia = data.fecha_dia ?? "";
			this.dni_usuario = data.dni_usuario ?? "";
		}

		this.idempresa = new CacheComponente("_empresa").get();
	};

	this.getRegistrosDia = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,dni_usuario,idempresa", 
															values: [this.fecha_dia, this.dni_usuario, this.idempresa]}));
	};

	this.getRegistrosPorRegistroLabor = function({idturno, idlabor, idcampo}){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,dni_usuario,idempresa,idcampo,idlabor,idturno", 
															values: [this.fecha_dia, this.dni_usuario, this.idempresa, idcampo, idlabor, idturno]}));
	};

	this.registrarMultiple = function({arreglo_personal, idturno, idlabor, idcampo, numero_horas_diurno, numero_horas_nocturno, objLatitudLongitud}){
		var objNuevoRegistros = arreglo_personal.map((item)=>{
			return {
				...item,
				dni_usuario: this.dni_usuario,
				fecha_dia: this.fecha_dia,
				idempresa: this.idempresa,
				idturno: idturno,
			    idlabor: idlabor,
			    idcampo: idcampo,
			    numero_horas_diurno : numero_horas_diurno,
			    numero_horas_nocturno: numero_horas_nocturno,
			    latitud: objLatitudLongitud.latitud,
			    longitud: objLatitudLongitud.longitud
			};
		});

		return $.when(_DB_HANDLER.registrar(storeName, objNuevoRegistros));
	};


	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar(storeName));
	};

	return this.init(data);
};