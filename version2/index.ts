type Result<T, E> = {ok: T} | {err: E}

enum AgeGroup {
    BELOW_40,
    BETWEEN_40_AND_60,
    ABOVE_60,
}

function parseAgeGroup(value: string): AgeGroup {
    switch (value) {
        case "BELOW_40":
            return AgeGroup.BELOW_40
        case "BETWEEN_40_AND_60":
            return AgeGroup.BETWEEN_40_AND_60
        case "ABOVE_60":
            return AgeGroup.ABOVE_60
        default:
            throw new Error(`Invalid age group: ${value}`)
    }
}

/** @returns Whether the income is taxable. */
function isIncomeTaxable(totalIncome: number) {
    return totalIncome > 8_00_000
}

/** @returns Tax rate in percentage. */
function getTaxRate(totalIncome: number, ageGroup: AgeGroup) {
    if (!isIncomeTaxable(totalIncome)) {
        return 0
    }
    switch (ageGroup) {
        case AgeGroup.BELOW_40:
            return 30
        case AgeGroup.BETWEEN_40_AND_60:
            return 40
        case AgeGroup.ABOVE_60:
            return 10
    }
}

/** @returns Overall income after tax deduction. */
function getOverallIncome(
    grossAnnualIncome: number,
    extraIncome: number,
    totalApplicableDeductions: number,
    ageGroup: AgeGroup
) {
    const totalIncome = grossAnnualIncome + extraIncome - totalApplicableDeductions
    const taxRate = getTaxRate(totalIncome, ageGroup)
    return totalIncome - totalIncome * (taxRate / 100)
}

/** Converts a string representing currency to an integer */
function parseCurrency(value: string): number {
    const valueWithoutSeparators = value.replace(/,_./g, "")
    return parseInt(valueWithoutSeparators)
}

/** Input validator for currency inputs */
function validateCurrency(value: string): Result<number, string> {
    value = value.trim()
    if (value === "") {
        return {err: "Cannot be empty."}
    }
    const number = parseCurrency(value)
    if (isNaN(number)) {
        return {err: "Not a number."}
    }
    if (number < 0) {
        return {err: "Cannot be negative."}
    }
    return {ok: number}
}

function isMouseEventInsideElement(event: MouseEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    )
}

function activateInput(input: HTMLDivElement) {
    const inputInput = input.querySelector<HTMLInputElement>(".input__input")!
    const inputClear = input.querySelector<HTMLButtonElement>(".input__clear")!
    const inputHint = input.querySelector<HTMLSpanElement>(".input__hint")!
    const hint = inputHint.textContent
    let lastError: string | null = null
    function showHint() {
        if (lastError === null) return
        lastError = null
        input.classList.remove("input--invalid")
        inputHint.animate([{}, {opacity: 0}], {duration: 100}).onfinish = () => {
            inputHint.classList.remove("input__error")
            inputHint.classList.add("input__hint")
            inputHint.textContent = hint
        }
    }
    function showError(error: string) {
        if (lastError === error) return
        lastError = error
        input.classList.add("input--invalid")
        inputHint.animate([{}, {opacity: 0}], {duration: 100}).onfinish = () => {
            inputHint.classList.remove("input__hint")
            inputHint.classList.add("input__error")
            inputHint.textContent = `ⓘ ${error}`
        }
    }
    let clearShown = false
    function hideClear() {
        if (!clearShown) return
        clearShown = false
        inputClear.animate([{}, {opacity: 0}], {duration: 100}).onfinish = () => {
            inputClear.classList.add("hidden")
        }
    }
    function showClear() {
        if (clearShown) return
        clearShown = true
        inputClear.classList.remove("hidden")
        inputClear.animate([{opacity: 0}, {opacity: 1}], {duration: 100})
    }
    inputClear.onclick = () => {
        inputInput.value = ""
        setTimeout(hideClear, 100)
        showHint()
    }
    function validate(): Result<number, string> {
        const result = validateCurrency(inputInput.value)
        if ("err" in result) {
            showError(result.err)
        } else {
            showHint()
        }
        return result
    }
    let timeout = undefined
    inputInput.oninput = () => {
        clearTimeout(timeout)
        if (inputInput.value !== "") {
            showClear()
            setTimeout(validate, 500)
        } else {
            hideClear()
            showHint()
        }
    }
    return {validate}
}

