function hide(id) {
	document.getElementById(id).style.visibility='hidden';
}


function show(id) {
	document.getElementById(id).style.visibility='visible';
}

function showForm(id){
	document.getElementById(id).style.display='block';
}

function resetForm(form) {
	document.getElementById(form).reset();
};

function hideForm(id){
	document.getElementById(id).style.display='none';
}

function indicateChoice(id) {
	document.getElementById(id).style.background = 'rgb(210,210,210)';
	document.getElementById(id).style.border = '0.3px solid rgba(160,160,160, 0.3)';
}

function hideChoice(id) {
	document.getElementById(id).style.background = 'transparent';
	document.getElementById(id).style.border = 'none';
}

//Copied from http://jsfiddle.net/XFeQb/
$(window).load(function(){
var sliders = $("#sliders .slider");

sliders.each(function() {
    var value = parseInt($(this).text(), 1),
        availableTotal = 100;

    $(this).empty().slider({
        value: 0,
        min: 0,
        max: 100,
        range: "max",
        step: 5,
        animate: 100,
        slide: function(event, ui) {

            // Get current total
            var total = 0;    
            
            sliders.not(this).each(function() {
                total += $(this).slider("option", "value");
            });    
            

            var max = availableTotal - total;            
                
            if (max - ui.value >= 0) {
                // Need to do this because apparently jQ UI
                // does not update value until this event completes
                total += ui.value;
                //console.log(max-ui.value);
                $(this).siblings().text(ui.value + "%");
            } else {
                return false;
            }
        }
    });
});
});

function resetSliders(){
	var sliders = $("#sliders .slider");
	sliders.each(function() {
		$(this).slider( 'value', 0 );
	});
	$('.sliderValue').html('0%');
	$('#s1').hide();
	$('#s2').hide();
	$('#s3').hide();
	$('#s4').hide();
	$('#s5').hide();
	$('#s6').hide();
	$('#s7').hide();
	$('#s8').hide();
	$('#s9').hide();
}

$(document).ready(function(){
	$("#nextButton").on("click", function(){
		if(value1.checked){
			$("#s1").show();
			var text = $("#v1").contents().filter(function(){ 
				  return this.nodeType == 3; 
			})[0].nodeValue
			$("#sect1").html(text);
		}
		if (value2.checked){
			$("#s2").show();
			var text = $("#v2").contents().filter(function(){ 
				  return this.nodeType == 3; 
			})[0].nodeValue
			$("#sect2").html(text);
		}
		if (value3.checked){
			$("#s3").show();
			var text = $("#v3").contents().filter(function(){ 
				  return this.nodeType == 3; 
			})[0].nodeValue
			$("#sect3").html(text);
		}
		if (value4.checked){
			$("#s4").show();
			var text = $("#v4").contents().filter(function(){ 
				  return this.nodeType == 3; 
			})[0].nodeValue
			$("#sect4").html(text);
		}
		if (value5.checked){
			$("#s5").show();
			var text = $("#v5").contents().filter(function(){ 
				  return this.nodeType == 3; 
			})[0].nodeValue
			$("#sect5").html(text);
		}
		/*if (value6.checked){
			$("#s6").show();
			var text = $("#v6").text();
			$("#sect6").html(text);
		}
		if (value7.checked){
			$("#s7").show();
			var text = $("#v7").text();
			$("#sect7").html(text);
		}
		if (value8.checked){
			$("#s8").show();
			var text = $("#v8").text();
			$("#sect8").html(text);
		}
		if (value9.checked){
			$("#s9").show();
			var text = $("#v9").text();
			$("#sect9").html(text);
		}*/
	});
});

