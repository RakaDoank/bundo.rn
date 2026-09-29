#import "BundoWindow.h"

#import <BundoWindowSpecs/BundoWindowSpecs.h>

@implementation BundoWindow

- (NSNumber *)getTrafficLightStartInset {
  __block CGFloat maxX = 0;

  dispatch_sync(dispatch_get_main_queue(), ^{
    NSWindow *window            = NSApp.keyWindow ?: NSApp.mainWindow;

    NSButton *closeButton       = [window standardWindowButton:NSWindowCloseButton];
    NSButton *miniaturizeButton = [window standardWindowButton:NSWindowMiniaturizeButton];
    NSButton *zoomButton        = [window standardWindowButton:NSWindowZoomButton];

    NSMutableArray<NSButton *> *trafficLightButtons = [@[] mutableCopy];

    if(closeButton) {
      [trafficLightButtons insertObject:closeButton atIndex:trafficLightButtons.count];
    }
    if(miniaturizeButton) {
      [trafficLightButtons insertObject:miniaturizeButton atIndex:trafficLightButtons.count];
    }
    if(zoomButton) {
      [trafficLightButtons insertObject:zoomButton atIndex:trafficLightButtons.count];
    }

    for(NSButton *button in trafficLightButtons) {
      if(!button) {
        continue;
      }

      NSRect rect = [button.superview convertRect:button.frame
                                           toView:window.contentView];

      maxX = MAX(maxX, NSMaxX(rect));
    }
  });

  return [NSNumber numberWithDouble:maxX];
}

- (NSNumber *)isFullScreen {
  __block BOOL isFullScreen = false;

  dispatch_sync(dispatch_get_main_queue(), ^{
    NSWindow *window  = NSApp.keyWindow ?: NSApp.mainWindow;
    isFullScreen = (window.styleMask & NSWindowStyleMaskFullScreen) != 0;
  });

  return [NSNumber numberWithBool:isFullScreen];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBundoWindowSpecJSI>(params);
}

RCT_EXPORT_MODULE()

@end