interface SelectHandle<T extends string> {
    value: T | null
    validate: () => void
}

function activateSelect<T extends string>(select: HTMLDivElement): SelectHandle<T> {
    const handle: SelectHandle<T> = {
        value: null,
        validate: () => {
            if (handle.value === null) {
                showError("This field is required.")
            } else {
                showHint()
            }
        },
    }
    const selectButton = select.querySelector<HTMLButtonElement>(".select__button")!
    const selectSelected = select.querySelector<HTMLButtonElement>(".select__selected")!
    const selectOptions = select.querySelector<HTMLDivElement>(".select__options")!
    const options = Array.from(
        selectOptions.querySelectorAll<HTMLButtonElement>(".select__option")
    )
    const inputHint = select.querySelector<HTMLSpanElement>(".select__hint")!
    const hint = inputHint.textContent
    let lastError: string | null = null
    function showHint() {
        if (lastError === null) return
        lastError = null
        select.classList.remove("select--invalid")
        inputHint.animate([{}, {opacity: 0}], {duration: 100}).onfinish = () => {
            inputHint.classList.remove("select__error")
            inputHint.classList.add("select__hint")
            inputHint.textContent = hint
        }
    }
    function showError(error: string) {
        if (lastError === error) return
        lastError = error
        select.classList.add("select--invalid")
        inputHint.animate([{}, {opacity: 0}], {duration: 100}).onfinish = () => {
            inputHint.classList.remove("select__hint")
            inputHint.classList.add("select__error")
            inputHint.textContent = `ⓘ ${error}`
        }
    }
    function show() {
        selectButton.classList.add("select__button--open")
        selectOptions.classList.remove("hidden")
        selectOptions.animate(
            [
                {opacity: 0, scale: 0.5, transform: "translateY(-1rem)"},
                {opacity: 1, scale: 1, transform: "translateY(0.5rem)"},
            ],
            {duration: 200, easing: "ease"}
        )
        function onOutsideClick(event: MouseEvent) {
            if (isMouseEventInsideElement(event, selectButton)) return
            if (isMouseEventInsideElement(event, selectOptions)) return
            hide()
            window.removeEventListener("click", onOutsideClick)
        }
        window.addEventListener("click", onOutsideClick)
    }
    function hide() {
        selectButton.classList.remove("select__button--open")
        selectOptions.animate(
            [
                {opacity: 1, scale: 1, transform: "translateY(0.5rem)"},
                {opacity: 0, scale: 0.5, transform: "translateY(-1rem)"},
            ],
            {duration: 200, easing: "ease"}
        ).onfinish = () => {
            selectOptions.classList.add("hidden")
        }
    }
    for (const option of options) {
        option.onclick = () => {
            for (const option of options) {
                option.classList.remove("select__option--selected")
            }
            option.classList.add("select__option--selected")
            handle.value = option.dataset.key as T
            selectSelected.textContent = option.textContent
            hide()
            showHint()
        }
    }
    selectButton.onclick = () => {
        if (selectOptions.classList.contains("hidden")) {
            show()
        } else {
            hide()
        }
    }
    return handle
}

function activateToast(toast: HTMLDivElement) {
    const closeBtn = toast.querySelector<HTMLButtonElement>(".toast__close")!
    toast.animate(
        [{transform: "translateY(100%)", scale: 0.9, opacity: 0}, {scale: 0.95}, {}],
        {duration: 500, easing: "ease"}
    )
    function close() {
        toast.animate(
            [
                {},
                {scale: 0.95},
                {transform: "translateY(100%)", scale: 0.9, opacity: 0},
            ],
            {duration: 500, easing: "ease"}
        ).onfinish = () => {
            toast.remove()
        }
    }
    closeBtn.onclick = close
    return {close}
}

function activateToasts(toasts: HTMLDivElement) {
    return {
        create: (
            message: string,
            {
                duration,
            }: {
                duration?: number
            } = {
                duration: 3000,
            }
        ) => {
            const toast = document.createElement("div")
            toast.classList.add("toast")
            const toastClose = document.createElement("button")
            toastClose.classList.add(
                "toast__close",
                "icon-button",
                "icon-button--clear-dark"
            )
            toastClose.textContent = "close"
            const toastMessage = document.createElement("p")
            toastMessage.classList.add("toast__message")
            toastMessage.textContent = message
            toast.append(toastClose, toastMessage)
            const toastHandle = activateToast(toast)
            toasts.append(toast)
            if (duration) {
                setTimeout(() => {
                    toastHandle.close()
                }, duration)
            }
            return toastHandle
        },
    }
}

