'use strict';
(function() {
    $(document).ready(() => {

        var chart;
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

        const state_msa = {"stateName":state, "msa":msaArr, "type": "provider"};
        const $select = $('.msa-metro');

        // get msa from local storage
        const msaArrLen = msaArr.length;

        let opt = document.createElement('option');
        opt.value = msaArr;
        opt.innerHTML = msaArr;   
        $select.append(opt); 

        $($select).sumoSelect();
        $(provMetric).sumoSelect();
        $(provScenario).sumoSelect();
        
        $(".getImpact").click(function() {
            $(Strategic_Cost).val(null);
            $(Strategic_Target).val(null); 
            document.querySelector('.ajax-loader').style.display = 'block';
            $('.container-fluid').css('visibility', 'hidden');  
            fetchProviderScenario($(provSelect).val(),$(provMetric).val(),$(provScenario).val());
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
        
        async function fetchProviderScenario(client, metric, scenario) {
            try {
            let response = await fetch(`${baseUrl}/DRS/scenarioProvider/${uid}` ,{
                method: 'POST',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"client":client, "metric": metric, "scenario": scenario}) 
            });
            
            if(response.ok) {
                
                document.querySelector('.ajax-loader').style.display = 'none';
                $('.container-fluid').css('visibility', 'visible');
                const provider_summary_Json = await response.json();
                const curVal = Number(provider_summary_Json.firmScenario.Scenario_Provider[6][2]);

             chart = Highcharts.chart('Provider_Scenario', {
                chart: {
                    backgroundColor: 'RGB(242,242,242)', 
                    type: 'waterfall',
                    height: 600,
                    animation: false,
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
                        enabled: true
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

                        name: String(provider_summary_Json.firmScenario.Scenario_Provider[0][0]),
                        y: Number(provider_summary_Json.firmScenario.Scenario_Provider[0][2]),
                        color: Highcharts.getOptions().colors[1]
                    },
                    {
                        name: String(provider_summary_Json.firmScenario.Scenario_Provider[1][0]),
                        y: Number(provider_summary_Json.firmScenario.Scenario_Provider[1][2])
                    },
                    {
                        name: String(provider_summary_Json.firmScenario.Scenario_Provider[2][0]),
                        y: Number(provider_summary_Json.firmScenario.Scenario_Provider[2][2])
                    },
                    {

                        name: String(provider_summary_Json.firmScenario.Scenario_Provider[3][0]),
                        y: Number(provider_summary_Json.firmScenario.Scenario_Provider[3][2])
                    },
                    {
                        name: String(provider_summary_Json.firmScenario.Scenario_Provider[4][0]),
                        y: Number(provider_summary_Json.firmScenario.Scenario_Provider[4][2])
                    },
                    {
                        name: String(provider_summary_Json.firmScenario.Scenario_Provider[5][0]),
                        y: Number(provider_summary_Json.firmScenario.Scenario_Provider[5][2])
                    },
                    {
                        name: String(provider_summary_Json.firmScenario.Scenario_Provider[6][0]),
                        y: Number(provider_summary_Json.firmScenario.Scenario_Provider[6][2]),
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
                        isSum: true,
                        color: Highcharts.getOptions().colors[1],
                    }] 
                }],
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function(){ 
                                if($(provMetric).val()=="Profit Margin"){
                                    return '<div style="text-align: center;"><span align="center"> '+ (this.y*100).toFixed(1)+ '%</span></div>'
                                } else{
                                return '<div style="text-align: center;"><span align="center"> '+ convert((this.y))+ '</span></div>'
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
                            if($(provMetric).val()=="Profit Margin"){
                                return `<div class='text-center'><span align='center'> Profit Margin: ${(this.y*100).toFixed(2)} %</span></div>`
                            } else{
                            return `<div class='text-center'><span align='center'> ${$(provMetric).val()}: ${convert(this.y)}</span></div>`
                            } 
                    }
                    
    
                },
            });
            
        var stratCost,stratTarget;
        var options;
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
    // DOM ready end
    });
    
}) (); // IIFE end

