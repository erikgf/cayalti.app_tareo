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

var onDeviceReady = function () {   
    /* ---------------------------------- Local Variables ---------------------------------- */
    DATA_NAV_JSON = localStorage.getItem(VARS.NOMBRE_STORAGE);

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

    /*

    var servicio = new AgriServicio(),
        servicio_web = new AgriServicioWeb(),
        servicio_frm = new AgriServicioFrm();
    */
    SERVICIO_GPS = new GPSServicio();

        /*
    servicio_frm.initialize(db);
    */
/*
    servicio.initialize(db).then(function (htmlScriptTemplates) {
      try{
        procesarTemplates(htmlScriptTemplates);

        if (DATA_NAV.acceso){
          router.load("inicio");
        } else {
          router.load("");
        }

        router.start();
        
        checkgps();

      }catch(e){
        console.error(e)
      };
    });
    */


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
                //CACHE_VIEW.seleccion_opcion.idturno = idturno;
                slider.slidePage(new ListadoLaboresView({fecha_dia, fecha_dia}).render().$el);
            }
          });

          router.addRoute('registro-labor/:fechadia/:idregistrolaboredicion', function(fecha_dia, idregistrolaboredicion) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroLaborView({
                                    fecha_dia: fecha_dia,
                                    idregistrolaboredicion: idregistrolaboredicion
                                  }).render().$el);
            }
          });

          router.addRoute('registro-tareo/:fechadia/:idlabor/:idcampo/:idturno', function(fecha_dia, idlabor,idcampo,idturno) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroTareoView({
                                      fecha_dia : fecha_dia,
                                      idlabor: idlabor,
                                      idcampo : idcampo,
                                      idturno : idturno
                                  }).render().$el);
            }
          });

          if (DATA_NAV.acceso){
            router.load("inicio");
          } else {
            router.load("");
          }

          router.start();
          checkgps();
          //checkActualizar();
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
