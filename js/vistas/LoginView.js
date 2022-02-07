var LoginView = function(servicio, servicio_web, cache) {
    var self = this,
        _CLICKS = 0,
        SINCRO_AUTO = true,
        SEGUNDOS_VERIFICAR_SINCRO = 2,
        objSincronizador,
        getHoy = _getHoy;

     this.initialize = function() {
         this.$el = $('<div/>');
         this.setEventos();
         if (SINCRO_AUTO){
          setTimeout(function(){
              self.verificarSincronizacionUltimaAuto();
           }, SEGUNDOS_VERIFICAR_SINCRO * 1000); 
         }
     };

     this.setEventos = function(){
        this.$el.on("submit","form", this.iniciarSesion);
        this.$el.on("click","img", this.resetearBD);
        this.$el.on("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);
     };

     this.render = function() {
         this.$el.html(this.template({nombre_app: VARS.NOMBRE_APP}));
         return this;
     };

     this.iniciarSesion = function(e){
        e.preventDefault();
        var onIniciarSesion = function(){
            var $form = self.$el.find("form"),
                _login = $form.find("#txt-login").val(), 
                _clave = $form.find("#txt-clave").val();

            $.when( servicio.iniciarSesion(_login, md5(_clave).toUpperCase() ))
                .done( function( resultado ){
                    var rows = resultado.rows;

                    if (rows.length > 0){
                        DATA_NAV.acceso = true;
                        DATA_NAV.usuario = rows.item(0);
                        localStorage.setItem(VARS.NOMBRE_STORAGE, JSON.stringify(DATA_NAV));
                        consultarDiasRegistro();
                    } else {
                        alert("Usuario no válido.");
                    }
            });
        };

        checkGPSActivado(onIniciarSesion);
     };

     var consultarDiasRegistro = function(){       
        var diaHoy = getHoy(),
            reqObj = {
             consultar_existencia_dia: servicio.consultarExistenciaDia(diaHoy)
            };

        $.whenAll(reqObj)
          .done(function (res) {
            var rowConsultarExistencia = res.consultar_existencia_dia.rows.item(0);
            
            if (rowConsultarExistencia.existencia == 0){
                insertarDiaRegistro(diaHoy);
                return;
            }

            window.location.hash = "inicio";
          })
          .fail(function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
          });
    };

    var insertarDiaRegistro = function(diaHoy){          
        var reqObj = {
              insertar_dia: servicio.insertarDiaRegistro(diaHoy)
            };

        $.whenAll(reqObj)
          .done(function (res) {
            window.location.hash = "inicio";
          })
          .fail(function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
          });
    };

    this.resetearBD = function(e){
        e.preventDefault();
        _CLICKS++;
        if (_CLICKS > 5){
            alert("Se eliminará BD, resetee app en 5 segundos.");
            servicio.resetearBD();
            _CLICKS = 0;
        }
        
    };

    var verificarSincronizacionUltima = function(forzar){
        /*consulta si hay un valor de fecha guardado 
            si no hay, o no es la fecha acual
                FORCE SINCRO
            si hay DO NOTHING*/
        var fechaUltima, hoy;
            objSincronizador = new SincronizadorClase(servicio, servicio_web, 
                     ["Usuarios", "Actividades", "Campos","Labores", "Personal","Turnos"]);

        if (forzar == true){
            objSincronizador.actualizarDatos();
            return;
        }

        fechaUltima = localStorage.getItem(VARS.NOMBRE_STORAGE+"_FECHA");
        hoy = getHoy();

        if (fechaUltima == null || hoy != fechaUltima){
            objSincronizador.actualizarDatos();
        }  else {
            objSincronizador.destroy();
        }
    };

    this.verificarSincronizacionUltimaManual = function(){
        verificarSincronizacionUltima(true);
    };

    this.verificarSincronizacionUltimaAuto = function(){
        if (checkConexion().online){
            verificarSincronizacionUltima(false);
        } else {
            alert("No se ha detectado ninguna RED disponsible para hacer sincronización automática.");
        }
    };

    var checkGPSActivado = function(onCorrecto){
        isActivatedGPS(
            onCorrecto, 
            function noActivado(){
                alert("¡Debe activar el GPS!");
                history.back();
                return;
            });
    };
    

    this.destroy = function(){
        if (objSincronizador){
            objSincronizador.destroy();
            objSincronizador = null;
        }

        this.$el.off("submit","form", this.iniciarSesion);
        this.$el.off("click","img", this.resetearBD);
        this.$el.off("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);

        this.$el = null;
        self = null;
    };

     this.initialize();
};