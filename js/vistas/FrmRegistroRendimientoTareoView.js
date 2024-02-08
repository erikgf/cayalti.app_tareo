var FrmRegistroRendimientoTareoView = function ({fecha_dia, idlabor, idcampo, idturno, idcaporal}) {
    var self, 
        $content,
        $filtroBuscar,
        $lstRendimientos,
        listaRendimientosListView,
        _listaRendimientos = [],
        INTERFACE_ON = 1;

    var MAX_HORAS_DIA = 12;
    var dni_usuario_ingresando = DATA_NAV.usuario.dni;
    //var idregistrolabor = null;

    this.initialize = function () {
        this.$el = $('<div/>');
        
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
        self = this;    

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
            var valor = this.value;
            listaRendimientosListView.setRegistros(buscar(valor));
        },
        __changeValorRendimientos = function(e){
            e.preventDefault();
            //self.editarValorRendimiento(this);
        },
        __clickGuardarValor = function(e){
            e.preventDefault();
            self.editarValorRendimiento(this);
        };


    this.setEventos = function(){
        this.$el.on("keyup", ".txt-buscar-filtrar", __keyupinput);
        //$lstRendimientos.on("change",".valor-rendimiento", __changeValorRendimientos);
        $lstRendimientos.on("click",".btn-guardar-valor", __clickGuardarValor);
    };
    
    this.consultarCabecera = function(){
        new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: dni_usuario_ingresando})
                .getRegistro({idlabor: idlabor, idcampo: idcampo, idturno: idturno})
                    .done(function(resultado){
                        const uiCabecera = resultado.find(r=>r.idcaporal == idcaporal && r.con_rendimiento == 1);

                        if (!uiCabecera){
                            alert("Registro no encontrado.");
                            history.back();
                            return;
                        }
                        
                        self.$el.html(self.template({fecha_registro : _formateoFecha(fecha_dia), 
                                                        imagen_icon: VARS.GET_ICON(),
                                                        turno: uiCabecera.turno,
                                                        idturno : uiCabecera.idturno,
                                                        labor : uiCabecera.labor, 
                                                        campo : uiCabecera.campo, 
                                                        unidad_medida: uiCabecera.unidad_medida,
                                                        idcaporal: uiCabecera.idcaporal, caporal: Boolean(uiCabecera.idcaporal) ? uiCabecera.caporal : null,
                                                        idtipotareo:  uiCabecera.idtipotareo}));

                        var $barSecondaryHeight = parseInt(self.$el.find(".bar-header-secondary").outerHeight()),
                            barMainHeight = 45;
                        $content = self.$el.find(".content");
                        $content.css({"padding-top":$barSecondaryHeight + barMainHeight+"px"})
                        $filtroBuscar = self.$el.find(".txt-buscar-filtrar");

                        $lstRendimientos = self.$el.find(".lst-rendimientos");
                        listaRendimientosListView = new ListaRendimientosTareoListView($lstRendimientos);
                        
                        self.setEventos();
                        self.listarRendimientos();

                    })
                    .fail(_UIFail);
    };

    this.listarRendimientos = function(){
        var reqObj = {
            UIListaRendimientos : new RegistroLaborRendimientoPersonal({fecha_dia: fecha_dia, dni_usuario: dni_usuario_ingresando})
                                        .getRegistrosPorRegistroLabor({idturno, idlabor, idcampo})
        };

        $.whenAll( reqObj )
                .done(function(resultado){
                    var listaRendimientos = resultado.UIListaRendimientos.filter(item=>item.con_rendimiento == '1' && item.idcaporal == idcaporal);
                    _listaRendimientos = listaRendimientos;
                    listaRendimientosListView.setRegistros(_listaRendimientos);

                })
                .fail(_UIFail);
    };

    var buscar = function(cadenaBusqueda){
        if (cadenaBusqueda == ""){
            return _listaRendimientos;
        }

        if (!_listaRendimientos.length){
            return [];
        }

        var _upperCadenaBusqueda = cadenaBusqueda.toUpperCase();
        return _listaRendimientos.filter(function(o){
            return (o.dni_personal.indexOf(_upperCadenaBusqueda) != -1) || (o.nombres_apellidos.toUpperCase().indexOf(_upperCadenaBusqueda) != -1)
        });
    };
/*
    ELEGIR TABLA BDPRUEBAS2020
    TODO ABRIL SE HA CAMBIADO A PENDIETNE
    EN LA TABLA DE
    EDICION
    SOLO MANEJAR HORAS DIURNAS Y HORAS NOCTURAS
*/
    this.editarValorRendimiento = function($btn){
        const   $parent = $btn.parentElement,
                $inputMod = $parent.children[2],
                $inputValorRendimiento = $parent.children[1],
                dniPersonal = $inputMod.dataset.dni;
        let     valorModificado = $inputMod.value;

        if (valorModificado == ""){
            valorModificado = 0;
        }

        $inputValorRendimiento.value = parseInt($inputValorRendimiento.value == "" ? 0 : $inputValorRendimiento.value) +  parseInt(valorModificado);
        $inputMod.value = "";

        const valorRendimiento = $inputValorRendimiento.value;

        new RegistroLaborRendimientoPersonal({fecha_dia: fecha_dia, dni_personal: dniPersonal})
                                                .editarValorLaborRendimientoPersonal({
                                                    valor_rendimiento: valorRendimiento,  
                                                    idturno: idturno,
                                                    idlabor: idlabor,
                                                    idcampo: idcampo,
                                                    idcaporal : idcaporal
                                                })
                .done(function(){
                        let $span = $btn.nextElementSibling;
                        $span.classList.remove("escondido");
                        $btn.classList.add("escondido");
                        setTimeout(function(){
                            if ($span){
                                $span.classList.add("escondido");
                                $btn.classList.remove("escondido");
                                $span = null;
                            }
                        },2100);
                    })
                .fail(function(e){
                    console.error(e);    
                });

    };

    this.destroy = function(){
        $filtroBuscar= null;

        this.$el.off("keyup", ".txt-buscar-filtrar", __keyupinput);
       // $lstRendimientos.off("change",".valor-rendimiento", __changeValorRendimientos);
        $lstRendimientos.off("click",".btn-guardar-valor", __clickGuardarValor);
        _listaRendimientos = null;

        if (listaRendimientosListView){
            listaRendimientosListView.destroy();
            listaRendimientosListView = null;
        }

        this.$el = null;
    };

    this.initialize();  
}