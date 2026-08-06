import Flakture from "../src/components/flakture.ts"

window.addEventListener("load", () => {
    const element = document.getElementById("flakture");
    const baseProperties = JSON.parse(element.innerText);
    if (element) {
        new Flakture(element, baseProperties);
    } else {
        console.log("Could not find element #flakture");
    }
});
