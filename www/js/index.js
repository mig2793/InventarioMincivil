window.urlService = 'http://localhost:59266/Inventario.asmx/';
//window.urlService = 'http://192.168.0.170:88/Inventario.asmx/';
//window.urlService = 'http://190.25.228.180:85/Inventario.asmx/';
var imageUploadServer = '../img/no-imagen.jpg';
var url_Image = 'http://192.168.0.170:81/';
var executeFunction = 0;
var codeReadCurrent = '';
var codesearchMaker = "";
var colorSend = '';

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
    $(window).unbind('scroll');
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
        if(result.text != "")
            validateCodigo(result.text, 1);
        else
            alert("no leiste ningun codigo")
        
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
        $("#new-reference").text(result.text.trim());
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
        if(result.text != ""){
            codesearchMaker = result.text;
            validateCode(result.text);
        }
        else
            alert("no leiste ningun codigo")
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
            result = sortByKey(result, '_Marcas');
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
        for(var j=0; j<6;j++){
            codeSend = codeSend + codeReadCurrent.charAt(codeReadCurrent.length-5+j);
        }
    }else{
        for(var j=0; j<6;j++){
            codeSend = codeSend + codeReadCurrent.charAt(j);
        }       
    }

    validateReferenceIC(codeSend);
}

function validateReferenceIC(resultb){
    showLoad();
    $("#locations-item").text("");
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
                $("#new-reference").text(codBarrasIC.trim());
                $("#description-newitem").val(result._DescripcionItem);
                var referencia = $("#search-ci-refrence")
                $.each(resultEach, function(i){
                    resultEach[i]._DescripcionItem = resultEach[i]._DescripcionItem.replace(/["'-]/g,"");
                    referencia.append('<option id="'+ resultEach[i]._clasificacion +'" data-name="'+ resultEach[i]._DescripcionItem + '-' + resultEach[i]._nombreGrupo +'">'+ resultEach[i]._CodigoBarrasIcontruye +'</option>');
                });
                $.when(validateReferenceInventory(codBarrasIC)).then(validateReferenceInventory(codesearchMaker));
            }
            else{
                if(executeFunction<3)
                    validateCode(codeReadCurrent)
                else{
                    executeFunction = 0;
                    validateCodeInventoryConfirm(codesearchMaker);
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
    var datasend = "{ 'codBarras': '" + reference + "','codUbicacion': '" + ubicacionCod + "', 'codProyecto': '" + proyectoCod + "'}"
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
                completeFillsLike(result._CodigoBarrasIcontruye.trim(),result._DescripcionItem,result._nombreGrupo,result._CodigoBarras,result._Marcas,result._Proyectos,result._Ubicacion,result._Imagen, result._Color);
                $("#quantity").val(result._Cantidad);
                $("#quantity-text").text(result._Cantidad);
                getEquivalences(result._CodigoBarras);
                getLocations(result._CodigoBarras);
            }else{
                datasend = "{ 'codBarras': '" + reference + "'}"
                    $.ajax({
                            type: "POST",
                            url: urlService + 'SelectLikeReferenceCod',
                            data: datasend,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                        success: function(response) {
                            hideLoad();
                            var result = response.d[0];
                            if(response.d.length>0){
                                completeFillsLike(result._CodigoBarrasIcontruye.trim(),result._DescripcionItem,result._nombreGrupo,result._CodigoBarras,result._Marcas,"","",result._Imagen, result._Color);
                                getEquivalences(result._CodigoBarras);
                                getLocations(result._CodigoBarras);
                            }
                        },
                        error: function(response){
                            hideLoad();
                            console.log(response);
                        }
                    });    
            }
        },
        error: function(response){
            hideLoad();
            console.log(response);
        }
    });    
}

