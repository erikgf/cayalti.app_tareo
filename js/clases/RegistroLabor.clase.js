var RegistroLabor = function(data){
	var self = this,
		_DB_HANDLER = DB_HANDLER;

	var storeName = "RegistroLabor";
	this.fecha_dia = "";
	this.idempresa = "";
	this.idcampo = "";
	this.dni_usuario = "";

	this.init = function(data){
		if (data){
			this.fecha_dia = data.fecha_dia ?? "";
			this.dni_usuario = data.dni_usuario ?? "";
		}

		this.idempresa = VARS.GET_EMPRESA();
	};

	this.getRegistrosDia = function(){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,dni_usuario,idempresa", 
															values: [this.fecha_dia, this.dni_usuario, this.idempresa]}));
	};

	this.obtenerRegistroLabor = function(id){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "id", values: parseInt(id)}));
	};

	this.verificarRegistroLaborExiste = function({idcampo, idlabor, idtipotareo, idturno, id}){
        let indexes = "fecha_dia,dni_usuario,idempresa,idcampo,idlabor,idtipotareo,idturno";
        let values = [this.fecha_dia, this.dni_usuario, this.idempresa, idcampo, idlabor, idtipotareo, idturno];
        if (id != ""){
        	indexes += ",id";
        	values.push(id);
        }

		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: indexes, values: values}));
	};

	this.registrar = function({idcampo, idactividad, idlabor, idtipotareo, idturno, campo, labor, actividad, turno, id}){
		var objNuevoRegistro = {
			fecha_dia: this.fecha_dia,
			idempresa : this.idempresa,
			dni_usuario: this.dni_usuario,
			idcampo: idcampo,
			idactividad : idactividad,
			idlabor: idlabor,
			idtipotareo: idtipotareo,
			idturno: idturno,
			campo: campo,
			labor: labor,
			actividad: actividad,
			turno: turno
		};

		if (id == ""){
			return $.when(_DB_HANDLER.registrar(storeName, [objNuevoRegistro]));
		}

		return $.when(_DB_HANDLER.actualizar(storeName, "=", "id", parseInt(id), null, objNuevoRegistro));
	};

	this.getRegistro = function({idcampo, idlabor, idturno}){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,dni_usuario,idempresa,idlabor,idcampo,idturno", 
															values: [this.fecha_dia, this.dni_usuario, this.idempresa, idlabor, idcampo, idturno]}));
	};

	this.eliminarRegistroDiaById = function({id}){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "id", value: parseInt(id)}, 
				(objRegistro)=>{
					return  true;	
				})
			);
	};

	this.eliminarRegistroLabor = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: [this.idempresa]}, 
				(objRegistro)=>{
					return 	objRegistro.fecha_dia === this.fecha_dia;		
				})
			);
	};

	this.limpiar = function(){
		return $.when(_DB_HANDLER.eliminar(storeName, {index: "idempresa", value: this.idempresa}));
	};

	return this.init(data);
};