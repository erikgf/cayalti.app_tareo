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

var DATA_NAV, DATA_NAV_JSON, 
    FECHA_TRABAJO; /*VARIABLE SUPER IMPORTANTE QUE NOS DICTA SI ES QUE HAY O NO DIA ACTIVO EN EL SISTEMA.*/

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

    FECHA_TRABAJO = localStorage.getItem(VARS.NOMBRE_STORAGE_FECHA_TRABAJO);

    var VERSION = "1",
        slider = new PageSlider($('body')),
        //blockUI = new BlockUI(),
        db = new DBHandlerClase(VERSION),
        servicio = new AgriServicio(),
        servicio_web = new AgriServicioWeb(),
        servicio_frm = new AgriServicioFrm(),
        servicio_gps = new GPSServicio();
    
    servicio_gps.initialize();
    servicio_web.initialize();
    servicio_frm.initialize(db);

    servicio.initialize(db).then(function (htmlScriptTemplates) {
      try{
        procesarTemplates(htmlScriptTemplates);

          router.addRoute('', function() {
              slider.slidePage(new LoginView(servicio, servicio_web).render().$el);
          });

          router.addRoute('inicio', function() {
            if (DATA_NAV.acceso){
                slider.slidePage(new InicioView(DATA_NAV.usuario,servicio_web, servicio).render().$el);
            }
          });

          router.addRoute('seleccion-opcion/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new SeleccionOpcionView(fecha_dia, servicio_frm, servicio_web, CACHE_VIEW.seleccion_opcion,DATA_NAV.usuario).render().$el);
            }
          });

          router.addRoute('registro-asistencia/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroAsistenciaView(servicio_frm, CACHE_VIEW.registro_asistencia, DATA_NAV.usuario,fecha_dia, servicio_gps).render().$el);
            }
          });

          router.addRoute('listado-labores/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                //CACHE_VIEW.seleccion_opcion.idturno = idturno;
                slider.slidePage(new ListadoLaboresView(fecha_dia,  servicio_frm, CACHE_VIEW.listado_labores,DATA_NAV.usuario).render().$el);
            }
          });

          router.addRoute('registro-labor/:fechadia/:idregistrolaboredicion', function(fecha_dia, idregistrolaboredicion) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroLaborView(servicio_frm, CACHE_VIEW.registro_labor, DATA_NAV.usuario,fecha_dia, idregistrolaboredicion).render().$el);
            }
          });

          router.addRoute('registro-tareo/:fechadia/:idlabor/:idcampo/:idturno', function(fecha_dia, idlabor,idcampo,idturno) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroTareoView(servicio_frm, CACHE_VIEW.registro_tareo, DATA_NAV.usuario, {
                                      fecha_dia : fecha_dia,
                                      idlabor: idlabor,
                                      idcampo : idcampo,
                                      idturno : idturno
                                  }, servicio_gps).render().$el);
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

    function procesarTemplates(htmlScriptTemplates){
        $("body").prepend(htmlScriptTemplates);


        var scripts = document.getElementsByTagName('script');

        for(var i = 0; i < scripts.length; i++) {
            var $el = scripts[i], id = $el.id;
            if ($el.type.toLowerCase() == "text/template"){
                window[id.slice(0,-4)].prototype.template = Handlebars.compile(document.getElementById(id).innerHTML);
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
      onDeviceReady();  // Web page
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
 // router.load("inicio");
};
