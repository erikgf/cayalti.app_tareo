var ListaRendimientosTareoListView = function ($root) {
    var registros;

    this.initialize = function($root) {
        this.$el = $root;
        //this.render();
    };

    this.setRegistros = function(list) {
        registros = list;
        this.render();
    };

    this.agregarRegistros =function(registro){
        registros.unshift(registro);   
        this.$el.html(this.template({registros: registros, total: registros.length}));   
    };

    this.render = function() {
        if(!registros){
            registros = [];
        }

        this.$el.html(this.template({registros: registros, total: registros.length}));
        return this;
    };

    this.getRegistros = function(){
        return registros;
    };

    this.destroy = function(){
        this.$el = null;
        registros = null;
    };

    this.initialize($root);

};