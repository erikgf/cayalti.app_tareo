var ListaAsignacionesTareoListView = function ($root, idturno) {
    var asignaciones;

    this.initialize = function($root) {
        this.$el = $root;
        //this.render();
    };

    this.setAsistentes = function(list) {
        asignaciones = list;
        this.render();
    };

    this.agregarAsistente =function(asistente){
        asignaciones.unshift(asistente);   
        this.$el.html(this.template({idturno: idturno, asignaciones: asignaciones, total: asignaciones.length}));   
    };

    this.render = function() {
        if(!asignaciones){
            asignaciones = [];
        }

        this.$el.html(this.template({idturno: idturno, asignaciones: asignaciones, total: asignaciones.length}));
        return this;
    };

    this.getAsistentes = function(){
        return asignaciones;
    };

    this.destroy = function(){
        this.$el = null;
        asignaciones = null;
    };

    this.initialize($root);

};