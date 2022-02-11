var ListadoLaboresView = function ({fecha_dia}) {
	var self = this,
		fechaOK = false,
        $content,
        $fecha,
        $actualTab, $actualContainer,
        modalMensaje;

	this.initialize = function () {
        this.$el = $('<div/>');       
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
    };

    this.setEventos = function(){
        var indexHoldTap = 0,
            timeoutHoldTap;
        $content.on('mousedown touchstart', ".table-view .table-view-cell", function(e) {
            var $this = this;
            timeoutHoldTap = setInterval(function(){
              indexHoldTap++;
              if (indexHoldTap >= 10){
                router.load("registro-labor/"+$this.dataset.idedicion);
                clearInterval(timeoutHoldTap);
                indexHoldTap = 0;
              }
            }, 100);
          }).bind('mouseup mouseleave touchend', ".table-view .table-view-cell", function(){
            clearInterval(timeoutHoldTap);
          });


        $content.on("click", ".table-view .table-view-cell", function(e){
            router.load("registro-tareo/"+this.dataset.cadenaid);
        });
    };

    this.render = function() {
    	this.consultarUI();
	    return this;
	};

	this.consultarUI = function(){
		/*consultamos cultivos (de este usuario*/
		var reqObj = {
              obtenerRegistrosDiaLabor : new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: DATA_NAV.usuario.dni}).getRegistrosDia(),
              obtenerRegistrosDiaLaborPersonal : new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_usuario: DATA_NAV.usuario.dni}).getRegistrosDia()
            };

        $.whenAll(reqObj)
              .done(function(resultado){
                var registrosDiaLaborPersonal = resultado.obtenerRegistrosDiaLaborPersonal;

                let objProcesarArreglo;
                let listado_labores = resultado.obtenerRegistrosDiaLabor.map(function(item){
                    
                    objProcesarArreglo = _fnSepararArregloSegunCriterio(registrosDiaLaborPersonal, 
                                                                            function(o){
                                                                                return o.idregistrolabor === item.id;
                                                                            });
                    registrosDiaLaborPersonal = objProcesarArreglo.nocumplen;

                    return {
                        id: item.id,
                        campo: item.campo,
                        actividad: item.actividad,
                        idactividad: item.idactividad,
                        idcampo: item.idcampo,
                        idempresa: item.idempresa,
                        idlabor: item.idlabor,
                        idtipotareo: item.idtipotareo,
                        idturno: item.idturno,
                        labor: item.labor,
                        turno: item.turno,
                        registros_totales: objProcesarArreglo.cumplen.length
                    }
                });

                self.$el.html(self.template({
                    nombre_usuario: DATA_NAV.usuario.nombres_apellidos,
                    imagen_icon: VARS.GET_ICON(),
                    fecha_registro: _formateoFecha(fecha_dia),
                    fecha_registro_raw : fecha_dia,
                    listado_labores : listado_labores
                })); 

                $content = self.$el.find(".content");
                self.setEventos();
              })    
              .fail(_UIFail);

        reqObj = null;
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

    this.destroy = function(){
        $fecha = null;

        $content.off("mouseup mouseleave touchend");
        $content.off("mousedown touchstart");
        $content.off("click");

        $content = null;
        $actualContainer = null;
        $actualTab = null;

        this.$el = null;
    };


    this.initialize();  
}
