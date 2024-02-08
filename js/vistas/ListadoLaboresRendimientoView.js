var ListadoLaboresRendimientoView = function ({fecha_dia}) {
	var self = this;
	let fechaOK = false,
        $content,
        $fecha;

	this.initialize = function () {
        this.$el = $('<div/>');       
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
    };

    this.setEventos = function(){
        $content.on("click", ".table-view .table-view-cell", function(e){
            router.load("registro-rendimiento-tareo/"+this.dataset.cadenaid);
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

                let listado_labores = resultado.obtenerRegistrosDiaLabor
                    .filter(item=>{
                        return item.con_rendimiento == 1
                    })
                    .map(function(item){
                    const objProcesarArreglo = _fnSepararArregloSegunCriterio(registrosDiaLaborPersonal, 
                                                    function(o){
                                                        return o.idregistrolabor == item.id && o.con_rendimiento == '1';
                                                });
                    const registros_pendientes_rendimiento = objProcesarArreglo.cumplen.filter(item=>{
                        return item.valor_rendimiento === "";
                    }).length;
                    const registros_totales = objProcesarArreglo.cumplen.length;
                    
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
                        unidad_medida: item.unidad_medida,
                        caporal: Boolean(item.idcaporal) ? item.caporal : null,
                        idcaporal: item.idcaporal,
                        registros_totales,
                        registros_pendientes_rendimiento : registros_totales - registros_pendientes_rendimiento,
                        badge_negative_class: registros_pendientes_rendimiento > 0 ? 'badge-negative' : 'badge-positive'
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

        if ($content){
            $content.off("mouseup mouseleave touchend");
            $content.off("mousedown touchstart");
            $content.off("click");
    
            $content = null;
        }
        $actualContainer = null;
        $actualTab = null;

        this.$el = null;
    };


    this.initialize();  
}
