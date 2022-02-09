const BaseDatosLocal = function() {
    /*
    1.- Crear la bbdd
    2.- Crear la estructura

    otros:
    3.- Limpiar informacion
    4.- Consulta y agregar informacion
    5.- Enviar informacion
    */
    var DB_NOMBRE = "bd_asistencia_labores_cayalti";
    var VERSION = 5;
    var self = this;
    var db;

    this.init = function(){
      const dbconnect = window.indexedDB.open(DB_NOMBRE, VERSION);
      var deferred = $.Deferred(function (d) {
          dbconnect.onupgradeneeded = function(ev) {
            const db = ev.target.result,
                  tx = ev.target.transaction,
                  nuevaVersion = ev.newVersion,
                  viejaVersion = ev.oldVersion;

            for (var i = viejaVersion + 1; i <= nuevaVersion; i++) {
                self["upgradeVersion_"+i](db, tx);
            };
          };
          dbconnect.onsuccess = function(ev){ db = ev.target.result; d.resolve(ev.target.result); };
          dbconnect.onerror = function(ev) { d.reject(ev.target.error.message) };
        });

      DB_HANDLER = this;
      return deferred.promise();
    };

    this.getDB = function(){
      return db;
    };

    this.upgradeVersion_1 = function(db, tx){
      let store;
      let tables = [
                    {  nombre: "Usuario",
                      campos : [
                            { nombre: "idresponsable", unique: true},
                            { nombre: "dni", unique: true},
                            { nombre: "nombres_apellidos"},
                            { nombre: "usuario"},
                            { nombre: "clave"}
                        ]},
                    {  nombre: "Personal",
                      campos : [
                            { nombre: "dni", unique: true},
                            { nombre: "nombres_apellidos"},
                            { nombre: "rol"},
                            { nombre: "idplanilla"}
                        ]},
                    {  nombre: "Turno",
                      campos : [
                            { nombre: "idturno"},
                            { nombre: "descripcion"},
                            { nombre: "hora_entrada"},
                            { nombre: "hora_salida"}
                        ]},   
                    {  nombre: "Campo",
                      campos : [
                            { nombre: "idcampo", unique: true},
                            { nombre: "descripcion"}
                        ]}, 
                    {  nombre: "Actividad",
                      campos : [
                            { nombre: "idactividad", unique: true},
                            { nombre: "descripcion"}
                        ]},
                    {  nombre: "Labor",
                      campos : [
                            { nombre: "idlabor", unique: true},
                            { nombre: "descripcion"},
                            { nombre: "idactividad"}
                        ]},
                   {  nombre: "TipoLabor",
                        campos: [
                            { nombre: "idtipolabor", unique: true},
                            { nombre: "descripcion"}
                        ]},
                    {  nombre: "RegistroDia",
                        campos: [
                            { nombre: "fecha_dia"}
                        ]},
                   {  nombre: "RegistroDiaPersonal",
                        campos: [
                            { nombre: "fecha_dia"},
                            { nombre: "idcampo"},
                            { nombre: "dni_personal"},
                            { nombre: "tipo_registro"}, /*E o S*/
                            { nombre: "numero_acceso"}, /*correlativo de numero de pareado E/S, comenzando desde 0 a N*/
                            { nombre: "hora_registro"},
                            { nombre: "pareado"}, /*defalt 0, cuando hay un E y S (o sea registra un S al mismo numero_acceso, se vuelve 1*/
                            { nombre: "latitud"},
                            { nombre: "longitud"},
                            { nombre: "dni_usuario"},
                            { nombre: "estado_envio"} /*0 noenviado, 1 enviado*/
                        ]},
                    {  nombre: "RegistroLabor",
                        campos: [
                            { nombre: "idlabor"},
                            { nombre: "idcampo"},
                            { nombre: "idturno"},
                            { nombre: "fecha_dia"},
                            { nombre: "hora_registro"},
                            { nombre: "idtipotareo"},
                            { nombre: "dni_usuario"}
                        ]},
                    {  nombre: "RegistroLaborPersonal",
                        campos: [
                            { nombre: "idlabor"},
                            { nombre: "idcampo"},
                            { nombre: "idturno"},
                            { nombre: "fecha_dia"},
                            { nombre: "dni_personal"},
                            { nombre: "hora_registro"},
                            { nombre: "latitud"},
                            { nombre: "longitud"},
                            { nombre: "numero_horas_diurno"},
                            { nombre: "numero_horas_nocturno"},
                            { nombre: "estado_envio"} /*0 noenviado, 1 enviado*/
                        ]},
                    {  nombre: "_Variables_",
                        campos: [
                            { nombre: "nombre_variable"},
                            { nombre: "valor"}
                        ]}
                    ];   

      for (var i = tables.length - 1; i >= 0; i--) {
        const table = tables[i];
        store = db.createObjectStore(table.nombre, { keyPath: 'id', autoIncrement: true });
        for (var j = table.campos.length - 1; j >= 0; j--) {
          const campo = table.campos[j];
          store.createIndex(campo.nombre, campo.nombre, {unique: campo.unique ?? false});
        };
      };
    };

    this.upgradeVersion_2 = function(db, tx){
      let store;
      let tables = [
                    {  nombre: "Usuario"},
                    {  nombre: "Personal"},
                    {  nombre: "Turno"},   
                    {  nombre: "Campo"}, 
                    {  nombre: "Actividad"},
                    {  nombre: "Labor"},
                    {  nombre: "TipoLabor"},
                    {  nombre: "RegistroDia"},
                    {  nombre: "RegistroDiaPersonal"},
                    {  nombre: "RegistroLabor"},
                    {  nombre: "RegistroLaborPersonal"}
            ];   

      for (var i = tables.length - 1; i >= 0; i--) {
        const table = tables[i];
        store = tx.objectStore(table.nombre);
        store.createIndex("idempresa", ["idempresa"]);
      };
    };

    this.upgradeVersion_3 = function(db, tx){
      var store = tx.objectStore("Usuario");
      store.createIndex('usuario,clave', ['usuario','clave']); 

      var store = tx.objectStore("RegistroDia");
      store.createIndex('fecha_dia,idempresa', ['fecha_dia','idempresa']); 
      return;
    };

    this.upgradeVersion_4 = function(db, tx){
      var store = tx.objectStore("RegistroDiaPersonal");
      store.createIndex('fecha_dia,tipo_registro,idempresa', ['fecha_dia','tipo_registro','idempresa']); 

      store = tx.objectStore("RegistroLaborPersonal");
      store.createIndex('fecha_dia,idempresa', ['fecha_dia','idempresa']); 
      
      return;
    };

    this.upgradeVersion_5 = function(db, tx){
      var store 
      store = tx.objectStore("RegistroDiaPersonal");
      store.createIndex('fecha_dia,tipo_registro,dni_usuario,idempresa', ['fecha_dia','tipo_registro','dni_usuario','idempresa']); 
      
      return;
    };
    

    this.registrar = function(storeName, data){
      var transaction = db.transaction(storeName, 'readwrite');
      var store = transaction.objectStore(storeName);
      var idRetornos = [];
      var itemAdded;
      data.forEach(function(el){ 
        itemAdded = store.add(el);
        itemAdded.onsuccess = function(){
          idRetornos.push(event.target.result); 
        };
      });
      
      return $.Deferred(function (d) {
          transaction.oncomplete = function(ev){ ev.id_retornos = idRetornos; d.resolve(ev) };
          transaction.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };

    this.listar = function(storeName, offset){
      const store = db.transaction(storeName, 'readonly').objectStore(storeName);
      const query = store.getAll(null, offset ?? null);

      return $.Deferred(function (d) {
          query.onsuccess = function(ev){ d.resolve(ev.target.result) };
          query.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };

    this.listarFiltro = function(storeName, objKeys, offset){
      const store = db.transaction(storeName, 'readonly').objectStore(storeName);
      const index = store.index(objKeys.indexes);
      const query = index.getAll(objKeys.values, offset ?? null);

      return $.Deferred(function (d) {
          query.onsuccess = function(ev){ d.resolve(ev.target.result) };
          query.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };

    this.listarFiltroBusqueda = function(storeName, objKeys, objBusqueda){
      var store = db.transaction(storeName, 'readonly').objectStore(storeName);
      var index = store.index(objKeys.index);
      var IDBKey = obtenerIDBKey("=", objKeys.value); 
      var query = index.openCursor(IDBKey, "prev");

      var resultSet = [];
      return $.Deferred(function (d) {
          query.onsuccess = function(ev){ 
            var cursor = ev.target.result;
            if (!cursor) {
              d.resolve(resultSet);
              return;
            }

            var cadenaDeBusqueda = "";
            for (var i = 0; i < objBusqueda.key.length; i++) {
              cadenaDeBusqueda = cadenaDeBusqueda+" "+cursor.value[objBusqueda.key[i]];
            };

            if (cadenaDeBusqueda.indexOf(objBusqueda.value) !== -1){
              resultSet.push(cursor.value);
            }
            cursor.continue();
          };

          query.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };

    this.listarCursor = function(storeName, fnSuccess){
      const store = db.transaction(storeName, 'readonly').objectStore(storeName);
      const query = store.openCursor();
      const resultSet = [];

      query.onerror = function(ev) {
        console.error('¡Solicitud fallida!', ev.target.error.message);
      };
      query.onsuccess = function(ev){
        const cursor = ev.target.result;
        if (cursor) {
          resultSet.push(cursor.value);
          cursor.continue();
        } else {
          if (fnSuccess){
            fnSuccess(resultSet);  
          }
          console.log('¡No hay más registros disponibles!');
        }
      };
    };

    this.limpiar = function(storeName){
      var request = db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .clear();

      return $.Deferred(function (d) {
          request.onsuccess = function(ev){ d.resolve(ev.target.result); };
          request.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };

    /*
    this.eliminar = function(storeName, where, key, id1, id2){
      var store = db.transaction(storeName, "readwrite").objectStore(storeName);
      var index = store.index(key);
      var IDBKey = obtenerIDBKey(where, id1, id2); 
      var query = index.openCursor(IDBKey);
      var registrosEliminados = 0;
      return $.Deferred(function (d) {
          query.onsuccess = function(ev){ 
            var cursor = ev.target.result;
            if (!cursor) {
              d.resolve(registrosEliminados);
              return;
            }
            registrosEliminados++;
            cursor.delete();
            cursor.continue();
          };

          query.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };
    */

    this.eliminar = function(storeName, whereKeys, fnRuleDelete){
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      const index = store.index(whereKeys);
      const query = index.openCursor(null);

      if (typeof fnRuleDelete !== 'function'){
        console.error("No se ha definido una regla de eliminación.")
        return;
      }

      var registrosEliminados = 0;
      return $.Deferred(function (d) {
          query.onsuccess = function(ev){ 
            let cursor = ev.target.result;
            if (!cursor) {
              d.resolve(registrosEliminados);
              return; 
            }

            if (fnRuleDelete(cursor.value)){
              registrosEliminados++;
              cursor.delete();
            }
            cursor.continue();
          };

          query.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };

    var obtenerIDBKey = function(where, id1, id2){
      var IDBKey = null;

      switch(where){
        case "=":
          IDBKey = IDBKeyRange.only(id1);
        break;
        case ">=":
          IDBKey = IDBKeyRange.lowerBound(id1);
        break;
        case ">":
          IDBKey = IDBKeyRange.lowerBound(id1, true);
        break;
        case "<=":
          IDBKey = IDBKeyRange.upperBound(id1);
        break;
        case "<":
          IDBKey = IDBKeyRange.upperBound(id1, true);
        break;
        case ">=<=":
          IDBKey = IDBKeyRange.bound(id1, id2);
        break;
        case "><":
          IDBKey = IDBKeyRange.bound(id1, id2, true, true);
        break;
        case "><=":
          IDBKey = IDBKeyRange.bound(id1, id2, true, false);
        break;
        case ">=<":
          IDBKey = IDBKeyRange.bound(id1, id2, false, true);
        break;
      }

      return IDBKey;
    };

    this.eliminarID = function(storeName, id){
      return db.transaction(storeName, "readwrite")
                .objectStore(storeName)
                .delete(id);
    };

    this.getStoresNames = function(){
      return db.objectStoreNames;
    };

    this.actualizar = function(storeName, where, key, id1, id2, objetoActualizar){
      var store = db.transaction(storeName, "readwrite").objectStore(storeName);
      var index = store.index(key);
      var IDBKey = obtenerIDBKey(where, id1, id2); 
      var query = index.openCursor(IDBKey);
      var registrosActualizados = 0;
      return $.Deferred(function (d) {
          query.onsuccess = function(ev){ 
            var cursor = ev.target.result;
            if (!cursor) {
              d.resolve(registrosActualizados);
              return;
            }
            registrosActualizados++;
            var nuevoValor = cursor.value;
            nuevoValor[objetoActualizar.key] = objetoActualizar.value;
            cursor.update(nuevoValor);
            cursor.continue();
          };

          query.onerror = function(ev) { d.reject(ev.target.error.message) };
        });
    };

    return this.init(); 
}

