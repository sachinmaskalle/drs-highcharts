'use strict';
(function() {
    $(document).ready(() => {

        localStorage.clear();
        var requestBody,uid;
        var protocol = window.location.protocol;
        var hostname = window.location.hostname;
        var port = 8080;
        var baseUrl = `${protocol}//${hostname}:${port}`;
        
        let states = $('.states'); 
        let msa = $('.msa');
        
        $(states).sumoSelect();
        $(msa).addClass('msa-pre');
        
        $(states).on('change', function(e) {
             requestBody = $(this).val();
        });

        $(".get-msa").click(function() {
            if(requestBody) {
                fetchMsa({ requestBody });
            } else {
                alert('Please select a state');
            }
            $(msa).removeClass('msa-pre');
            $(msa).prop('disabled', false);
            
        });

        // fetch all msa for each state selected 
        async function fetchMsa(query) {
            
            try {
              const url = `${baseUrl}/DRS/stateSelection`;
              console.log(url);
              let response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(query) 
              });

            if(response.ok) {

                var optionList = [];
                const msa_Json = await response.json();
                
                $.each(msa_Json[0].msa, function(key, value) {

                    optionList.push(`<option value=${value}>${value}</option>`);
                });
                msa.addClass('msa-pre').html(optionList.join(''));
            }
            
            } catch(e) {
              console.log(e);
            }
        }
        

        $(".continue").click((event) => {

            event.preventDefault();
            
            let selected_state = $('.states').find(":selected").val();
            let selected_msa = $('.msa').find(":selected").text();

            if (JSON.parse(window.localStorage.getItem('uid'))== null) {
                const uid = selected_state + selected_msa +  Date.now();
                window.localStorage.setItem("uid",JSON.stringify(uid));
            }
            
            if(selected_state && selected_msa) {
                // add msa to local storage
                localStorage.setItem("state",JSON.stringify(selected_state));
                localStorage.setItem("msa",JSON.stringify(selected_msa));
            }

            if ( $('.states option:selected').prop('disabled') == true ||
            $('.msa option:selected').prop('disabled') == undefined) {
                 alert("Please select State and MSA");
             } else {
                let href = event.currentTarget.getAttribute('href');
                window.location= href;
            }
        });

        async function downLoadExcelData() {
            try {
                const url = `${baseUrl}/DRS/fetchFileContent/${uid}`;

                let response = await fetch(url);

                if(response.ok) {
                    const downloaded_json = await response;
                    console.log(downloaded_json);
                }
            } catch (err) {
                console.log(err)
            }
        }
        
        $("#btnSubmit").click(function (event) {
            // prevent default behaviour of form submission
            event.preventDefault();

            // get the selected state and MSA from dropdown
            let selected_state = $('.states').find(":selected").val();
            let selected_msa = $('.msa').find(":selected").text();

            // generate UID and store in local storage
             uid = selected_state + selected_msa +  Date.now();
            window.localStorage.setItem("uid",JSON.stringify(uid));

            // Get form
            var form = $('#fileUploadForm')[0];

            // Create an FormData object
            var data = new FormData(form);

            // disabled the submit button
            $("#btnSubmit").prop("disabled", true);
    
            $.ajax({
                type: "POST",
                url: `${baseUrl}/DRS/uploadMultipleFiles/${uid}`,
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                timeout: 600000,
                success: function (data) {
                    $(".upload-success").text(data);
                    console.log("SUCCESS : ", data);
                    $("#btnSubmit").prop("disabled", false);
                    
                },
                error: function (e) {
                    $(".upload-error").text(e.responseText);
                    console.log("ERROR : ", e);
                    $("#btnSubmit").prop("disabled", false);
                }
            });
        });
    });

})();
