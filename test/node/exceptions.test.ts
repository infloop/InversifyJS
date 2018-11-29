import { expect } from "chai";
import * as ERROR_MSGS from "../../src/constants/error_msgs";
import { Container, inject, injectable } from "../../src/inversify";

describe("Node", async () => {

    it("Should throw if circular dependencies found", async () => {

        interface A {}
        interface B {}
        interface C {}
        interface D {}

        @injectable()
        class A implements A {
            public b: B;
            public c: C;
            public constructor(
                @inject("B")  b: B,
                @inject("C")  c: C
            ) {
                this.b = b;
                this.c = c;
            }
        }

        @injectable()
        class B implements B {}

        @injectable()
        class C implements C {
            public d: D;
            public constructor(@inject("D") d: D) {
                this.d = d;
            }
        }

        @injectable()
        class D implements D {
            public a: A;
            public constructor(@inject("A") a: A) {
                this.a = a;
            }
        }

        const container = new Container();
        container.bind<A>("A").to(A);
        container.bind<B>("B").to(B);
        container.bind<C>("C").to(C);
        container.bind<D>("D").to(D);

        async function  willThrow() {
            const a = await container.get<A>("A");
            return a;
        }

        expect(willThrow).to.throw(
            `${ERROR_MSGS.CIRCULAR_DEPENDENCY} A --> C --> D --> A`
        );

    });

});
