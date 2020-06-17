window.addEventListener(
  "load",
  (e) => {
    createUI();
  },
  false
);

function createUI() {
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
    const settingSpaced = setting.replace(/([A-Z])/g, " $1").toLowerCase();
    const settingSentence =
      settingSpaced.charAt(0).toUpperCase() + settingSpaced.slice(1);
    labelElement.textContent = settingSentence;
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
      inputElement.step = validSettings[setting].step;

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

    inputElement.addEventListener("change", (e) => {
      let value;
      if (inputElement.type == "checkbox") {
        value = inputElement.checked;
      } else {
        value = inputElement.value;
      }
      shnake.game[inputElement.id] = !isNaN(parseInt(value))
        ? parseInt(value)
        : value;
    });

    showModal("settings");
  }

  const rangeElements = document.querySelectorAll("range-slider");
  const rangeDisplayElements = document.querySelectorAll(".range-display");

  rangeElements.forEach((element) => {
    element.addEventListener("input", (e) => {
      element.parentElement.querySelector(".range-display").value =
        element.value;
    });
  });

  rangeDisplayElements.forEach((element) => {
    element.addEventListener("input", (e) => {
      const relatedRangeElement = element.parentElement.querySelector(".input");
      relatedRangeElement.value = element.value;
      shnake.game[relatedRangeElement.id] = !isNaN(parseInt(element.value))
        ? parseInt(element.value)
        : element.value;
    });
  });

  const initButtons = document.querySelectorAll(".button--init");
  initButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      shnake.game.init();
      shnake.audio.play("startGame");
    });
  });

  const homeButtons = document.querySelectorAll(".button--home");
  homeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      hideModals();
      showModal("settings");
    });
  });

  tippy("[data-tippy-content]", {
    animation: "scale",
    duration: 150,
    inertia: true,
  });

  addUISounds();
}

function addUISounds() {
  const interactiveElements = document.querySelectorAll("input, .button");
  interactiveElements.forEach((element) => {
    element.addEventListener("click", (e) => {
      shnake.audio.play("click");
    });
  });

  const rangeSliderElements = document.querySelectorAll("range-slider");
  rangeSliderElements.forEach((element) => {
    element.addEventListener("input", (e) => {
      shnake.audio.play("input");
    });
  });

  const buttonElements = document.querySelectorAll(".button");
  buttonElements.forEach((element) => {
    element.addEventListener("mouseenter", (e) => {
      shnake.audio.play("hover");
    });
  });
}

function hideModals() {
  const modals = document.querySelectorAll(".modal");
  const backdrop = document.querySelector(".backdrop");
  modals.forEach((element) => {
    element.classList.add("modal--hidden");
  });
  backdrop.classList.add("backdrop--hidden");
  shnake.audio.play("whoosh1");
  setTabbable();
}

function showModal(modalType) {
  const modal = document.querySelector(`.modal--${modalType}`);

  if (modalType == "win" || modalType == "lose") {
    const scoreElements = document.querySelectorAll(".modal__score");
    scoreElements.forEach((element) => {
      element.innerHTML = shnake.game.score;
    });
  } else if (modalType == "settings") {
    const backdrop = document.querySelector(".backdrop");
    backdrop.classList.remove("backdrop--hidden");
  }

  modal.classList.remove("modal--hidden");
  if (modalType != "settings") {
    shnake.audio.play("whoosh1");
  }

  setTabbable(modalType);
}

function setTabbable(modalType) {
  const interactiveElements = document.querySelectorAll(
    "input, range-slider, .button"
  );
  interactiveElements.forEach((element) => {
    element.setAttribute("tabindex", "-1");
  });

  if (modalType) {
    const tabbableElements = document.querySelectorAll(
      `.modal--${modalType} input, .modal--${modalType} range-slider, .modal--${modalType} .button`
    );
    tabbableElements.forEach((element) => {
      element.setAttribute("tabindex", "0");
    });
  }
}
