'use strict';

const gulp = require('gulp');
const { resolve } = require('path');
const shell = require('gulp-shell');
const argv = require('minimist')(process.argv.slice(2));
const { Modules } = require('xdl');
const chalk = require('chalk');
const fs = require('fs-extra');

const { saveKernelBundlesAsync } = require('./bundle-tasks');
const { renameJNILibsAsync, updateExpoViewAsync } = require('./android-tasks');
const {
  addVersionAsync,
  removeVersionAsync,
  versionReactNativeIOSFilesAsync,
} = require('./ios-tasks');
const updateVendoredNativeModule = require('./update-vendored-native-module');
const outdatedVendoredNativeModules = require('./outdated-vendored-native-modules');
const AndroidExpolib = require('./android-versioning/android-expolib');
const androidVersionLibraries = require('./android-versioning/android-version-libraries');
const { publishPackagesAsync } = require('./publish-packages');

function updateExpoViewWithArguments() {
  if (!argv.abi) {
    throw new Error('Run with `--abi <abi version>`');
  }
  return updateExpoViewAsync(argv.abi);
}

function renameJNILibsWithABIArgument() {
  if (!argv.abi) {
    throw new Error('Must run with `--abi ABI_VERSION`');
  }

  return renameJNILibsAsync(argv.abi);
}

function addVersionWithArguments() {
  if (!argv.abi || !argv.root) {
    throw new Error('Run with `--abi <abi version> --root <path to exponent project root>`');
  }
  return addVersionAsync(argv.abi, argv.root);
}

function removeVersionWithArguments() {
  if (!argv.abi || !argv.root) {
    throw new Error('Run with `--abi <abi version> --root <path to exponent project root>`');
  }
  return removeVersionAsync(argv.abi, argv.root);
}

function versionIOSFilesWithArguments() {
  if (!argv.abi || !argv.filenames) {
    throw new Error('Run with --filenames=<glob pattern> --abi=<abi version>');
  }
  return versionReactNativeIOSFilesAsync(argv.filenames, argv.abi);
}

function runShellScriptWithABIArgument(script) {
  return gulp.series('assert-abi-argument', shell.task([`${script} ${argv.abi}`]));
}

gulp.task('assert-abi-argument', function(done) {
  if (!argv.abi) {
    throw new Error('Must run with `--abi ABI_VERSION`');
  }

  done();
});

gulp.task(
  'android-update-rn',
  gulp.series(
    shell.task(['pushd ../android; ./gradlew :tools:execute; popd']),
    gulp.parallel(
      AndroidExpolib.namespaceExpolibImportsAsync,
      AndroidExpolib.namespaceExpolibGradleDependenciesAsync
    )
  )
);

// Versioning (android)
gulp.task(
  'android-update-versioned-rn',
  shell.task([
    'rm -rf ../android/versioned-react-native/{ReactAndroid,ReactCommon}',
    'cp -r ../android/ReactCommon ../android/versioned-react-native/ReactCommon',
    'cp -r ../android/ReactAndroid ../android/versioned-react-native/ReactAndroid',
  ])
);
gulp.task('android-rename-jni-libs', renameJNILibsWithABIArgument);
gulp.task('android-build-aar', runShellScriptWithABIArgument('./android-build-aar.sh'));
gulp.task(
  'android-copy-native-modules',
  runShellScriptWithABIArgument('./android-copy-native-modules.sh')
);
gulp.task(
  'android-copy-universal-modules',
  gulp.series(...Modules.getVersionableModulesForPlatform('android', argv.abi || 'UNVERSIONED').map(
    module => shell.task([
      `./android-copy-universal-module.sh ${argv.abi} ../packages/${module.libName}/${module.subdirectory}`
    ])
  ))
);
gulp.task('update-exponent-view', updateExpoViewWithArguments);
gulp.task(
  'android-add-rn-version',
  gulp.series(
    'android-update-versioned-rn',
    'android-rename-jni-libs',
    'android-build-aar',
    'android-copy-native-modules',
    'android-copy-universal-modules'
  )
);

// Versioning (ios)
gulp.task('ios-add-version', addVersionWithArguments);
gulp.task('ios-remove-version', removeVersionWithArguments);
gulp.task('ios-version-files', versionIOSFilesWithArguments);

// Update external dependencies
gulp.task('outdated-native-dependencies', async () => {
  const bundledNativeModules = JSON.parse(await fs.readFile('../packages/expo/bundledNativeModules.json', 'utf8'));
  const isModuleLinked = async packageName => await fs.pathExists(`../packages/${packageName}/package.json`);
  return await outdatedVendoredNativeModules({ bundledNativeModules, isModuleLinked });
});