const toasts = activateToasts(document.getElementById("toasts") as HTMLDivElement)

function activateForm(
    form: HTMLDivElement,
    options: {
        onCalculate: (overallIncome: number) => void
    }
) {
    const grossAnnualIncome = activateInput(
        form.querySelector<HTMLDivElement>("& > .gross-annual-income")!
    )
    const extraIncome = activateInput(
        form.querySelector<HTMLDivElement>("& > .extra-income")!
    )
    const totalApplicableDeductions = activateInput(
        form.querySelector<HTMLDivElement>("& > .total-applicable-deductions")!
    )
    const ageGroup = activateSelect<"BELOW_40" | "BETWEEN_40_AND_60" | "ABOVE_60">(
        form.querySelector<HTMLDivElement>("& > .age-group")!
    )
    const calculate = form.querySelector<HTMLButtonElement>("& > .calculate")!
    calculate.onclick = () => {
        const grossAnnualIncomeValue = grossAnnualIncome.validate()
        if ("err" in grossAnnualIncomeValue) {
            toasts.create(grossAnnualIncomeValue.err)
            return
        }
        const extraIncomeValue = extraIncome.validate()
        if ("err" in extraIncomeValue) {
            toasts.create(extraIncomeValue.err)
            return
        }
        const totalApplicableDeductionsValue = totalApplicableDeductions.validate()
        if ("err" in totalApplicableDeductionsValue) {
            toasts.create(totalApplicableDeductionsValue.err)
            return
        }
        ageGroup.validate()
        if (ageGroup.value === null) {
            toasts.create("Please select an age group.")
            return
        }
        const overallIncome = getOverallIncome(
            grossAnnualIncomeValue.ok,
            extraIncomeValue.ok,
            totalApplicableDeductionsValue.ok,
            parseAgeGroup(ageGroup.value)
        )
        options.onCalculate(overallIncome)
    }
}

function activateModal(modalBackdrop: HTMLDivElement) {
    const modal = modalBackdrop.querySelector<HTMLDivElement>("& > .modal")!
    const incomeModal = modal.querySelector<HTMLDivElement>("& > .income-modal")!
    const incomeModalIncome = incomeModal.querySelector<HTMLDivElement>(
        "& > .income-modal__income"
    )!
    const modalHeader = modal.querySelector<HTMLDivElement>("& > .modal-header")!
    const modalHeaderClose = modalHeader.querySelector<HTMLButtonElement>(
        "& > .modal-header__close"
    )!
    modalBackdrop.onclick = (event) => {
        if (isMouseEventInsideElement(event, modal)) return
        close()
    }
    function open() {
        modalBackdrop.classList.remove("hidden")
        modalBackdrop.animate([{opacity: 0}, {opacity: 1}], {
            duration: 200,
            easing: "ease",
        }).onfinish = () => {
            modal.classList.remove("hidden")
            modal.animate(
                [
                    {opacity: 0, transform: "translateY(50%)", scale: 0.5},
                    {opacity: 1, transform: "translateY(0)", scale: 1},
                ],
                {
                    duration: 200,
                    easing: "ease",
                }
            )
        }
    }
    function close() {
        modal.animate(
            [
                {opacity: 1, transform: "translateY(0)", scale: 1},
                {opacity: 0, transform: "translateY(50%)", scale: 0.5},
            ],
            {
                duration: 200,
                easing: "ease",
            }
        ).onfinish = () => {
            modal.classList.add("hidden")
            modalBackdrop.animate([{opacity: 1}, {opacity: 0}], {
                duration: 200,
                easing: "ease",
            }).onfinish = () => {
                modalBackdrop.classList.add("hidden")
            }
        }
    }
    modalHeaderClose.onclick = () => {
        close()
    }
    return {
        show: (overallIncome: number) => {
            incomeModalIncome.textContent = `₹${overallIncome.toLocaleString()}`
            open()
        },
    }
}

const modal = activateModal(document.getElementById("modal") as HTMLDivElement)

const form = activateForm(document.getElementById("form") as HTMLDivElement, {
    onCalculate: (overallIncome) => {
        modal.show(overallIncome)
    },
})
