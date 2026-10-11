import { Injectable } from '@nestjs/common';

@Injectable()
export class AquariumCalculationService {
  calculateVolumeLiters(
    widthCm: number,
    heightCm: number,
    depthCm: number,
  ): number {
    return (widthCm * heightCm * depthCm) / 1000;
  }
}
