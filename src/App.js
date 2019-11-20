import React, {useState} from 'react';
import './App.css';
import Logo from './give.png';
import CSVReader from 'react-csv-reader';
import {CSVLink} from 'react-csv';

import useMedia from 'use-media';

function Header() {
  const isWide = useMedia({maxWidth: 900});
  const styles = isWide ? { display : "none" } : {}
  return (
      <div class="header">
        <img src={Logo} alt="logo"/>
        <p style={styles}>Backend Developer Challenge</p>
      </div>
    );
}

function InputFiles(props) {
  const handleLoadedFile = (data) => {
    props.changeDataCallback(data);
    console.log("child callback");
  }
  return (
    <div class="input-element">
      <p>Upload Csv File</p>
      <CSVReader onFileLoaded={handleLoadedFile}/>
    </div>
  );
}

function CurrencySelector() {
  const currencies = ["CAD","HKD","ISK","PHP",
  "DKK","HUF","CZK","GBP","RON","SEK","IDR",
  "INR","BRL","RUB","HRK","JPY","THB","CHF",
  "EUR","MYR","BGN","TRY","CNY","NOK","NZD",
  "ZAR","USD","MXN","SGD","AUD","ILS","KRW","PLN"];

  const options = currencies.map(currency =>
      <option>
        {currency}
      </option>
    );

  return (
    <div class="input-element">
      <p>Select Base Currency</p>
      <select id="curr-select">
        {options}
      </select>
    </div>
  );
}


function App() {
  const [data, setData] = useState([]);

  const changeData = (data) => {
    console.log("parentCallback");
    setData(data);
  }

  return (
    <div>
      <Header></Header>
      <div class="input-list">
        <InputFiles changeDataCallback = {changeData}></InputFiles>
        <CurrencySelector></CurrencySelector>
        <CSVLink data={data}
        className="download-button"
        filename={"output.csv"}
        >
          Download</CSVLink>
      </div>
    </div>
  );
}

export default App;
