import { Config } from "@remotion/cli/config";

// Silent H.264 that every feed accepts. CRF 20 keeps each 20-second render near 10 MB.
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(20);
Config.setMuted(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
