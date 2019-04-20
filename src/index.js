import "babel-polyfill";
import Chart from "chart.js";

 const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

class Weather{
  constructor(hour, temperature, heat){
    this.hour = hour + ":00";
    this.temperature = temperature;
    this.heat = heat;
  }
}

async function loadMeteo() {

  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const meteoData = parser.parseFromString(xmlTest, "text/xml");
  const rateHour = meteoData.querySelectorAll("FORECAST[hour]");
  const rateTemp = meteoData.getElementsByTagName("TEMPERATURE");
  const rateHeat = meteoData.getElementsByTagName("HEAT");
  const result = [];
  for (let i = 0; i < rateHour.length; i++) {
    const rateHourTag = rateHour.item(i);
    const rateTempTag = rateTemp.item(i);
    const rateHeatTag = rateHeat.item(i);
    const hour = rateHourTag.getAttribute("hour");
    const temper = rateTempTag.getAttribute("max");
    const heat = rateHeatTag.getAttribute("max");
    const data = new Weather(hour, temper, heat);
    result.push(data);
  }
  return result;
  
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const meteoData = await loadMeteo();
  const hours = meteoData.map(weather => weather.hour);
  const temperatures = meteoData.map(weather => weather.temperature);
  const heats = meteoData.map(weather => weather.heat);

  const chartConfig = {
    type: "line",

    data: {
      labels: hours,
      datasets: [
        {
          label: "Температура",
          backgroundColor: "rgba(255, 20, 20, 0.5)",
          borderColor: "rgb(180, 0, 0)",
          data: temperatures
        },

        {
          label: "Температура по ощущениям",
          backgroundColor: "rgba(0, 255, 0, 0.5)",
          borderColor: "rgb(0, 100, 0)",
          data: heats
        },
      ]
    },
    options: {
      scales: {
        yAxes: [{ 
          scaleLabel: {
            display: true,
            labelString: "Температура °C"
          }
        }],

        xAxes: [{ 
          scaleLabel: {
            display: true,
            labelString: "Время"
          }
        }]
      }
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});
