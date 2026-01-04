function getForm() {
    return document.forms.namedItem("myform");
}
function add2() {
    var form = getForm();
    var n1 = parseFloat(form.elements.namedItem("num1").value);
    var n2 = parseFloat(form.elements.namedItem("num2").value);
    form.elements.namedItem("result").value = (n1 + n2).toString();
}
function subtract2() {
    var form = getForm();
    var n1 = parseFloat(form.elements.namedItem("num1").value);
    var n2 = parseFloat(form.elements.namedItem("num2").value);
    form.elements.namedItem("result").value = (n1 - n2).toString();
}
function multiply2() {
    var form = getForm();
    var n1 = parseFloat(form.elements.namedItem("num1").value);
    var n2 = parseFloat(form.elements.namedItem("num2").value);
    form.elements.namedItem("result").value = (n1 * n2).toString();
}
function divide2() {
    var form = getForm();
    var n1 = parseFloat(form.elements.namedItem("num1").value);
    var n2 = parseFloat(form.elements.namedItem("num2").value);
    var resultField = form.elements.namedItem("result");
    if (n2 !== 0) {
        resultField.value = (n1 / n2).toString();
    }
    else {
        resultField.value = "Error: ÷0";
    }
}
