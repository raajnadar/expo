// Copyright 2016-present 650 Industries. All rights reserved.

#import <EXImageManipulator/EXImageManipulatorView.h>
#import <EXImageManipulator/EXImageManipulatorViewManager.h>

@interface EXImageManipulatorViewManager ()

@property (nonatomic, weak) EXModuleRegistry *moduleRegistry;

@end

@implementation EXImageManipulatorViewManager

EX_EXPORT_MODULE(ExpoImageManipulatorViewManager);

- (UIView *)view
{
  return [[EXImageManipulatorView alloc] initWithModuleRegistry:_moduleRegistry];
}

- (NSString *)viewName
{
  return @"ExpoImageManipulatorView";
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"onSomethingHappened"];
}

- (void)setModuleRegistry:(EXModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
}

@end
