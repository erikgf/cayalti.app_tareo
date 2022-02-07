var FrmRegistroAsistenciaView = function (servicio_frm, cache, data_usuario, fecha_dia, servicio_gps) {
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
        GPSOK = 0,
        rs2Array = resultSetToArray,
        formateoFecha = _formateoFecha,
        getHora = _getHora,
        armarHora = _armarHora;

    this.initialize = function () {
        this.$el = $('<div/>');        ;
        listaAsistenciaListView = new ListaAsistenciaListView(this);
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
        self = this;

        checkGPSService();
    };
 
    this.render = function() {
        this.$el.html(this.template({
                    fecha_registro : formateoFecha(fecha_dia), 
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
                self.eliminarRegistroDiaPersonal(dataset.dnipersonal, dataset.numeroacceso, dataset.tipo_registro);
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
                servicio_gps.restart(posicion.coords.latitude, posicion.coords.longitude);    
                _BLOQUEO_BUSQUEDA = false;
                GPSOK = 1;
                return;
            }

            history.back();
        };

        if (modalMensaje){
            modalMensaje.destroy();
        }

        if (!servicio_gps.isCached()){
            modalMensaje = new ModalMensajeComponente().initRender({titulo: "GPS", texto_informacion: "Consiguiendo información GPS."});
            modalMensaje.mostrar();
            _BLOQUEO_BUSQUEDA = true;
            geoposicionar(fnGPSOK);
        } else {
            servicio_gps.restart();
        }       
    };

    this.listarAsistencias = function(){
        /*Función que manda el código de turno y devuele hora E,S y descripcion.*/
        $.when( servicio_frm.listarAsistencias(fecha_dia, data_usuario.dni)
                .done(function(resultado){
                    var arrAsistentes = rs2Array(resultado.rows);

                    TOTAL_ASISTENTES_ACTUAL = parseInt(arrAsistentes.length);

                    listaAsistenciaListView.setAsistentes(arrAsistentes);
                    $listado.html(listaAsistenciaListView.$el);                        
                })
                .fail(function(e){console.error(e);})
        );
    };


    this.preBusqueda = function(valor){
        if (valor.length < 8 || valor.length > 8 || _BLOQUEO_BUSQUEDA == true){
            return;
        }

        this.registrarAsistencia(valor);
    }

    this.registrarAsistencia = function(numeroDNI){     
        if (fecha_dia == null || fecha_dia == ""){
            alert("No se ha encontrado día de asistencia seleccionado.")
            return;
        }

        _BLOQUEO_BUSQUEDA = true;

        $.when( servicio_frm.obtenerUltimoMovimientoAsistencia({
                    numeroDNI : numeroDNI,
                    fechaDia : fecha_dia
                })
            .done( function( resultado ){ 
                var rows = resultado.rows,
                    objBuscado = rows.item(0);

                if (objBuscado.existe_asistencia >= 2 && objBuscado.tipo_registro == "S"){
                    $filtro.val("");
                    alert("El personal "+numeroDNI+" ya tiene ENTRADA Y SALIDA registrada.")
                    _BLOQUEO_BUSQUEDA = false;
                    return;
                }

                if (objBuscado.existe_usuario > 0){
                    var tmpLL = servicio_gps.getLL();
                    var objR = {
                                dni_personal : numeroDNI,
                                fecha_dia : fecha_dia,
                                tipo_registro : objBuscado.tipo_registro,
                                numero_acceso : TOTAL_ASISTENTES_ACTUAL + 1,
                                dni_usuario : data_usuario.dni,
                                latitud: tmpLL.latitud,
                                longitud: tmpLL.longitud
                            };

                    $.when( servicio_frm.registrarAsistencia(objR)
                        .done( function( _resultado ){ 
                            objBuscado.no_encontrado = false;
                            objBuscado.hora = getHora();
                            objBuscado.tipo_movimiento = objBuscado.tipo_registro == "E" ? "ENTRADA" : "SALIDA";
                            
                            self.mostrarResultado(objBuscado);

                            /*si ya está completo el par, que los marque a ambos como esatado_envio = 1*/
                            if (objBuscado.existe_asistencia >=1 && objBuscado.tipo_registro == "S"){
                                servicio_frm.marcarRegistroParaEnvio(objR);    
                            }
                        })
                        .fail(function(e){
                            _BLOQUEO_BUSQUEDA = false;
                            console.error(e);    
                        })
                    ); 

                } else {
                   self.mostrarResultado({
                        no_encontrado : true,
                        dni : numeroDNI
                   });
                }
            })
            .fail(function(e){
                _BLOQUEO_BUSQUEDA = false;
                console.error(e);    
            })
        ); 
        //EndWhen
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
                dni : objBuscado.dni,
                nombres_apellidos : objBuscado.nombres_apellidos,
                hora: objBuscado.hora,
                tipo_registro : objBuscado.tipo_movimiento,
                tipo_registro_raw : objBuscado.tipo_movimiento.charAt(0),
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

    this.eliminarRegistroDiaPersonal = function(numeroDNI, numero_acceso, tipo_registro){        
        var objRegistro = {
             dni_personal : numeroDNI,
             fecha_dia : fecha_dia,
             numero_acceso : numero_acceso,
             tipo_registro : tipo_registro
         };

        var reqObj = {
            RQEliminar : servicio_frm.eliminarRegistroDiaPersonal(objRegistro)
        };

        $.whenAll(reqObj)
          .done(function(res){
                    self.listarAsistencias();
                })
          .fail(function(e){
                console.error(e);    
            });
    };


    this.destroy = function(){
        $filtro.off("keyup", __keyupinput);
        $filtro.off("keydown", __keydowninput);
        $filtro = null;

        $btnScan.off("click", __click);
        $btnScan = null;

        $listado.off("click",".btn-eliminar", __clickEliminar);

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

        servicio_gps.stop();
        this.$el = null;
    };

    this.initialize();  
}