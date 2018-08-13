import { init } from '../../src';

const config = {
    name: 'test',
    fields: {
        providers: {
            default: {
                text: {
                    rules: 'required|string',
                },
                name: {
                    rules: 'required|string',
                },
                categories: {
                    rules: 'array',
                    options: [
                        'one',
                        'two',
                        'three',
                    ],
                },
            },
            fields: [
                {
                    categories: {
                        value: [
                            'one',
                            'two',
                        ],
                    },
                    id: {
                        value: '123abc',
                    },
                    name: {
                        value: 'john doe',
                    },
                    text: {
                        value: 'hello world',
                    },
                },
                {
                    categories: {
                        value: [
                            'one',
                            'three',
                        ],
                    },
                    test: {
                        value: '456def',
                    },
                    name: {
                        value: 'jane doe',
                    },
                    text: {
                        value: 'hi globe',
                    },
                },
            ],
        },
    },
};

describe('Issue #17', () => {
    it('should initilise succesfully', () => {
        const result = init(config);
        expect(result).toBeDefined();
    });
});
