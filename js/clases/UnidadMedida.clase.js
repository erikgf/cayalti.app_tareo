"use strict";

var UnidadMedida = function (data) {
  var self = this,
      storeName = "UnidadMedida",
      _DB_HANDLER = DB_HANDLER;

  this.init = function () {
    this.idempresa = VARS.GET_EMPRESA();
  };

  this.insertarPorSincronizacion = function (registros) {
    return $.when(_DB_HANDLER.registrar(storeName, registros));
  };

  this.consultar = function () {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      indexes: "idempresa",
      values: this.idempresa
    }));
  };

  this.limpiar = function () {
    return $.when(_DB_HANDLER.eliminar(storeName, {
      index: "idempresa",
      value: this.idempresa
    }));
  };

  return this.init(data);
};