'use strict';
(function() {
    $(document).ready(() => {
       
        var protocol = window.location.protocol;
        var hostname = window.location.hostname;
        var port = 8080;
        var baseUrl = `${protocol}//${hostname}:${port}`;

        // get msa from local storage
        const msaArr = JSON.parse(window.localStorage.getItem('msa'));

        // get state from local storage
        const state = JSON.parse(window.localStorage.getItem('state'));

         // get uid from local storage
        const uid =  JSON.parse(window.localStorage.getItem('uid'));

        const state_msa = {"stateName":state, "msa":msaArr, "type": "payer"};
        
        const $select = $('.msa-metro');
        // get msa from local storage
        const msaArrLen = msaArr.length;

        let opt = document.createElement('option');
        opt.value = msaArr;
        opt.innerHTML = msaArr;    
        $select.append(opt); 

        $($select).sumoSelect();
        $(payMetric).sumoSelect();
        $(payScenario).sumoSelect();
        $(payLoB).sumoSelect();
        
        
        var chart;
        var stratCost,stratTarget;
        
        
        $(".getImpact").click(function() {
            $(Strategic_Cost).val(null);
            $(Strategic_Target).val(null); 
            document.querySelector('.ajax-loader').style.display = 'block';
            $('.container-fluid').css('visibility', 'hidden');  
            fetchPayerScenario($(paySelect).val(),$(payLoB).val(),$(payMetric).val(),$(payScenario).val());
        });
       
       // fetch all msa for each state selected
       fetchClient(state_msa);
       
       
       async function fetchClient(state_msa) {
            
        try {
          const url = `${baseUrl}/DRS/clientSelection/`;
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

        async function fetchPayerScenario(client, LoB, metric, scenario) {
            try {
            let response = await fetch(`${baseUrl}/DRS/scenarioPayer/${uid}` ,{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"client": client, "LoB": LoB, "metric": metric, "scenario": scenario})  
            });
            
            if(response.ok) {
                document.querySelector('.ajax-loader').style.display = 'none';
                $('.container-fluid').css('visibility', 'visible');
                const payer_summary_Json = await response.json();   
               
                

            chart = Highcharts.chart('Payer_Scenario', {
                
                chart: {
                    backgroundColor: 'RGB(242,242,242)', 
                    type: 'waterfall',
                    height: 600,
                    style: {
                        fontFamily: 'PwC Helvetica Neue'
                    }
                },
                   
                legend: {
                    enabled: false
                },                
                title:{
                    text:'Projection for Selected Scenario'
                },
                xAxis: {
                    visible: true,
                    type: 'category'
                },
                
                yAxis: {
                    visible: true,
                    labels: {
                        enabled: false
                    },
                    title: {
                        enabled: false
                    }
                                     
                },
                credits: {
                    enabled: false
                },         
                series: [{
                    animation: false,
                    upColor: Highcharts.getOptions().colors[2],
                    color: Highcharts.getOptions().colors[3],
                    data:[
                    {

                        name: String(payer_summary_Json.firmScenario.Scenario_Payer[0][0]),
                        y: Number(payer_summary_Json.firmScenario.Scenario_Payer[0][2]),
                        color: Highcharts.getOptions().colors[1]
                    },
                    {
                        name: String(payer_summary_Json.firmScenario.Scenario_Payer[1][0]),
                        y: Number(payer_summary_Json.firmScenario.Scenario_Payer[1][2])
                    },
                    {
                        name: String(payer_summary_Json.firmScenario.Scenario_Payer[2][0]),
                        y: Number(payer_summary_Json.firmScenario.Scenario_Payer[2][2])
                    },
                    {

                        name: String(payer_summary_Json.firmScenario.Scenario_Payer[3][0]),
                        y: Number(payer_summary_Json.firmScenario.Scenario_Payer[3][2])
                    },
                    {
                        name: String(payer_summary_Json.firmScenario.Scenario_Payer[4][0]),
                        y: Number(payer_summary_Json.firmScenario.Scenario_Payer[4][2])
                    },
                    {
                        name: String(payer_summary_Json.firmScenario.Scenario_Payer[5][0]),
                        y: Number(payer_summary_Json.firmScenario.Scenario_Payer[5][2])
                    },
                    {
                        name: String(payer_summary_Json.firmScenario.Scenario_Payer[6][0]),
                        y: Number(payer_summary_Json.firmScenario.Scenario_Payer[6][2]),
                        color: Highcharts.getOptions().colors[1],
                        isIntermediateSum: true
                    },
                    {
                        name: "Cost reduction target",
                        y: 0,
                        
                    },
                    {
                        name: "Growth target",
                        y: 0,
                        
                    },
                    {
                        name: "Target",
                        y: 0,
                        color: Highcharts.getOptions().colors[1],
                        isSum: true
                    }] 
                }],
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function(){ 
                                if($(payMetric).val()=="Profit Margin"){
                                    return `<div class='text-center'><span align='center'> ${(this.y*100).toFixed(2)} %</span></div>`
                                } else{
                                return `<div class='text-center'><span align='center'> ${convert(this.y)}</span></div>`
                                }
                            },
                            useHTML: true,                                                                      
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
                            if($(payMetric).val()=="Profit Margin"){
                                return `<div class='text-center'><span align='center'> Profit Margin: ${(this.y*100).toFixed(2)} %</span></div>`
                            } else{
                            return `<div class='text-center'><span align='center'> ${$(payMetric).val()}: ${convert(this.y)}</span></div>`
                            } 
                    }
                    
    
                },

            });
            
        
        var options;
        
        const curVal = Number(payer_summary_Json.firmScenario.Scenario_Payer[6][2]);
            $(Strategic_Cost).on('change', function(e) {
                stratCost = Number($(Strategic_Cost).val());
                stratTarget = Number($(Strategic_Target).val());
               
                chart.series[0].data[7].update({y:stratCost});
                chart.series[0].data[8].update({y:stratTarget-stratCost-curVal});
           });

           $(Strategic_Target).on('change', function(e) {
                stratCost = Number($(Strategic_Cost).val());
                stratTarget = Number($(Strategic_Target).val());
                
                chart.series[0].data[7].update({y:stratCost});
                chart.series[0].data[8].update({y:stratTarget-stratCost-curVal});  
           });
        }    
            } catch(e) {
              console.log(e);
            }
        }

        function convert(number) {
            let formattedNumber = Number(number.toFixed(0));
            
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
    // DOM ready end
    });
    
}) (); // IIFE end

