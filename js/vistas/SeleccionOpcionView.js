var SeleccionOpcionView = function ({ fecha_dia }) {
	var self = this,
		fechaOK = false,
        $content,
        $fecha,
        $actualTab, $actualContainer,
        modalMensaje;

    var objCacheComponente = new CacheComponente(VARS.CACHE.GPS);
    var usuario_enviando = DATA_NAV.usuario;

	this.initialize = function () {
        this.$el = $('<div/>');       
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy === "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
    };

    this.setEventos = function(){
     	this.$el.on("click",".btnopcion", this.irOpcion);        
        this.$el.on("click",".enviar-datos", this.procesarEnviarDatos); 
        this.$el.on("click", ".txt-trabajargps", this.toggleGPS);   
        this.$el.on("click", ".btn-eliminardia", this.eliminarDia); 
    };

    this.render = function() {
    	this.consultarUI();
	    return this;
	};

	this.consultarUI = function(){
        var self = this; 
        var reqObj = {
                getRegistroDiasPersonal: new RegistroDiaPersonal({fecha_dia: fecha_dia}).getRegistrosDia(),
                getRegistroLaborPersonal : new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_usuario: DATA_NAV.usuario.dni}).getRegistrosDia(),
            };

        $.whenAll(reqObj)
          .done(function(resultado){
                var registrosDiasPersonal = resultado.getRegistroDiasPersonal;
                var registrosLaboresPersonal = resultado.getRegistroLaborPersonal;
                var fechaRegistroActiva = fecha_dia;

                if (fechaRegistroActiva != null && fechaRegistroActiva != ""){
                    fechaOK = true;
                    fechaRegistro = _formateoFecha(fecha_dia);
                } else {
                    fechaOK = false;
                    fechaRegistro = _formateoFecha(_getHoy());
                }

                var isGPSActivated = VARS.GET_ISGPSACTIVATED();
                if (isGPSActivated === null){
                    isGPSActivated = true;
                    objCacheComponente.set(isGPSActivated);
                }

                const filter = function(item){
                   return item.estado_envio == "1"
                };

                //aqui falta calcular los que tengan estado_envio == 0 para que se dibujen como PENDIENTES de envio.
                self.$el.html(self.template({
                    imagen_icon: VARS.GET_ICON(),
                    is_gps_activated : isGPSActivated,
                    nombre_usuario: DATA_NAV.usuario.nombres_apellidos,
                    fecha_registro: fechaRegistro,
                    fecha_registro_raw : fecha_dia,
                    registros_pendientes_envio: registrosDiasPersonal.filter(filter).length,
                    registros_totales : registrosDiasPersonal.length,
                    registros_pendientes_tareo_envio: registrosLaboresPersonal.filter(filter).length,
                    registros_tareo_totales : registrosLaboresPersonal.length,
                })); 

                $content = self.$el.find(".content");
                $fecha  = $content.find(".fecha");

                self.setEventos();

            })
            .fail(_UIFail);

        reqObj = null;
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

            var reqObj = {
                 eliminarRegistroDia: new RegistroDia({fecha_dia: fecha_dia}).eliminarRegistroDia(),
                 eliminarRegistroDiaPersonal : new RegistroDiaPersonal({fecha_dia: fecha_dia}).eliminarRegistroDiaPersonal(),
                 eliminarRegistroLabor : new RegistroLabor({fecha_dia: fecha_dia}).eliminarRegistroLabor(),
                 eliminarRegistroLaborPersonalFecha : new RegistroLaborPersonal({fecha_dia: fecha_dia}).eliminarRegistroLaborPersonalFecha()
            };

            $.whenAll(reqObj)
              .done(function(resultado){
                    var resEliminarRegistroDia = resultado.eliminarRegistroDia;
                    if (resEliminarRegistroDia > 0){
                        alert("Día eliminado.");
                        history.back();
                        return;
                    }
                })
                .fail(_UIFail);

            reqObj = null;
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
              datos_asistencia: new RegistroDiaPersonal({fecha_dia: fecha_dia}).obtenerRegistrosAsistencia(),
              datos_tareo: new RegistroLaborPersonal({fecha_dia: fecha_dia}).obtenerRegistrosTareo()
            };

        $.whenAll(reqObj)
          .done(function (resultado) {
            var JSONAsistencia, JSONTareo;
            var datos_asistencia = resultado.datos_asistencia.map(function(item){
                    return {
                            dni_personal: item.dni_personal,
                            hora_registro: item.hora_registro,
                            tipo_registro: item.tipo_registro,
                            numero_acceso: item.numero_acceso,
                            dni_usuario: item.dni_usuario,
                            latitud: item.latitud,
                            longitud: item.longitud
                        };
                }),
                datos_tareo = resultado.datos_tareo.map(function(item){
                    return {
                            idlabor: item.idlabor,
                            idcampo: item.idcampo,
                            dni_personal: item.dni_personal,
                            idturno: item.idturno,
                            hora_registro: item.hora_registro,
                            latitud: item.latitud,
                            longitud: item.longitud,
                            numero_horas_diurno: item.numero_horas_diurno,
                            numero_horas_nocturno: item.numero_horas_nocturno
                        };
                });

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
          .fail(_UIFail);
    };

    var procesarDatosAsistencia = function(datos){
        var arrDetalle = [],
            idmovil = getDevice(),
            objEnvioCultivo;

        for (var i = 0; i < datos.length; i++) {
            var o = datos[i];
            arrDetalle.push({
                    dni_asistencia: o.dni_personal,
                    tipo_registro: o.tipo_registro,
                    hora_registro: o.hora_registro,
                    numero_asistencia: o.numero_acceso,
                    dni_usuario : o.dni_usuario,
                    latitud: o.latitud,
                    longitud: o.longitud
                });
        };

        objEnvioCultivo = {
                    detalle : arrDetalle,
                    cabecera : {
                        usuario_envio : usuario_enviando.usuario,
                        fecha_dia_envio : fecha_dia,
                        idmovil : idmovil
                    }
                };

        return objEnvioCultivo;
    };

    var procesarDatosTareo = function(datos){
        /*procesar 3 detalles*/
        var usuario_envio = usuario_enviando.usuario,
            codigo_general_usuario_envio = usuario_enviando.dni,
            nombres_apellidos_usuario_envio = usuario_enviando.nombres_apellidos,
            idresponsable = usuario_enviando.idresponsable,
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

        new ServicioWeb().enviarDatos(JSONDataAsistencia, JSONDataTareo)
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
                });
    };

    this.marcarRegistrosEnviados = function(){
        var reqObj = {
              marcar_registros_asistencia: new RegistroDiaPersonal({fecha_dia: fecha_dia}).marcarRegistrosAsistenciaEnviados({estado_envio: '1'}),
              marcar_registros_tareo: new RegistroLaborPersonal({fecha_dia: fecha_dia}).marcarRegistrosTareoEnviados({estado_envio: '1'})
            };

        $.whenAll(reqObj)
          .done(function (resultado) {
                var marcarRegistros = parseInt(resultado.marcar_registros_asistencia) + parseInt(resultado.marcar_registros_tareo);
                alert(marcarRegistros+ " registros enviados.");
          })
          .fail(_UIFail);
    };

    this.toggleGPS = function(){
        var isActive = this.classList.contains("active");
        if (isActive){
            this.classList.remove("active");    
        } else {
            this.classList.add("active");
        }

        objCacheComponente.set(!isActive);
    };

    this.destroy = function(){
        $fecha = null;
        $content = null;

        $actualContainer = null;
        $actualTab = null;

        this.$el.off("click",".btnopcion", this.irOpcion);     
        this.$el.off("click",".enviar-datos", this.procesarEnviarDatos);   
        this.$el.off("click", ".txt-trabajargps", this.toggleGPS);  
        this.$el.off("click", ".btn-eliminardia", this.eliminarDia);  

        this.$el = null;
    };


    this.initialize();  
}
