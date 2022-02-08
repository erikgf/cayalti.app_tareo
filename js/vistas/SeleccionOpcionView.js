var SeleccionOpcionView = function (fecha_dia, servicio_frm, servicio_web, cache, usuario) {
	var self = this,
		fechaOK = false,
        $content,
        $fecha,
        //$turno,
        $actualTab, $actualContainer,
        modalMensaje,
        getHoy = _getHoy,
		rs2Array = resultSetToArray;

	this.initialize = function () {
        this.$el = $('<div/>');       
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
    };

    this.setEventos = function(){
     	this.$el.on("click",".btnopcion", this.irOpcion);        
        this.$el.on("click",".enviar-datos", this.procesarEnviarDatos); 
        this.$el.on("click", ".txt-trabajargps", this.toggleGPS);    

     };

    this.render = function() {
    	this.consultarUI();
	    return this;
	};

	var UIDone = function (res) {
            var //uiTurnos = rs2Array(res.UITurnos.rows),
                uiRegistros = res.UIRegistros.rows.item(0),
                uiRegistrosTareo = res.UIRegistrosTareo.rows.item(0),
                fechaRegistroActiva = fecha_dia;   

            if (fechaRegistroActiva != null && fechaRegistroActiva != ""){
            	/*fechaOK*/
            	fechaOK = true;
            	fechaRegistro = formateoFecha(fecha_dia);
            } else {
            	fechaOK = false;
                fechaRegistro = formateoFecha(getHoy());
            }

            var isGPSActivated = VARS.GET_ISGPSACTIVATED();
            if (isGPSActivated === null){
                isGPSActivated = true;
                localStorage.setItem(VARS.NOMBRE_STORAGE+"_GPS", isGPSActivated);
            }

            self.$el.html(self.template({
                imagen_icon: VARS.GET_ICON(),
                is_gps_activated : isGPSActivated,
                nombre_usuario: usuario.nombre_usuario,
            	fecha_registro: fechaRegistro,
                fecha_registro_raw : fecha_dia,
                registros_pendientes_envio: uiRegistros.registros_pendientes_envio,
                registros_totales : uiRegistros.registros_totales,
                registros_pendientes_tareo_envio: uiRegistrosTareo.registros_pendientes_tareo_envio,
                registros_tareo_totales : uiRegistrosTareo.registros_tareo_totales,
                //turnos: uiTurnos
            })); 

            $content = self.$el.find(".content");
            $fecha  = $content.find(".fecha");
            //$turno  = $content.find(".txt-turno");

            //$turno.val(cache.idturno);
            
            self.setEventos();
        },
        UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        },
        eliminarDone = function (res) {
            alert("Día eliminado.");
            history.back();
        };

	this.consultarUI = function(){
		/*consultamos cultivos (de este usuario*/
		var reqObj = {
              // UITurnos : servicio_frm.obtenerTurnos(),
              UIRegistros: servicio_frm.obtenerRegistrosAsistenciaDia(fecha_dia),
              UIRegistrosTareo: servicio_frm.obtenerRegistrosAsignacionesDiaTareo(fecha_dia)
            };

        $.whenAll(reqObj)
          .done(UIDone)
          .fail(UIFail);
	};

	var getHoy = function(){
		var d = new Date(),
			anio = d.getYear()+1900,
			mes = d.getMonth()+1,
			dia = d.getDate();

			mes = (mes >= 10)  ? mes : ('0'+mes);

		return anio+"-"+mes+"-"+dia;
	};

    var formateoFecha = function(fechaFormateoYanqui){
        var arrTemp;

        if (fechaFormateoYanqui == "" || fechaFormateoYanqui == null){
            return "";
        }

        arrTemp = fechaFormateoYanqui.split("-");
        return arrTemp[2]+"-"+arrTemp[1]+"-"+arrTemp[0];
    };

    this.irOpcion = function(e){
        e.preventDefault();
        var urlOpcion = this.dataset.url;
        if (urlOpcion == ""){
            return;
        }

        if (!fechaOK){
            alert("No hay un día de registro habilitado.");
            return;
        }

        router.load(urlOpcion+"/"+fecha_dia);
    };

    this.eliminarDia = function(e){
        e.preventDefault();
            var fnConfirmar = function(){
                var fechaTrabajo = fecha_dia,
                    reqObj = {
                      eliminarDia: servicio_frm.eliminarDia(fechaTrabajo, usuario.usuario)
                    };

                $.whenAll(reqObj)
                  .done(eliminarDone)
                  .fail(UIFail);

                fechaTrabajo = null;
            };
        confirmar("¿Desea eliminar el día de asistencia? Esta acción es irreversible", fnConfirmar);        
    };

    var checkFechaTrabajoVariable = function(){
        if (fechaOK == true){
            $fecha.removeClass("color-rojo");
            $fecha.addClass("color-verde"); 
        }  else{
            $fecha.removeClass("color-verde");
            $fecha.addClass("color-rojo");
        }
    };

    this.procesarEnviarDatos = function(){
        var reqObj = {
              datos_asistencia: servicio_frm.obtenerRegistrosAsistencia(fecha_dia),
             // datos_tareo: servicio_frm.obtenerRegistrosTareo(fecha_dia, $turno.val()),
              datos_tareo: servicio_frm.obtenerRegistrosTareo(fecha_dia),
            };

        $.whenAll(reqObj)
          .done(function (res) {
            var datos_asistencia = rs2Array(res.datos_asistencia.rows),
                datos_tareo = rs2Array(res.datos_tareo.rows),
                JSONAsistencia, JSONTareo;

            if (!datos_asistencia.length && !datos_tareo.length){
               alert("No hay registros para enviar.");
               return;
            }

            try{

                if (datos_asistencia.length > 0){
                    JSONAsistencia = JSON.stringify(procesarDatosAsistencia(datos_asistencia));
                } else {
                    JSONAsistencia = "";
                }

                if (datos_tareo.length > 0){
                    JSONTareo = JSON.stringify(procesarDatosTareo(datos_tareo));
                } else {
                    JSONTareo = "";
                }

            } catch(e){
                console.error("JSON Error", e);
            } 

           enviarDatos(JSONAsistencia, JSONTareo);
          })
          .fail(UIFail);
    };

    var procesarDatosAsistencia = function(datos){
        var usuario_envio = usuario.usuario,
            arrDetalle = [],
            idmovil = getDevice(),
            objEnvioCultivo;

        for (var i = 0; i < datos.length; i++) {
            var o = datos[i];
            arrDetalle.push({
                    dni_asistencia: o.dni_personal,
                    tipo_registro: o.tipo_registro,
                    hora_registro: o.hora_registro,
                    numero_asistencia: o.numero_acceso,
                    dni_usuario : o.usuario_envio,
                    latitud: o.latitud,
                    longitud: o.longitud
                });
        };

        objEnvioCultivo = {
                    detalle : arrDetalle,
                    cabecera : {
                        usuario_envio : usuario_envio,
                        fecha_dia_envio : fecha_dia,
                        idmovil : idmovil
                    }
                };

        return objEnvioCultivo;
    };

    var procesarDatosTareo = function(datos){
        /*procesar 3 detalles*/
        var usuario_envio = usuario.usuario,
            codigo_general_usuario_envio = usuario.dni,
            nombres_apellidos_usuario_envio = usuario.nombre_usuario,
            idresponsable = usuario.idresponsable,
            arrDetalle = [],
            objDetalle = {},
            arrDetalleDetalle = [],
            idmovil = getDevice(),
            objEnvioCultivo;

        var keyUltimo = null, keyTemporal = null;

        for (var i = 0; i < datos.length; i++) {
            var o = datos[i];

            keyTemporal = o.idlabor+o.idcampo;

            if (keyUltimo == null){
                objDetalle = {
                    idlabor : o.idlabor,
                    idcampo : o.idcampo,
                    detalle : [],
                    idturno: o.idturno
                };
            }


            if (keyUltimo != null && keyUltimo != keyTemporal){
                objDetalle.detalle = arrDetalleDetalle;
                arrDetalle.push(objDetalle);
                objDetalle = {
                    idlabor : o.idlabor,
                    idcampo : o.idcampo,
                    detalle : [],
                    idturno: o.idturno
                };

                arrDetalleDetalle = [];
            }    

            arrDetalleDetalle.push({
                dni_personal: o.dni_personal,
                hora_registro: o.hora_registro,
                latitud: o.latitud,
                longitud: o.longitud,
                numero_horas_diurno : o.numero_horas_diurno,
                numero_horas_nocturno : o.numero_horas_nocturno,
                dni_usuario : codigo_general_usuario_envio
            });
            keyUltimo = keyTemporal;
        };  

        objDetalle.detalle = arrDetalleDetalle;
        arrDetalle.push(objDetalle);

        objEnvioCultivo = {
                    detalle : arrDetalle,
                    cabecera : {
                        codigo_general_usuario_envio : codigo_general_usuario_envio,
                        nombres_apellidos_usuario_envio : nombres_apellidos_usuario_envio,
                        usuario_envio : usuario_envio,
                        idresponsable : idresponsable,
                        fecha_dia_envio : fecha_dia,
                        //idturno : $turno.val(),
                        idmovil : idmovil
                    }
                };

        return objEnvioCultivo;
    };

    var enviarDatos = function(JSONDataAsistencia, JSONDataTareo){
        if (modalMensaje){
            modalMensaje.destroy();
        }
        modalMensaje = new ModalMensajeComponente().initRender({titulo: "Enviando datos...", texto_informacion: "Enviando información al servidor. Espere."});
        modalMensaje.mostrar();

        $.when( servicio_web.enviarDatos(JSONDataAsistencia, JSONDataTareo)
                .done( function(r){                 
                    if (r.rpt){ 
                        modalMensaje.esconder();
                        modalMensaje.destroy();
                        modalMensaje = null;        
                        //eliminar todos los registros de este usuario.
                        self.marcarRegistrosEnviados();
                        history.back();
                    } else {
                        try {
                            modalMensaje.mostrarError(r.msj.errorInfo[2]);    
                        } catch(e){
                            modalMensaje.mostrarError("Error");
                        }
                        
                    }
                })
                .fail(function(error){
                    modalMensaje.mostrarError(error.message);
                })
            );
    };

    this.marcarRegistrosEnviados = function(){
        /*eliminar data idcultivo + fecha  ponerles estados de OK*/
        var reqObj = {
              marcar_registros_asistencia: servicio_frm.marcarRegistrosAsistenciaEnviados(fecha_dia),
              //marcar_registros_tareo: servicio_frm.marcarRegistrosTareoEnviados(fecha_dia, $turno.val())
              marcar_registros_tareo: servicio_frm.marcarRegistrosTareoEnviados(fecha_dia)
            };

        $.whenAll(reqObj)
          .done(function (res) {
            var marcarRegistros = parseInt(res.marcar_registros_asistencia.rowsAffected) + parseInt(res.marcar_registros_tareo.rowsAffected);
             alert(marcarRegistros+ " registros enviados.");
          })
          .fail(UIFail);
    };

    this.toggleGPS = function(){
        var isActive = this.classList.contains("active");
        if (isActive){
            this.classList.remove("active");    
        } else {
            this.classList.add("active");
        }

        localStorage.setItem(VARS.NOMBRE_STORAGE+"_GPS", !isActive);
    };

    this.destroy = function(){
        $fecha = null;
        $content = null;

        $actualContainer = null;
        $actualTab = null;

        this.$el.off("click",".btnopcion", this.irOpcion);     
        this.$el.off("click",".enviar-datos", this.procesarEnviarDatos);     

        this.$el = null;
    };


    this.initialize();  
}
