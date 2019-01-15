import { NativeModulesProxy } from 'expo-core';

const { ExpoImageManipulator } = NativeModulesProxy;

export { default as ExpoImageManipulatorView } from './ExpoImageManipulatorView';

export async function someGreatMethodAsync(options: any) {
  return await ExpoImageManipulator.someGreatMethodAsync(options);
}
