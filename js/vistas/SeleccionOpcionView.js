var SeleccionOpcionView = function ({ fecha_dia }) {
	var self = this,
		fechaOK = false,
        $content,
        $fecha,
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
                getRegistroLaborRendimientoPersonal : new RegistroLaborRendimientoPersonal({fecha_dia: fecha_dia, dni_usuario: DATA_NAV.usuario.dni}).getRegistrosDia(),
            };

        $.whenAll(reqObj)
          .done(function(resultado){
                const filterRendimiento = function(item){
                    return item.con_rendimiento === '1';
                };

                const registrosDiasPersonal = resultado.getRegistroDiasPersonal;
                const registrosLaboresPersonal = resultado.getRegistroLaborPersonal;
                const registrosLaboresRendimientoPersonal = resultado.getRegistroLaborRendimientoPersonal.filter(filterRendimiento);
                const fechaRegistroActiva = fecha_dia;

                if (fechaRegistroActiva != null && fechaRegistroActiva != ""){
                    fechaOK = true;
                    fechaRegistro = _formateoFecha(fecha_dia);
                } else {
                    fechaOK = false;
                    fechaRegistro = _formateoFecha(_getHoy());
                }

                let isGPSActivated = VARS.GET_ISGPSACTIVATED();
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
                    registros_pendientes_rendimiento_envio: registrosLaboresRendimientoPersonal.filter(filter).length,
                    registros_rendimiento_totales : registrosLaboresRendimientoPersonal.length,
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

    this.procesarEnviarDatos = function(){
        var reqObj = {
              datos_asistencia: new RegistroDiaPersonal({fecha_dia: fecha_dia}).obtenerRegistrosAsistencia(),
              datos_tareo: new RegistroLaborPersonal({fecha_dia: fecha_dia}).obtenerRegistrosTareo()
            };

        $.whenAll(reqObj)
          .done(function (resultado) {
            let JSONAsistencia, JSONTareo;
            const datos_asistencia = resultado.datos_asistencia,
                datos_tareo = resultado.datos_tareo.map(item => {
                    if (item.idcaporal == ""){
                        return {
                            ...item,
                            idcaporal : usuario_enviando.dni
                        }
                    }
                    return item;
                });


            console.log({
                datos_asistencia, datos_tareo
            })

            if (!datos_asistencia.length && !datos_tareo.length){
                alert("No hay registros para enviar.");
                return;
             }

            if (resultado.datos_asistencia.length != resultado.datos_tareo.length){
                alert("Aún tengo registros de asistencia que no han sido tareados.");
                return;
            }
            
            const datos_tareo_ordenado = datos_tareo.sort(_fieldSorter(['idcampo', 'idlabor','con_rendimiento','idcaporal']));

            const tareosRedimientoSinRendimiento = datos_tareo_ordenado.filter(registro=>{
                if (registro.con_rendimiento == 1){
                    if (registro.valor_rendimiento === ""){
                        return true;
                    }
                }
                return false;
            });

            if (tareosRedimientoSinRendimiento.length > 0){
                alert(`Hay ${tareosRedimientoSinRendimiento.length} tareos SIN RENDIMIENTOS registrados.`);
                return;
            }

            try{
                if (datos_asistencia.length > 0){
                    JSONAsistencia = JSON.stringify(procesarDatosAsistencia(datos_asistencia));
                } else {
                    JSONAsistencia = "";
                }

                if (datos_tareo_ordenado.length > 0){
                    JSONTareo = JSON.stringify(procesarDatosTareo(datos_tareo_ordenado));
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

    const procesarDatosTareo = function(datos){
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

        let objUltimo = null;

        for (var i = 0; i < datos.length; i++) {
            const o = datos[i];
            const keyTemporal = o.idlabor+o.idcampo+"_"+o.idcaporal;

            if (objUltimo == null){
                objDetalle = {
                    idlabor : o.idlabor,
                    idcampo : o.idcampo,
                    detalle : [],
                    idturno: o.idturno,
                    con_rendimiento: o.con_rendimiento == "1",
                    id_unidad_medida: o.id_unidad_medida,
                    valor_tareo: o.valor_tareo,
                    idcaporal: o.idcaporal
                };
            } else {
                const keyUltimo = objUltimo.idlabor+objUltimo.idcampo+"_"+objUltimo.idcaporal;
                if (keyUltimo != keyTemporal){
                    objDetalle.detalle = arrDetalleDetalle;
                    arrDetalle.push(objDetalle);
                    objDetalle = {
                        idlabor : o.idlabor,
                        idcampo : o.idcampo,
                        detalle : [],
                        idturno: o.idturno,
                        con_rendimiento: (o.con_rendimiento | keyUltimo.con_rendimiento) == "1",
                        id_unidad_medida: o.id_unidad_medida,
                        valor_tareo: o.valor_tareo,
                        idcaporal: o.idcaporal
                    };
    
                    arrDetalleDetalle = [];
                }   
            }

            arrDetalleDetalle.push({
                dni_personal: o.dni_personal,
                hora_registro: o.hora_registro,
                latitud: o.latitud,
                longitud: o.longitud,
                numero_horas_diurno : o.numero_horas_diurno,
                numero_horas_nocturno : o.numero_horas_nocturno,
                dni_usuario : codigo_general_usuario_envio,
                rendimiento: o.valor_rendimiento
            });
            objUltimo = o;
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
                        version: VERSION_GLOBAL,
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
                    if (error?.message){
                        modalMensaje.mostrarError(error.message);
                        return;
                    }

                    modalMensaje.mostrarError(`Ha ocurrido un error: ${error.responseText}`);
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

        this.$el.off("click",".btnopcion", this.irOpcion);     
        this.$el.off("click",".enviar-datos", this.procesarEnviarDatos);   
        this.$el.off("click", ".txt-trabajargps", this.toggleGPS);  
        this.$el.off("click", ".btn-eliminardia", this.eliminarDia);  

        this.$el = null;
    };


    this.initialize();  
}
