var VARS = {
	NOMBRE_APP: "Tareo Móvil",
	NOMBRE_STORAGE : "DATA_NAV__APPCAYALTILABORES",
	NOMBRE_STORAGE_FECHA_TRABAJO : "DATA_NAV__APP_FECHA_CAYALTILABORES",
	SERVER_URL: "https://apps.cayalti.com.pe:6061",
	SERVER_NAME_PRODUCCION : "cayaltiservernisira",
	SERVER_NAME_DESARROLLO : "cayaltiservernisiratest",
	SERVER_NAME: "cayaltiservernisira",
	SERVER_UPDATE_URL: "https://app.cayalti.com.pe/apk/tareo/version.xml",
	SERVER : function(){
		return this.SERVER_URL+"/"+this.SERVER_NAME
	},
	SIM : {},
	GET_ICON: function () {
		return this.GET_EMPRESA() == "002" ? "logo-mini-y.png" : "logo-mini.jpg";
	},
	GET_ISGPSACTIVATED : function(){
		return new CacheComponente(this.CACHE.GPS).get();
	},
	GET_EMPRESA : function(){
		return new CacheComponente(this.CACHE.EMPRESA).get();
	},
	CACHE:  {
		EMPRESA : "_empresa",
		EMPRESA_SINCRO : "_empresasincro",
		FECHA: "_fecha",
		FECHA_SINCRO: "_fechasincro",
		GPS: "_gps"
	}
};