$(function(){

    const jobUrl = 'https://sandbox.gibm.ch/berufe.php';
    const classUrl = 'https://sandbox.gibm.ch/klassen.php';
    const scheduleUrl = 'http://sandbox.gibm.ch/tafel.php';
/*
    $('#calendar').fullCalendar({
        defaultView: 'agendaWeek',
        weekends: false
    });
*/
    function populateJobDrop(){
        $('#slctJob').html('<option selected>Select job</option>');
        var data = $.getJSON(jobUrl, function( data ) {
            for (var d of data) {
                var option = '<option value="' + d.beruf_id + '">' + d.beruf_name + '</option>';
                $('#slctJob').append(option);
            }
        });
    }

    function populateClassDrop(jobId){
        $('#slctClass').html('<option selected>Select class</option>');
        var data = $.getJSON(classUrl, { beruf_id: jobId}, function( data ) {
            for (var d of data) {
                var option = '<option value="' + d.klasse_id + '">' + d.klasse_longname + '</option>';
                $('#slctClass').append(option);
            }
        });
    }

    function saveSettings(){
        Cookies.set('job', $("#slctJob option:selected").val(), { expires: 7 });
        Cookies.set('class', $("#slctClass option:selected").val(), { expires: 7 });
        $('#settings').modal('hide');
    }

    //Event Handler
    $('#btnSettings').click(populateJobDrop);
    $('#btnSave').click(saveSettings);
    $('#slctJob').change(function(){
        populateClassDrop($("#slctJob option:selected").val());
    });
});