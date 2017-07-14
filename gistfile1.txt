// ==UserScript==
// @name        CopyToOther
// @namespace   portal.kuzstu.ru
// @description Копирование текущей РП в другие планы и дисциплины
// @include     https://portal.kuzstu.ru/learning/curriculum/plan/curriculum_editing?plan_id=*&discipline_id=*
// @version     1
// @grant       none
// ==/UserScript==
var myDiv;
$(function() {
  var place = $(".modal-header:last");
  place.append($("<h4>Копирование РП в любой план/дисциплину</h4>"));
  var btn =
      $("<button></button>")
      .attr("class", "btn btn-primary")
      .text("Показать/Скрыть")
      .click(function() {$("#copy-to-other").toggle()});
  place.append(btn);
  myDiv = $("<div></div>").attr("id", "copy-to-other");
  place.append(myDiv);
  install_div();
});

function install_div() {
  myDiv.html("<p>Здесь будет форма для копирования в любой план/дисциплину.</p>");
  myDiv.hide();
  add_institutes();
}

function add_institutes() {
  create_select_element(
    "/api/institutes",
    "institute_id",
    "Выберите институт",
    add_directions,
    function(obj) {
      return {"id":obj.id, "name":obj.name};
    }
  );
}

function add_directions() {
  create_select_element(
    "/api/directions?institute="+$(this).val(),
    "direction_id",
    "Выберите направление",
    add_plans,
    function(obj) {
      return {
        "id":obj.id,
        "name":obj.new_code + ' ' + obj.specialization_name + ' (' + obj.form_name + ', ' + obj.program_name + ')'
      };
    }
  );
}

function add_plans() {
  create_select_element(
    "/api/plans?direction="+$(this).val(),
    "plan_copy_id",
    "Выберите план",
    add_disciplines,
    function(obj) {
      return {"id":obj.id,"name":obj.year};
    }
  );
}

function add_disciplines() {
  create_select_element(
    "/api/disciplines?plan=" + $(this).val(),
    "discipline_copy_id",
    "Выберите дисциплину, если требуется",
    undefined,
    function(obj) {
      if (obj.department_id != $("#discipline_department_id").val())
        return undefined;
      return {"id":obj.discipline_id,"name":obj.discipline_name};
    }
  );
  add_save_button();
}

function add_save_button() {
  if ($("#copy-btn").length > 0) return;
  var btn = $("<button/>")
    .text("Скопировать")
    .attr({"id":"copy-btn","class":"btn btn-primary"})
    .click(changeIds);
  myDiv.append(btn);
}

function changeIds() {
  var plan_id = $("#plan_copy_id").val();
  if (plan_id == "") {
    alert("Не выбран учебный план для копирования!");
    return;
  }
  setValueForElementsByName("plan_id", plan_id);
  setValueForElementsByName("add_plans", plan_id);
  var d_id = $("#discipline_copy_id").val();
  if (d_id != "") {
    setValueForElementsByName("discipline_id", d_id);
  }
}

function setValueForElementsByName(name, value) {
  $("[name="+name+"]:input").val(value);
}

function create_select_element(url, name, description, onchange, callback) {
  var sel = $("#" + name);
  if (sel.length==0) {
    sel = $("<select/>").attr({
      "id":name,
      "name":name,
      "class":"span7",
      "dataContainer":"body"
    });
    sel.hide();
    myDiv.append(sel);
    myDiv.append($("<br/>")); // Костыль
    sel.on("change", onchange);
  }
  sel.empty();
  sel.append('<option value="">' + description + '</option>');
  $.getJSON(url, function(data) {
    $(data).each(function(index, obj){
      var res = callback(obj);
      if (res != undefined)
        sel.append('<option value="' + res.id + '">' + res.name + '</option>');
    });
    sel.show();
  });
  return sel;
}