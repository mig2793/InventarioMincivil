window.urlService = 'http://192.168.0.170:88/Inventario.asmx/';
var imageUploadServer = '../img/no-imagen.jpg';
var executeFunction = 0;
var codeReadCurrent = '';
//window.urlService = 'http://localhost:59266/Inventario.asmx/';
var app = {
    
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.receivedEvent();
    },
    receivedEvent: function() {
        initEvents();
        initFunction();
    }
};

function initEvents(){
    $("#location").click(initBarcodeLocation);
    $("#maker-codeItem").click(initBarcodeMaker);
    $("#item-button-equivalence").click(initBarcodeEquivalence);
    $("#item-code-refrence").click(initBarcodeReference);
}

function initFunction(){

}

function initBarcodeLocation(){
     cordova.plugins.barcodeScanner.scan(
      function (result) {
        $("#code-location").text(result.text);
      },
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : "Coloca el codigo de barras dentro del area de escaneo", // supported on Android only
          "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      }
   );
}

function initBarcodeEquivalence(){
     cordova.plugins.barcodeScanner.scan(
      function (result) {
        validateCodigo(result.text, 1);
      },
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : "Coloca el codigo de barras dentro del area de escaneo", // supported on Android only
          "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      }
   );
}

function initBarcodeReference(){
     cordova.plugins.barcodeScanner.scan(
      function (result) {
        $("#new-reference").text(result.text);
      },
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : "Coloca el codigo de barras dentro del area de escaneo", // supported on Android only
          "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      }
   );
}

function initBarcodeMaker(){
    cordova.plugins.barcodeScanner.scan(
      function (result) {
        validateCode(result.text);
      },
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : "Coloca el codigo de barras dentro del area de escaneo", // supported on Android only
          "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      }
   );   
}

function getMarcas(){
    showLoad();
    $.ajax({
        type: "POST",
        url: urlService + 'GetMarcas',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = response.d;
            var marca = $("#search-marca")
            $.each(result, function(i){
                marca.append('<option id="'+ result[i]._id_Marcas +'">'+ result[i]._Marcas +'</option>');
            });
            hideLoad();
        },
        error: function(response){
            hideLoad();
            console.log(response);
        }
    });
}

function getProyectos(){
    showLoad();
    $.ajax({
        type: "POST",
        url: urlService + 'selectProyectos',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = response.d;
            result = sortByKey(result, '_Proyectos');
            var proyectos = $("#search-project")
            $.each(result, function(i){
                proyectos.append('<option id="'+ result[i]._codProyectos +'">'+ result[i]._Proyectos +'</option>');
            });
            hideLoad();
        },
        error: function(response){
            hideLoad();
            console.log(response);
        }
    });
}

function getGrupos(){
    showLoad();
    $.ajax({
        type: "POST",
        url: urlService + 'GetGrupos',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = response.d;
            var grupo = $("#search-item-group")
            $.each(result, function(i){
                grupo.append('<option id="'+ result[i]._clasificacion +'">'+ result[i]._nombreGrupo +'</option>');
            });
            hideLoad();
        },
        error: function(response){
            hideLoad();
            console.log(response);
        }
    });
}

function validateCode(resultb){
    var codeSend = '';
    executeFunction++;
    codeReadCurrent = resultb;
    if(executeFunction == 1){
        for(i=0; i<7;i++){
            codeSend = codeSend + codeReadCurrent.charAt(codeReadCurrent.length-6+i);
        }
    }else{
        for(i=0; i<6;i++){
            codeSend = codeSend + codeReadCurrent.charAt(i);
        }       
    }

    validateReferenceIC(codeSend);
}

function validateReferenceIC(resultb){
    showLoad();
    datasend = "{ 'search': '" + resultb.trim() + "', 'condition': " + 1 + " }"
    $.ajax({
        type: "POST",
        url: urlService + 'SelectLikeRIconstruye',
        data:datasend,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            hideLoad();
            var result = response.d[0];
            var resultEach = response.d;
            if(response.d.length>0){
                executeFunction = 0;
                var codBarrasIC = result._CodigoBarrasIcontruye.trim().split(".");
                codBarrasIC = codBarrasIC[codBarrasIC.length-1];
                $("#code-item").text(result._CodigoBarrasIcontruye.trim());
                $("#description-text").text(result._DescripcionItem);
                $("#code-group-text").text(result._nombreGrupo);
                $("#search-item-group").val(result._nombreGrupo);
                $("#new-reference").text(codBarrasIC);
                $("#description-newitem").val(result._DescripcionItem);
                var referencia = $("#search-ci-refrence")
                $.each(resultEach, function(i){
                     referencia.append('<option id="'+ result[i]._clasificacion +'" data-name="'+ result[i]._DescripcionItem + '-' + result[i]._nombreGrupo +'">'+ result[i]._CodigoBarrasIcontruye +'</option>');
                });
                validateReferenceInventory(codBarrasIC);
            }
            else{
                if(executeFunction<3)
                    validateCode(codeReadCurrent)
                else{
                    executeFunction = 0;
                    alert("El codigo " + codeReadCurrent + " no existe en la base de datos");
                }
            }
        },
        error: function(response){
            hideLoad();
            console.log(response);
        }
    }); 
    
}

