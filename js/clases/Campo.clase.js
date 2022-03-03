"use strict";

var Campo = function (data) {
  var self = this,
      storeName = "Campo",
      _DB_HANDLER = DB_HANDLER;
  this.idcampo = null;
  this.descripcion = "";
  this.idempresa = "";

  this.init = function (data) {
    if (data) {
      var _data$idcampo, _data$descripcion;

      this.idcampo = (_data$idcampo = data.idcampo) !== null && _data$idcampo !== void 0 ? _data$idcampo : null;
      this.descripcion = (_data$descripcion = data.descripcion) !== null && _data$descripcion !== void 0 ? _data$descripcion : "";
    }

    this.idempresa = VARS.GET_EMPRESA();
  };

  this.consultar = function () {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      indexes: "idempresa",
      values: this.idempresa
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