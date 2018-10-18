$(function () {

    const jobUrl = 'https://sandbox.gibm.ch/berufe.php';
    const classUrl = 'https://sandbox.gibm.ch/klassen.php';
    const scheduleUrl = 'http://sandbox.gibm.ch/tafel.php';

    if (Cookies.get('class')) {
        initializeCalendar();
    }

    function initializeCalendar() {
        $('#calendar').fullCalendar({
            defaultView: 'agendaWeek',
            handleWindowResize: true,
            height: 'auto',
            weekends: false,
            editable: false,
            allDaySlot: false,
            columnHeaderFormat: 'dddd',
            slotLabelFormat: 'HH:mm',
            titleFormat: 'D MMMM YYYY',
            timeFormat: 'HH:mm',
            header:{
                left: '',
                center: 'title',
                right: 'today prev,next'
            },
            themeSystem: 'bootstrap4',
            nowIndicator: true,
            minTime: '06:00:00',
            maxTime: '18:30:00',
            events: function (start, end, timezone, callback) {
                var week = start.stripTime().format('W-Y');
                var events = [];
                $.getJSON(scheduleUrl, { klasse_id: Cookies.get('class'), woche: week }, function (data) {
                    for (var d of data) {
                        var event = {
                            title: d.tafel_longfach,
                            start: d.tafel_datum + 'T' + d.tafel_von,
                            end: d.tafel_datum + 'T' + d.tafel_bis,
                            prof: d.tafel_lehrer,
                            room: d.tafel_raum,
                            comment: d.tafel_kommentar,
                            allDay: false
                        };
                        events.push(event);
                    }
                }).done(function () {
                    callback(events);
                });
            },
            eventRender: function (event, element) {
                element.popover({
                    title: event.title,
                    html: true,
                    content: 'Professor: ' + event.prof + '<br/>Room: ' + event.room + '<br/>Comment: ' + event.comment,
                    placement: 'right',
                    delay: {
                        "show": 0,
                        "hide": 150
                    },
                    trigger: 'hover focus'
                });
            }
        });
    }

    function populateJobDrop() {
        $('#slctJob').html('<option selected>Select job</option>');
        $.getJSON(jobUrl, function (data) {
            for (var d of data) {
                var option = '<option value="' + d.beruf_id + '">' + d.beruf_name + '</option>';
                $('#slctJob').append(option);
            }
        }).done(function () {
            if (Cookies.get('job')) {
                $("#slctJob option:selected").removeAttr('selected');
                $("#slctJob option[value="+Cookies.get('job')+"]").prop('selected', true);
                populateClassDrop(Cookies.get('job'));
            }
        });
    }

    function populateClassDrop(jobId) {
        $('#slctClass').html('<option selected>Select class</option>');
        $.getJSON(classUrl, { beruf_id: jobId }, function (data) {
            for (var d of data) {
                var option = '<option value="' + d.klasse_id + '">' + d.klasse_longname + '</option>';
                $('#slctClass').append(option);
            }
        }).done(function () {
            if (Cookies.get('job')) {
                $("#slctClass option:selected").removeAttr('selected');
                $("#slctClass option[value="+Cookies.get('class')+"]").prop('selected', true);
            }
        });
    }

    function saveSettings() {
        Cookies.set('job', $("#slctJob option:selected").val(), { expires: 7 });
        Cookies.set('class', $("#slctClass option:selected").val(), { expires: 7 });
        $('#settings').modal('hide');
        initializeCalendar();
    }

    //Event Handler
    $('#btnSettings').click(populateJobDrop);
    $('#btnSave').click(saveSettings);
    $('#slctJob').change(function () {
        populateClassDrop($("#slctJob option:selected").val());
    });

    //Check for cookies on load
});