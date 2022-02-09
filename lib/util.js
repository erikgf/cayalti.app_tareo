// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
function Deferred() {
    // update 062115 for typeof
    if (typeof(Promise) != 'undefined' && Promise.defer) {
        //need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
        return Promise.defer();
    } else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
        //need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
        return PromiseUtils.defer();
    } else {
        /* A method to resolve the associated Promise with the value passed.
         * If the promise is already settled it does nothing.
         *
         * @param {anything} value : This value is used to resolve the promise
         * If the value is a Promise then the associated promise assumes the state
         * of Promise passed as value.
         */
        this.resolve = null;

        /* A method to reject the assocaited Promise with the value passed.
         * If the promise is already settled it does nothing.
         *
         * @param {anything} reason: The reason for the rejection of the Promise.
         * Generally its an Error object. If however a Promise is passed, then the Promise
         * itself will be the reason for rejection no matter the state of the Promise.
         */
        this.reject = null;

        /* A newly created Promise object.
         * Initially in pending state.
         */
        this.promise = new Promise(function(resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this));
        Object.freeze(this);
    }
};

function resultSetToArray(sqlRS){
  var arrayRetorno = [];
  for (var i = 0, len = sqlRS.length; i < len; i++) {
     arrayRetorno.push(sqlRS.item(i));
  }

  return arrayRetorno;
};

function _getHoy(){
    var d = new Date(),
      anio = d.getYear()+1900,
      mes = d.getMonth()+1,
      dia = d.getDate();

      mes = (mes >= 10)  ? mes : ('0'+mes);
      dia = (dia >= 10)  ? dia : ('0'+dia);

    return anio+"-"+mes+"-"+dia;
};


function _getHora(){
    var d = new Date(),
      hora = d.getHours(),
      min = d.getMinutes(),
      seg = d.getSeconds();

      hora = (hora >= 10)  ? hora : ('0'+hora);
      min = (min >= 10)  ? min : ('0'+min);
      seg = (seg >= 10)  ? seg : ('0'+seg);

    return hora+":"+min+":"+seg;
};

function _formateoFecha(fechaFormateoYanqui){
        var arrTemp;

        if (fechaFormateoYanqui == "" || fechaFormateoYanqui == null){
            return "";
        }

        arrTemp = fechaFormateoYanqui.split("-");
        return arrTemp[2]+"-"+arrTemp[1]+"-"+arrTemp[0];
};


function _armarHora(horas, minutos,segundos){
        horas = (horas >= 10)  ? horas : ('0'+horas);
        minutos = (minutos >= 10)  ? minutos : ('0'+minutos);
        segundos = (segundos >= 10)  ? segundos : ('0'+segundos);
        return  horas+":"+minutos+":"+segundos;
};

function _UIFail(firstFail, name) {
    console.log('Fail for: ' + name);
    console.error(firstFail);
};

function preDOM2DOM($contenedor, listaDOM){
    /*Función que recibe un contenedor donde buscar elementos DOM, una lista con sus respectivos nombres de id y los objetos en que se convertirán, la
        lista debe estar en el orden adecuado para que se asigne automáticamente. 
      Devuelve el DOM.*/
    var DOM = {}, preDOM, cadenaFind = "", numeroDOMs = listaDOM.length,
        tmpEntries = [], tmpObjectName = [];

    for (var i = numeroDOMs - 1; i >= 0; i--) {
        tmpEntries = Object.entries(listaDOM[i])
        cadenaFind += (tmpEntries[0][1]+",");
        tmpObjectName[i] = tmpEntries[0][0];
    };

    cadenaFind = cadenaFind.substr(0,cadenaFind.length-1);

    preDOM = $contenedor.find(cadenaFind);

    for (var i = numeroDOMs - 1; i >= 0; i--) {
       DOM[tmpObjectName[i]] = preDOM.eq(i);
    };

    return DOM;
};


$.whenAll = function (deferreds) {
    function isPromise(fn) {
        return fn && typeof fn.then === 'function' &&
          String($.Deferred().then) === String(fn.then);
    }
    var d = $.Deferred(),
        keys = Object.keys(deferreds),
        args = keys.map(function (k) {
            return $.Deferred(function (d) {
                var fn = deferreds[k];

                (isPromise(fn) ? fn : $.Deferred(fn))
                    .done(d.resolve)
                    .fail(function (err) { d.reject(err, k); })
                ;
            });
        });

    $.when.apply(this, args)
        .done(function () {
            var resObj = {},
                resArgs = Array.prototype.slice.call(arguments);
            resArgs.forEach(function (v, i) { resObj[keys[i]] = v; });
            d.resolve(resObj);
        })
        .fail(d.reject);

    return d;
};


