var LoginView = function() {
    var self = this,
        _CLICKS = 0,
        SINCRO_AUTO = true,
        SEGUNDOS_VERIFICAR_SINCRO = 2,
        objSincronizador;

    var isGPSActivated = false;
    var $txtEmpresa;
    var objCacheFechaSincro = new CacheComponente(VARS.CACHE.FECHA_SINCRO);
    var objCacheEmpresaSincro = new CacheComponente(VARS.CACHE.EMPRESA_SINCRO);
    var objCacheEmpresa = new CacheComponente(VARS.CACHE.EMPRESA);
    var objCacheGPS = new CacheComponente(VARS.CACHE.GPS);

     this.initialize = function() {
         this.$el = $('<div/>');
         this.setEventos();
     };

     this.setEventos = function(){
        this.$el.on("change", "#txt-seleccionar-empresa", this.seleccionarEmpresa);
        this.$el.on("submit","form", this.iniciarSesion);
        this.$el.on("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);
        this.$el.on("click", ".txt-trabajargps", this.toggleGPS);   
     };

     this.render = function() {
        isGPSActivated = VARS.GET_ISGPSACTIVATED();
        if (isGPSActivated === null){
            isGPSActivated = 'true';
            objCacheGPS.set(isGPSActivated);
        }

         this.$el.html(this.template({nombre_app: VARS.NOMBRE_APP, is_gps_activated : isGPSActivated}));
         $txtEmpresa = this.$el.find("#txt-seleccionar-empresa");
         if (objCacheEmpresa.get() === null){
            objCacheEmpresa.set($txtEmpresa.val());
         } else{
            $txtEmpresa.val(objCacheEmpresa.get()); 
         }
         
         if (SINCRO_AUTO){
          setTimeout(function(){
              var fechaSincroUltima = objCacheFechaSincro.get();
              if (!(fechaSincroUltima == null || _getHoy() != fechaSincroUltima)){
                  return;
              }

              var empresaSincronizada = objCacheEmpresaSincro.get();
              if (empresaSincronizada == $("#txt-seleccionar-empresa").val() ){
                return;
              }

              self.verificarSincronizacionUltimaAuto(); 
           }, SEGUNDOS_VERIFICAR_SINCRO * 1000); 
         }
         
         return this;
     };

     this.iniciarSesion = function(e){
        e.preventDefault();

        var onIniciarSesion = function(){
            var $form = self.$el.find("form"),
                _login = $form.find("#txt-login").val(), 
                _clave = $form.find("#txt-clave").val(),
                _empresa  = $form.find("#txt-seleccionar-empresa").val();

            new Usuario().iniciarSesion(_login, md5(_clave))
                .done( function( resultado ){
                    if (resultado.length > 0){
                        DATA_NAV.acceso = true;
                        DATA_NAV.usuario = resultado[0];

                        localStorage.setItem(VARS.NOMBRE_STORAGE, JSON.stringify(DATA_NAV));
                        objCacheEmpresa.set(_empresa);

                        router.load("inicio");
                    } else {
                        alert("Usuario no válido.");
                    }
                })
                .fail( function(error){
                    console.error(error);
                }); //EndWhen
        };

        checkGPSActivado(onIniciarSesion);
     };

     var consultarDiasRegistro = function(){       
        var diaHoy = _getHoy(),
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
          .fail(_UIFail);
    };

    var insertarDiaRegistro = function(diaHoy){          
        var reqObj = {
              insertar_dia: servicio.insertarDiaRegistro(diaHoy)
            };

        $.whenAll(reqObj)
          .done(function (res) {
            window.location.hash = "inicio";
          })
          .fail(_UIFail);
    };

    var verificarSincronizacionUltima = function(forzar){
        /*consulta si hay un valor de fecha guardado 
            si no hay, o no es la fecha acual
                FORCE SINCRO
            si hay DO NOTHING*/
        var empresaSeleccionada = objCacheEmpresa.get();

        if ( empresaSeleccionada === "" || empresaSeleccionada == null || empresaSeleccionada === undefined){
          empresaSeleccionada = self.$el.find("#txt-seleccionar-empresa").val();
          if ( empresaSeleccionada === undefined ){
            alert("No se ha seleccionado EMPRESA.");
            return;
          }
        }
        objCacheEmpresa.set(empresaSeleccionada);

        var fechaUltima, hoy = _getHoy();
        objSincronizador = new Sincronizador(["Usuario", "Actividad", "Campo","Labor", "Personal","Turno"]);
        objSincronizador.setCallBackFinish(function(){
          objCacheFechaSincro.set(hoy);
          objCacheEmpresaSincro.set(empresaSeleccionada);
        });

        if (forzar == true){
            objSincronizador.sincronizarDatos();
            return;
        }

        fechaUltima = objCacheFechaSincro.get();

        if (fechaUltima == null || hoy != fechaUltima){
            objSincronizador.sincronizarDatos();
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
        isGPSActivated = VARS.GET_ISGPSACTIVATED();
        if (isGPSActivated === null){
            isGPSActivated = 'true';
            objCacheGPS.set(isGPSActivated);
        }

        if (isGPSActivated == 'true'){
          isActivatedGPS(
              onCorrecto, 
              function noActivado(){
                  alert("¡Debe activar el GPS!");
                  return;
              });
          return;
        } 

        onCorrecto();
    };

     this.toggleGPS = function(){
        var isActive = this.classList.contains("active");
        if (isActive){
            this.classList.remove("active");    
        } else {
            this.classList.add("active");
        }

        objCacheGPS.set(!isActive);
    };

    this.seleccionarEmpresa = function(){
      objCacheEmpresa.set(this.value);
    };

    this.destroy = function(){
        if (objSincronizador){
            objSincronizador.destroy();
            objSincronizador = null;
        } 

        $txtEmpresa = null;
        this.$el.off("change", "#txt-seleccionar-empresa", this.seleccionarEmpresa);
        this.$el.off("submit","form", this.iniciarSesion);
        this.$el.off("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);
        this.$el.off("click", ".txt-trabajargps", this.toggleGPS);

        this.$el = null;
        self = null;
    };

     this.initialize();
};