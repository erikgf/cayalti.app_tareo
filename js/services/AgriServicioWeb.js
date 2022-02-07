var AgriServicioWeb = function() {
    var url,
       IP = VARS.SERVER;

    this.initialize = function(serviceURL) {
        url = serviceURL ? serviceURL : IP+"/controlador/";
        var deferred = $.Deferred();
        deferred.resolve();
        return deferred.promise();
    };

    this.actualizarDatos = function() {
       return $.ajax({
                url: url,
                data: {modelo: "ActualizadorAppLabores", "metodo": "actualizarDatos"},
                type: "post"
              });
    };

    /*
    this.enviarDatos = function(JSONDataAsistencia, JSONDataTareo) {
       return $.ajax({
                url: url,
                data: {modelo: "ActualizadorAppLabores", "metodo": "enviarDatos", data_out:[JSONDataAsistencia, JSONDataTareo]},
                type: "post"
              });
    };*/

    this.enviarDatos = function(JSONDataAsistencia, JSONDataTareo) {
       return $.ajax({
                url: url,
                data: {modelo: "ActualizadorAppLabores", "metodo": "enviarDatosNuevo", data_out:[JSONDataAsistencia, JSONDataTareo]},
                type: "post"
              });
    };

};