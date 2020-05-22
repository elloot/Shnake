window.addEventListener("load", createUI(), false);

function createUI() {
    const modal = document.querySelector(".modal--settings");

    for (const setting in validSettings) {
        const defaultValue = validSettings[setting].default;
        const allowedValues = validSettings[setting].values;
        const type = typeof defaultValue;

        const inputWrapper = document.createElement("div");
        inputWrapper.classList.add("input-wrapper");

        const labelElement = document.createElement("label");
        labelElement.textContent = setting;
        labelElement.htmlFor = setting;

        let inputElement;
        if (type == "string" && allowedValues) {
            inputElement = document.createElement("select");
            for (const index in allowedValues) {
                const value = allowedValues[index];
                const optionElement = document.createElement("option");

                optionElement.value = value;
                optionElement.textContent = value;
                inputElement.appendChild(optionElement);
            }
            inputElement.value = game[setting];
        } else {
            inputElement = document.createElement("input");
            if (type == "string") {
                inputElement.type = "text";
                inputElement.value = game[setting];
            } else if (type == "number") {
                inputElement.type = "range";
                //inputElement.value = game[setting];
                inputElement.min = validSettings[setting].min;
                inputElement.max = validSettings[setting].max;

                const displayElement = document.createElement("input");
                displayElement.type = "number";
                displayElement.value = game[setting];
                displayElement.min = validSettings[setting].min;
                displayElement.max = validSettings[setting].max;
                displayElement.classList.add("range-display");
                inputWrapper.appendChild(displayElement);

                inputElement.value = game[setting];
            } else if (type == "boolean") {
                inputElement.type = "checkbox";
                inputElement.checked = game[setting];
            }
        }

        inputElement.id = setting;
        inputElement.classList.add("input");

        modal.appendChild(labelElement);
        inputWrapper.appendChild(inputElement);
        modal.appendChild(inputWrapper);
    }

    const inputElements = document.querySelectorAll(".input");
    const rangeElements = document.querySelectorAll("input[type=range]");
    const rangeDisplayElements = document.querySelectorAll(".range-display");

    rangeElements.forEach((element) => {
        element.addEventListener("input", (e) => {
            element.parentElement.querySelector(".range-display").value = element.value;
        });
    });

    rangeDisplayElements.forEach((element) => {
        element.addEventListener("input", (e) => {
            element.parentElement.querySelector(".input").value = element.value;
        });
    });

    inputElements.forEach((element) => {
        element.addEventListener("input", (e) => {
            game[element.id] = element.value;
        });
    });
}
