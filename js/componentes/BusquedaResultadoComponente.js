var BusquedaResultadoComponente = function(objBusqueda, FrmPadre) {    
      var self;

      this.initialize = function() {
      	this.$el = $('<div>',{class: "busqueda-resultado-container"});       
        self = this;
      };

      this.render = function() {
          this.$el.html(this.template(objBusqueda));
          return this;
      };

      this.destroy = function(){
        this.$el.remove();
        this.$el = null;
        FrmPadre = null;
        self = null;
      };

      this.initialize(objBusqueda);
  }