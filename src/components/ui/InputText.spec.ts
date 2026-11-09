import { userEvent } from "@testing-library/user-event"
import { render, screen } from "@testing-library/vue"
import { describe, it, expect } from "vitest"
import { ref } from "vue"
import InputText from "./InputText.vue"

describe("InputText", () => {
  it("renders a textbox", () => {
    render(InputText)

    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("reflects the model value", () => {
    render(InputText, { props: { modelValue: "Hallo" } })

    expect(screen.getByRole("textbox")).toHaveValue("Hallo")
  })

  it("updates the model when the user types", async () => {
    const user = userEvent.setup()
    const { emitted } = render(InputText, { props: { modelValue: "" } })

    await user.type(screen.getByRole("textbox"), "abc")

    const updates = emitted("update:modelValue") as unknown[][]
    expect(updates.at(-1)?.[0]).toBe("abc")
  })

  it("passes through native attributes", () => {
    render(InputText, {
      attrs: {
        placeholder: "Suche",
        type: "search",
        "aria-label": "Suchfeld",
      },
    })

    const input = screen.getByRole("searchbox", { name: "Suchfeld" })
    expect(input).toHaveAttribute("placeholder", "Suche")
  })

  it("forwards a fallthrough id to the input so a label can target it", () => {
    render({
      components: { InputText },
      template: `<div>
        <label for="my-input">Suchbegriff</label>
        <InputText id="my-input" />
      </div>`,
    })

    const input = screen.getByLabelText("Suchbegriff")
    expect(input).toBeInstanceOf(HTMLInputElement)
    expect(input).toHaveAttribute("id", "my-input")
  })

  it("applies a fallthrough class to the input", () => {
    render(InputText, { attrs: { class: "grow" } })

    expect(screen.getByRole("textbox")).toHaveClass("grow")
  })

  it("reflects the disabled attribute", () => {
    render(InputText, { attrs: { disabled: true } })

    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("exposes the underlying input element", () => {
    const inputTextRef = ref<{ input: HTMLInputElement } | null>(null)
    render({
      components: { InputText },
      setup: () => ({ inputTextRef }),
      template: `<InputText ref="inputTextRef" />`,
    })

    expect(inputTextRef.value?.input).toBeInstanceOf(HTMLInputElement)
  })
})
