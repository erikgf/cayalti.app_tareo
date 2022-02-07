var ProgressBarComponente = function() {    

      var $label, $progress,
          $blockui,
          total_registros;

      this.initialize = function() {
      	this.$el = $('<div class="popover-progressbar">');            
      };

      this.initRender = function(_dataRender) {
          this.$el.html(this.template(_dataRender));
          $label = this.$el.find("small");
          $progress = this.$el.find("progress");
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

       this.setTotalRegistros = function(_total_registros){
          total_registros = _total_registros;
      };

      this.actualizarPorcentaje = function(descripcion, numero_registros){
        var porcentaje =  parseInt(numero_registros / total_registros * 100);
        $label.html(descripcion+": "+porcentaje+"%");
        $progress.val(porcentaje);
      };

      this.completarPorcentaje = function(descripcion){
        $label.html(descripcion+": 100%");
        $progress.val(100);
        $progress[0].style["backgroundColor"] = "#4dab1a";
      };

      this.setErrorState = function(errorMessage){
        var self = this;
        $label.html("Error: "+errorMessage).addClass("errorLabel");
        $progress.val(100);
        //$progress[0].style["backgroundColor"] = "#f92828";
      };

      this.destroy = function(){
        this.$el.remove();
        $label = null;
        $progress = null;
        $blockui = null;
        this.$el = null;
      };

      this.initialize();
  }