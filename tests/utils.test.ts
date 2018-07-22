import { extract, flatten, parseKey, pick } from 'src/helpers/utils';
test('extract', () => {
    const input = {
        field1: {
            fieldType: 'SIMPLE',
            value: 1,
        },
        field2: {
            fieldType: 'PARENT',
            fields: {
                field1: {
                    fieldType: 'SIMPLE',
                    value: '1',
                },
            },
        },
        field3: {
            fieldType: 'SIMPLE',
            value: '',
        },
    };
    const expectation = extract(input as any, 'value');
    expect(expectation).toEqual({
        field1: 1,
        field2: {
            field1: '1',
        },
        field3: '',
    });
});

test('flatten', () => {
    const input = {
        field1: 1,
        field2: {
            field1: [],
            field2: '3',
        },
        field3: {
            field1: {
                field1: [{
                    arrField: 1,
                }, {
                    arrField: 2,
                }],
                field2: 5,
            },
        },
    };
    expect(flatten(input)).toEqual({
        field1: 1,
        'field2.field1': [],
        'field2.field2': '3',
        'field3.field1.field1[0].arrField': 1,
        'field3.field1.field1[1].arrField': 2,
        'field3.field1.field2': 5,
    });
});

test('parseKey', () => {
    const tests = [{
        input: 'field1.field2.field3',
        output: ['field1', 'fields', 'field2', 'fields', 'field3'],
    }, {
        input: 'field1[2].field3',
        output: ['field1', 'fields', 2, 'field3'],
    }, {
        input: 'field1[2].field3.field4[5]',
        output: ['field1', 'fields', 2, 'field3', 'fields', 'field4', 'fields', 5],
    }];

    tests.forEach(tst => {
        const parsed = parseKey(tst.input);
        expect(parsed).toEqual(tst.output);
    });
});

test('pick', () => {
    const target = { a: 'a', b: 2, c: {
        c1: 3,
    }, d: [] };
    const tests = [{
        input: ['a', 'b'],
        output: { a: 'a', b: 2 },
    }, {
        input: ['a', 'c'],
        output: { a: 'a', c: { c1: 3 } },
    }];

    tests.forEach(({ input, output }) => {
        const parsed = pick(target, input as any);
        expect(parsed).toEqual(output);
    });
});