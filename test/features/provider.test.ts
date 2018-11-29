import { expect } from "chai";
import { Container, injectable } from "../../src/inversify";

describe("Provider", async () => {

    it("Should support complex asynchronous initialization processes", async () => {

        @injectable()
        class Ninja {
            public level: number;
            public rank: string;
            public constructor() {
                this.level = 0;
                this.rank = "Ninja";
            }
            public train(): Promise<number> {
                return new Promise<number>((resolve) => {
                    setTimeout(() => {
                        this.level += 10;
                        resolve(this.level);
                    },         10);
                });
            }
        }

        @injectable()
        class NinjaMaster {
            public rank: string;
            public constructor() {
                this.rank = "NinjaMaster";
            }
        }

        type NinjaMasterProvider = () => Promise<NinjaMaster>;

        const container = new Container();

        container.bind<Ninja>("Ninja").to(Ninja).inSingletonScope();
        container.bind<NinjaMasterProvider>("Provider<NinjaMaster>").toProvider((context) =>
            () =>
                new Promise<NinjaMaster>(async (resolve, reject) => {
                    const ninja = await context.container.get<Ninja>("Ninja");
                    ninja.train().then((level) => {
                        if (level >= 20) {
                            resolve(new NinjaMaster());
                        } else {
                            reject("Not enough training");
                        }
                    });
                }));

        const ninjaMasterProvider = await container.get<NinjaMasterProvider>("Provider<NinjaMaster>");

        // helper
        function valueOrDefault<T>(provider: () => Promise<T>, defaultValue: T) {
            return new Promise<T>((resolve, reject) => {
                provider().then((value) => {
                    resolve(value);
                }).catch(() => {
                    resolve(defaultValue);
                });
            });
        }

        let ninjaMaster = await valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" });
        expect(ninjaMaster.rank).to.eql("DefaultNinjaMaster");

        ninjaMaster = await valueOrDefault(ninjaMasterProvider, { rank: "DefaultNinjaMaster" });
        expect(ninjaMaster.rank).to.eql("NinjaMaster");
    });

    it("Should support custom arguments", async () => {

        const container = new Container();

        interface Sword {
            material: string;
            damage: number;
        }

        @injectable()
        class Katana implements Sword {
            public material: string;
            public damage: number;
        }

        type SwordProvider = (material: string, damage: number) => Promise<Sword>;

        container.bind<Sword>("Sword").to(Katana);

        container.bind<SwordProvider>("SwordProvider").toProvider<Sword>((context) =>
            (material: string, damage: number) =>
                new Promise<Sword>((resolve) => {
                    setTimeout(async () => {
                        const katana = await context.container.get<Sword>("Sword");
                        katana.material = material;
                        katana.damage = damage;
                        resolve(katana);
                    },         10);
                }));

        const katanaProvider = await container.get<SwordProvider>("SwordProvider");

        const powerfulGoldKatana = await katanaProvider("gold", 100);

        expect(powerfulGoldKatana.material).to.eql("gold");
        expect(powerfulGoldKatana.damage).to.eql(100);

        const notSoPowerfulGoldKatana = await katanaProvider("gold", 10);
        expect(notSoPowerfulGoldKatana.material).to.eql("gold");
        expect(notSoPowerfulGoldKatana.damage).to.eql(10);
    });

    it("Should support partial application of custom arguments", async () => {

        const container = new Container();

        interface Sword {
            material: string;
            damage: number;
        }

        @injectable()
        class Katana implements Sword {
            public material: string;
            public damage: number;
        }

        type SwordProvider = (material: string) => (damage: number) => Promise<Sword>;

        container.bind<Sword>("Sword").to(Katana);

        container.bind<SwordProvider>("SwordProvider").toProvider<Sword>((context) =>
            (material: string) =>
                (damage: number) =>
                    new Promise<Sword>((resolve) => {
                        setTimeout(async () => {
                            const katana = await context.container.get<Sword>("Sword");
                            katana.material = material;
                            katana.damage = damage;
                            resolve(katana);
                        },         10);
                    }));

        const katanaProvider = await container.get<SwordProvider>("SwordProvider");
        const goldKatanaProvider = katanaProvider("gold");

        const powerfulGoldKatana = await goldKatanaProvider(100);

        expect(powerfulGoldKatana.material).to.eql("gold");
        expect(powerfulGoldKatana.damage).to.eql(100);

        const notSoPowerfulGoldKatana = await goldKatanaProvider(10);
        expect(notSoPowerfulGoldKatana.material).to.eql("gold");
        expect(notSoPowerfulGoldKatana.damage).to.eql(10);

    });

    it("Should support the declaration of singletons", async () => {

        const container = new Container();

        interface Warrior {
            level: number;
        }

        @injectable()
        class Ninja implements Warrior {
            public level: number;
            public constructor() {
                this.level = 0;
            }
        }

        type WarriorProvider = (level: number) => Promise<Warrior>;

        container.bind<Warrior>("Warrior").to(Ninja).inSingletonScope(); // Value is singleton!

        container.bind<WarriorProvider>("WarriorProvider").toProvider<Warrior>((context) =>
            (increaseLevel: number) =>
                new Promise<Warrior>((resolve) => {
                    setTimeout(async () => {
                        const warrior = await context.container.get<Warrior>("Warrior"); // Get singleton!
                        warrior.level += increaseLevel;
                        resolve(warrior);
                    },         100);
                }));

        const warriorProvider = await container.get<WarriorProvider>("WarriorProvider");

        const warrior1 = await warriorProvider(10);

        expect(warrior1.level).to.eql(10);

        const warrior2 = await warriorProvider(10);
        expect(warrior2.level).to.eql(20);

    });

});
