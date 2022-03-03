"use strict";

var Turno = function (data) {
  var self = this,
      storeName = "Turno",
      _DB_HANDLER = DB_HANDLER;
  this.id_turno = null;
  this.descripcion = "";
  this.hora_entrada = "";
  this.hora_salida = "";
  this.idempresa = "";

  this.init = function (data) {
    if (data) {
      var _data$id_turno, _data$descripcion, _data$hora_entrada, _data$hora_salida;

      this.id_turno = (_data$id_turno = data.id_turno) !== null && _data$id_turno !== void 0 ? _data$id_turno : null;
      this.descripcion = (_data$descripcion = data.descripcion) !== null && _data$descripcion !== void 0 ? _data$descripcion : "";
      this.hora_entrada = (_data$hora_entrada = data.hora_entrada) !== null && _data$hora_entrada !== void 0 ? _data$hora_entrada : "";
      this.hora_salida = (_data$hora_salida = data.hora_salida) !== null && _data$hora_salida !== void 0 ? _data$hora_salida : "";
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