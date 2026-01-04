function getForm() {
    return document.forms.namedItem("myform") as HTMLFormElement;
}

function add2() {
    const form = getForm();
    const n1 = parseFloat((form.elements.namedItem("num1") as HTMLInputElement).value);
    const n2 = parseFloat((form.elements.namedItem("num2") as HTMLInputElement).value);
    (form.elements.namedItem("result") as HTMLInputElement).value = (n1 + n2).toString();
}

function subtract2() {
    const form = getForm();
    const n1 = parseFloat((form.elements.namedItem("num1") as HTMLInputElement).value);
    const n2 = parseFloat((form.elements.namedItem("num2") as HTMLInputElement).value);
    (form.elements.namedItem("result") as HTMLInputElement).value = (n1 - n2).toString();
}

function multiply2() {
    const form = getForm();
    const n1 = parseFloat((form.elements.namedItem("num1") as HTMLInputElement).value);
    const n2 = parseFloat((form.elements.namedItem("num2") as HTMLInputElement).value);
    (form.elements.namedItem("result") as HTMLInputElement).value = (n1 * n2).toString();
}

function divide2() {
    const form = getForm();
    const n1 = parseFloat((form.elements.namedItem("num1") as HTMLInputElement).value);
    const n2 = parseFloat((form.elements.namedItem("num2") as HTMLInputElement).value);
    const resultField = form.elements.namedItem("result") as HTMLInputElement;

    if (n2 !== 0) {
        resultField.value = (n1 / n2).toString();
    } else {
        resultField.value = "Error: ÷0";
    }
}
