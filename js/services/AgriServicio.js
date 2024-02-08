var AgriServicio = function() {
	var _db;

    this.initialize = function(db) {
      //  var deferred = $.Deferred();        
        _db = db;
     //   deferred.resolve();
        return this.compilar();//deferred.promise();
    };

    this.compilar = function(){
      var esAppMovil = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      console.log({esAppMovil});
      return esAppMovil ?  $.get("template.master.hbs") : $.get("template.compiler.php");
    };

    this.iniciarSesion = function(_login, _clave){
    	return _db.selectData(
    				"SELECT dni, nombres_apellidos as nombre_usuario, usuario, idresponsable FROM usuario WHERE lower(usuario) = lower(?) AND clave = ?",
    				[_login,_clave]);
    };

    this.insertarUsuarios = function(data, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
    	return _db.insertarDatos("usuario",  
    								["dni","nombres_apellidos", "usuario", "clave","idresponsable"],
			    						data, 
			    							cleanAll);
    };

    this.insertarPersonal = function(data, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("personal",  
                                    ["dni","nombres_apellidos"],
                                        data, 
                                            cleanAll);
    };

    this.insertarActividades = function(data, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("actividad",  
                                    ["idactividad", "descripcion"],
                                        data, 
                                            cleanAll);
    };

    this.insertarLabores = function(data, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("labor",  
                                    ["idlabor", "descripcion","idactividad", "unidad_medida"],
                                        data, 
                                            cleanAll);
    };

     this.insertarCampos = function(data, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("campo",  
                                    ["idcampo","descripcion"],
                                        data, 
                                            cleanAll);
    };

    this.insertarVariables = function(variables){
        return _db.insertarDatos("_variables_",  
                                    ["nombre_variable", "valor"],
                                        variables, 
                                            true);
    };

    this.insertarTurnos = function(turnos){
        return _db.insertarDatos("turno",  
                                    ["idturno", "descripcion", "hora_entrada", "hora_salida"],
                                        turnos, 
                                            true);
    };

    this.insertarUnidadMedidas = function(data, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
    	return _db.insertarDatos("unidad_medida",  
    								["id_unidad_medida","descripcion"],
			    						data, 
			    							cleanAll);
    };

    this.insertarRegistroEntradas = function(registro_entradas){
        return _db.insertarDatos("registro_dia_cultivo_lote_personal",  
                                    ["fecha_dia", "idcultivo", "dni_personal", "idlote", "idlabor", "idturno", "tipo_acceso", "numero_acceso", "hora_registro", "pareado","estado_envio"],
                                        registro_entradas, 
                                            false);

    };


    this.consultarDiasRegistro = function() { //por modificar
        return _db.selectData(
                    "SELECT strftime('%Y-%m-%d',(datetime('now','localtime'))) = fecha_dia as hoy, fecha_dia as fecha_dia_raw, strftime('%d-%m-%Y',fecha_dia) as fecha_dia "+
                        " FROM registro_dia  "+
                        " ORDER BY date(fecha_dia)",
                    []);
    };

    this.insertarDiaRegistro = function(diaHoy){
        return _db.insertarDiaRegistro(diaHoy);
    };


    this.consultarExistenciaDia = function(diaHoy){
        return _db.selectData(
                    "SELECT COUNT(id) > 0 as existencia FROM registro_dia  "+
                        " WHERE fecha_dia = ?",
                    [diaHoy]);
    };

    this.cargarPuntosAcceso = function() {
        return _db.selectData(
                    "SELECT idcultivo, descripcion FROM cultivo ORDER BY descripcion DESC",
                    []);
    };

    this.limpiarDiasAnterioresRegistroDia = function () {
        return _db.ejecutarSQL("DELETE FROM registro_dia WHERE DATE(fecha_dia) < DATE('now');",  
                                    []);
    };

    this.limpiarDiasAnterioresRegistroDiaPersonal = function () {
        return _db.ejecutarSQL("DELETE FROM registro_dia_personal WHERE DATE(fecha_dia) < DATE('now');",  
                                    []);
    };

    this.limpiarDiasAnterioresRegistroLabor = function () {
        return _db.ejecutarSQL("DELETE FROM registro_labor WHERE DATE(fecha_dia) < DATE('now');",  
                                    []);
    };

    this.limpiarDiasAnterioresRegistroLaborPersonal = function () {
        return _db.ejecutarSQL("DELETE FROM registro_labor_personal WHERE DATE(fecha_dia) < DATE('now');",  
                                    []);
    };

    this.resetearBD = function(){
        return _db.dropEstructura();
    };  

    this.removerSincroEntradasPrevias = function(cadena_dni){
        var sql = "DELETE FROM registro_dia_cultivo_lote_personal WHERE DATE(hora_registro) = DATE('now') AND tipo_acceso = 'E' AND pareado = 0 AND dni_personal IN "+cadena_dni+";";
        return _db.ejecutarSQL(sql,[]);
    };

};