function validateReferenceInventory(reference){   
    showLoad();
    var ubicacionCod = $("#code-location").text(); ;
    var proyectoCod = $("#search-project option:selected").attr("id");
    datasend = "{ 'codBarras': '" + reference + "','codUbicacion': '" + ubicacionCod + "', 'codProyecto': '" + proyectoCod + "'}"
    $.ajax({
            type: "POST",
            url: urlService + 'SelectLikeReference',
            data: datasend,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        success: function(response) {
            hideLoad();
            var result = response.d[0];
            if(response.d.length>0){
                $("#code-item").text(result._CodigoBarrasIcontruye.trim());
                $("#description-text").text(result._DescripcionItem);
                $("#description-text").text(result._DescripcionItem);
                $("#code-group-text").text(result._nombreGrupo);
                $("#search-item-group").val(result._nombreGrupo);
                $("#new-reference").text(result._CodigoBarras);
                $("#description-newitem").val(result._DescripcionItem);
                $("#brand-text").text(result._Marcas);
                $("#search-marca").val(result._Marcas);
                $("#quantity").val(result._Cantidad);
                $("#quantity-text").text(result._Cantidad);
                $("#search-project").val(result._Proyectos);
                $("#code-location").text(result._Ubicacion);
            }
        },
        error: function(response){
            hideLoad();
            console.log(response);
        }
    });    
}

$("#search-button-reference").click(function(){
    $("#search-ci-refrence").find('option').remove().end();
    var inputText = $("#search-item-text").val();
    var valueSearch = $("#search-item-select").val();
    valueSearch = Number(valueSearch);
    if(inputText.trim().length>0){
        showLoad();
        datasend = "{ 'search': '" + inputText + "', 'condition': '" + valueSearch + "'}"
        $.ajax({
            type: "POST",
            url: urlService + 'SelectLikeRIconstruye',
            data: datasend,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                var result = response.d;
                if(result.length>0){
                    var referencia = $("#search-ci-refrence")
                    $.each(result, function(i){
                        referencia.append('<option id="'+ result[i]._clasificacion +'" data-name="'+ result[i]._DescripcionItem + '-' + result[i]._nombreGrupo +'">'+ result[i]._CodigoBarrasIcontruye +'</option>');
                    });
                    $("textarea").css("display","none");
                    fillfields();
                }else{
                    $("textarea").css("display","block");
                    alert("El codigo " + inputText + " no se encuentra en la base de datos");
                    $("#search-item-text").val("");
                }

                hideLoad();
            },
            error: function(response){
                hideLoad();
                console.log(response);
            }
        });
    }else{
        alert("Completa el campo");
    }
});

$("#search-button-equivalence").click(validateCodigo)

function validateCodigo(resulttext,option){
    $("#search-item-equivalence-all").find('option').remove().end();
    var inputText
    if(option == 1)
        inputText = resulttext;
    else
        inputText = $("#search-item-equivalence").val();
        
    if(inputText.trim().length>0){
        showLoad();
        datasend = "{ 'search': '" + inputText + "', 'condition': " + 1 + "}"
        $.ajax({
            type: "POST",
            url: urlService + 'SelectLikeRIconstruye',
            data: datasend,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                var result = response.d;
                if(result.length>0){
                    var equivalenceText = $("#search-item-equivalence-all")
                    var codeIC = result[0]._CodigoBarrasIcontruye.trim().split(".");              
                    $("#code-equivalence-text").text(codeIC[codeIC.length-1]);
                    equivalenceText.val(result[0]._CodigoBarrasIcontruye.trim());
                    $.each(result, function(i){
                        equivalenceText.append('<option >'+ result[i]._CodigoBarrasIcontruye +'</option>');
                    });
                }else{
                    alert("El codigo " + inputText + " no se encuentra en la base de datos");
                    $("#search-item-equivalence").val("");
                }
                console.log(result);
                hideLoad();
            },
            error: function(response){
                hideLoad();
                console.log(response);
            }
        });
    }else{
        alert("Completa el campo");
    }    
}

