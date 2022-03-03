var FrmRegistroLaborView = function ({fecha_dia, id_registro_labor_edicion}) {
	var self, 
        $turno,
        $actividades,
        $labores,
        $campos,
        $tipotareo,
        $bloqueMensaje, 
        estaGuardar = false,
        $btnguardar;

    var objModalPicker;
    var DATA_STORE = {campos: [], actividades: [], turnos : [], labores: []};
    var dni_usuario_registrando = DATA_NAV.usuario.dni;

	this.initialize = function () {
        this.$el = $('<div/>');
        objModalPicker = new ModalPickerComponente();

        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
        self = this;
    };
 
    this.render = function() {
	    this.$el.html(this.template({
                nombre_usuario: DATA_NAV.usuario.nombres_apellidos,
                fecha_registro : _formateoFecha(fecha_dia),
                imagen_icon: VARS.GET_ICON()
            }));
      
        this.setDOM();
        this.setEventos();
        this.consultarUI();
	    return this;
	};

    this.setDOM = function(){
        var $dom = this.$el.find(".campos,.actividades,.labores,.turnos,.tipotareo,.bloque-mensaje,.btnguardar,.btneliminar"),
            itemNumber = 0;

        $campos = $dom.eq(itemNumber++);
        $actividades = $dom.eq(itemNumber++);
        $labores = $dom.eq(itemNumber++);
        $turnos = $dom.eq(itemNumber++);
        $tipotareo = $dom.eq(itemNumber++);
        $bloqueMensaje = $dom.eq(itemNumber++);
        $btnguardar = $dom.eq(itemNumber++);
        $btneliminar = $dom.eq(itemNumber++);
        
        $dom = null;
    };

    var _clickGuardar = function(e){
        e.preventDefault();
        self.guardar();
    };

    var _activateCampo = function(e){
        e.preventDefault();
        objModalPicker.render({
            title: "Seleccionar CAMPO",
            items: DATA_STORE.campos,
            $input: $(this)
        });
    };

    var _activateActividad = function(e){
        e.preventDefault();
        objModalPicker.render({
            title: "Seleccionar ACTIVIDAD",
            items: DATA_STORE.actividades,
            $input: $(this),
            activateCallBack : true,
            callback: function(data){
                $labores.val("");
                $labores.data("codigo","");
                self.consultarUILabores(data.codigo , "");
            }
        });
    };

    var _activateLabor = function(e){
        e.preventDefault();
        if (!$actividades.data("codigo")){
            return;
        }

        objModalPicker.render({
            title: "Seleccionar LABOR",
            items: DATA_STORE.labores,
            $input: $(this)
        })
    };

    var _clickEliminar = function(e){
        e.preventDefault();
        self.eliminar();
    };

    var imprimirAlerta = function(texto, tipoMensaje){       
        $bloqueMensaje.html("<small>"+texto+"</small>");
        $bloqueMensaje.addClass(tipoMensaje);
        setTimeout(function(){
            limpiarAlerta(tipoMensaje);
        },(tipoMensaje == "bg-rojo" ? 2500 : 1750));
    };

    var limpiarAlerta = function(tipoMensaje){
        estaGuardar = false;
        if ($btnguardar){
            $btnguardar.attr("disabled",false);    
        }

        if ($bloqueMensaje){
            $bloqueMensaje.empty();    
            if (tipoMensaje == undefined){
                $bloqueMensaje.removeClass("bg-verde,bg-rojo");
            } else {
                $bloqueMensaje.removeClass(tipoMensaje);    
            }
        } 
   };  

    this.setEventos = function(){
        $btnguardar.on("click", _clickGuardar);
        $campos.on("click", _activateCampo);
        $actividades.on("click", _activateActividad);
        $labores.on("click", _activateLabor);
        $btneliminar.on("click", _clickEliminar);
    };

    this.consultarUI = function(){
        var reqObj = {
            UIActividades : new Actividad().consultar(),
            UICampos : new Campo().consultar(),
            UITurnos : new Turno().consultar()
        };  

        if (id_registro_labor_edicion != ""){
            reqObj.UIObtenerRegistroLabor = new RegistroLabor({ fecha_dia: fecha_dia, dni_usuario: dni_usuario_registrando})
                                .obtenerRegistroLabor(id_registro_labor_edicion);
        }

        $.whenAll(reqObj)
          .done(function(resultado){
                var UIActividades  = resultado.UIActividades.map(function(o){
                        var nO = Object.assign({}, o);
                        nO.codigo = o.idactividad;
                        return nO;
                    }),
                    UICampos  =  resultado.UICampos.map(function(o){
                        var nO = Object.assign({}, o);
                        nO.codigo = o.idcampo;
                        return nO;
                    }),
                    UITurnos  =  resultado.UITurnos.map(function(o){
                        var nO = Object.assign({}, o);
                        nO.codigo = o.idturno;
                        return nO;
                    });

                DATA_STORE.campos = UICampos;
                DATA_STORE.actividades = UIActividades;
                DATA_STORE.labores = [];

                $turnos.html(templateCombo(UITurnos, "turnos"));

                if (id_registro_labor_edicion != ""){
                    var UIObtenerRegistroLabor = !resultado.UIObtenerRegistroLabor.length ? null : resultado.UIObtenerRegistroLabor[0];

                    if (!UIObtenerRegistroLabor){
                        $btnguardar.html("GUARDAR");
                        return;
                    }

                    $turnos.val(UIObtenerRegistroLabor.idturno);
                    $actividades.val(UIObtenerRegistroLabor.actividad);
                    $actividades.data("codigo", UIObtenerRegistroLabor.idactividad);
                    $campos.val(UIObtenerRegistroLabor.campo);
                    $campos.data("codigo", UIObtenerRegistroLabor.idcampo);
                    $tipotareo.val(UIObtenerRegistroLabor.idtipotareo);

                    self.consultarUILabores(UIObtenerRegistroLabor.idactividad, UIObtenerRegistroLabor.idlabor);
                    $btnguardar.html("EDITAR");
                    $btneliminar.removeClass("escondido");
                }

                })
          .fail(_UIFail);


        reqObj = null;
    };

    this.consultarUILabores = function(idactividad, idLaborSeleccionada){
        var reqObj;

        if (idactividad === ""){
            $labores.attr("placeholder", "");            
            return;
        }

        new Labor({idactividad: idactividad}).consultarPorActividad()
          .done(function(resultado){
                DATA_STORE.labores =  resultado.map(function(o){
                    var nuevoO = Object.assign({}, o);
                    nuevoO.codigo = o.idlabor;
                    return nuevoO;
                });
                $labores.attr("placeholder", "Seleccionar labor");

                if (idLaborSeleccionada != ""){
                    var laborSeleccionada= DATA_STORE.labores.find(function(el){
                        return el.idlabor == idLaborSeleccionada;
                    });
                    $labores.data("codigo", laborSeleccionada.idlabor);
                    $labores.val(laborSeleccionada.descripcion);
                }
            })
          .fail(_UIFail);
    };

    var templateCombo = function(lista, rotulo){
        var  html = "<option value=''>Seleccionar "+rotulo+"</option>";

        for (var i = 0; i < lista.length; i++) {
            var obj = lista[i];
            html += "<option value='"+obj.codigo+"'>"+obj.descripcion+"</option>";
        };

        return html;
    };

    this.guardar = function(){     
        var self = this, 
            idcampo = $campos.data("codigo"),
            idactividad = $actividades.data("codigo"),
            idlabor = $labores.data("codigo"),
            idtipotareo = $tipotareo.val(),
            idturno = $turnos.val();

        var campo = $campos.val(),
            labor = $labores.val(),
            actividad = $actividades.val(),
            turno = $turnos.find("option:selected").text();

        limpiarAlerta();

        if (fecha_dia == null || fecha_dia == ""){
            alert("No se ha encontrado día de asistencia seleccionado.");
            return;
        }

        if (idlabor === undefined || idlabor == ""){
            imprimirAlerta("Debe seleccionar una labor", "bg-rojo");
            return;
        }

        if (idcampo === undefined || idcampo == ""){
            imprimirAlerta("Debe seleccionar un campo", "bg-rojo");
            return;
        }

        if (idtipotareo == ""){
            imprimirAlerta("Debe seleccionar un tipo de tareo", "bg-rojo");
            return;
        }

        if (idturno == ""){
            imprimirAlerta("Debe seleccionar un turno", "bg-rojo");
            return;
        }

        var objRegistro = {
                idcampo : idcampo,
                idlabor : idlabor,
                idtipotareo : idtipotareo,
                idturno : idturno,
                idactividad:  idactividad,
                campo: campo,
                labor: labor,
                actividad: actividad,
                turno:  turno,
                id : id_registro_labor_edicion
            };

        estaGuardar = true;
        $btnguardar.attr("disabled",true);

        new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: dni_usuario_registrando}).verificarRegistroLaborExiste(objRegistro)
            .done(function(resultado){
                    if (resultado.length > 0){
                        imprimirAlerta("Ya existe una labor en este campo registrado en esta fecha.", "bg-rojo");
                        return;
                    }

                    _fnGuardar(objRegistro);
                })
            .fail(function (firstFail, name) {
                _UIFail(firstFail, name);
                estaGuardar = false;
                $btnguardar.attr("disabled",false);
            });
    };

    var _fnGuardar = function(objRegistro){
        new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: dni_usuario_registrando}).registrar(objRegistro)
          .done(function(resultado){
                console.log(resultado);
                  imprimirAlerta("Labor registrada correctamente","bg-verde");
                  history.back();
                })
          .fail(function (firstFail, name) {
                _UIFail(firstFail, name);
                estaGuardar = false;
                $btnguardar.attr("disabled",false);_BLOQUEO_BUSQUEDA = false;
            });
    };

    this.eliminar = function(){
        if (id_registro_labor_edicion == ""){
            return;
        }
        let fnEliminar = function(){
            var objReq = {
                eliminarRegistroLabor:  new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: dni_usuario_registrando})
                            .eliminarRegistroDiaById({id: id_registro_labor_edicion}),
                eliminarRegistroLaborPersonal: new RegistroLaborPersonal({fecha_dia: fecha_dia, dni_usuario_registrando})
                            .eliminarRegistrosDiaByIdRegistroLabor({idregistrolabor: id_registro_labor_edicion})
            };

            $.whenAll(objReq)
                .done(function(resultado){
                    console.log(resultado);
                    alert("Registro eliminado correctamente.");
                    history.back();
                })
                .fail(_UIFail);
        };

        confirmar("¿Estas seguro de eliminar esta labor?", fnEliminar);
    };

    this.destroy = function(){
        $actividades.off("click", _activateActividad);
        $campos.off("click", _activateCampo);
        $labores.off("click", _activateLabor);
        $btnguardar.off("click", _clickGuardar);
        $btneliminar.off("click", _clickEliminar);

        if (objModalPicker){
            objModalPicker.destroy();
        }

        $labores = null;
        $campos = null;
        $tipotareo = null;
        $bloqueMensaje = null;  

        $actividades = null;
        $btnguardar = null;

        this.$el = null;
    };

    this.initialize();  
}