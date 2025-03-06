// Mock API implementation for webpack
// This is a special export that makes sure we expose the global joplin at runtime
// while still satisfying webpack during build
module.exports = {
    // At runtime, this will be ignored and the real joplin will be used
    __esModule: true,
    default: global.joplin || {
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
        }
    }
}; 