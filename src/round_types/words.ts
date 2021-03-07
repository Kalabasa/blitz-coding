import daleChall from "dale-chall";
import { sample } from "round_types/utils";

const sampleLength = Math.min(200, daleChall.length);

export const words = sample(sampleLength, daleChall);
