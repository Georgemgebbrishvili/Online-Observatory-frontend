// Release builds for Android, kept in config so `expo prebuild` can regenerate android/.
// - Signs release with the upload key named by its properties file (the key and its
//   password live outside the repository). Without the key a release build FAILS: a
//   Play upload signed with the debug key would be refused, or worse, accepted for a
//   test track and then impossible to update.
// - Builds the two ABIs phones run, and gives Gradle room on a 16 GB machine.
const { withAppBuildGradle, withGradleProperties } = require("expo/config-plugins");

const loader = `
def stellarKeystore = new Properties()
def stellarKeystoreFile = file(System.getenv("STELLAR_KEYSTORE_PROPERTIES") ?: "\${System.getProperty('user.home')}/Desktop/Stellar Observatory/Private/android/keystore.properties")
if (stellarKeystoreFile.exists()) stellarKeystoreFile.withInputStream { stellarKeystore.load(it) }
gradle.taskGraph.whenReady { graph ->
    def release = graph.allTasks.any { it.name ==~ /(assemble|bundle|package|sign).*Release.*/ }
    if (release && !stellarKeystore.storeFile) {
        throw new GradleException("Release builds need the upload key: no keystore.properties at \${stellarKeystoreFile}. Set STELLAR_KEYSTORE_PROPERTIES or restore the file; release never falls back to the debug key.")
    }
}
`;

const releaseConfig = `
        if (stellarKeystore.storeFile) {
            release {
                storeFile file(stellarKeystore.storeFile)
                storePassword stellarKeystore.storePassword
                keyAlias stellarKeystore.keyAlias
                keyPassword stellarKeystore.keyPassword
            }
        }`;

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let gradle = config.modResults.contents;
    if (gradle.includes("stellarKeystore")) return config;
    gradle = gradle.replace(/\nandroid \{/, `${loader}\nandroid {`);
    gradle = gradle.replace(/signingConfigs \{/, `signingConfigs {${releaseConfig}`);
    gradle = gradle.replace(
      /(release \{\s*\n(?:\s*\/\/.*\n)*\s*)signingConfig signingConfigs\.debug/,
      "$1signingConfig stellarKeystore.storeFile ? signingConfigs.release : signingConfigs.debug",
    );
    config.modResults.contents = gradle;
    return config;
  });
}

function withBuildProperties(config) {
  return withGradleProperties(config, (config) => {
    const set = (key, value) => {
      const item = config.modResults.find((entry) => entry.type === "property" && entry.key === key);
      if (item) item.value = value;
      else config.modResults.push({ type: "property", key, value });
    };
    set("reactNativeArchitectures", "armeabi-v7a,arm64-v8a");
    set("org.gradle.jvmargs", "-Xmx4096m -XX:MaxMetaspaceSize=1024m");
    return config;
  });
}

module.exports = (config) => withBuildProperties(withReleaseSigning(config));
