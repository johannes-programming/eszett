
function beautify(text){
    text = replaceEszett(text);
    return text;
}
function replaceEszett(text) {
    text = text.replace(/ß/g, 'ss');
    text = text.replace(/ẞ/g, 'SS');
    return text;
}

function updateLabel() {
    const richTextbox = document.getElementById("inRichtextbox");
    const label = document.getElementById("outRichtextbox");
    label.textContent = beautify(richTextbox.value);
}