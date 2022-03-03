var ModalPickerComponente = function() {    
/*
      var $label, $cargando,
          $blockui,
          total_registros;
          */
      var $txtFilter;
      var localData = [];

      this.activateCallBack = false;
      this.$inputTextToFill = null;
      this.onItemClicked = function(itemData){ console.log ("Object Clicked :", itemData); };

      this.initialize = function() {
      	this.$el = $(`<div class="modal-new"/>`);
        $("body").append(this.$el);
        this.setEventos();

        return this;
      };

      this.setOnItemClicked = function(fnOnItemClicked){
        this.onItemClicked = fnOnItemClicked;
      };

      this.setActivateCallBack = function(activateCallBack){
        this.activateCallBack = activateCallBack;
      };

      this.setInputTextToFill = function($inputTextToFill){
        this.$inputTextToFill = $inputTextToFill;
      };

      this.template = function(data){
        return `<div class="modal-new-content">
                    <div class="modal-new-header">
                      <h4 clasS="modal-new-header-title">${data.title}</h4>
                      <span class="modal-new-close">&times;</span>
                      <div>
                        <input type="search" placeholder="Buscar..."  class="modal-new-filter"/>
                      </div>
                    </div>
                    <div class="modal-new-body">
                    <ul class="table-view" style="font-size: .9em;"></ul>
                  </div>`;
      };

      this.templateList = function(items){
        if (items.length === 0){
          return '<p><i>No hay registros que mostrar.</i></p>';
        }

        var itemsNuevos = items.map(function(item){
            return `<li data-codigo="${item.codigo}" data-description="${item.descripcion}" class="table-view-cell optionselectable">
                      <a class="navigate-right">
                        ${item.descripcion}
                      </a>
                    </li>`;
        });

        return itemsNuevos;
      };

      this.setEventos = function(){
        var self = this;
        this.$el.on("click", ".modal-new-close", function(){
          self.hide();
        });

        this.$el.on("keyup", ".modal-new-filter", function(){
          self.search(this.value);
        }); 

        this.$el.on("click", "li.optionselectable", function(e){
          var dataset = this.dataset;
          self.choose(dataset.codigo, dataset.description);
        });
      };

      this.render = function(data) {
        var self = this;
        localData = Object.assign([], data.items);
        this.$el.html(this.template(data)).addClass("active");
        setTimeout(function(){
          self.$el.find(".modal-new-filter").focus();
        },330);

        if (data.$input){
          this.setInputTextToFill(data.$input);
        }

        if (data.activateCallBack){
          this.setActivateCallBack(data.activateCallBack);
        } else {
          this.setActivateCallBack(false);
        }
 
        if (data.callback){
          this.setOnItemClicked(data.callback);
        }

        this.renderList(data.items);
      };


      this.search = function(cadenaBusqueda){
        var resultadoBusqueda = this.filterData(localData);
        this.renderList(resultadoBusqueda);
      };

      this.renderList = function(data){
        this.$el.find(".table-view").html(this.templateList(data));
      };

      this.filterData = function(items){
        var filterString = this.$el.find(".modal-new-filter").val().toUpperCase();
        if (filterString.length === 0 ){
          return items;
        }
        return items.filter(function(item){
          return  item.descripcion.indexOf(filterString) !== -1;
        });
      };


      this.hide = function (){
        this.$el.removeClass("active");
      };

      this.choose = function(codigo, description){
        if (this.$inputTextToFill){
          this.$inputTextToFill.data("codigo", codigo);
          this.$inputTextToFill.val(description);          
        }

        if (this.activateCallBack === true){
          this.onItemClicked({codigo: codigo, description: description});
        }

        this.hide();
      };

      this.destroy = function(){
        localData = null;
        $txtFilter = null;
        this.$el.off("click");
        this.$el.off("keyup");
        this.$el.remove();
        this.$el = null;
      };

      this.initialize();
  }