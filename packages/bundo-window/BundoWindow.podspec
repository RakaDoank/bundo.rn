require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "BundoWindow"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :osx => "10.14" }
  s.source       = { :git => package["repository"]["url"], :tag => "#{s.version}" }

  s.source_files          = "apple/**/*.{h,m,mm,cpp}", "cpp/*.{cpp,h}"
  s.ios.exclude_files     = "**/*.macos.{h,m,mm}"
  s.tvos.exclude_files    = "**/*.macos.{h,m,mm}"
  s.osx.exclude_files     = "**/*.ios.{h,m,mm}"
  s.private_header_files  = "apple/**/*.h"

  install_modules_dependencies(s)
end
