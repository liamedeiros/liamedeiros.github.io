// start by loading data
let shadowJp = null;
let shadowMgbk = null;
function loadShadowdata(path) {
  return fetch(path)
    .then(response => response.json())
    .catch(error => {
      console.error('Error loading JSON file:', error);
    });
}
(async function() {
  // this runs after the page has loaded the shadow data. useful to
  // also call updates to the plots to ensure that they reflect the
  // initial state of the sliders
  shadowJp = await loadShadowdata('static/shadowdata_jp.json');
  updatePlotJP();
  shadowMgbk = await loadShadowdata('static/shadowdata_mgbk.json');
  updatePlotMGBK();
})();

// global configuration for plot in form expected by plotly
const thePlotLayout = {
    margin: { t: 0 },
    height: '100%',
    xaxis: {range: [-10, 10]},
    yaxis: {range: [-10, 10], scaleanchor: 'x', scaleratio: 1.0},
};
const thePlotConfig = {
    showSendToCloud: false,
    responsive: true,
    displaylogo: false
};

// function to assign event listeners to each slider
function createSliderChangedListener(elementId, metric) {

    const element = document.getElementById(elementId);
    const labelId = `${elementId}_current`;

    // this function gets run whenever a slider is changed
    element.addEventListener('input', function(event) {
        document.getElementById(labelId).innerText = event.target.value;
        if (metric === 'jp') {
          updatePlotJP();
        } else if (metric === 'mgbk') {
          updatePlotMGBK();
        }
    });
}

// function to get the index for a given set of metric parameters
function getIndexOfParams(paramsArray, params) {
  let tolerance = 0.01;
  for (var index=0; index<paramsArray[0].length; index++) {
    let valid = true;
    for (var i=0; i<params.length; i++) {
      if (Math.abs(paramsArray[i][index] - params[i]) > tolerance) {
        valid = false;
      }
    }
    if (valid) {
      return index;
    }
  }
  return -1;
}

function updatePlot(meanVect, vect, amps, r0, x0, theta, thePlotElement) {
  let shadow = []
  for (let j = 0; j < vect.length; j++) {
    shadow.push(meanVect);
    for (let k = 0; k < vect[j].length; k++) {
      shadow[j] += vect[j][k] * amps[k];
    }
  }
  shadow = shadow.map((value) => value * r0/Math.sqrt(27));
  let xx = shadow.map((value, index) => x0 + value * Math.cos(theta[index]));
  let yy = shadow.map((value, index) => value * Math.sin(theta[index]));
  Plotly.react(
    thePlotElement,
    [{x: xx, y: yy}],
    thePlotLayout,
    thePlotConfig
  );
}

function updatePlotMGBK() {
  const meanVect = Math.sqrt(27);
  let a_bh_2 = document.getElementById('a_bh_2').value;
  let inc_2 = document.getElementById('inc_2').value;
  let gam31_2 = document.getElementById('gam31_2').value;
  let gam33_2 = document.getElementById('gam33_2').value;
  let gam12_2 = document.getElementById('gam12_2').value;
  let gam42_2 = document.getElementById('gam42_2').value;
  let indexForParams = getIndexOfParams(shadowMgbk.params, [a_bh_2, inc_2, gam31_2, gam33_2, gam12_2, gam42_2]);
  updatePlot(meanVect, shadowMgbk.vect, shadowMgbk.amps[indexForParams], 
             shadowMgbk.r0[indexForParams][2], shadowMgbk.r0[indexForParams][0], 
             shadowMgbk.theta, document.getElementById('plot_2'));
}

function updatePlotJP() {
  const meanVect = 5.1143673361478665;
  let a_bh_1 = document.getElementById('a_bh_1').value;
  let inc_1 = document.getElementById('inc_1').value;
  let a22_1 = document.getElementById('a22_1').value;
  let a13_1 = document.getElementById('a13_1').value;
  let indexForParams = getIndexOfParams(shadowJp.params, [a_bh_1, inc_1, a22_1, a13_1]);
  updatePlot(meanVect, shadowJp.vect, shadowJp.amps[indexForParams],
             shadowJp.r0[indexForParams][1], shadowJp.r0[indexForParams][0],
             shadowJp.theta, document.getElementById('plot_1'));
}

// for jp
createSliderChangedListener('a_bh_1', 'jp');
createSliderChangedListener('inc_1', 'jp');
createSliderChangedListener('a22_1', 'jp');
createSliderChangedListener('a13_1', 'jp');

// for mgbk
createSliderChangedListener('a_bh_2', 'mgbk');
createSliderChangedListener('inc_2', 'mgbk');
createSliderChangedListener('gam31_2', 'mgbk');
createSliderChangedListener('gam33_2', 'mgbk');
createSliderChangedListener('gam12_2', 'mgbk');
createSliderChangedListener('gam42_2', 'mgbk');
