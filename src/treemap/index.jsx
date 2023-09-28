import {render} from 'preact';
import {store} from './store.js';
import './viewer.css';
import ModulesTreemap from './components/ModulesTreemap.jsx';


const drawChart = (
  parentNode,
  data
) => {
  store.defaultSize = `${window.defaultSizes}Size`;
  store.setModules(data);
  store.setEntrypoints(window.entrypoints||[]);
  render(
    <ModulesTreemap></ModulesTreemap>,
    parentNode
  );
};

export default drawChart;