gulp.task('update-react-native-svg', () => {
  return updateVendoredNativeModule({
    argv,
    name: 'react-native-svg',
    repoUrl: 'https://github.com/react-native-community/react-native-svg.git',
    sourceIosPath: 'ios',
    targetIosPath: 'Api/Components/Svg',
    sourceAndroidPath: 'android/src/main/java/com/horcrux/svg',
    targetAndroidPath: 'modules/api/components/svg',
    sourceAndroidPackage: 'com.horcrux.svg',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.components.svg',
    installableInManagedApps: true,
  });
});

gulp.task('update-react-native-gesture-handler-code', () => {
  return updateVendoredNativeModule({
      argv,
      name: 'react-native-gesture-handler',
      repoUrl: 'https://github.com/expo/react-native-gesture-handler.git',
      sourceIosPath: 'ios',
      sourceAndroidPath: 'android/src/main/java/com/swmansion/gesturehandler/react',
      targetIosPath: 'Api/Components/GestureHandler',
      targetAndroidPath: 'modules/api/components/gesturehandler/react',
      sourceAndroidPackage: 'com.swmansion.gesturehandler.react',
      targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.components.gesturehandler.react',
      installableInManagedApps: true,
    });
  });
  
  gulp.task('update-react-native-gesture-handler-lib', () => {
    return updateVendoredNativeModule({
      argv,
      name: 'react-native-gesture-handler-lib',
      repoUrl: 'https://github.com/expo/react-native-gesture-handler.git',
      sourceAndroidPath: 'android/lib/src/main/java/com/swmansion/gesturehandler',
      targetAndroidPath: 'modules/api/components/gesturehandler',
      sourceAndroidPackage: 'com.swmansion.gesturehandler',
      targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.components.gesturehandler',
      installableInManagedApps: true,
    });
  });

gulp.task('update-react-native-gesture-handler', 
  gulp.series(
    'update-react-native-gesture-handler-lib',
    'update-react-native-gesture-handler-code'
  ));

gulp.task('update-amazon-cognito-identity-js', () => {
  return updateVendoredNativeModule({
    argv,
    name: 'amazon-cognito-identity-js',
    repoUrl: 'https://github.com/aws/amazon-cognito-identity-js.git',
    sourceIosPath: 'ios',
    sourceAndroidPath: 'android/src/main/java/com/amazonaws',
    targetIosPath: 'Api/Cognito',
    targetAndroidPath: 'modules/api/cognito',
    sourceAndroidPackage: 'com.amazonaws',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.cognito',
    installableInManagedApps: false,
  });
});

gulp.task('update-react-native-maps', async () => {
  if (argv.ios || argv.allPlatforms) {
    await updateVendoredNativeModule({
      argv,
      name: 'react-native-google-maps',
      repoUrl: 'https://github.com/react-native-community/react-native-maps.git',
      sourceIosPath: 'lib/ios/AirGoogleMaps',
      targetIosPath: 'Api/Components/GoogleMaps',
      sourceAndroidPath: '',
      targetAndroidPath: '',
      sourceAndroidPackage: '',
      targetAndroidPackage: '',
      installableInManagedApps: true,
    });
  }
  return updateVendoredNativeModule({
    argv,
    name: 'react-native-maps',
    repoUrl: 'https://github.com/react-native-community/react-native-maps.git',
    sourceIosPath: 'lib/ios/AirMaps',
    sourceAndroidPath: 'lib/android/src/main/java/com/airbnb/android/react/maps',
    targetIosPath: 'Api/Components/Maps',
    targetAndroidPath: 'modules/api/components/maps',
    sourceAndroidPackage: 'com.airbnb.android.react.maps',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.components.maps',
    installableInManagedApps: true,
  });
});

gulp.task('update-react-native-view-shot', () => {
  console.warn('Heads up, iOS uses EX- instead of RN- symbol prefix');
  return updateVendoredNativeModule({
    argv,
    skipCleanup: true,
    name: 'react-native-view-shot',
    repoUrl: 'https://github.com/gre/react-native-view-shot.git',
    sourceIosPath: 'ios',
    sourceAndroidPath: 'android/src/main/java/fr/greweb/reactnativeviewshot',
    targetIosPath: 'Api',
    targetAndroidPath: 'modules/api/viewshot',
    sourceAndroidPackage: 'fr.greweb.reactnativeviewshot',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.viewshot',
  });
});

