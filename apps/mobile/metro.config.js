// apps/mobile has its own install (ADR-059), outside the npm workspaces. Metro also
// watches packages/contracts, whose generated types this app reads by path, and
// resolves every package from this app's node_modules only.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const contracts = path.resolve(projectRoot, "../../packages/contracts");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [contracts];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = { "@darkview/contracts": path.join(contracts, "generated") };

module.exports = config;
