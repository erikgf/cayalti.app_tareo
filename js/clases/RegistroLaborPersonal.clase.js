"use strict";

var RegistroLaborPersonal = function (data) {
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
      values: [this.fecha_dia, this.dni_usuario, this.idempresa, idcampo, idlabor, idturno]
    }));
  };

  this.registrarMultiple = function ({
    arreglo_personal,
    idturno,
    idlabor,
    idcampo,
    numero_horas_diurno,
    numero_horas_nocturno,
    objLatitudLongitud,
    idregistrolabor,
    con_rendimiento,
    idcaporal,
    valor_tareo,
    id_unidad_medida
  }) {

    var objNuevoRegistros = arreglo_personal.map(function(item){
	      var nuevoItem = Object.assign({}, item);
        nuevoItem.dni_usuario = self.dni_usuario;
        nuevoItem.fecha_dia =  self.fecha_dia;
        nuevoItem.idempresa =  self.idempresa;
        nuevoItem.idturno =  idturno;
        nuevoItem.idlabor =  idlabor;
        nuevoItem.idcampo =  idcampo;
        nuevoItem.con_rendimiento = con_rendimiento;
        nuevoItem.valor_tareo = valor_tareo;
        nuevoItem.id_unidad_medida = id_unidad_medida;
        nuevoItem.numero_horas_diurno = numero_horas_diurno;
        nuevoItem.numero_horas_nocturno = numero_horas_nocturno;
        nuevoItem.latitud = objLatitudLongitud.latitud;
        nuevoItem.longitud = objLatitudLongitud.longitud;
        nuevoItem.idregistrolabor = idregistrolabor;
    	  nuevoItem.estado_envio = "0";
        nuevoItem.valor_rendimiento = "";
        nuevoItem.idcaporal = idcaporal;

	      return nuevoItem;
    });
    return $.when(_DB_HANDLER.registrar(storeName, objNuevoRegistros));

  };

  this.eliminarRegistrosDiaByIdRegistroLabor = function ({
    idregistrolabor
  }) {
    return $.when(_DB_HANDLER.eliminar(storeName, {
      index: "idregistrolabor",
      value: parseInt(idregistrolabor)
    }, objRegistro => {
      return true;
    }));
  };

  this.eliminarRegistroLabor = function () {
    return $.when(_DB_HANDLER.eliminar(storeName, {
      index: "idempresa",
      value: [this.idempresa]
    }, objRegistro => {
      return objRegistro.fecha_dia === this.fecha_dia;
    }));
  };

  this.eliminarRegistroLaborPersonalFecha = function () {
    return $.when(_DB_HANDLER.eliminar(storeName, {
      index: "idempresa",
      value: [this.idempresa]
    }, objRegistro => {
      return objRegistro.fecha_dia === this.fecha_dia;
    }));
  };

  this.eliminarRegistroLaborPersonal = function ({
    idlabor,
    idcampo,
    idturno,
    con_rendimiento, 
    idcaporal
  }) {
    return $.when(_DB_HANDLER.eliminar(storeName, {
      index: "fecha_dia,dni_personal,idlabor,idcampo,idturno,idempresa",
      value: [this.fecha_dia, this.dni_personal, idlabor, idcampo, idturno, this.idempresa]
    }, (objRegistro) => {
      return objRegistro.con_rendimiento == con_rendimiento &&
              objRegistro.idcaporal == idcaporal;
    }));
  };

  this.obtenerRegistrosTareo = function () {
    this.estado_envio = "0";
    return $.when(_DB_HANDLER.listarFiltro(storeName, {
      "indexes": "fecha_dia,estado_envio,idempresa",
      "values": [this.fecha_dia, this.estado_envio, this.idempresa]
    }));
  };

  this.editarNumHorasLaborPersonal = function ({
    numero_horas_diurno,
    numero_horas_nocturno,
    idcampo,
    idlabor,
    idturno
  }) {
    var objEdicion;

    if (numero_horas_diurno == -1) {
      objEdicion = {
        numero_horas_nocturno: numero_horas_nocturno
      };
    } else {
      objEdicion = {
        numero_horas_diurno: numero_horas_diurno
      };
    }

    return $.when(_DB_HANDLER.actualizar(storeName, "=", "fecha_dia,dni_personal,idlabor,idcampo,idturno,idempresa", [this.fecha_dia, this.dni_personal, idlabor, idcampo, idturno, this.idempresa], null, objEdicion));
  };

  this.marcarRegistrosTareoEnviados = function ({
    estado_envio
  }) {
    return $.when(_DB_HANDLER.actualizar(storeName, "=", "fecha_dia,idempresa", [this.fecha_dia, this.idempresa], null, {
      estado_envio: estado_envio
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