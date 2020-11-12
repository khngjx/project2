/* Demo for FinTech@SG Course 
Retrieving JSON data from Server in a Tabular form// teaching you how to fetch data from server to client
Author: Prof Bhojan Anand */
//Install d3.js:   npm install d3 --save
import React from 'react';
import logo from './fish.png';
import * as d3 from 'd3';
import './App.css';



class App extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        customer: [],
        transact: [],
        account: [],
        sumCat: [],
        filteredSumCat: [],
        seeTransact: false,
        seeCustomer: false,
        seeAccount: false,
      };
      this.transactToggleClick = this.transactToggleClick.bind(this);
      this.customerToggleClick = this.customerToggleClick.bind(this);
      this.accountToggleClick = this.accountToggleClick.bind(this);
    }

 callAPIServer() {
  // when component mounted, start a GET request
  // to specified URL
  fetch("http://localhost:8000/transaction/all")
  .then(res => res.text()) // in response, return data as text  
  .then(res => this.setState({transact: JSON.parse(res) })) // formatting the data into a class property called state
  .catch(err => err); // if there is an error, dont stop the process, return an "error" instead


  fetch("http://localhost:8000/customer/all")
  .then(res => res.text()) // in response, return data as text  
  .then(res => this.setState({customer: JSON.parse(res) })) // formatting the data into a class property called state
  .catch(err => err); // if there is an error, dont stop the process, return an "error" instead


  fetch("http://localhost:8000/account/all")
  .then(res => res.text()) // in response, return data as text  
  .then(res => this.setState({account: JSON.parse(res) })) // formatting the data into a class property called state
  .catch(err => err); // if there is an error, dont stop the process, return an "error" instead
 }


  componentDidMount() {   // react lifecycle method componentDidMount()  DO NOT MODIFY. always loaded by browser
                        //will execute the callAPIserver() method after the component mounts.
      this.callAPIServer();
      //console.log(this.serverResObjArr);
  }

  /* prepare data */
  componentDidUpdate() {
    this.state.account.forEach(function(d) {
      d.balanceInt = d.balance;  
    });
    
    this.state.transact.forEach(function(d) {
      d.amountInt = d.amount;
      d.amountInt = Math.abs(d.amountInt);
    });
    
    // this.state.transact.forEach(function(d) {
    //   d.month = d.timestamp.slice (0, d.timestamp.indexOf("/"));
    //   d.date = d.timestamp.slice ((d.timestamp.indexOf("/")+1), d.timestamp.lastIndexOf("/"));
    //   d.year = d.timestamp.slice (d.timestamp.lastIndexOf("/"));
    //   d.timestamp = d.date + "/" + d.month + d.year;
    // }); 
    
    // this.state.transact.sort( function(a, b) {
    //   var dateA = new Date(a.timestamp), dateB = new Date(b.timestamp);
    //   return dateB - dateA;
    // });

    this.state.transact.forEach(function(d) {

      d.timestamp = new Date(d.timestamp);
      d.timestamp = d.timestamp.getFullYear()+'-' + (d.timestamp.getMonth()+1) + '-'+d.timestamp.getDate();

    });


    this.sumCategories();
    this.state.filteredSumCat = this.state.sumCat.filter( function(d) { return d.category !== "salary"} );
    this.state.filteredSumCat.forEach(function(d) {
      d.amountInt = d.amountInt.replace(/[^0-9.-]+/g,"");
      d.amountInt = Math.abs(d.amountInt);
    });


    this.showAccountChart();
    this.showAccountPie ();

    this.showTransactionChart();
    
    this.sumCatPercent();
    this.accPercent();

    this.showTransactionPie();
    
  };


  sumCategories() {
    let counts = this.state.transact.reduce((prev, curr) => {
      let count = prev.get(curr.category) || 0;
      prev.set(curr.category, curr.amountInt + count);
      return prev;
    }, new Map());
    this.state.sumCat = [...counts].map(([category, amountInt]) => {
      return {category, amountInt}
    });
    this.state.sumCat.forEach(function(d){
      d.amountInt = d.amountInt.toFixed(2);
    });
  };
  


  sumCatPercent() {
    this.state.sumCat.forEach( function(d) {
      d.amountInt = parseFloat(d.amountInt);
    });
    
    var totalExp = this.state.filteredSumCat.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amountInt, 0
    );

    totalExp = totalExp.toFixed(2);

    this.state.filteredSumCat.forEach( function(d) {
      d.percent = (d.amountInt / totalExp * 100).toFixed(1);
    });
  };
 

  accPercent() {
    this.state.account.forEach( function(d) {
      d.balanceInt = parseFloat(d.balanceInt);
    });
    
    var totalBalance = this.state.account.reduce(
      (accumulator, currentValue) => accumulator + currentValue.balanceInt, 0
    );

    totalBalance = totalBalance.toFixed(2);

    this.state.account.forEach( function(d) {
      d.balancePercent = (d.balanceInt / totalBalance * 100).toFixed(1);
    });
  };
 


  /* Replace the table with paragraph below if you need paragraph
    <p className="App-intro">{JSON.stringify(this.state.data)}</p>
  */

  showAccountChart() {
    const margin = { top: 50, right: 200, bottom: 50, left: 200 };
    var width = 1000 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#accountChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
    svg.selectAll("*").remove();

    var maxY = Math.ceil (d3.max(this.state.account.map(details => Number(details.balanceInt))) / 200) * 200;
  
    var x = d3.scaleBand().range([0, width]);
    var y = d3.scaleLinear().domain([0, maxY]).range([height, 0]);
    
    x.domain(this.state.account.map(details => details.account));
    y.domain([0, maxY]);

    svg.selectAll(".bar")
      .data(this.state.account)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.account))
      .attr("width", x.bandwidth() - 10)
      .attr("y", d => y(d.balanceInt))
      .attr("height", d => height - y(d.balanceInt))
      .attr("fill", "#df5252"); 

    svg.selectAll("text.bar")
      .data(this.state.account)
      .enter()
      .append("text")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      .attr("x", d => (x(d.account) + (x.bandwidth()/2)) )
      .attr("y", d => y(d.balanceInt) - 5)
      .text( function(d) { return d.balance });

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    
    svg.append("g")
      .call(d3.axisLeft(y));
  };

  showAccountPie (){
    var width = 500;
    var height = 500;
    var svg = d3.select("#accountPie")
      .attr("width", width)
      .attr("height", height)
    var radius = Math.min(width, height) / 2;
    
    //The <g> SVG element is a container used to group other SVG elements.
    var g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
    // set the color scale  
    var color = d3.scaleOrdinal([
           'green', '#1C6EA4',  'violet', 'red', 'orange', 'yellow', 
    ]);
  
    // Compute the position of each group on the pie:   
    var pie = d3.pie().value(function(d) { 
          return d.balanceInt; 
    });

    //radius for the arc   
    var path = d3.arc()
          .outerRadius(radius - 10).innerRadius(0);
    
    //radius for the label      
    var label = d3.arc()
          .outerRadius(radius-200).innerRadius(radius-20);

          
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    var arc = g.selectAll(".arc")
            .data(pie(this.state.account))
            .enter()
            .append("g")
            .attr("class", "arc");
  
        arc.append("path")
            .attr("d", path)
            .attr("fill", function(d, i) { return color(i); });
     
        arc.append("text")
    
            .attr("transform", function(d) { 
              var midAngle = d.endAngle < 1.5*Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
              return "translate(" + label.centroid(d)[0] + "," + label.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; })
            .data(this.state.account) 
            .text(function(d) { return d.account + " " + d.balancePercent + "%";})
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("font-size","20px");
            
            
        
};



  showTransactionChart() {
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = 1000 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#transactionChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
    svg.selectAll("*").remove();

    var maxY = Math.ceil (d3.max(this.state.sumCat.map(details => Number(details.amountInt))) / 500) * 500;
    
    var x = d3.scaleBand().range([0, width]);
    var y = d3.scaleLinear().domain([0, maxY]).range([height, 0]);
    
    x.domain(this.state.sumCat.map(details => details.category));
    y.domain([0, maxY]);
    


    svg.selectAll(".bar")
      .data(this.state.sumCat)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.category))
      .attr("width", x.bandwidth() - 10)
      .attr("y", d => y(d.amountInt))
      .attr("height", d => height - y(d.amountInt))
      .attr("fill", "#df5252"); 

    svg.selectAll("text.bar")
      .data(this.state.sumCat)
      .enter()
      .append("text")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      .attr("x", d => (x(d.category) + (x.bandwidth()/2)))
      .attr("y", d => y(d.amountInt) - 5)
      .text( function(d) { return "$" + d.amountInt });

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    
    svg.append("g")
      .call(d3.axisLeft(y));
  };




  showTransactionPie() { 
    var width = 500;
    var height = 500;
    var svg = d3.select("#transactionPie")
      .attr("width", width)
      .attr("height", height)
    var radius = Math.min(width, height) / 2;
    
    //The <g> SVG element is a container used to group other SVG elements.
    var g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
    // set the color scale  
    var color = d3.scaleOrdinal([
          'red', 'orange', 'yellow', 'green', '#1C6EA4', '#750cee', 'violet'
    ]);
  
    // Compute the position of each group on the pie:   
    var pie = d3.pie().value(function(d) { 
          return d.amountInt; 
    });

    //radius for the arc   
    var path = d3.arc()
          .outerRadius(radius - 10).innerRadius(0);
    
    //radius for the label      
    var label = d3.arc()
          .outerRadius(radius-200).innerRadius(radius-20);

          
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    var arc = g.selectAll(".arc")
            .data(pie(this.state.filteredSumCat))
            .enter()
            .append("g")
            .attr("class", "arc");
  
        arc.append("path")
            .attr("d", path)
            .attr("fill", function(d, i) { return color(i); });
     
        arc.append("text")
    
            .attr("transform", function(d) { 
              var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
              return "translate(" + label.centroid(d)[0] + "," + label.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; })
            .data(this.state.filteredSumCat) 
            .text(function(d) { return d.category + " " + d.percent + "%";})
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("font-size","20px")
            
            ;

        

  };




