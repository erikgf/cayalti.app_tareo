var RegistroDiaPersonal = function(data){
	var self = this,
		_DB_HANDLER = DB_HANDLER;

	var storeName = "RegistroDiaPersonal";
	this.fecha_dia = "";
	this.idempresa = "";
	this.pareado = "";
	this.idcampo = "";
	this.dni_personal = "";
	this.estado_envio = "";
	this.tipo_registro = "";

	this.init = function(data){
		if (data){
			this.fecha_dia = data.fecha_dia ?? "";
			this.dni_usuario = data.dni_usuario ?? "";
			this.dni_personal = data.dni_personal ?? "";
		}

		this.idempresa = VARS.GET_EMPRESA();
	};

	this.getRegistrosDia = function(){
		var tipo_registro = "E";
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,tipo_registro,idempresa", 
															values: [this.fecha_dia, tipo_registro, this.idempresa]}));
	};

	this.getRegistrosEmpresa = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "idempresa", 
															values: [this.idempresa]}));
	};

	this.getRegistrosPorDia = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,dni_usuario,idempresa", 
															values: [this.fecha_dia,this.dni_usuario, this.idempresa]}));
	};

	this.eliminarRegistroDia = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}, 
				(objRegistro)=>{
					return 	objRegistro.fecha_dia === this.fecha_dia;		
				})
			);
	};

	this.eliminarRegistroDiaPersonal = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: [this.idempresa]}, 
				(objRegistro)=>{
					return 	objRegistro.fecha_dia === this.fecha_dia;		
				})
			);
	};

	this.eliminarRegistro = function({numero_acceso, tipo_registro}){
		return $.when(_DB_HANDLER.eliminar(storeName, 
					{index: "fecha_dia,dni_personal,idempresa", value: [this.fecha_dia, this.dni_personal, this.idempresa]}, 
				(objRegistro)=>{
					return  objRegistro.numero_acceso == numero_acceso &&
								objRegistro.tipo_registro === tipo_registro;		
				})
			);
	};

	this.obtenerUltimoMovimientoAsistencia = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {"indexes": "fecha_dia,dni_personal,idempresa" ,"values": [ this.fecha_dia,this.dni_personal,this.idempresa]}));
	};

	this.registrarAsistencia = function({nombres_apellidos, tipo_registro, numero_acceso, latitud, longitud, hora_registro}){
		var objNuevoRegistro = [];
		objNuevoRegistro.push({
			fecha_dia: this.fecha_dia,
			nombres_apellidos: nombres_apellidos,
			tipo_registro: tipo_registro,
			numero_acceso: numero_acceso,
			latitud: latitud,
			longitud: longitud,
			dni_personal: this.dni_personal,
			dni_usuario: this.dni_usuario,
			idempresa : this.idempresa,
			hora_registro: hora_registro,
			estado_envio: "0",
			pareados: "0",
			idempresa : this.idempresa
		});

		return $.when(_DB_HANDLER.registrar(storeName, objNuevoRegistro));
	};

	this.marcarRegistrosParaEnvio = function({pareados}){
		return $.when(_DB_HANDLER.actualizar(storeName, "=", "fecha_dia,dni_personal,idempresa", 
					[this.fecha_dia,this.dni_personal,this.idempresa], null,
					{pareados: pareados}));
	};

	this.obtenerRegistrosAsistencia = function(){
		this.estado_envio = "0";
		return $.when(_DB_HANDLER.listarFiltro(storeName, {
									"indexes": "fecha_dia,estado_envio,idempresa",
									"values": [ this.fecha_dia,this.estado_envio,this.idempresa]
								}));
	};

	this.marcarRegistrosAsistenciaEnviados = function({estado_envio}){
		return $.when(_DB_HANDLER.actualizar(storeName, "=", "fecha_dia,idempresa", 
					[this.fecha_dia,this.idempresa], null,
					{estado_envio: estado_envio}));
	};
		
	this.limpiar = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}));
	};

	return this.init(data);
};
