// ==UserScript==
// @name        CopyToOther
// @namespace   portal.kuzstu.ru
// @description Копирование текущей РП в другие планы и дисциплины
// @include     https://portal.kuzstu.ru/learning/curriculum/plan/curriculum_editing?plan_id=*&discipline_id=*
// @version     1.1
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
  myDiv = $("<div/>").attr("id", "copy-to-other");
  var copyForm = $("<form/>").attr({
    "class":"form-horizontal",
    "style":"margin-bottom:0px;",
    "role":"form","autocomplete":"off"
  }).submit(function() {return false;});
  var fieldSet = $("<fieldset/>");
  fieldSet.append(myDiv);
  copyForm.append(fieldSet);
  place.append(copyForm);
  install_div();
});

function install_div() {
  myDiv.empty();
  myDiv.hide();
  add_institutes();
}

function add_institutes() {
  create_select_element(
    "/api/institutes",
    "institute_id",
    "Институт",
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
    "Направление",
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
    "Год УП",
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
    "Дисциплина (если требуется)",
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
    .text("Приступить к копированию")
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
    sel = mk_new_select_in_control_group(name, description, onchange);
  }
  sel.empty();
  sel.append('<option value="">Ничего не выбрано</option>');
  $.getJSON(url, function(data) {
    $(data).each(function(index, obj){
      var res = callback(obj);
      if (res != undefined)
        sel.append('<option value="' + res.id + '">' + res.name + '</option>');
    });
    sel.parent().parent().show();
  });
  return sel;
}

function mk_new_select_in_control_group(name, description, onchange) {
  var controlGroup = $("<div/>").attr("class", "control-group");
  var label = $("<label/>").attr({"class":"control-label","for":name}).text(description);
  controlGroup.append(label);
  var sel = $("<select/>").attr({
    "id":name,
    "name":name,
    "class":"span7",
    "dataContainer":"body"
  }).on("change", onchange);
  var controls = $("<div/>").attr("class","controls");
  controls.append(sel);
  controlGroup.append(controls);
  controlGroup.hide();
  myDiv.append(controlGroup);
  myDiv.append($("<br/>")); // Костыль
  return sel;
}