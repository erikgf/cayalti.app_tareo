var ListaAsistenciaListView = function () {
    var asistentes;

    this.initialize = function() {
        this.$el = $('<div/>');
        this.render();
    };

    this.setAsistentes = function(list) {
        asistentes = list;
        this.render();
    };

    this.agregarAsistente =function(asistente){
        asistentes.unshift(asistente);   
        this.$el.html(this.template({asistentes: asistentes, total: asistentes.length}));   
    };

    this.templateUno = function(asistente){
        return '<li class="table-view-cell cell-'+(asistente.tipo_registro ? "entrada" : "salida")+'">'+
                    '<span data-nombre="'+asistente.nombres_apellidos+'" data-dnipersonal="'+asistente.dni_personal+'" data-numeroacceso="'+asistente.numero_acceso+'" class="btn-eliminar icon icon-trash"></span>'+
                    '<div class="nombre">('+asistente.indice+') '+asistente.dni_personal+' - '+asistente.nombres_apellidos+'</div>'+
                    '<div class="tipo-registro">'+(asistente.tipo_registro ? "ENTRADA" : "SALIDA")+': '+asistente.hora_registro+'</div>'+
                '</li> ';
    };

    this.render = function() {
        if(!asistentes){
            asistentes = [];
        }

        this.$el.html(this.template({asistentes: asistentes, total: asistentes.length}));
        return this;
    };

    this.getAsistentes = function(){
        return asistentes;
    };


    this.removerAsistente = function(objRemover){
        var nuevoAsistentesYaRemovido = [];
        for (var i = 0; i < asistentes.length; i++) {
            var obj = asistentes[i];
            if (obj.dni != objRemover.dni || obj.numero_acceso != objRemover.numero_acceso){
                nuevoAsistentesYaRemovido.push(asistentes[i]);
            }
        };        
        asistentes = nuevoAsistentesYaRemovido;
        return nuevoAsistentesYaRemovido;
    };

    this.destroy = function(){
        this.$el = null;
        asistentes = null;
    };

    this.initialize();

};