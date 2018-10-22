$(function () {
    // Variables //
    const jobUrl = 'https://sandbox.gibm.ch/berufe.php';
    const classUrl = 'https://sandbox.gibm.ch/klassen.php';
    const scheduleUrl = 'http://sandbox.gibm.ch/tafel.php';

    // Functions //
    //populates the job select dropdown from the api
    function populateJobDrop() {
        $('#slctJob').html('<option>Select job</option>');
        $.getJSON(jobUrl, function (data) {
            for (var d of data) {
                var option = '<option value="' + d.beruf_id + '">' + d.beruf_name + '</option>';
                $('#slctJob').append(option);
            }
        }).done(function () {
            if (localStorage.getItem('job')) {
                $("#slctJob option[value=" + localStorage.getItem('job') + "]").prop('selected', true);
                populateClassDrop(localStorage.getItem('job'));
            }
        }).fail(function () {
            alert("Seems like the API is down or something is blocking the connection...");
        });
    }

    //populates the class select dropdown from the api depending on the job id
    function populateClassDrop(jobId) {
        $('#slctClass').html('<option>Select class</option>');
        $("#slctClass").prop('disabled', false);
        $.getJSON(classUrl, { beruf_id: jobId }, function (data) {
            for (var d of data) {
                var option = '<option value="' + d.klasse_id + '">' + d.klasse_longname + '</option>';
                $('#slctClass').append(option);
            }
        }).done(function () {
            if (localStorage.getItem('job')) {
                $("#slctClass option[value=" + localStorage.getItem('class') + "]").prop('selected', true);
            }
        }).fail(function () {
            $("#slctClass").prop('disabled', true);
            $("#btnSave").prop('disabled', true);
        });
    }

    //sets the localstorage for the current choice and updates the calendar
    function saveSettings() {
        localStorage.setItem('job', $("#slctJob option:selected").val());
        localStorage.setItem('class', $("#slctClass option:selected").val());
        $('#settings').modal('hide');
        $('.fc-body').transition({ opacity: 0 }, 100, 'ease', function () {
            $('#calendar').fullCalendar('refetchEvents');
            $(this).transition({ opacity: 100 }, 100, 'ease');
        });
    }

    // Event Handlers //
    $('#btnSettings').click(populateJobDrop);
    $('#btnSave').click(saveSettings);
    $('#slctJob').change(function () {
        populateClassDrop($("#slctJob option:selected").val());
    });
    $('#slctClass').change(function () {
        if ($("#slctClass option:selected").val() == "Select class") {
            $("#btnSave").prop('disabled', true);
        } else {
            $("#btnSave").prop('disabled', false);
        }
    });
    $(window).resize(switchDayWeek);
    $('#calendar').swipe({
        swipeLeft: function (event, direction, distance, duration, fingerCount) {
            zap('next');
        },
        swipeRight: function (event, direction, distance, duration, fingerCount) {
            zap('prev');
        }
    });
    $('#nextNav').click(function () { zap('next') });
    $('#prevNav').click(function () { zap('prev') });
    $('#dateNav').click(function () {
        $('.fc-body').transition({ opacity: 0 }, 100, 'ease', function () {
            $('#calendar').fullCalendar('today');
            $(this).transition({ opacity: 100 }, 100, 'ease');
        });
    });

    // Onload stuff //
    //hide overlay
    $('#overlay').fadeOut();
    //enable tooltips
    $('[data-toggle="tooltip"]').tooltip();
    //initialize calendar
    initializeCalendar(scheduleUrl);
    //add some spice
    $('.fc-view-container').addClass('shadow');
    //change view depending on platform
    switchDayWeek();
    //if there's no localstorage show settings modal
    if (!localStorage.getItem('class')) {
        populateJobDrop();
        $('#settings').modal('show');
    }
});