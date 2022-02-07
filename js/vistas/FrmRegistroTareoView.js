var FrmRegistroTareoView = function (servicio_frm, cache, data_usuario, params, servicio_gps) {
    var self, 
        fecha_dia, idturno, idlabor ,idcampo, //params
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
        INTERFACE_ON = 0,
        rs2Array = resultSetToArray,
        formateoFecha = _formateoFecha,
        getHora = _getHora,
        armarHora = _armarHora;

    var MAX_HORAS_DIA = 14;

    this.initialize = function () {
        this.$el = $('<div/>');
        fecha_dia = params.fecha_dia;
        idlabor = params.idlabor;
        idcampo = params.idcampo;
        idturno = params.idturno;
        
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
        self = this;

        checkGPSService();
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

    var UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        };

    this.setEventos = function(){
        this.$el.on("click",".control-item", this.swapTab); 
        this.$el.on("click",".btnasignar", this.asignar); 

        //$filtroBuscar.on("keyup", __keyupinput);
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
        var reqObj = {
            UICabeceraTareo : servicio_frm.obtenerCabeceraTareo(fecha_dia, idlabor, idcampo, idturno)
        };

        $.whenAll( reqObj )
                .done(function(res){
                    console.log(res);
                    var uiCabecera = res.UICabeceraTareo.rows.item(0);
                    
                    idturno = uiCabecera.idturno;

                    self.$el.html(self.template({fecha_registro : formateoFecha(fecha_dia), 
                                                    turno: uiCabecera.turno,
                                                    idturno : idturno,
                                                    labor : uiCabecera.labor, 
                                                    campo : uiCabecera.campo, 
                                                    tipo_tareo:  uiCabecera.tipo_tareo}));

                    var $barSecondaryHeight = parseInt(self.$el.find(".bar-header-secondary").outerHeight()),
                        barMainHeight = 45;
                    $content = self.$el.find(".content");
                    $content.css({"padding-top":$barSecondaryHeight + barMainHeight+"px"})

                    //$filtroBuscar = self.$el.find(".buscar");
                    $lstAsistencia = self.$el.find(".lst-asistencia");
                    $lstAsignaciones = self.$el.find(".lst-asignaciones");
                    if (uiCabecera.tipo_tareo == "JORNAL"){
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
                .fail(UIFail);
    };

    this.listarListas = function(){
        var reqObj = {
            UIListaAsistencias : servicio_frm.listarAsistenciasTareo(fecha_dia, data_usuario.dni),
            UIListaAsignaciones : servicio_frm.listarAsignacionesTareo(fecha_dia, idturno, idlabor, idcampo, data_usuario.dni)
        };

        $.whenAll( reqObj )
                .done(function(res){
                    var listaAsistentes = rs2Array(res.UIListaAsistencias.rows),
                        listaAsignaciones = rs2Array(res.UIListaAsignaciones.rows);

                    _listaAsistentes = listaAsistentes;
                    _listaAsignaciones = listaAsignaciones;

                    listaAsistenciaListView.setAsistentes(_listaAsistentes);
                    listaAsignacionesListView.setAsistentes(_listaAsignaciones);

                })
                .fail(UIFail);
    };

    var buscar = function(cadenaBusqueda){
        if (cadenaBusqueda == ""){
            return _listaAsistentes;
        }

        if (!_listaAsistentes.length){
            return [];
        }

        var nuevoArreglo = [],
            _upperCadenaBusqueda = cadenaBusqueda.toUpperCase();

        for (var i = 0; i < _listaAsistentes.length; i++) {
            var o = _listaAsistentes[i];
            if ( (o.dni.indexOf(_upperCadenaBusqueda) != -1)|| (o.nombres_apellidos.toUpperCase().indexOf(_upperCadenaBusqueda) != -1) ){
                nuevoArreglo.push(o);
            }
        };

        return nuevoArreglo;
    };

    var seleccionar = function(dniSeleccionado){
        if (!_listaAsistentes.length){
            return;
        }

        for (var i = 0; i < _listaAsistentes.length; i++) {
            var o = _listaAsistentes[i];
            if (o.dni == dniSeleccionado){
                _listaAsistentes[i].seleccionado =  (o.seleccionado == '1' ? '0' : '1');
                break;
            }
        };

        //listaAsistenciaListView.setAsistentes(buscar($filtroBuscar.val()));
        listaAsistenciaListView.setAsistentes(buscar(""));
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

        var arregloDniPersonal = [],
            numDiurno, numNocturno,
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

           
        for (var i = _listaAsistentes.length - 1; i >= 0; i--) {
            var o = _listaAsistentes[i];
            if (o.seleccionado == '1'){
                arregloDniPersonal.push(o);
            }
        };

        if (!arregloDniPersonal.length){
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


        var reqObj = {
            UIRegistrarLaborPersonal : servicio_frm.registrarLaborPersonal(fecha_dia, idturno, idlabor, idcampo, arregloDniPersonal, numDiurno, numNocturno, servicio_gps.getLL())
        };

        $.whenAll( reqObj )
                .done(function(res){
                    self.listarListas();

                    self.$el.find(".control-item").eq(1).click();
                })
                .fail(UIFail);
    };

    this.editarNumeroHoras = function($input){
        var numHoras = $input.value,
            numeroDNI = $input.dataset.dni,
            horasNocturno = -1,
            horasDiurno = -1;

        if (idturno != "03"){
            if (numHoras == "" || numHoras <= "0"){
                $input.value = "8";
                numHoras = "8";
            }  
        } else {
            if (numHoras == "" || numHoras < "0"){
                $input.value = "0";
                numHoras = "0";
            }  
        }
       

        switch(idturno){
            case "01":
                horasDiurno = numHoras;
            break;
            case "02":
                horasNocturno = numHoras;
            break;
            case "03":
                if ($input.classList.contains("horas-dos")){
                    horasNocturno = numHoras;
                } else{
                    horasDiurno = numHoras;
                }
            break;
        }


        var reqObj = {
            RQEditarNumeroHoras : servicio_frm.editarNumHorasLaborPersonal(horasDiurno, horasNocturno, idturno, numeroDNI, fecha_dia, idlabor, idcampo)
        };

        $.whenAll(reqObj)
          .done(function(res){
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

        /*
        if (numHoras >= 1 && numHoras <= 8){
            $otro_input.value = maxHoras - numHoras;
        }
        */
    };

    this.eliminarRegistroLaborPersonal = function(numeroDNI, nombres){ 
        var objReg = {
              dni_personal: numeroDNI, 
              fecha_dia : fecha_dia, 
              idlabor : idlabor, 
              idcampo : idcampo
            },reqObj = {
            RQEliminar : servicio_frm.eliminarRegistroLaborPersonal(objReg)
        };

        $.whenAll(reqObj)
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
        this.$el.off("click",".control-item", this.swapTab); 
        this.$el.off("click",".btnasignar", this.asignar); 

        //$filtroBuscar.off("keyup", __keyupinput);
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

        servicio_gps.stop();

        this.$el = null;
    };

    this.initialize();  
}