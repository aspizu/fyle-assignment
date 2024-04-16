function isErr(result) {
    return "err" in result;
}
function activateTooltip(target, tooltip) {
    target.onmouseenter = () => {
        tooltip.classList.remove("hidden");
        tooltip.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 200,
            easing: "ease",
        });
        const rect = tooltip.getBoundingClientRect();
        const screen = document.documentElement.getBoundingClientRect();
        if (rect.x + rect.width > screen.width) {
            const width = screen.width - rect.x - 32;
            tooltip.style.width = `${width}px`;
        }
    };
    target.onmouseleave = () => {
        const timeout = setTimeout(() => {
            tooltip.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 200,
                easing: "ease",
            }).onfinish = () => {
                tooltip.classList.add("hidden");
            };
        }, 500);
        target.addEventListener("mouseenter", () => {
            clearTimeout(timeout);
        });
    };
}
for (const label of Array.from(document.querySelectorAll(".label"))) {
    const info = label.querySelector(".label__info");
    const infoDialog = label.querySelector(".label__info-dialog");
    if (!info || !infoDialog)
        continue;
    activateTooltip(info, infoDialog);
}
for (const input of Array.from(document.querySelectorAll(".input"))) {
    const errorIcon = input.querySelector(".input__error-icon");
    const errorDialog = input.querySelector(".input__error-dialog");
    if (!errorIcon || !errorDialog)
        continue;
    activateTooltip(errorIcon, errorDialog);
}
function parseCurrency(value) {
    if (!value.trim()) {
        return { err: "This field is required." };
    }
    const parsedValue = parseInt(value.replace(/[ \n\t,]+/g, ""));
    if (isNaN(parsedValue)) {
        return { err: "Invalid number." };
    }
    if (parsedValue < 0) {
        return { err: "Cannot be negative." };
    }
    return { ok: parsedValue };
}
function activateFormInput(input) {
    const inputInner = input.querySelector(".input__inner");
    const inputError = input.querySelector(".input__error");
    const inputErrorDialog = input.querySelector(".input__error-dialog");
    let value = 0;
    function validate(options = {
        focus: false,
    }) {
        input.classList.remove("input--invalid");
        inputError.classList.add("hidden");
        const result = parseCurrency(inputInner.value);
        if (isErr(result)) {
            inputErrorDialog.textContent = result.err;
            inputError.classList.remove("hidden");
            input.classList.add("input--invalid");
            if (options.focus) {
                inputInner.focus();
            }
            return false;
        }
        value = result.ok;
        return true;
    }
    inputInner.oninput = () => {
        validate();
    };
    return {
        validate,
        getValue: () => {
            return value;
        },
    };
}
function activateSelect(select) {
    let value = null;
    const selectButton = select.querySelector(".select__button");
    const selectOptions = select.querySelector(".select__options");
    const options = Array.from(selectOptions.querySelectorAll(".select__option"));
    function open() {
        selectOptions.classList.remove("hidden");
        selectOptions.animate([
            { opacity: 0, transform: "translateY(-1rem)" },
            { opacity: 1, transform: "translateY(0)" },
        ], {
            duration: 200,
            easing: "ease",
        });
    }
    function close() {
        selectOptions.animate([
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(-1rem)" },
        ], {
            duration: 200,
            easing: "ease",
        }).onfinish = () => {
            selectOptions.classList.add("hidden");
        };
    }
    selectButton.onclick = () => {
        if (selectOptions.classList.contains("hidden")) {
            open();
        }
        else {
            close();
        }
    };
    for (const option of options) {
        option.onclick = () => {
            value = option.textContent;
            selectButton.textContent = value;
            for (const option of options) {
                option.classList.remove("select__option--selected");
            }
            option.classList.add("select__option--selected");
            close();
        };
    }
    return {
        getValue: () => {
            return value;
        },
        animate: () => {
            select.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], {
                duration: 300,
                easing: "ease",
                iterations: 3,
            });
        },
    };
}
function activateForm(form, options) {
    form.animate([
        { opacity: 0, transform: "translateY(-50px)" },
        { opacity: 1, transform: "translateY(0)" },
    ], {
        duration: 200,
        easing: "ease",
    });
    form.onsubmit = (event) => {
        event.preventDefault();
    };
    const grossAnnualIncome = form.querySelector(".gross-annual-income");
    const extraIncome = form.querySelector(".extra-income");
    const totalApplicableDeductions = form.querySelector(".total-applicable-deductions");
    const ageGroup = form.querySelector(".age-group");
    const submit = form.querySelector(".submit");
    const grossAnnualIncomeHandle = activateFormInput(grossAnnualIncome);
    const extraIncomeHandle = activateFormInput(extraIncome);
    const totalApplicableDeductionsHandle = activateFormInput(totalApplicableDeductions);
    const ageGroupHandle = activateSelect(ageGroup);
    submit.onclick = () => {
        if (!grossAnnualIncomeHandle.validate({ focus: true }))
            return;
        if (!extraIncomeHandle.validate({ focus: true }))
            return;
        if (!totalApplicableDeductionsHandle.validate({ focus: true }))
            return;
        const ageGroup = ageGroupHandle.getValue();
        if (!ageGroup) {
            ageGroupHandle.animate();
            return;
        }
        options.onSubmit(calculateOverallIncome(grossAnnualIncomeHandle.getValue(), extraIncomeHandle.getValue(), totalApplicableDeductionsHandle.getValue(), ageGroup));
    };
}
function activateModal(modal) {
    const close = modal.querySelector(".modal-header__close");
    const overallIncome = modal.querySelector(".overall-income");
    function hide() {
        modal.animate([
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(-50px)" },
        ], {
            duration: 200,
            easing: "ease",
        }).onfinish = () => {
            modal.classList.add("hidden");
        };
    }
    close.onclick = () => {
        hide();
    };
    return {
        open: () => {
            modal.classList.remove("hidden");
            modal.animate([
                { opacity: 0, transform: "translateY(-50px)" },
                { opacity: 1, transform: "translateY(0)" },
            ], {
                duration: 200,
                easing: "ease",
            });
        },
        hide,
        isOpen: () => {
            return !modal.classList.contains("hidden");
        },
        setOverallIncome: (value) => {
            overallIncome.textContent = value.toLocaleString();
        },
    };
}
const modal = document.getElementById("modal");
const modalHandle = activateModal(modal);
const form = document.getElementById("form");
activateForm(form, {
    onSubmit: (overallIncome) => {
        modalHandle.open();
        modalHandle.setOverallIncome(overallIncome);
    },
});
const NON_TAXABLE = 8_00_000;
const SLAB_BELOW_40 = 30;
const SLAB_40_TO_60 = 40;
const SLAB_MORE_THAN_60 = 10;
function calculateOverallIncome(grossAnnualIncome, extraIncome, totalApplicableDeductions, ageGroup) {
    const income = grossAnnualIncome + extraIncome - totalApplicableDeductions;
    if (income <= NON_TAXABLE) {
        return income;
    }
    if (ageGroup === "less than 40") {
        return income - income * (SLAB_BELOW_40 / 100);
    }
    if (ageGroup === "40 to 60") {
        return income - income * (SLAB_40_TO_60 / 100);
    }
    return income - income * (SLAB_MORE_THAN_60 / 100);
}
export {};
