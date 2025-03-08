// Mock API implementation for webpack testing
// This provides a minimal mock of the Joplin API for testing purposes
module.exports = {
    __esModule: true,
    default: {
        plugins: { register: () => { } },
        commands: { register: () => Promise.resolve() },
        settings: {
            registerSection: () => Promise.resolve(),
            registerSettings: () => Promise.resolve(),
            value: () => Promise.resolve(),
            setValue: () => Promise.resolve(),
            onChange: () => Promise.resolve()
        },
        views: {
            menuItems: { create: () => Promise.resolve() },
            toolbarButtons: { create: () => Promise.resolve() },
            panels: {
                create: () => Promise.resolve(),
                setHtml: () => Promise.resolve(),
                addScript: () => Promise.resolve(),
                onMessage: () => Promise.resolve(),
                postMessage: () => Promise.resolve(),
                show: () => Promise.resolve(),
                hide: () => Promise.resolve()
            }
        },
        data: {
            get: () => Promise.resolve(),
            put: () => Promise.resolve()
        },
        interop: {
            registerExportModule: () => Promise.resolve()
        },
        require: (moduleName) => {
            // Mock implementation of joplin.require
            if (moduleName === 'fs-extra') {
                return {
                    writeFileSync: () => { },
                    readFileSync: () => '',
                    existsSync: () => false,
                    mkdirSync: () => { },
                    copySync: () => { }
                };
            }
            if (moduleName === 'path') {
                return {
                    join: (...args) => args.join('/'),
                    dirname: (p) => p.split('/').slice(0, -1).join('/'),
                    basename: (p) => p.split('/').pop()
                };
            }
            return {};
        },
        versionInfo: () => Promise.resolve({ version: '2.0.0' }),
        dialogs: {
            showOpenDialog: () => Promise.resolve({ filePaths: [] })
        }
    }
}; 