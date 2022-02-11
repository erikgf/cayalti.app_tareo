var FrmRegistroTareoView = function ({fecha_dia, idlabor, idcampo, idturno}) {
    var self, 
        $content,
        $listado,
        $filtroBuscar,
        $txtHoras,
        $txtHorasDiurno,
        $txtHorasNocturno,
        listaAsistenciaListView,
        listaAsignacionesListView,
        _listaAsistentes = [],
        _listaAsignaciones = [],
        $actualTab, $actualContainer,
        modalMensaje,
        GPSOK = 0,
        INTERFACE_ON;

    var MAX_HORAS_DIA = 14;
    var isGPSActivated = VARS.GET_ISGPSACTIVATED() == "true";
    var dni_usuario_ingresando = DATA_NAV.usuario.dni;
    var idregistrolabor = null;

    this.initialize = function () {
        this.$el = $('<div/>');
        
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
        self = this;    


        if (isGPSActivated){
            INTERFACE_ON = 0;
            checkGPSService();    
        } else {
            INTERFACE_ON = 1;
        }
    };

    this.getInterfaceOn = function(){
        return INTERFACE_ON;
    };

    this.getIdTurno = function(){
        return idturno;
    };

    this.render = function() {
        this.consultarCabecera();
        return this;
    };

    var __keyupinput = function(e){
            if (INTERFACE_ON == 0) return;
            var valor = this.value;
            listaAsistenciaListView.setAsistentes(buscar(valor));
        },
        __changeNumHorasDiurnoNocturnoCabecera = function(e){
            e.preventDefault();
            self.editarNumeroHorasDiurnoNocturnoCabecera(this);
        },
        __clickSeleccionar = function(e){
            if (INTERFACE_ON == 0) return;
            e.preventDefault();
            var dataset = this.dataset;
            seleccionar(dataset.dni);
        },
        __changeNumHoras = function(e){
            e.preventDefault();
            if (INTERFACE_ON == 0) return;
            self.editarNumeroHoras(this);
        },
        __clickEliminar = function(e){
            e.preventDefault();
            if (INTERFACE_ON == 0) return;
            var dataset = this.dataset;
            confirmar("¿Desea eliminar el registro de "+dataset.nombres+"?", function(){
                self.eliminarRegistroLaborPersonal(dataset.dni, dataset.nombres);
            });
        };


    this.setEventos = function(){
        this.$el.on("click",".control-item", this.swapTab); 
        this.$el.on("click",".btnasignar", this.asignar); 

        this.$el.on("keyup", ".txt-buscar-filtrar", __keyupinput);
        $lstAsistencia.on("click","li.table-view-cell", __clickSeleccionar);
        $lstAsignaciones.on("click","li.table-view-cell div.table-view-row-absolute button", __clickEliminar);
        $lstAsignaciones.on("change","li.table-view-cell div.table-view-row-absolute input.horas-uno", __changeNumHoras);
        $lstAsignaciones.on("change","li.table-view-cell div.table-view-row-absolute input.horas-dos", __changeNumHoras);
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
                INTERFACE_ON = 1;
                GPSOK = 1;
            } else {
                history.back();
            }
        };

        if (modalMensaje){
            modalMensaje.destroy();
        }

        if (!servicio_gps.isCached()){
            modalMensaje = new ModalMensajeComponente().initRender({titulo: "GPS", texto_informacion: "Consiguiendo información GPS."});
            modalMensaje.mostrar();
            geoposicionar(fnGPSOK);
        } else {
            INTERFACE_ON = 1;
            servicio_gps.restart();
        }       
    };

    this.consultarCabecera = function(){
        new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: dni_usuario_ingresando})
                .getRegistro({idlabor: idlabor, idcampo: idcampo, idturno: idturno})
                    .done(function(resultado){
                        let uiCabecera = resultado.length ? resultado[0] : null;

                        if (!uiCabecera){
                            alert("Registro no encontrado.");
                            history.back();
                            return;
                        }


                        idregistrolabor = uiCabecera.id;

                        self.$el.html(self.template({fecha_registro : _formateoFecha(fecha_dia), 
                                                        imagen_icon: VARS.GET_ICON(),
                                                        turno: uiCabecera.turno,
                                                        idturno : uiCabecera.idturno,
                                                        labor : uiCabecera.labor, 
                                                        campo : uiCabecera.campo, 
                                                        idtipotareo:  uiCabecera.idtipotareo}));

                        var $barSecondaryHeight = parseInt(self.$el.find(".bar-header-secondary").outerHeight()),
                            barMainHeight = 45;
                        $content = self.$el.find(".content");
                        $content.css({"padding-top":$barSecondaryHeight + barMainHeight+"px"})
                        $filtroBuscar = self.$el.find(".txt-buscar-filtrar");

                        $lstAsistencia = self.$el.find(".lst-asistencia");
                        $lstAsignaciones = self.$el.find(".lst-asignaciones");
                        if (uiCabecera.idtipotareo == "J"){
                            if (idturno == "03"){
                                $txtHorasNocturno = self.$el.find(".txt-horas-nocturno");
                                $txtHorasDiurno = self.$el.find(".txt-horas-diurno");
                                $txtHoras = null;
                            } else {
                                $txtHoras = self.$el.find(".txt-horas");
                                $txtHorasNocturno = null;
                                $txtHorasDiurno = null;
                            }
                        }

                        $actualTab = $content.find(".control-item.active")[0];
                        $actualContainer = $content.find(".blk.blkactive")[0];

                        listaAsistenciaListView = new ListaAsistenciaTareoListView($lstAsistencia.eq(0),idturno);
                        listaAsignacionesListView = new ListaAsignacionesTareoListView($lstAsignaciones.eq(0),idturno);
                        
                        self.setEventos();
                        self.listarListas();

                    })
                    .fail(_UIFail);
    };

    this.listarListas = function(){
        var reqObj = {
            UIListaAsistenciasGeneral : new RegistroDiaPersonal({fecha_dia: fecha_dia, dni_usuario: dni_usuario_ingresando})
                            .getRegistrosDia(),
            UIListaAsignacionesGeneral : new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_usuario: dni_usuario_ingresando})
                            .getRegistrosDia(),
            UIListaAsignaciones : new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_usuario: dni_usuario_ingresando})
                            .getRegistrosPorRegistroLabor({idturno, idlabor, idcampo})
        };

        $.whenAll( reqObj )
                .done(function(resultado){
                    var listaAsistentesGeneral = resultado.UIListaAsistenciasGeneral.map(function(item){ return {...item, seleccionado: '0'}}),
                        listaAsignacionesGeneral =  resultado.UIListaAsignacionesGeneral,
                        listaAsignaciones = resultado.UIListaAsignaciones;

                    listaAsistentesGeneral = listaAsistentesGeneral.filter( function( itemAsistente ) {
                      return !listaAsignacionesGeneral.find( function(itemAsignacion){
                        return itemAsignacion.dni_personal == itemAsistente.dni_personal;
                      });
                    } );

                    _listaAsistentes = listaAsistentesGeneral;
                    _listaAsignaciones = listaAsignaciones;

                    listaAsistenciaListView.setAsistentes(_listaAsistentes);
                    listaAsignacionesListView.setAsistentes(_listaAsignaciones);

                })
                .fail(_UIFail);
    };

    var buscar = function(cadenaBusqueda){
        if (cadenaBusqueda == ""){
            return _listaAsistentes;
        }

        if (!_listaAsistentes.length){
            return [];
        }

        var _upperCadenaBusqueda = cadenaBusqueda.toUpperCase();


        return _listaAsistentes.filter(function(o){
            return (o.dni_personal.indexOf(_upperCadenaBusqueda) != -1) || (o.nombres_apellidos.toUpperCase().indexOf(_upperCadenaBusqueda) != -1)
        });
    };

    var seleccionar = function(dniSeleccionado){
        if (!_listaAsistentes.length){
            return;
        }

        for (var i = 0; i < _listaAsistentes.length; i++) {
            var o = _listaAsistentes[i];
            if (o.dni_personal == dniSeleccionado){
                _listaAsistentes[i].seleccionado = (o.seleccionado == '1' ? '0' : '1');
                break;
            }
        };

        listaAsistenciaListView.setAsistentes(buscar($filtroBuscar.val()));
    };