function validateReferenceInventoryEquivalencias(reference){   
    showLoad();
    datasend = "{ 'codBarras': '" + reference + "'}"
        $.ajax({
                type: "POST",
                url: urlService + 'SelectLikeReferenceCod',
                data: datasend,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            success: function(response) {
                hideLoad();
                var result = response.d[0];
                if(response.d.length>0){
                    var equivalenceText = $("#search-item-equivalence-all")
                    var codeIC = result[0]._CodigoBarrasIcontruye.trim().split(".");              
                    validateEquivalenceCodigo(result[0]._CodigoBarrasIcontruye.trim())
                    equivalenceText.val(result[0]._CodigoBarrasIcontruye.trim());
                    $.each(result, function(i){
                        equivalenceText.append('<option >'+ result[i]._CodigoBarrasIcontruye +'</option>');
                    });
                }
            },
            error: function(response){
                hideLoad();
                console.log(response);
            }
        });      
}

function completeFillsLike(codigoIC,descripcion,nombreGR,CodigoBaras,Marca,Proyecto,ubicacion,imagen,color){
    var image = $('#no-img');

    $("#code-item").text(codigoIC);
    $("#description-text").text(descripcion);
    $("#description-text").text(descripcion);
    $("#code-group-text").text(nombreGR);
    $("#search-item-group").val(nombreGR);
    $("#new-reference").text(CodigoBaras.trim());
    $("#description-newitem").val(descripcion);
    $("#brand-text").text(Marca);
    $("#search-marca").val(Marca);
    imageUploadServer = imagen;
    $("#naranja").css('border','none');
    $("#verde").css('border','none'); 
    $(image).css("background-image","url("+imagen+")");
    if(ubicacion != "" && Proyecto != ""){
        $("#search-project").val(Proyecto);
        $("#code-location").text(ubicacion);
    }
    if (color.trim() == 'naranja'){
        $("#naranja").css('border','4px solid black');
        colorSend = 'naranja';
    }else if(color.trim() == 'verde'){
        $("#verde").css('border','4px solid black');
        colorSend = 'verde';
    }    
}

