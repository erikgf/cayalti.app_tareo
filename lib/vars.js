var VARS = {
	NOMBRE_APP: "Control Labores Cayaltí",
	NOMBRE_STORAGE : "DATA_NAV__APPCAYALTILABORES",
	NOMBRE_STORAGE_FECHA_TRABAJO : "DATA_NAV__APP_FECHA_CAYALTILABORES",
	SERVER : "http://216.55.141.11:6060/cayaltiservernisiratest",
	SIM : {},
	GET_ICON: function () {
		return localStorage.getItem(this.NOMBRE_STORAGE+"_EMPRESA") == "002" ? "logo-mini-y.png" : "logo-mini.png";
	},
	GET_ISGPSACTIVATED : function(){
		return localStorage.getItem(this.NOMBRE_STORAGE+"_GPS");
	}
};