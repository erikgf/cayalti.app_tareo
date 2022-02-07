var AgriServicioFrm = function() {
    var _db;

    this.initialize = function(db) {
        var deferred = $.Deferred();        
        _db = db;
        deferred.resolve();
        return deferred.promise();
    };

    this.obtenerTurnos = function(){
        var sql = "SELECT "+
                    " idturno, "+
                    " descripcion "+
                    " FROM turno ORDER BY idturno";

        return _db.selectData(sql,
                    []);
    };

    this.obtenerRegistrosAsistenciaDia = function(fechaDia){
        var sql = "SELECT "+
                    " COALESCE(SUM((CASE estado_envio WHEN '1' THEN 1 ELSE 0 END)),0) as registros_pendientes_envio, "+
                    " COUNT(id) as registros_totales "+
                    " FROM registro_dia_personal "+
                    " WHERE fecha_dia = ? AND tipo_registro = 'E'";

        return _db.selectData(sql,
                    [fechaDia]);
    };

    this.obtenerRegistrosAsignacionesDiaTareo = function(fechaDia){
        var sql = "SELECT "+
                    " COALESCE(SUM((CASE estado_envio WHEN '1' THEN 1 ELSE 0 END)),0) as registros_pendientes_tareo_envio, "+
                    " COUNT(id) as registros_tareo_totales "+
                    " FROM registro_labor_personal "+
                    " WHERE fecha_dia = ?";

        return _db.selectData( sql,
                    [fechaDia]);
    };

    this.listarAsistencias = function(fecha, dni_usuario) {
        return _db.selectData("SELECT p.nombres_apellidos, rd.dni_personal as dni,  "+
                                "   strftime('%H:%M:%S',hora_registro) as hora, tipo_registro as tipo_registro_raw, "+
                                "   (CASE tipo_registro WHEN 'E' THEN 'ENTRADA' ELSE 'SALIDA' END) as tipo_registro,"+
                                "   estado_envio, numero_acceso "+
                                "   FROM registro_dia_personal rd "+
                                "   INNER JOIN personal p ON p.dni = rd.dni_personal "+
                                "   WHERE rd.fecha_dia = date(?) AND rd.dni_usuario = ?"+
                                "   ORDER BY hora_registro DESC",
                    [fecha, dni_usuario]);
    };
    
    this.obtenerUltimoMovimientoAsistencia = function(objAsistencia) {
        var sql = "SELECT COUNT(rd.id) as existe_asistencia, COUNT(p.id) as existe_usuario, "+
                  " (CASE rd.tipo_registro WHEN 'E' THEN 'S' ELSE 'E' END) as tipo_registro, "+
                  " p.dni, p.nombres_apellidos "+
                  " FROM personal p"+
                  " LEFT JOIN registro_dia_personal rd ON p.dni = rd.dni_personal AND rd.fecha_dia = date(?) "+
                  " WHERE p.dni = ? ORDER BY rd.id LIMIT 1";

        return _db.selectData(sql,
                        [objAsistencia.fechaDia, objAsistencia.numeroDNI ]);
    };


    this.registrarAsistencia  = function(objRegistro){
        return _db.insertarDatos("registro_dia_personal",  
                                    ["dni_personal","tipo_registro", "fecha_dia", "numero_acceso","dni_usuario","latitud","longitud"],
                                    [objRegistro]);
    };

    this.marcarRegistroParaEnvio  = function(objRegistro){
        return _db.ejecutarSQL("UPDATE registro_dia_personal SET estado_envio = 1 WHERE dni_personal = ? AND  fecha_dia = ?",
                                [objRegistro.dni_asistencia, objRegistro.fecha_dia]);
    };

    this.marcarRegistroParaEnvioTareo  = function(objRegistro){
        return _db.ejecutarSQL("UPDATE registro_dia_personal SET estado_envio = 1 WHERE dni_personal = ? AND  fecha_dia = ?",
                                [objRegistro.dni_personal, objRegistro.fecha_dia]);
    };


    this.eliminarRegistroDiaPersonal  = function(objRegistro){
        var arregloColumnas = ["dni_personal", "fecha_dia"],
            arregloWhere = [objRegistro.dni_personal, objRegistro.fecha_dia];
        if (objRegistro.tipo_registro == "S"){
            /*eliminar solo tipo_registro salida*/
            arregloColumnas.push( "numero_acceso", "tipo_registro");
            arregloWhere.push(objRegistro.numero_acceso, "S");
        }

        return _db.eliminarDatos("registro_dia_personal",  
                                    arregloColumnas,
                                    arregloWhere);
    };

    this.editarNumHorasLaborPersonal  = function(numeroHorasDiurno, numeroHorasNocturno, idturno, numeroDNI, fecha_dia, idlabor, idcampo){
        var numeroHoraBase, strNumeroHoras = "";
        if (numeroHorasDiurno == -1){
            numeroHoraBase = numeroHorasNocturno;
            strNumeroHoras = "numero_horas_nocturno";
        } else {
            numeroHoraBase = numeroHorasDiurno;
            strNumeroHoras = "numero_horas_diurno";
        }


        return _db.ejecutarSQL("UPDATE registro_labor_personal SET "+strNumeroHoras+" = ? WHERE dni_personal = ? AND fecha_dia = ? AND idlabor = ? AND idcampo = ? AND idturno = ?",
                                [numeroHoraBase, numeroDNI, fecha_dia, idlabor, idcampo, idturno]);
    };

    this.eliminarRegistroLaborPersonal  = function(objRegistro){
        return _db.eliminarDatos("registro_labor_personal",  
                                    ["dni_personal", "fecha_dia", "idlabor","idcampo"],
                                    [objRegistro.dni_personal, objRegistro.fecha_dia, objRegistro.idlabor, objRegistro.idcampo]);
    };

    this.consultarCampos = function(){
        var sql = "SELECT idcampo as codigo, descripcion "+
                  " FROM campo"+
                  " ORDER BY descripcion";

        return _db.selectData(sql, []);
    };

    this.consultarActividades = function(){
        var sql = "SELECT idactividad as codigo, descripcion "+
                  " FROM actividad"+
                  " ORDER BY descripcion";

        return _db.selectData(sql, []);
    };

    this.consultarLabores = function(idactividad){
        var sql = "SELECT idlabor as codigo, descripcion "+
                  " FROM labor "+
                  " WHERE idactividad = ? "+
                  " ORDER BY descripcion";

        return _db.selectData(sql, [idactividad]);
    };

     this.consultarTurnos = function(){
        var sql = "SELECT idturno as codigo, descripcion "+
                  " FROM turno"+
                  " ORDER BY idturno";

        return _db.selectData(sql, []);
    };

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

    this.obtenerRegistroLaborXId = function(fecha_dia, dni_usuario, id_registro_labor) {
        var sql = "SELECT rl.id, rl.idlabor, rl.idcampo, rl.idturno, idtipotareo, la.idactividad "+
                    " FROM registro_labor rl "+
                    " INNER JOIN labor la ON rl.idlabor = la.idlabor "+
                    " WHERE rl.fecha_dia = ? AND dni_usuario = ? AND rl.id = ?";

        return _db.selectData(sql,
                    [fecha_dia, dni_usuario, id_registro_labor]);
    };
    

     this.obtenerTurnoDescripcion = function(idturno) {
        var sql = "SELECT descripcion "+
                    " FROM turno t"+
                    " WHERE t.idturno = ?";

        return _db.selectData(sql,
                    [idturno]);
    };


    this.verificarLaborExiste = function(objConsulta) {

        var sqlLaborExiste = objConsulta.id == "" ? "" : " AND id <> "+objConsulta.id;
        return _db.selectData("SELECT count(id) as cantidad FROM registro_labor WHERE fecha_dia = ? AND idlabor = ? AND idcampo = ? AND idturno = ?"+sqlLaborExiste,
                    [objConsulta.fecha_dia, objConsulta.idlabor, objConsulta.idcampo, objConsulta.idturno]);
    };

    this.registrarLabor = function(objRegistro){
        if (objRegistro.id == ""){
            return _db.insertarDatos("registro_labor",  
                                    ["fecha_dia","idlabor","idcampo","idtipotareo","dni_usuario","idturno"],
                                        [objRegistro]);
        } else {
            return _db.actualizarDatos("registro_labor",  
                                    ["fecha_dia","idlabor","idcampo","idtipotareo","dni_usuario","idturno"],
                                    [objRegistro.fecha_dia, objRegistro.idlabor, objRegistro.idcampo, objRegistro.idtipotareo, objRegistro.dni_usuario, objRegistro.idturno],
                                    ["id"],
                                    [objRegistro.id]);
        }
        
    };

    this.obtenerCabeceraTareo = function(fecha_dia, idlabor, idcampo, idturno){
        console.log(fecha_dia, idlabor, idcampo, idturno);
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
    };

    this.listarAsistenciasTareo = function(fecha_dia, dni_usuario) {
        /*hace cruce con tabla asignados*/
        return _db.selectData("SELECT p.nombres_apellidos, rd.dni_personal as dni, '0' as seleccionado "+
                                "   FROM registro_dia_personal rd "+
                                "   LEFT JOIN registro_labor_personal rlp ON rlp.dni_personal = rd.dni_personal AND rd.fecha_dia = rlp.fecha_dia "+
                                "   INNER JOIN personal p ON p.dni = rd.dni_personal "+
                                "   WHERE rd.fecha_dia = date(?) AND tipo_registro = 'E' AND rlp.dni_personal IS NULL AND rd.dni_usuario = ? "+
                                "   ORDER BY p.nombres_apellidos",
                    [fecha_dia, dni_usuario]);
    };

    this.listarAsignacionesTareo = function(fecha_dia, idturno, idlabor, idcampo, dni_usuario) {
        /*hace cruce con tabla asignados*/
        return _db.selectData("SELECT p.nombres_apellidos, rlp.dni_personal as dni, numero_horas_diurno, numero_horas_nocturno "+
                                "   FROM registro_labor_personal rlp "+
                                "   INNER JOIN personal p ON p.dni = rlp.dni_personal "+
                                "   WHERE rlp.idlabor = ? AND rlp.idcampo = ? AND rlp.fecha_dia = date(?) AND idturno = ?" +
                                "   ORDER BY p.nombres_apellidos",
                    [idlabor, idcampo, fecha_dia, idturno]);
    };
    
    this.registrarLaborPersonal = function(fecha_dia, idturno, idlabor, idcampo, arregloDniPersonal,numero_horas_diurno, numero_horas_nocturno, objLL){
        var registros = [];

        for (var i = arregloDniPersonal.length - 1; i >= 0; i--) {
            var o =arregloDniPersonal[i];
            registros.push({
                fecha_dia : fecha_dia,
                idlabor: idlabor,
                idturno: idturno,
                idcampo : idcampo,
                dni_personal : o.dni,
                numero_horas_diurno : numero_horas_diurno,
                numero_horas_nocturno : numero_horas_nocturno,
                latitud: objLL.latitud,
                longitud: objLL.longitud
            });
        };

        return _db.insertarDatos("registro_labor_personal",  
                                    ["fecha_dia","idlabor","idturno","idcampo","dni_personal","numero_horas_diurno","numero_horas_nocturno","latitud","longitud"],
                                        registros);
    };

 
    this.obtenerRegistrosAsistencia = function(fechaDia){
        return _db.selectData("SELECT dni_personal, hora_registro, tipo_registro, numero_acceso, dni_usuario,latitud, longitud "+
                            " FROM registro_dia_personal  "+
                            " WHERE fecha_dia = ? AND estado_envio = 0 "+
                            " ORDER BY hora_registro",
                    [fechaDia]);
    };

    this.obtenerRegistrosTareo = function(fechaDia){
        return _db.selectData("SELECT idlabor, idcampo, dni_personal, idturno, hora_registro, latitud, longitud, numero_horas_diurno, numero_horas_nocturno "+
                            " FROM registro_labor_personal  "+
                            " WHERE fecha_dia = ? AND estado_envio = 0"+
                            " ORDER BY idturno, idcampo, idlabor, hora_registro",
                    [fechaDia]);
    };

    this.marcarRegistrosAsistenciaEnviados = function (fechaDia) {
        var estadoEnviado = "1", estadoPorEnviar = "0";
        return _db.actualizarDatos("registro_dia_personal",  
                                    ["estado_envio"],
                                    [estadoEnviado],
                                    ["fecha_dia","estado_envio"],
                                    [fechaDia, estadoPorEnviar]);
    };

    this.marcarRegistrosTareoEnviados = function (fechaDia) {
        var estadoEnviado = "1", estadoPorEnviar = "0";
        return _db.actualizarDatos("registro_labor_personal",  
                                    ["estado_envio"],
                                    [estadoEnviado],
                                    ["fecha_dia","estado_envio"],
                                    [fechaDia, estadoPorEnviar]);
    };
    

};