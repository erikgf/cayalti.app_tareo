"use strict";

var Labor = function (data) {
  var self = this,
      storeName = "Labor",
      _DB_HANDLER = DB_HANDLER;
  this.idlabor = null;
  this.idactividad = null;
  this.descripcion = "";

  this.init = function (data) {
    if (data) {
      var _data$idlabor, _data$idactividad, _data$descripcion;

      this.idlabor = (_data$idlabor = data.idlabor) !== null && _data$idlabor !== void 0 ? _data$idlabor : null;
      this.idactividad = (_data$idactividad = data.idactividad) !== null && _data$idactividad !== void 0 ? _data$idactividad : null;
      this.descripcion = (_data$descripcion = data.descripcion) !== null && _data$descripcion !== void 0 ? _data$descripcion : "";
    }

    this.idempresa = VARS.GET_EMPRESA();
  };

  this.getLabor = function () {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      indexes: "idlabor",
      values: this.idlabor
    }));
  };

  this.consultar = function () {
    return $.when(_DB_HANDLER.listar(storeName));
  };

  this.consultarPorActividad = function () {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      indexes: "idactividad,idempresa",
      values: [this.idactividad, this.idempresa]
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