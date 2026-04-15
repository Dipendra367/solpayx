import * as anchor from "@anchor-lang/core"
import { Program } from "@anchor-lang/core"
import { expect } from "chai"
import { Remittance } from "../target/types/remittance"

describe("remittance", () => {
  it("should compile with Anchor types", () => {
    const program = {} as Program<Remittance>
    expect(program).to.exist
  })
})
