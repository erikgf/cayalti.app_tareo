var InicioView = function () {
	var self = this,
		$lista_dias,
		objSincronizador,
		IS_MENU  = false,
		TOTAL_REGISTOS_ENVIO = 0,
		TOTAL_REGISTROS_PENDIENTES = 0,
		TOTAL_REGISTROS_PENDIENTES_PROPIOS = 0,
		rs2Array = resultSetToArray;

	var objCacheRegistroDia = new CacheComponente("_fecha");

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

    	this.$el.on("click",".btn-limpiardias", this.eliminarDiasAnteriores);  
     };

    this.render = function() {	    
	    var objRender = DATA_NAV.usuario;
	    objRender.nombre_app = VARS.NOMBRE_APP;
	    objRender.imagen_icon = VARS.GET_ICON();

	    
	    this.$el.html(self.template(objRender));
		$lista_dias = self.$el.find(".lista-dias");
	  	this.consultarDiasRegistro();
	    return this;
	};

	this.actualizarDatos = function(){
		objSincronizador = new Sincronizador(["Usuario", "Actividad", "Campo","Labor", "Personal","Turno"]);
        objSincronizador.sincronizarDatos();
	};

	var UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        },
        limpiarDiasDone = function () {
            alert("Días anteriores limpiados.");
        };


    this.consultarDiasRegistro = function(){
        var self = this; 
        new RegistroDia().getRegistroDias()
            .done(function(resultado){
                var fechaTrabajoCache = objCacheRegistroDia.get();
            	var fnPreprocesar = function(){
            		var nuevoResultado = [];
                    for (var i = resultado.length - 1; i >= 0; i--){
            			var o = resultado[i];
            			nuevoResultado.push({
            				fecha_dia_raw: o.fecha_dia,
                            opcion_seleccionada: o.fecha_dia === fechaTrabajoCache,
            				fecha_dia : _formateoFecha(o.fecha_dia)
            			});
            		};
            		return nuevoResultado;
            	};

            	var listaDias = fnPreprocesar();
            	if (!listaDias.length){
            		//No hay registros de días. Hora de crear uno.
                    self.verificarExisteFecha();
                    return;
            	}

     			$lista_dias.html(TEMPLATES.ListaDiasTrabajoListView(listaDias));
            })
            .fail(function(error){
                console.error(error);
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

	this.irSeleccionarCultivo = function(){
		if (DATA_NAV.usuario == "admin"){
			alert("Debe acceder con un USUARIO válido.");
			return;
		}

		router.load("seleccion-opcion/"+this.dataset.id);
	};

	this.eliminarDiasAnteriores = function(e){
        e.preventDefault();
        var hoy = new Date(),
            hastaDiasAnteriores = new Date(hoy);
        
        hastaDiasAnteriores.setDate(hastaDiasAnteriores.getDate() - 2);
        hastaDiasAnteriores = _getHoy(hastaDiasAnteriores);

        var fnConfirmar = function(){
            var reqObj = {
                  eliminarRegistroDiaHasta: new RegistroDia({fecha_dia: hastaDiasAnteriores}).eliminarRegistroDiaHasta(),
                 // eliminarRegistroDiaPersonalHasta : new RegistroDiaPersonal({fecha_dia: hastaDiasAnteriores}).eliminarRegistroDiaPersonalHasta(),
                 // eliminarRegistroLaborHasta : new RegistroLabor({fecha_dia: hastaDiasAnteriores}).eliminarRegistroLaborHasta(),
                 // eliminarRegistroLaborPersonalHasta : new RegistroLaborPersonal({fecha_dia: hastaDiasAnteriores}).eliminarRegistroLaborPersonalHasta()
            };

            $.whenAll(reqObj)
              .done(function(resultado){
                    var resEliminarFechaDiaHasta = resultado.eliminarRegistroDiaHasta;
                    if (resEliminarFechaDiaHasta > 0){
                        self.consultarDiasRegistro();
                        return;
                    }
                    alert("No hay registros que eliminar.");
                })
                .fail(function(error){
                    console.error(error);
                });

            reqObj = null;
        };
        confirmar("¿Desea limpiar días anteriores? Se obviarán los dos últimos días calendario. Esta acción es irreversible.", fnConfirmar);        
    };

    this.verificarExisteFecha = function(){
        var hoy = _getHoy();
        var objRegistroDia = new RegistroDia({fecha_dia: hoy});

        objRegistroDia.verificarExisteFecha()
            .done(function(resultado){
                var existe = resultado.length > 0;
                if (!existe){
                    self.agregarNuevoDia(hoy);
                    return;
                }
            })
            .fail(function(error){
                console.error(error);
            });
    };

    this.agregarNuevoDia = function(fecha_dia){
        var objRegistroDia = new RegistroDia({fecha_dia: fecha_dia});
        objRegistroDia.addNuevaFechaDia()
            .done(function(resultado){
                objCacheRegistroDia.set(fecha_dia);
                $lista_dias.prepend(TEMPLATES.ListaDiasTrabajoListView([{
                    fecha_dia_raw : fecha_dia,
                    opcion_seleccionada : true,
                    fecha_dia : _formateoFecha(fecha_dia)
                }]));
            })
            .fail(function(error){
                console.error(error);
            });
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
        this.$el.off("click",".btn-limpiardias", this.eliminarDiasAnteriores);  

		this.$el = null;
	};

    this.initialize();  
}
