export class RandomGenerator {
    #state
    #seed
    get state() { return this.#state }
    get seed() { return this.#seed }

    nextInt() {
        this.#state = Math.imul(this.#state, 1664525) + this.increasement | 0;

        const xorshifted = (((this.#state >>> 5) ^ this.#state) >>> 2) >>> 0;
        const rot = this.#state >>> 27;

        return (xorshifted >>> rot) | (xorshifted << ((-rot) & 31));
    }

    nextFloat() {
        return (this.nextInt() >>> 0) / 0xFFFFFFFF;
    }
    randomRange(min, max) {
        min = min | 0;
        max = max | 0;
        return min + ((this.nextInt() >>> 0) % ((max - min + 1) >>> 0));
    }
    setSeed(seed, sequence = 1) {
        if (!seed) {
            seed = Math.random();
        }

        const seedAsNumber = Number(seed)
        if (Number.isFinite(seedAsNumber) && (seedAsNumber | 0) === seedAsNumber) {
            this.#seed = seedAsNumber
        }
        else {
            
            let bytes = new TextEncoder().encode(String(seed));
            let hash = 0x811C9DC5;

            for (let i = 0; i < bytes.length; i++) {
                hash ^= bytes[i];
                hash = Math.imul(hash, 0x01000193);
            }
            this.#seed = hash >>> 0;
        }
        
        this.#state = 0 >>> 0;
        this.increasement = ((sequence << 1) | 1) >>> 0;
        this.nextInt();
        this.#state = (this.#state + this.#seed) >>> 0;
        this.nextInt();
    }
    constructor(seed, sequence = 1) {
        this.setSeed(seed, sequence)
    }
}