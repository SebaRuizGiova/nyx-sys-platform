// Generated by https://quicktype.io

export interface Profile {
  birthplace: Birthplace;
  pictureUrl: string;
  deviceSN:   boolean;
  sex:        string;
  device:     boolean;
  userID:     string;
  birthdate:  Birthdate;
  teamID:     string;
  lastName:   string;
  teamLogo:   string;
  sport:      string;
  id:         string;
  name:       string;
  hided:      boolean;
  deviceID:   boolean;
  sleepData: SleepData[];
  selectedSleepData: SleepData | undefined;
}

export interface Birthdate {
  seconds:     number;
  nanoseconds: number;
}

export interface Birthplace {
  alpha3Code:  string;
  name:        string;
  numericCode: string;
  alpha2Code:  string;
  callingCode: string;
}
export interface SleepData {
  sleep_data?:           SleepDatum[];
  duration_in_light?:    number;
  duration_in_sleep?:    number;
  max_hr:                number;
  duration_sleep_onset?: number;
  to:                    number;
  tossnturn_data:        number[];
  hrv_data:              HrvDatum[];
  min_hr:                number;
  id:                    string;
  hrv_rmssd_data:        HrvRmssdDatum[];
  duration_awake?:       number;
  sleep_score?:          number;
  duration_in_deep?:     number;
  awakenings?:           number;
  from_gmt_offset:       number;
  hrv_rmssd_morning:     number;
  avg_rr:                number;
  from:                  number;
  fm_count:              number;
  duration_in_rem?:      number;
  hrv_lf:                number;
  max_rr:                number;
  hrv_score:             number;
  calc_data:             CalcDatum[];
  duration_in_bed:       number;
  avg_act:               number;
  hrv_rmssd_evening:     number;
  fm_data:               string;
  min_rr:                number;
  movement_data:         number[];
  bedexit_duration:      number;
  avg_hr:                number;
  tossnturn_count:       number;
  hrv_hf:                number;
  bedexit_data:          BedexitDatum[];
  device:                Device;
  bedexit_count:         number;
  duration:              number;
}

export interface BedexitDatum {
  endTimestamp:   number;
  startTimestamp: number;
}

export interface CalcDatum {
  heartRate:     number | null;
  activity:      number;
  timestamp:     number;
  breathingRate: number | null;
}

export enum Device {
  The00438A = "00438A",
}

export interface HrvDatum {
  recoveryRatio:       number;
  totalRecovery:       number;
  endRMSSD:            number;
  startRMSSD:          number;
  recoveryRate:        number;
  integratedRecovery?: number;
}

export interface HrvRmssdDatum {
  timestamp: number;
  lf:        number;
  zero:      number;
  hf:        number;
  rmssd:     number;
  activity:  number;
}

export interface SleepDatum {
  timestamp: number;
  sleepType: number;
}
