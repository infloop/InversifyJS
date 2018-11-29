import { expect } from "chai";
import { typeConstraint } from "../../src/syntax/constraint_helpers";

describe("BindingInSyntax", async () => {

    it("Should be return false when a request object is not provided", async () => {

        const result = typeConstraint("TYPE")(null);
        expect(result).to.eql(false);

    });

});
