var ListadoLaboresView = function (fecha_dia,  servicio_frm, cache, usuario) {
	var self = this,
		fechaOK = false,
        $content,
        $fecha,
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

	var UIDone = function (res) {
            var uiRegistroLabores = rs2Array(res.UIRegistroLabores.rows);
            self.$el.html(self.template({
                nombre_usuario: usuario.nombre_usuario,
                imagen_icon: VARS.GET_ICON(),
                //turno: res.UITurnoDescripcion.rows.item(0).descripcion,
            	fecha_registro: fechaRegistro,
                fecha_registro_raw : fecha_dia,
                listado_labores : uiRegistroLabores
            })); 

            $content = self.$el.find(".content");
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
              //UITurnoDescripcion: servicio_frm.obtenerTurnoDescripcion(idturno),
              UIRegistroLabores: servicio_frm.obtenerRegistrosLabores(fecha_dia, usuario.dni)
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
/*
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
    */

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

    this.destroy = function(){
        $fecha = null;
        $content = null;

        $actualContainer = null;
        $actualTab = null;

        this.$el = null;
    };


    this.initialize();  
}
