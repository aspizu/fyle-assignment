var AgeGroup;
(function (AgeGroup) {
    AgeGroup[AgeGroup["BELOW_40"] = 0] = "BELOW_40";
    AgeGroup[AgeGroup["BETWEEN_40_AND_60"] = 1] = "BETWEEN_40_AND_60";
    AgeGroup[AgeGroup["ABOVE_60"] = 2] = "ABOVE_60";
})(AgeGroup || (AgeGroup = {}));
function parseAgeGroup(value) {
    switch (value) {
        case "BELOW_40":
            return AgeGroup.BELOW_40;
        case "BETWEEN_40_AND_60":
            return AgeGroup.BETWEEN_40_AND_60;
        case "ABOVE_60":
            return AgeGroup.ABOVE_60;
        default:
            throw new Error(`Invalid age group: ${value}`);
    }
}
/** @returns Whether the income is taxable. */
function isIncomeTaxable(totalIncome) {
    return totalIncome > 8_00_000;
}
/** @returns Tax rate in percentage. */
function getTaxRate(totalIncome, ageGroup) {
    if (!isIncomeTaxable(totalIncome)) {
        return 0;
    }
    switch (ageGroup) {
        case AgeGroup.BELOW_40:
            return 30;
        case AgeGroup.BETWEEN_40_AND_60:
            return 40;
        case AgeGroup.ABOVE_60:
            return 10;
    }
}
/** @returns Overall income after tax deduction. */
function getOverallIncome(grossAnnualIncome, extraIncome, totalApplicableDeductions, ageGroup) {
    const totalIncome = grossAnnualIncome + extraIncome - totalApplicableDeductions;
    const taxRate = getTaxRate(totalIncome, ageGroup);
    return totalIncome - totalIncome * (taxRate / 100);
}
/** Converts a string representing currency to an integer */
function parseCurrency(value) {
    const valueWithoutSeparators = value.replace(/,_./g, "");
    return parseInt(valueWithoutSeparators);
}
/** Input validator for currency inputs */
function validateCurrency(value) {
    value = value.trim();
    if (value === "") {
        return { err: "Cannot be empty." };
    }
    const number = parseCurrency(value);
    if (isNaN(number)) {
        return { err: "Not a number." };
    }
    if (number < 0) {
        return { err: "Cannot be negative." };
    }
    return { ok: number };
}
function isMouseEventInsideElement(event, element) {
    const rect = element.getBoundingClientRect();
    return (event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom);
}
function activateInput(input) {
    const inputInput = input.querySelector(".input__input");
    const inputClear = input.querySelector(".input__clear");
    const inputHint = input.querySelector(".input__hint");
    const hint = inputHint.textContent;
    let lastError = null;
    function showHint() {
        if (lastError === null)
            return;
        lastError = null;
        input.classList.remove("input--invalid");
        inputHint.animate([{}, { opacity: 0 }], { duration: 100 }).onfinish = () => {
            inputHint.classList.remove("input__error");
            inputHint.classList.add("input__hint");
            inputHint.textContent = hint;
        };
    }
    function showError(error) {
        if (lastError === error)
            return;
        lastError = error;
        input.classList.add("input--invalid");
        inputHint.animate([{}, { opacity: 0 }], { duration: 100 }).onfinish = () => {
            inputHint.classList.remove("input__hint");
            inputHint.classList.add("input__error");
            inputHint.textContent = `ⓘ ${error}`;
        };
    }
    let clearShown = false;
    function hideClear() {
        if (!clearShown)
            return;
        clearShown = false;
        inputClear.animate([{}, { opacity: 0 }], { duration: 100 }).onfinish = () => {
            inputClear.classList.add("hidden");
        };
    }
    function showClear() {
        if (clearShown)
            return;
        clearShown = true;
        inputClear.classList.remove("hidden");
        inputClear.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100 });
    }
    inputClear.onclick = () => {
        inputInput.value = "";
        setTimeout(hideClear, 100);
        showHint();
    };
    function validate() {
        const result = validateCurrency(inputInput.value);
        if ("err" in result) {
            showError(result.err);
        }
        else {
            showHint();
        }
        return result;
    }
    let timeout = undefined;
    inputInput.oninput = () => {
        clearTimeout(timeout);
        if (inputInput.value !== "") {
            showClear();
            setTimeout(validate, 500);
        }
        else {
            hideClear();
            showHint();
        }
    };
    return { validate };
}
function activateSelect(select) {
    const handle = {
        value: null,
        validate: () => {
            if (handle.value === null) {
                showError("This field is required.");
            }
            else {
                showHint();
            }
        },
    };
    const selectButton = select.querySelector(".select__button");
    const selectSelected = select.querySelector(".select__selected");
    const selectOptions = select.querySelector(".select__options");
    const options = Array.from(selectOptions.querySelectorAll(".select__option"));
    const inputHint = select.querySelector(".select__hint");
    const hint = inputHint.textContent;
    let lastError = null;
    function showHint() {
        if (lastError === null)
            return;
        lastError = null;
        select.classList.remove("select--invalid");
        inputHint.animate([{}, { opacity: 0 }], { duration: 100 }).onfinish = () => {
            inputHint.classList.remove("select__error");
            inputHint.classList.add("select__hint");
            inputHint.textContent = hint;
        };
    }
    function showError(error) {
        if (lastError === error)
            return;
        lastError = error;
        select.classList.add("select--invalid");
        inputHint.animate([{}, { opacity: 0 }], { duration: 100 }).onfinish = () => {
            inputHint.classList.remove("select__hint");
            inputHint.classList.add("select__error");
            inputHint.textContent = `ⓘ ${error}`;
        };
    }
    function show() {
        selectButton.classList.add("select__button--open");
        selectOptions.classList.remove("hidden");
        selectOptions.animate([
            { opacity: 0, scale: 0.5, transform: "translateY(-1rem)" },
            { opacity: 1, scale: 1, transform: "translateY(0.5rem)" },
        ], { duration: 200, easing: "ease" });
        function onOutsideClick(event) {
            if (isMouseEventInsideElement(event, selectButton))
                return;
            if (isMouseEventInsideElement(event, selectOptions))
                return;
            hide();
            window.removeEventListener("click", onOutsideClick);
        }
        window.addEventListener("click", onOutsideClick);
    }
    function hide() {
        selectButton.classList.remove("select__button--open");
        selectOptions.animate([
            { opacity: 1, scale: 1, transform: "translateY(0.5rem)" },
            { opacity: 0, scale: 0.5, transform: "translateY(-1rem)" },
        ], { duration: 200, easing: "ease" }).onfinish = () => {
            selectOptions.classList.add("hidden");
        };
    }
    for (const option of options) {
        option.onclick = () => {
            for (const option of options) {
                option.classList.remove("select__option--selected");
            }
            option.classList.add("select__option--selected");
            handle.value = option.dataset.key;
            selectSelected.textContent = option.textContent;
            hide();
            showHint();
        };
    }
    selectButton.onclick = () => {
        if (selectOptions.classList.contains("hidden")) {
            show();
        }
        else {
            hide();
        }
    };
    return handle;
}
function activateToast(toast) {
    const closeBtn = toast.querySelector(".toast__close");
    toast.animate([{ transform: "translateY(100%)", scale: 0.9, opacity: 0 }, { scale: 0.95 }, {}], { duration: 500, easing: "ease" });
    function close() {
        toast.animate([
            {},
            { scale: 0.95 },
            { transform: "translateY(100%)", scale: 0.9, opacity: 0 },
        ], { duration: 500, easing: "ease" }).onfinish = () => {
            toast.remove();
        };
    }
    closeBtn.onclick = close;
    return { close };
}
function activateToasts(toasts) {
    return {
        create: (message, { duration, } = {
            duration: 3000,
        }) => {
            const toast = document.createElement("div");
            toast.classList.add("toast");
            const toastClose = document.createElement("button");
            toastClose.classList.add("toast__close", "icon-button", "icon-button--clear-dark");
            toastClose.textContent = "close";
            const toastMessage = document.createElement("p");
            toastMessage.classList.add("toast__message");
            toastMessage.textContent = message;
            toast.append(toastClose, toastMessage);
            const toastHandle = activateToast(toast);
            toasts.append(toast);
            if (duration) {
                setTimeout(() => {
                    toastHandle.close();
                }, duration);
            }
            return toastHandle;
        },
    };
}
const toasts = activateToasts(document.getElementById("toasts"));
function activateForm(form, options) {
    const grossAnnualIncome = activateInput(form.querySelector("& > .gross-annual-income"));
    const extraIncome = activateInput(form.querySelector("& > .extra-income"));
    const totalApplicableDeductions = activateInput(form.querySelector("& > .total-applicable-deductions"));
    const ageGroup = activateSelect(form.querySelector("& > .age-group"));
    const calculate = form.querySelector("& > .calculate");
    calculate.onclick = () => {
        const grossAnnualIncomeValue = grossAnnualIncome.validate();
        if ("err" in grossAnnualIncomeValue) {
            toasts.create(grossAnnualIncomeValue.err);
            return;
        }
        const extraIncomeValue = extraIncome.validate();
        if ("err" in extraIncomeValue) {
            toasts.create(extraIncomeValue.err);
            return;
        }
        const totalApplicableDeductionsValue = totalApplicableDeductions.validate();
        if ("err" in totalApplicableDeductionsValue) {
            toasts.create(totalApplicableDeductionsValue.err);
            return;
        }
        ageGroup.validate();
        if (ageGroup.value === null) {
            toasts.create("Please select an age group.");
            return;
        }
        const overallIncome = getOverallIncome(grossAnnualIncomeValue.ok, extraIncomeValue.ok, totalApplicableDeductionsValue.ok, parseAgeGroup(ageGroup.value));
        options.onCalculate(overallIncome);
    };
}
function activateModal(modalBackdrop) {
    const modal = modalBackdrop.querySelector("& > .modal");
    const incomeModal = modal.querySelector("& > .income-modal");
    const incomeModalIncome = incomeModal.querySelector("& > .income-modal__income");
    const modalHeader = modal.querySelector("& > .modal-header");
    const modalHeaderClose = modalHeader.querySelector("& > .modal-header__close");
    modalBackdrop.onclick = (event) => {
        if (isMouseEventInsideElement(event, modal))
            return;
        close();
    };
    function open() {
        modalBackdrop.classList.remove("hidden");
        modalBackdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 200,
            easing: "ease",
        }).onfinish = () => {
            modal.classList.remove("hidden");
            modal.animate([
                { opacity: 0, transform: "translateY(50%)", scale: 0.5 },
                { opacity: 1, transform: "translateY(0)", scale: 1 },
            ], {
                duration: 200,
                easing: "ease",
            });
        };
    }
    function close() {
        modal.animate([
            { opacity: 1, transform: "translateY(0)", scale: 1 },
            { opacity: 0, transform: "translateY(50%)", scale: 0.5 },
        ], {
            duration: 200,
            easing: "ease",
        }).onfinish = () => {
            modal.classList.add("hidden");
            modalBackdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 200,
                easing: "ease",
            }).onfinish = () => {
                modalBackdrop.classList.add("hidden");
            };
        };
    }
    modalHeaderClose.onclick = () => {
        close();
    };
    return {
        show: (overallIncome) => {
            incomeModalIncome.textContent = `₹${overallIncome.toLocaleString()}`;
            open();
        },
    };
}
const modal = activateModal(document.getElementById("modal"));
const form = activateForm(document.getElementById("form"), {
    onCalculate: (overallIncome) => {
        modal.show(overallIncome);
    },
});
export {};
