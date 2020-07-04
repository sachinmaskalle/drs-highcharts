(function () {
    $(document).ready(function () {

        var protocol = window.location.protocol;
        var hostname = window.location.hostname;
        var port = 8080;
        var baseUrl = `${protocol}//${hostname}:${port}`;

        // get uid from local storage
        const uid =  JSON.parse(window.localStorage.getItem('uid'));
        
        //Updating scenario definition tab
        $('#saveScenario').click(function() {
            var formattedObj = {}; 
            $(".tab-content input").each(function(index,val) {
               // console.log(index); 
                formattedObj[index] = Number($(this).val())/100;   
            }); 
           // console.log(formattedObj);

        });

        //get scenario definition tab
        //futureScenarios();
        async function futureScenarios() {
            try {
                let finalArr = [];
                let response = await fetch(`${baseUrl}/DRS/getsScenarioDefinitionSummary/Scenario Definitions 2025/${uid}`);
                if(response.ok) {
                    $('.ajax-loader').css('display', 'none');
                    $('#saveScenario').css('visibility', 'visible');
                    
                }
                let scenarios_json = await response.json();

                scenarios_json.Scenario_Definition_Summary.shift();
                let filterdScenarioArray = scenarios_json.Scenario_Definition_Summary;
                
                for(let i=0; i<filterdScenarioArray.length; i++) {
                    filterdScenarioArray[i].shift();
                }
                
                for(let i=0; i<filterdScenarioArray.length; i++) {
                    finalArr.push(filterdScenarioArray[i].slice(0,3));
                }

                let changing_healthcare_needs = finalArr.slice(0,8);
                let shifting_decision_makers =  finalArr.slice(8,17);
                let evolving_payment_models =  finalArr.slice(17,20);
                let care_delivery_model =  finalArr.slice(20,29);
               
                $.each(changing_healthcare_needs,(index,val) => {
                            $('#changing_healthcare_needs').append(`<div class="a-slider-wrapper a-lg a-grey-bg a-my-20 m-auto">
                                <div class="a-slider-header">
                                    <div class="mr-auto a-label-wrapper">
                                        <label class="a-slider-label">${val[0]}</label>
                                    </div>

                                    <div class="a-label-wrapper">
                                        <input aria-label="low value of slider"
                                            class="a-text-input a-slider-input  a-input-lg range low" name="slider-val" size="7"
                                            type="text" value=${Number(val[1]*100)}>
                                        <span class="font-weight-normal a-px-10">to</span>
                                        <input aria-label="hight value of slider"
                                            class="a-text-input a-slider-input  a-input-lg range high" name="slider-val"
                                            size="7" type="text" value=${Number(val[2]*100)}>
                                    </div>
                                    </div>
                                    <div class="a-slider changing_healthcare_needs_${index}"></div>
                                </div>`);
                }); 

                $.each(shifting_decision_makers,(index,val) => {
                            $('#shifting_decision_makers').append(`<div class="a-slider-wrapper a-lg a-grey-bg a-my-20 m-auto">
                                <div class="a-slider-header">
                                    <div class="mr-auto a-label-wrapper">
                                        <label class="a-slider-label">${val[0]}</label>
                                    </div>

                                    <div class="a-label-wrapper">
                                        <input aria-label="low value of slider"
                                            class="a-text-input a-slider-input  a-input-lg range low" name="slider-val" size="7"
                                            type="text" value=${Number(val[1]*100)}>
                                        <span class="font-weight-normal a-px-10">to</span>
                                        <input aria-label="hight value of slider"
                                            class="a-text-input a-slider-input  a-input-lg range high" name="slider-val"
                                            size="7" type="text" value=${Number(val[2]*100)}>
                                    </div>
                                    </div>
                                    <div class="a-slider shifting_decision_makers_${index}"></div>
                                </div>`);
                        
                }); 
                $.each(evolving_payment_models,(index,val) => {
                    $('#evolving_payment_models').append(`<div class="a-slider-wrapper a-lg a-grey-bg a-my-20 m-auto">
                        <div class="a-slider-header">
                            <div class="mr-auto a-label-wrapper">
                                <label class="a-slider-label">${val[0]}</label>
                            </div>

                            <div class="a-label-wrapper">
                                <input aria-label="low value of slider"
                                    class="a-text-input a-slider-input  a-input-lg range low" name="slider-val" size="7"
                                    type="text" value=${Number(val[1]*100)}>
                                <span class="font-weight-normal a-px-10">to</span>
                                <input aria-label="hight value of slider"
                                    class="a-text-input a-slider-input  a-input-lg range high" name="slider-val"
                                    size="7" type="text" value=${Number(val[2]*100)}>
                            </div>
                            </div>
                            <div class="a-slider evolving_payment_models_${index}"></div>
                        </div>`);
                
                });
                $.each(care_delivery_model,(index,val) => {
                    $('#care_delivery_model').append(`<div class="a-slider-wrapper a-lg a-grey-bg a-my-20 m-auto">
                        <div class="a-slider-header">
                            <div class="mr-auto a-label-wrapper">
                                <label class="a-slider-label">${val[0]}</label>
                            </div>

                            <div class="a-label-wrapper">
                                <input aria-label="low value of slider"
                                    class="a-text-input a-slider-input a-input-lg range low" name="slider-val" size="7"
                                    type="text" value=${Number(val[1]*100)}>
                                <span class="font-weight-normal a-px-10">to</span>
                                <input aria-label="hight value of slider"
                                    class="a-text-input a-slider-input  a-input-lg range high" name="slider-val"
                                    size="7" type="text" value=${Number(val[2]*100)}>
                            </div>
                            </div>
                            <div class="a-slider care_delivery_model_${index}"></div>
                        </div>`);
                });  
                
            } catch (error) {
                
            }
        }

        

        $('#saveScenario').on('click',function() {

            let requestBodyObj = {}; 

            $(".tab-content input.high").each(function(index,val) {
                requestBodyObj[index] = Number($(this).val())/100;   
            }); 
            console.log(requestBodyObj);
            updateScenarioDefiniton(requestBodyObj);
        });

        async function updateScenarioDefiniton(updateObj) {

            try {
                const url = `${baseUrl}/DRS/Update/Scenario Definitions 2025/The standoff continues/${uid}`;
                console.log(url);
                let response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    "Content-Type": "application/json"
                },
                  body: JSON.stringify(updateObj) 
                });
  
              if(response.ok) {
                alert("Updated the scenario successfully.");
              }
              } catch(e) {
                console.log(e);
              }
        }

        $('.a-slider-input.range').on('change', e => {
            let target = $(e.target),
            num = target.val().replace(/,/g, ''),
            value = isNaN(num) ? 0 : num,
            siblingNum = target
            .siblings('.a-slider-input.range')
            .val()
            .replace(/,/g, ''),
            siblingValue = isNaN(siblingNum) ? 0 : siblingNum,
            index = target
            .parent()
            .find('.a-slider-input')
            .index(target),
            slider = target
            .closest('.a-slider-header')
            .siblings('.a-slider');
            if (
            (index === 0 && value - siblingValue > 0) ||
            (index === 1 && value - siblingValue < 0)
            ) {
            value = siblingValue;
            }
            slider.slider('values', index, value);
            });
            
            function formatNumber(num) {
            
            while (/(\d+)(\d{3})/.test(num.toString())) {
            num = num.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
            }
            
            return num;
            }

    }); // DOM ready
})(); // IIFE