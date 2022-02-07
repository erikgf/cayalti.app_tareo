var ListaAsistenciaTareoListView = function ($root) {
    var asistentes;

    this.initialize = function($root) {
        this.$el = $root;
        //this.render();
    };

    this.setAsistentes = function(list) {
        asistentes = list;
        this.render();
    };

    this.agregarAsistente =function(asistente){
        asistentes.unshift(asistente);   
        this.$el.html(this.template({asistentes: asistentes, total: asistentes.length}));   
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

    this.destroy = function(){
        this.$el = null;
        asistentes = null;
    };

    this.initialize($root);

};