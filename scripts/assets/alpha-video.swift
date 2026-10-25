// Alpha-aware video helper for scripts/assets/flower-clips.mjs (macOS only).
//
// ffmpeg cannot read the alpha layer of Apple's HEVC-with-alpha (.mov): it decodes the colour
// layer onto white. AVFoundation can, and it is also the only thing here that can WRITE
// HEVC-with-alpha (what Safari plays), so this tool does the two things that need it:
//
//   alpha-video frames <in.mov> <outDir>
//       one PNG per frame (f0000.png …), straight alpha
//   alpha-video encode <framesDir> <out.mov> <sourceFps> <fps> <quality 0-1>
//       the PNG frames → HEVC-with-alpha at `fps` (frames are dropped evenly to get there)
import AVFoundation
import CoreGraphics
import CoreVideo
import ImageIO
import UniformTypeIdentifiers

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data((message + "\n").utf8))
  exit(1)
}

func openReader(_ path: String) -> (AVAssetReader, AVAssetReaderTrackOutput, AVAssetTrack) {
  let asset = AVURLAsset(url: URL(fileURLWithPath: path))
  guard let track = asset.tracks(withMediaType: .video).first else { fail("no video track in \(path)") }
  guard let reader = try? AVAssetReader(asset: asset) else { fail("cannot read \(path)") }
  let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
  reader.add(output)
  guard reader.startReading() else { fail("cannot start reading: \(String(describing: reader.error))") }
  return (reader, output, track)
}

let args = CommandLine.arguments
guard args.count >= 4 else { fail("usage: alpha-video frames <in.mov> <outDir> | encode <framesDir> <out.mov> <sourceFps> <fps> <quality>") }

switch args[1] {
case "frames":
  let (_, output, _) = openReader(args[2])
  let dir = URL(fileURLWithPath: args[3])
  try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
  let space = CGColorSpace(name: CGColorSpace.sRGB)!
  var n = 0
  while let sample = output.copyNextSampleBuffer() {
    guard let buffer = CMSampleBufferGetImageBuffer(sample) else { continue }
    CVPixelBufferLockBaseAddress(buffer, .readOnly)
    let w = CVPixelBufferGetWidth(buffer), h = CVPixelBufferGetHeight(buffer)
    // BGRA from the decoder is premultiplied; ImageIO un-premultiplies when it writes the PNG
    let info = CGBitmapInfo.byteOrder32Little.rawValue | CGImageAlphaInfo.premultipliedFirst.rawValue
    guard let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buffer), width: w, height: h, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(buffer), space: space, bitmapInfo: info),
          let image = ctx.makeImage(),
          let sink = CGImageDestinationCreateWithURL(dir.appendingPathComponent(String(format: "f%04d.png", n)) as CFURL, UTType.png.identifier as CFString, 1, nil)
    else { fail("cannot encode frame \(n)") }
    CGImageDestinationAddImage(sink, image, nil)
    guard CGImageDestinationFinalize(sink) else { fail("cannot write frame \(n)") }
    CVPixelBufferUnlockBaseAddress(buffer, .readOnly)
    n += 1
  }
  print("frames: \(n)")

case "encode":
  guard args.count >= 7, let sourceFps = Double(args[4]), let fps = Int(args[5]), let quality = Double(args[6]) else { fail("encode needs <sourceFps> <fps> <quality>") }
  let dir = URL(fileURLWithPath: args[2])
  let names = ((try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []).filter { $0.hasPrefix("f") && $0.hasSuffix(".png") }.sorted()
  guard let firstName = names.first, let probe = CGImageSourceCreateWithURL(dir.appendingPathComponent(firstName) as CFURL, nil), let first = CGImageSourceCreateImageAtIndex(probe, 0, nil) else { fail("no frames in \(args[2])") }
  let width = first.width, height = first.height
  let outURL = URL(fileURLWithPath: args[3])
  try? FileManager.default.removeItem(at: outURL)
  guard let writer = try? AVAssetWriter(outputURL: outURL, fileType: .mov) else { fail("cannot create \(args[3])") }
  let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.hevcWithAlpha,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [AVVideoQualityKey: quality, AVVideoExpectedSourceFrameRateKey: fps],
  ])
  input.expectsMediaDataInRealTime = false
  let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
  ])
  writer.add(input)
  guard writer.startWriting() else { fail("cannot start writing: \(String(describing: writer.error))") }
  writer.startSession(atSourceTime: .zero)
  let space = CGColorSpace(name: CGColorSpace.sRGB)!
  var kept = 0, nextKept = 0.0
  let step = sourceFps / Double(fps) // source frames per output frame (1.5 for 24 → 16)
  for (n, name) in names.enumerated() {
    if Double(n) + 0.0001 < nextKept { continue } // decimate to the target frame rate
    nextKept += step
    guard let src = CGImageSourceCreateWithURL(dir.appendingPathComponent(name) as CFURL, nil), let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fail("cannot read \(name)") }
    var buffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &buffer)
    guard let pb = buffer else { fail("no pixel buffer") }
    CVPixelBufferLockBaseAddress(pb, [])
    // drawing into a premultiplied BGRA context converts the PNG's straight alpha the way the encoder expects
    let info = CGBitmapInfo.byteOrder32Little.rawValue | CGImageAlphaInfo.premultipliedFirst.rawValue
    guard let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb), width: width, height: height, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb), space: space, bitmapInfo: info) else { fail("no context") }
    ctx.clear(CGRect(x: 0, y: 0, width: width, height: height))
    ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    CVPixelBufferUnlockBaseAddress(pb, [])
    while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
    guard adaptor.append(pb, withPresentationTime: CMTime(value: CMTimeValue(kept), timescale: CMTimeScale(fps))) else { fail("append failed at frame \(n): \(String(describing: writer.error))") }
    kept += 1
  }
  input.markAsFinished()
  let done = DispatchSemaphore(value: 0)
  writer.finishWriting { done.signal() }
  done.wait()
  if writer.status != .completed { fail("writer ended \(writer.status.rawValue): \(String(describing: writer.error))") }
  print("encoded \(kept) of \(names.count) frames")

default:
  fail("unknown command \(args[1])")
}
