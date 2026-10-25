// Super-resolution for still photographs (macOS 26+, Apple silicon): scripts/assets/photos-hires.mjs calls this.
//
//   upscale <in.(jpg|png)> <out.png>        4× the pixels, written losslessly
//
// Uses Apple's own VideoToolbox VTSuperResolutionScaler (the ML model is supplied and downloaded by the OS the
// first time; no third-party code or weights are involved). It supports exactly one scale factor, 4, and source
// images up to 1920 px. The model INVENTS plausible detail — it does not recover what the camera never recorded.
import CoreGraphics
import CoreVideo
import Foundation
import ImageIO
import UniformTypeIdentifiers
import VideoToolbox

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data((message + "\n").utf8))
  exit(1)
}

guard CommandLine.arguments.count >= 3 else { fail("usage: upscale <in> <out.png>") }
guard #available(macOS 26.0, *) else { fail("needs macOS 26 or later") }
guard VTSuperResolutionScalerConfiguration.isSupported else { fail("super-resolution is not supported on this Mac") }

let inURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outURL = URL(fileURLWithPath: CommandLine.arguments[2])
guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil), let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fail("cannot read \(inURL.path)") }
let width = image.width, height = image.height
guard width <= 1920, height <= 1920 else { fail("source is \(width)×\(height); the scaler takes at most 1920 px") }

guard let config = VTSuperResolutionScalerConfiguration(
  frameWidth: width, frameHeight: height, scaleFactor: 4, inputType: .image,
  usePrecomputedFlow: false, qualityPrioritization: .normal, revision: .revision1
) else { fail("the scaler refused a \(width)×\(height) source") }

// the model comes from Apple the first time
if config.configurationModelStatus != .ready {
  FileHandle.standardError.write(Data("downloading Apple's super-resolution model…\n".utf8))
  let done = DispatchSemaphore(value: 0)
  var failure: Error?
  config.downloadConfigurationModel { error in failure = error; done.signal() }
  while done.wait(timeout: .now() + 2) == .timedOut {
    FileHandle.standardError.write(Data(String(format: "  %.0f %%\n", config.configurationModelPercentageAvailable * 100).utf8))
  }
  if let failure { fail("model download failed: \(failure.localizedDescription)") }
}

// the scaler works on half-float RGBA ('RGhA'); draw the photograph into such a buffer
func makeBuffer(_ w: Int, _ h: Int, _ attributes: [String: Any]) -> CVPixelBuffer {
  var buffer: CVPixelBuffer?
  let status = CVPixelBufferCreate(nil, w, h, kCVPixelFormatType_64RGBAHalf, attributes as CFDictionary, &buffer)
  guard status == kCVReturnSuccess, let buffer else { fail("cannot allocate a \(w)×\(h) pixel buffer (\(status))") }
  return buffer
}
let space = CGColorSpace(name: CGColorSpace.extendedLinearSRGB) ?? CGColorSpace(name: CGColorSpace.sRGB)!
let floatInfo = CGBitmapInfo.floatComponents.rawValue | CGBitmapInfo.byteOrder16Little.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue

let source = makeBuffer(width, height, config.sourcePixelBufferAttributes)
CVPixelBufferLockBaseAddress(source, [])
guard let ctx = CGContext(data: CVPixelBufferGetBaseAddress(source), width: width, height: height, bitsPerComponent: 16, bytesPerRow: CVPixelBufferGetBytesPerRow(source), space: space, bitmapInfo: floatInfo) else { fail("cannot create the source context") }
ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
CVPixelBufferUnlockBaseAddress(source, [])

let destination = makeBuffer(width * 4, height * 4, config.destinationPixelBufferAttributes)

let processor = VTFrameProcessor()
do { try processor.startSession(configuration: config) } catch { fail("cannot start the session: \(error)") }
guard let sourceFrame = VTFrameProcessorFrame(buffer: source, presentationTimeStamp: .zero),
      let destinationFrame = VTFrameProcessorFrame(buffer: destination, presentationTimeStamp: .zero),
      let parameters = VTSuperResolutionScalerParameters(sourceFrame: sourceFrame, previousFrame: nil, previousOutputFrame: nil, opticalFlow: nil, submissionMode: .random, destinationFrame: destinationFrame)
else { fail("cannot build the frame parameters") }

let finished = DispatchSemaphore(value: 0)
var processError: Error?
processor.process(parameters: parameters) { _, error in processError = error; finished.signal() }
finished.wait()
if let processError { fail("the scaler failed: \(processError)") }
processor.endSession()

// back to an ordinary 8-bit sRGB picture, written losslessly
let outW = width * 4, outH = height * 4
CVPixelBufferLockBaseAddress(destination, .readOnly)
defer { CVPixelBufferUnlockBaseAddress(destination, .readOnly) }
guard let readCtx = CGContext(data: CVPixelBufferGetBaseAddress(destination), width: outW, height: outH, bitsPerComponent: 16, bytesPerRow: CVPixelBufferGetBytesPerRow(destination), space: space, bitmapInfo: floatInfo),
      let big = readCtx.makeImage(),
      let rgb = CGContext(data: nil, width: outW, height: outH, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
else { fail("cannot read the result back") }
rgb.draw(big, in: CGRect(x: 0, y: 0, width: outW, height: outH))
guard let result = rgb.makeImage(), let sink = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.png.identifier as CFString, 1, nil) else { fail("cannot write \(outURL.path)") }
CGImageDestinationAddImage(sink, result, nil)
guard CGImageDestinationFinalize(sink) else { fail("cannot finish \(outURL.path)") }
print("\(width)×\(height) → \(outW)×\(outH)")
