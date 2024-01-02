import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts';

// Asegúrate de importar las series y componentes necesarios
import { BarSeriesOption } from 'echarts/charts';
import { TooltipComponentOption, TitleComponentOption } from 'echarts/components';

// Registra los componentes necesarios
echarts.use([BarSeriesOption, TooltipComponentOption, TitleComponentOption]);

interface SleepDatum {
  sleepType: number;
  timestamp: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class AppComponent implements OnInit {
  sleepData: SleepDatum[] = [
    { sleepType: 4, timestamp: 1690460477 },
    { sleepType: 2, timestamp: 1690461857 },
    // ... (otros datos)
  ];

  chartOptions: EChartsOption = {};

  ngOnInit() {
    this.generateChartOptions();
  }

  generateChartOptions() {
    const seriesData: BarSeriesOption[] = this.sleepData.map(data => ({
      type: 'bar',
      data: [{ value: data.timestamp, name: this.getLabelBySleepType(data.sleepType) }],
      emphasis: { focus: 'series' }
    }));

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          data: this.sleepData.map((_, index) => `Category ${index + 1}`)
        }
      ],
      yAxis: [{ type: 'value' }],
      series: seriesData
    };
  }

  getLabelBySleepType(sleepType: number): string {
    switch (sleepType) {
      case 1:
        return 'Light';
      case 2:
        return 'Deep';
      case 0:
        return 'Awake';
      case 3:
        return 'REM';
      default:
        return '';
    }
  }
}
