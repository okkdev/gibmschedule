$(function () {

    const jobUrl = 'https://sandbox.gibm.ch/berufe.php';
    const classUrl = 'https://sandbox.gibm.ch/klassen.php';
    const scheduleUrl = 'http://sandbox.gibm.ch/tafel.php';

    //populates the job select dropdown from the api
    function populateJobDrop() {
        $('#slctJob').html('<option selected>Select job</option>');
        $.getJSON(jobUrl, function (data) {
            for (var d of data) {
                var option = '<option value="' + d.beruf_id + '">' + d.beruf_name + '</option>';
                $('#slctJob').append(option);
            }
        }).done(function () {
            if (localStorage.getItem('job')) {
                $("#slctJob option:selected").removeAttr('selected');
                $("#slctJob option[value=" + localStorage.getItem('job') + "]").prop('selected', true);
                populateClassDrop(localStorage.getItem('job'));
            }
        });
    }

    //populates the class select dropdown from the api depending on the job id
    function populateClassDrop(jobId) {
        $('#slctClass').html('<option selected>Select class</option>');
        $.getJSON(classUrl, { beruf_id: jobId }, function (data) {
            for (var d of data) {
                var option = '<option value="' + d.klasse_id + '">' + d.klasse_longname + '</option>';
                $('#slctClass').append(option);
            }
        }).done(function () {
            if (localStorage.getItem('job')) {
                $("#slctClass option:selected").removeAttr('selected');
                $("#slctClass option[value=" + localStorage.getItem('class') + "]").prop('selected', true);
            }
        });
    }

    //sets the localstorage for the current choice and updates the calendar
    function saveSettings() {
        localStorage.setItem('job', $("#slctJob option:selected").val());
        localStorage.setItem('class', $("#slctClass option:selected").val());
        $('#settings').modal('hide');
        $('#calendar').fullCalendar('refetchEvents');
    }

    //Event Handler
    $('#btnSettings').click(populateJobDrop);
    $('#btnSave').click(saveSettings);
    $('#slctJob').change(function () {
        populateClassDrop($("#slctJob option:selected").val());
    });
    $(window).resize(switchDayWeek);
    $('#calendar').swipe({
        swipe: function (event, direction, distance, duration, fingerCount) {
            if (direction == 'left') {
                zap('next');
            } else if (direction == 'right') {
                zap('prev');
            }

        }
    });
    $('#nextNav').click(function () {zap('next')});
    $('#prevNav').click(function () {zap('prev')});
    $('#dateNav').click(function() {
        $('.fc-body').transition({ opacity: 0 }, 100, 'ease', function () {
            $('#calendar').fullCalendar('today');
            $(this).transition({ opacity: 100 }, 100, 'ease');
        });
    });

    //Onload stuff
    $('[data-toggle="tooltip"]').tooltip()
    initializeCalendar(scheduleUrl);
    $('.fc-view-container').addClass('shadow');
    switchDayWeek();
    if (!localStorage.getItem('class')) {
        populateJobDrop();
        $('#settings').modal('show');
    }
});