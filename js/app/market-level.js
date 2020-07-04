'use strict';

(function() {
    $(document).ready(() => {
        
        const colors = ['#4DACF1', '#FFA929', '#E86153','#D93954','#D04A02','#707070','#DEB8FF'];
        const $select = $('.msa-metro');

        var protocol = window.location.protocol;
        var hostname = window.location.hostname;
        var port = 8080;
        var baseUrl = `${protocol}//${hostname}:${port}`;

        // get uid from local storage
        const uid =  JSON.parse(window.localStorage.getItem('uid'));

        function convert(number) {
            let formattedNumber = number;
             let finalNum = '';
            
            let digits = new Number(formattedNumber).toString().length;
            if(digits) {
                formattedNumber /= (1.0e+9);
                finalNum = formattedNumber;
                finalNum = parseFloat(formattedNumber.toFixed(1)) + ' B'
            } else {
                finalNum = new Number(formattedNumber).toString();
            }
            return `$ ${finalNum}`;
        }

        // get msa from local storage
        const msaArr = JSON.parse(window.localStorage.getItem('msa'));
        // get state from local storage
        const state = JSON.parse(window.localStorage.getItem('state'));
        //console.log(msaArr + state + new Date().toDateString());
        const msaArrLen = msaArr.length;
        
        let opt = document.createElement('option');
        opt.value = msaArr;
        opt.innerHTML = msaArr;   
        $select.append(opt);    
        
        $($select).sumoSelect();
        $(filter_revenue_profit).sumoSelect();
        $(filter_revenue_profit_compare).sumoSelect();
        $(rev_shift_scenario_one).sumoSelect();
        $(rev_shift_scenario_two).sumoSelect();
        
        $(rev_shift_scenario_one).on('change', function(e) {
            fetchScenarioComparisonData($(filter_revenue_profit_compare).val());
        });
        $(rev_shift_scenario_two).on('change', function(e) {
           //console.log('rev_shift_scenario_two');
           fetchScenarioComparisonData($(filter_revenue_profit_compare).val());
        });
       
        // Global chart options
        Highcharts.setOptions({
            chart: {
                backgroundColor: 'RGB(242,242,242)'  ,
                height: 600,              
            },
            colors: colors,
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

        let default_selected_prof_revenue = $(filter_revenue_profit).find('option:selected').val();

        $(filter_revenue_profit).on('change', function(e) {
            fetchScenarioComparisonData($(this).val());
        });
        $(filter_revenue_profit_compare).on('change', function(e) {
            fetchScenarioComparisonData($(this).val());
        });
      
        fetchScenarioComparisonData(default_selected_prof_revenue);

        async function fetchScenarioComparisonData(selectedValue) {
            try {
                const uid =  JSON.parse(window.localStorage.getItem('uid'));
                console.log(uid);
                let response = await fetch(`${baseUrl}/DRS/scenarioComparison/${selectedValue}/${uid}`,{
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                
                if(response.ok) {
                    document.querySelector('.ajax-loader').style.display = 'none';
                    $('.container-fluid').css('visibility', 'visible');
                    const scenario_compare_json = await response.json();

                    // By source of funds
                    const final_commercial_arr =[];
                    const final_consumer_arr =[];
                    const final_gov_arr = [];
                    const final_commercial_scatter_arr=[];
                    const final_consumer_scatter_arr=[];
                    const final_gov_scatter_arr=[];
                    var commercial_scatter_arr;
                    var consumer_scatter_arr;
                    var gov_scatter_arr;

                    let commercial_arr = scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[1].filter(e => e);
                    commercial_arr.shift();
                    let gov_arr = scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[2].filter(e => e);
                    gov_arr.shift();
                    let consumer_arr = scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[3].filter(e => e);
                    consumer_arr.shift();
                    
                    for(let i=0; i<commercial_arr.length; i++) {
                        final_commercial_arr.push(Number(commercial_arr[i]));
                        commercial_scatter_arr = [(Number('1')),Number(commercial_arr[i])];
                        final_commercial_scatter_arr.push(commercial_scatter_arr);
                    }
                    for(let i=0; i<gov_arr.length; i++) {
                        final_gov_arr.push(Number(gov_arr[i]));
                        gov_scatter_arr = [(Number('2')),Number(gov_arr[i])];
                        final_gov_scatter_arr.push(gov_scatter_arr);
                    }
                    for(let i=0; i<consumer_arr.length; i++) {
                        final_consumer_arr.push(Number(consumer_arr[i]));
                        consumer_scatter_arr = [(Number('3')),Number(consumer_arr[i])];
                        final_consumer_scatter_arr.push(consumer_scatter_arr);
                    }
                    Highcharts.chart('soc_market_level', {
                        chart: {
                            type: 'bar',
                            
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal'
                            }
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() + ` by scenario and by source of funds`,
                            align: 'center'
                        },
                        xAxis: {
                            categories: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[0].slice(1,10).filter(e => e),
                            title: '',
                            visible: true
                        },
                        yAxis: {
                            title: '',
                            visible: true
                        },
                        series: [{
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[1][0],
                            data: final_commercial_arr
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[2][0],
                            data: final_gov_arr
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[3][0],
                            data: final_consumer_arr
                        }],
                        tooltip: {
                            outside: true,
                            backgroundColor:'#2d2d2d',
                            borderColor: '#707070',
                            style: {
                                color: '#fff'
                            },
                            formatter: function(){ 
                                return `<span align='center'>${this.series.name}
                                <br/><br/> ${$("#filter_revenue_profit option:selected").text()}: ${convert(this.y)}</span>`
                            }
            
                        },

                    });


                    Highcharts.chart('soc_market_level_scatter', {
                        chart: {
                            type: 'scatter',
                            zoomType: 'xy'
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() + ` Range across scenarios by source of funds`,
                            align: 'center'
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 8
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
                        legend: {
                            reversed: false
                        },
                        tooltip: {
                            shared: true
                        },
                    
                        series: [{
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[1][0],
                            data: [[1,Number(scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[1][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        }, 
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[1][0] + " error",
                            data: [[1,Math.min.apply(null,final_commercial_arr.slice(1,10)),Math.max.apply(null,final_commercial_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                           
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[2][0],
                            data: [[2,Number(scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[2][2])]],
                            marker: {
                                symbol: 'circle',                               
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        }, 
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[2][0] + " error",
                            data: [[2,Math.min.apply(null,final_gov_arr.slice(1,10)),Math.max.apply(null,final_gov_arr.slice(1,10))]],                           
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        }  ,                                              
                        {                            
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[3][0],
                            data: [[3,Number(scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[3][2])]],
                            marker: {
                                symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[3][0] + " error",
                            data: [[3,Math.min.apply(null,final_consumer_arr.slice(1,10)),Math.max.apply(null,final_consumer_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            } 
                           
                        } 
                    ],
                    
                    });
                    
                    // By Line of business
                    const final_lob_commercial_arr =[];
                    const final_Medicare_arr =[];
                    const final_Medicaid_arr = [];
                    const final_Exchanges_arr = [];
                    const final_OOP_arr = [];
                    const final_Uninsured_arr = [];
                    const final_lob_commercial_scatter_arr=[];
                    const final_Medicare_scatter_arr=[];
                    const final_Medicaid_scatter_arr=[];
                    const final_Exchanges_commercial_scatter_arr=[];
                    const final_OOP_scatter_arr=[];
                    const final_Uninsured_scatter_arr=[];
                    var lob_scatter_arr;
                    

                    let lob_commercial_arr = scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[1].filter(e => e);
                    lob_commercial_arr.shift();
                    let lob_medicare_arr = scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[2].filter(e => e);
                    lob_medicare_arr.shift();
                    let lob_medicaid_arr = scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[3].filter(e => e);
                    lob_medicaid_arr.shift();
            
                    let lob_Exchanges_arr = scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[4].filter(e => e);
                    lob_Exchanges_arr.shift();
                    let lob_Oop_arr = scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[5].filter(e => e);
                    lob_Oop_arr.shift();
                    let lob_Uninsured_arr = scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[6].filter(e => e);
                    lob_Uninsured_arr.shift();
                    
                    for(let i=0; i<lob_commercial_arr.length; i++) {
                        final_lob_commercial_arr.push(Number(lob_commercial_arr[i]));
                        lob_scatter_arr = [(Number('1')),Number(lob_commercial_arr[i])];
                        final_lob_commercial_scatter_arr.push(lob_scatter_arr);
                    }
                    for(let i=0; i<lob_medicare_arr.length; i++) {
                        final_Medicare_arr.push(Number(lob_medicare_arr[i]));
                        lob_scatter_arr = [(Number('2')),Number(lob_medicare_arr[i])];
                        final_Medicare_scatter_arr.push(lob_scatter_arr);
                    }
                    for(let i=0; i<lob_medicaid_arr.length; i++) {
                        final_Medicaid_arr.push(Number(lob_medicaid_arr[i]));
                        lob_scatter_arr = [(Number('3')),Number(lob_medicaid_arr[i])];
                        final_Medicaid_scatter_arr.push(lob_scatter_arr);
                    }
                    for(let i=0; i<lob_Exchanges_arr.length; i++) {
                        final_Exchanges_arr.push(Number(lob_Exchanges_arr[i]));
                        lob_scatter_arr = [(Number('4')),Number(lob_Exchanges_arr[i])];
                        final_Exchanges_commercial_scatter_arr.push(lob_scatter_arr);
                    }
                    for(let i=0; i<lob_Oop_arr.length; i++) {
                        final_OOP_arr.push(Number(lob_Oop_arr[i]));
                        lob_scatter_arr = [(Number('5')),Number(lob_Oop_arr[i])];
                        final_OOP_scatter_arr.push(lob_scatter_arr);
                    }
                    for(let i=0; i<lob_Uninsured_arr.length; i++) {
                        final_Uninsured_arr.push(Number(lob_Uninsured_arr[i]));
                        lob_scatter_arr = [(Number('6')),Number(lob_Uninsured_arr[i])];
                        final_Uninsured_scatter_arr.push(lob_scatter_arr);
                    }
                    
                    Highcharts.chart('lob_market_level', {
                        chart: {
                            type: 'bar',                            
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal'
                            }
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() + ` by scenario and by line of business`,
                            align: 'center'
                        },
                        xAxis: {
                            categories: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[0].slice(1,10).filter(e => e),
                            visible: true
                        },
                        yAxis: {
                            title: '',
                            visible: true
                        },
                        series: [{
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[1][0],
                            data: final_lob_commercial_arr
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[2][0],
                            data: final_Medicare_arr
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[3][0],
                            data: final_Medicaid_arr
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[4][0],
                            data: final_Exchanges_arr
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[5][0],
                            data: final_OOP_arr
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[6][0],
                            data: final_Uninsured_arr
                        }],
                        tooltip: {
                            outside: true,
                            backgroundColor:'#2d2d2d',
                            borderColor: '#707070',
                            style: {
                                color: '#fff'
                            },
                            formatter: function(){ 
                                return `<div class='text-center'><span align='center'>${this.series.name}
                                <br/><br/> ${$("#filter_revenue_profit option:selected").text()}: ${convert(this.y)}
                                `
                            }
            
                        },
                    });
                    Highcharts.chart('lob_market_level_scatter', {
                        chart: {
                            type: 'scatter',
                            zoomType: 'xy'
                        },
                        legend: {
                            reversed: false
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() +` range across scenarios by line of business`,
                            align: 'center'
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 8
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
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[1][0],
                            data:  [[1,Number(scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[1][2])]],
                            marker: {
                                symbol: 'circle',                                
                            } ,
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }                          
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[1][0] + " error",
                            data: [[1,Math.max.apply(null,final_lob_commercial_arr.slice(1,10)),Math.min.apply(null,final_lob_commercial_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                           
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[2][0],
                            data:  [[2,Number(scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[2][2])]],                           
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[2][0] + " error",
                            data: [[2,Math.max.apply(null,final_Medicare_arr.slice(1,10)),Math.min.apply(null,final_Medicare_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                            
                           
                        },                                                 
                        {                            
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[3][0],
                            data:  [[3,Number(scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[3][2])]],
                            marker: {
                                symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[3][0] + " error",
                            data: [[3,Math.max.apply(null,final_Medicaid_arr.slice(1,10)),Math.min.apply(null,final_Medicaid_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                            
                           
                        }, 
                        {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[4][0],
                            data:  [[4,Number(scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[4][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[4][0] + " error",
                            data: [[4,Math.max.apply(null,final_Exchanges_arr.slice(1,10)),Math.min.apply(null,final_Exchanges_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        }, 
                        {
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[5][0],
                            data:  [[5,Number(scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[5][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[5][0] + " error",
                            data: [[5,Math.max.apply(null,final_OOP_arr.slice(1,10)),Math.min.apply(null,final_OOP_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                            
                           
                        },                                                 
                        {                            
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[6][0],
                            data:  [[6,Number(scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[6][2])]],
                            marker: {
                                symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[6][0] + " error",
                            data: [[6,Math.max.apply(null,final_Uninsured_arr.slice(1,10)),Math.min.apply(null,final_Uninsured_arr.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                            
                           
                        },
                    
                    ]
                    });
                
                    // By Payer graph
                    const final_payer_arr1 =[];
                    const final_payer_arr2 =[];
                    const final_payer_arr3 =[];
                    const final_payer_arr4 =[];
                    const final_payer_arr5 =[];
                    const final_payer_arr6 =[];
                    const final_payer_scat_arr1 =[];
                    const final_payer_scat_arr2 =[];
                    const final_payer_scat_arr3 =[];
                    const final_payer_scat_arr4 =[];
                    const final_payer_scat_arr5 =[];
                    const final_payer_scat_arr6 =[];
                    var payer_arr;

                    let payer_arr1 = scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[1].filter(e => e);
                    payer_arr1.shift();
                    let payer_arr2 = scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[2].filter(e => e);
                    payer_arr2.shift();
                    let payer_arr3 = scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[3].filter(e => e);
                    payer_arr3.shift();
            
                    let payer_arr4 = scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[4].filter(e => e);
                    payer_arr4.shift();
                    let payer_arr5 = scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[5].filter(e => e);
                    payer_arr5.shift();
                    let payer_arr6 = scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[6].filter(e => e);
                    payer_arr6.shift();
                    
                    for(let i=0; i<payer_arr1.length; i++) {
                        final_payer_arr1.push(Number(payer_arr1[i]));
                        payer_arr = [(Number('1')),Number(payer_arr1[i])];
                        final_payer_scat_arr1.push(payer_arr);
                    }
                    for(let i=0; i<payer_arr2.length; i++) {
                        final_payer_arr2.push(Number(payer_arr2[i]));
                        payer_arr = [(Number('2')),Number(payer_arr2[i])];
                        final_payer_scat_arr2.push(payer_arr);
                    }
                    for(let i=0; i<payer_arr3.length; i++) {
                        final_payer_arr3.push(Number(payer_arr3[i]));
                        payer_arr = [(Number('3')),Number(payer_arr3[i])];
                        final_payer_scat_arr3.push(payer_arr);
                    }
                    for(let i=0; i<payer_arr4.length; i++) {
                        final_payer_arr4.push(Number(payer_arr4[i]));
                        payer_arr = [(Number('4')),Number(payer_arr4[i])];
                        final_payer_scat_arr4.push(payer_arr);
                    }
                    for(let i=0; i<payer_arr5.length; i++) {
                        final_payer_arr5.push(Number(payer_arr5[i]));
                        payer_arr = [(Number('5')),Number(payer_arr5[i])];
                        final_payer_scat_arr5.push(payer_arr);
                    }
                    for(let i=0; i<payer_arr6.length; i++) {
                        final_payer_arr6.push(Number(payer_arr6[i]));
                        payer_arr = [(Number('6')),Number(payer_arr6[i])];
                        final_payer_scat_arr6.push(payer_arr);
                    }
                    
                    Highcharts.chart('by_payer_market_level', {
                        chart: {
                            type: 'bar',                            
                        },
                        
                        plotOptions: {
                            series: {
                                stacking: 'normal'
                            }
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() + ` by scenario and by payer`,
                            align: 'center'
                        },
                        xAxis: {
                            categories: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[0].slice(1,10).filter(e => e),
                            visible: true
                        },
                        yAxis: {
                            title: '',
                            visible: true
                        },
                        series: [{
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[1][0],
                            data: final_payer_arr1
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[2][0],
                            data: final_payer_arr2
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[3][0],
                            data: final_payer_arr3
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[4][0],
                            data: final_payer_arr4
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[5][0],
                            data: final_payer_arr5
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[6][0],
                            data: final_payer_arr6
                        }],
                        tooltip: {
                            outside: true,
                            backgroundColor:'#2d2d2d',
                            borderColor: '#707070',
                            style: {
                                color: '#fff'
                            },
                            formatter: function(){ 
                                return `<div class='text-center'><span align='center'>${this.series.name}
                                <br/><br/> ${$("#filter_revenue_profit option:selected").text()}: ${convert(this.y)}
                                `
                            }
            
                        },
                    });


                    Highcharts.chart('by_payer_market_level_scatter', {
                        chart: {
                            type: 'scatter',
                            zoomType: 'xy'
                        },
                        legend: {
                            reversed: false
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() + ` range across scenarios by payer`,
                            align: 'center'
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 8
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
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[1][0],
                            data:  [[1,Number(scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[1][2])]],
                            marker: {
                                symbol: 'circle',                                
                            } ,
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }                          
                        }, 
                        {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[2][0],
                            data:  [[2,Number(scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[2][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },                                                 
                        {                            
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[3][0],
                            data:  [[3,Number(scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[3][2])]],
                            marker: {
                                symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[4][0],
                            data:  [[4,Number(scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[4][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                           
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[5][0],
                            data:  [[5,Number(scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[5][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },                                                 
                      /*  {                            
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[6][0],
                            data:  [[6,Number(scenario_compare_json.scenarioComparisonMap.LBy_Payer.By_Payer[6][2])]],
                            marker: {
                              symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        }*/
                        
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[1][0] + " error",
                            data: [[1,Math.max.apply(null,final_payer_arr1.slice(1,10)),Math.min.apply(null,final_payer_arr1.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[2][0] + " error",
                            data: [[2,Math.max.apply(null,final_payer_arr2.slice(1,10)),Math.min.apply(null,final_payer_arr2.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[3][0] + " error",
                            data: [[3,Math.max.apply(null,final_payer_arr3.slice(1,10)),Math.min.apply(null,final_payer_arr3.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[4][0] + " error",
                            data: [[4,Math.max.apply(null,final_payer_arr4.slice(1,10)),Math.min.apply(null,final_payer_arr4.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[5][0] + " error",
                            data: [[5,Math.max.apply(null,final_payer_arr5.slice(1,10)),Math.min.apply(null,final_payer_arr5.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        /*{
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[6][0] + " error",
                            data: [[6,Math.max.apply(null,final_payer_arr6.slice(1,10)),Math.min.apply(null,final_payer_arr6.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },*/
                    ]
                    });

                    // By Health System graph
                     const final_health_system1 =[];
                     const final_health_system2 =[];
                     const final_health_system3 =[];
                     const final_health_system4 =[];
                     const final_health_system5 =[];
                     const final_health_system6 =[];
                     const final_health_system_scat_arr1 =[];
                     const final_health_system_scat_arr2 =[];
                     const final_health_system_scat_arr3 =[];
                     const final_health_system_scat_arr4 =[];
                     const final_health_system_scat_arr5 =[];
                     const final_health_system_scat_arr6 =[];
                     var health_system_arr;
 
                     let health_system1 = scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[1].filter(e => e);
                     health_system1.shift();
                     let health_system2 = scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[2].filter(e => e);
                     health_system2.shift();
                     let health_system3 = scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[3].filter(e => e);
                     health_system3.shift();
             
                     let health_system4 = scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[4].filter(e => e);
                     health_system4.shift();
                     let health_system5 = scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[5].filter(e => e);
                     health_system5.shift();
                     let health_system6 = scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[6].filter(e => e);
                     health_system6.shift();
                     
                     for(let i=0; i<health_system1.length; i++) {
                         final_health_system1.push(Number(health_system1[i]));
                         health_system_arr = [(Number('1')),Number(health_system1[i])];
                         final_health_system_scat_arr1.push(health_system_arr);
                     }
                     for(let i=0; i<health_system2.length; i++) {
                         final_health_system2.push(Number(health_system2[i]));
                         health_system_arr = [(Number('2')),Number(health_system2[i])];
                         final_health_system_scat_arr2.push(health_system_arr);
                     }
                     for(let i=0; i<health_system3.length; i++) {
                         final_health_system3.push(Number(health_system3[i]));
                         health_system_arr = [(Number('3')),Number(health_system3[i])];
                         final_health_system_scat_arr3.push(health_system_arr);
                     }
                     for(let i=0; i<health_system4.length; i++) {
                         final_health_system4.push(Number(health_system4[i]));
                         health_system_arr = [(Number('4')),Number(health_system4[i])];
                         final_health_system_scat_arr4.push(health_system_arr);
                     }
                     for(let i=0; i<health_system5.length; i++) {
                         final_health_system5.push(Number(health_system5[i]));
                         health_system_arr = [(Number('5')),Number(health_system5[i])];
                         final_health_system_scat_arr5.push(health_system_arr);
                     }
                     for(let i=0; i<health_system6.length; i++) {
                         final_health_system6.push(Number(health_system6[i]));
                         health_system_arr = [(Number('6')),Number(health_system6[i])];
                         final_health_system_scat_arr6.push(health_system_arr);
                     }
                     
                     Highcharts.chart('by_health_system_market_level', {
                        chart: {
                            type: 'bar',                            
                        },
                        
                        plotOptions: {
                            series: {
                                stacking: 'normal'
                            }
                        },
                       
                         title: {
                             text: $("#filter_revenue_profit option:selected").text() + ` by scenario and by health system`,
                             align: 'center'
                         },
                         xAxis: {
                             categories: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[0].slice(1,10).filter(e => e),
                             visible: true
                         },
                         yAxis: {
                            title: '',
                            visible: true
                        },
                         series: [{
                             name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[1][0],
                             data: final_health_system1
                         }, {
                             name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[2][0],
                             data: final_health_system2
                         }, {
                             name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[3][0],
                             data: final_health_system3
                         },
                         {
                             name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[4][0],
                             data: final_health_system4
                         },
                         {
                             name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[5][0],
                             data: final_health_system5
                         },
                         {
                             name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[6][0],
                             data: final_health_system6
                         }],
                        tooltip: {
                            outside: true,
                            backgroundColor:'#2d2d2d',
                            borderColor: '#707070',
                            style: {
                                color: '#fff'
                            },
                            formatter: function(){ 
                                return `<div class='text-center'><span align='center'>${this.series.name}
                                <br/><br/> ${$("#filter_revenue_profit option:selected").text()}: ${convert(this.y)}
                                `
                            }
            
                        },
                     });

                     Highcharts.chart('by_health_system_market_level_scatter', {
                        chart: {
                            type: 'scatter',
                            zoomType: 'xy'
                        },
                        legend: {
                            reversed: false
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() + ` range across scenarios by health system`,
                            align: 'center'
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 8
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
                            name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[1][0],
                            data:  [[1,Number(scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[1][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                           
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[2][0],
                            data:  [[2,Number(scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[2][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },                                                 
                        {                            
                            name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[3][0],
                            data:  [[3,Number(scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[3][2])]],
                            marker: {
                                symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[4][0],
                            data:  [[4,Number(scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[4][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                           
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[5][0],
                            data:  [[5,Number(scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[5][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },                                                 
                       // {                            
                            //name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[6][0],
                            //data:  [[6,Number(scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[6][2])]],
                            //marker: {
                              //  symbol: 'circle'
                            //}
                       // }
                       {
                        type: "errorbar",
                        name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[1][0] + " error",
                        data: [[1,Math.max.apply(null,final_health_system1.slice(1,10)),Math.min.apply(null,final_health_system1.slice(1,10))]],
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                             }
                        }
                    },
                    {
                        type: "errorbar",
                        name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[2][0] + " error",
                        data: [[2,Math.max.apply(null,final_health_system2.slice(1,10)),Math.min.apply(null,final_health_system2.slice(1,10))]],
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                             }
                        }
                    },
                    {
                        type: "errorbar",
                        name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[3][0] + " error",
                        data: [[3,Math.max.apply(null,final_health_system3.slice(1,10)),Math.min.apply(null,final_health_system3.slice(1,10))]],
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                             }
                        }
                    },
                    {
                        type: "errorbar",
                        name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[4][0] + " error",
                        data: [[4,Math.max.apply(null,final_health_system4.slice(1,10)),Math.min.apply(null,final_health_system4.slice(1,10))]],
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                             }
                        }
                    },
                    {
                        type: "errorbar",
                        name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[5][0] + " error",
                        data: [[5,Math.max.apply(null,final_health_system5.slice(1,10)),Math.min.apply(null,final_health_system5.slice(1,10))]],
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                             }
                        }
                    },
                    /*{
                        type: "errorbar",
                        name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[6][0] + " error",
                        data: [[6,Math.max.apply(null,final_health_system6.slice(1,10)),Math.min.apply(null,final_health_system6.slice(1,10))]],
                        tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                    },*/
                    
                    ]
                    });


                     // By Site of care graph
                     const final_site_of_care1 =[];
                     const final_site_of_care2 =[];
                     const final_site_of_care3 =[];
                     const final_site_of_care4 =[];
                     const final_site_of_care5 =[];
                     const final_site_of_care6 =[];
                     const final_site_of_care7 =[];
                     const final_site_of_care8 =[];
                     const final_site_of_care9 =[];
                     const final_site_of_care10 =[];
                     const final_site_of_care11 =[];
                     const final_site_of_care12 =[];
                     const final_site_of_care13 =[];
                     const final_site_of_care14 =[];
                     const final_site_of_care15 =[];
                     const final_site_of_care16 =[];
                     const final_scat_site_of_care1 =[];
                     const final_scat_site_of_care2 =[];
                     const final_scat_site_of_care3 =[];
                     const final_scat_site_of_care4 =[];
                     const final_scat_site_of_care5 =[];
                     const final_scat_site_of_care6 =[];
                     const final_scat_site_of_care7 =[];
                     const final_scat_site_of_care8 =[];
                     const final_scat_site_of_care9 =[];
                     const final_scat_site_of_care10 =[];
                     const final_scat_site_of_care11 =[];
                     const final_scat_site_of_care12 =[];
                     const final_scat_site_of_care13 =[];
                     const final_scat_site_of_care14 =[];
                     const final_scat_site_of_care15 =[];
                     const final_scat_site_of_care16 =[];
                     
                     var soc_arr;
                 
 
                     let site_of_care1 = scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[1].filter(e => e);
                     site_of_care1.shift();
                     let site_of_care2 = scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[2].filter(e => e);
                     site_of_care2.shift();
                     let site_of_care3 = scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[3].filter(e => e);
                     site_of_care3.shift();
             
                     let site_of_care4 = scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[4].filter(e => e);
                     site_of_care4.shift();
                     let site_of_care5 = scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[5].filter(e => e);
                     site_of_care5.shift();
                     let site_of_care6 = scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[6].filter(e => e);
                     site_of_care6.shift();

                     let site_of_care7 = scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[7].filter(e => e);
                     site_of_care7.shift();
                     


                   
                     for(let i=0; i<site_of_care1.length; i++) {
                         final_site_of_care1.push(Number(site_of_care1[i]));
                         soc_arr = [(Number('1')),Number(site_of_care1[i])];
                         final_scat_site_of_care1.push(soc_arr);
                     }
                     for(let i=0; i<site_of_care2.length; i++) {
                         final_site_of_care2.push(Number(site_of_care2[i]));
                         soc_arr = [(Number('2')),Number(site_of_care2[i])];
                         final_scat_site_of_care2.push(soc_arr);
                     }
                     for(let i=0; i<site_of_care3.length; i++) {
                         final_site_of_care3.push(Number(site_of_care3[i]));
                         soc_arr = [(Number('3')),Number(site_of_care3[i])];
                         final_scat_site_of_care3.push(soc_arr);
                     }
                     for(let i=0; i<site_of_care4.length; i++) {
                         final_site_of_care4.push(Number(site_of_care4[i]));
                         soc_arr = [(Number('4')),Number(site_of_care4[i])];
                         final_scat_site_of_care4.push(soc_arr);
                     }
                     for(let i=0; i<site_of_care5.length; i++) {
                         final_site_of_care5.push(Number(site_of_care5[i]));
                         soc_arr = [(Number('5')),Number(site_of_care5[i])];
                         final_scat_site_of_care5.push(soc_arr);
                     }
                     for(let i=0; i<site_of_care6.length; i++) {
                         final_site_of_care6.push(Number(site_of_care6[i]));
                         soc_arr = [(Number('6')),Number(site_of_care6[i])];
                         final_scat_site_of_care6.push(soc_arr);
                     }
                     for(let i=0; i<site_of_care7.length; i++) {
                        final_site_of_care7.push(Number(site_of_care7[i]));
                        soc_arr = [(Number('7')),Number(site_of_care7[i])];
                         final_scat_site_of_care7.push(soc_arr);
                    }
                    
                     
                     Highcharts.chart('by_site_of_care_market_level', {
                        chart: {
                            type: 'bar',                            
                        },
                        
                        plotOptions: {
                            series: {
                                stacking: 'normal'
                            }
                        },
            
                         title: {
                             text: $("#filter_revenue_profit option:selected").text() + ` by scenario and by site of care`,
                             align: 'center'
                         },
                         xAxis: {
                             categories: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[0].slice(1,10).filter(e => e),
                             visible: true
                         },
                         yAxis: {
                            title: '',
                            visible: true
                        },
                         series: [{
                             name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[1][0],
                             data: final_site_of_care1
                         }, {
                             name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[2][0],
                             data: final_site_of_care2
                         }, {
                             name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[3][0],
                             data: final_site_of_care3
                         },
                         {
                             name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[4][0],
                             data: final_site_of_care4
                         },
                         {
                             name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[5][0],
                             data: final_site_of_care5
                         },
                         {
                             name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[6][0],
                             data: final_site_of_care6
                         },
                         {
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[7][0],
                            data: final_site_of_care7
                        }                      
                        ],
                        tooltip: {
                            outside: true,
                            backgroundColor:'#2d2d2d',
                            borderColor: '#707070',
                            style: {
                                color: '#fff'
                            },
                            formatter: function(){ 
                                return `<div class='text-center'><span align='center'>${this.series.name}
                                <br/><br/> ${$("#filter_revenue_profit option:selected").text()}: ${convert(this.y)}
                                `
                            }
            
                        },
                     });

                     Highcharts.chart('by_site_of_care_market_level_scatter', {
                        chart: {
                            type: 'scatter',
                            zoomType: 'xy'
                        },
                        legend: {
                            reversed: false
                        },
                        title: {
                            text: $("#filter_revenue_profit option:selected").text() + ` range across scenarios by site of care`,
                            align: 'center'
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 8
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
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[1][0],
                            data:  [[1,Number(scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[1][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                           
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[2][0],
                            data:  [[2,Number(scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[2][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },                                                 
                        {                            
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[3][0],
                            data:  [[3,Number(scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[3][2])]],
                            marker: {
                                symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },
                        {
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[4][0],
                            data:  [[4,Number(scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[4][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                           
                        }, {
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[5][0],
                            data:  [[5,Number(scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[5][2])]],
                            marker: {
                                symbol: 'circle',                                
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                        },                                                 
                        {                            
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[6][0],
                            data:  [[6,Number(scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[6][2])]],
                            marker: {
                              symbol: 'circle'
                            },
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                                 }
                            }
                       },
                       {
                        name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[7][0],
                        data:  [[7,Number(scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[7][2])]],
                            marker: {
                            symbol: 'circle',                                
                        },
                        tooltip: {
                            pointFormatter: function(){ 
                                return `<span style="font-weight: bold;"> ${this.series.name} ${$("#filter_revenue_profit option:selected").text()} in the standoff continues</span>: <b> ${convert(this.y)} </b> `
                             }
                        }   
                    },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[1][0] + " error",
                            data: [[1,Math.max.apply(null,final_site_of_care1.slice(1,10)),Math.min.apply(null,final_site_of_care1.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[2][0] + " error",
                            data: [[2,Math.max.apply(null,final_site_of_care2.slice(1,10)),Math.min.apply(null,final_site_of_care2.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[3][0] + " error",
                            data: [[3,Math.max.apply(null,final_site_of_care3.slice(1,10)),Math.min.apply(null,final_site_of_care3.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[4][0] + " error",
                            data: [[4,Math.max.apply(null,final_site_of_care4.slice(1,10)),Math.min.apply(null,final_site_of_care4.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[5][0] + " error",
                            data: [[5,Math.max.apply(null,final_site_of_care5.slice(1,10)),Math.min.apply(null,final_site_of_care5.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[6][0] + " error",
                            data: [[6,Math.max.apply(null,final_site_of_care6.slice(1,10)),Math.min.apply(null,final_site_of_care6.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                        {
                            type: "errorbar",
                            name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[7][0] + " error",
                            data: [[7,Math.max.apply(null,final_site_of_care7.slice(1,10)),Math.min.apply(null,final_site_of_care7.slice(1,10))]],
                            tooltip: {
                                pointFormatter: function(){ 
                                    return `<span style="font-weight: bold;"> ${$("#filter_revenue_profit option:selected").text()} range across scenarios: ${convert(this.low)} - ${convert(this.high)} </b> `
                                 }
                            }
                        },
                       
                    
                    
                ]
                });
                var scenarios = $(rev_shift_scenario_one).val().split(' ');
                var scenario1Title = $("#rev_shift_scenario_one option:selected").text();
                var scenario1=  Number(scenarios[1]);
                scenarios = $(rev_shift_scenario_two).val().split(' ');
                var scenario2=  Number(scenarios[1]);
                var scenario2Title = $("#rev_shift_scenario_two option:selected").text();
               
               
                // Bubble charts for comparison tab 
                     Highcharts.chart({
                        chart: {
                            renderTo: 'bubble_sof',
                            type: 'bubble',
                            plotBorderWidth: 1,
                            plotBorderColor: '#e7e7e8',
                            zoomType: 'xy'
                        },
                        title: {
                            text: `2025 shifts by source of funds`,
                            align: 'center'
                        },
                        xAxis: {
                            gridLineWidth: 1,
                            gridLineColor: '#e7e7e8',                            
                            lineColor: '#e7e7e8',
                            tickColor: '#e7e7e8',
                            startOnTick: true,
                            visible: true,  
                            title: {
                            text: scenario1Title,  
                            }                        
                        },
                        yAxis: {
                            startOnTick: true,
                            endOnTick: true,
                            visible: true,                         
                            title: {
                                text: scenario2Title,
                            },                                                       
                        },
                        tooltip: {
                            useHTML: true,
                            formatter: function(){
                            return `<div><span align='center'>${this.point.name} 
                            <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_one option:selected").text()}: ${convert(this.x)}
                            <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_two option:selected").text()}: ${convert(this.y)}                            
                            </span></div>`
                            },                           
                            followPointer: true
                        },
                        plotOptions: {
                            series: {
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.name}',
                                    style: {
                                        color: 'black',
                                        textOutline: 'none',
                                        fontWeight: 'normal'
                                    }
                                }
                            }
                        },
                        series: [{
                            showInLegend: false,
                            data: [
                                    { x: final_commercial_arr[scenario1], y: final_commercial_arr[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[1][0]},
                                    { x: final_consumer_arr[scenario1], y: final_consumer_arr[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[3][0]},
                                    { x: final_gov_arr[scenario1], y: final_gov_arr[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.Source_of_Funds.Source_of_Funds[2][0] }
                                  ]
                        }]
                     });

                     Highcharts.chart({
                        chart: {
                            renderTo: 'bubble_lob',
                            type: 'bubble',
                            plotBorderWidth: 1,
                            plotBorderColor: '#e7e7e8',
                            zoomType: 'xy'
                        },
                        title: {
                            text: `2025 Shifts by line of business`,
                            align: 'center'
                        },
                        xAxis: {
                            gridLineWidth: 1,
                            gridLineColor: '#e7e7e8',                            
                            lineColor: '#e7e7e8',
                            tickColor: '#e7e7e8',
                            startOnTick: true,
                            visible: true,  
                            title: {
                            text: scenario1Title,  
                           }   
                        },
                        yAxis: {
                            startOnTick: true,
                            endOnTick: true,
                            visible: true,                         
                            title: {
                                text: scenario2Title,
                            }, 
                        },
                        tooltip: {
                            useHTML: true,
                            formatter: function(){
                                return `<div><span align='center'>${this.point.name} 
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_one option:selected").text()}: ${convert(this.x)}
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_two option:selected").text()}: ${convert(this.y)}                            
                                </span></div>`},                           
                            followPointer: true
                        },
                        plotOptions: {
                            series: {
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.name}',
                                    style: {
                                        color: 'black',
                                        textOutline: 'none',
                                        fontWeight: 'normal'
                                    }
                                }
                            }
                        },
                        series: [{
                            showInLegend: false,
                            data: [
                                    { x: final_lob_commercial_arr[scenario1], y: final_lob_commercial_arr[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[1][0]},
                                    { x: final_Medicare_arr[scenario1], y: final_Medicare_arr[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[2][0]},
                                    { x: final_Medicaid_arr[scenario1], y: final_Medicaid_arr[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[3][0]},
                                    { x: final_Exchanges_arr[scenario1], y: final_Exchanges_arr[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[4][0]},
                                    { x: final_OOP_arr[scenario1], y: final_OOP_arr[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[5][0]},
                                    { x: final_Uninsured_arr[scenario1], y: final_Uninsured_arr[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.Line_of_Business.Line_of_Business[6][0]},
                                  ]
                        }]
                     });

                     //bubble chart for by payer
                     Highcharts.chart({
                        chart: {
                            renderTo: 'bubble_by_payer',
                            type: 'bubble',
                            plotBorderWidth: 1,
                            plotBorderColor: '#e7e7e8',
                            zoomType: 'xy'
                        },
                        title: {
                            text: `2025 shifts by payer`,
                            align: 'center'
                        },
                        xAxis: {
                            gridLineWidth: 1,
                            gridLineColor: '#e7e7e8',                            
                            lineColor: '#e7e7e8',
                            tickColor: '#e7e7e8',
                            startOnTick: true,
                            visible: true,  
                            title: {
                            text: scenario1Title,  
                           }   
                        },
                        yAxis: {
                            startOnTick: true,
                            endOnTick: true,
                            visible: true,                         
                            title: {
                                text: scenario2Title,
                            }, 
                        },
                        tooltip: {
                            useHTML: true,
                            formatter: function(){
                                return `<div><span align='center'>${this.point.name} 
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_one option:selected").text()}: ${convert(this.x)}
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_two option:selected").text()}: ${convert(this.y)}                            
                                </span></div>`
                            },                           
                            followPointer: true
                        },
                        plotOptions: {
                            series: {
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.name}',
                                    style: {
                                        color: 'black',
                                        textOutline: 'none',
                                        fontWeight: 'normal'
                                    }
                                }
                            }
                        },
                        series: [{
                            showInLegend: false,
                            data: [
                                    { x: final_payer_arr1[scenario1], y: final_payer_arr1[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[1][0]},
                                    { x: final_payer_arr2[scenario1], y: final_payer_arr2[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[2][0]},
                                    { x: final_payer_arr3[scenario1], y: final_payer_arr3[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[3][0]},
                                    { x: final_payer_arr4[scenario1], y: final_payer_arr4[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[4][0]},
                                    { x: final_payer_arr5[scenario1], y: final_payer_arr5[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[5][0]},
                                    //{ x: final_payer_arr6[scenario1], y: final_payer_arr6[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Payer.By_Payer[6][0]},
                                  ]
                        }]
                     });

                      //bubble chart for by health system
                      Highcharts.chart({
                        chart: {
                            renderTo: 'bubble_by_health_system',
                            type: 'bubble',
                            plotBorderWidth: 1,
                            plotBorderColor: '#e7e7e8',
                            zoomType: 'xy'
                        },
                        title: {
                            text: `2025 shifts by health system`,
                            align: 'center'
                        },
                        xAxis: {
                            gridLineWidth: 1,
                            gridLineColor: '#e7e7e8',                            
                            lineColor: '#e7e7e8',
                            tickColor: '#e7e7e8',
                            startOnTick: true,
                            visible: true,  
                            title: {
                            text: scenario1Title,  
                           }   
                        },
                        yAxis: {
                            startOnTick: true,
                            endOnTick: true,
                            visible: true,                         
                            title: {
                                text: scenario2Title,
                            }, 
                        },
                        tooltip: {
                            useHTML: true,
                            formatter: function(){
                                return `<div><span align='center'>${this.point.name} 
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_one option:selected").text()}: ${convert(this.x)}
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_two option:selected").text()}: ${convert(this.y)}                            
                                </span></div>`
                            },                           
                            followPointer: true
                        },
                        plotOptions: {
                            series: {
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.name}',
                                    style: {
                                        color: 'black',
                                        textOutline: 'none',
                                        fontWeight: 'normal'
                                    }
                                }
                            }
                        },
                        series: [{
                            showInLegend: false,
                            data: [
                                    { x: final_health_system1[scenario1], y: final_health_system1[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[1][0]},
                                    { x: final_health_system2[scenario1], y: final_health_system2[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[2][0]},
                                    { x: final_health_system3[scenario1], y: final_health_system3[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[3][0]},
                                    { x: final_health_system4[scenario1], y: final_health_system4[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[4][0]},
                                    { x: final_health_system5[scenario1], y: final_health_system5[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[5][0]},
                                    //{ x: final_health_system6[scenario1], y: final_health_system6[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Health_System.By_Health_System[6][0]},
                                  ]
                        }]
                     });


                     //bubble chart for by site of care
                     Highcharts.chart({
                        chart: {
                            renderTo: 'bubble_by_site_of_care',
                            type: 'bubble',
                            plotBorderWidth: 1,
                            plotBorderColor: '#e7e7e8',
                            zoomType: 'xy'
                        },
                        title: {
                            text: `2025 shifts by site of care`,
                            align: 'center'
                        },
                        xAxis: {
                            gridLineWidth: 1,
                            gridLineColor: '#e7e7e8',                            
                            lineColor: '#e7e7e8',
                            tickColor: '#e7e7e8',
                            startOnTick: true,
                            visible: true,  
                            title: {
                            text: scenario1Title,  
                           }   
                        },
                        yAxis: {
                            startOnTick: true,
                            endOnTick: true,
                            visible: true,                         
                            title: {
                                text: scenario2Title,
                            }, 
                        },
                        tooltip: {
                            useHTML: true,
                            formatter: function(){
                                return `<div><span align='center'>${this.point.name} 
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_one option:selected").text()}: ${convert(this.x)}
                                <br/>${$("#filter_revenue_profit option:selected").text()} in ${$("#rev_shift_scenario_two option:selected").text()}: ${convert(this.y)}                            
                                </span></div>`
                            },                           
                            followPointer: true
                        },
                        plotOptions: {
                            series: {
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.name}',
                                    style: {
                                        color: 'black',
                                        textOutline: 'none',
                                        fontWeight: 'normal'
                                    }
                                }
                            }
                        },
                        series: [{
                            showInLegend: false,
                            data: [
                                    { x: final_site_of_care1[scenario1], y: final_site_of_care1[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[1][0]},
                                    { x: final_site_of_care2[scenario1], y: final_site_of_care2[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[2][0]},
                                    { x: final_site_of_care3[scenario1], y: final_site_of_care3[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[3][0]},
                                    { x: final_site_of_care4[scenario1], y: final_site_of_care4[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[4][0]},
                                    { x: final_site_of_care5[scenario1], y: final_site_of_care5[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[5][0]},
                                    { x: final_site_of_care6[scenario1], y: final_site_of_care6[scenario2], z: 12,name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[6][0]},
                                    { x: final_site_of_care7[scenario1], y: final_site_of_care7[scenario2], z: 12, name: scenario_compare_json.scenarioComparisonMap.By_Site_Of_Care.By_Site_Of_Care[7][0]},
                                    
                                ]
                        }]
                     });
                    
            }
            } catch (err) {
                console.log(err);
            }
        }

        
    });

})();