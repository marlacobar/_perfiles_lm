function mostrarBoleta(){
	var wind = window.open("", "prntBoleta");

var lines = '<head>  \
<meta charset="utf-8" />  \
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">  \
<title>MII - Boleta de Báscula</title>  \
<meta name="description" content="">  \
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"> \
<script src="js/jquery-3.4.1.slim.min.js"></script> \
<link rel="stylesheet" href="css/bootstrap4.4.1.min.css">\
<script src="js/popper.min.js"></script> \
<script src="js/bootstrap.min.js"></script> \
<link rel="stylesheet" type="text/css" href="css/custom.css">  \
</head>  \
<body>  \
<div class="print">\
<!--<div id="wrapper"> -->\
<div  id="NW">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:48mm" >  \
<table class="table table-borderless">\
<tr >  \
<td width="25%" class="text-center"><strong></strong></td>  \
<td colspan="2" class="text-center"><strong></strong></td>  \
<td width="25%" class="text-center"><span id="folioNW"></span></td>  \
</tr> \
</table>\
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong> <span id="proveedorNW"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferNW"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoNW"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaNW"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorNW"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoNW"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="entradaNW"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="salidaNW"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="4"><strong>Peso Neto: </strong><span id="pesoNW"></span> Kg </td>   \
</tr>   \
</table> \
</div> \
</div>\
<div  id="NE">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:48mm" >  \
<table class="table table-borderless">\
<tr >  \
<td width="25%" class="text-center"><strong></strong></td>  \
<td colspan="2" class="text-center"><strong></strong></td>  \
<td width="25%" class="text-center"><span id="folioNE"></span></td>  \
</tr> \
</table>\
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong><span id="proveedorNE"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferNE"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoNE"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaNE"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorNE"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoNE"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="entradaNE"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="salidaNE"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="4"><strong>Peso Neto: </strong><span id="pesoNE"></span> Kg </td>   \
</tr>   \
</table> \
</div> \
</div>\
<div  id="SW">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:48mm" >  \
<table class="table table-borderless">\
<tr >  \
<td width="25%" class="text-center"><strong></strong></td>  \
<td colspan="2" class="text-center"><strong></strong></td>  \
<td width="25%" class="text-center"><span id="folioSW"></span></td>  \
</tr> \
</table> \
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong><span id="proveedorSW"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferSW"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoSW"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaSW"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorSW"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoSW"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="entradaSW"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="salidaSW"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="4"><strong>Peso Neto: </strong><span id="pesoSW"></span> Kg </td>   \
</tr>   \
</table> \
</div> \
</div>\
<div id="SE">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:48mm" >  \
<table class="table table-borderless">\
<tr >  \
<td width="25%" class="text-center"><strong></strong></td>  \
<td colspan="2" class="text-center"><strong></strong></td>  \
<td width="25%" class="text-center"><span id="folioSE"></span></td>  \
</tr> \
</table>\
<table id="customers">  \
<tr>  \
<td colspan="4"><strong>PROV/CLIENTE: </strong><span id="proveedorSE"></span></td>   \
</tr>  \
<tr>  \
<td colspan="4"><strong>CHOFER: </strong><span id="choferSE"></span></td>   \
</tr> \
<tr >  \
<td width="25%"><strong>VEHÍCULO: </strong></td>  \
<td width="25%"><span id="vehiculoSE"></span></td>  \
<td width="25%"><strong>PLACA: </strong></td>  \
<td width="25%"><span id="placaSE"></span></td>  \
</tr>  \
<tr>  \
<td colspan="1"><strong>PESADOR: </strong></td>   \
<td colspan="3"><span id="pesadorSE"></span></td> \
</tr> \
<tr>  \
<td colspan="1"><strong>PRODUCTO: </strong></td>   \
<td colspan="3"><span id="productoSE"></span></td> \
</tr> \
<tr>  \
<td colspan="2" class="text-center"><strong>ENTRADA: <strong></td>   \
<td colspan="2" class="text-center"><strong>SALIDA: </strong></td> \
</tr> \
<tr>  \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="entradaSE"></span>\
</p>\
</td>   \
<td colspan="2" style="height: 30mm;">\
<p>\
<span id="salidaSE"></span>\
</p>\
</td> \
</tr> \
<tr>  \
<td colspan="4"><strong>Peso Neto: </strong><span id="pesoSE"></span> Kg </td>   \
</tr>   \
</table>  \
</div> \
</div>\
<!--</div> -->\
</div>\
</body>';

		wind.document.write(lines);
		var folio = "235438";
		var proveedor="ROCACERO SA DE CV";
		var chofer="JUAN PEREZ";
		var vehiculo="ROLLOFF";
		var placa="STX4807";
		var pesador="HLOZANO";
		var producto="CONTENEDOR VACIO";
		
		var entrada="No. Contenedor: 1189" + " D/T: 2020-03-05" + "15:05:46Peso Bruto: 13580 Kg";
		var salida="";
		var peso="2660";
		
		setTimeout(function(){ 
			
			wind.document.getElementById("folioNW").innerHTML = folio;
			wind.document.getElementById("folioNE").innerHTML = folio;
			wind.document.getElementById("folioSW").innerHTML = folio;
			wind.document.getElementById("folioSE").innerHTML = folio;
			
			wind.document.getElementById("proveedorNW").innerHTML = proveedor;
			wind.document.getElementById("proveedorNE").innerHTML = proveedor;
			wind.document.getElementById("proveedorSW").innerHTML = proveedor;
			wind.document.getElementById("proveedorSE").innerHTML = proveedor;
			
			wind.document.getElementById("choferNW").innerHTML = chofer;
			wind.document.getElementById("choferNE").innerHTML = chofer;
			wind.document.getElementById("choferSW").innerHTML = chofer;
			wind.document.getElementById("choferSE").innerHTML = chofer;
			
			wind.document.getElementById("vehiculoNW").innerHTML = vehiculo;
			wind.document.getElementById("vehiculoNE").innerHTML = vehiculo;
			wind.document.getElementById("vehiculoSW").innerHTML = vehiculo;
			wind.document.getElementById("vehiculoSE").innerHTML = vehiculo;
			
			wind.document.getElementById("placaNW").innerHTML = placa;
			wind.document.getElementById("placaNE").innerHTML = placa;
			wind.document.getElementById("placaSW").innerHTML = placa;
			wind.document.getElementById("placaSE").innerHTML = placa;
			
			wind.document.getElementById("pesadorNW").innerHTML = pesador;
			wind.document.getElementById("pesadorNE").innerHTML = pesador;
			wind.document.getElementById("pesadorSW").innerHTML = pesador;
			wind.document.getElementById("pesadorSE").innerHTML = pesador;
			
			wind.document.getElementById("productoNW").innerHTML = producto;
			wind.document.getElementById("productoNE").innerHTML = producto;
			wind.document.getElementById("productoSW").innerHTML = producto;
			wind.document.getElementById("productoSE").innerHTML = producto;
			
			wind.document.getElementById("entradaNW").innerHTML = entrada;
			wind.document.getElementById("entradaNE").innerHTML = entrada;
			wind.document.getElementById("entradaSW").innerHTML = entrada;
			wind.document.getElementById("entradaSE").innerHTML = entrada;
			
			wind.document.getElementById("pesoNW").innerHTML = peso;
			wind.document.getElementById("pesoNE").innerHTML = peso;
			wind.document.getElementById("pesoSW").innerHTML = peso;
			wind.document.getElementById("pesoSE").innerHTML = peso;
			
			wind.print();
			wind.close();
		}, 3000); 
}

