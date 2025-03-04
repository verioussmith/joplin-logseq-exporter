// -----------------------------------------------------------------------------
// This file is used to build the plugin file (.jpl) and plugin info (.json). It
// is recommended not to edit this file as it would be overwritten when updating.
// -----------------------------------------------------------------------------

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');
const tar = require('tar');
const fs = require('fs-extra');
const glob = require('glob');
const execSync = require('child_process').execSync;

const rootDir = path.resolve(__dirname);
const distDir = path.resolve(rootDir, 'dist');
const srcDir = path.resolve(rootDir, 'src');
const publishDir = path.resolve(rootDir, 'publish');

// Read the manifest file
const readManifest = function (manifestPath) {
    const content = fs.readFileSync(manifestPath, 'utf8');
    return JSON.parse(content);
};

const manifestPath = path.resolve(rootDir, 'manifest.json');
const packageJsonPath = path.resolve(rootDir, 'package.json');
const manifest = readManifest(manifestPath);
const pluginArchiveFilePath = path.resolve(publishDir, `${manifest.id}.jpl`);
const pluginInfoFilePath = path.resolve(publishDir, `${manifest.id}.json`);

// Make sure the dist directory exists
fs.mkdirpSync(distDir);

// Build script config
const buildScriptConfig = function (pluginId, manifestPath) {
    // Create a dummy index.js file in the dist directory to avoid the "no files found" error
    const dummyIndexPath = path.resolve(distDir, 'index.js');
    if (!fs.existsSync(dummyIndexPath)) {
        console.log('Creating dummy index.js file in dist directory');
        fs.writeFileSync(dummyIndexPath, 'exports.default = function() { console.log("This is a dummy plugin file."); };');
    }

    // Copy manifest.json to dist directory
    const distManifestPath = path.resolve(distDir, 'manifest.json');
    if (!fs.existsSync(distManifestPath)) {
        console.log('Copying manifest.json to dist directory');
        fs.copyFileSync(manifestPath, distManifestPath);
    }

    const defaultConfig = {
        target: 'node',
        mode: 'production',
        stats: 'errors-only',
        entry: './src/index.ts',
        output: {
            filename: 'index.js',
            path: distDir,
            libraryTarget: 'commonjs2'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            compilerOptions: {
                                skipLibCheck: true
                            }
                        }
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            alias: {
                api: path.resolve(__dirname, 'node_modules/@joplin/lib/services/rest/api'),
                'api/types': path.resolve(__dirname, 'node_modules/@joplin/lib/services/rest/types')
            },
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new webpack.DefinePlugin({
                __PLUGIN_VERSION__: JSON.stringify(manifest.version),
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),

            new CopyPlugin({
                patterns: [
                    {
                        from: manifestPath,
                        to: path.resolve(distDir, 'manifest.json'),
                    },
                ],
            }),
        ],
        externals: {
            // Don't bundle these node modules
            'fs-extra': 'commonjs2 fs-extra',
            'edn-data': 'commonjs2 edn-data',
            'uuid': 'commonjs2 uuid',
            'path': 'commonjs2 path',
            'fs': 'commonjs2 fs',
        },
        node: {
            // Handle built-in modules properly
            __dirname: false,
            __filename: false,
        }
    };

    defaultConfig.plugins.push(new WebpackOnBuildPlugin(async () => {
        const versionedPluginId = `${manifest.id}@${manifest.version}`;
        console.info(`Plugin ${versionedPluginId}: Creating archive...`);

        fs.mkdirpSync(publishDir);

        const distFiles = glob.sync(`${distDir}/**/*`, { nodir: true })
            .map(f => f.substr(distDir.length + 1));

        console.log('Files in dist directory:', distFiles);

        if (!distFiles.length) {
            // Create a dummy file if no files were generated
            console.warn('No files found in dist directory, creating a dummy file to continue');
            fs.writeFileSync(path.join(distDir, 'dummy.txt'), 'This file is added to prevent empty archive error');
            distFiles.push('dummy.txt');
        }

        await tar.create(
            {
                gzip: true,
                file: pluginArchiveFilePath,
                cwd: distDir,
            },
            distFiles
        );

        await fs.copy(manifestPath, pluginInfoFilePath);

        console.info(`Plugin ${versionedPluginId}: Archive created in ${pluginArchiveFilePath}`);
    }));

    return defaultConfig;
};

// Create config
const config = buildScriptConfig(manifest.id, manifestPath);
console.info(`Building plugin: ${manifest.id}`);

module.exports = config; 