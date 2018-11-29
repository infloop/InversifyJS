import { expect } from "chai";
import { Metadata } from "../../dts/planning/metadata";
import { postConstruct } from "../../src/annotation/post_construct";
import * as ERRORS_MSGS from "../../src/constants/error_msgs";
import * as METADATA_KEY from "../../src/constants/metadata_keys";
import { decorate } from "../../src/inversify";

describe("@postConstruct", async () => {

    it("Should generate metadata for the decorated method", async () => {
        class Katana {
            private useMessage: string;

            public use() {
                return "Used Katana!";
            }

            @postConstruct()
            public testMethod() {
                this.useMessage = "Used Katana!";
            }
            public debug() {
                return this.useMessage;
            }
        }
        const metadata: Metadata = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, Katana);
        expect(metadata.value).to.be.equal("testMethod");
    });

    it("Should throw when applied multiple times", async () => {
        function setup() {
            class Katana {
                @postConstruct()
                public testMethod1() {/* ... */}

                @postConstruct()
                public testMethod2() {/* ... */}
            }
            Katana.toString();
        }
        expect(setup).to.throw(ERRORS_MSGS.MULTIPLE_POST_CONSTRUCT_METHODS);
    });

    it("Should be usable in VanillaJS applications", async () => {

        const VanillaJSWarrior = function () {
                   // ...
        };
        VanillaJSWarrior.prototype.testMethod = function () {
            // ...
        };

        decorate(postConstruct(), VanillaJSWarrior.prototype, "testMethod");

        const metadata: Metadata = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, VanillaJSWarrior);
        expect(metadata.value).to.be.equal("testMethod");
    });

});
