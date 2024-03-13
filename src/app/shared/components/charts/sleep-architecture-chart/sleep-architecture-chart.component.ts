import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import {
  SleepData,
  SleepDatum,
} from 'src/app/dashboard/interfaces/profile.interface';
import { HelpersService } from '../../../services/helpers.service';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';
import { timestamp } from 'rxjs';
import { LanguageService } from 'src/app/shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sleep-architecture-chart',
  templateUrl: './sleep-architecture-chart.component.html',
  styleUrls: ['./sleep-architecture-chart.component.scss'],
})
export class SleepArchitectureChartComponent implements OnChanges {
  @Input() period?: SleepData;
  @Input() noTitle?: boolean = false;
  @Input() modal?: boolean;
  public sleepData: SleepDatum[] = [];
  public timestamps: string[] = [];
  public sleepTypes: number[] = [];
  public chart?: Chart;
  public limit?: number = 0;

  constructor(
    private helpersService: HelpersService,
    private timezoneService: TimezoneService,
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    if (this.period) {
      this.period = this.buildCompleteNight(this.period);
      this.sleepData = this.period.sleep_data || [];
    }
    if (this.period && this.period?.sleep_data?.length) {
      const categories: string[] = this.period?.sleep_data.map((datum) =>
        this.helpersService.formatTimestamp(
          datum.timestamp,
          this.timezoneService.timezoneOffset
        )
      );

      this.languageService.langChanged$.subscribe(() => {
        this.translateService
          .get([
            'ansChartAbsent',
            'sleepTimeChartAwake',
            'sleepArcChartLight',
            'sleepArcChartDeep',
            'sleepArcChartTitle',
          ])
          .subscribe((translations: { [key: string]: string }) => {
            const absentTranslate = translations['ansChartAbsent'];
            const awakeTranslate = translations['sleepTimeChartAwake'];
            const lightTranslate = translations['sleepArcChartLight'];
            const deepTranslate = translations['sleepArcChartDeep'];
            const chartTitleTranslate = translations['sleepArcChartTitle'];
            const seriesData: any[] = [
              {
                name: absentTranslate,
                color: '#d9d9d9',
                data: this.getSeriesData(5),
              },
              {
                name: awakeTranslate,
                color: '#18A058',
                data: this.getSeriesData(4),
              },
              {
                name: lightTranslate,
                color: '#56a7ff',
                data: this.getSeriesData(2),
              },
              {
                name: deepTranslate,
                color: '#544FC5',
                data: this.getSeriesData(1),
              },
              {
                name: 'REM',
                color: '#3043CE',
                data: this.getSeriesData(3),
              },
            ];

            this.chart = new Chart({
              chart: {
                type: 'column', // Cambiado a 'column' para barras verticales
                backgroundColor: '#242526',
                animation: true,
              },
              title: {
                text: !this.noTitle ? chartTitleTranslate : '',
                style: {
                  color: '#d9d9d9',
                  fontWeight: 'bold',
                },
              },
              xAxis: {
                categories: categories,
                labels: {
                  style: {
                    color: '#d9d9d9',
                  },
                },
              },
              yAxis: {
                gridLineColor: '#3b3b3b',
                labels: {
                  enabled: false,
                },
                title: {
                  text: '',
                },
              },
              colors: ['#d9d9d9', '#18A058', '#56a7ff', '#3043CE', '#000A3D'],
              credits: {
                enabled: false,
              },
              plotOptions: {
                column: {
                  stacking: 'normal',
                  borderRadius: '10%',
                  borderWidth: 0,
                  groupPadding: 0,
                },
              },
              tooltip: {
                shared: true,
                formatter: function () {
                  return `<b>${categories[Number(this.point.x)]}</b>`;
                },
              },
              legend: {
                align: 'center',
                verticalAlign: 'top',
                layout: 'horizontal',
                itemStyle: {
                  color: '#d9d9d9',
                  fontWeight: 'bold',
                },
              },
              series: seriesData,
            });
          });
      });

      this.translateService
        .get([
          'ansChartAbsent',
          'sleepTimeChartAwake',
          'sleepArcChartLight',
          'sleepArcChartDeep',
          'sleepArcChartTitle',
        ])
        .subscribe((translations: { [key: string]: string }) => {
          const absentTranslate = translations['ansChartAbsent'];
          const awakeTranslate = translations['sleepTimeChartAwake'];
          const lightTranslate = translations['sleepArcChartLight'];
          const deepTranslate = translations['sleepArcChartDeep'];
          const chartTitleTranslate = translations['sleepArcChartTitle'];
          const seriesData: any[] = [
            {
              name: absentTranslate,
              color: '#d9d9d9',
              data: this.getSeriesData(5),
            },
            {
              name: awakeTranslate,
              color: '#18A058',
              data: this.getSeriesData(4),
            },
            {
              name: lightTranslate,
              color: '#56a7ff',
              data: this.getSeriesData(2),
            },
            {
              name: deepTranslate,
              color: '#544FC5',
              data: this.getSeriesData(1),
            },
            {
              name: 'REM',
              color: '#3043CE',
              data: this.getSeriesData(3),
            },
          ];

          this.chart = new Chart({
            chart: {
              type: 'column', // Cambiado a 'column' para barras verticales
              backgroundColor: '#242526',
              animation: true,
            },
            title: {
              text: !this.noTitle ? chartTitleTranslate : '',
              style: {
                color: '#d9d9d9',
                fontWeight: 'bold',
              },
            },
            xAxis: {
              categories: categories,
              labels: {
                style: {
                  color: '#d9d9d9',
                },
              },
            },
            yAxis: {
              gridLineColor: '#3b3b3b',
              labels: {
                enabled: false,
              },
              title: {
                text: '',
              },
            },
            colors: ['#d9d9d9', '#18A058', '#56a7ff', '#3043CE', '#000A3D'],
            credits: {
              enabled: false,
            },
            plotOptions: {
              column: {
                stacking: 'normal',
                borderRadius: '10%',
                borderWidth: 0,
                groupPadding: 0,
              },
            },
            tooltip: {
              shared: true,
              formatter: function () {
                return `<b>${categories[Number(this.point.x)]}</b>`;
              },
            },
            legend: {
              align: 'center',
              verticalAlign: 'top',
              layout: 'horizontal',
              itemStyle: {
                color: '#d9d9d9',
                fontWeight: 'bold',
              },
            },
            series: seriesData,
          });
        });
    }
  }

