'use strict';
(function() {
    $(document).ready(() => {

         var protocol = window.location.protocol;
        var hostname = window.location.hostname;
        var port = 8080;
        var baseUrl = `${protocol}//${hostname}:${port}`;

        var strat1Mean, strat1Min, strat1Max;
        var strat2Mean, strat2Min, strat2Max;
        var strat3Mean, strat3Min, strat3Max;
        var strat4Mean, strat4Min, strat4Max;

        var strat1MeanProv, strat1MinProv, strat1MaxProv;
        var strat2MeanProv, strat2MinProv, strat2MaxProv;
        var strat3MeanProv, strat3MinProv, strat3MaxProv;
        var strat4MeanProv, strat4MinProv, strat4MaxProv;

        const $select = $('.msa-metro');
        // get msa from local storage
        const msaArr = JSON.parse(window.localStorage.getItem('msa'));
        const msaArrLen = msaArr.length;
        const state = JSON.parse(window.localStorage.getItem('state'));

        // get uid from local storage
        const uid =  JSON.parse(window.localStorage.getItem('uid'));

       
        let opt = document.createElement('option');
        opt.value = msaArr;
        opt.innerHTML = msaArr;    
        $select.append(opt);    

        $($select).sumoSelect();      
        $(strategy_metric_prov).sumoSelect();
        $(strategy_metric_payer).sumoSelect();
        
        // Global chart options
        Highcharts.setOptions({
            chart: {
                backgroundColor: 'RGB(242,242,242)'  ,
                height: 600,              
            },
            credits: {
                enabled: false
            },
            legend: {
                reversed: true
            },            
            lang: {
                numericSymbols: ['Th', ' M', 'B', 'T']
            }
        });
        var strategy_summary_Json;
        $(strategy_metric_prov).prop('disabled', true);
        $(strategy_metric_payer).prop('disabled', true);

        $(".getPayerImpact").click(function() {
            document.querySelector('.ajax-loader').style.display = 'block';
            $('.container-fluid').css('visibility', 'hidden');  
            fetchStrategy($(paySelect).val(),$(provSelect).val());
        });
        $(".getProvImpact").click(function() {
            document.querySelector('.ajax-loader').style.display = 'block';
            $('.container-fluid').css('visibility', 'hidden');  
            fetchStrategy($(paySelect).val(),$(provSelect).val());
        });

        fetchPayer({"stateName":state, "msa":msaArr, "type": "payer"});
        fetchProvider({"stateName":state, "msa":msaArr, "type": "provider"});

        async function fetchPayer(state_msa) {
            
            try {
              const url = `${baseUrl}/DRS/clientSelection`;
              let response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(state_msa) 
              });
    
            if(response.ok) {                
                                
                const payer_Json = await response.json();
                
                
                $.each(payer_Json, function (index) {
                    var optgroup = $('<optgroup>');
                    optgroup.attr('label',payer_Json[index].id);
        
                     $.each(payer_Json[index].client, function (i,value) {
                        var option = $("<option></option>");
                        option.val(payer_Json[index].client[i]);
                        option.text(payer_Json[index].client[i]);
                        optgroup.append(option);
                     });
                     $(paySelect).append(optgroup);
                 });
    
                 $(paySelect).sumoSelect({
                    searchInPanel: true,
                    search: true,
                    searchText: 'Search here..'
                });
            }
              
            } catch(e) {
              console.log(e);
            }
            }

            async function fetchProvider(state_msa) {
            
                try {
                  const url = `${baseUrl}/DRS/clientSelection`;
                  let response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(state_msa) 
                  });
        
                if(response.ok) {                
                           
                    document.querySelector('.ajax-loader').style.display = 'none';
                    $('.container-fluid').css('visibility', 'visible');
                    
                    const prov_Json = await response.json();
                                        
                    $.each(prov_Json, function (index) {
                        var optgroup = $('<optgroup>');
                        optgroup.attr('label',prov_Json[index].id);
            
                         $.each(prov_Json[index].client, function (i,value) {
                            var option = $("<option></option>");
                            option.val(prov_Json[index].client[i]);
                            option.text(prov_Json[index].client[i]);
                            optgroup.append(option);
                         });
                         $(provSelect).append(optgroup);
                     });
        
                     $(provSelect).sumoSelect({
                        searchInPanel: true,
                        search: true,
                        searchText: 'Search here..'
                    });
                }
                  
                } catch(e) {
                  console.log(e);
                }
                }
        

        async function fetchStrategy(payer, provider) {
            try {
            let response = await fetch(`${baseUrl}/DRS/runStrategy/${uid}` ,{
                method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({"payer": payer, "provider": provider}) 
                  });
            
            if(response.ok) {
                
                document.querySelector('.ajax-loader').style.display = 'none';
                $('.container-fluid').css('visibility', 'visible');
                strategy_summary_Json = await response.json();
                window.localStorage.setItem('strategyTest',JSON.stringify(strategy_summary_Json));
                $(strategy_metric_payer).prop('disabled', false); 
                $(strategy_metric_prov).prop('disabled', false);        
            
                updateChart(strategy_summary_Json);

            }} catch(e) {
                console.log(e);
              }
        }
        $(strategy_metric_payer).on('change', function(e) {
            strategy_summary_Json = JSON.parse(window.localStorage.getItem('strategyTest'));
            updateChart(strategy_summary_Json);
        });
        $(strategy_metric_prov).on('change', function(e) {
            strategy_summary_Json = JSON.parse(window.localStorage.getItem('strategyTest'));
            updateChart(strategy_summary_Json);
        });


        function updateChart(strategy_summary_Json){
            console.log("in update");

           const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length   

             strat1Mean =arrAvg(strategy_summary_Json.firmScenario.Strategy1Rev.map(i=>Number(i)));
             strat1Min =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy1Rev.map(i=>Number(i)));
             strat1Max =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy1Rev.map(i=>Number(i)));

             strat2Mean =arrAvg(strategy_summary_Json.firmScenario.Strategy2Rev.map(i=>Number(i)));
             strat2Min =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy2Rev.map(i=>Number(i)));
             strat2Max =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy2Rev.map(i=>Number(i)));

             strat3Mean =arrAvg(strategy_summary_Json.firmScenario.Strategy3Rev.map(i=>Number(i)));
             strat3Min =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy3Rev.map(i=>Number(i)));
             strat3Max =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy3Rev.map(i=>Number(i)));

             strat4Mean =arrAvg(strategy_summary_Json.firmScenario.Strategy4Rev.map(i=>Number(i)));
             strat4Min =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy4Rev.map(i=>Number(i)));
             strat4Max =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy4Rev.map(i=>Number(i)));
            
                if ($(strategy_metric_payer).val() == "Costs"){

                     strat1Mean =arrAvg(strategy_summary_Json.firmScenario.strategy1Costs.map(i=>Number(i)));
                     strat1Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy1Costs.map(i=>Number(i)));
                     strat1Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy1Costs.map(i=>Number(i)));
    
                     strat2Mean =arrAvg(strategy_summary_Json.firmScenario.strategy2Costs.map(i=>Number(i)));
                     strat2Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy2Costs.map(i=>Number(i)));
                     strat2Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy2Costs.map(i=>Number(i)));
    
                     strat3Mean =arrAvg(strategy_summary_Json.firmScenario.strategy3Costs.map(i=>Number(i)));
                     strat3Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy3Costs.map(i=>Number(i)));
                     strat3Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy3Costs.map(i=>Number(i)));
    
                     strat4Mean =arrAvg(strategy_summary_Json.firmScenario.strategy4Costs.map(i=>Number(i)));
                     strat4Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy4Costs.map(i=>Number(i)));
                     strat4Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy4Costs.map(i=>Number(i)));
                     
                } else if ($(strategy_metric_payer).val()== "Profit") {

                     strat1Mean =arrAvg(strategy_summary_Json.firmScenario.strategy1Prof.map(i=>Number(i)));
                     strat1Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy1Prof.map(i=>Number(i)));
                     strat1Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy1Prof.map(i=>Number(i)));
    
                     strat2Mean =arrAvg(strategy_summary_Json.firmScenario.strategy2Prof.map(i=>Number(i)));
                     strat2Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy2Prof.map(i=>Number(i)));
                     strat2Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy2Prof.map(i=>Number(i)));
    
                     strat3Mean =arrAvg(strategy_summary_Json.firmScenario.strategy3Prof.map(i=>Number(i)));
                     strat3Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy3Prof.map(i=>Number(i)));
                     strat3Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy3Prof.map(i=>Number(i)));
    
                     strat4Mean =arrAvg(strategy_summary_Json.firmScenario.strategy4Prof.map(i=>Number(i)));
                     strat4Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy4Prof.map(i=>Number(i)));
                     strat4Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy4Prof.map(i=>Number(i)));
                    
                }
                
                /* Provider */
                 strat1MeanProv =arrAvg(strategy_summary_Json.firmScenario.Strategy1RevProv.map(i=>Number(i)));
                 strat1MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy1RevProv.map(i=>Number(i)));
                 strat1MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy1RevProv.map(i=>Number(i)));
                
                 strat2MeanProv =arrAvg(strategy_summary_Json.firmScenario.Strategy2RevProv.map(i=>Number(i)));
                 strat2MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy2RevProv.map(i=>Number(i)));
                 strat2MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy2RevProv.map(i=>Number(i)));

                 strat3MeanProv =arrAvg(strategy_summary_Json.firmScenario.Strategy3RevProv.map(i=>Number(i)));
                 strat3MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy3RevProv.map(i=>Number(i)));
                 strat3MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy3RevProv.map(i=>Number(i)));

                 strat4MeanProv =arrAvg(strategy_summary_Json.firmScenario.Strategy4Rev.map(i=>Number(i)));
                 strat4MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.Strategy4RevProv.map(i=>Number(i)));
                 strat4MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.Strategy4RevProv.map(i=>Number(i)));

                if ($(strategy_metric_prov).val() == "Costs"){

                    strat1MeanProv =arrAvg(strategy_summary_Json.firmScenario.strategy1CostsProv.map(i=>Number(i)));
                    strat1MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy1CostsProv.map(i=>Number(i)));
                    strat1MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy1CostsProv.map(i=>Number(i)));
   
                    strat2MeanProv =arrAvg(strategy_summary_Json.firmScenario.strategy2CostsProv.map(i=>Number(i)));
                    strat2MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy2CostsProv.map(i=>Number(i)));
                    strat2MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy2CostsProv.map(i=>Number(i)));
   
                    strat3MeanProv =arrAvg(strategy_summary_Json.firmScenario.strategy3CostsProv.map(i=>Number(i)));
                    strat3MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy3CostsProv.map(i=>Number(i)));
                    strat3MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy3CostsProv.map(i=>Number(i)));
   
                    strat4MeanProv =arrAvg(strategy_summary_Json.firmScenario.strategy4CostsProv.map(i=>Number(i)));
                    strat4MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy4CostsProv.map(i=>Number(i)));
                    strat4MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy4CostsProv.map(i=>Number(i)));
                    
               } else if ($(strategy_metric_prov).val()== "Profit") {

                    strat1MeanProv =arrAvg(strategy_summary_Json.firmScenario.strategy1ProfProv.map(i=>Number(i)));
                    strat1MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy1ProfProv.map(i=>Number(i)));
                    strat1MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy1ProfProv.map(i=>Number(i)));
   
                    strat2MeanProv =arrAvg(strategy_summary_Json.firmScenario.strategy2ProfProv.map(i=>Number(i)));
                    strat2MinProv =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy2ProfProv.map(i=>Number(i)));
                    strat2MaxProv =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy2ProfProv.map(i=>Number(i)));
   
                    strat3Mean =arrAvg(strategy_summary_Json.firmScenario.strategy3ProfProv.map(i=>Number(i)));
                    strat3Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy3ProfProv.map(i=>Number(i)));
                    strat3Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy3ProfProv.map(i=>Number(i)));
   
                    strat4Mean =arrAvg(strategy_summary_Json.firmScenario.strategy4ProfProv.map(i=>Number(i)));
                    strat4Min =Math.min.apply(null,strategy_summary_Json.firmScenario.strategy4ProfProv.map(i=>Number(i)));
                    strat4Max =Math.max.apply(null,strategy_summary_Json.firmScenario.strategy4ProfProv.map(i=>Number(i)));
                   
               }

                
                Highcharts.chart('Payer_Strategy', {
                    chart: {
                        type: 'scatter',
                        zoomType: 'xy'
                    },
                    legend: {
                        reversed: false
                    },
                    title: {
                        text: `Impact of Strategies`,
                        align: 'center'
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                radius: 16
                            }
                        }
                    },
                    xAxis: {
                        visible: false                            
                    },
                    yAxis: {
                        title: '',
                        visible: true
                        
                    },   
                    series: [
                    {
                        name: "Strategy 1",
                        data:  [[1, strat1Mean]],
                        marker: {
                            symbol: 'circle',                                
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_payer option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                       
                    }, {
                        name: "Strategy 2",
                        data:  [[2, strat2Mean]],
                        marker: {
                            symbol: 'circle',                                
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_payer option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                    },                                                 
                    {                            
                        name: "Strategy 3",
                        data:  [[3, strat3Mean]],
                        marker: {
                            symbol: 'circle'
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_payer option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                    },
                    {
                        name: "Strategy 4",
                        data:  [[4, strat4Mean]],
                        marker: {
                            symbol: 'circle',                                
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_payer option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                       
                    },
                    
                    {
                    type: "errorbar",
                    name: "Strategy 1 error",
                    data: [[1,strat1Min,strat1Max]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_payer option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    },
                    {
                    type: "errorbar",
                    name: "Strategy 2 error",
                    data: [[2,strat2Min,strat2Max]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_payer option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    },
                    {
                    type: "errorbar",
                    name: "Strategy 3 error",
                    data: [[3,strat3Min,strat3Max]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_payer option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    },
                    {
                    type: "errorbar",
                    name: "Strategy 4 error",
                    data: [[4,strat4Min,strat4Max]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_payer option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    }                   
                ]
                });   
                
                
                Highcharts.chart('Provider_Strategy', {
                    chart: {
                        type: 'scatter',
                        zoomType: 'xy'
                    },
                    legend: {
                        reversed: false
                    },
                    title: {
                        text: `Impact of Strategies`,
                        align: 'center'
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                radius: 16
                            }
                        }
                    },
                    xAxis: {
                        visible: false                            
                    },
                    yAxis: {
                        title: '',
                        visible: true
                        
                    },   
                    series: [
                    {
                        name: "Strategy 1",
                        data:  [[1, strat1MeanProv]],
                        marker: {
                            symbol: 'circle',                                
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_prov option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                       
                    }, {
                        name: "Strategy 2",
                        data:  [[2, strat2MeanProv]],
                        marker: {
                            symbol: 'circle',                                
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_prov option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                    },                                                 
                    {                            
                        name: "Strategy 3",
                        data:  [[3, strat3MeanProv]],
                        marker: {
                            symbol: 'circle'
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_prov option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                    },
                    {
                        name: "Strategy 4",
                        data:  [[4, strat4MeanProv]],
                        marker: {
                            symbol: 'circle',                                
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#strategy_metric_prov option:selected").text()}</span>: <b> ${convert(this.y)} </b> `
                             }
                        }
                       
                    },
                    
                    {
                    type: "errorbar",
                    name: "Strategy 1 error",
                    data: [[1,strat1MinProv,strat1MaxProv]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_prov option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    },
                    {
                    type: "errorbar",
                    name: "Strategy 2 error",
                    data: [[2,strat2MinProv,strat2MaxProv]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_prov option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    },
                    {
                    type: "errorbar",
                    name: "Strategy 3 error",
                    data: [[3,strat3MinProv,strat3MaxProv]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_prov option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    },
                    {
                    type: "errorbar",
                    name: "Strategy 4 error",
                    data: [[4,strat4MinProv,strat4MaxProv]],
                    tooltip: {
                        pointFormatter: function(){ 
                            return `<span style="font-weight: bold;"> ${$("#strategy_metric_prov option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                         }
                    }
                    }                   
                ]
                });  
        }

        function convert(number) {
            let formattedNumber = number;
             let finalNum = '';
            
            let digits = new Number(Math.abs(formattedNumber)).toString().length;
            if(digits > 9) {
                formattedNumber /= (1.0e+9);
                finalNum = formattedNumber;
                finalNum = parseFloat(formattedNumber.toFixed(1)) + ' B'
            } else if(digits <= 9 && digits>=6) {
                formattedNumber /= (1.0e+6);
                finalNum = formattedNumber;
                finalNum = parseFloat(formattedNumber.toFixed(1)) + ' M'
            } else {
                finalNum = new Number(formattedNumber).toString();
            }
            return `$ ${finalNum}`;
        }

        // Strtegy Planner Provider tester
        getPlannerProvider();
        async function getPlannerProvider() {
           
            try {
                 //let response = await fetch(`${baseUrl}/strategyPlanner/Strategy Planner Provider/${uid}`);
                 let response = await fetch(`http://localhost:8080/DRS/strategyPlanner/Strategy%20Planner%20Provider/${uid}`);

                if(response.ok) {
                    let json_array = await response.json();
                    let tbodyData = json_array.Strategy_Planner_Provider;
                    // Pop the header data
                    tbodyData.shift();
                    // Remove null 
                    let finalTbodyData = JSON.stringify(tbodyData, function (key, value) {return (value === null) ? "" : value});
                    createTableProvider(JSON.parse(finalTbodyData));

                }
            }
            catch(err) {
                console.log(err);
            }
        }

        //getPlannerPayer();
        async function getPlannerPayer() {
           
            try {
                 //let response = await fetch(`${baseUrl}/strategyPlanner/Strategy Planner Provider/${uid}`);
                 let response = await fetch(`http://localhost:8080/DRS/strategyPlanner/Strategy Planner Payer/${uid}`);

                if(response.ok) {
                    let json_array = await response.json();
                    let tbodyData = json_array.Strategy_Planner_Provider;
                    console.log(tbodyData);
                    // Pop the header data
                    tbodyData.shift();
                    // Remove null 
                    let finalTbodyData = JSON.stringify(tbodyData, function (key, value) {return (value === null) ? "" : value});
                    createTablePayer(JSON.parse(finalTbodyData));

                }
            }
            catch(err) {
                console.log(err);
            }
        }

        function createTableProvider(finalTbodyData) {

            finalTbodyData.forEach(function(rowData) {
            let row = document.createElement('tr');
          
            rowData.forEach(function(cellData) {
              let cell = document.createElement('td');
              cell.appendChild(document.createTextNode(cellData));
              cell.setAttribute("contenteditable", "true");
              row.appendChild(cell);
            });
          
              document.getElementById('tbody_provider_strategy_tester').appendChild(row);
            });
        }

        function createTablePayer(finalTbodyData) {

            finalTbodyData.forEach(function(rowData) {
            let row = document.createElement('tr');
          
            rowData.forEach(function(cellData) {
              let cell = document.createElement('td');
              cell.appendChild(document.createTextNode(cellData));
              cell.setAttribute("contenteditable", "true");
              row.appendChild(cell);
            });
          
              document.getElementById('tbody_payer_strategy_tester').appendChild(row);
            });
        }

        // Update - POST to excel 
        $('.save_provider').on('click', function() {
            var provider_strategy_tester_obj = {};
            $("table.provider_strategy_tester > tbody > tr > td").each(function (index) {
                provider_strategy_tester_obj[index] = $(this).text();
            });
            //console.log(provider_strategy_tester_obj);
            try {
                const url = `${baseUrl}/DRS/Update/Scenario Definitions 2025/Strategy Planner Provider/${uid}`;
                
                let response = fetch(url, {
                  method: 'POST',
                  headers: {
                    "Content-Type": "application/json"
                },
                  body: JSON.stringify(provider_strategy_tester_obj) 
                });
    
                if(response.ok) {
                    alert("Updated the Strategy Planner Provider Successfully.");
                }
              } catch(e) {
                console.log(e);
              }
        });

        $('.save_payer').on('click', function() {
            var payer_strategy_tester_obj = {};
            $("table.payer_strategy_tester > tbody > tr > td").each(function (index) {
                payer_strategy_tester_obj[index] = $(this).text();
            });
            //console.log(payer_strategy_tester_obj);
            try {
                const url = `${baseUrl}/DRS/Update/Scenario Definitions 2025/Strategy Planner Payer/${uid}`;
                
                let response =  fetch(url, {
                  method: 'POST',
                  headers: {
                    "Content-Type": "application/json"
                },
                  body: JSON.stringify(payer_strategy_tester_obj) 
                });
    
                if(response.ok) {
                    alert("Updated the Strategy Planner payer Successfully.");
                }
              } catch(e) {
                console.log(e);
              }
        });
    // DOM ready end
    });
    
}) (); // IIFE end

