var FrmRegistroLaborView = function (servicio_frm, cache, usuario, fecha_dia, id_registro_labor_edicion) {
	var self, 
        $turno,
        $actividades,
        $labores,
        $campos,
        $tipotareo,
        $bloqueMensaje, 
        estaGuardar = false,
        $btnguardar,
        formateoFecha = _formateoFecha,
		rs2Array = resultSetToArray;

    var objModalPicker;
    var DATA_STORE = {campos: [], actividades: [], turnos : [], labores: []};

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
                nombre_usuario: usuario.nombre_usuario,
                fecha_registro : formateoFecha(fecha_dia),
                imagen_icon: VARS.GET_ICON()
            }));
      
        this.setDOM();
        this.setEventos();
        this.consultarUI();
	    return this;
	};

    this.setDOM = function(){
        var $dom = this.$el.find(".campos,.actividades,.labores,.turnos,.tipotareo,.bloque-mensaje,.btnguardar"),
            itemNumber = 0;

        $campos = $dom.eq(itemNumber++);
        $actividades = $dom.eq(itemNumber++);
        $labores = $dom.eq(itemNumber++);
        $turnos = $dom.eq(itemNumber++);
        $tipotareo = $dom.eq(itemNumber++);
        $bloqueMensaje = $dom.eq(itemNumber++);
        $btnguardar = $dom.eq(itemNumber++);
        
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

    var UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
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
        //$actividades.on("change", _changeActividad);
        $btnguardar.on("click", _clickGuardar);

        $campos.on("click", _activateCampo);
        $actividades.on("click", _activateActividad);
        $labores.on("click", _activateLabor);
    };

    this.consultarUI = function(){
        /*Función que manda el código de cultivo y devuele hora E,S y descripcion.*/
        var reqObj = {
            //UITurnoDescripcion: servicio_frm.obtenerTurnoDescripcion(idturno),
            UIActividades : servicio_frm.consultarActividades(),
            UICampos : servicio_frm.consultarCampos(),
            UITurnos : servicio_frm.consultarTurnos()
        };

        if (id_registro_labor_edicion != ""){
            reqObj.UIObtenerRegistroLabor = servicio_frm.obtenerRegistroLaborXId(fecha_dia, DATA_NAV.usuario.dni, id_registro_labor_edicion);
        }

        $.whenAll(reqObj)
          .done(function(res){
                var //UITurnoDescripcion = res.UITurnoDescripcion.rows.item(0),
                    UIActividades  = rs2Array(res.UIActividades.rows),
                    UICampos  = rs2Array(res.UICampos.rows),
                    UITurnos  = rs2Array(res.UITurnos.rows);

                DATA_STORE.campos = UICampos;
                DATA_STORE.actividades = UIActividades;
                DATA_STORE.labores = [];

                $turnos.html(templateCombo(UITurnos, "turnos"));
                //$actividades.html(templateCombo(UIActividades, "actividad"));
               // $campos.html(templateCombo(UICampos, "campo"));
               // $labores.html(templateCombo([], "labor"));
                if (id_registro_labor_edicion != ""){
                    var UIObtenerRegistroLabor = res.UIObtenerRegistroLabor.rows[0];
                    $turnos.val(UIObtenerRegistroLabor.idturno);

                    var actividadSeleccionada = DATA_STORE.actividades.find(function(el){
                        return el.codigo == UIObtenerRegistroLabor.idactividad;
                    });
                    $actividades.val(actividadSeleccionada.descripcion);
                    $actividades.data("codigo", actividadSeleccionada.codigo);

                    var campoSeleccionado = DATA_STORE.campos.find(function(el){
                        return el.codigo == UIObtenerRegistroLabor.idcampo;
                    });
                    $campos.val(campoSeleccionado.descripcion);
                    $campos.data("codigo", campoSeleccionado.codigo);

                    //$actividades.val(UIObtenerRegistroLabor.idactividad);
                    //$campos.val(UIObtenerRegistroLabor.idcampo);
                    $tipotareo.val(UIObtenerRegistroLabor.idtipotareo);

                    self.consultarUILabores(UIObtenerRegistroLabor.idactividad, UIObtenerRegistroLabor.idlabor);
                    $btnguardar.html("EDITAR");
                }

                })
          .fail(UIFail);
    };

    this.consultarUILabores = function(idActividad, idLaborSeleccionada){
        /*Función que manda el código de cultivo y devuele hora E,S y descripcion.*/
        var reqObj;

        if (idActividad === ""){
            $labores.attr("placeholder", "");            
            //$labores.html(templateCombo([], "labor"));
            return;
        }

        reqObj = {
            UILabores : servicio_frm.consultarLabores(idActividad),
        };

        $.whenAll(reqObj)
          .done(function(res){
                var UILabores  = rs2Array(res.UILabores.rows);
                DATA_STORE.labores = UILabores;+
                $labores.attr("placeholder", "Seleccionar labor");
                //$labores.html(templateCombo(UILabores, "labor"));

                if (idLaborSeleccionada != ""){
                    var laborSeleccionada= DATA_STORE.labores.find(function(el){
                        return el.codigo == idLaborSeleccionada;
                    });
                    $labores.data("codigo", laborSeleccionada.codigo);
                    $labores.val(laborSeleccionada.descripcion);
                    //$labores.val(idLaborSeleccionada);
                }
            })
          .fail(UIFail);
    };

    var templateCombo = function(lista, rotulo){
        var  html = "<option value=''>Seleccionar "+rotulo+"</option>";

        for (var i = 0; i < lista.length; i++) {
            var obj = lista[i];
            html += "<option value='"+obj.codigo+"'>"+obj.descripcion+"</option>";
        };

        return html;
    };

    this.guardar = function(numeroDNI){     
        var self = this, 
            idcampo = $campos.data("codigo");
            idlabor = $labores.data("codigo");
            idtipotareo = $tipotareo.val(),
            idturno = $turnos.val();

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
                fecha_dia : fecha_dia,
                idcampo : idcampo,
                idlabor : idlabor,
                idtipotareo : idtipotareo,
                dni_usuario : usuario.dni,
                idturno : idturno,
                id : id_registro_labor_edicion
            };

        var objRQ = {
            verificarLaborExiste : servicio_frm.verificarLaborExiste(objRegistro)
        };

        estaGuardar = true;
        $btnguardar.attr("disabled",true);

        $.whenAll(objRQ)
            .done(function(res){
                    var objVerificarExiste = res.verificarLaborExiste.rows.item(0);
                    if (objVerificarExiste.cantidad > 0){
                        imprimirAlerta("Ya existe una labor en este campo registrado en esta fecha.", "bg-rojo");
                        return;
                    }

                    _fnGuardar(objRegistro);
                })
            .fail(function (firstFail, name) {
                console.log('Fail for: ' + name);
                console.error(firstFail);
                estaGuardar = false;
                $btnguardar.attr("disabled",false);
            });
    };

    var _fnGuardar = function(objRegistro){
        var reqObj = {
            registrarLabor : servicio_frm.registrarLabor(objRegistro)
        };

        $.whenAll(reqObj)
          .done(function(res){
                  imprimirAlerta("Labor registrada correctamente","bg-verde");
                  history.back();
                })
          .fail(function (firstFail, name) {
                console.log('Fail for: ' + name);
                console.error(firstFail);
                estaGuardar = false;
                $btnguardar.attr("disabled",false);_BLOQUEO_BUSQUEDA = false;
            });
    };

    this.destroy = function(){
        $actividades.off("click", _activateActividad);
        $campos.off("click", _activateCampo);
        $labores.off("click", _activateLabor);
        $btnguardar.off("click", _clickGuardar);

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