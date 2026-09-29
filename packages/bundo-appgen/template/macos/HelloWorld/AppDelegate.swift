import SwiftUI
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
struct HelloWorldApp: App {
  @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

  var body: some Scene {
    Window("HelloWorld", id: "main") {
      ReactNativeView(factory: appDelegate.reactNativeFactory)
    }
      .defaultSize(width: 1280, height: 720)
  }
} // struct HelloWorldApp

// MARK: - App Delegate

class AppDelegate: NSObject, NSApplicationDelegate {
  private let reactNativeDelegate: ReactNativeDelegate
  let reactNativeFactory: RCTReactNativeFactory

  override init() {
    self.reactNativeDelegate = ReactNativeDelegate()
    self.reactNativeFactory = RCTReactNativeFactory(delegate: reactNativeDelegate)
    self.reactNativeDelegate.dependencyProvider = RCTAppDependencyProvider()

    super.init()
  }
} // class AppDelegate

// MARK: - React Native Delegate

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
} // class ReactNativeDelegate

// MARK: - React Native SwiftUI View

struct ReactNativeView: NSViewRepresentable {
  let factory: RCTReactNativeFactory

  func makeNSView(context: Context) -> NSView {
    factory.rootViewFactory.view(withModuleName: "main")
  }

  func updateNSView(_ nsView: NSView, context: Context) {
  }
} // struct ReactNativeView
