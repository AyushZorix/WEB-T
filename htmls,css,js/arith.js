function add(){
    let n1 = parseFloat(document.myform.num1.value);
    let n2 = parseFloat(document.myform.num2.value);
    document.myform.result.value = n1 + n2;
}
function subtract(){
    let n1 = parseFloat(document.myform.num1.value);
    let n2 = parseFloat(document.myform.num2.value);
    document.myform.result.value = n1 - n2;
}
function multiply(){
    let n1 = parseFloat(document.myform.num1.value);
    let n2 = parseFloat(document.myform.num2.value);
    document.myform.result.value = n1 * n2;
}
function divide(){
    let n1 = parseFloat(document.myform.num1.value);
    let n2 = parseFloat(document.myform.num2.value);
    if (n2 !== 0){
        document.myform.result.value = n1 / n2;
    } else {
        document.myform.result.value = "Error: ÷0";
    }
}