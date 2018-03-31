import { flatten, parseKey, pick } from 'es/helpers/utils';

test('flatten', () => {
    const input = {
        field1: 1,
        field2: {
            field1: [],
            field2: '3',
        },
        field3: {
            field1: {
                field1: [],
                field2: 5,
            },
        },
    };
    expect(flatten(input)).toEqual({
        field1: 1,
        'field2.field1': [],
        'field2.field2': '3',
        'field3.field1.field1': [],
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

// test('check for thunk', () => {
//     console.log(checkForThunk());
// });
