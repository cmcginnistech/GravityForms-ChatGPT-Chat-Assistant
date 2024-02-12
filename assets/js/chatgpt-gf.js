jQuery(document).ready(function ($) {
	let conversation_history = '';
	let counter = 1;
	
    // Show ChatGPT Popup
    function showPopup() {
        $('.chatgpt-popup-container').css('display', 'block');
    }

    // Close ChatGPT Popup
    function closePopup() {
        $('.chatgpt-popup-container').css('display', 'none');
    }

    
    // Add the popup container to the DOM
    $('body').append(`
        <div class="chatgpt-popup-container">
		
		
		
            <div class="chatgpt-popup-content">
				<div class="chatgpt-popup-header">
					Writing Assitant
					<div class="chatgpt-close"><span class="chatgpt-popup-close">&times;</span></div>
				</div>
			<div class="chatgpt-popup-main">
					
					<h6 style="font-size: 14px;margin: 0;text-align:center;display:block;font-weight:600;">You can ask things like:</h6>
					<section class="intro animate-type">
						<h5 class="ah-headline" style="">
						<span class="ah-words-wrapper waiting">
						<b class="is-visible">Write an obituary for James Smith</b>
						<b>Write an order of service for a funeral program</b>
						<b>Write an acknowledgement for a funeral program</b>
						<b>Give me the poem titled "God's Garden"</b>
						</span>
						</h5>
					</section>
					<textarea id="chatgpt-answer" rows="20" col="10"></textarea>
					<form class="chatgpt-popup-form">
						<div class="chatgpt-input-wrapper">
							<input type="text" id="chatgpt-question" placeholder="Explain what you need help writing here, then click the send button →" />
							<button class="chatgpt-get-answer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg></button>
						</div>
					<button data-input="" data-field-type="" class="chatgpt-copy" style="" disabled>Copy To Form & Edit Manually</button>
					</form>
					<!--<button class="chatgpt-redefine" style="display:none;">Redefine Answer</button>-->
				</div>
			</div>
        </div>
    `);

    // Bind click event to open popup
    $('.chatgpt-popup-open').click(function (e) {
		$('#chatgpt-question').val('');
		
		
		var copy = $(this).attr("data-field-id");
		var richtext = $(this).attr("data-field-type");
		$('.chatgpt-copy').attr("data-input", copy);
		$('.chatgpt-copy').attr("data-field-type", richtext);
		
		//HIDE FIELDS AND RESET AGAIN
		//$('#chatgpt-answer').hide();
		//$('.chatgpt-copy').hide();
		$('.chatgpt-answer-label').hide();
		$('.chatgpt-answer-label').text("Answer: ");
		
		
        //var question = $(this).attr("data-field");
        //$('.gpt-question').text(question);
        e.preventDefault();
        showPopup();
    });

    // Bind click event to close popup
    $('.chatgpt-popup-close').click(function (e) {
        e.preventDefault();
        closePopup();
    });
	
	
	$('.chatgpt-popup-form').submit(function (e) {
		e.preventDefault();
		fetchAnswer(3);
		console.log(counter);
	});
	
	
	// Handle form submission
   function fetchAnswer(retries = 3) {
	   $('#chatgpt-answer').val('Retrieving Answer...');
		if (retries === 0) {
			$('#chatgpt-answer').val('The model could not generate an answer. Please try rephrasing the question or providing more context.');
			return;
		}
		console.log(retries);
        var question = $('#chatgpt-question').val();
        if (question) {
            conversation_history += question;
            $.ajax({
                url: chatgpt_ajax_object.ajax_url,
                type: 'POST',
                data: {
                    action: 'chatgpt_ajax',
                    question: conversation_history,
					counter: counter,
                },
                success: function (response) {
					console.log("Response: " + response);
					counter = counter + 1;
					//console.log(counter);
					
					
					if (response === '') {
						fetchAnswer(retries - 1);
						return;
					} else {
						conversation_history += response + '\n';
						//$('#chatgpt-answer').text("Question: " + question + "\n" + "<br> Answer: " + response);
					}
					if(retries === 0) {
						if (response.trim() === '') {
							response = 'The model could not generate an answer. Please try rephrasing the question or providing more context.';
						}
				}
					//conversation_history += response + '\n';
					//$('#chatgpt-answer').text(response);
					
					
					$('#chatgpt-question').val('');
					$('.chatgpt-copy').prop('disabled', false);
                    conversation_history += response + '\n';
                   // $('#chatgpt-answer').html("Question: " + question + "\n\n" + "Answer: " + response);
				   $('#chatgpt-answer').val(response.trim());
					//$('.chatgpt-answer-label').show();
					$('.chatgpt-redefine').show();
					$('#chatgpt-answer').show();
					$('.chatgpt-copy').show();
					//console.log("Getting Answer...");
                },
                error: function () {
                    $('#chatgpt-answer').text('Error occurred while fetching the answer. Please try again.');
                },
            });
        } else {
            $('#chatgpt-answer').text('Please enter a question.');
        }
    }
	
	$('.chatgpt-copy').click(function (e) {
		e.preventDefault();
		var formid = $(this).attr('data-input');
		var answer = $('#chatgpt-answer').val();
		var richtextfield = $(this).attr('data-field-type');
		var answerClean = answer.replace(/\n/g, "<br>");
		
		console.log("Rich Field: " + richtextfield);
		if(richtextfield == 1) {
		  $iframe = $("#"+formid+"_ifr"),
		  $iframeDoc = $iframe.contents(),
		  $iframeBody = $iframeDoc.find('body');
		  $iframeBody.append(answerClean);
		  
		  console.log("Copied Answer to Rich Field" + formid);
		}else{
			console.log("Copied Answer Text: " + formid);
		  $("#"+formid).val(answer);
		}
	
		closePopup();
	});
	
	
	 // Bind click event to redefine button
    $('.chatgpt-redefine').click(function (e) {
		e.preventDefault();
		//var question = "Redefine this please";
		 var question = $('#chatgpt-question').val();
		 var answer = $('#chatgpt-answer').text();
        if (question) {
            conversation_history = 'Reword this text and add to it:' + answer;
            $.ajax({
                url: chatgpt_ajax_object.ajax_url,
                type: 'POST',
                data: {
                    action: 'chatgpt_ajax',
                    question: conversation_history,
                },
                success: function (response) {
                    conversation_history = response + '\n';
                    $('#chatgpt-answer').html(response);
					//$('.chatgpt-answer-label').text("Refedined Answer:");
					$('.chatgpt-redefine').show();
					console.log("Getting Redefined Answer...");
                },
                error: function () {
                    $('#chatgpt-answer').text('Error occurred while fetching the answer. Please try again.');
                },
            });
        } else {
            $('#chatgpt-answer').text('Please enter a question.');
        }
	});
	
	
});