function Insertdatos(){
    var ubicacionCod = $("#code-location").text(); ;
    var proyectoCod = $("#search-project option:selected").attr("id");
    var TextCodBarras =  $("#new-reference").text();
    if(TextCodBarras.length>0){
        showLoad();
        datasend = "{ 'codBarras': '" + TextCodBarras + "','codUbicacion': '" + ubicacionCod + "', 'codProyecto': '" + proyectoCod + "'}"
        $.ajax({
            type: "POST",
            url: urlService + 'SelectLikeReference',
            data: datasend,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                var result = response.d;
                console.log(result);
                var codUbicacion = $("#code-location").text();
                var descItem = $("#description-text").text();
                var codeItem = $("#code-item").text();
                var Nrefrencia = $("#new-reference").text();
                var marca = Number($("#search-marca option:selected").attr("id"));
                var cantidad = Number($("#quantity-text").text());
                var codeGrupo = Number($("#search-item-group option:selected").attr("id"));
                var codeEquivalence = $("#code-equivalence-text").text();
                var codeProyecto = $("#search-project option:selected").attr("id");
                

                if(result.length>0){
                    if(codUbicacion.length>0 && descItem.length>0 && Nrefrencia.length>0 && $("#brand-text").text().length>0 && $("#quantity-text").text().length>0 && $("#search-item-group option:selected").val() != 'Grupo' && $("#search-project option:selected").val() != 'Proyecto'){
                        showLoad();
                        datasend = "{ 'codigoUbicacion': '" + codUbicacion + "', 'codigoBarras': '" + Nrefrencia + "', 'codigoBarrasIC' : '"+ codeItem +"', 'descripcionItem':'"+ descItem +"', 'id_Marca': "+ marca  +", 'grupo' : "+ codeGrupo +", 'cantidad' : "+ cantidad +", 'imagen' : '" + imageUploadServer + "','equivalencias' : '" + codeEquivalence + "', 'proyecto': '" + codeProyecto + "'}"
                        $.ajax({
                            type: "POST",
                            url: urlService + 'UpdateReference',
                            data: datasend,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function(response) {
                                var result = response.d;
                                if(result > 0){
                                    alert("Actualizado satisfactoriamente")
                                    clearfields();

                                }else{
                                    alert("Error al actualizar la información")
                                }
                                hideLoad();
                            },
                            error: function(response){
                                alert("Error")
                                console.log(response);
                            }
                        });
                    }else{
                        alert("Completa todos los campos");
                    }
                }else{
                    if(codUbicacion.length>0 && descItem.length>0 && codeItem.length>0 && Nrefrencia.length>0 && $("#brand-text").text().length>0 && $("#quantity-text").text().length>0 && $("#code-group-text").text().length>0){
                        showLoad();
                        datasendU = "{ 'codBarrasLocation': '" + codUbicacion + "'}"
                        $.ajax({
                            type: "POST",
                            url: urlService + 'SelectLikeLocationItem',
                            data: datasendU,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function(response) {
                                hideLoad();
                                var result = response.d[0];
                                if(response.d.length>0)
                                    datasend = "{ 'codigoUbicacion': '" + codUbicacion + "', 'codigoBarras': '" + Nrefrencia + "', 'codigoBarrasIC' : '"+ codeItem +"', 'descripcionItem':'"+ descItem +"', 'id_Marca': "+ marca  +", 'grupo' : "+ codeGrupo +", 'cantidad' : "+ cantidad +", 'imagen' : '" + imageUploadServer + "','equivalencias' : '" + codeEquivalence + "', 'proyecto': '" + codeProyecto + "', 'existe': "+ true +"}"
                                else
                                    datasend = "{ 'codigoUbicacion': '" + codUbicacion + "', 'codigoBarras': '" + Nrefrencia + "', 'codigoBarrasIC' : '"+ codeItem +"', 'descripcionItem':'"+ descItem +"', 'id_Marca': "+ marca  +", 'grupo' : "+ codeGrupo +", 'cantidad' : "+ cantidad +", 'imagen' : '" + imageUploadServer + "','equivalencias' : '" + codeEquivalence + "', 'proyecto': '" + codeProyecto + "', 'existe': "+ false +"}"
                                
                                $.ajax({
                                    type: "POST",
                                    url: urlService + 'InsertReference',
                                    data: datasend,
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    success: function(response) {
                                        var result = response.d;
                                        if(result > 0){
                                            alert("Guardado satisfactoriamente")
                                            clearfields();
                                        }else{
                                            alert("Error al guardar la información")
                                        }
                                        hideLoad();
                                    },
                                    error: function(response){
                                        alert("Error")
                                        console.log(response);
                                    }
                                });
                            },
                            error: function(response){ 
                                hideLoad();
                                console.log(response);
                            }
                        }); 
                    }else{
                        alert("Completa todos los campos");
                    }
                }
                hideLoad();
            },
            error: function(response){
                hideLoad();
                console.log(response);
            }
        });
    }else{
        alert("Completa el campo");
    }    
} 

