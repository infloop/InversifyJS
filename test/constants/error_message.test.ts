import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";

describe("ERROR_MSGS", async () => {

  it("Should be able to customize POST_CONSTRUCT_ERROR", async () => {
      const error = ERROR_MSGS.POST_CONSTRUCT_ERROR("a", "b");
      expect(error).eql("@postConstruct error in class a: b");
  });

});
