import { expect } from "chai";
import { id } from "../../src/utils/id";

describe("ID", async () => {

  it("Should be able to generate an id", async () => {
      const id1 = id();
      expect(id1).to.be.a("number");
  });

});
