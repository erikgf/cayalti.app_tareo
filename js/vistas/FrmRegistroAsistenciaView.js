var FrmRegistroAsistenciaView = function ({fecha_dia}) {
    var self, 
        $content,
        $listado,
        $filtro,
        $resultado,
        $btnScan,
        _BLOQUEO_BUSQUEDA = false,
        TIEMPO_BLQOUEO = 1200,
        TOTAL_ASISTENTES_ACTUAL = 0,
        listaAsistenciaListView,
        busquedaResultadoComponente,
        modalMensaje,
        GPSOK = 0;

    var isGPSActivated = VARS.GET_ISGPSACTIVATED() == "true";

    this.initialize = function () {
        this.$el = $('<div/>');        ;
        listaAsistenciaListView = new ListaAsistenciaListView(this);
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
        self = this;

        if (isGPSActivated){
            checkGPSService();    
        }
    };
 
    this.render = function() {
        this.$el.html(this.template({
                    fecha_registro : _formateoFecha(fecha_dia), 
                    imagen_icon: VARS.GET_ICON()
                }));

        $content = this.$el.find(".content");
        $filtro = this.$el.find("input[type=number]");
        $btnScan =  this.$el.find(".btn-scan");  
        $listado = $content.find(".content-listado");
        $resultado =  $content.find(".busqueda-resultado");
     
        /*this.tictac();*/
        this.setEventos();
        this.listarAsistencias();
        return this;
    };

    var __keyupinput = function(e){
            var valor = this.value;
            self.preBusqueda(valor);            
        },
        __keydowninput = function(e){
            var valor = this.value;
            if (valor.length >= 8){
                e.preventDefault();
                return false;
            }
        },
        __click = function(e){
            e.preventDefault();
            self.mostrarLector();
        },
        __clickEliminar = function(e){
            e.preventDefault();
            var dataset = this.dataset;
            confirmar("¿Desea eliminar el registro de "+dataset.nombre+"?", function(){
                self.eliminarRegistroDiaPersonal(dataset.dnipersonal, dataset.numeroacceso, dataset.tiporegistro);
            });
        };


    this.setEventos = function(){
        $filtro.on("keyup", __keyupinput);
        $filtro.on("keydown", __keydowninput);
        $btnScan.on("click", __click);
        $listado.on("click",".btn-eliminar", __clickEliminar);
    };

    var checkGPSService = function(){
        var fnGPSOK = function(posicion){
            if (modalMensaje){
                modalMensaje.esconder();
                modalMensaje.destroy();
                modalMensaje = null;
            }
            
            if (posicion){
                SERVICIO_GPS.restart(posicion.coords.latitude, posicion.coords.longitude);    
                _BLOQUEO_BUSQUEDA = false;
                GPSOK = 1;
                return;
            }

            history.back();
        };

        if (modalMensaje){
            modalMensaje.destroy();
        }

        if (!SERVICIO_GPS.isCached()){
            modalMensaje = new ModalMensajeComponente().initRender({titulo: "GPS", texto_informacion: "Consiguiendo información GPS."});
            modalMensaje.mostrar();
            _BLOQUEO_BUSQUEDA = true;
            geoposicionar(fnGPSOK);
        } else {
            SERVICIO_GPS.restart();
        }       
    };

    this.listarAsistencias = function(){
        /*Función que manda el código de turno y devuele hora E,S y descripcion.*/
        //var self = this; 
        new RegistroDiaPersonal({fecha_dia: fecha_dia, dni_usuario: DATA_NAV.usuario.dni}).getRegistrosPorDia()
            .done(function(resultado){
                TOTAL_ASISTENTES_ACTUAL = parseInt(resultado.length);
                listaAsistenciaListView.setAsistentes(resultado);
                $listado.html(listaAsistenciaListView.$el);    
            })
            .fail(function(error){
                console.error(error);
            });
    };


    this.preBusqueda = function(valor){
        if (valor.length < 8 || valor.length > 8 || _BLOQUEO_BUSQUEDA == true){
            return;
        }

        this.registrarAsistencia(valor);
    }

    this.registrarAsistencia = function(dni_personal){     
        if (fecha_dia == null || fecha_dia == ""){
            alert("No se ha encontrado día de asistencia seleccionado.")
            return;
        }

        let objRegistroDiaPersonal = new RegistroDiaPersonal({fecha_dia: fecha_dia, dni_usuario: DATA_NAV.usuario.dni, dni_personal: dni_personal});

        var reqObj = {
            obtenerUltimoMovimientoAsistencia: objRegistroDiaPersonal.obtenerUltimoMovimientoAsistencia(),
            obtenerRegistroPersonal : new Personal({dni: dni_personal}).obtenerRegistro()
        };    
        _BLOQUEO_BUSQUEDA = true;
        $.whenAll(reqObj)
            .done(function(resultado){
                let ultimoMovimientoAsistencia = resultado.obtenerUltimoMovimientoAsistencia,
                    registroPersonal = resultado.obtenerRegistroPersonal.length > 0 ? resultado.obtenerRegistroPersonal[0] : null;

                let existe_usuario = registroPersonal !== null;
                let objBuscado = {
                    existe_asistencia: ultimoMovimientoAsistencia.length,
                    existe_usuario : existe_usuario,
                    tipo_registro: ultimoMovimientoAsistencia.length ? (ultimoMovimientoAsistencia[0].tipo_registro == "E" ? "S" : "E") : "E",
                    dni_personal: (existe_usuario ? registroPersonal.dni : ''),
                    nombres_apellidos : (existe_usuario ? registroPersonal.nombres_apellidos : '')
                };

                if (objBuscado.existe_asistencia >= 2 && objBuscado.tipo_registro == "S"){
                    $filtro.val("");
                    alert("El personal "+dni_personal+" ya tiene ENTRADA Y SALIDA registrada.")
                    _BLOQUEO_BUSQUEDA = false;
                    return;
                }

                if (objBuscado.existe_usuario > 0){
                    var tmpLL = isGPSActivated ? SERVICIO_GPS.getLL() : {latitud: "-1", longitud: "-1"};
                    var hora_registro = _getHora();
                    var objR = {
                                nombres_apellidos : objBuscado.nombres_apellidos,
                                tipo_registro : objBuscado.tipo_registro,
                                numero_acceso : TOTAL_ASISTENTES_ACTUAL + 1,
                                latitud: tmpLL.latitud,
                                longitud: tmpLL.longitud,
                                hora_registro: hora_registro
                            };

                    objRegistroDiaPersonal.registrarAsistencia(objR)
                        .done( function( resultado ){ 
                            objBuscado.no_encontrado = false;
                            objBuscado.hora_registro = hora_registro;
                            objBuscado.tipo_movimiento = objBuscado.tipo_registro == "E" ? "ENTRADA" : "SALIDA";
                            
                            self.mostrarResultado(objBuscado);

                            if (objBuscado.existe_asistencia >=1 && objBuscado.tipo_registro == "S"){
                                objRegistroDiaPersonal.marcarRegistrosParaEnvio({pareados: "1"});    
                            }
                        })
                        .fail(function(e){
                            _BLOQUEO_BUSQUEDA = false;
                            console.error(e);    
                        })

                } else {
                   self.mostrarResultado({
                        no_encontrado : true,
                        dni : dni_personal
                   });
                }

            })
            .fail(function(error){
                _BLOQUEO_BUSQUEDA = false;
                console.error(error);
            });
        
        reqObj = null;
    };

    this.mostrarResultado = function(objBuscado){
        var objAsistente;
        busquedaResultadoComponente = new BusquedaResultadoComponente(objBuscado);
        $resultado.html(busquedaResultadoComponente.render().$el);

        setTimeout(function(){
                $filtro.val("");
                busquedaResultadoComponente.destroy();
                busquedaResultadoComponente =  null;
                _BLOQUEO_BUSQUEDA = false;
            },TIEMPO_BLQOUEO);


        if (objBuscado.no_encontrado == false){
            objAsistente = {
                numero_acceso : ++TOTAL_ASISTENTES_ACTUAL,
                dni_personal : objBuscado.dni_personal,
                nombres_apellidos : objBuscado.nombres_apellidos,
                hora_registro: objBuscado.hora_registro,
                tipo_registro : objBuscado.tipo_movimiento.charAt(0),
                estado_envio : 0
            };

            listaAsistenciaListView.agregarAsistente(objAsistente);
        }
    };

    this.mostrarLector = function(){
        /*muestra lector*/
        var fnOK = function(result){
            if (result.cancelled == false){
                var textoEncontrado = result.text;
                $filtro.val(textoEncontrado);
                self.preBusqueda(textoEncontrado);
            }
        };
        barcodeScan(fnOK);
    };

    this.eliminarRegistroDiaPersonal = function(dni_personal, numero_acceso, tipo_registro){        
        var objRegistro = {
             numero_acceso : numero_acceso,
             tipo_registro : tipo_registro
         };

         new RegistroDiaPersonal({fecha_dia: fecha_dia, dni_personal: dni_personal}).eliminarRegistro(objRegistro)
            .done(function(resultado){
                self.listarAsistencias();  
            })
            .fail(function(error){
                console.error(error);
            });
    };


    this.destroy = function(){
        $filtro.off("keyup", __keyupinput);
        $filtro.off("keydown", __keydowninput);
        $btnScan.off("click", __click);
        $listado.off("click",".btn-eliminar", __clickEliminar);

        $filtro = null;
        $btnScan = null;
        $content = null;
        $listado =  null;
        $resultado = null;

        fecha_dia = null;

        if(busquedaResultadoComponente){
            busquedaResultadoComponente.destroy();
            busquedaResultadoComponente = null;
        }

        if (listaAsistenciaListView){
            listaAsistenciaListView.destroy();
            listaAsistenciaListView = null;
        }

        if (modalMensaje){
            modalMensaje.destroy();
            modalMensaje = null;
        }

        if (isGPSActivated){
            SERVICIO_GPS.stop();    
        }
        
        this.$el = null;
    };

    this.initialize();  
}