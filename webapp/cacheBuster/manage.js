try {
    sap.ui.getCore().attachInit(function () {
        $.post( "version.json?&__=" + Date.now()
            , function(data){
                (function() {

                    let sVersionURLParam = "";
                        sVersionURLParam = (data._enabled===true) ? "&_version=" + data._version : ""; 

                    let proxied = window.XMLHttpRequest.prototype.open;
                    window.XMLHttpRequest.prototype.open = function() {
                       // if(arguments[1].indexOf("resources") == -1){
                            arguments[1] += ((arguments[1].indexOf("?") == -1) ? "?" : "") + sVersionURLParam;
                        //}
                        return proxied.apply(this, [].slice.call(arguments));
                    };
                })();

            new sap.m.Shell({
                appWidthLimited: false,
                app: new sap.ui.core.ComponentContainer({
                    height: "100%",
					name : "sap.ui.demo.webapp",
					settings : {
						id : "webapp"
					}
				})
			}).placeAt("content");





                
            }
            , 'json'
        ).error(function () {
            // in the MII env this would redirect to the main landing portal and force a login
            window.location = '/XMII?___=' + Date.now();
        });
    });
} catch(err){
// in the MII env this would redirect to the main landing portal and force a login
window.location = '/XMII?___=' + Date.now();
}