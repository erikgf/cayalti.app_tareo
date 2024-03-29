 var CACHE_VIEW = {
    login: {
        txt_usuario: null
    },
    inicio:{
    },
    seleccion_opcion: {
        idturno: "01"
    },
    listado_labores : {
    },
    registro_asistencia: {
    },
    registro_labor: {
    }
},
  ACTUAL_PAGE = null,
  router;

var DB_HANDLER;
var SERVICIO_GPS;
var DATA_NAV, DATA_NAV_JSON; /*VARIABLE SUPER IMPORTANTE QUE NOS DICTA SI ES QUE HAY O NO DIA ACTIVO EN EL SISTEMA.*/
var TEMPLATES = {};
var VERSION_GLOBAL;

var onDeviceReady = function () {   
    VERSION_GLOBAL = Boolean(window?.AppVersion) ? window.AppVersion.version : 'X.X.X';
    /* ---------------------------------- Local Variables ---------------------------------- */
    DATA_NAV_JSON = localStorage.getItem(VARS.NOMBRE_STORAGE);

    const cacheDev = localStorage.getItem(VARS.NOMBRE_STORAGE+"__cachedev");
    if (cacheDev == 1){
      VARS.SERVER_NAME = VARS.SERVER_NAME_DESARROLLO;
    }

    if ( DATA_NAV_JSON != null){
      DATA_NAV = JSON.parse(DATA_NAV_JSON); 
    } else {
      DATA_NAV = {
        acceso: false,
        usuario : {dni: '00000000', usuario: 'admin', nombre_usuario: "ADMIN"}
      };
    }

    var slider = new PageSlider($('body'));
    var compilar = function(){
      esAppMovil = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      return esAppMovil ?  $.get("template.master.hbs") : $.get("template.compiler.php");
    };

    SERVICIO_GPS = new GPSProvider();

    new BaseDatosLocal().then(function () {
      compilar().then(function(htmlScriptTemplates){
        try{
          procesarTemplates(htmlScriptTemplates);

          router.addRoute('', function() {
              slider.slidePage(new LoginView().render().$el);
          });

          router.addRoute('inicio', function() {
            if (DATA_NAV.acceso){
                slider.slidePage(new InicioView().render().$el);
            }
          });

          router.addRoute('seleccion-opcion/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new SeleccionOpcionView({fecha_dia: fecha_dia}).render().$el);
            }
          });

          router.addRoute('registro-asistencia/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroAsistenciaView({fecha_dia: fecha_dia}).render().$el);
            }
          });

          router.addRoute('listado-labores/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new ListadoLaboresView({fecha_dia: fecha_dia}).render().$el);
            }
          });

          router.addRoute('registro-labor/:fechadia/:idregistrolaboredicion', function(fecha_dia, idregistrolaboredicion) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroLaborView({
                                    fecha_dia: fecha_dia,
                                    id_registro_labor_edicion: idregistrolaboredicion
                                  }).render().$el) ;
            }
          });

          router.addRoute('registro-tareo/:fechadia/:idlabor/:idcampo/:idturno/:conrendimiento/:idcaporal', function(fecha_dia, idlabor,idcampo,idturno, conrendimiento, idcaporal) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroTareoView({
                                      fecha_dia : fecha_dia,
                                      idlabor: idlabor,
                                      idcampo : idcampo,
                                      idturno : idturno,
                                      conRendimiento: conrendimiento,
                                      idcaporal
                                  }).render().$el);
            }
          });

          router.addRoute('listado-labores-rendimientos/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new ListadoLaboresRendimientoView({fecha_dia: fecha_dia}).render().$el);
            }
          });

          router.addRoute('registro-rendimiento-tareo/:fechadia/:idlabor/:idcampo/:idturno/:idcaporal', function(fecha_dia, idlabor,idcampo,idturno, idcaporal) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroRendimientoTareoView({
                                      fecha_dia,
                                      idlabor,
                                      idcampo,
                                      idturno,
                                      idcaporal
                                  }).render().$el);
            }
          });
          
          router.start();

          if (DATA_NAV.acceso){
            router.load("inicio");
          } else {
            router.load("");
          }

          checkgps();
          checkActualizar();
        }catch(e){
          console.error(e)
        };
      });
    });

    function procesarTemplates(htmlScriptTemplates){
        $("body").prepend(htmlScriptTemplates);
        var scripts = document.getElementsByTagName('script');

        for(var i = 0; i < scripts.length; i++) {
            var $el = scripts[i], id = $el.id;
            if ($el.type.toLowerCase() == "text/template"){
                var pageName = id.slice(0,-4)
                var page = window[pageName];
                if (page){
                  page.prototype.template = Handlebars.compile(document.getElementById(id).innerHTML);
                } else {
                  TEMPLATES[pageName] =  Handlebars.compile(document.getElementById(id).innerHTML);
                }
            }
        }
    };
    
    FastClick.attach(document.body);

    $("title").html(VARS.NOMBRE_APP);
};

(function(){
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if ( app ) {
      document.addEventListener("deviceready", onDeviceReady, false);
      document.addEventListener('backbutton', function(e) {
           if (window.location.hash == "" || window.location.hash == "#"){
               navigator.app.exitApp();
               return false;
           }
           history.back();
      }, false);

    } else {
      onDeviceReady();  // webapp
    } 
    setFX(app);
}());

function cerrarSesion(){
  localStorage.removeItem(VARS.NOMBRE_STORAGE);
  DATA_NAV = {
    acceso: false,
    usuario : null
  };

  location.href = "#";
};
