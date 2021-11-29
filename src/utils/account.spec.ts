import { expect } from 'chai';
import { toBasiliskFormattedAddress } from './account';

describe('utils/account', () => {
    it('can encode to Basilisk formatted address', () => {
        successCase(
            '5EvK2PEfHDXgodGLjk3pr121vmdXfWqmZ5htFBe8aZN56qsm',
            'bXjT2D2cuxUuP2JzddMxYusg4cKo3wENje5Xdk3jbNwtRvStq'
        );
        successCase(
            '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            'bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak'
        );
        successCase(
            '5EDq4qrf3QN5AmKSAQ6Dn5CDUkJU6CZBreR6N45M5zd8rGmL',
            'bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS'
        );
    });

    function successCase(address: string, encodedAddress: string) {
        const basiliskAddress = toBasiliskFormattedAddress(address);
        expect(basiliskAddress).to.equal(encodedAddress);
    }
});
