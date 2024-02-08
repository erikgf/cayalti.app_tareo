"use strict";

var RegistroLaborRendimientoPersonal = function (data) {
  const self = this, _DB_HANDLER = DB_HANDLER;
  const storeName = "RegistroLaborPersonal";
  this.fecha_dia = "";
  this.idempresa = "";
  this.idcampo = "";
  this.dni_usuario = "";
  this.dni_personal = "";
  this.estado_envio = "";

  this.init = function (data) {
    if (data) {
      var _data$fecha_dia, _data$dni_personal, _data$dni_usuario;

      this.fecha_dia = (_data$fecha_dia = data.fecha_dia) !== null && _data$fecha_dia !== void 0 ? _data$fecha_dia : "";
      this.dni_personal = (_data$dni_personal = data.dni_personal) !== null && _data$dni_personal !== void 0 ? _data$dni_personal : "";
      this.dni_usuario = (_data$dni_usuario = data.dni_usuario) !== null && _data$dni_usuario !== void 0 ? _data$dni_usuario : "";
    }

    this.idempresa = VARS.GET_EMPRESA();
  };

  this.getRegistrosDia = function () {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      indexes: "fecha_dia,dni_usuario,idempresa",
      values: [this.fecha_dia, this.dni_usuario, this.idempresa]
    }));
  };

  this.getRegistrosPorRegistroLabor = function ({
    idturno,
    idlabor,
    idcampo
  }) {
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      indexes: "fecha_dia,dni_usuario,idempresa,idcampo,idlabor,idturno",
      values: [this.fecha_dia, this.dni_usuario, this.idempresa, idcampo, idlabor,idturno]
    }));
  };

  this.editarValorLaborRendimientoPersonal = function ({
    valor_rendimiento,
    idcampo,
    idturno,
    idlabor,
    idcaporal,
  }) {
    const objEdicion = {
        valor_rendimiento,
        hora_registro_valor: `${_getHoy()} ${_getHora()}`
    };

    const con_rendimiento= '1';
    return $.when(_DB_HANDLER.actualizar(storeName, "=", "fecha_dia,dni_personal,idempresa,idcampo,idlabor,idturno,con_rendimiento,idcaporal",
      [this.fecha_dia, this.dni_personal,this.idempresa, idcampo, idlabor, idturno, con_rendimiento, idcaporal], null, objEdicion));
  };


  return this.init(data);
};