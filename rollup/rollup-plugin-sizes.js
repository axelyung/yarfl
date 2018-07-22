let path = require('path'),
    _ = require('lodash'),
    parse = require('module-details-from-path'),
    filesize = require('filesize');


function defaultReport(details) {
    let args = Object.assign({}, details);

    // Sort
    args.totals.sort((a, b) => b.size - a.size);
    console.log('%s:', args.input);

    args.totals.forEach((item) => {
        console.log(
            '%s - %s (%s%%)',
            item.name,
            filesize(item.size),
            ((item.size / args.total) * 100).toFixed(2),
        );

        if (args.options.details) {
            args.data[item.name]
                .sort((a, b) => b.size - a.size)
                .forEach(file => console.log(
                    '\t%s - %s (%s%%)',
                    file.path,
                    filesize(file.size),
                    ((file.size / item.size) * 100).toFixed(2),
                ));
        }
    });
}

export default (options = false) => {
    let input, base, report;

    report = (options && options.report) || defaultReport;

    return {
        name: 'rollup-plugin-sizes',

        // Grab some needed bits out of the options
        options: (config) => {
            input = config.input;
            base = path.dirname(config.input);
        },

        // Spit out stats during bundle generation
        ongenerate: (details) => {
            let data = {},
                totals = [],
                total = 0;
            let modules = details.bundle.modules;
            // console.log(JSON.stringify(details.bundle, null, 4));
            // let dest = path.join(__dirname, '../../test.json');
            // require('fs').writeFileSync(dest, JSON.stringify(details.bundle.modules, null, 4));
            const checked = Array.isArray(modules) || Object.entries(modules).map((e) => {
                let value = e[1];
                value.id = e[0];
                return value;
            });
            checked.forEach((module) => {
                let parsed;

                // Handle rollup-injected helpers
                if (module.id.indexOf('\u0000') === 0) {
                    parsed = {
                        name: 'rollup helpers',
                        basedir: '',
                        path: module.id.replace('\u0000', ''),
                    };
                } else {
                    parsed = parse(module.id);

                    if (!parsed) {
                        parsed = {
                            name: 'app',
                            basedir: base,
                            path: path.relative(base, module.id),
                        };
                    }
                }

                if (!(parsed.name in data)) {
                    data[parsed.name] = [];
                }

                data[parsed.name].push(Object.assign(parsed, { size: (module.code || {}).length || module.renderedLength }));
            });

            // Sum all files in each chunk
            _.forEach(data, (files, name) => {
                let size = _.sumBy(files, 'size');

                total += size;

                totals.push({
                    name,
                    size,
                });
            });

            report({
                input,
                data,
                totals,
                total,
                options,
            });
        },
    };
};