  private getSeriesData(sleepType: number): number[] {
    return this.sleepData.map((datum) =>
      datum.sleepType === sleepType
        ? this.getSleepTypeHeight(datum.sleepType)
        : 0
    );
  }

  private getSleepTypeHeight(sleepType: number): number {
    switch (sleepType) {
      case 5:
        return 6.5;
      case 1:
        return -1.5;
      case 2:
        return 2.5;
      case 3:
        return 4.5;
      case 4:
        return 1.6;
      default:
        return 0;
    }
  }

  buildCompleteNight(periodToBuild: SleepData) {
    const periodToBuildCopy = {
      ...periodToBuild
    }
    if (periodToBuildCopy.to) {
      let wakeUpTime = new Date(periodToBuildCopy.to * 1000)
        .toString()
        .substr(16, 8);

      const durationOfPeriod = Math.floor(periodToBuildCopy.duration / 3600);

      if (Number(wakeUpTime) <= 13) {
        periodToBuildCopy.period_type = 'night';
      } else if (Number(wakeUpTime) > 13 && durationOfPeriod < 6) {
        periodToBuildCopy.period_type = 'day';
      } else {
        periodToBuildCopy.period_type = 'night';
      }
    }

    if (periodToBuildCopy.sleep_data) {
      var bedExitCounter = 0;
      let activityLabel: any[] = [];
      let sleepData: any[] = [];

      periodToBuildCopy.sleep_data.forEach((data) => {
        sleepData.push(data.timestamp);
        activityLabel.push(data.sleepType);
      });

      if (!periodToBuildCopy.sleep_data.some((sd) => sd.sleepType === 5)) {
        /* INSERTHING BEDEXIT DATA TO SLEEPDATA */
        for (let index = 0; index < sleepData.length; index++) {
          if (periodToBuildCopy.bedexit_data !== undefined) {
            if (periodToBuildCopy.bedexit_data[bedExitCounter] !== undefined) {
              if (
                periodToBuildCopy.bedexit_data[bedExitCounter].startTimestamp <
                Number(sleepData[index])
              ) {
                sleepData.splice(
                  index,
                  0,
                  periodToBuildCopy.bedexit_data[bedExitCounter].startTimestamp
                );
                activityLabel.splice(index, 0, 5);
                // THIS IS SO THE GRAPH DOESNT CONFUSE THAT THE PERSON WAS ABSENT FOR A LONGER TIME THAN THEY REALLY WERE
                sleepData.splice(
                  index + 1,
                  0,
                  periodToBuildCopy.bedexit_data[bedExitCounter].endTimestamp
                );
                activityLabel.splice(index + 1, 0, 4);
                if (bedExitCounter == periodToBuildCopy.bedexit_data.length - 1) {
                  break;
                }
                bedExitCounter++;
              }
            }
          } else {
            bedExitCounter++;
          }
        }
      }

      /* TRANSFORMING THE OLD SLEEP THAT TO THE NEW ONE WITH THE BED EXIIS ADDED */
      const sleepDataWithBedExit = [];
      for (let index = 0; index < sleepData.length; index++) {
        const bedExit = {
          sleepType: activityLabel[index],
          timestamp: Number(sleepData[index]),
        };

        sleepDataWithBedExit.push(bedExit);
      }
      periodToBuildCopy.sleep_data = JSON.parse(
        JSON.stringify(sleepDataWithBedExit)
      );

      if (periodToBuildCopy?.sleep_data?.length) {
        if (periodToBuildCopy.period_type === 'night') {
          /* THIS IS TO FIX THE NIGHT */
          let modifiedSleepData = [];

          /* THIS IS TO FIX THE PROBLEM 1 AWAKE BETWEEN 2 REMS  */
          for (
            let index = 1;
            index < periodToBuildCopy.sleep_data.length - 1;
            index++
          ) {
            const currentSleepData = periodToBuildCopy.sleep_data[index];
            const previousSleepData = periodToBuildCopy.sleep_data[index - 1];
            const nextSleepData = periodToBuildCopy.sleep_data[index + 1];

            if (
              currentSleepData.sleepType === 4 &&
              previousSleepData.sleepType === 3 &&
              nextSleepData.sleepType === 3
            ) {
              const sleepTypeAwakeTimestamp = currentSleepData.timestamp;
              const sleepTypeRemTimestamp = nextSleepData.timestamp;
              const minutesDifference =
                (sleepTypeRemTimestamp - sleepTypeAwakeTimestamp) / 60;

              if (minutesDifference <= 15) {
                modifiedSleepData.push({
                  sleepType: 2,
                  timestamp: currentSleepData.timestamp,
                });
              } else {
                modifiedSleepData.push(currentSleepData);
              }
            } else {
              modifiedSleepData.push(currentSleepData);
            }
          }

          /* THIS IS TO ADD THE LAST AND FIRST PERIOD TO THE ARRAY */
          const firstSleepData = periodToBuildCopy.sleep_data[0];
          const lastSleepData =
            periodToBuildCopy.sleep_data[periodToBuildCopy.sleep_data.length - 1];
          modifiedSleepData.unshift(firstSleepData);
          modifiedSleepData.push(lastSleepData);

          /* THIS IS TO FIX THE PROBLEM 1 REM OR 1 DEEP AFTER 1 AWAKE */
          let updatedModifiedSleepData = [];

          for (let index = 0; index < modifiedSleepData.length - 1; index++) {
            const currentSleepData = modifiedSleepData[index];
            if (index !== 0) {
              const lastSleepData = modifiedSleepData[index - 1];

              if (
                (currentSleepData.sleepType == 3 ||
                  currentSleepData.sleepType == 1) &&
                lastSleepData.sleepType == 4
              ) {
                updatedModifiedSleepData.push({
                  sleepType: 2,
                  timestamp: currentSleepData.timestamp,
                });
              } else {
                updatedModifiedSleepData.push(currentSleepData);
              }
            } else {
              updatedModifiedSleepData.push(currentSleepData);
            }
          }

          /* THIS IS TO ADD THE LAST PERIOD TO THE ARRAY */
          const lastSleepDataUpdating =
            modifiedSleepData[modifiedSleepData.length - 1];
          updatedModifiedSleepData.push(lastSleepDataUpdating);

          /* THIS IS TO FIX SHORTS FAKE PERIODS IN THE NIGHT */
          let sleepTypes = [];
          let startTimestamp = 0;
          let endTimestamp = 0;
          for (
            let index = 0;
            index < updatedModifiedSleepData.length;
            index++
          ) {
            const sleepData = updatedModifiedSleepData[index];
            const { sleepType, timestamp } = sleepData;

            if (sleepType === 4) {
              if (sleepTypes.length > 0) {
                const minutesDifference = (endTimestamp - startTimestamp) / 60;
                if (minutesDifference < 60) {
                  for (let j = index - sleepTypes.length; j < index; j++) {
                    const sleepDataToUpdate = updatedModifiedSleepData[j];
                    if (sleepDataToUpdate.sleepType !== 5) {
                      sleepDataToUpdate.sleepType = 4;
                    }
                  }
                }
              }

              sleepTypes = [];
              startTimestamp = 0;
            } else {
              sleepTypes.push(sleepType);
              if (startTimestamp === 0) {
                startTimestamp = timestamp;
              }
              endTimestamp = timestamp;
            }
          }

          for (
            let index = 0;
            index < periodToBuildCopy.sleep_data.length - 1;
            index++
          ) {
            periodToBuildCopy.sleep_data[index] = updatedModifiedSleepData[index];
          }
        }
      }

      if (periodToBuildCopy.sleep_data) {
        const sleepDataFilled = periodToBuildCopy.sleep_data;

        for (let i = 0; i < sleepDataFilled.length - 1; i++) {
          const currentDatum = sleepDataFilled[i];
          const nextDatum = sleepDataFilled[i + 1];

          // Calcular la diferencia de tiempo en minutos
          const timeDifferenceMinutes =
            (nextDatum.timestamp - currentDatum.timestamp) / 60;

          if (timeDifferenceMinutes > 10) {
            const sleepType = currentDatum.sleepType;
            const currentTimestamp = currentDatum.timestamp;

            // Calcular la cantidad de nuevos objetos a agregar con intervalos de 3 minutos
            const numNewObjects = Math.floor(timeDifferenceMinutes / 10) - 1;

            // Agregar objetos con intervalos de 3 minutos hasta alcanzar el timestamp del siguiente objeto
            for (let j = 1; j <= numNewObjects; j++) {
              const newTimestamp = currentTimestamp + j * 180;

              // Asegurar que los nuevos timestamps sean crecientes
              if (newTimestamp < nextDatum.timestamp) {
                sleepDataFilled.splice(i + j, 0, {
                  timestamp: newTimestamp,
                  sleepType: sleepType,
                });
              }
            }
          }
        }

        periodToBuildCopy.sleep_data = sleepDataFilled;
      }

      /* THIS IS TO RECALCULATE THE SLEEPTYPE TIMES */
      const sleepDataNew = periodToBuildCopy.sleep_data;

      let currentSleepType = null;
      let currentSleepStartTimestamp = null;
      let durationAwake = 0;
      let durationInBed = 0;
      let durationInDeep = 0;
      let durationInLight = 0;
      let durationInRem = 0;
      let durationInSleep = 0;

      if (sleepDataNew) {
        for (let i = 0; i < sleepDataNew.length; i++) {
          const { sleepType, timestamp } = sleepDataNew[i];

          if (currentSleepType === null) {
            currentSleepType = sleepType;
            currentSleepStartTimestamp = timestamp;
            continue;
          }

          if (currentSleepType !== sleepType && currentSleepStartTimestamp) {
            const timeDifference =
              (timestamp - currentSleepStartTimestamp) / 60;
            switch (currentSleepType) {
              case 1:
                durationInDeep += timeDifference;
                durationInBed += timeDifference;
                break;
              case 2:
                durationInLight += timeDifference;
                durationInBed += timeDifference;
                break;
              case 3:
                durationInRem += timeDifference;
                durationInBed += timeDifference;
                break;
              case 4:
                durationAwake += timeDifference;
                durationInBed += timeDifference;
                break;
              default:
                break;
            }
            currentSleepType = sleepType;
            currentSleepStartTimestamp = timestamp;
          }
        }

        // Add the remaining duration for the last sleep type
        if (currentSleepType !== null && currentSleepStartTimestamp) {
          const timeDifference =
            (sleepDataNew[sleepDataNew.length - 1].timestamp -
              currentSleepStartTimestamp) /
            60;
          switch (currentSleepType) {
            case 1:
              durationInDeep += timeDifference;
              durationInBed += timeDifference;
              break;
            case 2:
              durationInLight += timeDifference;
              durationInBed += timeDifference;
              break;
            case 3:
              durationInRem += timeDifference;
              durationInBed += timeDifference;
              break;
            case 4:
              durationAwake += timeDifference;
              durationInBed += timeDifference;
              break;
            default:
              break;
          }
        }
      }

      durationInSleep = durationInRem + durationInLight + durationInDeep;
      periodToBuildCopy.duration_in_deep = this.helpersService.calcHoursSleepData(
        durationInDeep * 60
      );
      periodToBuildCopy.duration_in_light = this.helpersService.calcHoursSleepData(
        durationInLight * 60
      );
      periodToBuildCopy.duration_in_rem = this.helpersService.calcHoursSleepData(
        durationInRem * 60
      );
      periodToBuildCopy.duration_awake = this.helpersService.calcHoursSleepData(
        durationAwake * 60
      );
      periodToBuildCopy.duration_in_sleep = this.helpersService.calcHoursSleepData(
        durationInSleep * 60
      );
      periodToBuildCopy.duration_in_bed = this.helpersService.calcHoursSleepData(
        durationInBed * 60
      );
    }

    if (periodToBuildCopy.sleep_score) {
      if (periodToBuildCopy.sleep_score > 100) {
        periodToBuildCopy.sleep_score = 100;
      }
    }

    return periodToBuildCopy;
  }
}
