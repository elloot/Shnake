window.addEventListener(
    "load",
    (e) => {
        createUI();

        const restartButtons = document.querySelectorAll(".button--restart");
        restartButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                shnake.game.restart();
            });
        });
    },
    false
);

function createUI() {
    const modal = document.querySelector(".modal--settings");
    const form = document.querySelector(".form");

    for (const setting in validSettings) {
        const defaultValue = validSettings[setting].default;
        const allowedValues = validSettings[setting].values;
        const type = typeof defaultValue;

        const settingWrapper = document.createElement("div");
        settingWrapper.classList.add("setting-wrapper");

        const inputWrapper = document.createElement("div");
        inputWrapper.classList.add("input-wrapper");

        const labelElement = document.createElement("label");
        labelElement.textContent = setting;
        labelElement.htmlFor = setting;

        let inputElement;
        let switchElement;

        if (type == "string" && allowedValues) {
            inputElement = document.createElement("select");
            for (const index in allowedValues) {
                const value = allowedValues[index];
                const optionElement = document.createElement("option");

                optionElement.value = value;
                optionElement.textContent = value;
                inputElement.appendChild(optionElement);
            }
        } else if (type == "number") {
            inputElement = document.createElement("range-slider");
            inputElement.min = validSettings[setting].min;
            inputElement.max = validSettings[setting].max;

            const displayElement = document.createElement("input");
            displayElement.type = "number";
            displayElement.value = shnake.game[setting];
            displayElement.min = validSettings[setting].min;
            displayElement.max = validSettings[setting].max;
            displayElement.classList.add("range-display");

            inputWrapper.appendChild(inputElement);
            inputWrapper.appendChild(displayElement);
        } else {
            inputElement = document.createElement("input");
            if (type == "string") {
                inputElement.type = "text";
            } else if (type == "boolean") {
                inputElement.type = "checkbox";

                switchElement = document.createElement("div");
                switchElement.classList.add("switch");

                const switchShapeElement = document.createElement("div");
                switchShapeElement.classList.add("switch__shape");

                switchElement.appendChild(inputElement);
                switchElement.appendChild(switchShapeElement);
            }
        }

        inputElement.value = shnake.game[setting];
        inputElement.checked = shnake.game[setting];
        inputElement.id = setting;
        inputElement.classList.add("input");

        settingWrapper.appendChild(labelElement);
        if (type == "number") {
            settingWrapper.appendChild(inputWrapper);
        } else if (type == "boolean") {
            settingWrapper.appendChild(switchElement);
            settingWrapper.classList.add("setting-wrapper--horizontal");
        } else {
            settingWrapper.appendChild(inputElement);
        }

        form.appendChild(settingWrapper);
    }

    const rangeElements = document.querySelectorAll("range-slider");
    const rangeDisplayElements = document.querySelectorAll(".range-display");
    const startGameButton = document.querySelector("#startGameButton");

    rangeElements.forEach((element) => {
        element.addEventListener("input", (e) => {
            element.parentElement.querySelector(".range-display").value = element.value;
            shnake.game[element.id] = !isNaN(parseInt(element.value)) ? parseInt(element.value) : element.value;
        });
    });

    rangeDisplayElements.forEach((element) => {
        element.addEventListener("input", (e) => {
            const relatedRangeElement = element.parentElement.querySelector(".input");
            relatedRangeElement.value = element.value;
            shnake.game[relatedRangeElement.id] = !isNaN(parseInt(element.value)) ? parseInt(element.value) : element.value;
        });
    });

    startGameButton.addEventListener("click", (e) => {
        modal.style.display = "none";
        shnake.game.init();
    });
}

function hideModals() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((element) => {
        element.style.display = "none";
    });
}

function showModal(modalType) {
    const modal = document.querySelector(`.modal--${modalType}`);

    if (modalType == "win" || modalType == "lose") {
        const scoreElements = document.querySelectorAll(".modal__score");
        scoreElements.forEach((element) => {
            element.innerHTML = shnake.game.score;
        });
    }

    modal.style.display = "block";
}