export type EnvironmentalCategory =
  | 'forest'
  | 'flood'
  | 'agriculture'
  | 'earthquake'
  | 'glacier'
  | 'wetland';

export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'monitored';

export type RadarBand = 'L-band (24cm)' | 'S-band (9.4cm)' | 'Dual L+S Band';

export interface ObservationHotspot {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  category: EnvironmentalCategory;
  severity: SeverityLevel;
  nisarBand: RadarBand;
  beforeDate: string;
  afterDate: string;
  beforeBackscatterDb: number; // e.g. -12.4 dB
  afterBackscatterDb: number;  // e.g. -21.8 dB (water reflection specular drop) or -7.2 dB (rough burn)
  deltaDb: number;
  coherenceScore: number;      // 0.0 to 1.0 (interferometric coherence)
  affectedAreaSqKm: number;
  description: string;
  scientificFinding: string;
  radarCharacteristics: {
    polarization: 'HH' | 'HV' | 'VV' | 'VH' | 'HH+HV' | 'VV+VH' | 'Quad-Pol';
    incidenceAngleDeg: number;
    processingLevel: 'L1 SLC' | 'L2 GCOV' | 'L2 GSV' | 'L3 GUNW';
    spatialResolutionM: number;
  };
  validationStatus: 'CONFIRMED_GROUND_TRUTH' | 'CALIBRATED_CROSS_SATELLITE' | 'EXPERIMENTAL_RADAR_PRODUCT';
  beforeImage: string;
  afterImage: string;
  changeHeatmap: string;
  elevationDeltaMeters?: number; // For 3D terrain displacement / flood height
  elevationGridBefore?: number[][]; // 8x8 or 12x12 grid for 3D disaster relief
  elevationGridAfter?: number[][];
  sentinelCrossComparison?: {
    satellite: 'Sentinel-1 C-band (5.6cm)';
    limitation: string;
    nisarAdvantage: string;
  };
}

export interface NISARDatasetProduct {
  id: string;
  granuleName: string;
  frequency: 'L-band' | 'S-band';
  wavelength: '24 cm (NASA)' | '9.4 cm (ISRO)';
  acquisitionDate: string;
  polarization: 'HH' | 'HV' | 'VV' | 'VH' | 'HH+HV' | 'VV+VH' | 'Full Quad-Pol';
  swathWidthKm: number;
  orbitDirection: 'Ascending' | 'Descending';
  orbitTrack: number;
  processingLevel: 'L1 SLC' | 'L2 GCOV' | 'L2 GSV' | 'L3 GUNW';
  cloudOptimizedGeoTiffSizeMb: number;
  region: string;
  coordinates: [number, number];
  sourceArchive: 'Alaska Satellite Facility (NASA ASF)' | 'ISRO Bhoonidhi Portal';
  validationFlag: boolean;
}

export interface DisasterCaseStudy {
  id: string;
  title: string;
  location: string;
  year: string;
  category: EnvironmentalCategory;
  summary: string;
  detailedAnalysis: string;
  sentinelVsNisarComparison: {
    cBandSentinelFindings: string;
    lBandNisarFindings: string;
    sBandNisarFindings: string;
    keyTakeaway: string;
  };
  damageMetrics: {
    cropAreaSubmergedHa: number;
    villagesAffected: number;
    displacementEstimated: number;
    soilLossTonnesPerHa: number;
  };
  timelineEvents: {
    date: string;
    event: string;
    radarSignature: string;
  }[];
}