function clearfields(){
    $("#code-item").text("");
    $("#description-text").text("");
    $("#code-group-text").text("");
    $("#search-item-group").val("Grupo");
    $("#new-reference").text("");
    $("#description-newitem").val("");
    $("#brand-text").text("");
    $("#search-marca").val("Marca");
    $("#quantity").val("");
    $("#quantity-text").text("");
    $("#search-item-text").val("");
    $("#search-item-equivalence").val("");
    $("#code-equivalence-text").text("");
    $("#search-item-equivalence-all").find('option').remove().end().append('<option selected disabled>Referencias encontradas</option>');
    $("#search-ci-refrence").find('option').remove().end().append('<option selected disabled>Referencias encontradas</option>');
}

$("#button-send").click(function(){
    Insertdatos();
});

$("#search-marca").change(function(e){
    $("#brand-text").text($("#search-marca option:selected").text().toLowerCase());
});

$("#quantity").change(function(e){
    $("#quantity-text").text($("#quantity").val().toLowerCase());
});

$("#search-item-group").change(function(e){
    $("#code-group-text").text($("#search-item-group option:selected").val().toLowerCase());
});

$("#takephoto").click(function(){
    navigator.camera.getPicture(onSuccessUploadImage, onFailUploadImage, { quality: 50,
        DestinationType    : Camera.DestinationType.FILE_URI,
        sourceType         : Camera.PictureSourceType.CAMERA,
        targetWidth        : 250,
        targetHeight       : 250,
        allowEdit          : true,
        encodingType       : Camera.EncodingType.JPEG
    });
});

function onSuccessUploadImage(imageURI) {
    var image = $('#no-img');
    $(image).css("background-image","url("+imageURI+")");

    var options = new FileUploadOptions();
    options.fileKey="image";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

    var params = new Object();
    params.value1 = "test";
    params.value2 = "param";

    options.params = params;

    var ft = new FileTransfer();
    ft.upload(imageURI, 'http://162.243.14.71/' + 'uploadImage', win, fail, options);
}

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    alert(r.response);
}

function fail(error) {
    console.log(error.code + "  -- " + error);
}

function onFailUploadImage(message) {
    alert('Failed because: ' + message);
}

$("#description-newitem").change(function(e){
    $("#description-text").text($("#description-newitem").val());
});

$("#search-project").change(function(e){
    $("#project-text").text($("#search-project option:selected").val());
});

$("#search-item-equivalence-all").change(function(e){
    var codeIc = $("#search-item-equivalence-all option:selected").val().trim().split(".");
    var codeIc = codeIc[codeIc.length-1]
    $("#code-equivalence-text").text(codeIc);
});

$("#search-ci-refrence").change(function(e){
    fillfields();
});

function fillfields(){
    var dataname = $("#search-ci-refrence option:selected").data('name');
    textinput = $("#search-ci-refrence option:selected").text();
    dataname = dataname.split("-");
    var textICCode = textinput.split(".");
    textICCode = textICCode[textICCode.length-1];
    $("#code-item").text(textinput);
    $("#description-text").text(dataname[0]);
    $("#code-group-text").text(dataname[1]);
    $("#search-item-group").val(dataname[1]);
    $("#new-reference").text(textICCode);
    $("#description-newitem").val(dataname[0]);    
}

$("#search-ci-qequivalence").change(function(e){
    $("#project-text").text($("#search-project option:selected").val());
});

function hideLoad(){
    $(".load").hide();
}

function showLoad(){
    $(".load").show();
}

function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

getMarcas();
getGrupos();
getProyectos();

app.initialize();