$("#search-button-reference").click(function(){
    $("#code-equivalence-text").text("");
    $("#locations-item").text("");
    $("#search-ci-refrence").find('option').remove().end();
    var inputText = $("#search-item-text").val().trim();
    var valueSearch = $("#search-item-select").val().trim();
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
                    var referencia = $("#search-ci-refrence");
                    $.each(result, function(i){
                        result[i]._DescripcionItem = result[i]._DescripcionItem.replace(/["'-]/g,"");
                        referencia.append('<option id="'+ result[i]._clasificacion +'" data-name="'+ result[i]._DescripcionItem + '-' + result[i]._nombreGrupo +'">'+ result[i]._CodigoBarrasIcontruye +'</option>');
                    });
                    $("textarea").css("display","none");
                    $("#search-item-group").css("display","none");
                    fillfields();
                }else{
                    $("textarea").css("display","block");
                    $("#search-item-group").css("display","block");
                    $("#search-item-text").val("");
                    validateCodeInventoryConfirm(inputText);
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
        inputText = $("#search-item-equivalence").val().trim();
        
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
                    validateEquivalenceCodigo(result[0]._CodigoBarrasIcontruye.trim())
                    equivalenceText.val(result[0]._CodigoBarrasIcontruye.trim());
                    $.each(result, function(i){
                        equivalenceText.append('<option >'+ result[i]._CodigoBarrasIcontruye +'</option>');
                    });
                }else{
                    validateEquivalenceCodigo(inputText);
                    validateCodeInventoryConfirmE(inputText);
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
                var codeEquivalence = new Array();
                var lengthEquivalence = $("#code-equivalence-text span").length;
                for(i=0;i<lengthEquivalence;i++){
                    codeEquivalence.push($("#code-equivalence-text span")[i].firstChild.nodeValue);  
                }   
                var codUbicacion = $("#code-location").text();
                var descItem = $("#description-text").text();
                var codeItem = $("#code-item").text();
                var Nrefrencia = $("#new-reference").text();
                var marca = Number($("#search-marca option:selected").attr("id"));
                var cantidad = Number($("#quantity-text").text());
                var codeGrupo = Number($("#search-item-group option:selected").attr("id"));
                var codeProyecto = $("#search-project option:selected").attr("id");
                var codeProyecto = $("#search-project option:selected").attr("id");
                

                if(result.length>0){
                    if(codUbicacion.length>0 && descItem.length>0 && Nrefrencia.length>0 && $("#brand-text").text().length>0 && $("#quantity-text").text().length>0 && $("#search-item-group option:selected").val() != 'Grupo' && $("#search-project option:selected").val() != 'Proyecto' && colorSend != ''){
                        showLoad();
                        datasend = "{ 'codigoUbicacion': '" + codUbicacion + "', 'codigoBarras': '" + Nrefrencia + "', 'codigoBarrasIC' : '"+ codeItem +"', 'descripcionItem':'"+ descItem +"', 'id_Marca': "+ marca  +", 'grupo' : "+ codeGrupo +", 'cantidad' : "+ cantidad +", 'imagen' : '" + imageUploadServer + "','equivalencias' : '" + codeEquivalence + "', 'proyecto': '" + codeProyecto + "',  'color': '" + colorSend + "'}"
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
                                alert("Error"+ response.responseText)
                                console.log(response);
                            }
                        });
                    }else{
                        alert("Completa todos los campos");
                    }
                }else{
                    if(codUbicacion.length>0 && descItem.length>0 &&  Nrefrencia.length>0 && $("#brand-text").text().length>0 && $("#quantity-text").text().length>0 && $("#code-group-text").text().length>0 && colorSend != ''){
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
                                    datasend = "{ 'codigoUbicacion': '" + codUbicacion + "', 'codigoBarras': '" + Nrefrencia + "', 'codigoBarrasIC' : '"+ codeItem +"', 'descripcionItem':'"+ descItem +"', 'id_Marca': "+ marca  +", 'grupo' : "+ codeGrupo +", 'cantidad' : "+ cantidad +", 'imagen' : '" + imageUploadServer + "','equivalencias' : '" + codeEquivalence + "', 'proyecto': '" + codeProyecto + "', 'existe': "+ true +", 'color': '" + colorSend + "'}"
                                else
                                    datasend = "{ 'codigoUbicacion': '" + codUbicacion + "', 'codigoBarras': '" + Nrefrencia + "', 'codigoBarrasIC' : '"+ codeItem +"', 'descripcionItem':'"+ descItem +"', 'id_Marca': "+ marca  +", 'grupo' : "+ codeGrupo +", 'cantidad' : "+ cantidad +", 'imagen' : '" + imageUploadServer + "','equivalencias' : '" + codeEquivalence + "', 'proyecto': '" + codeProyecto + "', 'existe': "+ false +", 'color': '" + colorSend + "'}"
                                
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
                                        alert("Error" + response.responseText)
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

function getEquivalences(codBarras){
    datasend = "{'codBarras': '" + codBarras.trim() + "'}";
    $.ajax({
        type: "POST",
        url: urlService + 'selectEquivalences',
        data: datasend,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = response.d;
            if(result.length > 0){
                console.log(result);
                for(var i=0;i<result.length;i++){
                    $("#code-equivalence-text").append('<span>' + result[i]._Equivalencia + '</span>');
                }
                
            }else{
                console.log("No tiene equivalencias")
            }
            hideLoad();
        },
        error: function(response){
            console.log(response.responseText);
        }
    });
}

function getLocations(codBarras){
    datasend = "{'codBarras': '" + codBarras.trim() + "'}";
    $.ajax({
        type: "POST",
        url: urlService + 'getLocation',
        data: datasend,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = response.d;
            if(result.length > 0){
                console.log(result);
                for(var i=0;i<result.length;i++){
                    $("#locations-item").append('<span>' + result[i]._Ubicacion + ' - ' + result[i]._Cantidad + '</span><br>');
                }
                
            }
            hideLoad();
        },
        error: function(response){
            console.log(response.responseText);
        }
    });
}

function clearfields(){
    var image = $('#no-img');
    imageUploadServer = '../img/no-imagen.jpg';
    $(image).css("background-image","url(../img/no-imagen.jpg)");
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
    $("#locations-item").text("");
    $("#naranja").css('border','none');
    $("#verde").css('border','none');
    $("#locations-item").text("");

}

$("#button-send").click(function(){
    Insertdatos();
});

function deleteEquivalence(e){
    var target = e.currentTarget;
    $(target).parent().remove();
}


$("#clear").click(function(){
    clearfields();
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

$("#send-password").click(function(){
    var inputlogintxt = $("#login-txt").val(); 
    if(inputlogintxt == 'mincivil1234'){
        $("#login").hide();
        $("body").css("overflow","scroll");
    }else{
        alert("Clave incorrecta!");
    }
})
function validateCodeInventoryConfirm(code) {
    var searchCode = confirm("El codigo "+ code +" NO ha sido encontrado ¿Quieres buscar el código en la base de datos inventario?");
    if (searchCode) {
        validateReferenceInventory(code);
    }
}

function validateCodeInventoryConfirmE(code) {
    var searchCode = confirm("El codigo "+ code +" NO ha sido encontrado ¿Quieres buscar el código en la base de datos inventario?");
    if (searchCode) {
        validateReferenceInventoryEquivalencias(code);
    }
}


$("#takephoto").click(function(){
    navigator.camera.getPicture(onSuccessUploadImage, onFailUploadImage, { quality: 50,
        DestinationType    : Camera.DestinationType.FILE_URI,
        sourceType         : Camera.PictureSourceType.CAMERA,
        targetWidth        : 150,
        targetHeight       : 150,
        allowEdit          : true,
        encodingType       : Camera.EncodingType.JPEG
    });
});

function onSuccessUploadImage(imageURI) {
    var image = $('#no-img');
    $(image).css("background-image","url("+imageURI+")");

    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

    var params = new Object();
    params.value1 = "test";
    params.value2 = "param";

    options.params = params;
    options.chunkedMode = false;

    var ft = new FileTransfer();
    ft.upload(imageURI, url_Image + '/uploadimage.php', win, fail, options);
}

function win(r) {
    var data = JSON.parse(r.response)
    var name_image = data.file.name; 
    imageUploadServer = url_Image + '/img/' + name_image;
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
    var codeIc = $("#search-item-equivalence-all option:selected").val().trim();
    validateEquivalenceCodigo(codeIc);
});

function validateEquivalenceCodigo(codeIC){
    var lengthEquivalence = $("#code-equivalence-text span").length;
    var exist = false;
    codeIC = codeIC.split(".");
    codeIC = codeIC[codeIC.length-1];
    for(i=0;i<lengthEquivalence;i++){
        var codeValidate = $("#code-equivalence-text span")[i].firstChild.nodeValue;
        if(codeValidate.trim() == codeIC){
            exist = true;
            break;
        }
    }
    if(exist == false)
        $("#code-equivalence-text").append('<span>' + codeIC + '<em id = "delete" onclick="deleteEquivalence(event)">    X</em></span>');
}

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
    $("#new-reference").text(textICCode.trim());
    $("#description-newitem").val(dataname[0]);
    validateReferenceInventory(textICCode);  
}

$(".colors-inventory").click(function(e){
    var id = e.target.id;
    e.target.style.border = "4px solid black";
    id == 'verde' ? $("#naranja").css('border','none') : $("#verde").css('border','none'); 
    colorSend = id;
});

function printer(){

    var print;

    BTPrinter.list(function(data){
        console.log("Success");
        console.log(data);
        print = data[0];
    },function(err){
        console.log("Error");
        console.log(err);
    })

    BTPrinter.connect(function(data){
        console.log("Success");
        console.log(data)
    },function(err){
        console.log("Error");
        console.log(err)
    }, "QLn420")

    BTPrinter.printText(function(data){
        console.log("Success");
        console.log(data)
    },function(err){
        console.log("Error");
        console.log(err)
    }, "Impresion de prueba")

    BTPrinter.disconnect(function(data){
        console.log("Success");
        console.log(data)
    },function(err){
        console.log("Error");
        console.log(err)
    }, "QLn420")

}

$("#search-ci-qequivalence").change(function(e){
    $("#project-text").text($("#search-project option:selected").val());
});

function hideLoad(){
    $(".load").hide();
}

function showLoad(){
    $("body").scrollTop( 0 );
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
