'use strict';
(function() {
    $(document).ready(() => {

        const $select = $('.msa-metro');
        var protocol = window.location.protocol;
        var hostname = window.location.hostname;
        var port = 8080;
        var baseUrl = `${protocol}//${hostname}:${port}`;

        // get uid from local storage
        const uid =  JSON.parse(window.localStorage.getItem('uid'));

        // get msa from local storage
        const msaArr = JSON.parse(window.localStorage.getItem('msa'));

        // get state from local storage
        const state = JSON.parse(window.localStorage.getItem('state'));

        const state_msa = {"stateName":state, "msa":msaArr};
        const msaArrLen = msaArr.length;
        
        let opt = document.createElement('option');
                    opt.value = msaArr;
                    opt.innerHTML = msaArr;    
                    $select.append(opt);    

        $($select).sumoSelect();
        $('.a-selector-metro').sumoSelect();
         
        async function updateStateMsa() {
            try {
                let response = await fetch(`${baseUrl}/DRS/UpdateStateInformation/${uid}`,{
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(state_msa)
                });
                
                if(response.ok) {
                    document.querySelector('.ajax-loader').style.display = 'none';
                    $('.container-fluid').css('visibility', 'visible');
                    const current_summary_json = await response.json();
                    localStorage.setItem("cs",JSON.stringify(current_summary_json));
                    const current_State_Summary = JSON.parse(window.localStorage.getItem('cs'));
                    updateGraph(current_State_Summary);
                    
                }
            } catch (err) {
                console.log(err);
            }
        }

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
        
        if(localStorage.getItem('cs') === null) {
            // call only if current state data does not exist in localStorage
            updateStateMsa();
        } else {
            // else get the summary data from localStorage
            document.querySelector('.ajax-loader').style.display = 'none';
            $('.container-fluid').css('visibility', 'visible');
            const current_State_Summary = JSON.parse(window.localStorage.getItem('cs'));
            updateGraph(current_State_Summary);
            
        }

        function updateGraph(current_State_Summary)  {      
                let overall_count_1 = convert(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[0][1]);
                let overall_count_2 = convert(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[1][1]);
                let overall_count_3 = convert(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[2][1]);
                                      
                overall_count_1 = overall_count_1.replace(/\D/g, "");
                overall_count_1 = Number(overall_count_1/10);

                overall_count_2 = overall_count_2.replace(/\D/g, "");
                overall_count_2 = Number(overall_count_2/10);

                overall_count_3 = overall_count_3.replace(/\D/g, "");
                overall_count_3 = Number(overall_count_3/10);

                const total_overall_count = (overall_count_1 + overall_count_2 + overall_count_3).toFixed(2);

                const sourceOfFunds_Commercial = Number(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[0][2].slice(0,-1));
                const sourceOfFunds_Consumer = Number(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[1][2].slice(0,-1));
                const sourceOfFunds_Gov = Number(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[2][2].slice(0,-1));

                const Line_of_Business_Commercial = Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[0][2].slice(0,-1));
                const Line_of_Business_Medicare = Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[1][2].slice(0,-1));
                const Line_of_Business_Medicaid = Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[2][2].slice(0,-1));
                const Line_of_Business_Exchanges = Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[3][2].slice(0,-1));
                const Line_of_Business_Oop = Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[4][2].slice(0,-1));
                const Line_of_Business_Uninsured = Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[5][2].slice(0,-1));
                
                const Payor_Statutory_1 =  Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[0][2].slice(0,-1));
                const Payor_Statutory_2 =  Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[1][2].slice(0,-1));
                const Payor_Statutory_3 =  Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[2][2].slice(0,-1));
                const Payor_Statutory_4 =  Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[3][2].slice(0,-1));
                const Payor_Statutory_5 =  Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[4][2].slice(0,-1));
                const Payor_Statutory_6 =  Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[5][2].slice(0,-1));

                const By_Provider_1 =  Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[0][2].slice(0,-1));
                const By_Provider_2 =  Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[1][2].slice(0,-1));
                const By_Provider_3 =  Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[2][2].slice(0,-1));
                const By_Provider_4 =  Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[3][2].slice(0,-1));
                const By_Provider_5 =  Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[4][2].slice(0,-1));
                const By_Provider_6 =  Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[5][2].slice(0,-1));

                const Site_of_Care_1 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[1][4].slice(0,-1));
                const Site_of_Care_2 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[2][4].slice(0,-1));
                const Site_of_Care_3 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[3][4].slice(0,-1));
                const Site_of_Care_4 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[4][4].slice(0,-1));
                const Site_of_Care_5 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[5][4].slice(0,-1));
                const Site_of_Care_6 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[6][4].slice(0,-1));
                const Site_of_Care_7 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[7][4].slice(0,-1));
                const Site_of_Care_8 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[8][4].slice(0,-1));
                const Site_of_Care_9 =  Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[9][4].slice(0,-1));
                const Site_of_Care_10 = Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[10][4].slice(0,-1));
                const Site_of_Care_11 = Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[11][4].slice(0,-1));
                const Site_of_Care_12 = Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[12][4].slice(0,-1));
                const Site_of_Care_13 = Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[13][4].slice(0,-1));
                const Site_of_Care_14 = Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[14][4].slice(0,-1));
                const Site_of_Care_15 = Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[15][4].slice(0,-1));
                const Site_of_Care_16 = Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[16][4].slice(0,-1));
                
                // Get Overall healthcare spend in the market
                $('.overall-total')
                    .html(`<img src='./assets/Overall-Spend.svg' /> <br/> <div style="text-align: center;"> Overall healthcare spend in the market <br/><b>$ ${ total_overall_count} B</div></b>`);

                // Global chart options
                Highcharts.setOptions({
                    chart: {
                        backgroundColor: 'RGB(242,242,242)', 
                        type: 'column',
                        height: 600,
                        style: {
                            fontFamily: 'PwC Helvetica Neue'
                        }
                    },
                    title:{
                        text:''
                    },
                    xAxis: {
                        visible: false
                    },
                    yAxis: {
                        visible: false
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        reversed: true
                    },
                    plotOptions: {
                        column: {
                            pointPadding: 0,
                            groupPadding: 0,
                            stacking: 'percent'
                        },
                        series: {
                    

                        } 
                    }
                });
                
                // By sourceOfFunds chart
                Highcharts.chart('Source_of_Funds', {
            
                    colors:['#D93954'],
                    series: [{
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[0][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[0][1]), pctVal: current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[0][2]}],
                        
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[1][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[1][1]), pctVal: current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[1][2]}],
                        
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[2][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[2][1]), pctVal: current_State_Summary.sourceOfFunds.Source_of_Funds.Source_of_Funds[2][2]}],
                       
                    }],
                    plotOptions: {
                        series: {
                            pointwidth: 650,
                            dataLabels: {
                                enabled: true,
                                formatter: function(){ 
                                    return this.point.pctVal> 0.1 ? `<div class='text-center'><span align='center'>${this.series.name}: ${convert(this.y)}</span></div>`:null
                                },
                                useHTML: true,                                                                      
                            }
                        }
                    },
                    tooltip: {
                        outside: true,
                        backgroundColor:'#2d2d2d',
                        borderColor: '#707070',
                        style: {
                            color: '#fff'
                        },
                        formatter: function(){ 
                            return `<div class='text-center'><span align='center'>Source of Fund: ${this.series.name}
                            <br/><br/>Spending: ${convert(this.y)}
                            <br/> Percentage of Total: ${Math.round(this.point.pctVal*100)}%</span></div>`
                        }
        
                    },
        
                });
                
                // By Line_of_Business chart
                Highcharts.chart('Line_of_Business', {
                    
                    colors:['#707070'],
                    series: [{
                        showInLegend: false,
                         name: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[0][0],
                        data: [{y:Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[0][1]), pctVal: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[0][2]}],
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[1][0],
                        data: [{y:Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[1][1]), pctVal: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[1][2]}],
                       
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[2][0],
                        data: [{y:Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[2][1]), pctVal: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[2][2]}],
                       
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[3][0],
                        data: [{y:Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[3][1]), pctVal: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[3][2]}],
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[4][0],
                        data: [{y:Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[4][1]), pctVal: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[4][2]}],
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[5][0],
                        data: [{y:Number(current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[5][1]), pctVal: current_State_Summary.sourceOfFunds.Line_of_Business.Line_of_Business[5][2]}],
                       
                    }],
                    plotOptions: {
                        series: {
                            dataLabels: {
                                enabled: true,
                                formatter: function(){ 
                                    return this.point.pctVal > 0.10 ? `<div class='text-center'><span align='center'>${this.series.name } : ${convert(this.y)}
                                    </span></div>`:null
                                },
                                useHTML: true, 
                                align: 'center'
                                                                              
                            }
                        }
                    },
                    tooltip: {
                        outside: true,
                        backgroundColor:'#2d2d2d',
                        borderColor: '#707070',
                        style: {
                            color: '#fff'
                        },
                        formatter: function(){ 
                           return `<div class='text-center'><span align='center'>Line of Business: ${this.series.name}
                           <br></br>Revenue: ${convert(this.y)}
                           <br/>Percentage of Total: ${Math.round(this.point.pctVal*100)}%</span></div>`
                        }
        
                    },
                });
   
                
                // By Payor_Statutory_Revenue chart
                Highcharts.chart('Payor_Statutory', {
                    chart: {
                        height: 600 // 16:9 ratio
                    },
                    colors:['#D93954'],
                    series: [{
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[1][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[1][1]),
                                    pctVal: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[1][2]),
                                    medCost: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[1][4]),
                                    adminCost: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[1][5])
                        }]
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[2][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[2][1]),
                                    pctVal: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[2][2],
                                    medCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[2][4],
                                    adminCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[2][5]
                        }
                    ]
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[3][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[3][1]),
                                    pctVal: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[3][2],
                                    medCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[3][4],
                                    adminCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[3][5]
                        }]
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[4][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[4][1]), 
                                    pctVal: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[4][2],
                                    medCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[4][4],
                                    adminCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[4][5]
                        }]
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[5][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[5][1]),
                                    pctVal: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[5][2],
                                    medCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[5][4],
                                    adminCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[5][5]
                        }]
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[6][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[6][1]), 
                                    pctVal: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Revenue[6][2],
                                    medCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[6][4],
                                    adminCost: current_State_Summary.sourceOfFunds.Payor_Statutory.Payor_Statutory_Cost[6][5]
                        }]
                    }
                
                    ],
                    plotOptions: {
                        series: {
                            dataLabels: {
                                enabled: true,
                                formatter: function(){ 
                                    return this.point.pctVal>0.05 ? `<div class='text-center'><span align='center'>${this.series.name} : ${convert(this.y)}
                                    </span></div>` :null
                                },
                                useHTML: true, 
                                align: 'center'
                                                                              
                            }
                        }
                    },
                    tooltip: {
                        useHTML: true,
                        outside: true,
                        backgroundColor:'#2d2d2d',
                        borderColor: '#707070',
                        style: {
                            color: '#fff'
                        },
                        formatter: function(){
                           if (this.series.name !="Others"){  
                           return `<div class='text-center'><div align='center'>Payer: ${this.series.name}</br>Revenue: ${convert(this.y)}<br><br>
                           <div style="width:${Math.round(this.point.medCost*100)}px;height:20px; background-color: rgb(242,242,242); display: inline-block"></div><div style="width:${Math.round(this.point.adminCost*100)}px;height:20px; background-color: rgb(0,242,242); display: inline-block"></div><div style="width:${100-Math.round(this.point.adminCost*100)-Math.round(this.point.medCost*100)}px; height:20px; background-color: rgb(0,242,0); display: inline-block"></div>
                           <br><div>MLR: ${Math.round(this.point.medCost*100)}%</div>
                           <div>ALR: ${Math.round(this.point.adminCost*100)}%</div>  
                           <div>Profit: ${100-Math.round(this.point.adminCost*100)-Math.round(this.point.medCost*100)}%</div>                         
                           <br>Percentage of Total: ${Math.round(this.point.pctVal*100)}%</div></div>`
                           } else {
                           return `<div class='text-center'><div align='center'>Payer: ${this.series.name}</br>Revenue: ${convert(this.y)}
                           <br>Percentage of Total: ${Math.round(this.point.pctVal*100)}%</div></div>`
                           }
                            
                        }
                        
        
                    },
                });
        
                // By provider chart
                Highcharts.chart('By_Provider', {
                    chart: {
                        height: 600 // 16:9 ratio
                    },
                   colors:['#707070'],
                    series: [{
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[1][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[1][1]),
                             pctVal: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[1][2],
                             opCost: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[1][3],
                             profit: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[1][4]
                        }]
                 
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[2][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[2][1]),
                                pctVal: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[2][2],
                                opCost: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[2][3],
                                profit: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[2][4]
                        }]
             
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[3][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[3][1]),
                                pctVal: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[3][2],
                                opCost: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[3][3],
                                profit: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[3][4]
                        }]

             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[4][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[4][1]),
                                pctVal: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[4][2],
                                opCost: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[4][3],
                                profit: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[4][4]
                        }]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[5][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[5][1]),
                                pctVal: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[5][2],
                                opCost: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[5][3],
                                profit: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[5][4]
                        }]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[6][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[6][1]),
                                pctVal: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Revenue[6][2],
                                opCost: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[6][3],
                                profit: current_State_Summary.sourceOfFunds.By_Provider.By_Provider_Cost[6][4]
                        }]
             
                    },
                
                
                    ],
                    plotOptions: {
                        series: {
                            dataLabels: {
                                enabled: true,
                                formatter: function(){ 
                                    return this.point.pctVal>0.05 ? `<div class='text-center'><span align='center'>${this.series.name} : ${convert(this.y)}</span></div>`:null
                                },
                                useHTML: true, 
                                align: 'center'
                                                                              
                            }
                        }
                    },
                    tooltip: {
                        useHTML: true,
                        outside: true,
                        backgroundColor:'#2d2d2d',
                        borderColor: '#707070',
                        style: {
                            color: '#fff'
                        },
                        formatter: function(){ 
                        if (this.series.name !="Others"){  
                           return `<div class='text-center'><span align='center'> Health System: ${this.series.name} </br>
                           Revenue: ${convert(this.y)}<br><br>
                           <div style="width:${Math.round(this.point.opCost*100)}px;height:20px; background-color: rgb(242,242,242); display: inline-block"></div><div style="width:${Math.round(this.point.profit*100)}px;height:20px; background-color: rgb(0,242,0); display: inline-block"></div>                   
                           <br><div>Costs%: ${Math.round(this.point.opCost*100)}%</div>
                           <div>Profit: ${Math.round(this.point.profit*100)}%</div>  
                           <br>Percentage of Total: ${Math.round(this.point.pctVal*100)}%</span></div>`
                        }else{
                            return `<div class='text-center'><span align='center'> Health System: ${this.series.name} </br>
                           Revenue: ${convert(this.y)}<br>
                           Percentage of Total: ${Math.round(this.point.pctVal*100)}%</span></div>`
                        }
                        }
                        
        
                    },
                });
        
                //By Site of care chart
                Highcharts.chart('Site_of_Care', {
                    chart: {
                    backgroundColor: 'RGB(242,242,242)',    
                    height: 600 // 16:9 ratio
                      },
                    colors:['#D93954'],
                    series: [{
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[1][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[1][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[1][4]}]
             
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[2][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[2][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[2][4]}]
             
                    }, {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[3][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[3][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[3][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[4][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[4][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[4][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[5][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[5][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[5][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[6][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[6][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[6][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[7][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[7][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[7][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[8][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[8][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[8][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[9][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[9][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[9][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[10][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[10][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[10][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[11][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[11][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[11][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[12][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[12][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[12][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[13][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[13][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[13][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[14][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[14][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[14][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[15][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[15][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[15][4]}]
             
                    },
                    {
                        showInLegend: false,
                        name: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[16][0],
                        data: [{y: Number(current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[16][1]), pctVal: current_State_Summary.sourceOfFunds.Site_of_Care.Site_of_Care[16][4]}]
                           
                    }
                ],
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function(){ 
                                return this.point.pctVal> 0.05 ? '<div style="text-align: center;"><span align="center"> '+ this.series.name + ': '+ convert(this.y)+'</span></div>':null
                            },
                            useHTML: true, 
                            align: 'center'
                                                                          
                        }
                    }
                },
                tooltip: {
                    outside: true,
                    backgroundColor:'#2d2d2d',
                    borderColor: '#707070',
                    style: {
                        color: '#fff'
                    },
                    formatter: function(){ 
                       return '<div style="text-align: center;"><span align="center"> Site of Care: '+ this.series.name + '<br></br>Revenue: '+ convert(this.y)+ '<br/>Percentage of Total: '+ Math.round(this.point.pctVal*100)+'%</span></div>'
                    }
        
                },
                });
            }
    // DOM ready end
    });
    
}) (); // IIFE end
