package expo.modules.imagemanipulator;

import android.content.Context;

import java.util.Arrays;
import java.util.List;

import expo.core.ModuleRegistry;
import expo.core.ViewManager;
import expo.core.interfaces.ModuleRegistryConsumer;

public class ImageManipulatorViewManager extends ViewManager<ImageManipulatorView> implements ModuleRegistryConsumer {
  private static final String TAG = "ExpoImageManipulatorView";

  private ModuleRegistry mModuleRegistry;

  @Override
  public String getName() {
    return TAG;
  }

  @Override
  public ImageManipulatorView createViewInstance(Context context) {
    return new ImageManipulatorView(context, mModuleRegistry);
  }

  @Override
  public ViewManagerType getViewManagerType() {
    return ViewManagerType.SIMPLE;
  }

  @Override
  public List<String> getExportedEventNames() {
    return Arrays.asList("onSomethingHappened");
  }

  @Override
  public void setModuleRegistry(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
  }
}
