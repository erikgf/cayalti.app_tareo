var SincronizadorClase = function (servicio, servicio_web, tablasCargar) {
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

    this.initialize = function(){
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
    }

    var UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        };

    var insertarActualizarDatosBase = function(datos){
        var total_registros_afectados  = 0,
            fnError = function(e){
                progressBar.setErrorState(e.message);
                setTimeout(function(){
                  progressBar.esconder();
                  progressBar.destroy();
                  progressBar = null;
                }, 2000);
            };

        var dataInsert = arregloTablas,
            totalInserts = dataInsert.length,
            strInsertUltimo = dataInsert[dataInsert.length - 1],
            lastStrInsert = "";
            indexDataInsert = 0,
            strDataInsert = dataInsert[indexDataInsert],
            topeVariablesRegistros = 500,
            auxIndiceLimite = 0,
            lnDatos = 0;

        var fnProcesarXHR = function(_datos, _nombreDatos, _final){ 
            var subdividiendo = false,
                _cantColumnas, _cantFilas,
                limpiarTodo = true;
            
            lnDatos  = _datos.length;

            if (lastStrInsert == _nombreDatos){
                limpiarTodo = false;    
            }

            if (lnDatos > 0){
                _cantColumnas = Object.keys(_datos[0]).length;
                _cantFilas = lnDatos;
                totalVariablesUsar =  _cantFilas * _cantColumnas;
            } else {
                totalVariablesUsar = 0;
            }

            if (totalVariablesUsar > topeVariablesRegistros){
                auxIndiceLimite = parseInt(topeVariablesRegistros/_cantColumnas);
                _datos = _datos.slice(0, auxIndiceLimite);
                datos[strDataInsert.toLowerCase()] = datos[strDataInsert.toLowerCase()] .slice(auxIndiceLimite , lnDatos);
                subdividiendo = true;
            } else {
                auxIndiceLimite = 0;
            }


            $.when(servicio["insertar"+_nombreDatos](_datos, limpiarTodo)
                    .done(function(res){                    
                        var nuevosDatos;

                        if(subdividiendo){
                            strDataInsert= dataInsert[indexDataInsert];
                            nuevosDatos = datos[strDataInsert.toLowerCase()];
                        } else{
                            indexDataInsert++;
                            if (indexDataInsert <= totalInserts - 1){
                                strDataInsert= dataInsert[indexDataInsert];
                                nuevosDatos = datos[strDataInsert.toLowerCase()];
                            }
                        }

                        total_registros_afectados += res.rowsAffected;
                        progressBar.actualizarPorcentaje("Actualizando "+(_nombreDatos.toLowerCase()), total_registros_afectados);  
                        if (_final == true && subdividiendo == false){
                            self.fin(total_registros_afectados);
                            dataInsert = null;
                            strInserUltimo = null;
                            strDataInsert = null;
                            indexDataInsert  = 0;
                            return;
                        }

                        lastStrInsert = _nombreDatos;
                        fnProcesarXHR( nuevosDatos, strDataInsert, strDataInsert == strInsertUltimo);
                    })
                    .fail(fnError)
                );
        };

        try{
            fnProcesarXHR(datos[strDataInsert.toLowerCase()], strDataInsert, strDataInsert == strInsertUltimo);
        }catch(e){
            console.log(e);
            self.fin(0, e);
        }

        
    }

    this.actualizarDatos = function(){
        /*Conectando....*/
        var fnConfirm = function(){
            if (progressBar){
                progressBar.destroy();
            }
            progressBar = new ProgressBarComponente().initRender({titulo: TITULO, texto_informacion: TEXTO_INFORMACION,valor :"0"});
            progressBar.mostrar();

            $.when( servicio_web[ES_DIARIO ? "sincronizarDiarioDatos" : "actualizarDatos"]()
                    .done( function(r){                 
                        if (r.rpt){         
                            progressBar.setTotalRegistros(r.data.contador_registros);
                            if (ES_DIARIO){
                                self.insertarSincroDiarioDatos(r.data);
                            }else{
                                self.insertarActualizarDatos(r.data);   
                            }
                            
                        }
                    })
                    .fail(function(error){
                        self.destroy();
                        alert(ERROR_NO_CONNECTION);
                        console.error(error);
                    })
            ); 
        };

      
        fnConfirm();    
    };

    this.insertarActualizarDatos = function(datos){
        insertarActualizarDatosBase(datos);
    };

    this.insertarSincroDiarioDatos = function(datos){
        /*first  remove stuff (es decir, todos los DNI, no pareados*/
        if (datos.cadena_dni == null || datos.cadena_dni == ""){
            if (datos.contador_registros > 0){
                insertarActualizarDatosBase(datos);
            } else {
                this.fin(0);
            }
            return;
        }
        
        $.whenAll({
            RQRemoverEntradasPrevias: servicio.removerSincroEntradasPrevias(datos.cadena_dni)
        })
        .done(function(r){
            insertarActualizarDatosBase(datos);
        })
        .fail(UIFail);
    };

    this.fin = function(cantidadRegistros, errorString){
        if (errorString != undefined){
            progressBar.completarPorcentaje(errorString);
        } else {
            localStorage.setItem(VARS.NOMBRE_STORAGE+"_FECHA",getHoy());
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