transactToggleClick() {
  this.setState(prevState => ({seeTransact: !prevState.seeTransact}))
  this.setState({seeCustomer: false})
  this.setState({seeAccount: false})
}

accountToggleClick() {
  this.setState(prevState => ({seeAccount: !prevState.seeAccount}))
  this.setState({seeCustomer: false})
  this.setState({seeTransact: false})
}

customerToggleClick() {
  this.setState(prevState => ({seeCustomer: !prevState.seeCustomer}))
  this.setState({seeTransact: false})
  this.setState({seeAccount: false}) 
}


  render() {
 
    return (
    
         <div className="App">
            
              <header className="App-header">
                  <img src={logo} className="App-logo" alt="logo" />
                  <h1 className="App-title">Welcome to FishTech!</h1>
                  
                    <button className="add-btn" onClick={this.transactToggleClick}>
                       {this.state.seeTransact ? 'Hide Transactions' : 'Show Transactions'}
                    </button>

                    <button className="add-btn" onClick={this.accountToggleClick}>
                       {this.state.seeAccount ? 'Hide Accounts' : 'Show Accounts'}
                    </button>

                    <button className="add-btn" onClick={this.customerToggleClick}>
                       {this.state.seeCustomer ? 'Hide Customers' : 'Show Customers'}
                    </button>
              </header>


              <div>
                {(() => {
                  switch (this.state.seeTransact) {
                    case false:   return null;
                    default:      return null;
                    case true:      return (        
                      <>

                      <h2>Your Transaction Overview</h2>
                      <svg id="transactionChart"></svg>
                      <svg id="transactionPie"></svg>


                      <h2>Your Transaction Details</h2>
                      <table className="myTable">
                        <tbody>
                          <tr>
                            <td><h4>Date</h4></td>
                            <td><h4>Category</h4></td>
                            <td><h4>Account</h4></td>
                            <td><h4>Amount</h4></td>
                          </tr>
                          {(this.state.transact).map((item) => { return (
                            <tr key={item.transaction_id} >         
                              <td> {item.timestamp} </td>
                              <td> {item.category} </td>
                              <td> {item.account}  </td>
                              <td> {item.amount} </td>
                            </tr>
                          )}
                          )}
                        </tbody>
                      </table>

                   
                      </>
                    );
                  }
                })()
                }
              </div>


              <div>
                {(() => {
                  switch (this.state.seeCustomer) {
                    case false:   return null;
                    default:      return null;
                    case true:      return ( <>       
                      
                      <h2>Your Customer Details</h2>
                      <table className="myTable">
                        <tbody>
                          <tr>
                            <td><h4>First Name</h4></td>
                            <td><h4>Last Name</h4></td>
                            <td><h4>Gender</h4></td>
                            <td><h4>Email</h4></td>
                          </tr>
                          {(this.state.customer).map((item) => { return (
                            <tr key={item.id} >         
                              <td> {item.first_name} </td>
                              <td> {item.last_name} </td>
                              <td> {item.gender}  </td>
                              <td> {item.email} </td>
                            </tr> 
                          )}
                          )}                        
                        </tbody>
                      </table>
                      </>
                    );
                  }
                })()
                }
              </div>


              <div>
                {(() => { 
                  switch (this.state.seeAccount) {
                    case false:   return null;
                    default:      return null;
                    case true:      return (
                      <>
                      <h2>Your Account Overview</h2>
                      <svg id="accountChart"></svg>
                      <svg id="accountPie"></svg>


                      <h2>Your Account Details</h2>
                      <table className="myTable">
                        <tbody>
                          <tr>
                            <td><h4>Account</h4></td>
                            <td><h4>Balance</h4></td>
                          </tr>
                          {(this.state.account).map((item) => { return (
                            <tr key={item.id} >         
                              <td> {item.account} </td>
                              <td> {item.balance} </td>
                            </tr> 
                          )}
                          )}
                        </tbody>
                      </table>
                      
                      
                      </>
                    );
                  }
                })()
                }
              </div>

          </div>

      );
        
  }

}

export default App;
