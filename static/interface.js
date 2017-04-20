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
        step: 1,
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
			var text = $("#v1").text();
			$("#sect1").html(text);
		}
		if (value2.checked){
			$("#s2").show();
			var text = $("#v2").text();
			$("#sect2").html(text);
		}
		if (value3.checked){
			$("#s3").show();
			var text = $("#v3").text();
			$("#sect3").html(text);
		}
		if (value4.checked){
			$("#s4").show();
			var text = $("#v4").text();
			$("#sect4").html(text);
		}
		if (value5.checked){
			$("#s5").show();
			var text = $("#v5").text();
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

function showpanel(id) {
	hidemsg('bg3');
	//hidestatus('bg5');
	indicateChoice(id);
	document.getElementById('statusbox1').style.bottom = '320px';
	document.getElementById('statusbox2').style.bottom = '320px';
	document.getElementById('customers').style.visibility = 'visible';
	document.getElementById('tools').style.bottom = '300px';
	document.getElementById('status').style.bottom = '310px';
	document.getElementById('arrow').className="fa fa-angle-double-down icons2";
}

function hidepanel(id) {
	hideChoice(id);
	document.getElementById('statusbox1').style.bottom = '20px';
	document.getElementById('statusbox2').style.bottom = '20px';
	document.getElementById('customers').style.visibility='hidden';
	document.getElementById('tools').style.bottom = '20px';
	document.getElementById('status').style.bottom = '30px';
	document.getElementById('arrow').className="fa fa-angle-double-up icons2";

}

function showmsg(id) {
	hidepanel('bg2');
	indicateChoice(id);
	document.getElementById('msg').style.visibility = 'visible';
	document.getElementById('tools').style.bottom = '300px';
	document.getElementById('status').style.bottom = '310px';
	document.getElementById('arrow').className="fa fa-angle-double-down icons2";
}

function hidemsg(id) {
	hideChoice(id);
	document.getElementById('msg').style.visibility='hidden';
	document.getElementById('tools').style.bottom = '20px';
	document.getElementById('status').style.bottom = '30px';
	document.getElementById('arrow').className="fa fa-angle-double-up icons2";


}

function showstatus(id) {
	hidepanel('bg2');
	hidemsg('bg3');
	indicateChoice(id);
	document.getElementById('statusbox1').style.visibility = 'visible';
}

function hidestatus(id) {
	hideChoice(id);
	document.getElementById('statusbox1').style.visibility = 'hidden';
	document.getElementById('statusbox2').style.visibility = 'hidden';
}


function showkill() {
	$("#bg4").click(function(){
		$("#kill").toggle();
	});
} 

function alertOutage(network, num_cust, node_id) {
	indicateChoice('bg5');
	document.getElementById('statusbox2').style.visibility = 'visible';
	document.getElementById('status').style.background='red';
	$('#networkList').text('Nätverk: '+network);
	$('#idList').text('Trasig nod: '+node_id);
	$('#numList').text('Antal drabbade: '+num_cust);
}
