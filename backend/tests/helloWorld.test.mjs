// backend/tests/helloWorld.test.mjs
import { expect } from 'chai';

function helloWorld() {
    return "Hello, World!";
}

describe('helloWorld', () => {
    it('should return "Hello, World!"', () => {
        const result = helloWorld();
        expect(result).to.equal('Hello, World!');
    });
});