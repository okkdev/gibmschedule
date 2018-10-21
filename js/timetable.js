$(function () {

    const jobUrl = 'https://sandbox.gibm.ch/berufe.php';
    const classUrl = 'https://sandbox.gibm.ch/klassen.php';
    const scheduleUrl = 'http://sandbox.gibm.ch/tafel.php';

    //creates the calendar with all the parameters and data from the api
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
            header: false,
            footer: false,
            themeSystem: 'bootstrap4',
            nowIndicator: true,
            minTime: '06:00:00',
            maxTime: '18:30:00',
            events: function (start, end, timezone, callback) {
                var week = start.stripTime().format('W-Y');
                var events = [];
                $.getJSON(scheduleUrl, { klasse_id: localStorage.getItem('class'), woche: week }, function (data) {
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
                //if there's a comment add it to the description
                var description = 'Prof.: ' + event.prof + '<br/>Room: ' + event.room;
                if (event.comment) {
                    description += '<br/>Comment: ' + event.comment;
                }
                
                
                //popovers only for wide enough screens
                if ($(window).width() > 800) {
                    element.popover({
                        title: event.title,
                        html: true,
                        content: description,
                        placement: 'right',
                        delay: {
                            "show": 0,
                            "hide": 150
                        },
                        trigger: 'hover focus'
                    });
                }

                //mobile users can click on events and it'll show a modal instead of the popover
                element.swipe({
                    tap: function (tapevent, target) {
                        $('#eventDetails .modal-title').html(event.title);
                        $('#eventDetails .modal-body').html(description);
                        $('#eventDetails').modal('show');
                    }
                });
            }
        });
    }

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

    //changes the calendar to only show a day on screens smaller than 800px 
    function switchDayWeek() {
        if ($(window).width() < 800) {
            $('#calendar').fullCalendar('changeView', 'agendaDay');
        } else {
            $('#calendar').fullCalendar('changeView', 'agendaWeek');
        }
    }

    function next() {
        $('.fc-event').animate({ opacity: 0 }, 200, 'linear', function () {
            $('#calendar').fullCalendar('next');
            $('.fc-event').animate({ opacity: 100 }, 200, 'linear');
        });
    }

    function prev() {
        $('.fc-event').animate({ opacity: 0 }, 200, 'linear', function () {
            $('#calendar').fullCalendar('prev');
            $('.fc-event').animate({ opacity: 100 }, 200, 'linear');
        });
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
                next();
            } else if (direction == 'right') {
                prev();
            }

        }
    });

    //Onload stuff
    initializeCalendar();
    switchDayWeek();
    if (!localStorage.getItem('class')) {
        $('#settings').modal('show');
        populateJobDrop();
    }
});