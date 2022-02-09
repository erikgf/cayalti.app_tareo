var CacheComponente = function(nombre_sufijo_storage){
	var strStorage;

	this.init = function(){
		if (!nombre_sufijo_storage || nombre_sufijo_storage == ""){
			console.error("Sufijo de CACHE no enviado.")
			return this;
		}
		strStorage = VARS.NOMBRE_STORAGE+"_"+nombre_sufijo_storage.toUpperCase();
		return this;
	};
	
	this.get = function(){
		return localStorage.getItem(strStorage);
	};

	this.set = function(valor){
		return localStorage.setItem(strStorage, valor);
	};

	this.clear = function(){
		return localStorage.removeItem(strStorage);
	};	

	return this.init();
};