

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

function getSelectedParams(){
	var selectedParam1 = $('#param1 option:selected').text();
	$('#w1').html('<span>1</span>'+ selectedParam1);
	var selectedParam2 = $('#param2 option:selected').text();
	$('#w2').html('<span>2</span>'+ selectedParam2);
	var selectedParam3 = $('#param3 option:selected').text();
	$('#w3').html('<span>3</span>'+ selectedParam3);
}

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

function resetSliders(){
	var sliders = $("#sliders .slider");
	sliders.each(function() {
		$(this).slider( 'value', 0 );
	});
	$('.sliderValue').html('0%');
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

function checkWeights(id){
	var sum = 0
	var sliders = $("#sliders .slider");
	sliders.each(function(){
		 sum += $(this).slider("option","value");
	});
	
	if (sum < 100) {
		alert ("Totala vikten är " + sum + "%. Måste vara 100%")
	}
	else {
		//Kör analysen när den funktionen finns
		hideForm(id);
		resetForm('paraForm')
		resetForm('weightForm1')
		resetSliders()
	}
}

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
