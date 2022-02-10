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

		this.idempresa = new CacheComponente("_empresa").get();
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
		var objNuevoRegistro = [];

		objNuevoRegistro.push({
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
		});

		if (id == ""){
			return $.when(_DB_HANDLER.registrar(storeName, objNuevoRegistro));
		}

		return $.when(_DB_HANDLER.actualizar(storeName, "=", "id", id, null, objNuevoRegistro[0]));
	};

	this.getRegistro = function({idcampo, idlabor, idturno}){
		return $.when(_DB_HANDLER.listarFiltro(storeName, {indexes: "fecha_dia,dni_usuario,idempresa,idlabor,idcampo,idturno", 
															values: [this.fecha_dia, this.dni_usuario, this.idempresa, idlabor, idcampo, idturno]}));
	};

/*
return _db.selectData("SELECT la.descripcion as labor, ca.descripcion as campo, "+
                                " (CASE idtipotareo WHEN 'T' THEN 'POR TAREO' ELSE 'JORNAL' END) as tipo_tareo, "+  
                                " rl.idturno, "+
                                " tu.descripcion as turno"+
                                "   FROM registro_labor rl "+
                                "   INNER JOIN campo ca ON ca.idcampo = rl.idcampo "+
                                "   INNER JOIN labor la ON la.idlabor = rl.idlabor "+
                                "   INNER JOIN turno tu ON tu.idturno = rl.idturno "+
                                "   WHERE rl.fecha_dia = date(?)  AND  rl.idlabor = ? AND rl.idcampo = ? AND rl.idturno = ?",
                    [fecha_dia, idlabor, idcampo, idturno]);

*/
	/*
    this.obtenerRegistrosLabores = function(fecha_dia, dni_usuario) {
        var sql = "SELECT rl.id, rl.idlabor, rl.idcampo, rl.idturno, ca.descripcion as campo, "+
                    " la.descripcion as labor, "+
                    " a.descripcion as actividad, "+
                    " t.descripcion as turno, "+
                    " (CASE idtipotareo WHEN 'T' THEN 'POR TAREO' ELSE 'JORNAL' END) as tipo_tareo, "+
                    " (SELECT COUNT(id) FROM registro_labor_personal rlp WHERE rlp.fecha_dia = rl.fecha_dia AND rlp.idlabor = rl.idlabor AND rlp.idcampo = rl.idcampo AND rlp.idturno = rl.idturno) as registros_totales "+
                    " FROM registro_labor rl "+
                    " INNER JOIN labor la ON rl.idlabor = la.idlabor "+
                    " INNER JOIN actividad a ON a.idactividad = la.idactividad "+
                    " INNER JOIN campo ca ON ca.idcampo = rl.idcampo "+
                    " INNER JOIN turno t ON t.idturno = rl.idturno "+
                    " WHERE rl.fecha_dia = ? AND dni_usuario = ?"+
                    " ORDER BY rl.idcampo, la.idactividad, hora_registro DESC";

        return _db.selectData(sql,
                    [fecha_dia, dni_usuario]);
    };
    */

	this.limpiar = function(){
		return $.when(_DB_HANDLER.limpiar(storeName));
	};

	return this.init(data);
};