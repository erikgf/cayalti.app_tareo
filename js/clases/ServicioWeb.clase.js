const ServicioWeb = function() {
    /*
    1.- Crear la bbdd
    2.- Crear la estructura

    otros:
    3.- Limpiar informacion
    4.- Consulta y agregar informacion
    5.- Enviar informacion
    */
    var URL_RUTA = VARS.SERVER;
    var URL_RUTA_CONTROLADOR = URL_RUTA+"/controlador/";
    var self = this;

    this.init = function(){
      return this;
    };

    this.sincronizarDatos = function() {
        /*
        Me permite obtener información de:
          Usuario
          Personal
          Labores
          Areas
          * Limpiar toda la Data
        */
       return $.ajax({
                url: URL_RUTA_CONTROLADOR,
                data: {
                    modelo: "ActualizadorAppLabores", 
                    metodo: "actualizarDatos",
                    empresa: localStorage.getItem(VARS.NOMBRE_STORAGE+"_EMPRESA")
                  },
                dataType : "json",
                type: "POST"
              });
    };

    this.enviarDatos = function(JSONDataAsistencia, JSONDataTareo) {
       return $.ajax({
                url: URL_RUTA_CONTROLADOR,
                data: {
                      modelo: "ActualizadorAppLabores", 
                      metodo: "enviarDatosNuevo", 
                      data_out:[JSONDataEnviar],
                      data_out:[JSONDataAsistencia, JSONDataTareo], 
                      empresa : localStorage.getItem(VARS.NOMBRE_STORAGE+"_EMPRESA")
                    },
                dataType : "json",
                type: "post"
              });
    };

    return this.init(); 
}

