"use strict";

var Personal = function (data) {
  var self = this,
      storeName = "Personal",
      _DB_HANDLER = DB_HANDLER;
  this.dni = "";
  this.nombres_apellidos = "";
  this.rol = "";
  this.idplanilla = "";

  this.init = function (data) {
    if (data) {
      var _data$dni, _data$nombres_apellid, _data$rol, _data$idplanilla;

      this.dni = (_data$dni = data.dni) !== null && _data$dni !== void 0 ? _data$dni : "";
      this.nombres_apellidos = (_data$nombres_apellid = data.nombres_apellidos) !== null && _data$nombres_apellid !== void 0 ? _data$nombres_apellid : "";
      this.rol = (_data$rol = data.rol) !== null && _data$rol !== void 0 ? _data$rol : "";
      this.idplanilla = (_data$idplanilla = data.idplanilla) !== null && _data$idplanilla !== void 0 ? _data$idplanilla : "";
    }

    this.idempresa = VARS.GET_EMPRESA();
  };

  this.obtenerRegistro = function () {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      "indexes": "dni,idempresa",
      "values": [this.dni, this.idempresa]
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

  this.listar = function () {
    $.when(_DB_HANDLER.listar(storeName)).done(function (e) {
      console.log(e);
    }).fail(function (e) {
      console.error(e);
    });
  };

  return this.init(data);
};