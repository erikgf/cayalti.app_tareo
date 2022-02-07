var ModalMensajeComponente = function() {    

      var $label, $cargando,
          $blockui,
          total_registros;

      this.initialize = function() {
      	this.$el = $('<div class="popover-progressbar">');            
      };

      this.initRender = function(_dataRender) {
          this.$el.html(this.template(_dataRender));
          $label = this.$el.find("small");
          $cargando = this.$el.find(".cargando");
          $blockui = $(".blockui");

          $("body").append(this.$el);
          return this;
      };

      this.mostrar = function(){
        $blockui.show();
        this.$el[0].style.display = "block";
        this.$el[0].offsetHeight;
        this.$el[0].classList.add("visible");
      };

      this.esconder = function(){
        $blockui.hide();
        this.$el[0].classList.remove("visible");
        this.$el[0].offsetHeight;
        this.$el[0].style.display = "none";
      };

      this.actualizarLabel = function(label){
        $label.html(label);
      };

      this.mostrarError = function(error){
        var self = this;
        $label.html(error);
        $label.addClass("errorLabel"); 
        $cargando.hide();
        setTimeout(function(){
          self.esconder();
        },4000)
      };

      this.destroy = function(){
        this.$el.remove();
        $label = null;
        $cargando = null;
        $blockui = null;
        this.$el = null;
      };

      this.initialize();
  }