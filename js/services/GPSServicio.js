var GPSServicio = function() {
	var _latitud = "0";
		_longitud = "0",
		_tiempoLoop  = 60,/*segundos*/
		_tiempoCacheadoTope = 100, /*segundos*/
		_tiempoUltimoLL = null,
		_WATCHERID = -1;

    this.initialize = function() {
    	var deferred = $.Deferred();        
        deferred.resolve();
        return deferred.promise();
    };

    var getTiempoEnCache = function(){
        return parseInt((new Date() - _tiempoUltimoLL) / 1000);
    };

    this.getLL = function(){
    	return {latitud: _latitud, longitud: _longitud};
    };

    this.setLL = function(objLL){
    	_longitud = objLL.longitud;
    	_latitud = objLL.latitud;
    };

    this.getTiempoEnCache = getTiempoEnCache;

    this.getWATCHERID = function(){
    	return _WATCHERID;
    };

    this.isCached = function(){
    	if (_tiempoUltimoLL == null || (_tiempoUltimoLL.latitud == "-1" && _tiempoUltimoLL.longitud == "-1") ){
    		return false;
    	}

        var  tiempoEnCache = getTiempoEnCache();
        console.log("Tiempo en cache "+ tiempoEnCache);
    	return (tiempoEnCache < _tiempoCacheadoTope);
    };

    this.restart = function(latitud, longitud){
    	var fnGrabarLatitudLongitudBackground = function(position){
    		console.log("obtuve GPS ", position);
    		_latitud = position.coords.latitude;
    		_longitud = position.coords.longitude;
    		_tiempoUltimoLL = new Date();
    	};

    	if (latitud != undefined){
            /*no estuvo en caché y se consiguió uno*/
            console.log("prealoaded a loaded");
    		_latitud = latitud;
    		_longitud = longitud;	
    		_tiempoUltimoLL = new Date();
    	}

    	_WATCHERID = setInterval(function(){
            if (_WATCHERID != -1){
                geoposicionar(fnGrabarLatitudLongitudBackground);
            }
    	}, _tiempoLoop * 1000);

    	console.log("restart on", _WATCHERID);
    };

    this.stop = function(){
    	clearTimeout(_WATCHERID);
    	_WATCHERID = -1;
    };


    return this.initialize();
};

