import { screen } from "@testing-library/dom"
import { describe, expect, it } from "vitest"

describe("App", () => {
  it("shows Hello ds", () => {
    document.body.innerHTML = `
      <h1>TypeScript + Vite Application Template<h1>npm 
    `
    expect(
      screen.getByText("TypeScript + Vite Application Template"),
    ).toBeVisible()
  })
})
