var LoginView = function() {
    var self = this,
        _CLICKS = 0,
        SINCRO_AUTO = true,
        SEGUNDOS_VERIFICAR_SINCRO = 2,
        objSincronizador,
        getHoy = _getHoy;

    var $txtEmpresa;

     this.initialize = function() {
         this.$el = $('<div/>');
         this.setEventos();
         if (SINCRO_AUTO){
          setTimeout(function(){
              var fechaUltima = localStorage.getItem(VARS.NOMBRE_STORAGE+"_FECHA");
              if (!(fechaUltima == null || getHoy() != fechaUltima)){
                  return;
              }

              var empresaSincronizada = localStorage.getItem(VARS.NOMBRE_STORAGE+"_EMPRESASINCRONIZADA");
              if (empresaSincronizada == $("#txt-seleccionar-empresa").val() ){
                return;
              }

              confirmar("Se realizará una sincronización automática, esta seguro de continuar? Si hay datos no enviados, serán eliminados.", 
                function(){
                  self.verificarSincronizacionUltimaAuto();  
                },
                function(){
                  self.asignarFechaSincronizacionHoy();
                });
           }, SEGUNDOS_VERIFICAR_SINCRO * 1000); 
         }
     };

     this.setEventos = function(){
        this.$el.on("change", "#txt-seleccionar-empresa", this.seleccionarEmpresa);
        this.$el.on("submit","form", this.iniciarSesion);
        this.$el.on("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);
     };

     this.render = function() {
         this.$el.html(this.template({nombre_app: VARS.NOMBRE_APP}));
         $("#txt-seleccionar-empresa").val(localStorage.getItem(VARS.NOMBRE_STORAGE+"_EMPRESA"));
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
                        new CacheComponente("_empresa").set(_empresa);

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

    var verificarSincronizacionUltima = function(forzar){
        /*consulta si hay un valor de fecha guardado 
            si no hay, o no es la fecha acual
                FORCE SINCRO
            si hay DO NOTHING*/
        var empresaSeleccionada = localStorage.getItem(VARS.NOMBRE_STORAGE,"_EMPRESA");
        if ( empresaSeleccionada === "" ||  empresaSeleccionada === undefined){
          alert("No se ha seleccionado EMPRESA.");
          return;
        }

        var fechaUltima, hoy;
        objSincronizador = new Sincronizador(["Usuario", "Actividad", "Campo","Labor", "Personal","Turno"]);

        if (forzar == true){
            objSincronizador.sincronizarDatos();
            return;
        }

        fechaUltima = localStorage.getItem(VARS.NOMBRE_STORAGE+"_FECHA");
        hoy = getHoy();

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

    this.asignarFechaSincronizacionHoy = function(){
      localStorage.setItem(VARS.NOMBRE_STORAGE+"_FECHA",getHoy());
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
    

    this.seleccionarEmpresa = function(){
      localStorage.setItem(VARS.NOMBRE_STORAGE+"_EMPRESA", this.value);
      self.verificarSincronizacionUltimaManual();
    };

    this.destroy = function(){
        if (objSincronizador){
            objSincronizador.destroy();
            objSincronizador = null;
        }

        this.$el.off("change", "#txt-seleccionar-empresa", this.seleccionarEmpresa);
        this.$el.off("submit","form", this.iniciarSesion);
        this.$el.off("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);

        this.$el = null;
        self = null;
    };

     this.initialize();
};