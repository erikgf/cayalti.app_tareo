"use strict";

var Usuario = function (data) {
  var self = this,
      storeName = "Usuario",
      _DB_HANDLER = DB_HANDLER;
  this.idresponsable = null;
  this.nombres_apellidos = "";
  this.numero_documento = "";
  this.idempresa = "";

  this.init = function (data) {
    if (data) {
      var _data$idresponsable, _data$nombres_apellid, _data$numero_document;

      this.idresponsable = (_data$idresponsable = data.idresponsable) !== null && _data$idresponsable !== void 0 ? _data$idresponsable : null;
      this.nombres_apellidos = (_data$nombres_apellid = data.nombres_apellidos) !== null && _data$nombres_apellid !== void 0 ? _data$nombres_apellid : "";
      this.numero_documento = (_data$numero_document = data.numero_documento) !== null && _data$numero_document !== void 0 ? _data$numero_document : "";
    }

    this.idempresa = VARS.GET_EMPRESA();
  };

  this.iniciarSesion = function (usuario, password) {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      indexes: "usuario,clave,idempresa",
      values: [usuario.toUpperCase(), password.toUpperCase(), this.idempresa]
    }));
  };

  this.insertarPorSincronizacion = function (registros) {
    return $.when(_DB_HANDLER.registrar(storeName, registros));
  };

  this.limpiar = function () {
    return $.when(_DB_HANDLER.eliminar(storeName, {
      index: "idempresa",
      value: this.idempresa
    }));
  };

  return this.init(data);
};