/*
    ELEGIR TABLA BDPRUEBAS2020
    TODO ABRIL SE HA CAMBIADO A PENDIETNE
    EN LA TABLA DE
    EDICION
    SOLO MANEJAR HORAS DIURNAS Y HORAS NOCTURAS
*/

    this.asignar = function(e){
        e.preventDefault();
        if (INTERFACE_ON == 0) return;

        var numDiurno, numNocturno,
            numHoras = "";

        if ($txtHoras != null){
            numHoras = $txtHoras.val();
            
            if (numHoras == "" || numHoras == "0"){
                $txtHoras.val("8");
                numHoras = "8";
            }

            if (numHoras > MAX_HORAS_DIA){
                $txtHoras.val(MAX_HORAS_DIA);
                numHoras = MAX_HORAS_DIA;   
            }
        }

        let hora_registro = _getHora();
        let arreglo_personal = _listaAsistentes
            .filter(function(item){
                return item.seleccionado == '1';
            })
            .map(function(item){
                return {
                    dni_personal: item.dni_personal,
                    nombres_apellidos: item.nombres_apellidos,
                    hora_registro: hora_registro
                };
        });

        if (!arreglo_personal.length){
            alert("No hay personal seleccionado.");
            return;
        }

        switch(idturno){
            case "01":
            numDiurno = numHoras;
            numNocturno = "0";
            break;
            case "02":
            numDiurno = "0";
            numNocturno = numHoras;
            break;
            case "03":
            numDiurno = $txtHorasDiurno.val();
            numNocturno = $txtHorasNocturno.val();
            break;
        }


        var objLatitudLongitud = isGPSActivated ? servicio_gps.getLL() : {latitud: "-1", longitud: "-1"};
        new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_usuario: dni_usuario_ingresando}).registrarMultiple({
                    arreglo_personal: arreglo_personal,
                    idturno: idturno,
                    idlabor: idlabor,
                    idcampo: idcampo,
                    numero_horas_diurno : numDiurno,
                    numero_horas_nocturno: numNocturno,
                    objLatitudLongitud : objLatitudLongitud,
                    idregistrolabor: idregistrolabor
                })
                .done(function(resultado){
                    self.listarListas();
                    self.$el.find(".control-item").eq(1).click();
                })
                .fail(_UIFail);
    };

    this.editarNumeroHoras = function($input){
        var numero_horas = $input.value,
            dni_personal = $input.dataset.dni,
            numero_horas_nocturno = -1,
            numero_horas_diurno = -1;

            
        if (idturno != "03"){
            if (numero_horas == "" || numero_horas <= "0"){
                $input.value = "8";
                numero_horas = "8";
            }  
        } else {
            if (numero_horas == "" || numero_horas < "0"){
                $input.value = "0";
                numero_horas = "0";
            }  
        }
       

        switch(idturno){
            case "01":
                numero_horas_diurno = numero_horas;
            break;
            case "02":
                numero_horas_nocturno = numero_horas;
            break;
            case "03":
                if ($input.classList.contains("horas-dos")){
                    numero_horas_nocturno = numero_horas;
                } else{
                    numero_horas_diurno = numero_horas;
                }
            break;
        }

        new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_personal: dni_personal}).editarNumHorasLaborPersonal({
                                                                    numero_horas_diurno: numero_horas_diurno,  
                                                                    numero_horas_nocturno: numero_horas_nocturno,
                                                                    idturno: idturno,
                                                                    idlabor: idlabor,
                                                                    idcampo: idcampo})
                .done(function(resultado){
                        $span = $input.nextElementSibling;
                        $span.classList.remove("escondido");
                        setTimeout(function(){
                            $span.classList.add("escondido");
                            $span = null;
                        },800);

                        $input = null;
                    })
                .fail(function(e){
                    console.error(e);    
                });
    };

    this.editarNumeroHorasDiurnoNocturnoCabecera = function($input){
        var $otro_input,
            numHoras = $input.value,
            maxHoras =  MAX_HORAS_DIA;

        if (!$input){
            return;
        }

        if (numHoras == ""){
            $input.value = "8";
            $otro_input = "0";
            return;
        }

        if ($input.classList.contains("txt-horas-diurno")){
            $otro_input = this.$el.find(".txt-horas-nocturno");
        } else {
            $otro_input = this.$el.find(".txt-horas-diurno");
        }

        if (numHoras > maxHoras){
            $input.value = "0";
            $otro_input = "0";
        }

        if (numHoras <= 0){
            $input_value = "0";
            $otro_input = "0";
        }
    };

    this.eliminarRegistroLaborPersonal = function(dni_personal, nombres){ 
        new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_personal: dni_personal})
                    .eliminarRegistroLaborPersonal({ idlabor: idlabor, idcampo: idcampo, idturno: idturno})
                    .done(function(res){
                            self.listarListas();
                        })
                    .fail(function(e){
                            console.error(e);    
                        });
    };

    this.swapTab = function(e){
        var blk_nombre = this.dataset.blk,
            esActivo = false,
            $tab = this,
            $container = self.$el.find("#blk"+blk_nombre)[0];
        e.preventDefault();

        var esActivo = $tab.classList.contains("active");
        if (esActivo){ return; }

        $actualContainer.classList.remove("blkactive");
        $actualTab.classList.remove("active");

        $tab.classList.add("active");
        $container.classList.add("blkactive");

        $actualContainer = $container;
        $actualTab = $tab;

        $container = null;
        $tab = null;
    };


    this.destroy = function(){
        $filtroBuscar= null;
        this.$el.off("click",".control-item", this.swapTab); 
        this.$el.off("click",".btnasignar", this.asignar); 

        this.$el.off("keyup", ".txt-buscar-filtrar", __keyupinput);
        $lstAsistencia.off("click","li.table-view-cell", __clickSeleccionar);
        $lstAsignaciones.off("click","li.table-view-cell div.table-view-row-absolute button", __clickEliminar);
        $lstAsignaciones.off("change","li.table-view-cell div.table-view-row-absolute input.horas-uno", __changeNumHoras);
        $lstAsignaciones.off("change","li.table-view-cell div.table-view-row-absolute input.horas-dos", __changeNumHoras);

        _listaAsistentes = null;

        if (listaAsistenciaListView){
            listaAsistenciaListView.destroy();
            listaAsistenciaListView = null;
        }

        if (modalMensaje){
            modalMensaje.destroy();
            modalMensaje = null;
        }

        if (isGPSActivated){
            servicio_gps.stop();    
        }
        

        this.$el = null;
    };

    this.initialize();  
}