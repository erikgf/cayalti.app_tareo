const Sincronizador = function (tablasCargar) {
    /*params*/
    var self = this,
        arregloTablas = tablasCargar == undefined ? [] : tablasCargar,
        progressBar,
        getHoy = _getHoy,
        ES_DIARIO = false,
        ERROR_NO_CONNECTION = "Ha ocurrido un error al conectarme al servidor.",
        ERROR_NO_REGISTROS = "No hay registros que actualizar",
        OK_TEXT = "¡Listo!",
        TITULO = "Sincronizando",
        TEXTO_INFORMACION = "Conectando...";

    var empresaSeleccionada = "";
    var storesNoEliminables = ["RegistroDia", "RegistroDiaPersonal", "RegistroLabor", "RegistroLaborPersonal"];
    var callbackFinish = null;

    this.initialize = function(){
        empresaSeleccionada = localStorage.getItem(VARS.NOMBRE_STORAGE+"_EMPRESA");
        return this;
    };

    this.setTitulo = function(titulo){
        TITULO = titulo;
    };

    this.setTablas = function(tablasCargar){
        arregloTablas = tablasCargar;
    };

    this.esDiario = function(es_diario){
        ES_DIARIO = es_diario;
    };

    this.setCallBackFinish = function(_callback){
        callbackFinish = _callback;
    };

    this.sincronizarDatos = function(){
        /*Conectando....*/
        var fnConfirm = function(){
            if (progressBar){
                progressBar.destroy();
            }
            progressBar = new ProgressBarComponente().initRender({titulo: TITULO, texto_informacion: TEXTO_INFORMACION,valor :"0"});
            progressBar.mostrar();

            new ServicioWeb().sincronizarDatos()
                .done( function(r){                 
                    if (r.rpt){         
                        progressBar.setTotalRegistros(r.data.contador_registros);
                        self.limpiarDatosParaInsercion(r.data)
                            .done(function(resultado){
                                self.insertarDatos(r.data);
                            })
                            .fail(function(error){
                                self.destroy();
                                alert(ERROR_NO_CONNECTION);
                                console.error(error);
                            })
                    } else {
                        self.destroy();
                        alert(r.msj);
                        console.error(r.msj);      
                    }
                })
                .fail(function(error){
                    self.destroy();
                    alert(ERROR_NO_CONNECTION);
                    console.error(error);
                });
        };

      
        fnConfirm();    
    };

    this.limpiarDatosParaInsercion = function(datos){
        var reqLimpiar = {},
            storeNames = DB_HANDLER.getStoresNames();

        for (var i = storeNames.length - 1; i >= 0; i--) {
            var storeName = storeNames[i];
            if (window[storeName] == undefined || storesNoEliminables.includes(storeName)){
                continue;
            }
            reqLimpiar["limpiar"+storeName] = new window[storeName]().limpiar();
        };

        return $.whenAll(reqLimpiar);
    };

    this.insertarDatos = function(datos){
        var indiceStores = 0;
        var total_registros_afectados = 0;
        var cantidadArregloTablas = arregloTablas.length;
                        
        var fnProcesarXHR = function(storeName){
            let dataStore;
            let StoreName;
            if (datos[storeName] == undefined){
                self.fin(total_registros_afectados);
                return;
            }

            dataStore = datos[storeName];
            StoreName = window[storeName];
            if (StoreName === undefined ){
                console.error("La CLASE del store "+storeName+" no está declarada.");
                self.destroy();
                return;
            }

            new StoreName().insertarPorSincronizacion(dataStore)
                .done(function(){
                    total_registros_afectados += dataStore.length;
                    progressBar.actualizarPorcentaje("Actualizando "+ storeName, total_registros_afectados);  
                    indiceStores++;
                    fnProcesarXHR(arregloTablas[indiceStores]);
                    return;
                
                    //self.fin(total_registros_afectados);
                })
                .fail(function(error){
                    self.destroy();
                    alert(error);    
                    console.error(error);
                });
        };

        fnProcesarXHR(arregloTablas[indiceStores]);
    };

    this.fin = function(cantidadRegistros, errorString){
        if (errorString != undefined){
            progressBar.completarPorcentaje(errorString);
        } else {
            if (callbackFinish && typeof callbackFinish === 'function'){
                callbackFinish();
            }
            progressBar.completarPorcentaje(cantidadRegistros == "0" ? ERROR_NO_REGISTROS : OK_TEXT);   
        }
        //renderLblEnviar(0,0);
        setTimeout(function(){
            self.destroy();
        },1300);
    };

    this.destroy = function(){
        if (progressBar){
            progressBar.esconder();
            progressBar.destroy();
            progressBar = null; 
        }
        self = null;
    };

    this.initialize();
};