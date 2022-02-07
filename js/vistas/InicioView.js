var InicioView = function (data_usuario, servicio_web, servicio) {

	var self = this,
		$lista_dias,
		objSincronizador,
		IS_MENU  = false,
		TOTAL_REGISTOS_ENVIO = 0,
		TOTAL_REGISTROS_PENDIENTES = 0,
		TOTAL_REGISTROS_PENDIENTES_PROPIOS = 0,
		getHoy = _getHoy,
		rs2Array = resultSetToArray;

	this.initialize = function () {
        this.$el = $('<div/>');       
        this.setEventos(); 
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
    };

    this.setEventos = function(){

    	this.$el.on("click","#btn-actualizar", this.actualizarDatos);
    	this.$el.on("click",".lista-dias li", this.irSeleccionarCultivo);
    	this.$el.on("click","#btn-menu", this.mostrarMenu);
    	this.$el.on("click",this.cancelarMenu);

    	this.$el.on("click",".btn-limpiardias", this.limpiarDiasAnteriores);  
     };

    this.render = function() {	    
	    var objRender = data_usuario;
	    objRender.nombre_app = VARS.NOMBRE_APP;
	    this.$el.html(self.template(objRender));
		$lista_dias = self.$el.find(".lista-dias");
	    this.consultarDiasRegistro();
	    return this;
	};

	this.actualizarDatos = function(){
		objSincronizador = new SincronizadorClase(servicio, servicio_web, 
                    ["Usuarios", "Actividades", "Campos","Labores", "Personal","Turnos"]);
        objSincronizador.actualizarDatos();
	};

	var UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        },
        limpiarDiasDone = function () {
            alert("Días anteriores limpiados.");
        };

	this.consultarDiasRegistro = function(){		
		var self = this,
			diaHoy = getHoy();

		var reqObj = {
			  consultar_dias_registro: servicio.consultarDiasRegistro()
           	},
            self = this;

        $.whenAll(reqObj)
          .done(function (res) {
          	var dias = rs2Array(res.consultar_dias_registro.rows)
     			//,rowConsultarExistencia = res.consultar_existencia_dia.rows.item(0);
     		/*
     		if (rowConsultarExistencia.existencia == 0){
     			self.existenTurnosValidos(dias, diaHoy);
     			return;
            }*/

     		$lista_dias.html(self.templateDias(dias));
          })
          .fail(function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
          });
	};

	this.mostrarMenu = function(e){
		e.preventDefault();
		e.stopPropagation();
		if (IS_MENU == false){
			self.$el.find(".dropdown-content").css({"display":"block"});
			IS_MENU = true;
		} else {
			self.$el.find(".dropdown-content").css({"display":"none"});
			IS_MENU = false;
		}
	};

	this.cancelarMenu = function(e){
		e.preventDefault();
		if (IS_MENU == true){
			self.$el.find(".dropdown-content").css({"display":"none"});
			IS_MENU = false;
		}
	};

	this.templateDias = function(dataDias){
		var html = '',
			len = dataDias.length;
		/*
		if (len <= 0){
			return '<li class="table-view-cell"><a> Sin días registrados</a></li>';
		}
		*/
		for (var i = len - 1; i >= 0; i--) {
			var obj = dataDias[i];
			html += '<li data-id="'+obj.fecha_dia_raw+'" class="table-view-cell '+(obj.hoy == 1 ? 'btn-appbase' : 'btn-gray')+'"><a> DÍA: '+obj.fecha_dia+'</a> </li>';
		};

		return html;
	};

	var formateoFecha = function(fechaFormateoYanqui){
        var arrTemp;

        if (fechaFormateoYanqui == "" || fechaFormateoYanqui == null){
            return "";
        }

        arrTemp = fechaFormateoYanqui.split("-");
        return arrTemp[2]+"-"+arrTemp[1]+"-"+arrTemp[0];
    };

	this.irSeleccionarCultivo = function(){

		if (data_usuario.usuario == "admin"){
			alert("Debe acceder con un USUARIO válido.");
			return;
		}

		router.load("seleccion-opcion/"+this.dataset.id);
	};

	this.limpiarDiasAnteriores = function(e){
        e.preventDefault();
            var fnConfirmar = function(){
                var reqObj = {
                      limpiarDiasAnterioresRegistroDia: servicio.limpiarDiasAnterioresRegistroDia(),
                      limpiarDiasAnterioresRegistroDiaPersonal : servicio.limpiarDiasAnterioresRegistroDiaPersonal(),
                      limpiarDiasAnterioresRegistroLabor : servicio.limpiarDiasAnterioresRegistroLabor(),
                      limpiarDiasAnterioresRegistroLaborPersonal : servicio.limpiarDiasAnterioresRegistroLaborPersonal()
                    };

                $.whenAll(reqObj)
                  .done(limpiarDiasDone)
                  .fail(UIFail);

                reqObj = null;
            };
        confirmar("¿Desea limpias días anteriores? Esta acción es irreversible", fnConfirmar);        
    };

	this.destroy = function(){
		$label_enviar = null;
		if(objSincronizador){
			objSincronizador.destroy();
			objSincronizador = null;
		}
		TOTAL_REGISTOS_ENVIO = 0;

		this.$el.off("click","#btn-actualizar", this.actualizarDatos);
    	this.$el.off("click",".lista-dias li", this.irSeleccionarCultivo);
    	this.$el.off("click","#btn-menu", this.mostrarMenu);
    	this.$el.off("click", this.cancelarMenu);

		this.$el = null;
	};

    this.initialize();  
}
