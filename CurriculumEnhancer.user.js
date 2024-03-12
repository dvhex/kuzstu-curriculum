// ==UserScript==
// @name     Curicculum Enhancer
// @version  1
// @grant    none
// ==/UserScript==

// Get the current URL
var currentUrl = window.location.href;

// Extract the plan_id and discipline_id from the current URL
var planId = currentUrl.match(/plan_id=(\d+)/);
planId = planId[1];
var disciplineId = currentUrl.match(/discipline_id=(\d+)/);
disciplineId = disciplineId[1];

// Create the new URL
var newUrl = "https://portal.kuzstu.ru/learning/curriculum/plan/view/" + planId;

// Send a request to /api/disciplines?plan=planId
var request = new XMLHttpRequest();
request.open("GET", "/api/disciplines?plan=" + planId, true);
request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
        // Receive the list of curriculum disciplines
        var disciplines = JSON.parse(request.responseText);

        // Find the discipline with the required discipline_id
        var discipline = disciplines.find(function(discipline) {
            return discipline.discipline_id === disciplineId;
        });

        // Create the link
        var link = "https://portal.kuzstu.ru/learning/curriculum/sign/rp?document_type_id=1&plan_id=" + planId + "&discipline_id=" + disciplineId + "&unit=" + discipline.unit;

        // Add the link to the current document
        var modalHeader = document.querySelector(".well-small");
        modalHeader.insertAdjacentHTML("beforebegin", "<div class='well-small'><a href='" + link + "'>Перейти к электронной подписи</a><br/><a href='" + newUrl + "'>Просмотр плана</a></div>");
    }
};
request.send();
