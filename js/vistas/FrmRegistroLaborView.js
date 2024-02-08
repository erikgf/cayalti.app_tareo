var FrmRegistroLaborView = function ({fecha_dia, id_registro_labor_edicion}) {
	var self = this;
    let $form,
        $turnos,
        $actividades,
        $labores,
        $campos,
        $tipotareo,
        $bloqueMensaje, 
        $chkCaporal,
        $caporal,
        $chkRendimiento,
        $bloqueConRendimiento,
        $unidadMedida,
        $valorTareo,
        estaGuardar = false,
        $btnguardar;

    var objModalPicker;
    var DATA_STORE = {campos: [], actividades: [], turnos : [], labores: [], responsables: []};
    var dni_usuario_registrando = DATA_NAV.usuario.dni;

	this.initialize = function () {
        this.$el = $('<div/>');
        objModalPicker = new ModalPickerComponente();

        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
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
        var $dom = this.$el.find("form,.campos,.actividades,.labores,.turnos,.tipotareo,.chk-caporal,.caporal,.chk-rendimiento,.blk-rendimiento,.unidad-medida,.valor-tareo,.bloque-mensaje,.btnguardar,.btneliminar"),
            itemNumber = 0;

        $form = $dom.eq(itemNumber++);
        $campos = $dom.eq(itemNumber++);
        $actividades = $dom.eq(itemNumber++);
        $labores = $dom.eq(itemNumber++);
        $turnos = $dom.eq(itemNumber++);
        $tipotareo = $dom.eq(itemNumber++);
        $chkCaporal =  $dom.eq(itemNumber++); 
        $caporal = $dom.eq(itemNumber++);
        $chkRendimiento = $dom.eq(itemNumber++);
        $bloqueConRendimiento = $dom.eq(itemNumber++);
        $unidadMedida = $dom.eq(itemNumber++);
        $valorTareo = $dom.eq(itemNumber++);
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

    var _activateCaporal = function(e){
        e.preventDefault();
        objModalPicker.render({
            title: "Seleccionar CAPORAL",
            items: DATA_STORE.responsables,
            $input: $(this),
        });
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
        $form.on("submit", _clickGuardar);
        $campos.on("click", _activateCampo);
        $actividades.on("click", _activateActividad);
        $labores.on("click", _activateLabor);
        $btneliminar.on("click", _clickEliminar);
        $chkRendimiento.on("change", (e)=>{
            const checked = e.target.checked;
            $bloqueConRendimiento.css({display: checked ? "flex" : "none"});
            $unidadMedida.prop("required", checked);
            $valorTareo.prop("required", checked);
        });
        $chkCaporal.on("change", (e)=> {
            const checked = e.target.checked;
            $caporal.css({display: checked ? "flex" : "none"});
            $caporal.prop("required", checked);
            if (!checked){
                $caporal.val("");
                $caporal.data("codigo", "");
            }
        });

        $caporal.on("click", _activateCaporal);
    };

    this.consultarUI = function(){
        const reqObj = {
            UIActividades : new Actividad().consultar(),
            UICampos : new Campo().consultar(),
            UITurnos : new Turno().consultar(),
            UIUnidadMedidas: new UnidadMedida().consultar(),
            UIResponsables : new Personal().consultar()
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
                    }),
                    UIUnidadMedidas  =  resultado.UIUnidadMedidas.map(function(o){
                        var nO = Object.assign({}, o);
                        nO.codigo = o.id_unidad_medida;
                        return nO;
                    }),
                    UIResponsables  =  resultado.UIResponsables.map(function(o){
                        return {codigo: o.dni, descripcion: o.nombres_apellidos};
                    }).sort(function(a,b){
                        if (a.descripcion < b.descripcion){
                            return -1;
                        }
                        if (a.descripcion > b.descripcion){
                            return 1;
                        }
                        return 0;
                    });

                DATA_STORE.campos = UICampos;
                DATA_STORE.actividades = UIActividades;
                DATA_STORE.labores = [];

                DATA_STORE.responsables = UIResponsables;

                $turnos.html(templateCombo(UITurnos, "turnos"));
                $unidadMedida.html(templateCombo(UIUnidadMedidas, "unid. med."));

                if (id_registro_labor_edicion != ""){
                    var UIObtenerRegistroLabor = !resultado.UIObtenerRegistroLabor.length ? null : resultado.UIObtenerRegistroLabor[0];

                    if (!UIObtenerRegistroLabor){
                        $btnguardar.html("GUARDAR");
                        return;
                    }

                    console.log({UIObtenerRegistroLabor})

                    $turnos.val(UIObtenerRegistroLabor.idturno);
                    $actividades.val(UIObtenerRegistroLabor.actividad);
                    $actividades.data("codigo", UIObtenerRegistroLabor.idactividad);
                    $campos.val(UIObtenerRegistroLabor.campo);
                    $campos.data("codigo", UIObtenerRegistroLabor.idcampo);
                    $tipotareo.val(UIObtenerRegistroLabor.idtipotareo);

                    self.consultarUILabores(UIObtenerRegistroLabor.idactividad, UIObtenerRegistroLabor.idlabor);
                    const conCaporal = Boolean(UIObtenerRegistroLabor.idcaporal);
                    $chkCaporal.prop("checked", conCaporal);
                    $caporal.css({display: conCaporal ? 'flex' : 'none'});
                    $caporal.val(UIObtenerRegistroLabor.caporal);
                    $caporal.data("codigo", UIObtenerRegistroLabor.idcaporal);

                    const conRendimiento = UIObtenerRegistroLabor.con_rendimiento == '1';
                    $chkRendimiento.prop("checked", conRendimiento);
                    $bloqueConRendimiento.css({display: conRendimiento ? "flex" : "none"});
                    $unidadMedida.val(UIObtenerRegistroLabor.id_unidad_medida);
                    $valorTareo.val(UIObtenerRegistroLabor.valor_tareo); 

                    $btnguardar.html("EDITAR");
                    $btneliminar.removeClass("escondido");
                }

                })
          .fail(_UIFail);

    };

    this.consultarUILabores = function(idactividad, idLaborSeleccionada){
        if (idactividad === ""){
            $labores.attr("placeholder", "");            
            return;
        }

        new Labor({idactividad}).consultarPorActividad()
          .done(function(resultado){
                DATA_STORE.labores =  resultado.map(function(o){
                    var nuevoO = Object.assign({}, o);
                    nuevoO.codigo = o.idlabor;
                    return nuevoO;
                });
                $labores.attr("placeholder", "Seleccionar labor");

                if (idLaborSeleccionada != ""){
                    const laborSeleccionada= DATA_STORE.labores.find(function(el){
                        return el.idlabor == idLaborSeleccionada;
                    });
                    $labores.data("codigo", laborSeleccionada.idlabor);
                    $labores.val(laborSeleccionada.descripcion);
                }
            })
          .fail(_UIFail);
    };

    const templateCombo = function(lista, rotulo){
        var  html = "<option value=''>Seleccionar "+rotulo+"</option>";

        for (var i = 0; i < lista.length; i++) {
            var obj = lista[i];
            html += "<option value='"+obj.codigo+"'>"+obj.descripcion+"</option>";
        };

        return html;
    };

    this.guardar = function(){     
        let idcampo = $campos.data("codigo"),
            idactividad = $actividades.data("codigo"),
            idlabor = $labores.data("codigo"),
            idtipotareo = $tipotareo.val(),
            idturno = $turnos.val();

        let campo = $campos.val(),
            labor = $labores.val(),
            actividad = $actividades.val(),
            turno = $turnos.find("option:selected").text();

        let con_rendimiento = $chkRendimiento.prop("checked");
        let id_unidad_medida = $unidadMedida.val(),
            unidad_medida = $unidadMedida.find("option:selected").text()
        const valor_tareo = $valorTareo.val();
        const conCaporal = $chkCaporal.prop("checked");
        const objCaporal = { codigo: $caporal.data("codigo"), descripcion: $caporal.val() };

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

        if (conCaporal){
            if (!Boolean(objCaporal.codigo)){
                imprimirAlerta("Debe seleccionar caporal.", "bg-rojo");
                return;
            }
        }

        const objRegistro = {
                idcampo,
                idlabor,
                idtipotareo,
                idturno,
                idactividad,
                campo,
                labor,
                actividad,
                turno,
                id_unidad_medida,
                unidad_medida,
                valor_tareo,
                con_rendimiento,
                idcaporal: conCaporal ? objCaporal.codigo : "",
                caporal: conCaporal ? objCaporal.descripcion : "",
                id: id_registro_labor_edicion
            };

        estaGuardar = true;
        $btnguardar.attr("disabled",true);

        new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: dni_usuario_registrando}).verificarRegistroLaborExiste(objRegistro)
            .done(function(resultado){
                    if (resultado.length > 0){
                        if (Boolean(id_registro_labor_edicion)){
                            //estoy editando, debo verificar q el registro devuelvo sea distinto en id
                            if (resultado[0].id != id_registro_labor_edicion){
                                imprimirAlerta("Ya existe una labor con estos datos registrado en esta fecha.", "bg-rojo");
                                return;        
                            }

                            _fnGuardar(objRegistro);
                            return;
                        } 
                        imprimirAlerta("Ya existe una labor con estos datos registrado en esta fecha.", "bg-rojo");
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

    const _fnGuardar = function(objRegistro){
        new RegistroLabor({fecha_dia: fecha_dia, dni_usuario: dni_usuario_registrando}).registrar(objRegistro)
          .done(function(){
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
                    alert("Registro eliminado correctamente.");
                    history.back();
                })
                .fail(_UIFail);
        };

        confirmar("¿Estas seguro de eliminar esta labor?", fnEliminar);
    };

    this.destroy = function(){
        $form.off("click", _clickGuardar);
        $actividades.off("click", _activateActividad);
        $campos.off("click", _activateCampo);
        $labores.off("click", _activateLabor);
        $btneliminar.off("click", _clickEliminar);
        $chkRendimiento.off("change");

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