// Generated by https://quicktype.io

export interface Profile {
  birthplace: Birthplace;
  deviceSN:   boolean;
  sex:        string;
  device:     boolean;
  userID:     string;
  birthdate:  Birthdate;
  teamID:     string;
  lastName:   string;
  id:         string;
  name:       string;
  hided:      boolean;
  deviceID:   boolean;
  sleepData: SleepData[];
  selectedSleepData: SleepData | undefined;
  previousSleepData: SleepData | undefined;
  liveData: Status,
  deleted: boolean;
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
  duration_in_light?:    number | string;
  duration_in_light_parsed?:    number | string;
  duration_in_light_percent?:    number | string;
  duration_in_sleep?:    number | string;
  duration_in_sleep_parsed?:    number | string;
  duration_in_sleep_percent?:    number | string;
  max_hr:                number;
  duration_sleep_onset?: number;
  to:                    number;
  tossnturn_data:        number[];
  hrv_data:              HrvDatum[];
  min_hr:                number;
  id:                    string;
  hrv_rmssd_data:        HrvRmssdDatum[];
  duration_awake?:       number | string;
  duration_awake_parsed?:       number | string;
  duration_awake_percent?: number | string;
  average_rmssd?: number | string;
  sleep_score?:          number;
  duration_in_deep?:     number | string;
  duration_in_deep_parsed?:     number | string;
  duration_in_deep_percent?:     number | string;
  awakenings?:           number;
  from_gmt_offset:       number;
  hrv_rmssd_morning:     number;
  avg_rr:                number;
  from:                  number;
  fm_count:              number;
  duration_in_rem?:      number | string;
  duration_in_rem_parsed?:      number | string;
  duration_in_rem_percent?:      number | string;
  hrv_lf:                number;
  max_rr:                number;
  hrv_score:             number;
  calc_data:             CalcDatum[];
  duration_in_bed:       number | string;
  duration_in_bed_parsed:       number | string;
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
  period_type:           string;
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
  lf:        number | null;
  zero:      number;
  hf:        number | null;
  rmssd:     number;
  activity:  number;
}

export interface SleepDatum {
  timestamp: number;
  sleepType: number;
}

export interface Status {
  status: string;
}
