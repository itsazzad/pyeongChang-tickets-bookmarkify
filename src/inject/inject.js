function setQuery(queryKeyValue) {
    if (queryKeyValue.SDate || queryKeyValue.EDate) {
        window.setTimeout(function () {
            let SDate = (new Date(queryKeyValue.SDate)).getDate();
            let EDate = (new Date(queryKeyValue.EDate)).getDate();
            $('#detail_sSday2').text(SDate);
            $('#detail_sEday2').text(EDate);
            $('#hidS').val(SDate);
            $('#hidE').val(EDate);
        }, 1000);
    }

    if (queryKeyValue.SearchKey) {
        $('#txtSearchKey').focus();
        $('#txtSearchKey').val(queryKeyValue.SearchKey);
    }

    if (queryKeyValue.Disciplines) {
        const disciplines = queryKeyValue.Disciplines.split('^');
        if (disciplines.length) {
            window.setTimeout(function () {
                $.each($('#uCeremony input[type="checkbox"]'), function (i, discipline) {
                    if (disciplines.includes(discipline.id.split('__')[1])) {
                        discipline.click();
                    }
                });
                $.each($('._disciplineF input[type="checkbox"]'), function (i, discipline) {
                    if (disciplines.includes(discipline.id.split('__')[1])) {
                        discipline.click();
                    }
                });
            }, 1000);

        }
    }

    if (queryKeyValue.Medal === 'Y') {
        $('#chkMedalGame').click();
    }

    window.setTimeout(function () {
        $('.sessionInputWrap .btnWrap li:first-child a')[0].click();
        $('.sessionTableWrap').show();
    }, 1000);
}


function continueDataRendering() {
    let timeoutID;
    let observer;
    const target = document.getElementById('tbSession');

    function delayedObserverDisconnect() {
        timeoutID = window.setTimeout(slowObserverDisconnect, 1000);
    }

    function slowObserverDisconnect() {
        observer.disconnect();
        const searchParams = new URLSearchParams(window.location.search + window.location.hash);
        const queryKeyValue = {
            SDate: searchParams.get('SDate'),
            EDate: searchParams.get('EDate'),
            SearchKey: searchParams.get('SearchKey'),
            Disciplines: searchParams.get('Disciplines'),
            Medal: searchParams.get('Medal'),
        };
        window.setTimeout(function () {
            setQuery(queryKeyValue);
        }, 1000);
    }

    function clearObserverDisconnect() {
        window.clearTimeout(timeoutID);
    }

    observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (timeoutID) {
                clearObserverDisconnect();
            }
            delayedObserverDisconnect();
        });
    });
    const config = {attributes: true, childList: true, characterData: true};
    observer.observe(target, config);
}

chrome.extension.sendMessage({}, function (response) {
    const readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            $.when($.ready).then(function () {
                continueDataRendering();
                $('.sessionInputWrap .btnWrap li:first-child a').on("click", function () {
                    let discipline = '';
                    $.each($('#uCeremony input[type="checkbox"]'), function (k, i) {
                        if ($('input:checkbox[id="' + i.id + '"]').is(':checked') == true) discipline += '^' + i.id.split('__')[1];
                    });
                    $.each($('._disciplineF input[type="checkbox"]'), function (k, i) {
                        if ($('input:checkbox[id="' + i.id + '"]').is(':checked') == true) discipline += '^' + i.id.split('__')[1];
                    });
                    if (discipline != '') discipline = discipline.substr(1);

                    const sd = '2018-02-' + (($('#hidS').val().length <= 1) ? '0' + $('#hidS').val() : $('#hidS').val());
                    const ed = '2018-02-' + (($('#hidE').val().length <= 1) ? '0' + $('#hidE').val() : $('#hidE').val());
                    const searchKey = $.trim($('#txtSearchKey').val());
                    const medal = (($('input:checkbox[id="chkMedalGame"]').is(':checked') == true) ? 'Y' : '');

                    const searchParams = new URLSearchParams(window.location.search);
                    const queryKeyValue = {
                        SDate: sd,
                        EDate: ed,
                        SearchKey: searchKey,
                        Disciplines: discipline,
                        Medal: medal,
                    };
                    for (const key in queryKeyValue) {
                        if (queryKeyValue.hasOwnProperty(key)) {
                            searchParams.set(key, queryKeyValue[key]);
                        }
                    }
                    const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
                    history.pushState(null, '', newRelativePathQuery);
                });
            });
        }
    }, 10);
});