function mostrarBoletaSalida(){
	var wind = window.open("", "prntBoletaSalida");

var lines = '<head>  \
<meta charset="utf-8" />  \
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">  \
<title>MII - Boleta de Báscula</title>  \
<meta name="description" content="">  \
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"> \
<link rel="stylesheet" href="css/bootstrap4.4.1.min.css"> \
<script src="js/jquery-3.4.1.slim.min.js"></script> \
<script src="js/popper.min.js"></script> \
<script src="js/bootstrap.min.js"></script> \
<link rel="stylesheet" type="text/css" href="css/custom.css">  \
</head>  \
<body>  \
<!--<div class="print"> -->\
<!--<div id="wrapper"> -->\
<div  id="NW2">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:115mm" >  \
<table  class="table table-borderless">  \
<tr>  \
<td width="50%" colspan="2">\
</td>   \
<td width="50%"  colspan="2">\
<p style="font-size: 14px;">\
<span id="salidaNW"></span>\
</p>\
</td> \
</tr>  \
</table> \
</div> \
</div>\
<div  id="NE2">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:115mm" >  \
<table class="table table-borderless">  \
<tr>  \
<td width="50%" colspan="2">\
</td>   \
<td width="50%" colspan="2">\
<p style="font-size: 14px;">\
<span id="salidaNE"></span>\
</p>\
</td> \
</tr>  \
</table> \
</div> \
</div>\
<div  id="SW2">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:115mm" >  \
<table class="table table-borderless">  \
<tr>  \
<td width="50%" colspan="2">\
</td>   \
<td width="50%" colspan="2">\
<p style="font-size: 14px;">\
<span id="salidaSW"></span>\
</p>\
</td> \
</tr>  \
</table> \
</div> \
</div>\
<div id="SE2">\
<div style="padding-left:8.1mm; padding-right:8.6mm; padding-top:115mm" >  \
<table class="table table-borderless">  \
<tr>  \
<td width="50%"  colspan="2">\
</td>   \
<td width="50%" colspan="2">\
<p style="font-size: 14px;">\
<span id="salidaSE"></span>\
</p>\
</td> \
</tr>  \
</table> \
</div> \
</div>\
<!--</div> -->\
<!--</div>  -->\
</body>';

		wind.document.write(lines);
		var salida="No. Contenedor:  1189 Peso Contenedor Vacio:  2660 Kg D/T: 2020-03-05    15:06:34 Peso Tara: 24,000 Kg";

		setTimeout(function(){ 
			
			wind.document.getElementById("salidaNW").innerHTML = salida;
			wind.document.getElementById("salidaNE").innerHTML = salida;
			wind.document.getElementById("salidaSW").innerHTML = salida;
			wind.document.getElementById("salidaSE").innerHTML = salida;
			
			wind.print();
			wind.close();
		}, 3000); 
}