function setFX(esMovil){
    var NOMBRE_APP = VARS.NOMBRE_APP;

    if (esMovil){
        /*Alert*/
        alert = function(txtMensaje, fnCallBack){
            navigator.notification.alert(txtMensaje, (typeof fnCallBack == 'function') ? fnCallBack : null, NOMBRE_APP, "LISTO");
        };
        /*Confirm*/
        confirmar = function(txtMensaje, onConfirm, onRechaz){
           var fnOK = function(index){
                if (typeof onConfirm == 'function'){
                    if (index == 1){
                      onConfirm();
                    } else {
                      if (typeof onRechaz == 'function'){
                        onRechaz();
                      }
                    }
                } else {
                    console.error("Función de confirmación inválida.");
                }
            };
           navigator.notification.confirm(txtMensaje, fnOK, NOMBRE_APP, ["ACEPTAR", "CANCELAR"]);
        };

        getDevice = function(){
            return device.uuid;
        };

        checkgps = function(onGranted, onDenied){
              var permissions = cordova.plugins.permissions;

              var list = [
                  permissions.ACCESS_COARSE_LOCATION,
                  permissions.ACCESS_FINE_LOCATION
                ];

              function error() {
                alert("Esta aplicación necesita del GPS para funcionar correctamente.");
              };
               
              function success( status ) {
                if( !status.hasPermission ) {
                  permissions.requestPermissions(
                    list,
                    function(status) {
                      if( !status.hasPermission ) {
                        if (onDenied != null && (typeof onDenied == 'function')){
                          onDenied();
                        } else {
                          error();
                        }
                      } else {
                        if (onGranted != null && (typeof onGranted == 'function')){
                          onGranted();
                        }
                        
                      }
                    },
                    error);
                } else {
                  if (onGranted != null && (typeof onGranted == 'function')){
                    onGranted();
                  }
                }
              };

              permissions.hasPermission(list, success, null);
        };
        
        /*Geoposition*/
        geoposicionar = function(onSuccess, onError){
           var fnOK = function(posicion){
                    if (typeof onSuccess == 'function'){
                        onSuccess(posicion);
                    } else {
                        console.error("Función de éxito inválida.");
                    }
                },
                fnNotOK = function(error){
                    showError(error);
                    if (typeof onSuccess == 'function'){
                        onSuccess();
                    } else {
                        console.error("Función de error inválida.");
                    }
                },
                showError = function(error){
                    console.error(error);
                    alert(error.message);
                    /*
                    switch(error.code) {
                            case error.PERMISSION_DENIED:
                              alert("User denied the request for Geolocation.");
                              break;
                            case error.POSITION_UNAVAILABLE:
                              alert("Location information is unavailable.");
                              break;
                            case error.TIMEOUT:
                              alert("The request to get user location timed out.");
                              break;
                            case error.UNKNOWN_ERROR:
                              alert("An unknown error occurred.");
                              break;
                    }
                    */
                };

           if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(fnOK, fnNotOK, { enableHighAccuracy: true, maximumAge: 30000,timeout: 30000 }); 
            } else {
                alert("No tengo la función de geolocación disponible en este dispositivo.");
            }
        };

        isActivatedGPS = function(onSuccess, onError){
          CheckGPS.check(onSuccess,onError);
        }

        barcodeScan = function(onSuccess, onError){
            var fnOK = function(result){
                    if (typeof onSuccess == 'function'){
                        onSuccess(result);
                    } else {
                        console.error("Función de éxito inválida.");
                    }
                },
                fnNotOK = function(error){
                    showError(error);
                    if (typeof onSuccess == 'function'){
                        onSuccess();
                    } else {
                        console.error("Función de error inválida.");
                    }
                },
                showError = function(error){
                  alert("Scanning failed: " + error);
                };

            if (cordova.plugins.barcodeScanner){
                cordova.plugins.barcodeScanner.scan(fnOK, fnNotOK, 
                        {
                          preferFrontCamera : false, // iOS and Android
                          showFlipCameraButton : true, // iOS and Android
                          showTorchButton : true, // iOS and Android
                          torchOn: true, // Android, launch with the torch switched on (if available)
                          saveHistory: false, // Android, save scan history (default false)
                          prompt : "Coloque un código de barras sobre el área de escaneo.", // Android
                          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                          formats : "QR_CODE,CODE_39,PDF_417,CODE_128", // default: all but PDF_417 and RSS_EXPANDED
                          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                          disableSuccessBeep: false // iOS and Android
                        }); 
            } else {
                alert("No tengo la función de LECTOR DE CÓDIGO DE BARRAS disponible en este dispositivo.");
            } 
        };

        checkConexion = function(){
          var networkState = navigator.connection.type,
              states = {};
            states[Connection.UNKNOWN]  = 'Conexión Desconocida';
            states[Connection.ETHERNET] = 'Conexión Ethernet';
            states[Connection.WIFI]     = 'Conexión WiFi';
            states[Connection.CELL_2G]  = 'Conexión 2G';
            states[Connection.CELL_3G]  = 'Conexión 3G';
            states[Connection.CELL_4G]  = 'Conexión 4G';
            states[Connection.CELL]     = 'Conexión generica';
            states[Connection.NONE]     = 'Sin conexión red';
          return {online: (networkState != Connection.NONE), estados: this.states};
        };

        checkActualizar = function(){
          var updateUrl = VARS.SERVER+"/version.app.labores.xml";
          window.AppUpdate.checkAppUpdate(function(e){
            console.log(e);
          }, function(e){
            console.error(e);
          }, updateUrl);
        };

        checkSim = function(){
             var simInfosuccessCallback = function(result) {
                  if (result != null && result != '') {
                    if (result.cards.length <= 0){
                      alert("NO HAY O NO TENGO PERMISOS PARA VER TARJETAS SIM VÁLIDAS");
                      return;
                    }
                    for (var i = 0; i < result.cards.length; i++) {
                      var card = result.cards[i];
                      if (card.deviceId != undefined && card.deviceId && card.deviceId != ""){
                        var sim = {
                          NUMERO: DATA_NAV.usuario.numero,
                          IMEI : card.deviceId 
                        };

                        VARS.SIM = sim;
                        break;
                      }
                    };
                  }
                },
                hasPermissionSuccessCallback = function(result) {
                    if (result) {
                        window.plugins.sim.getSimInfo(simInfosuccessCallback, errorCallback);
                    } else {
                        requestReadPermission();
                    }
                },
                requestReadPermission = function() {
                    window.plugins.sim.requestReadPermission(requestSuccessCallback, errorCallback);
                },
                denyCallBack = function() {
                    alert("La aplicación necesita de acceso a la SIM del teléfono para su funcionamieneto correcto.");
                }, 
                errorCallback = function(error) {
                    alert(error);
                }, 
                hasReadPermission = function() {
                    window.plugins.sim.hasReadPermission(hasPermissionSuccessCallback, errorCallback);
                }
                requestSuccessCallback = function(result) {
                    if (result) {
                        hasReadPermission();
                    } else {
                      denyCallBack();
                    }
                };

               hasReadPermission();
        };

    } else {
        /*Alert*/
        confirmar = function(txtMensaje, onConfirm, onRechaz){
            var rpta = confirm(txtMensaje);
            if (rpta){
                if ((typeof onConfirm == 'function')){
                    onConfirm();
                }else {
                    console.error("Función de confirmación inválida.");
                }
            } else {
              if (typeof onRechaz == 'function'){
                onRechaz();
              }
            }
        };

        getDevice = function(){
            return navigator.userAgent.substr(0,30);
        };

        checkgps = function(onGranted, onDenied){
            navigator.permissions.query({name:'geolocation'}).then(function(result) {
                switch(result.state){
                    case "granted":
                    if ((typeof onGranted == 'function')){
                      onGranted();
                    }
                    break;
                    case "denied":
                    onDenied();
                    break;
                    default:
                    break;
                }
            });
        };

        geoposicionar = function(onSuccess, onError){
           var fnOK = function(posicion){
                    if (typeof onSuccess == 'function'){
                        onSuccess(posicion);
                    } else {
                        console.error("Función de éxito inválida.");
                    }
                },
                fnNotOK = function(error){
                    showError(error);
                    if (typeof onSuccess == 'function'){
                        onSuccess();
                    } else {
                        console.error("Función de error inválida.");
                    }
                },
                showError = function(error){
                    switch(error.code) {
                            case error.PERMISSION_DENIED:
                              alert("User denied the request for Geolocation.");
                              break;
                            case error.POSITION_UNAVAILABLE:
                              alert("Location information is unavailable.");
                              break;
                            case error.TIMEOUT:
                              alert("The request to get user location timed out.");
                              break;
                            case error.UNKNOWN_ERROR:
                              alert("An unknown error occurred.");
                              break;
                    }
                };

            if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(fnOK, fnNotOK, { enableHighAccuracy: true }); 
            } else {
                alert("No tengo la función de geolocación disponible en este dispositivo.");
            }        
        };

        isActivatedGPS = function(onSuccess, onError){
          onSuccess();
          return;
        }

        barcodeScan = function(onSuccess, onError){
           alert("No tengo la función de LECTOR DE CÓDIGO DE BARRAS disponible en este dispositivo.");
        };

        checkConexion = function(){
          return {online: navigator.onLine, estados: null};
        };

        checkActualizar = function(){
           return;
        };

        checkSim = function(){
          return;
        };
    }
};


Handlebars.registerHelper("indexer", function(index) {
    return index + 1;
});

Handlebars.registerHelper("indexerReverse", function(total, index) {
    return total - index;
});


Handlebars.registerHelper("ceros", function(n) { 
    return Util.completarCeros(n,6);
});

Handlebars.registerHelper('if_', function (v1, operator, v2, options) {
    switch (operator) {
      case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
      return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
      return options.inverse(this);
    }
});