gulp.task('update-react-native-lottie', () => {
  return updateVendoredNativeModule({
    argv,
    name: 'lottie-react-native',
    repoUrl: 'https://github.com/react-native-community/lottie-react-native.git',
    sourceIosPath: 'src/ios/LottieReactNative',
    iosPrefix: 'LRN',
    sourceAndroidPath:
      'src/android/src/main/java/com/airbnb/android/react/lottie',
    targetIosPath: 'Api/Components/Lottie',
    targetAndroidPath: 'modules/api/components/lottie',
    sourceAndroidPackage: 'com.airbnb.android.react.lottie',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.components.lottie',
    installableInManagedApps: true,
  });
});

gulp.task('update-react-native-reanimated', () => {
  console.warn('NOTE: any files in com.facebook.react will not be updated -- you\'ll need to add these to ReactAndroid manually!')
  return updateVendoredNativeModule({
    argv,
    name: 'react-native-reanimated',
    repoUrl: 'https://github.com/kmagiera/react-native-reanimated.git',
    sourceIosPath: 'ios',
    sourceAndroidPath: 'android/src/main/java/com/swmansion/reanimated',
    targetIosPath: 'Api/Reanimated',
    targetAndroidPath: 'modules/api/reanimated',
    sourceAndroidPackage: 'com.swmansion.reanimated',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.reanimated',
    installableInManagedApps: true,
  });
});

gulp.task('update-react-native-screens', () => {
  return updateVendoredNativeModule({
    argv,
    name: 'react-native-screens',
    repoUrl: 'https://github.com/kmagiera/react-native-screens.git',
    sourceIosPath: 'ios',
    sourceAndroidPath: 'android/src/main/java/com/swmansion/rnscreens',
    targetIosPath: 'Api/Screens',
    targetAndroidPath: 'modules/api/screens',
    sourceAndroidPackage: 'com.swmansion.rnscreens',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.screens',
    installableInManagedApps: true,
  });
});

gulp.task('update-react-native-webview', () => {
  console.warn(chalk.bold(chalk.yellow(`\n\`react-native-webview\` exposes \`useSharedPool\` property which has to be handled differently in Expo Client. After upgrading this library, please ensure that proper patch is in place.\n\nSee commit 0e7d25bd9facba74828a0af971293d30f9ba22fc.\n`)));
  return updateVendoredNativeModule({
    argv,
    name: 'react-native-webview',
    repoUrl: 'https://github.com/react-native-community/react-native-webview.git',
    sourceIosPath: 'ios',
    sourceAndroidPath: 'android/src/main/java/com/reactnativecommunity/webview',
    targetIosPath: 'Api/Components/WebView',
    targetAndroidPath: 'modules/api/components/webview',
    sourceAndroidPackage: 'com.reactnativecommunity.webview',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.components.webview',
    installableInManagedApps: true,
  });
});

gulp.task('update-react-native-netinfo', () => {
  return updateVendoredNativeModule({
    argv,
    name: 'react-native-netinfo',
    repoUrl: 'https://github.com/react-native-community/react-native-netinfo.git',
    sourceIosPath: 'ios',
    sourceAndroidPath: 'android/src/main/java/com/reactnativecommunity/netinfo',
    targetIosPath: 'Api/NetInfo',
    targetAndroidPath: 'modules/api/netinfo',
    sourceAndroidPackage: 'com.reactnativecommunity.netinfo',
    targetAndroidPackage: 'versioned.host.exp.exponent.modules.api.netinfo',
    installableInManagedApps: true,
  });
});

// Upload kernel bundles
gulp.task('bundle', saveKernelBundlesAsync);
gulp.task('android-jarjar-on-aar', androidVersionLibraries.runJarJarOnAAR);
gulp.task('android-version-libraries', androidVersionLibraries.versionLibrary);

const GENERATE_LIBRARY_WRAPPERS = 'android-generate-library-wrappers';

const versioningArgs = task => {
  const obj = {};
  Object.keys(argv).forEach(k => {
    if (k !== '_') {
      if (k === 'apiLevel') {
        obj[k] = argv[k];
      } else if (k === 'wrapLibraries' || k === 'wrapGroupIds') {
        obj[k] = argv[k].split(',').filter(s => s !== '');
      } else {
        obj[k] = resolve(argv[k]);
      }
    }
  });
  return obj;
};

gulp.task(GENERATE_LIBRARY_WRAPPERS, async () =>
  androidVersionLibraries.generateSharedObjectWrappers(versioningArgs(GENERATE_LIBRARY_WRAPPERS))
);

// Publish packages
gulp.task(`publish-packages`, publishPackagesAsync);
