//creates the calendar with all the parameters and data from the api
function initializeCalendar(scheduleUrl) {
    $('#calendar').fullCalendar({
        defaultView: 'agendaDay',
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
            setNavDate();
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

//changes the calendar to only show a day on screens smaller than 768px 
function switchDayWeek() {
    if ($(window).width() < 768) {
        $('#calendar').fullCalendar('changeView', 'agendaDay');
    } else {
        $('#calendar').fullCalendar('changeView', 'agendaWeek');
    }
    setNavDate();
}

function zap(direction) {
    var sx;
    var ex;
    if (direction == 'prev'){
        sx = 50;
        ex = -50;
    } else if (direction == 'next') {
        sx = -50;
        ex = 50;
    }
    $('.fc-body').transition({ opacity: 0, x: sx }, 100, 'ease', function () {
        $('#calendar').fullCalendar(direction);
        $(this).css({ x: ex })
        $(this).transition({ opacity: 100, x: 0 }, 100, 'ease');
    });
}

function setNavDate() {
    var currentday = $('#calendar').fullCalendar('getDate').format('DD.MM.YYYY');
    var weekstart = $('#calendar').fullCalendar('getDate').startOf('isoweek').format('DD.MM.YYYY');
    var weekend = $('#calendar').fullCalendar('getDate').endOf('isoweek').format('DD.MM.YYYY');

    if ($(window).width() < 768) {
        $('#dateNav').html(currentday);
    } else {
        $('#dateNav').html(weekstart + ' - ' + weekend);
    }
}
