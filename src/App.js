import React, {Component} from 'react';
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
  }
  return (
    <div class="input-element">
      <p>Step 1: Upload CSV File</p>
      <CSVReader onFileLoaded={handleLoadedFile}/>
    </div>
  );
}

function CurrencySelector(props) {
  const currencies = ["INR" , "AED" , "ARS" , "AUD" , "BGN" ,
  "BRL" , "BSD" , "CAD" , "CHF" , "CLP" ,
  "CNY" , "COP" , "CZK" , "DKK" , "DOP" ,
  "EGP" , "EUR" , "FJD" , "GBP" , "GTQ" ,
  "HKD" , "HRK" , "HUF" , "IDR" , "ILS" ,
  "ISK" , "JPY" , "KRW" , "KZT" , "MXN" ,
  "MYR" , "NOK" , "NZD" , "PAB" , "PEN" ,
  "PHP" , "PKR" , "PLN" , "PYG" , "RON" ,
  "RUB" , "SAR" , "SEK" , "SGD" , "THB" ,
  "TRY" , "TWD" , "UAH" , "USD" , "UYU" ,
  "VND" , "ZAR"];

  const options = currencies.map(currency =>
    <option>
      {currency}
    </option>
  );

  const handleChange = (event) =>  {
    props.changeBaseCurrencyCallback(event.target.value);
  }

  return (
    <div class="input-element">
      <p>Step 2: Select Base Currency</p>
      <select id="curr-select" value={props.currency} onChange={handleChange}>
        {options}
      </select>
    </div>
  );
}


class App extends Component {

  constructor (props) {
    super(props);
    this.state = {
      data: [],
      baseCurrency: "USD",
      conversionRates: [],
      finalOutput: []
    }
  }

  csvLink = React.createRef();

  changeData(csvData) {
    this.setState({
      data: csvData.slice(1,csvData.length)
    })
  }

  changeBaseCurrency(currency) {
    this.setState({
      baseCurrency: currency
    })
  }

  download(finalResult) {
    this.setState({
      finalOutput: finalResult
    }, ()=>{
      this.csvLink.current.link.click();
    })
  }

  processing() {
    fetch('https://api.exchangerate-api.com/v4/latest/'+this.state.baseCurrency)
    .then(res => res.json())
    .then(data => {
      //console.log(data.base)
      this.setState({
        conversionRates: data.rates
      },() => {
        var i;
        var donations = [];
        for (i=0; i<this.state.data.length; i++) {
          donations.push({
            org: this.state.data[i][2],
            curr: this.state.data[i][3],
            amt: this.state.data[i][4],
            fee: this.state.data[i][5]
          })
        }
        donations.sort(function(a, b){
          if (a.org > b.org) {
            return -1;
          }
          else if (a.org < b.org) {
            return 1;
          }
          else {
            return 0;
          }
        });
        var finalResult = [];
        for (i=0; i<donations.length; i++) {
            var currConversionRate = this.state.conversionRates[donations[i].curr];
            if (currConversionRate === undefined) {
              currConversionRate = 0.2;
            }
            var totalAmount = parseFloat(donations[i].amt) * (1 / currConversionRate);
            var totalFee = parseFloat(donations[i].fee) * (1 / currConversionRate);
            var nonProfit = donations[i].org;
            var count = 1;
            while (i+1 !== donations.length && donations[i].org === donations[i+1].org) {
              currConversionRate = this.state.conversionRates[donations[i+1].curr];
              if (currConversionRate === undefined) {
                currConversionRate = 0.2;
              }
              totalFee += parseFloat(donations[i+1].fee) * (1 / currConversionRate);
              totalAmount += parseFloat(donations[i+1].amt) * (1 /  currConversionRate);
              count++;
              i++;
            }
            if (nonProfit !== undefined && nonProfit !== '')
            finalResult.push({
              NonProfit: nonProfit,
              TotalAmount: totalAmount,
              TotalFee: totalFee,
              NumberOfDonations: count
            });
        }
        //console.log(finalResult);
        this.download(finalResult);
      })
    }
    );
  }

  render () {
    return (
      <div>
        <Header></Header>
        <div class="input-list">
          <InputFiles changeDataCallback = {this.changeData}></InputFiles>
          <CurrencySelector currency={this.state.baseCurrency} changeBaseCurrencyCallback = {this.changeBaseCurrency}></CurrencySelector>
        </div>
        <CSVLink data={this.state.finalOutput}
        className="download-button"
        filename={'data' + new Date().toLocaleTimeString()+'.csv'}
        ref={this.csvLink}
        >
          Download
        </CSVLink>
        <button class="action-button" onClick={this.processing}>
          DOWNLOAD!
        </button>
      </div>
    );
  }
}

export default App;
