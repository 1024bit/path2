/**
 *  An implementing of Node.js Path at http://www.nodejs.org/api/path.html
 *  Only support Unix-Style path, begining of slashes like this: /c/html/www
 */
(function(global, factory) {
    // Node.js, CommonJS, CommonJS Like
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global, true);
    } else {
        factory(global);
    }
})(this, function(global, noGlobal) {
    var
    // Normalize
    RE_MULTI_SLASHES = /\/\/+/g,
    RE_UP_DIR = /\/[^/]+\/\.{2}/,
    RE_ROOT_DIR = /^\/\.\.?\/?/, // /../, /.., /., /./
    RE_SELF_DIR = /\/\./g,

    RE_TAIL_SLASHES = /\/$/,
    RE_HEAD_TAIL_SLASHES = /^\/|\/$/,
    RE_DIR = /[^/]+/g,
    RE_BASENAME = /([^/]+)(\..+)$/,

    path2 = {
        // Windows: [a-z]:/
        root: '/',
        sep: '/',
        delimiter: ':',
        // Normalize a string path, taking care of '..' and '.' parts,
        // multiple slashes are replaced by a single one
        normalize: function(p) {
            while (RE_UP_DIR.test(p)) {
                p = p.replace(RegExp.lastMatch, '');
            }
            return p.replace(RE_MULTI_SLASHES, '/')
                    .replace(RE_ROOT_DIR, '/')
                    .replace(RE_SELF_DIR, '');
        },
        //
        join: function() {
            return path.normalize(slice.call(arguments, 0).join('/'));
        },
        // ARG: ([from ...], to)
        // Resolves to to an absolute path
        // If to isn't already absolute from arguments are prepended in right to left order, until an absolute path is found
        // You should always manually add the CURRENT_WORKING_DIRECTORY as the first arg,
        // Because of you can't get the CURRENT_WORKING_DIRECTORY in browser env
        resolve: function() {
            var
            to = slice.call(arguments, -1),
            from = slice.call(arguments, 0, -1),
            p, prev;

            if (!to.indexOf('/')) {
                p = to;
            } else {
                while ((prev = from.pop())) {
                    p = prev + '/' + to;
                    if (!prev.indexOf('/')) break;
                }
            }
            p = path.normalize(p);
            // Trailing slashes are removed unless the path gets resolved to the root directory
            return p === root ? p : p.replace(RE_TAIL_SLASHES, '');
        },
        // Solve the relative path from from to to
        relative: function(from, to) {
            var i = 0;
            from = path.resolve(from).replace(RE_HEAD_TAIL_SLASHES, '').split('/');
            to = path.resolve(to).replace(RE_HEAD_TAIL_SLASHES, '').split('/');

            for (; i < from.length; i++) {
                if (from[i] !== to[i]) break;
                from.shift();
                to.shift();
            }
            return path.normalize(Array(from.length).join('../') + to.join('/'));
        },
        // Return the directory name of a path
        dirname: function(p) {
            var l = p.length, index = p.lastIndexOf('/');
            p = p.substring(0, index);
            if (index === l) p = p.substring(0, p.lastIndexOf('/'));
            return p;
        },
        // Return the last portion of a path
        basename: function(p, ext) {
            if (RE_BASENAME.test(p)) {
                if (ext === RegExp.$2) return RegExp.$1;
                return RegExp.lastMatch;
            }
            return '';
        },
        // Return the extension of the path,
        // from the last '.' to end of string in the last portion of the path
        extname: function(p) {
            var index = p.lastIndexOf('.');
            return index === -1 ? '' : p.slice(index);
        }
    };

    if (!noGlobal) {
        global.path2 = path2;
    }

    // Support cmd && amd
    if (define && (define.cmd || define.amd)) {
        return define('path2', [], factory);
    }
    // Common
    return factory(require);

    function factory(require, exports) {
        var path = require('path'), key;

        if (typeof path === 'object')
            for (key in path)
                path2[key] = path[key];

        return path2;
    }
});